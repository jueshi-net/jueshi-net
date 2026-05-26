#!/usr/bin/env node
/**
 * Seed production database from destinations-batch.json.
 * Uses Prisma with direct PostgreSQL adapter (Prisma 7 compatible).
 * Run on VPS: npx tsx scripts/seed-from-json.cjs
 */

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');
const fs = require('fs');
const path = require('path');

// Read DATABASE_URL from env
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not set in environment');
  process.exit(1);
}

// Create PostgreSQL pool
const pool = new pg.Pool({ connectionString: DATABASE_URL });
const adapter = new PrismaPg(pool);

// Create Prisma client with adapter
const prisma = new PrismaClient({ adapter });

async function main() {
  const jsonPath = path.join(__dirname, '..', 'prisma', 'seeds', 'destinations-batch.json');

  if (!fs.existsSync(jsonPath)) {
    console.error(`❌ File not found: ${jsonPath}`);
    process.exit(1);
  }

  const destinations = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  console.log(`📦 Loaded ${destinations.length} destinations from ${jsonPath}`);

  let upserted = 0;
  let errors = 0;

  for (const dest of destinations) {
    const { slug, name, nameEn, emoji, region, currency, heroTitle, heroSubtitle, seoTitle, seoDescription, keywords, keyCities, userCount, docCount, isActive, guides, services, tools } = dest;

    try {
      const result = await prisma.destination.upsert({
        where: { slug },
        create: {
          slug, name, nameEn, emoji, region, currency,
          heroTitle: heroTitle || '',
          heroSubtitle: heroSubtitle || '',
          seoTitle: seoTitle || '',
          seoDescription: seoDescription || '',
          keywords: keywords || [],
          keyCities: keyCities || [],
          userCount: userCount || '0',
          docCount: docCount || '0',
          isActive: isActive ?? true,
        },
        update: {
          name, nameEn, emoji, region, currency,
          heroTitle: heroTitle || '',
          heroSubtitle: heroSubtitle || '',
          seoTitle: seoTitle || '',
          seoDescription: seoDescription || '',
          keywords: keywords || [],
          keyCities: keyCities || [],
          userCount: userCount || '0',
          docCount: docCount || '0',
          isActive: isActive ?? true,
        },
      });

      // Sync guides (delete + recreate)
      await prisma.destinationGuide.deleteMany({ where: { destinationId: result.id } });
      if (guides && guides.length > 0) {
        await prisma.destinationGuide.createMany({
          data: guides.map((g, i) => ({
            destinationId: result.id,
            title: g.title,
            description: g.description || '',
            type: g.type || 'guide',
            sortOrder: i,
          })),
        });
      }

      // Sync services (delete + recreate)
      await prisma.destinationService.deleteMany({ where: { destinationId: result.id } });
      if (services && services.length > 0) {
        await prisma.destinationService.createMany({
          data: services.map((s, i) => ({
            destinationId: result.id,
            title: s.title,
            category: s.category || '',
            description: s.description || '',
            sortOrder: i,
          })),
        });
      }

      // Sync tools (delete + recreate)
      await prisma.destinationTool.deleteMany({ where: { destinationId: result.id } });
      if (tools && tools.length > 0) {
        await prisma.destinationTool.createMany({
          data: tools.map((t, i) => ({
            destinationId: result.id,
            toolSlug: t,
            sortOrder: i,
          })),
        });
      }

      upserted++;
      console.log(`  ✅ ${emoji} ${name} (${slug}) — ${guides?.length || 0} guides, ${services?.length || 0} services, ${tools?.length || 0} tools`);
    } catch (err) {
      errors++;
      console.error(`  ❌ ${name} (${slug}): ${err.message}`);
    }
  }

  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log(`📊 Seeding Complete`);
  console.log(`   ✅ Upserted: ${upserted}`);
  console.log(`   ❌ Errors: ${errors}`);
  console.log('═══════════════════════════════════════════');

  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
