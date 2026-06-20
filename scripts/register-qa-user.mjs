#!/usr/bin/env node
/**
 * v1.20.42.15.0.3 QA User Registration
 * 
 * 通过正常注册流程创建 QA 用户
 */

import { chromium } from 'playwright';

const BASE_URL = 'https://jueshi.net';

async function registerQAUser() {
  console.log(' 创建 QA 用户...');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  
  const page = await context.newPage();
  
  // 生成 QA 用户邮箱
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:T]/g, '').slice(0, 12);
  const qaEmail = `visual-qa-${timestamp}@jueshi.net`;
  const qaPassword = 'QA-Test-2026!';
  
  console.log(`📧 QA 邮箱: ${qaEmail}`);
  
  try {
    // 访问注册页面
    await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // 检查是否有注册表单
    const hasRegisterForm = await page.$eval('input[type="email"], input[name="email"]', el => true).catch(() => false);
    
    if (!hasRegisterForm) {
      console.log('❌ 未找到注册表单');
      await page.screenshot({ path: 'reports/screenshots/v1.20.42.15.0.3/register-page.png', fullPage: true });
      return null;
    }
    
    // 填写注册表单
    console.log(' 填写注册表单...');
    
    // 尝试不同的选择器
    const emailInput = await page.$('input[type="email"]') || await page.$('input[name="email"]');
    const passwordInput = await page.$('input[type="password"]') || await page.$('input[name="password"]');
    const submitButton = await page.$('button[type="submit"]') || await page.$('button:has-text("注册")');
    
    if (!emailInput || !passwordInput || !submitButton) {
      console.log('❌ 未找到表单元素');
      await page.screenshot({ path: 'reports/screenshots/v1.20.42.15.0.3/register-form.png', fullPage: true });
      return null;
    }
    
    await emailInput.fill(qaEmail);
    await passwordInput.fill(qaPassword);
    
    // 点击注册按钮
    console.log('🖱️ 点击注册按钮...');
    await submitButton.click();
    
    // 等待注册完成
    await page.waitForTimeout(5000);
    
    // 检查是否注册成功
    const currentUrl = page.url();
    console.log(`📍 注册后 URL: ${currentUrl}`);
    
    if (currentUrl.includes('/login') || currentUrl.includes('/workspace')) {
      console.log('✅ 注册成功');
      
      // 保存 QA 用户信息到文件（不输出到控制台）
      const qaInfo = {
        email: qaEmail,
        password: qaPassword,
        createdAt: now.toISOString(),
        purpose: 'v1.20.42.15.0.3 visual acceptance QA',
      };
      
      await import('fs/promises').then(fs => 
        fs.writeFile('reports/screenshots/v1.20.42.15.0.3/qa-user-info.json', JSON.stringify(qaInfo, null, 2))
      );
      
      console.log('📝 QA 用户信息已保存到 reports/screenshots/v1.20.42.15.0.3/qa-user-info.json');
      
      return qaInfo;
    } else {
      console.log('⚠️  注册可能失败');
      await page.screenshot({ path: 'reports/screenshots/v1.20.42.15.0.3/register-failed.png', fullPage: true });
      return null;
    }
  } catch (error) {
    console.error('❌ 注册失败:', error.message);
    await page.screenshot({ path: 'reports/screenshots/v1.20.42.15.0.3/register-error.png', fullPage: true });
    return null;
  } finally {
    await browser.close();
  }
}

registerQAUser();
