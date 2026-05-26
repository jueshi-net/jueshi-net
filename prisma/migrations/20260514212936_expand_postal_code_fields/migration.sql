-- AlterTable
ALTER TABLE "postal_codes" ADD COLUMN "adminName1" TEXT;
ALTER TABLE "postal_codes" ADD COLUMN "adminCode1" TEXT;
ALTER TABLE "postal_codes" ADD COLUMN "adminName2" TEXT;
ALTER TABLE "postal_codes" ADD COLUMN "adminCode2" TEXT;
ALTER TABLE "postal_codes" ADD COLUMN "accuracy" INTEGER;
ALTER TABLE "postal_codes" ADD COLUMN "source" TEXT NOT NULL DEFAULT 'GeoNames';
ALTER TABLE "postal_codes" ADD COLUMN "sourceUrl" TEXT NOT NULL DEFAULT 'https://download.geonames.org/export/zip/';
ALTER TABLE "postal_codes" ADD COLUMN "sourceVersion" TEXT;

-- DropIndex (may already be gone)
DROP INDEX IF EXISTS "postal_codes_country_postalCode_key";

-- CreateIndex (use IF NOT EXISTS for safety)
CREATE UNIQUE INDEX IF NOT EXISTS "postal_codes_countryCode_postalCode_key" ON "postal_codes"("countryCode", "postalCode");
CREATE INDEX IF NOT EXISTS "postal_codes_postalCode_idx" ON "postal_codes"("postalCode");
CREATE INDEX IF NOT EXISTS "postal_codes_country_city_idx" ON "postal_codes"("country", "city");
CREATE INDEX IF NOT EXISTS "postal_codes_countryCode_postalCode_idx" ON "postal_codes"("countryCode", "postalCode");
CREATE INDEX IF NOT EXISTS "postal_codes_countryCode_city_idx" ON "postal_codes"("countryCode", "city");
CREATE INDEX IF NOT EXISTS "postal_codes_adminCode1_idx" ON "postal_codes"("adminCode1");
