INSERT INTO checklists (
  id, title, slug, summary, steps, status, 
  "seoTitle", "seoDescription", robots,
  metadataJson, createdAt, updatedAt
) VALUES (
  'contentops-cli-e2e-test-001',
  'ContentOps CLI 生产测试清单',
  'contentops-cli-production-e2e-checklist',
  '这是一条用于验证 ContentOps CLI 功能的测试清单，不应发布。',
  '[{"title":"测试步骤1","description":"验证 draft 创建","optional":false,"toolLink":""},{"title":"测试步骤2","description":"验证后台编辑","optional":false,"toolLink":""}]'::jsonb,
  'draft',
  'ContentOps CLI 生产测试清单 | 测试用',
  '这是一条用于验证 ContentOps CLI 功能的测试清单，不应发布。',
  'noindex,nofollow',
  '{"contentOps":{"primaryKeyword":"ContentOps CLI 测试","secondaryKeywords":["生产环境测试","draft 创建验证","SEO 后台编辑"],"seo":{"metaKeywords":"ContentOps,CLI测试,生产环境,draft创建,SEO后台编辑","searchIntent":"informational","targetAudience":"开发者和测试人员","audienceStage":"已在海外阶段","targetCountries":["加拿大"],"targetSearchEngines":["Google","Baidu"]},"qualityScore":85,"faq":[{"question":"这是什么？","answer":"这是一条测试清单。"}],"internalLinks":[{"slug":"student-pre-departure-checklist","title":"留学生出国前准备清单","reason":"相关清单"}]}}'::jsonb,
  NOW(),
  NOW()
);
