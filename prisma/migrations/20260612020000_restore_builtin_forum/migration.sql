-- Create forum_categories table
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

-- Create forum_posts table
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
    "reward_granted_at" TIMESTAMP(3),

    CONSTRAINT "forum_posts_pkey" PRIMARY KEY ("id")
);

-- Create forum_comments table
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
    "reward_granted_at" TIMESTAMP(3),

    CONSTRAINT "forum_comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "forum_categories_key_key" ON "forum_categories"("key");
CREATE INDEX "forum_categories_key_idx" ON "forum_categories"("key");
CREATE INDEX "forum_categories_is_active_idx" ON "forum_categories"("is_active");
CREATE UNIQUE INDEX "forum_posts_slug_key" ON "forum_posts"("slug");
CREATE INDEX "forum_posts_status_idx" ON "forum_posts"("status");
CREATE INDEX "forum_posts_category_id_idx" ON "forum_posts"("category_id");
CREATE INDEX "forum_posts_user_id_idx" ON "forum_posts"("user_id");
CREATE INDEX "forum_posts_created_at_idx" ON "forum_posts"("created_at" DESC);
CREATE INDEX "forum_posts_is_pinned_idx" ON "forum_posts"("is_pinned");
CREATE INDEX "forum_posts_slug_idx" ON "forum_posts"("slug");
CREATE INDEX "forum_comments_post_id_idx" ON "forum_comments"("post_id");
CREATE INDEX "forum_comments_user_id_idx" ON "forum_comments"("user_id");
CREATE INDEX "forum_comments_status_idx" ON "forum_comments"("status");
CREATE INDEX "forum_comments_created_at_idx" ON "forum_comments"("created_at" DESC);

-- AddForeignKey
ALTER TABLE "forum_posts" ADD CONSTRAINT "forum_posts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "forum_posts" ADD CONSTRAINT "forum_posts_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "forum_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "forum_comments" ADD CONSTRAINT "forum_comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "forum_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "forum_comments" ADD CONSTRAINT "forum_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
