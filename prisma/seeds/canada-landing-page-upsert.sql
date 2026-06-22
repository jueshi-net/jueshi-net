-- Seed: Canada LandingPage update with country intelligence data
-- Uses UPSERT (INSERT ... ON CONFLICT UPDATE) — no destructive operations
-- Safe to run multiple times

INSERT INTO landing_pages (
  slug, title, seo_title, seo_description, page_type, status,
  hero_section, related_tools, related_articles, faq_items, official_links,
  cta_config, published_at, updated_at, created_at
) VALUES (
  'canada',
  '加拿大实用工具与生活信息',
  '加拿大地址邮编、发货工具与实用指南 - 绝世百宝箱',
  '查询加拿大邮编和地址格式，使用HS编码、CBM运费、商业发票、装箱单和中国寄加拿大任务链工具。',
  'country',
  'published',
  jsonb_build_object(
    'title', '加拿大 Canada',
    'subtitle', '适合跨境发货、地址邮编、报关资料、生活工具等场景',
    'flag', '🇨🇦',
    'tags', jsonb_build_array('Postal Code', 'CAD', '+1', 'America/Toronto'),
    'ctaText', '查询加拿大邮编',
    'ctaUrl', '/tools/postal-code?country=CA'
  ),
  ARRAY['postal-code', 'hs-code', 'shipping-estimator', 'commercial-invoice', 'packing-list', 'address-formatter', 'cbm', 'exchange-rate'],
  ARRAY[]::text[],
  jsonb_build_array(
    jsonb_build_object('question', '加拿大邮编怎么查？', 'answer', '加拿大邮编（Postal Code）采用字母数字交替格式（ANA NAN），如 M5V 3L9。可在本页邮编查询工具中选择加拿大并输入邮编、城市或地址关键词进行查询。'),
    jsonb_build_object('question', '加拿大地址怎么写？', 'answer', '标准格式：收件人姓名 → 门牌号 + 街道名 → 城市, 省份缩写 邮编 → Canada。例如：John Smith / 123 Main St / Toronto, ON M5V 3L9 / Canada'),
    jsonb_build_object('question', '地图结果是否代表精确邮编位置？', 'answer', '地图参考按城市/地区搜索，不代表精确邮编位置。邮编数据来源于公开数据源，结果仅供参考。正式发货前请以 Canada Post 官方信息为准。'),
    jsonb_build_object('question', '找不到邮编时怎么办？', 'answer', '可以尝试输入城市名（如 Toronto、Vancouver）或省份缩写（如 ON、BC）进行搜索。也可访问 Canada Post 官方网站查询。')
  ),
  jsonb_build_array(
    jsonb_build_object('label', 'Canada Post 加拿大邮政', 'url', 'https://www.canadapost.ca'),
    jsonb_build_object('label', 'CBSA 加拿大边境服务局', 'url', 'https://www.cbsa-asfc.gc.ca'),
    jsonb_build_object('label', 'IRCC 加拿大移民局', 'url', 'https://www.canada.ca/en/immigration-refugees-citizenship')
  ),
  jsonb_build_object(
    'title', '中国寄加拿大任务链',
    'description', '商品信息 → HS编码 → 合规检查 → CBM → 地址邮编 → 商业发票 → 装箱单 → 成本估算 → 报价模板',
    'text', '开始任务链',
    'url', '/workspace/task-chains/shipping/new'
  ),
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description,
  page_type = EXCLUDED.page_type,
  status = EXCLUDED.status,
  hero_section = EXCLUDED.hero_section,
  related_tools = EXCLUDED.related_tools,
  faq_items = EXCLUDED.faq_items,
  official_links = EXCLUDED.official_links,
  cta_config = EXCLUDED.cta_config,
  published_at = EXCLUDED.published_at,
  updated_at = NOW();
