// 定向链接收割机 — 从竞品导航站提取全部外部真实域名链接
// 用法: npx tsx scripts/advanced-crawler/harvester.ts

import * as cheerio from "cheerio";
import axios from "axios";
import { readFileSync, writeFileSync, appendFileSync, existsSync } from "fs";
import { resolve } from "path";

// ─── 目标种子池 ───
const TARGETS = [
  { url: "https://www.amz123.com/", name: "AMZ123" },
  { url: "https://www.dny123.com/", name: "DNY123" },
  { url: "https://www.tt123.com/", name: "TT123" },
];

// 各站自身的域名关键词（用于过滤内部链接）
const INTERNAL_KEYWORDS = ["amz123", "dny123", "tt123", "123.com"];

// 待处理队列文件
const PENDING_FILE = resolve(__dirname, "pending-urls.txt");
const PROCESSED_FILE = resolve(__dirname, "processed-urls.txt");

// 过滤掉明显非工具链接的 URL 模式
const FILTER_PATTERNS = [
  /^#/,                    // 锚点
  /^javascript:/i,         // JS 伪协议
  /^mailto:/i,             // 邮件
  /^tel:/i,                // 电话
  /login|register|signup/i, // 登录注册页
  /about|contact|privacy|terms/i, // 通用页面
  /category|tag|search/i,  // 分类/搜索页
  /\.css$|\.js$|\.png$|\.jpg$|\.svg$/i, // 静态资源
  /weixin|qq\.com/i,       // 微信相关
  /zhihu\.com/i,           // 知乎
  /baidu\.com/i,           // 百度
  /taobao\.com/i,          // 淘宝
  /tmall\.com/i,           // 天猫
  /jd\.com/i,              // 京东
  /douyin\.com/i,          // 抖音
  /xiaohongshu\.com/i,     // 小红书
  /bilibili\.com/i,        // B站
];

function isInternal(url: string): boolean {
  const lower = url.toLowerCase();
  return INTERNAL_KEYWORDS.some((kw) => lower.includes(kw));
}

function shouldFilter(url: string): boolean {
  return FILTER_PATTERNS.some((pattern) => pattern.test(url));
}

function normalizeUrl(href: string, baseUrl: string): string | null {
  try {
    const resolved = new URL(href, baseUrl);
    // 只保留 http(s) 协议
    if (resolved.protocol !== "http:" && resolved.protocol !== "https:") {
      return null;
    }
    // 去掉查询参数和锚点，保留纯净域名+路径
    return resolved.origin + resolved.pathname.replace(/\/+$/, "");
  } catch {
    return null;
  }
}

async function harvestFromTarget(target: typeof TARGETS[0]): Promise<string[]> {
  console.log(`\n🎯 正在收割 ${target.name} (${target.url})...`);

  try {
    const resp = await axios.get(target.url, {
      timeout: 15000,
      maxRedirects: 5,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    const $ = cheerio.load(resp.data);
    const links = new Set<string>();

    $("a[href]").each((_, el) => {
      const href = $(el).attr("href");
      if (!href) return;

      const normalized = normalizeUrl(href, target.url);
      if (!normalized) return;

      // 过滤自身内部链接
      if (isInternal(normalized)) return;

      // 过滤非工具页
      if (shouldFilter(normalized)) return;

      links.add(normalized);
    });

    const result = Array.from(links);
    console.log(`  → 从 ${target.name} 提取到 ${result.length} 条外部链接`);
    return result;
  } catch (err: any) {
    console.error(`  ✗ 收割 ${target.name} 失败: ${err.message}`);
    return [];
  }
}

async function main() {
  console.log("═══════════════════════════════════════");
  console.log("🚜 定向链接收割机启动");
  console.log("═══════════════════════════════════════");

  const allUrls: string[] = [];

  // 依次收割每个目标站
  for (const target of TARGETS) {
    const urls = await harvestFromTarget(target);
    allUrls.push(...urls);
    // 收割间隔 2 秒，避免被封
    await new Promise((r) => setTimeout(r, 2000));
  }

  // 去重
  const uniqueUrls = [...new Set(allUrls)];
  console.log(`\n📊 收割统计:`);
  console.log(`  总计提取: ${allUrls.length} 条`);
  console.log(`  去重后:   ${uniqueUrls.length} 条`);

  // 读取已有的 pending 队列（避免重复追加）
  let existingUrls = new Set<string>();
  if (existsSync(PENDING_FILE)) {
    existingUrls = new Set(
      readFileSync(PENDING_FILE, "utf-8")
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
    );
  }

  // 读取已处理队列（避免重复添加已处理的）
  let processedUrls = new Set<string>();
  if (existsSync(PROCESSED_FILE)) {
    processedUrls = new Set(
      readFileSync(PROCESSED_FILE, "utf-8")
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
    );
  }

  // 追加新 URL 到 pending 队列
  let newCount = 0;
  for (const url of uniqueUrls) {
    if (!existingUrls.has(url) && !processedUrls.has(url)) {
      appendFileSync(PENDING_FILE, url + "\n");
      newCount++;
    }
  }

  console.log(`  新增到队列: ${newCount} 条`);
  console.log(`  pending-urls.txt 当前总计: ${uniqueUrls.length + existingUrls.size - newCount} 条`);

  console.log("\n✅ 收割完成！待处理队列已更新。");
  console.log("═══════════════════════════════════════");
}

main().catch(console.error);
