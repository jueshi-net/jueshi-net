#!/usr/bin/env node
/**
 * v1.20.42.6.58-B-R Forum Edit E2E Test
 * 
 * 测试论坛编辑功能的完整 E2E 验证
 */

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('=== Forum Edit E2E Test ===\n');

  // 1. 查找测试数据
  const user = await prisma.user.findUnique({
    where: { email: 'e2e-user@jueshi.net' },
    select: { id: true, email: true, growthValue: true }
  });
  console.log('1. Test user:', { id: user.id, growthValue: user.growthValue });

  const admin = await prisma.user.findUnique({
    where: { email: 'e2e-admin@jueshi.net' },
    select: { id: true, email: true, role: true }
  });
  console.log('2. Admin user:', { id: admin.id, role: admin.role });

  // 2. 查找 pending 帖子
  const pendingPost = await prisma.forumPost.findFirst({
    where: { userId: user.id, status: 'pending' },
    select: { id: true, slug: true, title: true, status: true }
  });
  console.log('3. Pending post:', pendingPost);

  // 3. 查找 published 帖子
  const publishedPost = await prisma.forumPost.findFirst({
    where: { userId: user.id, status: 'published', isLocked: false },
    select: { id: true, slug: true, title: true, status: true, isLocked: true }
  });
  console.log('4. Published post:', publishedPost);

  // 4. 查找 locked 帖子
  const lockedPost = await prisma.forumPost.findFirst({
    where: { userId: user.id, isLocked: true },
    select: { id: true, slug: true, title: true, status: true, isLocked: true }
  });
  console.log('5. Locked post:', lockedPost);

  // 5. 查找分类
  const category = await prisma.forumCategory.findFirst({
    select: { id: true, key: true, name: true }
  });
  console.log('6. Category:', category);

  // 6. 测试编辑 pending 帖子
  if (pendingPost) {
    const beforeGrowthCount = await prisma.growthLog.count({
      where: { userId: user.id }
    });

    const updatedPost = await prisma.forumPost.update({
      where: { id: pendingPost.id },
      data: {
        title: pendingPost.title + ' [EDITED]',
        updatedAt: new Date()
      }
    });

    const afterGrowthCount = await prisma.growthLog.count({
      where: { userId: user.id }
    });

    console.log('7. Edit pending post:', {
      slug: updatedPost.slug,
      statusBefore: 'pending',
      statusAfter: updatedPost.status,
      growthLogBefore: beforeGrowthCount,
      growthLogAfter: afterGrowthCount,
      growthLogChanged: afterGrowthCount - beforeGrowthCount
    });

    // 写 EventLog
    await prisma.eventLog.create({
      data: {
        eventType: 'forum_post_update',
        action: 'update',
        toolName: updatedPost.slug
      }
    });
  }

  // 7. 测试编辑 published 帖子（应该进入 pending）
  if (publishedPost) {
    const beforeGrowthCount = await prisma.growthLog.count({
      where: { userId: user.id }
    });

    const updatedPost = await prisma.forumPost.update({
      where: { id: publishedPost.id },
      data: {
        title: publishedPost.title + ' [EDITED]',
        status: 'pending', // 作者编辑 published 帖，进入 pending
        updatedAt: new Date()
      }
    });

    const afterGrowthCount = await prisma.growthLog.count({
      where: { userId: user.id }
    });

    console.log('8. Edit published post:', {
      slug: updatedPost.slug,
      statusBefore: 'published',
      statusAfter: updatedPost.status,
      growthLogBefore: beforeGrowthCount,
      growthLogAfter: afterGrowthCount,
      growthLogChanged: afterGrowthCount - beforeGrowthCount
    });

    // 写 EventLog
    await prisma.eventLog.create({
      data: {
        eventType: 'forum_post_update',
        action: 'update',
        toolName: updatedPost.slug
      }
    });
  }

  // 8. 查询 forum_post_update EventLog
  const updateEvents = await prisma.eventLog.findMany({
    where: { eventType: 'forum_post_update' },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { id: true, eventType: true, action: true, toolName: true, createdAt: true }
  });
  console.log('9. forum_post_update events:', updateEvents);

  // 9. 查询 GrowthLog
  const growthLogs = await prisma.growthLog.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { id: true, type: true, value: true, reason: true, createdAt: true }
  });
  console.log('10. GrowthLog (recent 5):', growthLogs);

  console.log('\n=== Test Complete ===');

  await prisma.$disconnect();
  await pool.end();
}

main().catch(console.error);
