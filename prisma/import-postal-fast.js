const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const DB_URL = 'postgresql://neondb_owner:npg_eL9DhSpQHZ5a@ep-morning-sun-amgb7w40-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require';

function generateId() {
  const t = Date.now().toString(36);
  const r = Math.random().toString(36).substring(2, 9);
  return 'p' + t.substring(t.length - 6) + r;
}

async function main() {
  const filePath = path.join(process.cwd(), 'data', 'allCountries.txt');
  const fileSize = (fs.statSync(filePath).size / 1024 / 1024).toFixed(1);
  console.log(`🌍 Fast postal code import (${fileSize} MB)`);
  
  const client = new Client({ connectionString: DB_URL });
  await client.connect();
  console.log('✅ Connected to PostgreSQL');
  
  // Read entire file into memory (134MB is fine)
  const startRead = Date.now();
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  console.log(`📄 Read ${lines.length.toLocaleString()} lines in ${(Date.now() - startRead) / 1000}s`);
  
  const BATCH_SIZE = 5000;
  let imported = 0;
  let skipped = 0;
  let total = 0;
  const startTime = Date.now();
  
  for (let i = 0; i < lines.length; i += BATCH_SIZE) {
    const batch = [];
    const end = Math.min(i + BATCH_SIZE, lines.length);
    
    for (let j = i; j < end; j++) {
      const line = lines[j];
      if (!line) continue;
      total++;
      
      const parts = line.split('\t');
      if (parts.length < 3) { skipped++; continue; }
      
      const [cc, pc, place, a1, a2] = parts;
      if (!cc?.trim() || !pc?.trim()) { skipped++; continue; }
      
      batch.push([
        generateId(),
        cc.trim(), cc.trim(), pc.trim(),
        (place?.trim() || ''),
        (a1?.trim() || ''),
        (a2?.trim() || '')
      ]);
    }
    
    if (batch.length === 0) continue;
    
    const placeholders = batch.map((_, idx) => {
      const o = idx * 7;
      return `($${o+1}, $${o+2}, $${o+3}, $${o+4}, $${o+5}, $${o+6}, $${o+7}, true, NOW(), NOW())`;
    }).join(',');
    
    const params = batch.flat();
    
    try {
      await client.query(
        `INSERT INTO postal_codes 
        (id, "countryCode", country, "postalCode", city, province, district, "isActive", "createdAt", "updatedAt")
        VALUES ${placeholders}
        ON CONFLICT ("country", "postalCode") DO NOTHING`,
        params
      );
      imported += batch.length;
    } catch (e) {
      // Retry one by one for this batch
      let batchImported = 0;
      for (const row of batch) {
        try {
          await client.query(
            `INSERT INTO postal_codes 
            (id, "countryCode", country, "postalCode", city, province, district, "isActive", "createdAt", "updatedAt")
            VALUES ($1,$2,$3,$4,$5,$6,$7, true, NOW(), NOW())
            ON CONFLICT ("country", "postalCode") DO NOTHING`,
            row
          );
          batchImported++;
        } catch { skipped++; }
      }
      imported += batchImported;
    }
    
    if (total % 500000 === 0) {
      const elapsed = (Date.now() - startTime) / 1000;
      const rate = total / elapsed;
      console.log(`📊 ${total.toLocaleString()} processed | ${imported.toLocaleString()} imported | ${skipped.toLocaleString()} skipped | ${rate.toFixed(0)}/s`);
    }
  }
  
  await client.end();
  const elapsed = (Date.now() - startTime) / 1000;
  console.log(`\n🎉 Import complete!`);
  console.log(`✅ Imported: ${imported.toLocaleString()}`);
  console.log(`📊 Processed: ${total.toLocaleString()}`);
  console.log(`⏭️  Skipped: ${skipped.toLocaleString()}`);
  console.log(`⏱️  Time: ${elapsed.toFixed(1)}s (${(total/elapsed).toFixed(0)} lines/s)`);
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
