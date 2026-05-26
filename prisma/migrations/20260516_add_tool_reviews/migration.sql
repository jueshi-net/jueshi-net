-- Add toolReviews relation to users (virtual, no column needed - Prisma handles it)

-- Create tool_reviews table
CREATE TABLE "tool_reviews" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "toolKey" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "pointsAwarded" BOOLEAN NOT NULL DEFAULT false,
    "ipHash" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tool_reviews_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint on (userId, toolKey)
CREATE UNIQUE INDEX "tool_reviews_userId_toolKey_key" ON "tool_reviews"("userId", "toolKey");

-- Create indexes
CREATE INDEX "tool_reviews_toolKey_idx" ON "tool_reviews"("toolKey");
CREATE INDEX "tool_reviews_status_idx" ON "tool_reviews"("status");
CREATE INDEX "tool_reviews_createdAt_idx" ON "tool_reviews"("createdAt");

-- Add foreign key
ALTER TABLE "tool_reviews" ADD CONSTRAINT "tool_reviews_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
