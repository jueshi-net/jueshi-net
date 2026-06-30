#!/usr/bin/env tsx
/**
 * v1.20.42.18.6.16.6.52 Single Page PNG Pixel Analysis
 * 
 * 实际导出 PNG 并分析像素，验证非空白
 */

import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { PNG } from 'pngjs';

const EVIDENCE_DIR = path.join(process.cwd(), 'evidence', 'single-page-png-v6.52');
const BASE_URL = 'https://i.jueshi.net';
const TEST_EMAIL = 'test@jueshi.net';
const TEST_PASSWORD = 'Test123456!';

async function setup() {
  if (!fs.existsSync(EVIDENCE_DIR)) {
    fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
  }
}

async function analyzePngPixels(pngPath: string): Promise<{
  totalPixels: number;
  nonWhitePixels: number;
  nonWhitePercentage: number;
  width: number;
  height: number;
}> {
  return new Promise((resolve, reject) => {
    fs.createReadStream(pngPath)
      .pipe(new PNG())
      .on('parsed', function(this: PNG) {
        const width = this.width;
        const height = this.height;
        const totalPixels = width * height;
        let nonWhitePixels = 0;

        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const idx = (width * y + x) << 2;
            const r = this.data[idx];
            const g = this.data[idx + 1];
            const b = this.data[idx + 2];
            
            // 非白色像素：RGB 不全为 255
            if (r !== 255 || g !== 255 || b !== 255) {
              nonWhitePixels++;
            }
          }
        }

        resolve({
          totalPixels,
          nonWhitePixels,
          nonWhitePercentage: (nonWhitePixels / totalPixels) * 100,
          width,
          height,
        });
      })
      .on('error', reject);
  });
}

