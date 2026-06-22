-- v1.20.42.18.6.1: Seed extended levels (lv6-lv10) + community badges
-- Additive only, uses ON CONFLICT to skip existing

-- ===== Extend UserLevel to 10 levels =====
INSERT INTO "user_levels" ("id", "key", "name", "min_growth", "max_growth", "description", "benefits", "icon_text", "color", "sort_order", "is_active", "created_at", "updated_at")
VALUES
  (gen_random_uuid()::text, 'lv6', 'Lv.6 资深玩家', 3000, 5999, '资深社区成员', '["签到+12积分", "AI+20次/日", "发帖奖励+50%"]'::jsonb, '🏆', 'rose-500', 50, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'lv7', 'Lv.7 跨境达人', 6000, 9999, '跨境领域达人', '["签到+15积分", "AI+25次/日", "发帖奖励+80%", "专属勋章"]'::jsonb, '🎖️', 'indigo-500', 60, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'lv8', 'Lv.8 社区导师', 10000, 15999, '社区导师级用户', '["签到+20积分", "AI+30次/日", "发帖奖励+100%", "专属勋章", "优先审核"]'::jsonb, '👑', 'amber-600', 70, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'lv9', 'Lv.9 传奇贡献者', 16000, 24999, '传奇社区贡献者', '["签到+25积分", "AI无限", "发帖奖励+150%", "专属勋章", "优先审核", "内测资格"]'::jsonb, '💎', 'purple-600', 80, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'lv10', 'Lv.10 社区支柱', 25000, NULL, '社区支柱级用户', '["签到+30积分", "AI无限", "发帖奖励+200%", "专属勋章", "优先审核", "内测资格", "专属客服"]'::jsonb, '🌟', 'gradient', 90, true, NOW(), NOW())
ON CONFLICT ("key") DO NOTHING;

-- Update existing lv5 max_growth to match new lv6
UPDATE "user_levels" SET "max_growth" = 4999 WHERE "key" = 'lv5' AND "max_growth" IS NULL;

-- ===== Insert community badges =====
INSERT INTO "user_badges" ("id", "key", "name", "description", "icon_text", "color", "category", "condition_text", "is_active", "sort_order", "created_at", "updated_at")
VALUES
  (gen_random_uuid()::text, 'early_beta_user', '早期体验官', 'Beta 期间注册并参与反馈的用户', '🎯', 'amber-500', 'community', 'Beta 用户或管理员授予', true, 100, NOW(), NOW()),
  (gen_random_uuid()::text, 'first_post', '初次发帖', '发布第一篇社区帖子', '✍️', 'blue-500', 'forum', '发布第一篇社区帖', true, 110, NOW(), NOW()),
  (gen_random_uuid()::text, 'first_reply', '热心回复', '首次回复他人帖子', '💬', 'teal-500', 'forum', '首次回复', true, 120, NOW(), NOW()),
  (gen_random_uuid()::text, 'helpful_answer', '有用回答', '回答获赞或被采纳', '👍', 'green-500', 'forum', '回答获赞或被采纳', true, 130, NOW(), NOW()),
  (gen_random_uuid()::text, 'shipping_expert', '发货达人', '跨境发货分类贡献达标', '📦', 'rose-500', 'community', '跨境发货分类贡献达标', true, 140, NOW(), NOW()),
  (gen_random_uuid()::text, 'address_helper', '地址邮编达人', '地址邮编相关贡献达标', '📮', 'cyan-500', 'community', '地址邮编相关贡献达标', true, 150, NOW(), NOW()),
  (gen_random_uuid()::text, 'bug_hunter', 'Bug 捕手', '提交有效 Beta bug 反馈', '🐛', 'orange-500', 'community', '提交有效 Beta bug', true, 160, NOW(), NOW()),
  (gen_random_uuid()::text, 'community_guardian', '社区守护者', '有效举报或审核贡献', '🛡️', 'indigo-500', 'community', '有效举报/审核贡献', true, 170, NOW(), NOW()),
  (gen_random_uuid()::text, 'long_time_member', '老朋友', '注册时间超过 90 天', '🤝', 'purple-500', 'system', '注册时间超过一定天数', true, 180, NOW(), NOW()),
  (gen_random_uuid()::text, 'trusted_member', '可信用户', '荣誉值达到阈值且无违规', '✅', 'emerald-500', 'community', '荣誉值达到阈值且无违规', true, 190, NOW(), NOW())
ON CONFLICT ("key") DO NOTHING;
