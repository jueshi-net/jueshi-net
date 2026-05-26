-- Add profile_type to users table
ALTER TABLE "users" ADD COLUMN "profile_type" TEXT;

-- Create workbench_links table
CREATE TABLE "workbench_links" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "iconUrl" TEXT,
    "category" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workbench_links_pkey" PRIMARY KEY ("id")
);

-- Create index on userId for workbench_links
CREATE INDEX "workbench_links_userId_idx" ON "workbench_links"("userId");

-- Add foreign key for workbench_links
ALTER TABLE "workbench_links" ADD CONSTRAINT "workbench_links_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create tool_favorites table
CREATE TABLE "tool_favorites" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "toolKey" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tool_favorites_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint on (userId, toolKey)
CREATE UNIQUE INDEX "tool_favorites_userId_toolKey_key" ON "tool_favorites"("userId", "toolKey");

-- Create index on userId for tool_favorites
CREATE INDEX "tool_favorites_userId_idx" ON "tool_favorites"("userId");

-- Add foreign key for tool_favorites
ALTER TABLE "tool_favorites" ADD CONSTRAINT "tool_favorites_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
