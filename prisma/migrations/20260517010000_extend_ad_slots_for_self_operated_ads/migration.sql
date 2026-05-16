-- AlterTable: extend ad_slots for self-operated ads
ALTER TABLE "ad_slots" ADD COLUMN     "button_text" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "code" TEXT,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'image',
ADD COLUMN     "title" TEXT,
ADD COLUMN     "target_url" TEXT;

-- Make imageUrl and linkUrl nullable (Prisma schema changed from String to String?)
ALTER TABLE "ad_slots" ALTER COLUMN "imageUrl" DROP NOT NULL,
ALTER COLUMN "linkUrl" DROP NOT NULL;
