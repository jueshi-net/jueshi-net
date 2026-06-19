-- v1.20.42.10.0 Analytics MVP: 扩展 EventLog 模型
-- 添加访问统计、来源追踪、设备信息、IP 匿名化等字段

-- 添加新字段（全部可选，保持向后兼容）
ALTER TABLE "event_logs" ADD COLUMN IF NOT EXISTS "userId" TEXT;
ALTER TABLE "event_logs" ADD COLUMN IF NOT EXISTS "anonymousId" TEXT;
ALTER TABLE "event_logs" ADD COLUMN IF NOT EXISTS "referrer" TEXT;
ALTER TABLE "event_logs" ADD COLUMN IF NOT EXISTS "referrerDomain" TEXT;
ALTER TABLE "event_logs" ADD COLUMN IF NOT EXISTS "utmSource" TEXT;
ALTER TABLE "event_logs" ADD COLUMN IF NOT EXISTS "utmMedium" TEXT;
ALTER TABLE "event_logs" ADD COLUMN IF NOT EXISTS "utmCampaign" TEXT;
ALTER TABLE "event_logs" ADD COLUMN IF NOT EXISTS "utmTerm" TEXT;
ALTER TABLE "event_logs" ADD COLUMN IF NOT EXISTS "utmContent" TEXT;
ALTER TABLE "event_logs" ADD COLUMN IF NOT EXISTS "deviceType" TEXT;
ALTER TABLE "event_logs" ADD COLUMN IF NOT EXISTS "browser" TEXT;
ALTER TABLE "event_logs" ADD COLUMN IF NOT EXISTS "os" TEXT;
ALTER TABLE "event_logs" ADD COLUMN IF NOT EXISTS "country" TEXT;
ALTER TABLE "event_logs" ADD COLUMN IF NOT EXISTS "ipHash" TEXT;
ALTER TABLE "event_logs" ADD COLUMN IF NOT EXISTS "durationMs" INTEGER;
ALTER TABLE "event_logs" ADD COLUMN IF NOT EXISTS "metadata" JSONB;

-- 添加索引优化查询性能
CREATE INDEX IF NOT EXISTS "event_logs_userId_idx" ON "event_logs"("userId");
CREATE INDEX IF NOT EXISTS "event_logs_anonymousId_idx" ON "event_logs"("anonymousId");
CREATE INDEX IF NOT EXISTS "event_logs_path_idx" ON "event_logs"("path");
CREATE INDEX IF NOT EXISTS "event_logs_referrerDomain_idx" ON "event_logs"("referrerDomain");
CREATE INDEX IF NOT EXISTS "event_logs_deviceType_idx" ON "event_logs"("deviceType");

-- 添加注释说明
COMMENT ON COLUMN "event_logs"."userId" IS '关联登录用户（可选）';
COMMENT ON COLUMN "event_logs"."anonymousId" IS '匿名用户标识（可选，用于跨 session 追踪）';
COMMENT ON COLUMN "event_logs"."referrer" IS '完整来源 URL（可选）';
COMMENT ON COLUMN "event_logs"."referrerDomain" IS '来源域名（可选）';
COMMENT ON COLUMN "event_logs"."utmSource" IS 'UTM source（可选）';
COMMENT ON COLUMN "event_logs"."utmMedium" IS 'UTM medium（可选）';
COMMENT ON COLUMN "event_logs"."utmCampaign" IS 'UTM campaign（可选）';
COMMENT ON COLUMN "event_logs"."utmTerm" IS 'UTM term（可选）';
COMMENT ON COLUMN "event_logs"."utmContent" IS 'UTM content（可选）';
COMMENT ON COLUMN "event_logs"."deviceType" IS '设备类型：desktop / mobile / tablet（可选）';
COMMENT ON COLUMN "event_logs"."browser" IS '浏览器名称（可选）';
COMMENT ON COLUMN "event_logs"."os" IS '操作系统（可选）';
COMMENT ON COLUMN "event_logs"."country" IS '国家/地区（可选）';
COMMENT ON COLUMN "event_logs"."ipHash" IS 'IP 哈希（可选，不存明文 IP）';
COMMENT ON COLUMN "event_logs"."durationMs" IS '停留时间毫秒（可选）';
COMMENT ON COLUMN "event_logs"."metadata" IS '扩展元数据（可选，JSON 格式）';
