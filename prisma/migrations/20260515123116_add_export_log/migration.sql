-- CreateTable
CREATE TABLE "export_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "exportType" TEXT NOT NULL,
    "documentType" TEXT,
    "ipHash" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "export_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "export_logs_userId_idx" ON "export_logs"("userId");

-- CreateIndex
CREATE INDEX "export_logs_exportType_idx" ON "export_logs"("exportType");

-- CreateIndex
CREATE INDEX "export_logs_createdAt_idx" ON "export_logs"("createdAt");
