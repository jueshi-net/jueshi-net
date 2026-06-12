#!/usr/bin/env node
/**
 * Generate PNG icons from SVG logo
 * 
 * Usage: node scripts/generate-brand-assets.mjs
 */

import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// SVG sources
const logoMarkSvg = readFileSync(join(rootDir, 'public/brand/logo-mark.svg'), 'utf-8');
const faviconSvg = readFileSync(join(rootDir, 'public/favicon.svg'), 'utf-8');

// Output sizes
const sizes = [
  { name: 'icon-192.png', size: 192, source: logoMarkSvg },
  { name: 'icon-512.png', size: 512, source: logoMarkSvg },
  { name: 'apple-touch-icon.png', size: 180, source: logoMarkSvg },
  { name: 'favicon-32x32.png', size: 32, source: faviconSvg },
  { name: 'favicon-16x16.png', size: 16, source: faviconSvg },
];

async function generatePngs() {
  console.log('🎨 Generating PNG brand assets...\n');

  for (const { name, size, source } of sizes) {
    const outputPath = join(rootDir, 'public', name);
    
    try {
      await sharp(Buffer.from(source))
        .resize(size, size)
        .png()
        .toFile(outputPath);
      
      console.log(`✅ ${name} (${size}x${size})`);
    } catch (error) {
      console.error(`❌ Failed to generate ${name}:`, error.message);
    }
  }

  // Generate favicon.ico (multi-size)
  console.log('\n🔧 Generating favicon.ico...');
  try {
    const favicon16 = await sharp(Buffer.from(faviconSvg)).resize(16, 16).png().toBuffer();
    const favicon32 = await sharp(Buffer.from(faviconSvg)).resize(32, 32).png().toBuffer();
    const favicon48 = await sharp(Buffer.from(faviconSvg)).resize(48, 48).png().toBuffer();
    
    // Simple ICO format (concatenate PNGs with ICO header)
    // Note: This is a simplified ICO. For production, use a proper ICO generator.
    const icoPath = join(rootDir, 'public', 'favicon.ico');
    
    // For now, just use the 32x32 PNG as favicon.ico (browsers handle this)
    writeFileSync(icoPath, favicon32);
    console.log('✅ favicon.ico (32x32)');
  } catch (error) {
    console.error('❌ Failed to generate favicon.ico:', error.message);
  }

  // Generate Open Graph image
  console.log('\n🖼️  Generating Open Graph image...');
  try {
    const ogDir = join(rootDir, 'public', 'og');
    if (!existsSync(ogDir)) {
      mkdirSync(ogDir, { recursive: true });
    }
    
    // Create a simple OG image with logo and text
    const ogSvg = `
      <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
        <!-- Background -->
        <rect width="1200" height="630" fill="#0F3D5E"/>
        
        <!-- Gradient overlay -->
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#0F3D5E;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#14B8A6;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="1200" height="630" fill="url(#grad)" opacity="0.3"/>
        
        <!-- Logo Mark (Large) -->
        <g transform="translate(100, 200) scale(3)">
          <path d="M25 5 L52 17 L52 43 L30 55 L8 43 L8 17 Z" 
                fill="#0F3D5E" 
                stroke="#14B8A6" 
                stroke-width="2.5"/>
          <circle cx="30" cy="24" r="5" fill="#14B8A6"/>
          <rect x="27.5" y="28" width="5" height="14" rx="1.5" fill="#14B8A6"/>
          <path d="M18 38 Q24 44, 30 42 Q36 40, 42 44" 
                stroke="#F59E0B" 
                stroke-width="2" 
                fill="none" 
                stroke-linecap="round"/>
        </g>
        
        <!-- Text -->
        <text x="350" y="280" 
              font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
              font-size="64" 
              font-weight="700" 
              fill="#FFFFFF">
          海外百宝箱
        </text>
        
        <text x="350" y="340" 
              font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
              font-size="32" 
              font-weight="400" 
              fill="#14B8A6">
          跨境贸易工具箱 · 出海必备资源平台
        </text>
        
        <text x="350" y="400" 
              font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
              font-size="24" 
              font-weight="400" 
              fill="#FFFFFF" 
              opacity="0.8">
          jueshi.net
        </text>
      </svg>
    `;
    
    await sharp(Buffer.from(ogSvg))
      .resize(1200, 630)
      .png()
      .toFile(join(ogDir, 'default-og.png'));
    
    console.log('✅ og/default-og.png (1200x630)');
  } catch (error) {
    console.error('❌ Failed to generate OG image:', error.message);
  }

  console.log('\n✨ Brand assets generation complete!');
}

generatePngs().catch(console.error);
