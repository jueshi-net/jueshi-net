-- AlterTable: 添加 block 控制字段到 landing_pages 表
ALTER TABLE "landing_pages" ADD COLUMN IF NOT EXISTS "block_visibility" JSONB;
ALTER TABLE "landing_pages" ADD COLUMN IF NOT EXISTS "block_order" JSONB;
