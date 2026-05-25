// 高级网址导航采编流水线 - 主入口
// 用法: npx tsx scripts/advanced-crawler/index.ts [--prod] [--seeds=path/to/seeds.json]

import pLimit from "p-limit";
import fs from "fs";
import path from "path";
import { crawlUrl, CrawlResult } from "./engine";
import { batchEvaluate, AiEvaluationResult } from "./ai-rewriter";

interface SeedEntry {
  url: string;
  suggestedCategory?: string; // 可选的推荐分类
  suggestedTags?: string[]; // 可选的推荐标签
}

interface PipelineOptions {
  seedsFile: string;
  concurrency: number;
  aiDelayMs: number;
  minDomainAgeDays: number; // 域名年龄下限（天）
  minQualityScore: number; // AI 质量评分下限
  output: string;
  skipAI: boolean; // 跳过 AI 评估（仅抓取）
}

const defaultOptions: PipelineOptions = {
  seedsFile: "scripts/advanced-crawler/seeds.json",
  concurrency: 5,
  aiDelayMs: 2000,
  minDomainAgeDays: 180, // 6 个月
  minQualityScore: 40,
  output: "prisma/seeds/resources-crawler-output.json",
  skipAI: false,
};

/**
 * 加载种子 URL 列表
 */
function loadSeeds(filePath: string): SeedEntry[] {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ 种子文件不存在: ${filePath}`);
    console.log(`\n📝 请创建种子文件，格式如下:`);
    console.log(JSON.stringify(
      [
        { url: "https://example.com", suggestedCategory: "tools" },
        { url: "https://another-site.com", suggestedTags: ["物流", "查询"] },
      ],
      null,
      2
    ));
    process.exit(1);
  }

  const raw = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const entries: SeedEntry[] = Array.isArray(raw) ? raw : raw.urls || raw;

  console.log(`🌱 加载 ${entries.length} 个种子 URL`);
  return entries;
}

/**
 * 质量过滤规则
 */
function passesQualityFilter(crawl: CrawlResult, minDomainAge: number): { pass: boolean; reason?: string } {
  // 1. HTTP 状态码检查
  if (crawl.statusCode >= 400) {
    return { pass: false, reason: `HTTP ${crawl.statusCode}` };
  }

  // 2. 标题检查（不能太短或为空）
  if (!crawl.title || crawl.title.length < 2) {
    return { pass: false, reason: "标题过短或缺失" };
  }

  // 3. 描述检查（不能太短）
  if (!crawl.description || crawl.description.length < 10) {
    return { pass: false, reason: "描述过短或缺失" };
  }

  // 4. 域名年龄检查
  if (crawl.domainAgeDays !== null && crawl.domainAgeDays < minDomainAge) {
    return { pass: false, reason: `域名太新 (${crawl.domainAgeDays}天 < ${minDomainAge}天)` };
  }

  // 5. 加载时间检查（超时视为质量差）
  if (crawl.loadTimeMs > 8000) {
    return { pass: false, reason: `加载过慢 (${crawl.loadTimeMs}ms)` };
  }

  return { pass: true };
}

/**
 * 主流水线
 */
async function runPipeline(options: PipelineOptions) {
  const startTime = Date.now();
  console.log("🚀 高级网址导航采编流水线启动\n");

  // Step 1: 加载种子
  const seeds = loadSeeds(options.seedsFile);

  // Step 2: 并发抓取
  console.log(`\n🕷️  开始抓取 (${options.concurrency} 并发)...\n`);
  const limit = pLimit(options.concurrency);

  const crawlTasks = seeds.map((seed, i) =>
    limit(async () => {
      console.log(`  [${i + 1}/${seeds.length}] 抓取: ${seed.url}`);
      const result = await crawlUrl(seed.url);

      // 质量过滤
      const quality = passesQualityFilter(result, options.minDomainAgeDays);
      if (!quality.pass) {
        console.log(`    ⏭️  过滤跳过: ${quality.reason}`);
        return null;
      }

      console.log(
        `    ✅ ${result.title} | ${result.domainAgeDays ? result.domainAgeDays + "天" : "年龄未知"} | ${result.loadTimeMs}ms`
      );
      return { crawl: result, suggestedCategory: seed.suggestedCategory, suggestedTags: seed.suggestedTags };
    })
  );

  const crawlResults = (await Promise.all(crawlTasks)).filter(
    Boolean
  ) as Array<{ crawl: CrawlResult; suggestedCategory?: string; suggestedTags?: string[] }>;

  console.log(`\n✅ 抓取完成: ${crawlResults.length}/${seeds.length} 通过质量过滤`);

  // Step 3: AI 评估与洗稿
  let aiResults: (AiEvaluationResult & { url: string })[] = [];

  if (!options.skipAI && crawlResults.length > 0) {
    console.log(`\n🧠 开始 AI 评估 (${crawlResults.length} 个站点)...\n`);

    const aiInputs = crawlResults.map(({ crawl }) => ({
      url: crawl.url,
      title: crawl.title,
      description: crawl.description,
      domainAgeDays: crawl.domainAgeDays,
    }));

    aiResults = await batchEvaluate(aiInputs, options.concurrency, options.aiDelayMs);
  } else if (options.skipAI) {
    console.log("\n⏭️  跳过 AI 评估 (--skipAI)");
    // 降级：为每个抓取结果生成基础评估
    aiResults = crawlResults.map(({ crawl }) => ({
      url: crawl.url,
      status: "ACCEPT" as const,
      rewrittenDescription: crawl.description?.slice(0, 50) || "海外实用网站",
      category: "tools",
      tags: ["海外工具"],
      qualityScore: 50,
    }));
  }

  // Step 4: 合并数据 & 输出
  console.log("\n📦 合并数据...\n");

  const accepted: Array<Record<string, any>> = [];
  const rejected: Array<{ url: string; reason?: string }> = [];

  for (const { crawl } of crawlResults) {
    const ai = aiResults.find((a) => a.url === crawl.url);

    if (!ai || ai.status === "REJECT") {
      rejected.push({
        url: crawl.url,
        reason: ai?.reason || "未知原因",
      });
      console.log(`  🚫 拒绝: ${crawl.title} - ${ai?.reason}`);
      continue;
    }

    if (ai.qualityScore !== undefined && ai.qualityScore < options.minQualityScore) {
      rejected.push({
        url: crawl.url,
        reason: `质量评分过低 (${ai.qualityScore})`,
      });
      console.log(`  🚫 拒绝: ${crawl.title} - 质量评分 ${ai.qualityScore}`);
      continue;
    }

    accepted.push({
      url: crawl.url,
      name: crawl.title,
      description: ai.rewrittenDescription || crawl.description?.slice(0, 50),
      category: ai.category || "tools",
      tags: ai.tags || [],
      favicon: crawl.favicon,
      domainAge: crawl.domainAgeDays,
      qualityScore: ai.qualityScore || 50,
      language: crawl.language,
      sourceType: "third-party",
    });

    console.log(
      `  ✅ ${crawl.title} | ${ai.category} | 评分: ${ai.qualityScore}`
    );
  }

  // 写入输出文件
  const outputDir = path.dirname(options.output);
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(options.output, JSON.stringify(accepted, null, 2), "utf-8");

  // 汇总报告
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log("\n" + "═".repeat(50));
  console.log("📊 流水线完成");
  console.log("═".repeat(50));
  console.log(`⏱️  耗时: ${elapsed}s`);
  console.log(`🌱 种子 URL: ${seeds.length}`);
  console.log(`🕷️  抓取成功: ${crawlResults.length}`);
  console.log(`✅ AI 通过: ${accepted.length}`);
  console.log(`🚫 拒绝: ${rejected.length}`);
  console.log(`📁 输出: ${options.output}`);

  if (rejected.length > 0) {
    console.log("\n📋 拒绝列表:");
    for (const r of rejected) {
      console.log(`  - ${r.url}: ${r.reason}`);
    }
  }

  console.log(`\n📝 下一步: npx tsx scripts/advanced-crawler/seed-to-db.ts [--prod]`);
}

// 解析命令行参数
function parseArgs(): PipelineOptions {
  const opts = { ...defaultOptions };

  for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i];
    if (arg === "--skipAI") opts.skipAI = true;
    else if (arg.startsWith("--seeds=")) opts.seedsFile = arg.split("=")[1];
    else if (arg.startsWith("--concurrency=")) opts.concurrency = parseInt(arg.split("=")[1]);
    else if (arg.startsWith("--output=")) opts.output = arg.split("=")[1];
    else if (arg.startsWith("--min-age=")) opts.minDomainAgeDays = parseInt(arg.split("=")[1]);
    else if (arg.startsWith("--min-score=")) opts.minQualityScore = parseInt(arg.split("=")[1]);
    else if (arg === "--help" || arg === "-h") {
      console.log(`
用法: npx tsx scripts/advanced-crawler/index.ts [选项]

选项:
  --seeds=<file>         种子 URL 文件路径 (默认: scripts/advanced-crawler/seeds.json)
  --concurrency=<n>      抓取并发数 (默认: 5)
  --min-age=<days>       域名年龄下限(天) (默认: 180)
  --min-score=<score>    AI 质量评分下限 (默认: 40)
  --output=<file>        输出文件路径 (默认: prisma/seeds/resources-crawler-output.json)
  --skipAI               跳过 AI 评估，仅抓取
  --help, -h             显示帮助
      `);
      process.exit(0);
    }
  }

  return opts;
}

const opts = parseArgs();
runPipeline(opts).catch((err) => {
  console.error("流水线异常:", err);
  process.exit(1);
});
