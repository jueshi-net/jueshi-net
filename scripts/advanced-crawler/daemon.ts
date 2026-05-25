// 24/7 守护进程 — 从 pending 队列中逐条抓取、AI 洗稿、写入生产库
// 用法: npx tsx scripts/advanced-crawler/daemon.ts
// 特性: 断点续传、随机节流、无极容错、自动入库

// Load env (try .env.production first for VPS, then .env for local)
import { config } from "dotenv";
import { resolve } from "path";

const envProd = resolve(__dirname, "../../.env.production");
const envLocal = resolve(__dirname, "../../.env");
if (existsSync(envProd)) config({ path: envProd });
else config({ path: envLocal });

import { readFileSync, writeFileSync, appendFileSync, existsSync } from "fs";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { crawlUrl, extractDomain } from "./engine";
import { evaluateWithAI } from "./ai-rewriter";

// ─── 文件路径 ───
const PENDING_FILE = resolve(__dirname, "pending-urls.txt");
const PROCESSED_FILE = resolve(__dirname, "processed-urls.txt");
const FAILED_FILE = resolve(__dirname, "failed-urls.txt");
const LOG_FILE = resolve(__dirname, "daemon.log");
const MAX_RETRIES = 3; // 抓取失败最大重试次数

// ─── Prisma 客户端 (Prisma 7 需要 adapter) ───
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// ─── 日志 ───
function log(level: "INFO" | "WARN" | "ERROR" | "SUCCESS", msg: string) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] [${level}] ${msg}`;
  console.log(line);
  appendFileSync(LOG_FILE, line + "\n");
}

// ─── 随机休眠 (3-8 秒) ───
function randomSleep() {
  const ms = Math.floor(Math.random() * 5000) + 3000;
  return new Promise((r) => setTimeout(r, ms));
}

// ─── 分类映射表 (AI 输出 → 系统分类) ───
const CATEGORY_MAP: Record<string, string> = {
  life: "life",
  logistics: "logistics",
  business: "business",
  templates: "templates",
  education: "education",
  tools: "tools",
  海外生活: "life",
  跨境物流: "logistics",
  出海经营: "business",
  工具模板: "templates",
  教育学习: "education",
  实用工具: "tools",
  出海工具: "business",
  电商工具: "business",
};

function normalizeCategory(raw: string | undefined): string {
  if (!raw) return "tools";
  const key = raw.toLowerCase().trim();
  return CATEGORY_MAP[key] || "tools";
}

// ─── 队列操作 ───
function readPending(): string[] {
  if (!existsSync(PENDING_FILE)) return [];
  return readFileSync(PENDING_FILE, "utf-8")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

function movePendingToProcessed(url: string) {
  // 从 pending 移除
  let pending = readPending();
  pending = pending.filter((u) => u !== url);
  writeFileSync(PENDING_FILE, pending.join("\n") + (pending.length ? "\n" : ""));

  // 追加到 processed
  appendFileSync(PROCESSED_FILE, url + "\n");
}

function readProcessed(): Set<string> {
  if (!existsSync(PROCESSED_FILE)) return new Set();
  return new Set(
    readFileSync(PROCESSED_FILE, "utf-8")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
  );
}

// ─── 失败重试追踪 ───
// 格式: url|retryCount per line
function readFailures(): Map<string, number> {
  if (!existsSync(FAILED_FILE)) return new Map();
  const map = new Map<string, number>();
  readFileSync(FAILED_FILE, "utf-8")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .forEach((line) => {
      const [url, count] = line.split("|");
      if (url && count) map.set(url, parseInt(count, 10));
    });
  return map;
}

function writeFailures(map: Map<string, number>) {
  const lines: string[] = [];
  map.forEach((count, url) => lines.push(`${url}|${count}`));
  writeFileSync(FAILED_FILE, lines.join("\n") + (lines.length ? "\n" : ""));
}

function incrementFailure(url: string): number {
  const map = readFailures();
  const newCount = (map.get(url) || 0) + 1;
  map.set(url, newCount);
  writeFailures(map);
  return newCount;
}

function clearFailure(url: string) {
  const map = readFailures();
  map.delete(url);
  writeFailures(map);
}

// ─── 检查是否已在数据库中 ───
async function alreadyInDb(url: string): Promise<boolean> {
  try {
    const normalized = url.replace(/\/+$/, "");
    const exact = await prisma.resource.findFirst({
      where: { url: normalized },
      select: { id: true },
    });
    if (exact) return true;

    // 也检查带 / 不带 / 的变体
    const withSlash = normalized + "/";
    const variant = await prisma.resource.findFirst({
      where: { url: withSlash },
      select: { id: true },
    });
    return !!variant;
  } catch {
    return false;
  }
}

// ─── 核心处理流程 ───
async function processUrl(url: string): Promise<void> {
  log("INFO", `处理中: ${url}`);

  // 步骤 1: 检查是否已在数据库
  const inDb = await alreadyInDb(url);
  if (inDb) {
    log("WARN", `已存在于数据库，跳过: ${url}`);
    clearFailure(url);
    movePendingToProcessed(url);
    return;
  }

  // 步骤 2: 随机节流
  await randomSleep();

  // 步骤 3: 抓取目标页面
  let crawlResult;
  try {
    crawlResult = await crawlUrl(url, 12000);
  } catch (err: any) {
    const retries = incrementFailure(url);
    log("ERROR", `抓取异常 (${retries}/${MAX_RETRIES}): ${url} - ${err.message}`);
    if (retries >= MAX_RETRIES) {
      log("WARN", `⛔ 超过最大重试次数，标记为不可达: ${url}`);
      movePendingToProcessed(url);
    }
    return;
  }

  if (crawlResult.statusCode >= 400 || crawlResult.error) {
    const retries = incrementFailure(url);
    log("WARN", `抓取失败 (${retries}/${MAX_RETRIES}, HTTP ${crawlResult.statusCode}): ${url}`);
    if (retries >= MAX_RETRIES) {
      log("WARN", `⛔ 超过最大重试次数，放弃: ${url}`);
      movePendingToProcessed(url);
    }
    return;
  }

  // 抓取成功，清除失败计数
  clearFailure(url);

  if (!crawlResult.title && !crawlResult.description) {
    log("WARN", `页面内容为空: ${url}`);
    movePendingToProcessed(url);
    return;
  }

  log("INFO", `抓取成功: ${crawlResult.title || extractDomain(url)} (${crawlResult.loadTimeMs}ms)`);

  // 步骤 4: 随机节流（抓取与 AI 调用之间）
  await randomSleep();

  // 步骤 5: AI 评估与洗稿
  let aiResult;
  try {
    aiResult = await evaluateWithAI({
      url: crawlResult.url,
      title: crawlResult.title || extractDomain(url),
      description: crawlResult.description || "",
      domainAgeDays: crawlResult.domainAgeDays,
    });
  } catch (err: any) {
    log("ERROR", `AI 评估异常: ${url} - ${err.message}`);
    return; // 不移动，留给下次重试
  }

  if (aiResult.status === "REJECT") {
    log("WARN", `AI 拒绝: ${url} - ${aiResult.reason}`);
    // 移动到 processed，不再重试
    movePendingToProcessed(url);
    return;
  }

  const category = normalizeCategory(aiResult.category);
  const description = aiResult.rewrittenDescription || crawlResult.description?.slice(0, 100) || "";

  log("SUCCESS", `AI 通过: [${category}] 评分:${aiResult.qualityScore} "${description}"`);

  // 步骤 6: 写入生产库
  try {
    const domain = extractDomain(url);
    const favicon = crawlResult.favicon || `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

    await prisma.resource.upsert({
      where: { url: url.replace(/\/+$/, "") },
      update: {},
      create: {
        name: crawlResult.title || domain,
        url: url.replace(/\/+$/, ""),
        description: description,
        category: category,
        tags: aiResult.tags || [],
        favicon: favicon,
        domainAge: crawlResult.domainAgeDays,
        qualityScore: aiResult.qualityScore || 0,
        language: crawlResult.language || "en",
        isActive: true,
        isAd: false,
        sourceType: "third-party",
        lastChecked: new Date(),
        checkFailCount: 0,
      },
    });

    log("SUCCESS", `✅ 入库成功: ${crawlResult.title || domain}`);
  } catch (err: any) {
    log("ERROR", `入库失败: ${url} - ${err.message}`);
    return;
  }

  // 步骤 7: 移动到 processed
  movePendingToProcessed(url);
}

// ─── 主循环 ───
async function daemonLoop() {
  log("INFO", "🤖 守护进程启动...");
  log("INFO", `待处理文件: ${PENDING_FILE}`);
  log("INFO", `已处理文件: ${PROCESSED_FILE}`);

  let iteration = 0;

  while (true) {
    iteration++;
    const pending = readPending();
    const processed = readProcessed();
    const failures = readFailures();

    log("INFO", `--- 第 ${iteration} 轮 | 待处理: ${pending.length} 条 | 已处理: ${processed.size} 条 | 失败追踪: ${failures.size} 条 ---`);

    if (pending.length === 0) {
      log("WARN", "队列为空，等待 60 秒后重试...");
      await new Promise((r) => setTimeout(r, 60000));
      continue;
    }

    // 处理队列中的第一条
    const url = pending[0];

    try {
      await processUrl(url);
    } catch (err: any) {
      // 终极容错：任何未捕获异常都不退出
      log("ERROR", `💥 未捕获异常: ${url} - ${err.message}`);
      // 移到 processed，避免死循环
      movePendingToProcessed(url);
    }
  }
}

// ─── 启动 ───
daemonLoop().catch((err) => {
  log("ERROR", `守护进程崩溃: ${err.message}`);
  process.exit(1);
});
