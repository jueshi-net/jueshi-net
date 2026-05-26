/**
 * crawler.js — Navigation site scraper for amz123, dny123, etc.
 *
 * Usage:
 *   node scripts/crawler.js https://www.amz123.com/ https://www.dny123.com/
 *
 * Outputs: scripts/crawled_data.json
 *
 * Architecture:
 *   1. Fetch each target URL with axios (lightweight, no headless browser needed for static nav sites)
 *   2. Parse HTML with Cheerio to extract resource cards
 *   3. Normalize data into a standard schema
 *   4. Write structured JSON output
 */

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

// ─── Config ─────────────────────────────────────────────────────────────────
const USER_AGENTS = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
];

const DELAY_MS = 2000; // 2s between requests

// ─── Category mapping from nav site sections to our internal categories ─────
const CATEGORY_MAP = {
  '物流': 'logistics',
  '物流货运': 'logistics',
  '仓储': 'logistics',
  '海外仓': 'logistics',
  '集运': 'logistics',
  'shipping': 'logistics',
  '清关': 'logistics',
  '生活': 'life',
  '生活服务': 'life',
  '日常': 'life',
  '社交': 'life',
  '工具': 'life',
  '商业': 'business',
  '电商': 'business',
  '亚马逊': 'business',
  'TikTok': 'business',
  'Shopify': 'business',
  '独立站': 'business',
  '支付': 'business',
  '模板': 'templates',
  '建站': 'templates',
  '设计': 'templates',
};

function mapCategory(rawCategory) {
  if (!rawCategory) return 'life';
  const lower = rawCategory.toLowerCase();
  for (const [key, value] of Object.entries(CATEGORY_MAP)) {
    if (lower.includes(key.toLowerCase())) return value;
  }
  return 'life';
}

// ─── Generic extraction logic (works for most nav sites) ────────────────────
/**
 * Tries multiple CSS selectors commonly used by navigation sites to find
 * resource card elements. Returns array of extracted items.
 */
function extractResources($, sourceUrl) {
  const results = [];

  // Strategy 1: Common nav-site card pattern
  // Sites like amz123/dny123 use card-based layouts
  const cardSelectors = [
    '.site-card', '.nav-card', '.link-card', '.tool-card',
    '.card-item', '.item-card', '.resource-card',
    '.site-list .card', '.nav-list .card',
    '.grid .card', '.sites .card',
    'a[href^="http"]', // Fallback: all outbound links
  ];

  for (const selector of cardSelectors) {
    const cards = $(selector);
    if (cards.length < 3) continue; // Skip if too few matches

    cards.each((_, el) => {
      const $el = $(el);

      // Extract URL — from href on card or nested <a>
      let url = $el.attr('href') || $el.find('a').first().attr('href') || '';
      if (!url) return;
      url = url.trim();
      if (!url.startsWith('http')) {
        try { url = new URL(url, sourceUrl).href; } catch { return; }
      }

      // Extract name — from title, h3, .name, .site-name, or text
      let name = $el.find('.name, .site-name, .title, h3, h4').first().text().trim()
        || $el.attr('title')?.trim()
        || $el.text().trim().slice(0, 50);
      if (!name || name.length < 2) return;

      // Extract description — from .desc, .description, .intro, or subtitle
      let description = $el.find('.desc, .description, .intro, .subtitle, p').first().text().trim().slice(0, 200);

      // Extract logo/image
      let logoUrl = $el.find('img').first().attr('data-src')
        || $el.find('img').first().attr('src')
        || $el.find('.logo, .icon').first().attr('src')
        || '';
      if (logoUrl && !logoUrl.startsWith('http')) {
        try { logoUrl = new URL(logoUrl, sourceUrl).href; } catch { logoUrl = ''; }
      }

      results.push({
        name,
        url,
        description: description || null,
        logoUrl: logoUrl || null,
      });
    });

    if (results.length > 5) break; // Found enough with this selector
  }

  return results;
}

// ─── Main crawler ───────────────────────────────────────────────────────────
async function crawl(urls) {
  const allResources = [];
  const errors = [];

  for (const targetUrl of urls) {
    console.log(`\n🕷️  Crawling: ${targetUrl}`);

    try {
      const headers = {
        'User-Agent': USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      };

      const { data: html } = await axios.get(targetUrl, {
        headers,
        timeout: 15000,
        maxRedirects: 5,
      });

      const $ = cheerio.load(html);

      // Try to detect page title/category from meta or h1
      const pageTitle = $('title').text().trim() || $('h1').first().text().trim();
      const defaultCategory = mapCategory(pageTitle);

      // Extract resources
      const resources = extractResources($, targetUrl);

      console.log(`   → Found ${resources.length} resources from "${pageTitle}"`);

      for (const res of resources) {
        allResources.push({
          ...res,
          category: defaultCategory,
          tags: [defaultCategory],
          sourceType: 'third-party',
          sourceUrl: targetUrl, // Track where it came from
          usage: null,
          disclaimer: null,
        });
      }

      // Anti-scraping delay
      if (urls.indexOf(targetUrl) < urls.length - 1) {
        console.log(`   ⏳ Waiting ${DELAY_MS}ms before next request...`);
        await new Promise(r => setTimeout(r, DELAY_MS));
      }
    } catch (err) {
      console.error(`   ❌ Failed: ${err.message}`);
      errors.push({ url: targetUrl, error: err.message });
    }
  }

  return { resources: allResources, errors };
}

// ─── CLI entry point ────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log('Usage: node scripts/crawler.js <url1> [url2] [url3] ...');
    console.log('Example: node scripts/crawler.js https://www.amz123.com/ https://www.dny123.com/');
    process.exit(1);
  }

  console.log(`🚀 Starting crawl for ${args.length} target(s)...\n`);

  const { resources, errors } = await crawl(args);

  // Deduplicate by URL
  const seen = new Set();
  const unique = resources.filter(r => {
    if (seen.has(r.url)) return false;
    seen.add(r.url);
    return true;
  });

  // Write output
  const outputPath = path.join(__dirname, 'crawled_data.json');
  const output = {
    crawledAt: new Date().toISOString(),
    sourceUrls: args,
    total: unique.length,
    errors,
    data: unique,
  };

  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`\n✅ Saved ${unique.length} unique resources to ${outputPath}`);

  if (errors.length > 0) {
    console.log(`\n⚠️  ${errors.length} failed URL(s):`);
    errors.forEach(e => console.log(`   - ${e.url}: ${e.error}`));
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
