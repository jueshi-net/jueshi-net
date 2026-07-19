/**
 * 清理 Forum 测试帖子
 * 
 * 使用 DELETE /api/forum/my-posts API 删除 pending/rejected 状态的测试帖子
 */

import { test, expect } from '@playwright/test';

const STAGING_BASE_URL = 'https://i.jueshi.net';
const USER_STORAGE_STATE = 'tools/jueshi-audit/artifacts/storage-state/user-session.json';

test.describe('Forum Test Data Cleanup', () => {
  test('清理所有 pending/rejected 测试帖子', async ({ browser }) => {
    const context = await browser.newContext({ storageState: USER_STORAGE_STATE });
    const page = await context.newPage();

    // 获取我的帖子列表
    await page.goto(`${STAGING_BASE_URL}/bbs/my-posts`);
    await page.waitForLoadState('networkidle');

    // 查找所有 E2E 测试帖子
    const testPosts = page.locator('a:has-text("[E2E][FORUM]")');
    const count = await testPosts.count();
    
    console.log(`找到 ${count} 个测试帖子`);

    // 逐个删除
    for (let i = 0; i < count; i++) {
      const postLink = testPosts.nth(i);
      const href = await postLink.getAttribute('href');
      const postSlug = href?.replace('/bbs/', '') || '';
      
      console.log(`正在删除: ${postSlug}`);
      
      // 使用 API 删除
      const response = await page.evaluate(async (slug) => {
        // 首先获取帖子 ID
        const postsRes = await fetch('/api/forum/my-posts');
        const postsData = await postsRes.json();
        const post = postsData.posts?.find((p: any) => p.slug === slug);
        
        if (!post) return { success: false, error: '帖子不存在' };
        
        // 删除帖子
        const deleteRes = await fetch('/api/forum/my-posts', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postId: post.id }),
        });
        
        return await deleteRes.json();
      }, postSlug);
      
      if (response.success) {
        console.log(`✅ 已删除: ${postSlug}`);
      } else {
        console.log(`❌ 删除失败: ${postSlug} - ${response.error}`);
      }
      
      // 等待一下避免速率限制
      await page.waitForTimeout(500);
    }

    // 验证清理结果
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    const remainingPosts = page.locator('a:has-text("[E2E][FORUM]")');
    const remainingCount = await remainingPosts.count();
    
    console.log(`剩余测试帖子: ${remainingCount}`);
    expect(remainingCount).toBe(0);

    await context.close();
  });
});
