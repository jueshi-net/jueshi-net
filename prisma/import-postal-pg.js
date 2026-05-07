/**
 * Import global postal codes from GeoNames allCountries.txt to PostgreSQL
 */
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const { createInterface } = require('readline');

// Force stdout to be unbuffered
process.stdout._handle.setBlocking(true);

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_eL9DhSpQHZ5a@ep-morning-sun-amgb7w40-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require'
});

async function main() {
  await client.connect();
  
  const filePath = path.join(process.cwd(), 'data', 'allCountries.txt');
  console.log('🌍 Starting global postal code import to PostgreSQL...');
  console.log('📁 File:', filePath);
  console.log('📊 File size:', (fs.statSync(filePath).size / 1024 / 1024).toFixed(1), 'MB');
  
  const rl = createInterface({ 
    input: fs.createReadStream(filePath), 
    crlfDelay: Infinity 
  });

  let batch = [];
  let imported = 0;
  let skipped = 0;
  let total = 0;
  const batchSize = 500;

  for await (const line of rl) {
    if (!line.trim()) continue;
    total++;
    
    const parts = line.split('\t');
    if (parts.length < 3) { skipped++; continue; }
    
    const [countryCode, postalCode, placeName, admin1, admin2, admin3, admin4] = parts;
    
    // Skip if essential fields are empty
    if (!postalCode?.trim() || !countryCode?.trim()) {
      skipped++;
      continue;
    }

    const id = 'pm' + Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
    
    // Ensure all NOT NULL fields have values
    batch.push([
      id,
      countryCode.trim(),
      countryCode.trim(), // country (same as code for simplicity)
      postalCode.trim(),
      placeName?.trim() || '',
      admin1?.trim() || '',
      admin2?.trim() || ''
    ]);

    if (batch.length >= batchSize) {
      const result = await insertBatch(batch);
      imported += result;
      batch = [];
      if (total % 200000 === 0) {
        console.log(`📊 Processed: ${total.toLocaleString()}, Imported: ${imported.toLocaleString()}, Skipped: ${skipped.toLocaleString()}`);
      }
    }
  }

  // Insert remaining
  if (batch.length > 0) {
    imported += await insertBatch(batch);
  }

  console.log(`\n🎉 Import complete!`);
  console.log(`✅ Total imported: ${imported.toLocaleString()}`);
  console.log(`📊 Total processed: ${total.toLocaleString()}`);
  console.log(`⏭️  Skipped: ${skipped.toLocaleString()}`);
  
  await client.end();
}

async function insertBatch(records) {
  // Filter out records with empty required fields
  const valid = records.filter(r => r[1] && r[2]); // countryCode and postalCode
  
  if (valid.length === 0) return 0;
  
  const values = valid.map((_, i) => {
    const o = i * 7;
    return `($${o+1}, $${o+2}, $${o+3}, $${o+4}, $${o+5}, $${o+6}, $${o+7}, true, NOW(), NOW())`;
  }).join(',');
  
  const params = valid.flatMap(r => r);
  
  try {
    const result = await client.query(
      `INSERT INTO postal_codes (id, "countryCode", country, "postalCode", city, province, district, "isActive", "createdAt", "updatedAt") 
       VALUES ${values} 
       ON CONFLICT ("country", "postalCode") DO NOTHING`,
      params
    );
    return valid.length;
  } catch (e) {
    // Log first error only
    if (e.message.includes('null value')) {
      return 0;
    }
    console.error('Error:', e.message.slice(0, 200));
    return 0;
  }
}

main().catch(e => {
  console.error('Fatal error:', e.message);
  process.exit(1);
});
