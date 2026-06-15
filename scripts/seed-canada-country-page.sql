-- Canada Country Page Seed Data
-- 执行前请确认：这是样板数据，status = 'hidden'（不公开）
-- 执行命令：psql "$DATABASE_URL" -f scripts/seed-canada-country-page.sql

INSERT INTO landing_pages (
  id, slug, title, seo_title, seo_description, page_type, status,
  hero_section, primary_tool, related_tools, related_topics, related_articles,
  faq_items, official_links, ad_placements, cta_config,
  created_at, updated_at, published_at
) VALUES (
  'canada-country-page-001',
  'canada',
  '加拿大实用工具与生活信息',
  '加拿大邮编、地址格式、汇率与跨境发货工具 - 绝世百宝箱',
  '查询加拿大邮编和地址格式，使用汇率换算、运费计算、HS Code和商业单据工具，帮助海外生活、跨境发货和外贸报价。',
  'country',
  'hidden',
  '{"title": "加拿大实用工具与生活信息", "subtitle": "邮编查询、地址格式化、汇率换算、跨境发货一站式工具集合", "ctaText": "开始使用邮编查询", "ctaUrl": "/tools/postal-code", "hotCities": ["Toronto", "Vancouver", "Montreal", "Calgary", "Ottawa", "Edmonton"]}',
  'postal-code',
  '{postal-code,address-formatter,exchange-rate,hs-code,shipping-calculator}',
  '{}',
  '{}',
  '[{"question": "加拿大邮编格式是什么？", "answer": "加拿大邮编格式为字母-数字-字母 空格 数字-字母-数字，例如 K1A 0B1。共6位字符，中间有一个空格。"}, {"question": "加拿大地址怎么写？", "answer": "加拿大地址格式：收件人姓名、街道地址（含公寓号）、城市、省份缩写、邮编、国家。例如：John Doe, 123 Main St Apt 4B, Toronto ON M5V 3K8, Canada"}, {"question": "寄送到加拿大需要哪些单据？", "answer": "通常需要商业发票（Commercial Invoice）、装箱单（Packing List）、报关单。如果是礼品或个人物品，可能需要声明价值。"}]',
  '[{"label": "加拿大邮政官网", "url": "https://www.canadapost-postescanada.ca/", "icon": "📮"}, {"label": "加拿大边境服务署", "url": "https://www.cbsa-asfc.gc.ca/menu-eng.html", "icon": "🛃"}]',
  '{"placementKey": "landing.block_between", "enabled": true}',
  '{"text": "探索更多跨境工具", "url": "/tools", "relatedChecklists": ["first-shipping-checklist"]}',
  NOW(), NOW(), NULL
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description,
  hero_section = EXCLUDED.hero_section,
  primary_tool = EXCLUDED.primary_tool,
  related_tools = EXCLUDED.related_tools,
  faq_items = EXCLUDED.faq_items,
  official_links = EXCLUDED.official_links,
  cta_config = EXCLUDED.cta_config,
  updated_at = NOW();

-- 验证插入结果
SELECT slug, page_type, status, title, 
       hero_section->>'hotCities' as hot_cities
FROM landing_pages 
WHERE slug = 'canada';
