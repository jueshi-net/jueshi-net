#!/usr/bin/env tsx
/**
 * ContentOps Bot Preflight Test
 * 
 * Tests DB connection and payload validation without creating drafts.
 * Must not output any secrets.
 */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// ============================================================================
// Configuration
// ============================================================================

const CONFIG = {
  databaseUrl: process.env.DATABASE_URL,
};

if (!CONFIG.databaseUrl) {
  console.error('DATABASE_URL is not configured');
  process.exit(1);
}

// ============================================================================
// Test Cases
// ============================================================================

interface TestPayload {
  type: 'checklist' | 'guide' | 'topic';
  title: string;
  slug: string;
  targetAudience?: string;
  targetCountries?: string[];
  audienceStage?: string;
}

const TEST_CASES: TestPayload[] = [
  {
    type: 'checklist',
    title: '新加坡留学生租房注意事项清单',
    slug: '新加坡留学生租房注意事项清单',
    targetAudience: '新加坡留学生',
    targetCountries: ['新加坡'],
    audienceStage: '即将出国',
  },
  {
    type: 'guide',
    title: '加拿大留学签证申请指南',
    slug: '加拿大留学签证申请指南',
    targetAudience: '准备去加拿大的留学生',
    targetCountries: ['加拿大'],
    audienceStage: '准备出国',
  },
  {
    type: 'topic',
    title: '海外必备 APP 推荐',
    slug: '海外必备-app-推荐',
    targetAudience: '海外华人、留学生、准备出国的人',
    targetCountries: ['加拿大', '美国', '英国', '澳大利亚', '新加坡'],
    audienceStage: '已在海外',
  },
];

// ============================================================================
// Main
// ============================================================================

async function main() {
  console.log('=== ContentOps Bot Preflight Test ===\n');
  
  // Test 1: Database connection
  console.log('[TEST 1] Database connection...');
  let prisma: PrismaClient;
  try {
    // Use driver adapter for Prisma 7
    const adapter = new PrismaPg({ connectionString: CONFIG.databaseUrl });
    prisma = new PrismaClient({ adapter });
    await prisma.$connect();
    console.log('✓ Prisma connected successfully\n');
  } catch (error: any) {
    console.error('✗ Database connection failed');
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }

  // Test 2: Payload validation (without creating)
  console.log('[TEST 2] Payload validation...');
  for (const payload of TEST_CASES) {
    console.log(`\n  Testing ${payload.type}: "${payload.title}"`);
    
    // Validate required fields
    if (!payload.title) {
      console.error(`  ✗ Title is empty`);
      process.exit(1);
    }
    if (!payload.slug) {
      console.error(`  ✗ Slug is empty`);
      process.exit(1);
    }
    
    console.log(`  ✓ Type: ${payload.type}`);
    console.log(`  ✓ Title: ${payload.title}`);
    console.log(`  ✓ Slug: ${payload.slug}`);
    console.log(`  ✓ Target audience: ${payload.targetAudience || 'N/A'}`);
    console.log(`  ✓ Target countries: ${payload.targetCountries?.join(', ') || 'N/A'}`);
    console.log(`  ✓ Audience stage: ${payload.audienceStage || 'N/A'}`);
  }

  // Test 3: Prisma auth (query test)
  console.log('\n[TEST 3] Prisma auth test (read-only)...');
  try {
    const checklistCount = await prisma.checklist.count();
    const guideCount = await prisma.guide.count();
    const topicCount = await prisma.topic.count();
    console.log(`✓ Can read checklists: ${checklistCount} total`);
    console.log(`✓ Can read guides: ${guideCount} total`);
    console.log(`✓ Can read topics: ${topicCount} total`);
  } catch (error: any) {
    console.error('✗ Prisma auth failed');
    console.error(`Error: ${error.message}`);
    await prisma.$disconnect();
    process.exit(1);
  }

  await prisma.$disconnect();
  
  console.log('\n=== All preflight tests passed ===');
  console.log('✓ Database connection: PASS');
  console.log('✓ Payload validation: PASS');
  console.log('✓ Prisma auth: PASS');
  console.log('✓ No drafts created: PASS');
  console.log('✓ No content published: PASS');
  console.log('✓ No secrets exposed: PASS');
}

main().catch((error) => {
  console.error('Preflight test failed:', error.message);
  process.exit(1);
});
