#!/usr/bin/env node
/**
 * v1.20.42.15.0.3 Authenticated Screenshot Gate - Real Browser Login
 * 
 * 使用真实浏览器流程登录，正确处理 CSRF token
 */

import { chromium } from 'playwright';
import fs from 'fs/promises';

const BASE_URL = 'https://jueshi.net';
const SCREENSHOT_DIR = 'reports/screenshots/v1.20.42.15.0.3';

// 桌面页面列表
const DESKTOP_PAGES = [
  { name: 'workspace-home-auth-desktop', url: '/workspace' },
  { name: 'workspace-tasks-auth-desktop', url: '/workspace/tasks' },
  { name: 'workspace-documents-auth-desktop', url: '/workspace/documents' },
  { name: 'workspace-member-auth-desktop', url: '/workspace/member' },
  { name: 'workspace-invites-auth-desktop', url: '/workspace/invites' },
  { name: 'workspace-products-auth-desktop', url: '/workspace/products' },
  { name: 'workspace-company-profiles-auth-desktop', url: '/workspace/company-profiles' },
  { name: 'workspace-notifications-auth-desktop', url: '/workspace/notifications' },
  { name: 'workspace-settings-auth-desktop', url: '/workspace/settings' },
  { name: 'workspace-favorites-auth-desktop', url: '/workspace/favorites' },
  { name: 'workspace-memos-auth-desktop', url: '/workspace/memos' },
];

// 移动页面列表
const MOBILE_PAGES = {
  375: [
    { name: 'workspace-home-auth-mobile-375', url: '/workspace' },
    { name: 'workspace-tasks-auth-mobile-375', url: '/workspace/tasks' },
    { name: 'workspace-documents-auth-mobile-375', url: '/workspace/documents' },
    { name: 'workspace-member-auth-mobile-375', url: '/workspace/member' },
    { name: 'workspace-invites-auth-mobile-375', url: '/workspace/invites' },
  ],
  390: [
    { name: 'workspace-home-auth-mobile-390', url: '/workspace' },
    { name: 'workspace-products-auth-mobile-390', url: '/workspace/products' },
  ],
  430: [
    { name: 'workspace-home-auth-mobile-430', url: '/workspace' },
    { name: 'workspace-documents-auth-mobile-430', url: '/workspace/documents' },
  ],
};

