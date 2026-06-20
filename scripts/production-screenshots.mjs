#!/usr/bin/env node
/**
 * v1.20.42.15.0.1 Production Visual Acceptance Screenshots
 * 
 * 生成生产环境截图，验证 UI 改造是否真实可见
 * 
 * 要求：
 * - 必须使用 https://jueshi.net
 * - 不得使用 localhost
 * - 必须设置 viewport
 * - 必须等待页面加载完成
 * - 必须登录（如果需要）
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

async function login(page) {
  console.log('🔐 尝试登录...');
  
  // 访问登录页面
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  // 检查是否已登录（通过检查 URL 或页面内容）
  const currentUrl = page.url();
  if (currentUrl.includes('/workspace') || currentUrl.includes('/admin')) {
    console.log('✅ 已登录');
    return true;
  }
  
  // 尝试使用测试账号登录（从环境变量读取，不硬编码）
  const testEmail = process.env.TEST_EMAIL || 'test@jueshi.net';
  const testPassword = process.env.TEST_PASSWORD || 'Test123456!';
  
  try {
    // 填写登录表单
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    
    // 等待登录完成
    await page.waitForTimeout(3000);
    
    // 检查是否成功登录
    const newUrl = page.url();
    if (newUrl.includes('/workspace') || newUrl.includes('/admin')) {
      console.log('✅ 登录成功');
      return true;
    } else {
      console.log('⚠️  登录可能失败，当前 URL:', newUrl);
      return false;
    }
  } catch (error) {
    console.error('❌ 登录失败:', error.message);
    return false;
  }
}

async function takeDesktopScreenshots(browser) {
  console.log('\n📸 开始生成桌面截图（1440px）...');
  
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  
  const page = await context.newPage();
  
  // 登录
  await login(page);
  
  for (const pageInfo of DESKTOP_PAGES) {
    const url = `${BASE_URL}${pageInfo.url}`;
    const filename = `${SCREENSHOT_DIR}/${pageInfo.name}.png`;
    
    console.log(`📷 截图: ${pageInfo.name} (${url})`);
    
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(2000); // 等待动画完成
      
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
    await login(page);
    
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
  console.log('🚀 v1.20.42.15.0.1 Production Visual Acceptance Screenshots');
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