async function main() {
  console.log('=== v1.20.42.18.6.16.6.52 Single Page PNG Pixel Analysis ===\n');
  
  await setup();
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--disable-web-security']
  });
  const context = await browser.newContext({
    acceptDownloads: true,
  });
  const page = await context.newPage();
  
  try {
    // 登录
    console.log('1. 登录...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(3000);
    
    // 关闭 Cookie 同意弹窗
    try {
      const cookieButton = page.locator('button:has-text("我知道了")');
      await cookieButton.click({ timeout: 5000 });
      console.log('Cookie 弹窗已关闭');
      await page.waitForTimeout(1000);
    } catch (e) {
      console.log('无 Cookie 弹窗或已关闭');
    }
    
    // 等待表单加载
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    
    // 监听网络请求
    const loginPromise = page.waitForResponse(
      response => response.url().includes('/api/auth/callback') || response.url().includes('/api/auth/signin'),
      { timeout: 15000 }
    ).catch(() => null);
    
    await page.click('button:has-text("登录")');
    
    // 等待登录响应
    const loginResponse = await loginPromise;
    if (loginResponse) {
      console.log(`登录响应: ${loginResponse.status()}`);
    }
    
    await page.waitForTimeout(8000);
    
    const currentUrl = page.url();
    console.log(`当前 URL: ${currentUrl}`);
    
    // 检查是否有登录错误消息
    const loginError = await page.locator('[role="alert"], .error-message, .text-red-500').textContent().catch(() => null);
    if (loginError) {
      console.log(`登录错误消息: ${loginError}`);
    }
    
    if (currentUrl.includes('/login')) {
      console.log('❌ 登录失败');
      await browser.close();
      process.exit(1);
    }
    console.log('✅ 登录成功\n');
    
    // 打开画布编辑器
    console.log('2. 打开画布编辑器...');
    await page.goto(`${BASE_URL}/tools/template-studio/canvas/new`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(5000);
    console.log('✅ 画布编辑器已打开\n');
    
    // 添加文本元素
    console.log('3. 添加文本元素...');
    const addTextBtn = page.locator('[data-testid="canvas-add-text"]');
    await addTextBtn.click();
    await page.waitForTimeout(2000);
    console.log('✅ 文本元素已添加\n');
    
    // 导出前截图
    console.log('4. 导出前截图...');
    const beforeScreenshot = await page.screenshot({ 
      path: path.join(EVIDENCE_DIR, 'before-export.png'),
      fullPage: false 
    });
    console.log('✅ 导出前截图已保存\n');
    
    // 导出 PNG
    console.log('5. 导出 PNG...');
    
    // 监听下载事件
    const downloadPromise = page.waitForEvent('download', { timeout: 30000 }).catch(() => null);
    
    await page.click('[data-testid="canvas-png-export-button"]');
    
    // 等待导出完成
    await page.waitForTimeout(5000);
    
    // 检查导出状态
    const exportStatus = await page.evaluate(() => {
      const btn = document.querySelector('[data-testid="canvas-png-export-button"]');
      return btn?.textContent || '';
    });
    console.log(`导出状态: ${exportStatus}`);
    
    // 检查是否有导出错误消息
    const exportError = await page.evaluate(() => {
      const alert = document.querySelector('[role="alert"], .error-message, .text-red-500, .bg-red-50');
      return alert?.textContent || null;
    });
    if (exportError) {
      console.log(`导出错误消息: ${exportError}`);
    }
    
    const download = await downloadPromise;
    
    if (!download) {
      console.log('❌ PNG 导出失败 - 没有下载事件');
      await browser.close();
      process.exit(1);
    }
    
    console.log('✅ PNG 导出成功\n');
    
    // 保存 PNG 文件
    const pngPath = path.join(EVIDENCE_DIR, 'exported.png');
    await download.saveAs(pngPath);
    console.log(`✅ PNG 已保存: ${pngPath}\n`);
    
    // 分析像素
    console.log('6. 分析 PNG 像素...');
    const pixelAnalysis = await analyzePngPixels(pngPath);
    console.log(`图片尺寸: ${pixelAnalysis.width} x ${pixelAnalysis.height}`);
    console.log(`总像素数: ${pixelAnalysis.totalPixels.toLocaleString()}`);
    console.log(`非白色像素: ${pixelAnalysis.nonWhitePixels.toLocaleString()}`);
    console.log(`非白色比例: ${pixelAnalysis.nonWhitePercentage.toFixed(2)}%\n`);
    
    // 验证多页 guard
    console.log('7. 验证多页 PNG guard...');
    
    // 切换到 repeat 模式
    const batchModeSelect = page.locator('select[data-testid="canvas-batch-mode"]');
    if (await batchModeSelect.isVisible()) {
      await batchModeSelect.selectOption('repeat');
      await page.waitForTimeout(1000);
      console.log('已切换到 repeat 模式');
    }
    
    // 设置 packageCount > 1
    const packageCountInput = page.locator('input[data-testid="canvas-package-count"]');
    if (await packageCountInput.isVisible()) {
      await packageCountInput.fill('10');
      await page.waitForTimeout(1000);
      console.log('已设置 packageCount = 10');
    }
    
    const guardVisible = await page.locator('[data-testid="canvas-multipage-png-notice"]').isVisible();
    console.log(`多页 guard 可见: ${guardVisible}\n`);
    
    // 保存结果
    const result = {
      timestamp: new Date().toISOString(),
      exportStatus,
      pixelAnalysis,
      multipageGuardVisible: guardVisible,
      pngPath,
      screenshotPath: path.join(EVIDENCE_DIR, 'before-export.png'),
    };
    
    fs.writeFileSync(
      path.join(EVIDENCE_DIR, 'pixel-analysis.json'),
      JSON.stringify(result, null, 2)
    );
    
    // 判定
    const isNotBlank = pixelAnalysis.nonWhitePercentage > 1;
    const hasGuard = guardVisible;
    
    console.log('=== 判定结果 ===');
    console.log(`PNG 非空白: ${isNotBlank ? '✅' : '❌'} (${pixelAnalysis.nonWhitePercentage.toFixed(2)}% > 1%)`);
    console.log(`多页 guard: ${hasGuard ? '✅' : '❌'}`);
    
    if (isNotBlank && hasGuard) {
      console.log('\n✅ TEMPLATE_SINGLE_PAGE_PNG_READY_FOR_USER_TEST');
      await browser.close();
      process.exit(0);
    } else {
      console.log('\n❌ TEMPLATE_SINGLE_PAGE_PNG_STILL_BLANK');
      await browser.close();
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ 错误:', error);
    await browser.close();
    process.exit(1);
  }
}

main();
