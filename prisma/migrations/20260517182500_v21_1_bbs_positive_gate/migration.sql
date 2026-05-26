-- AlterTable
ALTER TABLE "forum_posts" ADD COLUMN "reward_granted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "forum_comments" ADD COLUMN "reward_granted_at" TIMESTAMP(3);
