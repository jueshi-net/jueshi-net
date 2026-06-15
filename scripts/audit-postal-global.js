require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.production') });
if (!process.env.DATABASE_URL) require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

(async () => {
  if (!process.env.DATABASE_URL) { console.error('DATABASE_URL not set'); process.exit(1); }
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();

  // 1. All countries in DB with counts
  const byCountry = await c.query(`
    SELECT "countryCode", country, COUNT(*)::int as cnt
    FROM postal_codes WHERE "isActive" = true
    GROUP BY "countryCode", country
    ORDER BY cnt DESC
  `);

  // 2. Field completeness per country
  const completeness = await c.query(`
    SELECT 
      "countryCode",
      COUNT(*)::int as total,
      SUM(CASE WHEN "postalCode" IS NOT NULL AND "postalCode" != '' THEN 1 ELSE 0 END)::int as has_postal,
      SUM(CASE WHEN city IS NOT NULL AND city != '' THEN 1 ELSE 0 END)::int as has_city,
      SUM(CASE WHEN province IS NOT NULL AND province != '' THEN 1 ELSE 0 END)::int as has_province,
      SUM(CASE WHEN "adminName1" IS NOT NULL AND "adminName1" != '' THEN 1 ELSE 0 END)::int as has_admin1,
      SUM(CASE WHEN district IS NOT NULL AND district != '' THEN 1 ELSE 0 END)::int as has_district,
      SUM(CASE WHEN "areaName" IS NOT NULL AND "areaName" != '' THEN 1 ELSE 0 END)::int as has_area,
      SUM(CASE WHEN latitude IS NOT NULL THEN 1 ELSE 0 END)::int as has_lat,
      SUM(CASE WHEN longitude IS NOT NULL THEN 1 ELSE 0 END)::int as has_lon,
      SUM(CASE WHEN source IS NOT NULL AND source != '' THEN 1 ELSE 0 END)::int as has_source,
      MIN("createdAt")::text as earliest,
      MAX("createdAt")::text as latest
    FROM postal_codes WHERE "isActive" = true
    GROUP BY "countryCode"
    ORDER BY total DESC
  `);

  // 3. Source distribution
  const sources = await c.query(`
    SELECT source, COUNT(*)::int as cnt FROM postal_codes WHERE "isActive" = true
    GROUP BY source ORDER BY cnt DESC LIMIT 10
  `);

  // 4. Sample records for key Asian countries
  const asianCountries = ['VN','TH','PH','ID','HK','TW','SG','KR','IN','MY','JP','AE','SA'];
  const samples = {};
  for (const cc of asianCountries) {
    const r = await c.query(`
      SELECT "postalCode", city, province, "adminName1", "adminCode1", district, latitude, longitude, source
      FROM postal_codes WHERE "countryCode" = $1 AND "isActive" = true LIMIT 3
    `, [cc]);
    samples[cc] = r.rows;
  }

  // 5. Total
  const total = await c.query(`SELECT COUNT(*)::int as cnt FROM postal_codes WHERE "isActive" = true`);

  const result = {
    totalRecords: total.rows[0].cnt,
    dbCountries: byCountry.rows.length,
    byCountry: byCountry.rows,
    completeness: completeness.rows,
    sources: sources.rows,
    asianSamples: samples,
  };

  const outPath = path.join(__dirname, '..', 'reports', 'product-enhancement', 'postal-code-coverage-audit.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2));
  console.log('Written to', outPath);
  console.log('Total records:', result.totalRecords);
  console.log('DB countries:', result.dbCountries);
  console.log('\n=== By country (top 40) ===');
  byCountry.rows.slice(0, 40).forEach(r => console.log(`  ${r.countryCode} (${r.country}): ${r.cnt.toLocaleString()}`));
  console.log('\n=== Sources ===');
  sources.rows.forEach(r => console.log(`  ${r.source}: ${r.cnt.toLocaleString()}`));
  console.log('\n=== Asian samples ===');
  for (const [cc, rows] of Object.entries(samples)) {
    console.log(`  ${cc}: ${rows.length} rows`);
    rows.forEach(r => console.log(`    ${r.postalCode} | ${r.city} | ${r.province} | ${r.adminName1}`));
  }

  await c.end();
})().catch(e => { console.error(e.message); process.exit(1); });
