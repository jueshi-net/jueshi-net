// Advanced Crawler Engine - 多维质量评估采集器
// 基础抓取：title, description, favicon, language
// 质量探针：domain age, accessibility check

import axios from "axios";
import * as cheerio from "cheerio";
import * as whois from "whois";
import { promisify } from "util";

const whoisLookup = promisify((whois as any).lookup);

export interface CrawlResult {
  url: string;
  domain: string;
  title: string;
  description: string;
  favicon: string | null;
  language: string;
  domainAgeDays: number | null;
  statusCode: number;
  loadTimeMs: number;
  error?: string;
}

/**
 * 从 URL 提取域名
 */
export function extractDomain(url: string): string {
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/**
 * 提取 Favicon URL
 */
function extractFavicon($: cheerio.CheerioAPI, baseUrl: string): string | null {
  // 1. 查找 <link rel="icon"> 或 <link rel="shortcut icon">
  const iconLink =
    $('link[rel="icon"]').attr("href") ||
    $('link[rel="shortcut icon"]').attr("href") ||
    $('link[rel="apple-touch-icon"]').attr("href");

  if (iconLink) {
    try {
      return new URL(iconLink, baseUrl).href;
    } catch {
      return iconLink;
    }
  }

  // 2. 回退到 /favicon.ico
  try {
    const u = new URL(baseUrl);
    return `${u.protocol}//${u.hostname}/favicon.ico`;
  } catch {
    return null;
  }
}

/**
 * 查询域名年龄（天）
 */
export async function getDomainAge(domain: string): Promise<number | null> {
  try {
    const result = (await whoisLookup(domain, { follow: 2 })) as string;

    // 尝试多种日期格式
    const patterns = [
      /(?:creation|created|registered|Creation)\s*Date:\s*(.+)/i,
      /(?:Creation Date):\s*(\d{4}-\d{2}-\d{2})/i,
      /(?:created):\s*(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z)/i,
      /(?:Registration Date):\s*(\d{4}-\d{2}-\d{2})/i,
    ];

    for (const pattern of patterns) {
      const match = result.match(pattern);
      if (match) {
        const dateStr = match[1].trim();
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          const now = new Date();
          const days = Math.floor(
            (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
          );
          return days > 0 ? days : null;
        }
      }
    }
    return null;
  } catch {
    return null; // whois 查询失败不阻断流程
  }
}

/**
 * 单页抓取核心逻辑
 */
export async function crawlUrl(
  url: string,
  timeoutMs = 10000
): Promise<CrawlResult> {
  const startTime = Date.now();
  const domain = extractDomain(url);
  const result: CrawlResult = {
    url,
    domain,
    title: "",
    description: "",
    favicon: null,
    language: "en",
    domainAgeDays: null,
    statusCode: 0,
    loadTimeMs: 0,
  };

  try {
    // 先用 HEAD 检查可访问性
    let finalUrl = url;
    try {
      const headResp = await axios.head(url, {
        timeout: timeoutMs,
        maxRedirects: 5,
        validateStatus: () => true,
      });
      result.statusCode = headResp.status;
      finalUrl = headResp.request?.res?.responseUrl || url;
    } catch {
      // HEAD 失败时回退到 GET
    }

    // 如果 HEAD 返回 4xx/5xx，快速标记
    if (result.statusCode >= 400 && result.statusCode < 600) {
      result.error = `HTTP ${result.statusCode}`;
      result.loadTimeMs = Date.now() - startTime;
      return result;
    }

    // GET 抓取完整 HTML
    const resp = await axios.get(url, {
      timeout: timeoutMs,
      maxRedirects: 5,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
      },
      validateStatus: () => true,
    });

    result.statusCode = resp.status;
    result.loadTimeMs = Date.now() - startTime;
    finalUrl = resp.request?.res?.responseUrl || url;

    if (result.statusCode >= 400) {
      result.error = `HTTP ${result.statusCode}`;
      return result;
    }

    const html = resp.data;
    const $ = cheerio.load(html);

    // 提取标题
    result.title =
      $("title").text().trim() ||
      $('meta[property="og:title"]').attr("content")?.trim() ||
      $("h1").first().text().trim() ||
      extractDomain(url);

    // 提取描述
    result.description =
      $('meta[name="description"]').attr("content")?.trim() ||
      $('meta[property="og:description"]').attr("content")?.trim() ||
      "";

    // 提取语言
    result.language =
      $("html").attr("lang") ||
      $('meta[http-equiv="content-language"]').attr("content") ||
      "en";

    // 提取 favicon
    result.favicon = extractFavicon($, finalUrl);

    // 异步查询域名年龄（不阻塞主流程）
    try {
      result.domainAgeDays = await getDomainAge(domain);
    } catch {
      // 忽略 whois 错误
    }

    return result;
  } catch (err: any) {
    result.loadTimeMs = Date.now() - startTime;
    result.error = err.code || err.message || "Unknown error";
    return result;
  }
}
