-- v1.20.32: Document Tools Foundation
-- 4 new tables: user_company_profiles, user_company_profile_history, tool_document_drafts, tool_document_history
-- Non-destructive: IF NOT EXISTS, no DROP, no ALTER on existing tables

CREATE TABLE IF NOT EXISTS "user_company_profiles" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "profile_name" TEXT NOT NULL,
  "company_name" TEXT NOT NULL,
  "company_name_en" TEXT,
  "contact_name" TEXT,
  "phone" TEXT,
  "email" TEXT,
  "website" TEXT,
  "address" TEXT,
  "city_postal" TEXT,
  "tax_id" TEXT,
  "bank_cny_info" TEXT,
  "bank_usd_info" TEXT,
  "default_currency" TEXT NOT NULL DEFAULT 'USD',
  "logo_data_url" TEXT,
  "logo_text" TEXT,
  "is_default" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "user_company_profiles_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "user_company_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "user_company_profiles_userId_idx" ON "user_company_profiles"("user_id");
CREATE INDEX IF NOT EXISTS "user_company_profiles_isDefault_idx" ON "user_company_profiles"("is_default");

CREATE TABLE IF NOT EXISTS "user_company_profile_history" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "profile_id" TEXT NOT NULL,
  "snapshot_json" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "user_company_profile_history_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "user_company_profile_history_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "user_company_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "user_company_profile_history_profileId_idx" ON "user_company_profile_history"("profile_id");
CREATE INDEX IF NOT EXISTS "user_company_profile_history_userId_idx" ON "user_company_profile_history"("user_id");

CREATE TABLE IF NOT EXISTS "tool_document_drafts" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "company_profile_id" TEXT,
  "tool_key" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "data_json" TEXT NOT NULL,
  "preview_json" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "tool_document_drafts_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "tool_document_drafts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "tool_document_drafts_companyProfileId_fkey" FOREIGN KEY ("company_profile_id") REFERENCES "user_company_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "tool_document_drafts_userId_idx" ON "tool_document_drafts"("user_id");
CREATE INDEX IF NOT EXISTS "tool_document_drafts_toolKey_idx" ON "tool_document_drafts"("tool_key");
CREATE INDEX IF NOT EXISTS "tool_document_drafts_companyProfileId_idx" ON "tool_document_drafts"("company_profile_id");

CREATE TABLE IF NOT EXISTS "tool_document_history" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "document_id" TEXT NOT NULL,
  "snapshot_json" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "tool_document_history_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "tool_document_history_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "tool_document_drafts"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "tool_document_history_documentId_idx" ON "tool_document_history"("document_id");
CREATE INDEX IF NOT EXISTS "tool_document_history_userId_idx" ON "tool_document_history"("user_id");
