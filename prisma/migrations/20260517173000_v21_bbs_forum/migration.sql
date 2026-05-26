-- CreateEnum
-- Note: We use String fields instead of Postgres enum for Prisma compatibility

-- CreateTable
CREATE TABLE "forum_categories" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon_text" TEXT,
    "color" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "forum_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forum_posts" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "is_locked" BOOLEAN NOT NULL DEFAULT false,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "comment_count" INTEGER NOT NULL DEFAULT 0,
    "last_comment_at" TIMESTAMP(3),
    "last_comment_user_id" TEXT,
    "ip_hash" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "forum_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forum_comments" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'published',
    "ip_hash" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "forum_comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "forum_categories_key_key" ON "forum_categories"("key");

-- CreateIndex
CREATE INDEX "forum_categories_key_idx" ON "forum_categories"("key");

-- CreateIndex
CREATE INDEX "forum_categories_is_active_idx" ON "forum_categories"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "forum_posts_slug_key" ON "forum_posts"("slug");

-- CreateIndex
CREATE INDEX "forum_posts_status_idx" ON "forum_posts"("status");

-- CreateIndex
CREATE INDEX "forum_posts_category_id_idx" ON "forum_posts"("category_id");

-- CreateIndex
CREATE INDEX "forum_posts_user_id_idx" ON "forum_posts"("user_id");

-- CreateIndex
CREATE INDEX "forum_posts_created_at_idx" ON "forum_posts"("created_at" DESC);

-- CreateIndex
CREATE INDEX "forum_posts_is_pinned_idx" ON "forum_posts"("is_pinned");

-- CreateIndex
CREATE INDEX "forum_posts_slug_idx" ON "forum_posts"("slug");

-- CreateIndex
CREATE INDEX "forum_comments_post_id_idx" ON "forum_comments"("post_id");

-- CreateIndex
CREATE INDEX "forum_comments_user_id_idx" ON "forum_comments"("user_id");

-- CreateIndex
CREATE INDEX "forum_comments_status_idx" ON "forum_comments"("status");

-- CreateIndex
CREATE INDEX "forum_comments_created_at_idx" ON "forum_comments"("created_at" DESC);

-- AddForeignKey
ALTER TABLE "forum_posts" ADD CONSTRAINT "forum_posts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_posts" ADD CONSTRAINT "forum_posts_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "forum_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_comments" ADD CONSTRAINT "forum_comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "forum_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_comments" ADD CONSTRAINT "forum_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed default categories
INSERT INTO "forum_categories" ("id", "key", "name", "description", "icon_text", "color", "sort_order", "created_at", "updated_at") VALUES
    ('cat-general', 'general', '综合讨论', '自由交流，畅所欲言', '💬', '#6366f1', 1, NOW(), NOW()),
    ('cat-overseas-life', 'overseas-life', '海外生活', '海外生活经验分享、衣食住行', '🌍', '#10b981', 2, NOW(), NOW()),
    ('cat-tools', 'tools', '工具分享', '好用的工具、软件、网站推荐', '🔧', '#f59e0b', 3, NOW(), NOW()),
    ('cat-logistics', 'logistics', '物流问答', '国际快递、集运、清关问题', '📦', '#3b82f6', 4, NOW(), NOW()),
    ('cat-business', 'business', '出海经营', '跨境电商、创业、出海经验', '💼', '#8b5cf6', 5, NOW(), NOW()),
    ('cat-feedback', 'feedback', '网站反馈', '对海外百宝箱的建议和反馈', '📢', '#ef4444', 6, NOW(), NOW());
