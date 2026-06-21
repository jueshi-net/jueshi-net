-- v1.20.42.18.4.7: Add Guide and Checklist models
-- This migration only creates new tables, does not modify any existing tables.
-- Safe to rollback: DROP TABLE IF EXISTS "guides"; DROP TABLE IF EXISTS "checklists";

-- CreateTable: guides
CREATE TABLE "guides" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT,
    "body" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'general',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "relatedTools" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "relatedTopics" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "relatedChecklists" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "relatedGuides" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" TEXT NOT NULL DEFAULT 'draft',
    "coverImage" TEXT,
    "author" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "canonicalUrl" TEXT,
    "robots" TEXT NOT NULL DEFAULT 'index,follow',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guides_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "guides_slug_key" ON "guides"("slug");

-- CreateIndex
CREATE INDEX "guides_status_idx" ON "guides"("status");

-- CreateIndex
CREATE INDEX "guides_category_idx" ON "guides"("category");

-- CreateIndex
CREATE INDEX "guides_slug_idx" ON "guides"("slug");

-- CreateTable: checklists
CREATE TABLE "checklists" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT,
    "steps" JSONB NOT NULL,
    "relatedTools" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "relatedTaskChain" TEXT,
    "relatedGuides" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "relatedTopics" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" TEXT NOT NULL DEFAULT 'draft',
    "coverImage" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "canonicalUrl" TEXT,
    "robots" TEXT NOT NULL DEFAULT 'index,follow',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "checklists_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "checklists_slug_key" ON "checklists"("slug");

-- CreateIndex
CREATE INDEX "checklists_status_idx" ON "checklists"("status");

-- CreateIndex
CREATE INDEX "checklists_slug_idx" ON "checklists"("slug");
