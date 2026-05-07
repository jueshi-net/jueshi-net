#!/bin/bash
# Fast postal code import using awk + PostgreSQL COPY
# Processes 1.8M lines in ~30 seconds

set -e

FILE="$HOME/projects/xixiong-saas/data/allCountries.txt"
TMPFILE="/tmp/postal_codes_import.tsv"

echo "🌍 Fast postal code import via COPY..."
echo "📁 Processing $FILE..."

# Step 1: Use awk to preprocess - extract fields, add tab-separated id placeholders
# GeoNames format: countryCode|postalCode|placeName|admin1|admin2|admin3|admin4
# We'll generate UUIDs in SQL later
awk -F'\t' '
BEGIN { OFS="\t" }
{
  cc = $1; pc = $2; place = $3; a1 = $4; a2 = $5
  if (cc == "" || pc == "") next
  # Output: countryCode, country, postalCode, city, province, district
  print cc, cc, pc, (place ? place : ""), (a1 ? a1 : ""), (a2 ? a2 : "")
}
' "$FILE" > "$TMPFILE"

TOTAL=$(wc -l < "$TMPFILE")
echo "📊 Preprocessed $TOTAL records"

# Step 2: Create temp table and COPY
DB_URL="postgresql://neondb_owner:npg_eL9DhSpQHZ5a@ep-morning-sun-amgb7w40-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require"

psql "$DB_URL" <<'SQL'
-- Create temp table for bulk load
CREATE TEMP TABLE tmp_postal (
    countryCode TEXT,
    country TEXT,
    postalCode TEXT,
    city TEXT,
    province TEXT,
    district TEXT
) ON COMMIT DROP;
SQL

echo "📤 Copying data to PostgreSQL..."
psql "$DB_URL" -c "
CREATE TEMP TABLE tmp_postal (
    countryCode TEXT, country TEXT, postalCode TEXT,
    city TEXT, province TEXT, district TEXT
) ON COMMIT DROP;

COPY tmp_postal (countryCode, country, postalCode, city, province, district)
FROM STDIN WITH (FORMAT text, DELIMITER E'\t');

-- Insert into main table with generated IDs
INSERT INTO postal_codes 
(id, \"countryCode\", country, \"postalCode\", city, province, district, \"isActive\", \"createdAt\", \"updatedAt\")
SELECT 
    'p' || substr(md5(countryCode || postalCode || random()::text), 1, 15),
    countryCode, country, postalCode, city, province, district,
    true, NOW(), NOW()
FROM tmp_postal
ON CONFLICT (\"country\", \"postalCode\") DO NOTHING;

SELECT COUNT(*) as total_in_temp FROM tmp_postal;
" < "$TMPFILE"

rm -f "$TMPFILE"
echo "✅ Import complete!"
