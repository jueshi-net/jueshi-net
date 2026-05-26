// 守护进程试运行 — 处理前 3 条 URL 验证流水线
// 用法: npx tsx scripts/advanced-crawler/daemon-test.ts

import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(__dirname, "../../.env") });

import { readFileSync, writeFileSync, appendFileSync } from "fs";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { crawlUrl, extractDomain } from "./engine";
import { evaluateWithAI } from "./ai-rewriter";

const PENDING_FILE = resolve(__dirname, "pending-urls.txt");
const PROCESSED_FILE = resolve(__dirname, "processed-urls.txt");
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

function log(level: string, msg: string) {
  const ts = new Date().toISOString();
  console.log(`[${ts}] [${level}] ${msg}`);
}

function randomSleep() {
  const ms = Math.floor(Math.random() * 5000) + 3000;
  return new Promise((r) => setTimeout(r, ms));
}

const CATEGORY_MAP: Record<string, string> = {
  life: "life", logistics: "logistics", business: "business",
  templates: "templates", education: "education", tools: "tools",
  海外生活: "life", 跨境物流: "logistics", 出海经营: "business",
  工具模板: "templates", 教育学习: "education", 实用工具: "tools",
  出海工具: "business", 电商工具: "business",
};

function normalizeCategory(raw: string | undefined): string {
  if (!raw) return "tools";
  return CATEGORY_MAP[raw.toLowerCase().trim()] || "tools";
}

async function alreadyInDb(url: string): Promise<boolean> {
  try {
    const n = url.replace(/\/+$/, "");
    const r = await prisma.resource.findFirst({ where: { url: n }, select: { id: true } });
    return !!r;
  } catch { return false; }
}

async function processUrl(url: string): Promise<boolean> {
  log("INFO", `📡 处理: ${url}`);

  const inDb = await alreadyInDb(url);
  if (inDb) {
    log("WARN", `⏭ 已存在于数据库，跳过`);
    return true;
  }

  // 节流
  await randomSleep();

  // 抓取
  let cr;
  try { cr = await crawlUrl(url, 12000); }
  catch (e: any) { log("ERROR", `✗ 抓取异常: ${e.message}`); return false; }

  if (cr.statusCode >= 400 || cr.error) {
    log("WARN", `✗ 抓取失败 (HTTP ${cr.statusCode})`);
    return false;
  }
  if (!cr.title && !cr.description) {
    log("WARN", `✗ 页面内容为空`);
    return false;
  }
  log("INFO", `✅ 抓取成功: ${cr.title || extractDomain(url)} (${cr.loadTimeMs}ms)`);

  // 节流
  await randomSleep();

  // AI 评估
  let ai;
  try {
    ai = await evaluateWithAI({
      url: cr.url,
      title: cr.title || extractDomain(url),
      description: cr.description || "",
      domainAgeDays: cr.domainAgeDays,
    });
  } catch (e: any) {
    log("ERROR", `✗ AI 异常: ${e.message}`);
    return false;
  }

  if (ai.status === "REJECT") {
    log("WARN", `🚫 AI 拒绝: ${ai.reason}`);
    return true; // 移动到 processed
  }

  const category = normalizeCategory(ai.category);
  const description = ai.rewrittenDescription || cr.description?.slice(0, 100) || "";
  log("SUCCESS", `🤖 AI 通过: [${category}] 评分:${ai.qualityScore} "${description}"`);

  // 入库
  try {
    const domain = extractDomain(url);
    const favicon = cr.favicon || `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

    await prisma.resource.upsert({
      where: { url: url.replace(/\/+$/, "") },
      update: {},
      create: {
        name: cr.title || domain,
        url: url.replace(/\/+$/, ""),
        description,
        category,
        tags: ai.tags || [],
        favicon,
        domainAge: cr.domainAgeDays,
        qualityScore: ai.qualityScore || 0,
        language: cr.language || "en",
        isActive: true, isAd: false, sourceType: "third-party",
        lastChecked: new Date(), checkFailCount: 0,
      },
    });
    log("SUCCESS", `💾 入库成功: ${cr.title || domain}`);
  } catch (e: any) {
    log("ERROR", `✗ 入库失败: ${e.message}`);
  }

  return true;
}

async function main() {
  console.log("═══════════════════════════════════════");
  console.log("🤖 守护进程试运行 — 处理前 3 条");
  console.log("═══════════════════════════════════════");

  const urls = readFileSync(PENDING_FILE, "utf-8")
    .split("\n").map(l => l.trim()).filter(Boolean);

  log("INFO", `待处理队列: ${urls.length} 条，试运行前 3 条`);

  let processedCount = 0;
  let successCount = 0;

  for (let i = 0; i < Math.min(3, urls.length); i++) {
    console.log(`\n─── 第 ${i + 1}/3 条 ───`);
    const url = urls[i];
    const ok = await processUrl(url);

    if (ok) {
      // 从 pending 移除，加入 processed
      const remaining = urls.filter((_, j) => j > i && !urls.slice(0, i).includes(urls[j]));
      const pendingUrls = urls.slice(i + 1);
      writeFileSync(PENDING_FILE, pendingUrls.join("\n") + (pendingUrls.length ? "\n" : ""));
      appendFileSync(PROCESSED_FILE, url + "\n");
      processedCount++;

      // 检查是否成功入库（非跳过、非拒绝）
      successCount++;
    }
    console.log("");
  }

  log("INFO", `试运行完成！处理 ${processedCount}/3 条`);
  console.log("═══════════════════════════════════════");

  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
