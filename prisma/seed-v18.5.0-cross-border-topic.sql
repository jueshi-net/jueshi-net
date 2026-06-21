-- Seed: cross-border-shipping Topic
-- Version: v1.20.42.18.5.0
-- Idempotent: ON CONFLICT (slug) DO NOTHING

INSERT INTO topics (
  slug,
  title,
  subtitle,
  summary,
  status,
  "templateType",
  "suitableFor",
  tags,
  "seoTitle",
  "seoDescription",
  "publishedAt",
  "createdAt",
  "updatedAt"
) VALUES (
  'cross-border-shipping',
  '跨境发货',
  '中国到海外发货全流程指南与工具',
  '从中国发货到海外的完整流程：准备资料、选择物流、填写发票装箱单、报关清关、追踪包裹。包含加拿大等热门目的地的详细指南、清单和工具。',
  'published',
  'default',
  '["需要从中国发货到海外的用户", "跨境电商卖家", "个人寄件用户"]'::jsonb,
  '["shipping", "cross-border", "canada", "logistics"]'::jsonb,
  '跨境发货指南 — 中国到海外发货全流程 | 绝世百宝箱',
  '从中国发货到海外的完整流程指南，包含加拿大等国家页、发货清单、HS编码查询、发票装箱单生成等工具。',
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (slug) DO NOTHING;
