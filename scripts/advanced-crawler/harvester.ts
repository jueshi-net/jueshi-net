// scripts/advanced-crawler/harvester.ts
// v2.0: Deep recursive crawler with anti-bot measures
// - Follows pagination and category links
// - Random User-Agent rotation
// - Random delays

import * as cheerio from "cheerio";
import axios from "axios";
import { readFileSync, writeFileSync, appendFileSync, existsSync } from "fs";
import { resolve } from "path";

// 1. Random User Agents
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Safari/605.1.15",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
];

function getRandomUA() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

function randomDelay(min = 1000, max = 3000) {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((r) => setTimeout(r, ms));
}

// 2. Load seeds dynamically
const SEEDS_FILE = resolve(__dirname, "seeds.json");
let rawSeeds: any[] = [];
if (existsSync(SEEDS_FILE)) {
  try { rawSeeds = JSON.parse(readFileSync(SEEDS_FILE, "utf-8")); } catch {}
}

const TARGETS = rawSeeds.map((s: any) => ({ url: s.url, name: new URL(s.url).hostname }));

// Fallback if empty
if (TARGETS.length === 0) {
  TARGETS.push(
    { url: "https://www.amz123.com/", name: "AMZ123" },
    { url: "https://www.dny123.com/", name: "DNY123" },
    { url: "https://www.tt123.com/", name: "TT123" }
  );
}

const INTERNAL_KEYWORDS = ["amz123", "dny123", "tt123", "123.com"];

const FILTER_PATTERNS = [
  /^#/,
  /^javascript:/i,
  /^mailto:/i,
  /^tel:/i,
  /login|register|signup/i,
  /about|contact|privacy|terms/i,
  /search/i,
  /\.css$|\.js$|\.png$|\.jpg$|\.svg$/i,
  /weixin|qq\.com/i,
  /zhihu\.com/i,
  /baidu\.com/i,
  /taobao\.com/i,
  /tmall\.com/i,
  /jd\.com/i,
  /douyin\.com/i,
  /xiaohongshu\.com/i,
  /bilibili\.com/i,
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
    if (resolved.protocol !== "http:" && resolved.protocol !== "https:") return null;
    return resolved.origin + resolved.pathname.replace(/\/+$/, "");
  } catch {
    return null;
  }
}

// Heuristic: Is this link likely a directory/category/pagination page?
function isDirectoryPage(url: string): boolean {
  if (!isInternal(url)) return false;
  const lower = url.toLowerCase();
  const path = new URL(url).pathname;
  
  const dirKeywords = ["category", "tag", "nav", "list", "top", "ranking", "tool", "seller", "buyer", "service", "page", "index", "guide", "navigation", "daohang"];
  const isDir = dirKeywords.some(kw => lower.includes(kw));
  
  // Pagination pattern: /page/2, ?page=2, p=2
  const isPage = /\/page\/|page=|p=|_p\d/.test(lower);

  // Root path
  const isRoot = path === "/" || path === "";

  return isDir || isPage || isRoot;
}

async function fetchPage(url: string) {
  try {
    const resp = await axios.get(url, {
      timeout: 15000,
      maxRedirects: 5,
      headers: {
        "User-Agent": getRandomUA(),
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
      },
    });
    return resp.data;
  } catch (e: any) {
    console.error(`  ✗ Fetch failed: ${e.message}`);
    return null;
  }
}

async function main() {
  console.log("═══════════════════════════════════════");
  console.log("🚜 深度收割机启动 (支持翻页/分类挖掘)");
  console.log("═══════════════════════════════════════");

  const PENDING_FILE = resolve(__dirname, "pending-urls.txt");
  const PROCESSED_FILE = resolve(__dirname, "processed-urls.txt");
  
  // Load processed set to avoid re-discovering
  let processedUrls = new Set<string>();
  if (existsSync(PROCESSED_FILE)) {
    readFileSync(PROCESSED_FILE, "utf-8").split("\n").forEach(l => {
      const u = l.trim();
      if (u) processedUrls.add(u);
    });
  }

  // Load existing pending to avoid duplicates
  let existingPending = new Set<string>();
  if (existsSync(PENDING_FILE)) {
    readFileSync(PENDING_FILE, "utf-8").split("\n").forEach(l => {
      const u = l.trim();
      if (u) existingPending.add(u);
    });
  }

  let totalNewTools = 0;

  for (const target of TARGETS) {
    console.log(`\n🎯 深度挖掘: ${target.name} (${target.url})`);
    
    const queue: string[] = [target.url];
    const visited = new Set<string>();
    let pagesScraped = 0;
    const MAX_PAGES = 30; // Max pages to visit per site to avoid runaways

    while (queue.length > 0 && pagesScraped < MAX_PAGES) {
      const currentUrl = queue.shift()!;
      
      // Normalize for visited check
      let normalizedVisited;
      try { normalizedVisited = new URL(currentUrl).origin + new URL(currentUrl).pathname.replace(/\/+$/, ""); } catch { continue; }
      
      if (visited.has(normalizedVisited)) continue;
      visited.add(normalizedVisited);
      pagesScraped++;

      console.log(`  📄 抓取第 ${pagesScraped} 页: ${currentUrl}`);

      const html = await fetchPage(currentUrl);
      if (!html) continue;

      const $ = cheerio.load(html);
      let toolsFoundOnPage = 0;

      $("a[href]").each((_, el) => {
        const href = $(el).attr("href");
        if (!href) return;

        const normalized = normalizeUrl(href, currentUrl);
        if (!normalized) return;

        // Check if Internal or External
        if (isInternal(normalized)) {
          // If it's a directory page and not visited, add to queue
          if (isDirectoryPage(normalized) && !visited.has(normalized)) {
             // Check if already in queue
             if (!queue.includes(normalized)) {
               queue.push(normalized);
             }
          }
        } else {
          // External link: potential tool
          if (shouldFilter(normalized)) return;
          if (processedUrls.has(normalized)) return;
          if (existingPending.has(normalized)) return;
          
          // Valid new tool
          appendFileSync(PENDING_FILE, normalized + "\n");
          existingPending.add(normalized); // Update local memory
          toolsFoundOnPage++;
          totalNewTools++;
        }
      });

      console.log(`    → 发现 ${toolsFoundOnPage} 个新工具链接`);
      
      // Random delay between pages
      await randomDelay(1500, 3500);
    }
    
    console.log(`  ✅ ${target.name} 完成. 访问页面: ${pagesScraped}, 新增工具: ${totalNewTools}`);
    await randomDelay(3000, 5000); // Delay between sites
  }

  console.log("\n═══════════════════════════════════════");
  console.log(`🎉 收割完成！共新增 ${totalNewTools} 条 URL 到待处理队列。`);
  console.log("═══════════════════════════════════════");
}

main().catch(console.error);
