-- CreateTable
CREATE TABLE "ad_creatives" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "creative_type" TEXT NOT NULL,
    "image_url" TEXT,
    "target_url" TEXT,
    "code_snippet" TEXT,
    "headline" TEXT,
    "body_text" TEXT,
    "cta_text" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ad_creatives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ad_events" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "placement_key" TEXT NOT NULL,
    "creative_id" TEXT,
    "event_type" TEXT NOT NULL,
    "page_type" TEXT,
    "page_path" TEXT,
    "user_id" TEXT,
    "session_id" TEXT,
    "country" TEXT,
    "device" TEXT,
    "referrer" TEXT,
    "ip_hash" TEXT,
    "user_agent_hash" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ad_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ad_creatives_campaign_id_idx" ON "ad_creatives"("campaign_id");

-- CreateIndex
CREATE INDEX "ad_creatives_is_active_idx" ON "ad_creatives"("is_active");

-- CreateIndex
CREATE INDEX "ad_events_campaign_id_created_at_idx" ON "ad_events"("campaign_id", "created_at");

-- CreateIndex
CREATE INDEX "ad_events_placement_key_event_type_created_at_idx" ON "ad_events"("placement_key", "event_type", "created_at");

-- CreateIndex
CREATE INDEX "ad_events_user_id_created_at_idx" ON "ad_events"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "ad_events_created_at_idx" ON "ad_events"("created_at");
