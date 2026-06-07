-- CreateTable
CREATE TABLE "homepage_configs" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "valueJson" JSONB NOT NULL,
    "updated_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "homepage_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "homepage_configs_key_key" ON "homepage_configs"("key");

-- CreateTable
CREATE TABLE "tool_metric_dailies" (
    "id" TEXT NOT NULL,
    "tool_slug" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "saves" INTEGER NOT NULL DEFAULT 0,
    "favorites" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "tool_metric_dailies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tool_metric_dailies_tool_slug_date_key" ON "tool_metric_dailies"("tool_slug", "date");

-- CreateIndex
CREATE INDEX "tool_metric_dailies_tool_slug_idx" ON "tool_metric_dailies"("tool_slug");

-- CreateIndex
CREATE INDEX "tool_metric_dailies_date_idx" ON "tool_metric_dailies"("date");
