-- Add ai usage logs table
CREATE TABLE "ai_usage_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "toolType" TEXT NOT NULL,
    "inputHash" TEXT,
    "outputTokens" INTEGER,
    "costPoints" INTEGER NOT NULL DEFAULT 0,
    "ipHash" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_usage_logs_pkey" PRIMARY KEY ("id")
);

-- Add indexes
CREATE INDEX "ai_usage_logs_userId_idx" ON "ai_usage_logs"("userId");
CREATE INDEX "ai_usage_logs_toolType_idx" ON "ai_usage_logs"("toolType");
CREATE INDEX "ai_usage_logs_createdAt_idx" ON "ai_usage_logs"("createdAt");

-- Add aiUsageLogs relation to users (foreign key with ON DELETE SET NULL)
ALTER TABLE "ai_usage_logs" ADD CONSTRAINT "ai_usage_logs_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
