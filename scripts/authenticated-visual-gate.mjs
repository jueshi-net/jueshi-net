#!/usr/bin/env node
/**
 * v1.20.42.15.0.2 Authenticated Visual Gate - Login Test
 * 
 * 测试登录并截图
 */

import { chromium } from 'playwright';
import fs from 'fs/promises';

const BASE_URL = 'https://jueshi.net';
const SCREENSHOT_DIR = 'reports/screenshots/v1.20.42.15.0.2';

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

async function loginWithNextAuth(page, email, password) {
  console.log(`🔐 尝试登录: ${email}`);
  
  // 访问登录页面
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  // 检查是否已登录
  const currentUrl = page.url();
  if (currentUrl.includes('/workspace') || currentUrl.includes('/admin')) {
    console.log('✅ 已登录');
    return true;
  }
  
  try {
    // 等待表单加载
    await page.waitForSelector('input[type="email"]', { timeout: 5000 });
    
    // 填写登录表单
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    
    // 点击登录按钮
    await page.click('button[type="submit"]');
    
    // 等待登录完成
    await page.waitForTimeout(5000);
    
    // 检查是否成功登录
    const newUrl = page.url();
    console.log(`📍 登录后 URL: ${newUrl}`);
    
    if (newUrl.includes('/workspace') || newUrl.includes('/admin')) {
      console.log('✅ 登录成功');
      return true;
    } else {
      console.log('⚠️  登录可能失败，仍在登录页面');
      // 检查是否有错误消息
      const errorMsg = await page.$eval('.text-red-500, .error-message, [role="alert"]', el => el.textContent).catch(() => null);
      if (errorMsg) {
        console.log(`❌ 登录错误: ${errorMsg}`);
      }
      return false;
    }
  } catch (error) {
    console.error('❌ 登录失败:', error.message);
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
  
  // 登录
  const loggedIn = await loginWithNextAuth(page, email, password);
  
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
    
    // 登录
    const loggedIn = await loginWithNextAuth(page, email, password);
    
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
  console.log('🚀 v1.20.42.15.0.2 Authenticated Visual Gate - Login Test');
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`📁 Screenshot Directory: ${SCREENSHOT_DIR}`);
  
  // 确保截图目录存在
  await fs.mkdir(SCREENSHOT_DIR, { recursive: true });
  
  // 从环境变量读取账号密码（不硬编码）
  const email = process.env.TEST_EMAIL || 'test@jueshi.net';
  const password = process.env.TEST_PASSWORD || 'Test123456!';
  
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
