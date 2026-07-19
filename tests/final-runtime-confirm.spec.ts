import { test, expect } from '@playwright/test';

const BASE_URL = 'https://i.jueshi.net';
const STORAGE_STATE = 'tools/jueshi-audit/artifacts/storage-state/user-session.json';
const TIMESTAMP = Date.now();

test('final runtime confirmation - pending post flow', async ({ browser }) => {
  const context = await browser.newContext({
    storageState: STORAGE_STATE,
  });
  const page = await context.newPage();

  // Step 1: Verify login state
  await page.goto(`${BASE_URL}/bbs/new`);
  await page.waitForLoadState('networkidle');
  
  const currentUrl = page.url();
  console.log('AUTH_URL:', currentUrl);
  
  expect(currentUrl).toContain('/bbs/new');
  expect(currentUrl).not.toContain('/login');
  console.log('AUTH_SESSION_RESULT=VALID');

  // Verify form is visible
  const form = page.locator('form');
  await expect(form).toBeVisible({ timeout: 5000 });
  console.log('FORM_VISIBLE=true');

  // Step 2: Select category (click on card)
  const categoryCard = page.locator('text=综合讨论').first();
  await categoryCard.click();
  await page.waitForTimeout(500);
  console.log('CATEGORY_SELECTED=综合讨论');

  // Step 3: Fill title
  const titleInput = page.locator('input[placeholder*="标题"]').first();
  await titleInput.fill(`[E2E][FORUM] ${TIMESTAMP} 最终运行确认`);
  console.log('TITLE_FILLED=true');

  // Step 4: Fill content
  const contentInput = page.locator('textarea').first();
  await contentInput.fill(`这是虚构测试内容，用于验证 pending 发帖流程。\n\n时间戳: ${new Date().toISOString()}`);
  console.log('CONTENT_FILLED=true');

  // Step 5: Submit and intercept API response
  const responsePromise = page.waitForResponse(
    (resp) => resp.url().includes('/api/bbs/posts') && resp.request().method() === 'POST',
    { timeout: 15000 }
  );

  await page.click('button[type="submit"]');

  const response = await responsePromise;
  const status = response.status();
  const body = await response.json();

  console.log('POST_API_STATUS:', status);
  console.log('POST_RESPONSE_BODY:', JSON.stringify(body, null, 2));

  // Verify API response
  expect(status).toBe(201);
  expect(body.success).toBe(true);
  expect(body.post).toBeDefined();
  expect(body.post.slug).toBeDefined();
  expect(body.post.status).toBe('pending');

  const slug = body.post.slug;
  const postStatus = body.post.status;

  console.log('POST_RESPONSE_SLUG:', slug);
  console.log('POST_RESPONSE_STATUS:', postStatus);

  // Step 6: Verify redirect
  await page.waitForURL(/\/bbs(\?|$)/, { timeout: 5000 });
  const redirectUrl = page.url();
  console.log('POST_REDIRECT_URL:', redirectUrl);

  expect(redirectUrl).toContain('created=1');
  expect(redirectUrl).toContain('status=pending');

  // Step 7: Verify success message
  const successBanner = page.locator('text=审核通过后将在社区公开').first();
  await expect(successBanner).toBeVisible({ timeout: 5000 });
  console.log('PENDING_SUCCESS_MESSAGE=审核通过后将在社区公开');

  // Step 8: Verify no 404
  expect(redirectUrl).not.toContain('/bbs/not-found');
  console.log('PUBLIC_DETAIL_REDIRECTED=false');
  console.log('NO_404=true');

  // Step 9: Verify no error toast
  const errorToast = page.locator('[role="alert"], .toast-error').first();
  const hasError = await errorToast.isVisible().catch(() => false);
  console.log('ERROR_TOAST_VISIBLE:', hasError);

  await context.close();
});
