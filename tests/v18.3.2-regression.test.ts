/**
 * v1.20.42.18.3.2 - Real regression tests
 * Run with: npx tsx tests/v18.3.2-regression.test.ts
 * 
 * These tests verify:
 * 1. Reward safety (role isolation, inactive items)
 * 2. Task chain API behavior
 * 3. Public page availability
 * 4. Postal helper functionality
 */

import { describe, it, expect } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  // Script-style integration test - skip gracefully when no database available
  describe.skip('v18.3.2 Regression Tests (requires DATABASE_URL)', () => {
    it('skipped - no DATABASE_URL', () => {});
  });
} else {
const adapter = new PrismaPg({ connectionString: dbUrl });
const prisma = new PrismaClient({ adapter });

let passed = 0;
let failed = 0;
let skipped = 0;

async function test(name: string, fn: () => Promise<void> | void, skipOnDbError = false) {
  try {
    await fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (err: any) {
    // Skip database connection errors in local environment
    if (skipOnDbError && (err.message?.includes('Can\'t reach database') || 
                          err.message?.includes('P1001') ||
                          err.message?.includes('DatabaseNotReachable'))) {
      console.log(`  ⏭️  ${name} (skipped - no local DB)`);
      skipped++;
      return;
    }
    console.log(`  ❌ ${name}`);
    console.log(`     ${err.message}`);
    failed++;
  }
}

function skip(name: string, reason: string) {
  console.log(`  ⏭️  ${name} (${reason})`);
  skipped++;
}

async function main() {
  console.log('\n🧪 v1.20.42.18.3.2 Regression Tests\n');
  console.log('━'.repeat(60));

  // ─── Reward Safety Tests ─────────────────────────────────
  console.log('\n📦 Reward Safety Tests');
  console.log('─'.repeat(60));

  await test('admin user 9833416@qq.com has role=admin', async () => {
    const admin = await prisma.user.findUnique({ 
      where: { email: '9833416@qq.com' },
      select: { role: true }
    });
    if (!admin) throw new Error('Admin user not found');
    if (admin.role !== 'admin') throw new Error(`Expected admin, got ${admin.role}`);
  }, true);

  await test('no user has role=member (lowercase)', async () => {
    const count = await prisma.user.count({ where: { role: 'member' } });
    if (count > 0) throw new Error(`Found ${count} users with role=member`);
  }, true);

  await test('ad_slot_7day is inactive (safety)', async () => {
    const item = await prisma.rewardItem.findUnique({ 
      where: { code: 'ad_slot_7day' },
      select: { enabled: true }
    });
    if (!item) throw new Error('ad_slot_7day not found');
    if (item.enabled) throw new Error('ad_slot_7day should be inactive');
  }, true);

  await test('growth_50 is active', async () => {
    const item = await prisma.rewardItem.findUnique({ 
      where: { code: 'growth_50' },
      select: { enabled: true }
    });
    if (!item) throw new Error('growth_50 not found');
    if (!item.enabled) throw new Error('growth_50 should be active');
  }, true);

  await test('member_1day is active', async () => {
    const item = await prisma.rewardItem.findUnique({ 
      where: { code: 'member_1day' },
      select: { enabled: true }
    });
    if (!item) throw new Error('member_1day not found');
    if (!item.enabled) throw new Error('member_1day should be active');
  }, true);

  await test('word_export_coupon items are inactive', async () => {
    const items = await prisma.rewardItem.findMany({
      where: { rewardType: 'word_export_coupon' },
      select: { code: true, enabled: true }
    });
    const active = items.filter(i => i.enabled);
    if (active.length > 0) {
      throw new Error(`Found active word_export items: ${active.map(i => i.code).join(', ')}`);
    }
  }, true);

  await test('no_branding_coupon items are inactive', async () => {
    const items = await prisma.rewardItem.findMany({
      where: { rewardType: 'no_branding_coupon' },
      select: { code: true, enabled: true }
    });
    const active = items.filter(i => i.enabled);
    if (active.length > 0) {
      throw new Error(`Found active no_branding items: ${active.map(i => i.code).join(', ')}`);
    }
  }, true);

  await test('no points-type reward items exist (prevent套利)', async () => {
    const count = await prisma.rewardItem.count({
      where: { rewardType: 'points' }
    });
    if (count > 0) throw new Error(`Found ${count} points-type reward items`);
  }, true);

  await test('redeem code does not write role=member (code check)', async () => {
    const fs = await import('fs');
    const code = fs.readFileSync('src/app/api/rewards/redeem/route.ts', 'utf-8');
    
    // Check that member_trial handler does NOT set role
    const memberTrialBlock = code.match(/if \(rewardItem\.rewardType === "member_trial"[\s\S]*?await tx\.user\.update\(\{[\s\S]*?data: \{[\s\S]*?memberUntil: newMemberUntil,[\s\S]*?\},[\s\S]*?\}\);/);
    if (!memberTrialBlock) throw new Error('member_trial handler not found');
    
    // Verify no role assignment in the block
    if (memberTrialBlock[0].includes('role:')) {
      throw new Error('member_trial handler contains role assignment');
    }
  });

  await test('ad_slot_days uses AD_SLOT_DAYS (uppercase) in reward_grant', async () => {
    const fs = await import('fs');
    const code = fs.readFileSync('src/app/api/rewards/redeem/route.ts', 'utf-8');
    
    // Check that rewardGrant.create uses uppercase AD_SLOT_DAYS
    const adSlotBlock = code.match(/if \(rewardItem\.rewardType === "ad_slot_days"\) \{[\s\S]*?await tx\.rewardGrant\.create\(\{[\s\S]*?data: \{[\s\S]*?rewardType: "([^"]+)"[\s\S]*?\}/);
    if (!adSlotBlock) throw new Error('ad_slot_days handler not found');
    
    if (adSlotBlock[1] !== 'AD_SLOT_DAYS') {
      throw new Error(`Expected AD_SLOT_DAYS, got ${adSlotBlock[1]}`);
    }
  });

  // ─── Task Chain Tests ─────────────────────────────────────
  console.log('\n📋 Task Chain Tests');
  console.log('─'.repeat(60));

  await test('task_chain_drafts table exists and has correct schema', async () => {
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'task_chain_drafts'
      ORDER BY ordinal_position
    `;
    const columns = (result as any[]).map(r => r.column_name);
    const required = ['id', 'user_id', 'title', 'status', 'context'];
    for (const col of required) {
      if (!columns.includes(col)) {
        throw new Error(`Missing column: ${col}`);
      }
    }
  }, true);

  await test('task chain API requires auth (code check)', async () => {
    const fs = await import('fs');
    const code = fs.readFileSync('src/app/api/task-chains/route.ts', 'utf-8');
    if (!code.includes('session?.user?.id')) {
      throw new Error('Auth check not found');
    }
    if (!code.includes('401')) {
      throw new Error('401 response not found');
    }
  });

  await test('task chain [id] API filters by userId (code check)', async () => {
    const fs = await import('fs');
    const code = fs.readFileSync('src/app/api/task-chains/[id]/route.ts', 'utf-8');
    if (!code.includes('where: { id, userId }')) {
      throw new Error('userId filter not found in findFirst');
    }
  });

  await test('task chain PATCH updates context correctly (code check)', async () => {
    const fs = await import('fs');
    const code = fs.readFileSync('src/app/api/task-chains/[id]/route.ts', 'utf-8');
    if (!code.includes('context !== undefined')) {
      throw new Error('context update handler not found');
    }
    if (!code.includes('typeof context')) {
      throw new Error('context type validation not found');
    }
  });

  await test('task chain workbench has debounce auto-save (code check)', async () => {
    const fs = await import('fs');
    const code = fs.readFileSync('src/app/(workspace)/workspace/task-chains/shipping/[id]/shipping-workbench.tsx', 'utf-8');
    if (!code.includes('saveTimerRef')) {
      throw new Error('saveTimerRef not found');
    }
    if (!code.includes('1000')) {
      throw new Error('1000ms debounce not found');
    }
    if (!code.includes('lastSavedAt')) {
      throw new Error('lastSavedAt state not found');
    }
  });

  // ─── Public Page Tests ────────────────────────────────────
  console.log('\n🌐 Public Page Tests');
  console.log('─'.repeat(60));

  const publicPages = [
    '/tools/postal-code',
    '/guides/cbm-calculation',
    '/guides/shipping-from-china-to-canada',
    '/guides/shipping-from-china-to-usa',
    '/guides/shipping-from-china-to-germany',
    '/guides/cross-border-shipping-checklist',
    '/guides/export-documents-checklist',
    '/guides/battery-shipping-notice',
    '/guides/msds-un38-3-basics',
    '/guides/shipping-quote-template',
  ];

  for (const page of publicPages) {
    await test(`GET ${page} returns 200`, async () => {
      const res = await fetch(`https://jueshi.net${page}`, { 
        method: 'GET',
        redirect: 'follow',
      });
      if (res.status !== 200) {
        throw new Error(`Expected 200, got ${res.status}`);
      }
    });
  }

  await test('deploy-version.json returns correct version', async () => {
    const res = await fetch('https://jueshi.net/deploy-version.json');
    const data = await res.json();
    if (!data.version) throw new Error('No version field');
    if (!data.commit) throw new Error('No commit field');
    if (!data.buildId) throw new Error('No buildId field');
  });

  // ─── Postal Helper Tests ──────────────────────────────────
  console.log('\n📮 Postal Helper Tests');
  console.log('─'.repeat(60));

  await test('postal helper page loads with content', async () => {
    const res = await fetch('https://jueshi.net/tools/postal-code');
    const html = await res.text();
    if (!html.includes('邮编') && !html.includes('postal')) {
      throw new Error('Postal helper content not found');
    }
  });

  // ─── Guide Page Content Tests ─────────────────────────────
  console.log('\n📖 Guide Page Content Tests');
  console.log('─'.repeat(60));

  await test('cbm-calculation guide has task chain CTA', async () => {
    const res = await fetch('https://jueshi.net/guides/cbm-calculation');
    const html = await res.text();
    if (!html.includes('task-chain') && !html.includes('任务链')) {
      throw new Error('Task chain CTA not found');
    }
  });

  await test('cross-border-checklist guide has task chain CTA', async () => {
    const res = await fetch('https://jueshi.net/guides/cross-border-shipping-checklist');
    const html = await res.text();
    if (!html.includes('task-chain') && !html.includes('任务链')) {
      throw new Error('Task chain CTA not found');
    }
  });

  await test('export-documents guide has task chain CTA', async () => {
    const res = await fetch('https://jueshi.net/guides/export-documents-checklist');
    const html = await res.text();
    if (!html.includes('task-chain') && !html.includes('任务链')) {
      throw new Error('Task chain CTA not found');
    }
  });

  await test('shipping-quote-template guide has task chain CTA', async () => {
    const res = await fetch('https://jueshi.net/guides/shipping-quote-template');
    const html = await res.text();
    if (!html.includes('task-chain') && !html.includes('任务链')) {
      throw new Error('Task chain CTA not found');
    }
  });

  // ─── Logout Safety Test ───────────────────────────────────
  console.log('\n🔒 Logout Safety Tests');
  console.log('─'.repeat(60));

  await test('logout handler does not redirect to localhost (code check)', async () => {
    const fs = await import('fs');
    const headerPath = 'src/components/layout/header.tsx';
    if (fs.existsSync(headerPath)) {
      const code = fs.readFileSync(headerPath, 'utf-8');
      if (code.includes('localhost:3000') && code.includes('signOut')) {
        throw new Error('Found localhost:3000 in signOut handler');
      }
    } else {
      // Check alternative locations
      const files = [
        'src/components/saas/WorkspaceHeader.tsx',
        'src/components/header.tsx',
      ];
      let found = false;
      for (const f of files) {
        if (fs.existsSync(f)) {
          const code = fs.readFileSync(f, 'utf-8');
          if (code.includes('signOut') && code.includes('localhost')) {
            throw new Error(`Found localhost in signOut handler in ${f}`);
          }
          if (code.includes('signOut')) {
            found = true;
          }
        }
      }
      if (!found) {
        skip('logout handler check', 'signOut handler not found in expected locations');
      }
    }
  });

  // ─── Summary ──────────────────────────────────────────────
  console.log('\n' + '━'.repeat(60));
  console.log(`\n📊 Test Summary:`);
  console.log(`   ✅ Passed:  ${passed}`);
  console.log(`   ❌ Failed:  ${failed}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   📈 Total:   ${passed + failed + skipped}`);
  console.log(`   🎯 Rate:    ${((passed / (passed + failed)) * 100).toFixed(1)}%\n`);

  if (failed > 0) {
    console.log('❌ TESTS FAILED\n');
    throw new Error(`${failed} tests failed`);
  } else {
    console.log('✅ ALL TESTS PASSED\n');
  }
}

// Wrap in vitest test when loaded by vitest, run directly when executed via tsx
describe('v18.3.2 Regression Tests', () => {
  it('should pass all integration tests', async () => {
    await main();
  });
});

// Close the else block from the DATABASE_URL guard above
}
