#!/usr/bin/env node
/**
 * check-document-export-images.mjs
 * Validates exported PNG images meet A4 dimensional standards.
 * Usage: node scripts/qa/check-document-export-images.mjs <directory>
 * 
 * Requirements:
 * - width >= 1200 (or >= 794 for 1x)
 * - height >= 1120
 * - width / height in [0.68, 0.73]
 * - Rejects 500×1500, 600×1400 etc.
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';

// Simple PNG parser to read dimensions from IHDR chunk
function readPNGDimensions(filePath) {
  const buf = readFileSync(filePath);
  // PNG signature: 89 50 4E 47 0D 0A 1A 0A
  if (buf[0] !== 0x89 || buf[1] !== 0x50 || buf[2] !== 0x4E || buf[3] !== 0x47) {
    throw new Error(`Not a PNG file: ${filePath}`);
  }
  // IHDR chunk starts at byte 12, width at 16-19, height at 20-23
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  return { width, height };
}

function checkImage(filePath) {
  const { width, height } = readPNGDimensions(filePath);
  const ratio = width / height;
  const isA4 = ratio >= 0.68 && ratio <= 0.73;
  const isWideEnough = width >= 794;
  const isTallEnough = height >= 1120;
  const isReject = width < 600 && height > 1200; // mobile narrow

  return {
    file: filePath,
    width,
    height,
    ratio: ratio.toFixed(4),
    isA4,
    isWideEnough,
    isTallEnough,
    isReject,
    status: (isA4 && isWideEnough && isTallEnough && !isReject) ? 'PASS' : 'FAIL',
  };
}

const dir = process.argv[2];
if (!dir) {
  console.error('Usage: node check-document-export-images.mjs <directory>');
  process.exit(1);
}

const pngFiles = readdirSync(dir)
  .filter(f => f.endsWith('.png'))
  .map(f => join(dir, f));

if (pngFiles.length === 0) {
  console.log(`No PNG files found in ${dir}`);
  process.exit(0);
}

console.log(`=== Document Export Image Checker ===`);
console.log(`Directory: ${dir}`);
console.log(`Found ${pngFiles.length} PNG files\n`);

let pass = 0;
let fail = 0;

for (const file of pngFiles) {
  try {
    const r = checkImage(file);
    const icon = r.status === 'PASS' ? '✅' : '❌';
    console.log(`${icon} ${r.file.split('/').pop()}`);
    console.log(`   Size: ${r.width}×${r.height} (ratio: ${r.ratio})`);
    console.log(`   A4 (0.68-0.73): ${r.isA4 ? '✅' : '❌'}  Width≥794: ${r.isWideEnough ? '✅' : '❌'}  Height≥1120: ${r.isTallEnough ? '✅' : '❌'}`);
    if (r.isReject) console.log(`   ⚠️ REJECTED: Looks like mobile screenshot (narrow+tall)`);
    if (r.status === 'PASS') pass++; else fail++;
  } catch (e) {
    console.log(`❌ ${file.split('/').pop()}: Error - ${e.message}`);
    fail++;
  }
}

console.log(`\n=== Summary ===`);
console.log(`Total: ${pngFiles.length} | Pass: ${pass} | Fail: ${fail}`);
process.exit(fail > 0 ? 1 : 0);
