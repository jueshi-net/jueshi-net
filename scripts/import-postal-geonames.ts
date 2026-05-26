/**
 * Import postal codes from GeoNames for CA/US/UK/AU/NZ
 * Usage: npx tsx scripts/import-postal-geonames.ts
 * 
 * Data sources:
 * - https://download.geonames.org/export/zip/CA_full.csv.zip
 * - https://download.geonames.org/export/zip/GB_full.csv.zip  
 * - https://download.geonames.org/export/zip/allCountries.zip (filtered)
 */
import { PrismaClient } from '@prisma/client';
import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';
import * as zlib from 'zlib';

const prisma = new PrismaClient();
const DATA_DIR = path.join(process.cwd(), 'data', 'geonames');

async function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        https.get(res.headers.location!, (res2) => {
          res2.pipe(file);
          file.on('finish', () => { file.close(); resolve(); });
        }).on('error', reject);
      } else {
        res.pipe(file);
        file.on('finish', () => { file.close(); resolve(); });
      }
    }).on('error', reject);
  });
}

function unzip(zipPath: string, destPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(zipPath);
    const writeStream = fs.createWriteStream(destPath);
    readStream.pipe(zlib.createGunzip()).pipe(writeStream);
    writeStream.on('finish', resolve);
    readStream.on('error', reject);
  });
}

interface GeoNamesRecord {
  countryCode: string;
  postalCode: string;
  placeName: string;
  adminName1: string;
  adminCode1: string;
  adminName2: string;
  adminCode2: string;
  adminName3: string;
  adminCode3: string;
  latitude: number;
  longitude: number;
  accuracy: number;
}

function parseLine(line: string): GeoNamesRecord | null {
  const parts = line.split('\t');
  if (parts.length < 11) return null;
  
  const lat = parseFloat(parts[9]);
  const lng = parseFloat(parts[10]);
  const acc = parseInt(parts[11]) || 4;
  
  if (isNaN(lat) || isNaN(lng)) return null;
  
  return {
    countryCode: parts[0] || '',
    postalCode: parts[1] || '',
    placeName: parts[2] || '',
    adminName1: parts[3] || '',
    adminCode1: parts[4] || '',
    adminName2: parts[5] || '',
    adminCode2: parts[6] || '',
    adminName3: parts[7] || '',
    adminCode3: parts[8] || '',
    latitude: lat,
    longitude: lng,
    accuracy: acc,
  };
}

const countryNames: Record<string, string> = {
  CA: 'Canada',
  US: 'United States',
  GB: 'United Kingdom',
  AU: 'Australia',
  NZ: 'New Zealand',
};

async function importCountry(records: GeoNamesRecord[], countryCode: string) {
  const countryName = countryNames[countryCode] || countryCode;
  const version = new Date().toISOString().slice(0, 10);
  
  console.log(`  📦 ${countryName}: ${records.length} records`);
  
  let imported = 0;
  let skipped = 0;
  const batchSize = 500;
  
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    
    for (const r of batch) {
      try {
        await prisma.postalCode.upsert({
          where: {
            countryCode_postalCode: {
              countryCode: r.countryCode,
              postalCode: r.postalCode,
            },
          },
          create: {
            country: countryName,
            countryCode: r.countryCode,
            city: r.placeName,
            postalCode: r.postalCode,
            province: r.adminName1 || null,
            district: r.adminName2 || null,
            areaName: r.placeName,
            adminName1: r.adminName1 || null,
            adminCode1: r.adminCode1 || null,
            adminName2: r.adminName2 || null,
            adminCode2: r.adminCode2 || null,
            latitude: r.latitude,
            longitude: r.longitude,
            accuracy: r.accuracy,
            source: 'GeoNames',
            sourceUrl: 'https://download.geonames.org/export/zip/',
            sourceVersion: version,
          },
          update: {
            city: r.placeName,
            province: r.adminName1 || null,
            district: r.adminName2 || null,
            adminName1: r.adminName1 || null,
            adminCode1: r.adminCode1 || null,
            adminName2: r.adminName2 || null,
            adminCode2: r.adminCode2 || null,
            latitude: r.latitude,
            longitude: r.longitude,
            accuracy: r.accuracy,
            sourceVersion: version,
          },
        });
        imported++;
      } catch {
        skipped++;
      }
    }
    
    if ((i / batchSize) % 10 === 0) {
      process.stdout.write(`    Progress: ${Math.min(i + batchSize, records.length)}/${records.length}\r`);
    }
  }
  
  console.log(`    ✅ Imported: ${imported}, Skipped: ${skipped}`);
  return imported;
}

