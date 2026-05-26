#!/bin/bash
# Fast postal code import — runs on VPS directly
set -e

INPUT="data/allCountries.txt"
TSV="/tmp/postal_clean.tsv"
SQL="/tmp/postal_import.sql"

if [ ! -f "$INPUT" ]; then
    echo "❌ $INPUT not found"
    exit 1
fi

echo "🌍 Starting global postal code import..."
T0=$(date +%s)

echo "📊 Transforming GeoNames data..."
awk -F'\t' -v OFS='\t' '{
    cc=$1; pc=$2; place=$3; a1=$4; a2=$5; a1c=$8; a2c=$9; lat=$10; lng=$11; acc=$12;
    if (length(pc)<2 || length(pc)>20 || length(cc)<1) next;
    norm=pc; gsub(/ /,"",norm); gsub("-","",norm);
    p=(place=="" ? "\\N" : place);
    s1=(a1=="" ? "\\N" : a1);
    s2=(a2=="" ? "\\N" : a2);
    c1=(a1c=="" ? "\\N" : a1c);
    c2=(a2c=="" ? "\\N" : a2c);
    lt=(lat=="" ? "\\N" : lat+0);
    lg=(lng=="" ? "\\N" : lng+0);
    ac=(acc=="" ? "\\N" : acc+0);
    print cc, pc, norm, p, s1, s2, c1, c2, lt, lg, ac;
}' "$INPUT" > "$TSV"

CLEAN=$(wc -l < "$TSV" | tr -d ' ')
echo "✅ Transformed: $CLEAN records"

# Write SQL script
cat > "$SQL" << 'EOSQL'
DROP TABLE IF EXISTS tmp_postal_import;
CREATE TEMP TABLE tmp_postal_import (
    "countryCode" TEXT,
    "postalCode" TEXT,
    "normalizedPostalCode" TEXT,
    "city" TEXT,
    "province" TEXT,
    "district" TEXT,
    "adminCode1" TEXT,
    "adminCode2" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "accuracy" INTEGER
);

\copy tmp_postal_import FROM '/tmp/postal_clean.tsv' WITH (FORMAT text, NULL '\N')

INSERT INTO postal_codes (
    id, "countryCode", "country", "postalCode", "normalizedPostalCode",
    "city", "province", "district", "adminCode1", "adminCode2",
    "latitude", "longitude", "accuracy",
    "isActive", "source", "sourceUrl", "sourceVersion", "createdAt", "updatedAt"
)
SELECT 
    gen_random_uuid(), t."countryCode", t."countryCode",
    t."postalCode", t."normalizedPostalCode",
    t."city", t."province", t."district", t."adminCode1", t."adminCode2",
    t."latitude", t."longitude", t."accuracy"::integer,
    true, 'GeoNames', 'https://download.geonames.org/export/zip/', '2026-05-21', NOW(), NOW()
FROM tmp_postal_import t
ON CONFLICT ("countryCode", "postalCode") DO NOTHING;

SELECT COUNT(*) AS total_active FROM postal_codes WHERE "isActive" = true;
SELECT COUNT(DISTINCT "countryCode") AS countries FROM postal_codes WHERE "isActive" = true;
SELECT "countryCode", COUNT(*) as count FROM postal_codes WHERE "isActive" = true GROUP BY "countryCode" ORDER BY count DESC LIMIT 20;
EOSQL

echo "⏳ Loading into PostgreSQL via COPY..."
PGPASSWORD='Bxb2024!Prod@Secure' psql "host=127.0.0.1 user=bxb_user dbname=bxb_prod sslmode=disable" -f "$SQL"

ELAPSED=$(( $(date +%s) - T0 ))
echo ""
echo "⏱️  Total time: ${ELAPSED}s"

rm -f "$TSV" "$SQL"
echo "✅ Done!"
