-- CreateTable: v1.20.42.13.3 Ad Entitlement Application
CREATE TABLE "ad_applications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "reward_grant_id" TEXT,
    "placement_key" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "material_url" TEXT,
    "material_type" TEXT NOT NULL DEFAULT 'image',
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "review_note" TEXT,
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ad_applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ad_applications_user_id_idx" ON "ad_applications"("user_id");
CREATE INDEX "ad_applications_status_idx" ON "ad_applications"("status");
CREATE INDEX "ad_applications_placement_key_idx" ON "ad_applications"("placement_key");

-- AddForeignKey
ALTER TABLE "ad_applications" ADD CONSTRAINT "ad_applications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ad_applications" ADD CONSTRAINT "ad_applications_reward_grant_id_fkey" FOREIGN KEY ("reward_grant_id") REFERENCES "reward_grants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
