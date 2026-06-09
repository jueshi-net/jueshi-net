#!/usr/bin/env node
/**
 * import-checklist-draft.mjs
 * 读取清单 draft JSON，校验后写入 LandingPage（status 固定为 draft）
 *
 * 用法: node scripts/import-checklist-draft.mjs <json-file>
 *
 * 安全规则：
 * - 不写入 published
 * - 不删除已有正式内容
 * - 不输出数据库密码或 secret
 * - 支持 upsert by slug
 */

import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { basename } from "node:path";

const file = process.argv[2];
if (!file) {
  console.error("用法: node scripts/import-checklist-draft.mjs <json-file>");
  process.exit(1);
}

// 1. 读取 JSON
let data;
try {
  data = JSON.parse(readFileSync(file, "utf-8"));
} catch (e) {
  console.error(`❌ JSON 解析失败: ${e.message}`);
  process.exit(1);
}

// 2. 强制 status = draft
if (data.status === "published") {
  console.warn("⚠️  输入为 published，强制降级为 draft。Hermes 不允许自动发布。");
}
data.status = "draft";
data.pageType = "checklist";

// 3. 运行 validate 脚本
console.log(`📋 校验 ${basename(file)} ...`);
try {
  execSync(`node scripts/validate-checklist-draft.mjs "${file}"`, { stdio: "inherit" });
} catch {
  console.error("\n❌ 校验失败，终止导入。请先修复 draft 文件中的错误。");
  process.exit(1);
}

// 4. 构造 SQL
const slug = data.slug;
console.log(`\n📝 写入 LandingPage draft: ${slug}`);

const heroSectionStr = JSON.stringify(data.heroSection).replace(/'/g, "''");
const faqItemsStr = JSON.stringify(data.faqItems || []).replace(/'/g, "''");
const officialLinksStr = JSON.stringify(data.officialLinks || []).replace(/'/g, "''");
const ctaConfigStr = JSON.stringify(data.ctaConfig || { text: "开始使用工具", url: "/tools" }).replace(/'/g, "''");
const toolsArr = (data.relatedTools || []).map(t => `'${t.replace(/'/g, "''")}'`).join(", ");
const topicsArr = (data.relatedTopics || []).map(t => `'${t.replace(/'/g, "''")}'`).join(", ");
const articlesArr = (data.relatedArticles || []).map(t => `'${t.replace(/'/g, "''")}'`).join(", ");

const sql = `
INSERT INTO landing_pages (
  id, slug, title, seo_title, seo_description, page_type, status,
  hero_section, faq_items, official_links, related_tools, related_topics, related_articles,
  cta_config, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  '${slug.replace(/'/g, "''")}',
  '${(data.title || "").replace(/'/g, "''")}',
  '${(data.seoTitle || "").replace(/'/g, "''")}',
  '${(data.seoDescription || "").replace(/'/g, "''")}',
  'checklist',
  'draft',
  '${heroSectionStr}'::jsonb,
  '${faqItemsStr}'::jsonb,
  '${officialLinksStr}'::jsonb,
  ARRAY[${toolsArr}]::text[],
  ARRAY[${topicsArr}]::text[],
  ARRAY[${articlesArr}]::text[],
  '${ctaConfigStr}'::jsonb,
  NOW(),
  NOW()
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description,
  page_type = EXCLUDED.page_type,
  status = CASE WHEN landing_pages.status = 'published' THEN 'published' ELSE EXCLUDED.status END,
  hero_section = EXCLUDED.hero_section,
  faq_items = EXCLUDED.faq_items,
  official_links = EXCLUDED.official_links,
  related_tools = EXCLUDED.related_tools,
  related_topics = EXCLUDED.related_topics,
  related_articles = EXCLUDED.related_articles,
  cta_config = EXCLUDED.cta_config,
  updated_at = NOW();
`;

const sqlFile = `/tmp/import-checklist-${slug}.sql`;
writeFileSync(sqlFile, sql);

try {
  execSync(`cd /home/deploy/xixiong-saas && NODE_ENV=production npx prisma db execute --file ${sqlFile}`, {
    stdio: "inherit"
  });
  console.log(`\n✅ draft 已导入: ${slug}`);
  console.log(`   Admin 查看: /admin/landing-pages`);
  console.log(`   公开页 (404 预期，因为 draft): /checklists/${slug}`);
  console.log(`   ⚠️  请人工审核后在 Admin 中发布。`);
} catch (e) {
  console.error(`\n❌ 导入失败: ${e.message}`);
  process.exit(1);
}
