-- AlterTable
ALTER TABLE "postal_codes" ADD COLUMN "normalizedPostalCode" TEXT;

-- CreateIndex
CREATE INDEX "postal_codes_normalized_postal_code_idx" ON "postal_codes"("normalizedPostalCode");

-- CreateIndex
CREATE INDEX "postal_codes_country_code_normalized_postal_code_idx" ON "postal_codes"("countryCode", "normalizedPostalCode");
