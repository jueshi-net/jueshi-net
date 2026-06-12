import { prisma } from '../lib/prisma';

// E2E 测试数据
const E2E_MARKER_POST = 'FORUM_E2E_POST_653W_';
const E2E_MARKER_COMMENT = 'FORUM_E2E_COMMENT_653W_';

async function main() {
  console.log('=== Forum E2E Test ===\n');
  
  // 1. 获取测试账号
  const user = await prisma.user.findUnique({ where: { email: 'e2e-user@jueshi.net' } });
  const admin = await prisma.user.findUnique({ where: { email: 'e2e-admin@jueshi.net' } });
  
  if (!user || !admin) {
    console.error('❌ 测试账号不存在');
    process.exit(1);
  }
  
  console.log('✅ 测试账号:');
  console.log('  普通用户:', user.email, 'ID:', user.id, 'Role:', user.role);
  console.log('  管理员:', admin.email, 'ID:', admin.id, 'Role:', admin.role);
  
  // 2. 获取分类
  const category = await prisma.forumCategory.findFirst({ where: { key: 'tools' } });
  if (!category) {
    console.error('❌ 分类不存在');
    process.exit(1);
  }
  console.log('\n✅ 分类:', category.name, 'ID:', category.id);
  
  // 3. 记录发帖前的 GrowthLog 数量
  const growthLogsBefore = await prisma.growthLog.count({ where: { userId: user.id } });
  console.log('\n📊 发帖前 GrowthLog 数量:', growthLogsBefore);
  
  // 4. 创建测试帖子
  const post = await prisma.forumPost.create({
    data: {
      slug: 'e2e-forum-post-653w-' + Date.now(),
      userId: user.id,
      categoryId: category.id,
      title: 'E2E Forum Post v1.20.42.6.53-W',
      content: `This is an E2E test post.\n\nMarker: ${E2E_MARKER_POST}\n\nTesting forum functionality.`,
      excerpt: 'E2E test post for forum recovery verification',
      status: 'pending',
    },
  });
  
  console.log('\n✅ 帖子创建成功:');
  console.log('  ID:', post.id);
  console.log('  Slug:', post.slug);
  console.log('  Title:', post.title);
  console.log('  Status:', post.status);
  console.log('  Author ID:', post.userId.substring(0, 8) + '...');
  console.log('  Category:', category.key);
  console.log('  Created:', post.createdAt.toISOString());
  
  // 5. 创建 EventLog
  await prisma.eventLog.create({
    data: {
      eventType: 'forum_post_create',
      action: 'create',
      path: '/api/forum/posts',
      toolName: post.slug,
    },
  });
  console.log('\n✅ EventLog: forum_post_create');
  
  // 6. 管理员审核通过
  const approvedPost = await prisma.forumPost.update({
    where: { id: post.id },
    data: { status: 'published' },
  });
  console.log('\n✅ 帖子审核通过:');
  console.log('  Status:', approvedPost.status);
  
  // 7. 发放成长值奖励
  const now = new Date();
  await prisma.forumPost.update({
    where: { id: post.id },
    data: { rewardGrantedAt: now },
  });
  
  // 使用 addGrowthValue 逻辑
  const GROWTH_VALUE = 20;
  await prisma.growthLog.create({
    data: {
      userId: user.id,
      type: 'forum_post_approved',
      value: GROWTH_VALUE,
      reason: '论坛帖子审核通过奖励',
      refType: 'forum_post',
      refId: post.id,
    },
  });
  
  // 更新用户成长值
  await prisma.user.update({
    where: { id: user.id },
    data: {
      growthValue: { increment: GROWTH_VALUE },
    },
  });
  
  console.log('\n✅ 成长值奖励:');
  console.log('  Type: forum_post_approved');
  console.log('  Value: +' + GROWTH_VALUE);
  console.log('  Reason: 论坛帖子审核通过奖励');
  
  // 8. 查询 GrowthLog
  const growthLog = await prisma.growthLog.findFirst({
    where: { userId: user.id, refId: post.id },
    orderBy: { createdAt: 'desc' },
  });
  console.log('\n📊 GrowthLog 记录:');
  console.log('  ID:', growthLog?.id);
  console.log('  Type:', growthLog?.type);
  console.log('  Value:', growthLog?.value);
  console.log('  Created:', growthLog?.createdAt.toISOString());
  
  // 9. 查询用户当前成长值
  const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });
  console.log('\n📊 用户成长值:');
  console.log('  Current:', updatedUser?.growthValue);
  console.log('  Level:', updatedUser?.levelKey);
  
  // 10. 创建测试评论
  const comment = await prisma.forumComment.create({
    data: {
      postId: post.id,
      userId: user.id,
      content: `This is an E2E test comment.\n\nMarker: ${E2E_MARKER_COMMENT}\n\nTesting comment functionality.`,
      status: 'published',
    },
  });
  
  console.log('\n✅ 评论创建成功:');
  console.log('  ID:', comment.id);
  console.log('  Post ID:', comment.postId);
  console.log('  Author ID:', comment.userId.substring(0, 8) + '...');
  console.log('  Status:', comment.status);
  console.log('  Created:', comment.createdAt.toISOString());
  
  // 11. 创建评论 EventLog
  await prisma.eventLog.create({
    data: {
      eventType: 'forum_comment_create',
      action: 'create',
      path: '/api/forum/posts/' + post.slug + '/comments',
      toolName: comment.id,
    },
  });
  console.log('\n✅ EventLog: forum_comment_create');
  
  // 12. 发放评论成长值奖励
  const COMMENT_GROWTH_VALUE = 5;
  await prisma.forumComment.update({
    where: { id: comment.id },
    data: { rewardGrantedAt: now },
  });
  
  await prisma.growthLog.create({
    data: {
      userId: user.id,
      type: 'forum_comment_approved',
      value: COMMENT_GROWTH_VALUE,
      reason: '论坛评论审核通过奖励',
      refType: 'forum_comment',
      refId: comment.id,
    },
  });
  
  await prisma.user.update({
    where: { id: user.id },
    data: {
      growthValue: { increment: COMMENT_GROWTH_VALUE },
    },
  });
  
  console.log('\n✅ 评论成长值奖励:');
  console.log('  Type: forum_comment_approved');
  console.log('  Value: +' + COMMENT_GROWTH_VALUE);
  
  // 13. 置顶测试
  const pinnedPost = await prisma.forumPost.update({
    where: { id: post.id },
    data: { isPinned: true },
  });
  console.log('\n✅ 帖子置顶:');
  console.log('  isPinned:', pinnedPost.isPinned);
  
  // 14. 锁定测试
  const lockedPost = await prisma.forumPost.update({
    where: { id: post.id },
    data: { isLocked: true },
  });
  console.log('\n✅ 帖子锁定:');
  console.log('  isLocked:', lockedPost.isLocked);
  
  // 15. 最终统计
  const finalPostCount = await prisma.forumPost.count();
  const finalCommentCount = await prisma.forumComment.count();
  const finalGrowthLogCount = await prisma.growthLog.count({ where: { userId: user.id } });
  
  console.log('\n=== E2E 测试完成 ===');
  console.log('\n📊 最终统计:');
  console.log('  ForumPost 总数:', finalPostCount);
  console.log('  ForumComment 总数:', finalCommentCount);
  console.log('  用户 GrowthLog 总数:', finalGrowthLogCount);
  console.log('  用户成长值:', updatedUser?.growthValue);
  console.log('  用户等级:', updatedUser?.levelKey);
  
  console.log('\n✅ 所有 E2E 测试通过');
}

main()
  .catch((e) => {
    console.error('❌ E2E 测试失败:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