async function parseFile(filePath: string, countryCodes: string[]): Promise<Record<string, GeoNamesRecord[]>> {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(l => l.trim());
  
  const byCountry: Record<string, GeoNamesRecord[]> = {};
  
  for (const line of lines) {
    const record = parseLine(line);
    if (!record) continue;
    
    if (countryCodes.includes(record.countryCode)) {
      if (!byCountry[record.countryCode]) {
        byCountry[record.countryCode] = [];
      }
      byCountry[record.countryCode].push(record);
    }
  }
  
  return byCountry;
}

async function main() {
  const targetCountries = ['CA', 'US', 'GB', 'AU', 'NZ'];
  const version = new Date().toISOString().slice(0, 10);
  
  console.log('🌍 GeoNames Postal Code Import');
  console.log(`📅 Version: ${version}`);
  console.log(`🎯 Countries: ${targetCountries.join(', ')}`);
  console.log('');
  
  // Ensure data directory exists
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  
  const allRecords: Record<string, GeoNamesRecord[]> = {};
  
  // 1. Download and parse CA_full.csv.zip
  console.log('📥 Downloading Canada...');
  const caZip = path.join(DATA_DIR, 'CA_full.csv.zip');
  const caCsv = path.join(DATA_DIR, 'CA_full.csv');
  await downloadFile('https://download.geonames.org/export/zip/CA_full.csv.zip', caZip);
  await unzip(caZip, caCsv);
  const caData = await parseFile(caCsv, ['CA']);
  Object.assign(allRecords, caData);
  
  // 2. Download and parse GB_full.csv.zip  
  console.log('📥 Downloading UK...');
  const gbZip = path.join(DATA_DIR, 'GB_full.csv.zip');
  const gbCsv = path.join(DATA_DIR, 'GB_full.csv');
  await downloadFile('https://download.geonames.org/export/zip/GB_full.csv.zip', gbZip);
  await unzip(gbZip, gbCsv);
  const gbData = await parseFile(gbCsv, ['GB']);
  Object.assign(allRecords, gbData);
  
  // 3. Download allCountries.zip and filter for US/AU/NZ
  console.log('📥 Downloading allCountries...');
  const allZip = path.join(DATA_DIR, 'allCountries.zip');
  const allTxt = path.join(DATA_DIR, 'allCountries.txt');
  await downloadFile('https://download.geonames.org/export/zip/allCountries.zip', allZip);
  await unzip(allZip, allTxt);
  const otherData = await parseFile(allTxt, ['US', 'AU', 'NZ']);
  Object.assign(allRecords, otherData);
  
  console.log('');
  console.log('📊 Parsed records:');
  for (const [code, records] of Object.entries(allRecords)) {
    console.log(`  ${code}: ${records.length.toLocaleString()}`);
  }
  console.log('');
  
  // Import each country
  let totalImported = 0;
  for (const code of targetCountries) {
    if (allRecords[code]) {
      console.log(`🔄 Importing ${code}...`);
      const count = await importCountry(allRecords[code], code);
      totalImported += count;
      console.log('');
    }
  }
  
  // Summary
  const totalInDB = await prisma.postalCode.count();
  console.log('✅ Import complete!');
  console.log(`📊 Total records imported this run: ${totalImported.toLocaleString()}`);
  console.log(`📊 Total records in database: ${totalInDB.toLocaleString()}`);
  
  // Show sample
  console.log('\n🔍 Sample CA records:');
  const samples = await prisma.postalCode.findMany({
    where: { countryCode: 'CA' },
    take: 5,
    orderBy: { postalCode: 'asc' },
  });
  for (const s of samples) {
    console.log(`  ${s.postalCode} | ${s.city} | ${s.province} (${s.adminCode1}) | ${s.latitude}, ${s.longitude}`);
  }
  
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('Import failed:', e);
  process.exit(1);
});
