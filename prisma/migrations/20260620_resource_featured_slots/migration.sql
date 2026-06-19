-- AlterTable: 添加推荐位字段到 resources 表
ALTER TABLE "resources" ADD COLUMN IF NOT EXISTS "is_featured" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "resources" ADD COLUMN IF NOT EXISTS "featured_group" TEXT;
ALTER TABLE "resources" ADD COLUMN IF NOT EXISTS "featured_order" INTEGER;
ALTER TABLE "resources" ADD COLUMN IF NOT EXISTS "featured_start_at" TIMESTAMP(3);
ALTER TABLE "resources" ADD COLUMN IF NOT EXISTS "featured_end_at" TIMESTAMP(3);

-- CreateIndex: 推荐位索引
CREATE INDEX IF NOT EXISTS "resources_is_featured_idx" ON "resources"("is_featured");
