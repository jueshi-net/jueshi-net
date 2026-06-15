require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.production') });
// Fallback to .env if .env.production doesn't exist
if (!process.env.DATABASE_URL) {
  require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
}

const { Client } = require('pg');

(async () => {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }
  
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();
  
  // MY and VN counts
  const r1 = await c.query(
    `SELECT "countryCode", COUNT(*)::int as cnt FROM postal_codes WHERE "isActive" = true AND "countryCode" IN ($1, $2) GROUP BY "countryCode"`,
    ['MY', 'VN']
  );
  console.log('MY/VN counts:', JSON.stringify(r1.rows));
  
  // Malaysia sample
  const r2 = await c.query(
    `SELECT "postalCode", city, province, "adminName1", "adminCode1", country FROM postal_codes WHERE "countryCode" = $1 AND "isActive" = true LIMIT 5`,
    ['MY']
  );
  console.log('MY sample:', JSON.stringify(r2.rows));
  
  // Vietnam sample
  const r3 = await c.query(
    `SELECT "postalCode", city, province, "adminName1", "adminCode1", country FROM postal_codes WHERE "countryCode" = $1 AND "isActive" = true LIMIT 5`,
    ['VN']
  );
  console.log('VN sample:', JSON.stringify(r3.rows));
  
  // Alt search for Vietnam/Malaysia by country name
  const r4 = await c.query(
    `SELECT "countryCode", country, COUNT(*)::int as cnt FROM postal_codes WHERE country ILIKE $1 OR country ILIKE $2 GROUP BY "countryCode", country`,
    ['%vietnam%', '%malaysia%']
  );
  console.log('Alt search:', JSON.stringify(r4.rows));
  
  // Total records
  const r5 = await c.query(`SELECT COUNT(*)::int as cnt FROM postal_codes WHERE "isActive" = true`);
  console.log('Total active:', r5.rows[0].cnt);
  
  // MY with state/province
  const r6 = await c.query(
    `SELECT COUNT(*)::int as cnt FROM postal_codes WHERE "countryCode" = $1 AND "isActive" = true AND (province IS NOT NULL AND province != '' OR "adminName1" IS NOT NULL AND "adminName1" != '')`,
    ['MY']
  );
  console.log('MY with state:', r6.rows[0].cnt);
  
  await c.end();
})().catch(e => { console.error(e.message); process.exit(1); });
