/**
 * Fast global postal code import using awk + psql COPY
 * Step 1: awk transforms GeoNames → clean TSV
 * Step 2: psql COPY loads TSV into temp table
 * Step 3: INSERT INTO postal_codes with UUID generation
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const INPUT = path.join(process.cwd(), 'data', 'allCountries.txt');
const TSV = '/tmp/postal_clean.tsv';

if (!fs.existsSync(INPUT)) {
  console.error('❌ data/allCountries.txt not found');
  process.exit(1);
}

console.log('🌍 Starting global postal code import...');
const t0 = Date.now();

// Step 1: awk transform
console.log('📊 Transforming GeoNames data...');
const awkCmd = `awk -F'\\t' -v OFS='\\t' '{
  cc=$1; pc=$2; place=$3; a1=$4; a2=$5; a1c=$8; a2c=$9; lat=$10; lng=$11; acc=$12;
  if (length(pc)<2 || length(pc)>20 || length(cc)<1) next;
  norm=pc; gsub(/ /,"",norm); gsub("-","",norm);
  p=(place=="" ? "\\\\N" : place);
  s1=(a1=="" ? "\\\\N" : a1);
  s2=(a2=="" ? "\\\\N" : a2);
  c1=(a1c=="" ? "\\\\N" : a1c);
  c2=(a2c=="" ? "\\\\N" : a2c);
  lt=(lat=="" ? "\\\\N" : lat+0);
  lg=(lng=="" ? "\\\\N" : lng+0);
  ac=(acc=="" ? "\\\\N" : acc+0);
  print cc, pc, norm, p, s1, s2, c1, c2, lt, lg, ac;
}' "${INPUT}" > "${TSV}"`;

execSync(awkCmd, { stdio: 'inherit' });

const cleanCount = parseInt(execSync(`wc -l < ${TSV}`).toString().trim());
console.log(`✅ Transformed: ${cleanCount.toLocaleString()} records`);

// Step 2: psql COPY
console.log('\n⏳ Loading into PostgreSQL...');

// Run the entire import as a single psql script
const sql = `
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

\\copy tmp_postal_import FROM '${TSV}' WITH (FORMAT text, NULL '\\N')

INSERT INTO postal_codes (
    id, "countryCode", "country", "postalCode", "normalizedPostalCode",
    "city", "province", "district", "adminCode1", "adminCode2",
    "latitude", "longitude", "accuracy",
    "isActive", "source", "sourceUrl", "sourceVersion", "createdAt", "updatedAt"
)
SELECT 
    gen_random_uuid(), t.*, t."countryCode",
    true, 'GeoNames', 'https://download.geonames.org/export/zip/', '2026-05-21', NOW(), NOW()
FROM tmp_postal_import t
ON CONFLICT ("countryCode", "postalCode") DO NOTHING;

-- Stats
SELECT COUNT(*) AS total_active FROM postal_codes WHERE "isActive" = true;
SELECT COUNT(DISTINCT "countryCode") AS countries FROM postal_codes WHERE "isActive" = true;

SELECT "countryCode", COUNT(*) as count 
FROM postal_codes WHERE "isActive" = true
GROUP BY "countryCode" ORDER BY count DESC LIMIT 20;
`;

// Write SQL to temp file to avoid escaping issues
const sqlFile = '/tmp/postal_import.sql';
fs.writeFileSync(sqlFile, sql);

// Use psql with the connection string from .env
const connStr = 'postgresql://bxb_user:Bxb2024!Prod%40Secure@127.0.0.1:5432/bxb_prod?schema=public';
execSync(`psql "${connStr}" -f ${sqlFile}`, { stdio: 'inherit' });

const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
console.log(`\n⏱️  Total time: ${elapsed}s`);

// Cleanup
execSync(`rm -f ${TSV} ${sqlFile}`);
console.log('✅ Done!');
