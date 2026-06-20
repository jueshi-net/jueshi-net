#!/usr/bin/env node
/**
 * v1.20.42.15.0.1 Production Visual Acceptance Screenshots - Login Fix
 * 
 * 使用正确的 NextAuth 登录流程
 */

import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';

const BASE_URL = 'https://jueshi.net';
const SCREENSHOT_DIR = 'reports/screenshots/v1.20.42.15.0.1';

// 桌面页面列表
const DESKTOP_PAGES = [
  { name: 'workspace-home-desktop', url: '/workspace' },
  { name: 'workspace-tasks-desktop', url: '/workspace/tasks' },
  { name: 'workspace-documents-desktop', url: '/workspace/documents' },
  { name: 'workspace-member-desktop', url: '/workspace/member' },
  { name: 'workspace-invites-desktop', url: '/workspace/invites' },
  { name: 'workspace-products-desktop', url: '/workspace/products' },
  { name: 'workspace-company-profiles-desktop', url: '/workspace/company-profiles' },
  { name: 'workspace-notifications-desktop', url: '/workspace/notifications' },
  { name: 'workspace-settings-desktop', url: '/workspace/settings' },
  { name: 'admin-dashboard-desktop', url: '/admin' },
  { name: 'admin-analytics-desktop', url: '/admin/analytics/dashboard' },
  { name: 'admin-resources-desktop', url: '/admin/resources' },
  { name: 'admin-landing-pages-desktop', url: '/admin/landing-pages' },
  { name: 'admin-ad-entitlements-desktop', url: '/admin/ad-entitlements' },
];

// 移动页面列表
const MOBILE_PAGES = {
  375: [
    { name: 'workspace-home-mobile-375', url: '/workspace' },
    { name: 'workspace-tasks-mobile-375', url: '/workspace/tasks' },
    { name: 'workspace-documents-mobile-375', url: '/workspace/documents' },
    { name: 'workspace-member-mobile-375', url: '/workspace/member' },
    { name: 'workspace-invites-mobile-375', url: '/workspace/invites' },
  ],
  390: [
    { name: 'workspace-home-mobile-390', url: '/workspace' },
    { name: 'workspace-products-mobile-390', url: '/workspace/products' },
    { name: 'admin-analytics-mobile-390', url: '/admin/analytics/dashboard' },
    { name: 'admin-resources-mobile-390', url: '/admin/resources' },
  ],
  430: [
    { name: 'workspace-home-mobile-430', url: '/workspace' },
    { name: 'workspace-documents-mobile-430', url: '/workspace/documents' },
    { name: 'workspace-member-mobile-430', url: '/workspace/member' },
  ],
};

async function loginWithNextAuth(page) {
  console.log('🔐 尝试 NextAuth 登录...');
  
  // 访问登录页面
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  // 检查是否已登录
  const currentUrl = page.url();
  if (currentUrl.includes('/workspace') || currentUrl.includes('/admin')) {
    console.log('✅ 已登录');
    return true;
  }
  
  // 使用测试账号登录
  const testEmail = 'test@jueshi.net';
  const testPassword = 'Test123456!';
  
  try {
    // 等待表单加载
    await page.waitForSelector('input[type="email"]', { timeout: 5000 });
    
    // 填写登录表单
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    
    // 点击登录按钮
    await page.click('button[type="submit"]');
    
    // 等待登录完成（等待 URL 变化或网络空闲）
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
      const errorMsg = await page.$eval('.text-red-500, .error-message', el => el.textContent).catch(() => null);
      if (errorMsg) {
        console.log(`❌ 登录错误: ${errorMsg}`);
      }
      return false;
    }
  } catch (error) {
    console.error(' 登录失败:', error.message);
    return false;
  }
}

async function takeDesktopScreenshots(browser) {
  console.log('\n 开始生成桌面截图（1440px）...');
  
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  
  const page = await context.newPage();
  
  // 登录
  const loggedIn = await loginWithNextAuth(page);
  
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

async function takeMobileScreenshots(browser) {
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
    const loggedIn = await loginWithNextAuth(page);
    
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
  console.log('🚀 v1.20.42.15.0.1 Production Visual Acceptance Screenshots - Login Fix');
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`📁 Screenshot Directory: ${SCREENSHOT_DIR}`);
  
  // 确保截图目录存在
  await fs.mkdir(SCREENSHOT_DIR, { recursive: true });
  
  const browser = await chromium.launch({
    headless: true,
  });
  
  try {
    await takeDesktopScreenshots(browser);
    await takeMobileScreenshots(browser);
    
    console.log('\n✅ 所有截图生成完成！');
  } catch (error) {
    console.error('\n❌ 截图生成失败:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main();
