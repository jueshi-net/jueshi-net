-- CreateTable
CREATE TABLE "product_items" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT,
    "description" TEXT,
    "hs_code" TEXT,
    "unit" TEXT DEFAULT 'PCS',
    "unit_price" DECIMAL(12,2),
    "currency" TEXT DEFAULT 'USD',
    "net_weight" DECIMAL(10,3),
    "gross_weight" DECIMAL(10,3),
    "length" DECIMAL(10,2),
    "width" DECIMAL(10,2),
    "height" DECIMAL(10,2),
    "origin_country" TEXT,
    "material" TEXT,
    "usage" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "product_items_user_id_idx" ON "product_items"("user_id");

-- CreateIndex
CREATE INDEX "product_items_user_id_is_active_idx" ON "product_items"("user_id", "is_active");

-- CreateIndex
CREATE INDEX "product_items_user_id_name_idx" ON "product_items"("user_id", "name");

-- AddForeignKey
ALTER TABLE "product_items" ADD CONSTRAINT "product_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
