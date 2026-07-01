-- AlterTable: Add metadataJson to checklists
ALTER TABLE "checklists" ADD COLUMN "metadataJson" JSONB;

-- AlterTable: Add metadataJson to guides
ALTER TABLE "guides" ADD COLUMN "metadataJson" JSONB;

-- AlterTable: Add metadataJson to topics
ALTER TABLE "topics" ADD COLUMN "metadataJson" JSONB;
