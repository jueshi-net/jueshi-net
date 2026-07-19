import { test, expect } from '@playwright/test';

const BASE_URL = 'https://i.jueshi.net';
const TIMESTAMP = Date.now();

test('verify pending post flow', async ({ browser }) => {
  const context = await browser.newContext({
    storageState: 'scripts/storage-state-e2e.json',
  });
  const page = await context.newPage();

  // Navigate to post creation
  await page.goto(`${BASE_URL}/bbs/new`);
  await page.waitForLoadState('networkidle');

  // Fill form
  await page.fill('input[name="title"], #title', `[E2E] Pending Flow Verify ${TIMESTAMP}`);
  await page.fill('textarea[name="content"], #content', `Test content for pending flow verification at ${new Date().toISOString()}`);

  // Select first available category
  const categorySelect = page.locator('select[name="category"], #category').first();
  if (await categorySelect.isVisible()) {
    const options = await categorySelect.locator('option').all();
    if (options.length > 1) {
      await categorySelect.selectOption({ index: 1 });
    }
  }

  // Intercept API response
  const responsePromise = page.waitForResponse(
    (resp) => resp.url().includes('/api/bbs/posts') && resp.request().method() === 'POST',
    { timeout: 10000 }
  );

  // Submit
  await page.click('button[type="submit"]');

  // Wait for API response
  const response = await responsePromise;
  const status = response.status();
  const body = await response.json();

  console.log('API_STATUS:', status);
  console.log('API_RESPONSE:', JSON.stringify(body, null, 2));

  // Verify response structure
  expect(status).toBe(201);
  expect(body.success).toBe(true);
  expect(body.post).toBeDefined();
  expect(body.post.slug).toBeDefined();
  expect(body.post.status).toBe('pending');

  // Wait for redirect
  await page.waitForURL(/\/bbs(\?|$)/, { timeout: 5000 });
  const currentUrl = page.url();
  console.log('REDIRECT_URL:', currentUrl);

  // Verify redirect contains status=pending
  expect(currentUrl).toContain('created=1');
  expect(currentUrl).toContain('status=pending');

  // Verify success message
  const successMessage = await page.locator('text=审核通过后将在社区公开').first();
  await expect(successMessage).toBeVisible({ timeout: 5000 });
  console.log('SUCCESS_MESSAGE: visible');

  // Verify no 404
  expect(currentUrl).not.toContain('/bbs/not-found');
  console.log('NO_404: confirmed');

  await context.close();
});
