/**
 * Debug: Check login status and permissions
 */

import { chromium } from 'playwright';
import fs from 'fs';

const BASE_URL = 'https://jueshi.net';
const STORAGE_STATE_PATH = '/tmp/playwright-auth-state.json';

async function main() {
  console.log('=== Checking Login Status ===\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ storageState: STORAGE_STATE_PATH });
  const page = await context.newPage();
  
  // Check cookies
  const cookies = await context.cookies();
  console.log('Cookies:', cookies.length);
  cookies.forEach(c => {
    console.log(`  - ${c.name}: ${c.value.substring(0, 20)}...`);
  });
  
  // Navigate to page
  await page.goto(`${BASE_URL}/tools/documents/commercial-invoice`, { waitUntil: 'networkidle' });
  
  // Check if user is logged in by looking for user-specific elements
  const isLoggedIn = await page.evaluate(() => {
    // Check for logout button or user menu
    const logoutBtn = document.querySelector('button:has-text("退出"), button:has-text("登出")');
    const userMenu = document.querySelector('[data-user-menu], [class*="user-menu"]');
    const avatar = document.querySelector('img[alt*="avatar"], img[alt*="用户"]');
    return !!(logoutBtn || userMenu || avatar);
  });
  
  console.log('\nLogin status:', isLoggedIn ? '✓ Logged in' : '✗ Not logged in');
  
  // Check the "保存到工作台" button state
  const saveButtonState = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('保存到工作台'));
    if (!btn) return null;
    return {
      text: btn.textContent?.trim(),
      disabled: btn.disabled,
      className: btn.className,
      title: btn.title,
    };
  });
  
  console.log('\n"保存到工作台" button:');
  console.log(JSON.stringify(saveButtonState, null, 2));
  
  // Check for permission-related elements
  const permissionInfo = await page.evaluate(() => {
    // Look for role indicators
    const roleBadge = document.querySelector('span:has-text("未登录"), span:has-text("注册用户"), span:has-text("正式会员"), span:has-text("管理员")');
    return {
      roleBadge: roleBadge?.textContent?.trim() || 'Not found',
    };
  });
  
  console.log('\nPermission info:');
  console.log(JSON.stringify(permissionInfo, null, 2));
  
  // Try to access /api/auth/session to verify session
  const sessionResponse = await page.evaluate(async () => {
    try {
      const res = await fetch('/api/auth/session');
      const data = await res.json();
      return { status: res.status, data };
    } catch (e) {
      return { error: e.message };
    }
  });
  
  console.log('\nSession API response:');
  console.log(JSON.stringify(sessionResponse, null, 2));
  
  await browser.close();
}

main().catch(console.error);
