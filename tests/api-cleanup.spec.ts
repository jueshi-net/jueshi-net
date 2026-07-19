import { test } from '@playwright/test';

const STAGING_BASE_URL = 'https://i.jueshi.net';

test('通过 API 清理测试帖子', async ({ request }) => {
  // 获取所有帖子
  const response = await request.get(`${STAGING_BASE_URL}/api/forum/my-posts?status=all&pageSize=50`);
  
  if (!response.ok()) {
    console.log(`API 请求失败: ${response.status()}`);
    const text = await response.text();
    console.log(`响应: ${text.substring(0, 200)}`);
    return;
  }
  
  const data = await response.json();
  console.log(`总帖子数: ${data.total || 0}`);
  
  const posts = data.posts || [];
  const testPosts = posts.filter((p: any) => p.title?.includes('[E2E]') || p.title?.includes('e2eforum'));
  
  console.log(`测试帖子数: ${testPosts.length}`);
  
  for (const post of testPosts) {
    console.log(`  - ${post.slug} (${post.status})`);
    
    if (['pending', 'rejected'].includes(post.status)) {
      // 删除帖子
      const deleteRes = await request.post(`${STAGING_BASE_URL}/api/forum/my-posts`, {
        headers: { 'Content-Type': 'application/json' },
        data: { postId: post.id },
      });
      
      const deleteData = await deleteRes.json();
      if (deleteData.success) {
        console.log(`    ✅ 已删除`);
      } else {
        console.log(`    ❌ 删除失败: ${deleteData.error}`);
      }
    }
  }
});
