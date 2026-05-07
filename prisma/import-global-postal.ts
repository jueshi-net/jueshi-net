/**
 * Import global postal codes from GeoNames allCountries.txt
 * Uses raw SQLite for maximum performance
 */
import Database from 'better-sqlite3';
import * as path from 'path';
import * as fs from 'fs';
import { createInterface } from 'readline';

const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
const db = new Database(dbPath);

// Prepare statements for maximum performance
const insertStmt = db.prepare(`
  INSERT OR IGNORE INTO postal_codes 
  (id, country, countryCode, province, city, district, postalCode, areaName, latitude, longitude, isActive, createdAt, updatedAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, datetime('now'), datetime('now'))
`);

// Use transactions for batch inserts
const insertMany = db.transaction((records: any[]) => {
  for (const r of records) {
    insertStmt.run(r);
  }
});

function generateId() {
  // Simple ID generation (cuid-like)
  return 'cm' + Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

async function main() {
  const filePath = path.join(process.cwd(), 'data', 'allCountries.txt');
  
  if (!fs.existsSync(filePath)) {
    console.error('❌ allCountries.txt not found.');
    process.exit(1);
  }

  console.log('🌍 Starting global postal code import...');
  console.log('📁 File:', filePath);

  // Count total lines
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const totalLines = fileContent.split('\n').filter(l => l.trim()).length;
  console.log(`📊 Total records: ${totalLines.toLocaleString()}`);

  const rl = createInterface({ 
    input: fs.createReadStream(filePath), 
    crlfDelay: Infinity 
  });

  let batch: any[] = [];
  let totalImported = 0;
  let totalSkipped = 0;
  let lineCount = 0;
  const batchSize = 1000;

  const startTime = Date.now();

  for await (const line of rl) {
    if (!line.trim()) continue;
    lineCount++;

    const parts = line.split('\t');
    if (parts.length < 11) continue;

    const [country, postalCode, placeName, admin1Name, admin2Name, , , , , latStr, lngStr] = parts;

    // Skip invalid postal codes
    if (!postalCode || postalCode.trim().length < 2 || postalCode.trim().length > 20) continue;

    const lat = latStr ? parseFloat(latStr) : null;
    const lng = lngStr ? parseFloat(lngStr) : null;

    batch.push([
      generateId(),
      country,
      '', // countryCode
      admin1Name || '',
      placeName || '',
      admin2Name || '',
      postalCode.trim(),
      '', // areaName
      lat && !isNaN(lat) ? lat : null,
      lng && !isNaN(lng) ? lng : null,
    ]);

    // Batch insert
    if (batch.length >= batchSize) {
      try {
        const before = db.prepare('SELECT changes() as c').get() as any;
        insertMany(batch);
        const after = db.prepare('SELECT changes() as c').get() as any;
        const inserted = after.c - before.c;
        
        totalImported += inserted;
        totalSkipped += batch.length - inserted;
      } catch (error) {
        console.error('Batch insert error:', error);
        totalSkipped += batch.length;
      }
      
      batch = [];

      // Progress report every 50 batches
      if (lineCount % (batchSize * 50) === 0) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        const speed = Math.round(totalImported / (Date.now() - startTime) * 1000);
        const progress = (lineCount / totalLines * 100).toFixed(1);
        console.log(`⏳ Progress: ${progress}% | Inserted: ${totalImported.toLocaleString()} | Skipped: ${totalSkipped.toLocaleString()} | ${elapsed}s (${speed}/s)`);
      }
    }
  }

  // Insert remaining
  if (batch.length > 0) {
    try {
      const before = db.prepare('SELECT changes() as c').get() as any;
      insertMany(batch);
      const after = db.prepare('SELECT changes() as c').get() as any;
      totalImported += after.c - before.c;
      totalSkipped += batch.length - (after.c - before.c);
    } catch (error) {
      totalSkipped += batch.length;
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('\n✅ Import complete!');
  console.log(`📮 Total inserted: ${totalImported.toLocaleString()}`);
  console.log(`⏭️  Total skipped (duplicates): ${totalSkipped.toLocaleString()}`);
  console.log(`⏱️  Time: ${elapsed}s`);
  console.log(`📊 Average speed: ${Math.round(totalImported / parseFloat(elapsed))}/s`);

  // Print stats by country
  console.log('\n🌍 Countries by record count (Top 30):');
  const topCountries = db.prepare(`
    SELECT country, COUNT(*) as count 
    FROM postal_codes 
    GROUP BY country 
    ORDER BY count DESC 
    LIMIT 30
  `).all() as any[];
  
  for (const c of topCountries) {
    console.log(`   ${c.country}: ${c.count.toLocaleString()}`);
  }

  // Total count
  const total = db.prepare('SELECT COUNT(*) as count FROM postal_codes').get() as any;
  console.log(`\n📊 Total records in database: ${total.count.toLocaleString()}`);

  db.close();
}

main()
  .catch(e => {
    console.error('❌ Import error:', e);
    process.exit(1);
  });