async function loginWithRealBrowser(page, email, password) {
  console.log(`🔐 使用真实浏览器流程登录: ${email}`);
  
  // 1. 访问登录页面
  console.log('📍 访问登录页面...');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  // 2. 检查是否已登录
  const currentUrl = page.url();
  if (currentUrl.includes('/workspace') || currentUrl.includes('/admin')) {
    console.log('✅ 已登录');
    return true;
  }
  
  // 3. 等待登录表单加载
  console.log('⏳ 等待登录表单...');
  try {
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.waitForSelector('input[type="password"]', { timeout: 5000 });
    await page.waitForSelector('button[type="submit"]', { timeout: 5000 });
  } catch (error) {
    console.error('❌ 登录表单加载失败:', error.message);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/login-form-error.png`, fullPage: true });
    return false;
  }
  
  // 4. 填写登录表单
  console.log('📝 填写登录表单...');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  
  // 5. 点击登录按钮
  console.log('🖱️ 点击登录按钮...');
  await page.click('button[type="submit"]');
  
  // 6. 等待登录完成（等待 URL 变化或网络空闲）
  console.log('⏳ 等待登录完成...');
  try {
    // 等待 URL 变化（跳转到 /workspace 或 /admin）
    await page.waitForURL('**/workspace**', { timeout: 15000 }).catch(() => null);
    await page.waitForURL('**/admin**', { timeout: 5000 }).catch(() => null);
    
    // 额外等待，确保页面完全加载
    await page.waitForTimeout(3000);
  } catch (error) {
    console.log('⚠️  等待跳转超时');
  }
  
  // 7. 检查是否成功登录
  const newUrl = page.url();
  console.log(`📍 登录后 URL: ${newUrl}`);
  
  if (newUrl.includes('/workspace') || newUrl.includes('/admin')) {
    console.log('✅ 登录成功');
    return true;
  } else if (newUrl.includes('/login')) {
    console.log('⚠️  仍在登录页面，登录可能失败');
    
    // 检查是否有错误消息
    const errorMsg = await page.$eval('.text-red-500, .error-message, [role="alert"], .bg-red-50', el => el.textContent).catch(() => null);
    if (errorMsg) {
      console.log(`❌ 登录错误: ${errorMsg.trim()}`);
    }
    
    // 截图登录失败页面
    await page.screenshot({ path: `${SCREENSHOT_DIR}/login-failed.png`, fullPage: true });
    console.log(`📸 已保存登录失败截图: ${SCREENSHOT_DIR}/login-failed.png`);
    
    return false;
  } else {
    console.log('⚠️  未知状态');
    await page.screenshot({ path: `${SCREENSHOT_DIR}/login-unknown.png`, fullPage: true });
    return false;
  }
}

async function takeDesktopScreenshots(browser, email, password) {
  console.log('\n📸 开始生成桌面截图（1440px）...');
  
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  
  const page = await context.newPage();
  
  // 使用真实浏览器流程登录
  const loggedIn = await loginWithRealBrowser(page, email, password);
  
  if (!loggedIn) {
    console.log('⚠️  登录失败，将截图登录保护页面');
  }
  
  for (const pageInfo of DESKTOP_PAGES) {
    const url = `${BASE_URL}${pageInfo.url}`;
    const filename = `${SCREENSHOT_DIR}/${pageInfo.name}.png`;
    
    console.log(`📷 截图: ${pageInfo.name} (${url})`);
    
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(2000);
      
      await page.screenshot({
        path: filename,
        fullPage: true,
      });
      
      console.log(`✅ 已保存: ${filename}`);
    } catch (error) {
      console.error(`❌ 截图失败: ${pageInfo.name}`, error.message);
    }
  }
  
  await context.close();
}

async function takeMobileScreenshots(browser, email, password) {
  console.log('\n📱 开始生成移动截图...');
  
  for (const [width, pages] of Object.entries(MOBILE_PAGES)) {
    console.log(`\n📱 宽度: ${width}px`);
    
    const context = await browser.newContext({
      viewport: { width: parseInt(width), height: 812 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    
    const page = await context.newPage();
    
    // 使用真实浏览器流程登录
    const loggedIn = await loginWithRealBrowser(page, email, password);
    
    if (!loggedIn) {
      console.log('⚠️  登录失败，将截图登录保护页面');
    }
    
    for (const pageInfo of pages) {
      const url = `${BASE_URL}${pageInfo.url}`;
      const filename = `${SCREENSHOT_DIR}/${pageInfo.name}.png`;
      
      console.log(`📷 截图: ${pageInfo.name} (${url})`);
      
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(2000);
        
        await page.screenshot({
          path: filename,
          fullPage: true,
        });
        
        console.log(`✅ 已保存: ${filename}`);
      } catch (error) {
        console.error(`❌ 截图失败: ${pageInfo.name}`, error.message);
      }
    }
    
    await context.close();
  }
}

async function main() {
  console.log('🚀 v1.20.42.15.0.3 Authenticated Screenshot Gate - Real Browser Login');
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`📁 Screenshot Directory: ${SCREENSHOT_DIR}`);
  
  // 确保截图目录存在
  await fs.mkdir(SCREENSHOT_DIR, { recursive: true });
  
  // 从环境变量读取账号密码（不硬编码）
  const email = process.env.TEST_EMAIL || 'test@jueshi.net';
  const password = process.env.TEST_PASSWORD || '***';
  
  const browser = await chromium.launch({
    headless: true,
  });
  
  try {
    await takeDesktopScreenshots(browser, email, password);
    await takeMobileScreenshots(browser, email, password);
    
    console.log('\n✅ 所有截图生成完成！');
  } catch (error) {
    console.error('\n❌ 截图生成失败:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main();
