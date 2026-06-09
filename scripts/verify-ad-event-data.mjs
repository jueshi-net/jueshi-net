#!/usr/bin/env node
/**
 * Create test campaign + creative in production DB for AdEvent API verification.
 * Run on VPS: cd /home/deploy/xixiong-saas && NODE_ENV=production node scripts/verify-ad-event-data.mjs
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.production' });

import { Client } from 'pg';

async function main() {
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();

  try {
    // Check existing TEST data
    const existing = await c.query(
      `SELECT id, title FROM ad_campaigns WHERE title LIKE 'TEST_VERIFY_%' ORDER BY "createdAt" DESC LIMIT 3`
    );
    if (existing.rows.length > 0) {
      console.log('Existing TEST campaigns found:', JSON.stringify(existing.rows));
      const campId = existing.rows[0].id;
      const creatives = await c.query(
        `SELECT id, title, creative_type FROM ad_creatives WHERE campaign_id = $1 ORDER BY created_at DESC LIMIT 3`,
        [campId]
      );
      console.log('Existing TEST creatives:', JSON.stringify(creatives.rows));
      if (creatives.rows.length > 0) {
        // Record baseline
        const baseline = await c.query(
          `SELECT impressions, clicks FROM ad_campaigns WHERE id = $1`,
          [campId]
        );
        console.log('Baseline impressions:', baseline.rows[0].impressions, 'clicks:', baseline.rows[0].clicks);
        console.log('Reusing first campaign + creative for tests.');
        console.log(JSON.stringify({ campId, creativeId: creatives.rows[0].id }));
        await c.end();
        return;
      }
      // Campaign exists but no creative, use existing campaign to create creative
      console.log('Campaign exists but no creative yet. Creating creative for existing campaign.');
    } else {
      // Create test campaign
      const campRes = await c.query(
        `INSERT INTO ad_campaigns (id, title, ad_type, is_active, placements, impressions, clicks, priority, start_date, "createdAt", "updatedAt")
         VALUES (gen_random_uuid(), 'TEST_VERIFY_18_2_CAMPAIGN', 'DIRECT', true, '{article.footer_recommend,tool.footer_banner}', 0, 0, 10, NOW(), NOW(), NOW())
         RETURNING id`
      );
      const campId = campRes.rows[0].id;
      console.log('Created TEST campaign:', campId);
    }

    // Get campId (either existing or newly created)
    let campId;
    if (existing.rows.length > 0) {
      campId = existing.rows[0].id;
    } else {
      const campRes = await c.query(
        `SELECT id FROM ad_campaigns WHERE title = 'TEST_VERIFY_18_2_CAMPAIGN' ORDER BY "createdAt" DESC LIMIT 1`
      );
      campId = campRes.rows[0].id;
    }
    console.log('Using campaign:', campId);

    // Create test creative
    const creativeRes = await c.query(
      `INSERT INTO ad_creatives (id, campaign_id, title, creative_type, image_url, target_url, is_active, sort_order, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, 'TEST_VERIFY_18_2_CREATIVE', 'image', 'https://via.placeholder.com/300x100?text=TestAd', 'https://example.com', true, 0, NOW(), NOW())
       RETURNING id`,
      [campId]
    );
    const creativeId = creativeRes.rows[0].id;
    console.log('Created TEST creative:', creativeId);

    // Record baseline
    const baseline = await c.query(
      `SELECT impressions, clicks FROM ad_campaigns WHERE id = $1`,
      [campId]
    );
    console.log('Baseline impressions:', baseline.rows[0].impressions, 'clicks:', baseline.rows[0].clicks);

    console.log(JSON.stringify({ campId, creativeId }));
  } finally {
    await c.end();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
