-- 添加 17TRACK 到网址导航
-- 分类：logistics（物流追踪）
-- 来源类型：third-party（第三方）

INSERT INTO resources (
  id,
  name,
  url,
  description,
  category,
  tags,
  "sourceType",
  usage,
  disclaimer,
  "isActive",
  "sortOrder",
  "isAd",
  "qualityScore",
  language,
  "createdAt",
  "updatedAt"
) VALUES (
  '17track-official',
  '17TRACK',
  'https://www.17track.net/zh-cn',
  '全球包裹物流轨迹查询平台，支持 DHL、FedEx、UPS、USPS、Royal Mail、China Post、EMS 等 2000+ 物流商',
  'logistics',
  ARRAY['物流', '包裹追踪', '国际快递', '快递查询', 'tracking'],
  'third-party',
  '输入运单号即可查询全球包裹物流轨迹，支持批量查询。适用于跨境电商、外贸 SOHO、国际物流从业者。',
  '本站提供 17TRACK 查询入口（/tracking），实际物流轨迹数据由 17TRACK 提供，请以 17TRACK 或承运商官网结果为准。',
  true,
  0,
  false,
  95,
  'zh',
  NOW(),
  NOW()
)
ON CONFLICT (url) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  tags = EXCLUDED.tags,
  usage = EXCLUDED.usage,
  disclaimer = EXCLUDED.disclaimer,
  "updatedAt" = NOW();

-- 验证插入
SELECT id, name, url, category, "sourceType", "isActive", "qualityScore"
FROM resources
WHERE url = 'https://www.17track.net/zh-cn';
