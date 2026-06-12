#!/usr/bin/env node
/**
 * v1.20.42.6.58-B-R Rate Limit EventLog Test
 * 
 * 测试频率限制 EventLog 记录
 */

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('=== Rate Limit EventLog Test ===\n');

  // 1. 查询 forum_rate_limit_hit EventLog
  const rateLimitEvents = await prisma.eventLog.findMany({
    where: { eventType: 'forum_rate_limit_hit' },
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: { 
      id: true, 
      eventType: true, 
      action: true, 
      toolName: true, 
      createdAt: true 
    }
  });
  
  console.log('1. forum_rate_limit_hit events:', rateLimitEvents);
  console.log('   Total count:', rateLimitEvents.length);

  // 2. 查询所有 forum 相关 EventLog
  const allForumEvents = await prisma.eventLog.findMany({
    where: { 
      OR: [
        { eventType: { startsWith: 'forum_' } },
        { action: { startsWith: 'forum_' } }
      ]
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
    select: { 
      id: true, 
      eventType: true, 
      action: true, 
      toolName: true, 
      createdAt: true 
    }
  });
  
  console.log('\n2. All forum events (recent 20):', allForumEvents);

  // 3. 统计各类型 EventLog 数量
  const eventStats = await prisma.eventLog.groupBy({
    by: ['eventType'],
    where: { eventType: { startsWith: 'forum_' } },
    _count: { id: true }
  });
  
  console.log('\n3. Forum event type stats:', eventStats);

  console.log('\n=== Test Complete ===');

  await prisma.$disconnect();
  await pool.end();
}

main().catch(console.error);
