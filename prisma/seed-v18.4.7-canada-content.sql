-- v1.20.42.18.4.7: Seed content for Canada content architecture
-- This script creates minimal seed content: Canada country page, guide, topic, checklist
-- Run AFTER migration 20260621180000_add_guide_checklist_models has been applied
-- All content marked "仅供参考" — no fabricated official data

-- 1. Canada Landing Page (country page)
INSERT INTO "landing_pages" ("id", "slug", "title", "seo_title", "seo_description", "page_type", "status", "hero_section", "related_tools", "related_topics", "related_articles", "faq_items", "official_links", "cta_config", "block_visibility", "block_order", "created_at", "updated_at", "published_at")
VALUES (
  'seed-lp-canada',
  'canada',
  '加拿大出海指南 — 跨境寄送、工具与资源 | 绝世百宝箱',
  '加拿大出海指南 — 跨境寄送、工具与资源',
  '从中国寄送包裹到加拿大的完整指南：HS编码查询、运费估算、地址邮编、商业发票、装箱单等工具一站式整合。',
  'country',
  'published',
  '{"title":"🇨🇦 加拿大出海指南","subtitle":"从中国寄送到加拿大的完整流程、工具和清单","ctaText":"开始跨境发货任务链","ctaUrl":"/workspace/task-chains/shipping/new","flag":"🇨🇦","summary":"一站式整合寄往加拿大所需的全部工具和指南"}'::jsonb,
  ARRAY['hs-code','shipping-estimator','postal-code','commercial-invoice','packing-list'],
  ARRAY[],
  ARRAY['shipping-from-china-to-canada-guide'],
  '[{"question":"寄往加拿大需要什么文件？","answer":"通常需要商业发票（Commercial Invoice）和装箱单（Packing List）。具体要求取决于货物类型和价值，建议咨询物流服务商。"},{"question":"加拿大海关关税起征点是多少？","answer":"加拿大海关关税起征点通常为 20 加元（约 100 人民币），但具体税率和免税额取决于商品类别，请以加拿大边境服务局（CBSA）最新规定为准。"},{"question":"寄往加拿大有什么禁运品？","answer":"常见的禁运/限制物品包括锂电池、食品、药品、动植物制品等。具体清单请参考加拿大边境服务局（CBSA）官方规定。仅供参考，不构成法律建议。"}]'::jsonb,
  '[{"label":"加拿大边境服务局 (CBSA)","url":"https://www.cbsa-asfc.gc.ca/","icon":"🏛️"},{"label":"加拿大邮政 Canada Post","url":"https://www.canadapost.ca/","icon":"📧"}]'::jsonb,
  '{"text":"开始跨境发货任务链","url":"/workspace/task-chains/shipping/new","style":"primary"}'::jsonb,
  '{"hero":true,"relatedTools":true,"relatedGuides":true,"faq":true,"officialLinks":true,"cta":true}'::jsonb,
  '["hero","relatedTools","relatedGuides","faq","officialLinks","cta"]'::jsonb,
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT ("slug") DO NOTHING;

-- 2. Guide: 中国寄加拿大完整流程
INSERT INTO "guides" ("id", "title", "slug", "summary", "body", "category", "tags", "related_tools", "related_topics", "related_checklists", "related_guides", "status", "author", "seo_title", "seo_description", "canonical_url", "robots", "sort_order", "published_at", "created_at", "updated_at")
VALUES (
  'seed-guide-canada-shipping',
  '中国寄加拿大完整流程指南',
  'shipping-from-china-to-canada-guide',
  '从中国寄送包裹到加拿大的完整流程，涵盖HS编码查询、运费估算、文件准备、包装要求等关键步骤。内容仅供参考。',
  '<h2>概述</h2>
<p>本指南介绍从中国寄送包裹到加拿大的基本流程。<strong>以下内容仅供参考，不构成专业建议。</strong>具体的物流方案、费用、时效请以实际物流服务商报价为准。</p>

<h2>第一步：确认商品信息</h2>
<p>寄送前需要确认以下信息：</p>
<ul>
<li>商品名称（中英文）</li>
<li>商品 HS 编码（可使用 <a href="/tools/hs-code">HS编码查询工具</a>）</li>
<li>商品价值和数量</li>
<li>商品重量和尺寸</li>
<li>是否包含电池、液体等特殊物品</li>
</ul>

<h2>第二步：估算运费</h2>
<p>使用 <a href="/tools/shipping-calculator">运费估算器</a> 计算体积重和预计费用。注意：</p>
<ul>
<li>体积重 = 长×宽×高 / 5000（不同物流商标准可能不同）</li>
<li>实际计费重量取实重和体积重中的较大值</li>
<li>最终费用以物流服务商报价为准</li>
</ul>

<h2>第三步：准备报关文件</h2>
<p>寄往加拿大通常需要以下文件：</p>
<ul>
<li><strong>商业发票（Commercial Invoice）</strong> — 使用 <a href="/tools/commercial-invoice">发票生成器</a></li>
<li><strong>装箱单（Packing List）</strong> — 使用 <a href="/tools/packing-list">装箱单生成器</a></li>
</ul>
<p>文件上需注明：收发件人信息、商品描述、HS编码、数量、单价、总价、原产国等。</p>

<h2>第四步：确认收件地址</h2>
<p>加拿大地址格式：</p>
<ul>
<li>使用 <a href="/tools/postal-code">邮编格式校验工具</a> 确认加拿大邮编格式（如 A1A 1A1）</li>
<li>加拿大地址通常包含：门牌号、街道名、城市、省份缩写、邮编</li>
</ul>

<h2>第五步：选择物流渠道</h2>
<p>常见渠道包括：</p>
<ul>
<li>国际快递：DHL、FedEx、UPS（时效快，费用较高）</li>
<li>邮政小包：中国邮政、Canada Post（费用较低，时效较长）</li>
<li>专线物流：各物流商提供的加拿大专线（性价比较高）</li>
</ul>
<p><strong>以上渠道信息仅供参考，请以实际物流服务商提供的服务和报价为准。</strong></p>

<h2>注意事项</h2>
<ul>
<li>加拿大海关关税起征点约为 20 加元，具体以 CBSA 规定为准</li>
<li>锂电池、食品、药品等可能需要额外认证或许可</li>
<li>建议保留所有寄送文件副本以备查验</li>
</ul>

<h2>相关工具</h2>
<p>本站提供以下工具帮助你完成跨境寄送：</p>
<ul>
<li><a href="/tools/hs-code">HS编码查询</a></li>
<li><a href="/tools/shipping-calculator">运费估算器（CBM计算）</a></li>
<li><a href="/tools/postal-code">邮编格式校验</a></li>
<li><a href="/tools/commercial-invoice">商业发票生成器</a></li>
<li><a href="/tools/packing-list">装箱单生成器</a></li>
</ul>

<p><strong>⚠️ 免责声明：本指南内容仅供参考，不构成专业物流、法律或税务建议。HS编码、关税税率、报关要求等具体问题请咨询专业物流服务商或海关代理人。</strong></p>',
  'shipping',
  ARRAY['加拿大','跨境寄送','Canada','国际物流'],
  ARRAY['hs-code','shipping-estimator','postal-code','commercial-invoice','packing-list'],
  ARRAY[],
  ARRAY['canada-shipping-checklist'],
  ARRAY[],
  'published',
  '绝世百宝箱编辑部',
  '中国寄加拿大完整流程指南 | 绝世百宝箱',
  '从中国寄送包裹到加拿大的完整流程指南，涵盖HS编码、运费估算、报关文件、地址格式等关键步骤。',
  'https://jueshi.net/guides/shipping-from-china-to-canada-guide',
  'index,follow',
  0,
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT ("slug") DO NOTHING;

-- 3. Checklist: 中国寄加拿大发货清单
INSERT INTO "checklists" ("id", "title", "slug", "summary", "steps", "related_tools", "related_task_chain", "related_guides", "related_topics", "status", "seo_title", "seo_description", "canonical_url", "robots", "sort_order", "published_at", "created_at", "updated_at")
VALUES (
  'seed-checklist-canada-shipping',
  '中国寄加拿大发货清单',
  'canada-shipping-checklist',
  '从中国寄送包裹到加拿大的完整发货清单，涵盖商品确认、运费估算、文件准备、地址核对等关键步骤。仅供参考。',
  '[
    {"title":"确认商品信息","description":"确认商品名称（中英文）、数量、价值、重量和尺寸。检查是否包含电池、液体等特殊物品。","completed":false,"optional":false,"toolLink":"hs-code"},
    {"title":"查询 HS 编码","description":"使用 HS 编码查询工具查找商品对应的 HS 编码，确保报关信息准确。","completed":false,"optional":false,"toolLink":"hs-code"},
    {"title":"估算运费","description":"使用运费估算器计算体积重和预计费用，选择合适的物流渠道。","completed":false,"optional":false,"toolLink":"shipping-estimator"},
    {"title":"核对收件地址","description":"确认加拿大收件地址格式正确，使用邮编校验工具验证邮编格式（如 A1A 1A1）。","completed":false,"optional":false,"toolLink":"postal-code"},
    {"title":"生成商业发票","description":"使用发票生成器创建商业发票，包含收发件人信息、商品描述、HS编码、数量、单价、总价。","completed":false,"optional":false,"toolLink":"commercial-invoice"},
    {"title":"生成装箱单","description":"使用装箱单生成器创建装箱单，列明每箱的商品明细和数量。","completed":false,"optional":false,"toolLink":"packing-list"},
    {"title":"确认禁运品限制","description":"检查商品是否在加拿大海关禁运/限制清单上。参考加拿大边境服务局（CBSA）规定。仅供参考。","completed":false,"optional":false,"toolLink":null},
    {"title":"选择物流渠道","description":"根据时效和预算选择合适的物流渠道：国际快递、邮政小包或专线物流。","completed":false,"optional":false,"toolLink":null},
    {"title":"保留文件副本","description":"保留商业发票、装箱单和运单的电子副本，以备海关查验或售后需要。","completed":false,"optional":true,"toolLink":null},
    {"title":"加入任务链跟踪","description":"将本次发货加入任务链，全程跟踪各步骤完成情况。","completed":false,"optional":true,"toolLink":null}
  ]'::jsonb,
  ARRAY['hs-code','shipping-estimator','postal-code','commercial-invoice','packing-list'],
  'shipping',
  ARRAY['shipping-from-china-to-canada-guide'],
  ARRAY[],
  'published',
  '中国寄加拿大发货清单 | 绝世百宝箱',
  '从中国寄送包裹到加拿大的完整发货清单，10个关键步骤确保发货流程不遗漏。',
  'https://jueshi.net/checklists/canada-shipping-checklist',
  'index,follow',
  0,
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT ("slug") DO NOTHING;

-- Verify seed data
SELECT 'guides' as type, count(*) as cnt FROM "guides"
UNION ALL
SELECT 'checklists', count(*) FROM "checklists"
UNION ALL
SELECT 'landing_pages_canada', count(*) FROM "landing_pages" WHERE slug = 'canada' AND page_type = 'country';
