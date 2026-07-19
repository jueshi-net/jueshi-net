/**
 * Forum Post Pending Flow Verification
 * Verifies the fix for data.post.slug and pending status handling
 */

import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const STAGING_URL = 'https://i.jueshi.net';
const STORAGE_STATE_PATH = '/Users/chq/xixiong-saas/tools/jueshi-audit/artifacts/storage-state/user-session.json';
const ARTIFACT_DIR = '/Users/chq/test-artifacts/jueshi/20260717-132445/forum';

test.use({ storageState: STORAGE_STATE_PATH });

test('verify pending post flow after fix', async ({ page }) => {
  // Capture API responses
  const apiResponses: any[] = [];
  page.on('response', async response => {
    if (response.url().includes('/api/forum/posts') && response.request().method() === 'POST') {
      let body = '';
      try { body = await response.text(); } catch {}
      apiResponses.push({
        url: response.url(),
        status: response.status(),
        body,
      });
    }
  });

  // Navigate to new post page
  await page.goto(`${STAGING_URL}/bbs/new`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Verify we're logged in (not redirected to login)
  expect(page.url()).toContain('/bbs/new');

  // Select category
  await page.locator('button:has-text("跨境生活")').first().click();
  await page.waitForTimeout(500);

  // Fill form with unique title
  const timestamp = Date.now();
  const title = `[E2E][FORUM] ${timestamp} pending流程验证`;
  const content = `自动化测试内容，验证 pending 发帖流程修复。\n\n时间：${new Date().toISOString()}`;

  await page.locator('input#title').fill(title);
  await page.locator('textarea[placeholder*="帖子内容"]').fill(content);

  // Submit
  await page.locator('button:has-text("发布帖子")').click();

  // Wait for navigation
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  // Check results
  const finalUrl = page.url();
  console.log('\n=== PENDING POST FLOW VERIFICATION ===');
  console.log('Final URL:', finalUrl);

  // Check API response
  const postResponse = apiResponses.find(r => r.url.includes('/api/forum/posts'));
  if (postResponse) {
    console.log('API Status:', postResponse.status);
    try {
      const data = JSON.parse(postResponse.body);
      console.log('API slug:', data.post?.slug);
      console.log('API status:', data.post?.status);
      
      // Save evidence
      const evidence = {
        apiUrl: postResponse.url,
        apiStatus: postResponse.status,
        postSlug: data.post?.slug,
        postStatus: data.post?.status,
        finalUrl,
        redirectCorrect: finalUrl.includes('/bbs?created=1') || finalUrl.includes(`/bbs/${data.post?.slug}`),
        noPublicDetailRedirect: !finalUrl.includes(`/bbs/${data.post?.slug}`) || data.post?.status === 'published',
      };
      
      const evidencePath = path.join(ARTIFACT_DIR, 'pending-flow-evidence.json');
      fs.writeFileSync(evidencePath, JSON.stringify(evidence, null, 2));
      console.log('\nEvidence saved to:', evidencePath);
      console.log(JSON.stringify(evidence, null, 2));
      
      // Assertions
      expect(postResponse.status).toBe(201);
      expect(data.post?.slug).toBeTruthy();
      expect(data.post?.status).toBe('pending');
      expect(finalUrl).toContain('/bbs?created=1');
    } catch (e) {
      console.log('Parse error:', e);
      console.log('Raw body:', postResponse.body);
    }
  } else {
    console.log('No API response captured');
  }

  // Take screenshot
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'pending-flow-result.png'), fullPage: true });
});
