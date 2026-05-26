/**
 * Backfill normalizedPostalCode for all postal_codes records
 * 
 * Usage: npx tsx scripts/backfill-postal-normalized.ts
 * 
 * Logic:
 * normalizedPostalCode = upper(replace(replace("postalCode", ' ', ''), '-', ''))
 * 
 * Features:
 * - Batch processing (5000 records per batch)
 * - Skips already-filled records
 * - Progress output
 * - Safe to re-run
 */

import { PrismaClient } from '@prisma/client';

const BATCH_SIZE = 5000;

async function main() {
  const prisma = new PrismaClient();

  console.log('=== PostalCode normalizedPostalCode Backfill ===');
  console.log(`Batch size: ${BATCH_SIZE}`);

  // Count total and already filled
  const totalCount = await prisma.postalCode.count();
  const filledCount = await prisma.postalCode.count({
    where: { normalizedPostalCode: { not: null } },
  });
  const remainingCount = totalCount - filledCount;

  console.log(`Total records: ${totalCount}`);
  console.log(`Already filled: ${filledCount}`);
  console.log(`Remaining: ${remainingCount}`);

  if (remainingCount === 0) {
    console.log('✅ All records already have normalizedPostalCode. Nothing to do.');
    await prisma.$disconnect();
    return;
  }

  const startTime = Date.now();
  let processedCount = 0;
  let batchNum = 0;

  while (processedCount < remainingCount) {
    batchNum++;
    const batchStart = Date.now();

    // Fetch a batch of records that need normalization
    const records = await prisma.postalCode.findMany({
      where: { normalizedPostalCode: null },
      take: BATCH_SIZE,
      select: { id: true, postalCode: true },
    });

    if (records.length === 0) {
      console.log('No more records to process.');
      break;
    }

    // Build bulk update
    const updates = records.map((record) => {
      const normalized = record.postalCode
        .toUpperCase()
        .replace(/[\s-]/g, '');
      return prisma.postalCode.update({
        where: { id: record.id },
        data: { normalizedPostalCode: normalized },
      });
    });

    // Execute batch
    await prisma.$transaction(updates);

    processedCount += records.length;
    const batchTime = Date.now() - batchStart;
    const elapsed = Date.now() - startTime;
    const remaining = remainingCount - processedCount;
    const rate = processedCount / (elapsed / 1000);
    const eta = remaining / rate;

    console.log(
      `Batch ${batchNum}: processed ${records.length} records ` +
      `(${processedCount}/${remainingCount}, ${remaining} remaining) ` +
      `| ${batchTime}ms batch | rate: ${rate.toFixed(0)}/s | ETA: ${Math.ceil(eta)}s`
    );
  }

  const totalTime = Date.now() - startTime;
  console.log(`\n=== Backfill Complete ===`);
  console.log(`Total processed: ${processedCount}`);
  console.log(`Total time: ${(totalTime / 1000).toFixed(1)}s`);
  console.log(`Final verification...`);

  // Verify
  const finalFilled = await prisma.postalCode.count({
    where: { normalizedPostalCode: { not: null } },
  });
  const finalRemaining = await prisma.postalCode.count({
    where: { normalizedPostalCode: null },
  });
  console.log(`Filled: ${finalFilled}/${totalCount}`);
  console.log(`Remaining null: ${finalRemaining}`);

  // Sample verification
  const samples = await prisma.postalCode.findMany({
    take: 10,
    select: { postalCode: true, normalizedPostalCode: true, countryCode: true },
  });
  console.log('\nSample records:');
  samples.forEach((s) => {
    console.log(`  ${s.countryCode}: "${s.postalCode}" -> "${s.normalizedPostalCode}"`);
  });

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('Backfill failed:', err);
  process.exit(1);
});
