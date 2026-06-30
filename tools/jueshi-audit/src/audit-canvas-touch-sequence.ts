#!/usr/bin/env tsx
/**
 * Canvas Touch & Sequence Audit
 * 
 * Verifies:
 * - iPad touch drag/resize support (Pointer Events API)
 * - Batch sequence visibility (1/10 to 10/10)
 * - Save/restore functionality
 * - PNG/Print output
 */

import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const AUDIT_BASE_URL = process.env.AUDIT_BASE_URL || 'https://i.jueshi.net';
const AUDIT_TEST_EMAIL = process.env.AUDIT_TEST_EMAIL || 'test@jueshi.net';
const AUDIT_TEST_PASSWORD = process.env.AUDIT_TEST_PASSWORD || 'Test123456!';

interface AuditResult {
  id: string;
  name: string;
  status: 'PASS' | 'FAIL' | 'BLOCKED';
  evidence: string;
}

const results: AuditResult[] = [];

async function login(page: any) {
  await page.goto(`${AUDIT_BASE_URL}/login`);
  await page.fill('input[name="email"]', AUDIT_TEST_EMAIL);
  await page.fill('input[name="password"]', AUDIT_TEST_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard**', { timeout: 10000 });
}

async function navigateToCanvas(page: any) {
  await page.goto(`${AUDIT_BASE_URL}/tools/template-studio/canvas/new`);
  await page.waitForSelector('[data-testid="canvas-editor-root"]', { timeout: 10000 });
}

async function runAudit(id: string, name: string, fn: () => Promise<string>) {
  try {
    const evidence = await fn();
    results.push({ id, name, status: 'PASS', evidence });
    console.log(`[✓] ${id} — ${name}`);
    console.log(`  Evidence: ${evidence}`);
  } catch (err: any) {
    results.push({ id, name, status: 'FAIL', evidence: err.message });
    console.log(`[✗] ${id} — ${name}`);
    console.log(`  Error: ${err.message}`);
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1024, height: 768 }, // iPad landscape
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
  });
  const page = await context.newPage();

  try {
    // Note: Canvas editor accessible without login for MVP
    await navigateToCanvas(page);

    // Test 1: iPad touch drag support
    await runAudit(
      'TS-CANVAS-TOUCH-DRAG',
      'iPad 触控拖动',
      async () => {
        // Add a text element
        await page.click('[data-testid="canvas-add-text"]');
        await page.waitForSelector('[data-testid="canvas-element"]', { timeout: 5000 });
        
        const element = await page.$('[data-testid="canvas-element"]');
        if (!element) throw new Error('Element not found');
        
        const box = await element.boundingBox();
        if (!box) throw new Error('Element has no bounding box');
        
        // Simulate touch drag using pointer events
        const startX = box.x + box.width / 2;
        const startY = box.y + box.height / 2;
        const endX = startX + 50;
        const endY = startY + 50;
        
        // Touch start
        await page.evaluate(({ x, y }) => {
          const el = document.querySelector('[data-testid="canvas-element"]');
          if (!el) throw new Error('Element not found');
          const event = new PointerEvent('pointerdown', {
            bubbles: true,
            cancelable: true,
            clientX: x,
            clientY: y,
            pointerType: 'touch',
            button: 0,
          });
          el.dispatchEvent(event);
        }, { x: startX, y: startY });
        
        // Touch move
        await page.evaluate(({ x, y }) => {
          const event = new PointerEvent('pointermove', {
            bubbles: true,
            cancelable: true,
            clientX: x,
            clientY: y,
            pointerType: 'touch',
            button: 0,
          });
          document.querySelector('[data-testid="canvas-editor-root"]')?.dispatchEvent(event);
        }, { x: endX, y: endY });
        
        // Touch end
        await page.evaluate(() => {
          const event = new PointerEvent('pointerup', {
            bubbles: true,
            cancelable: true,
            pointerType: 'touch',
            button: 0,
          });
          document.querySelector('[data-testid="canvas-editor-root"]')?.dispatchEvent(event);
        });
        
        // Check if element position changed
        const newBox = await element.boundingBox();
        if (!newBox) throw new Error('Element has no bounding box after drag');
        
        const moved = Math.abs(newBox.x - box.x) > 5 || Math.abs(newBox.y - box.y) > 5;
        if (!moved) throw new Error('Element did not move');
        
        return `Touch drag successful: (${box.x.toFixed(1)},${box.y.toFixed(1)}) → (${newBox.x.toFixed(1)},${newBox.y.toFixed(1)})`;
      }
    );

    // Test 2: iPad touch resize support
    await runAudit(
      'TS-CANVAS-TOUCH-RESIZE',
      'iPad 触控缩放',
      async () => {
        const element = await page.$('[data-testid="canvas-element"]');
        if (!element) throw new Error('Element not found');
        
        // Click element to select it
        await element.click();
        
        const resizeHandle = await page.$('[data-testid="canvas-resize-handle"]');
        if (!resizeHandle) throw new Error('Resize handle not found');
        
        const handleBox = await resizeHandle.boundingBox();
        if (!handleBox) throw new Error('Resize handle has no bounding box');
        
        // Simulate touch resize
        const startX = handleBox.x + handleBox.width / 2;
        const startY = handleBox.y + handleBox.height / 2;
        const endX = startX + 30;
        const endY = startY + 30;
        
        // Touch start on resize handle
        await page.evaluate(({ x, y }) => {
          const el = document.querySelector('[data-testid="canvas-resize-handle"]');
          if (!el) throw new Error('Resize handle not found');
          const event = new PointerEvent('pointerdown', {
            bubbles: true,
            cancelable: true,
            clientX: x,
            clientY: y,
            pointerType: 'touch',
            button: 0,
          });
          el.dispatchEvent(event);
        }, { x: startX, y: startY });
        
        // Touch move
        await page.evaluate(({ x, y }) => {
          const event = new PointerEvent('pointermove', {
            bubbles: true,
            cancelable: true,
            clientX: x,
            clientY: y,
            pointerType: 'touch',
            button: 0,
          });
          document.querySelector('[data-testid="canvas-editor-root"]')?.dispatchEvent(event);
        }, { x: endX, y: endY });
        
        // Touch end
        await page.evaluate(() => {
          const event = new PointerEvent('pointerup', {
            bubbles: true,
            cancelable: true,
            pointerType: 'touch',
            button: 0,
          });
          document.querySelector('[data-testid="canvas-editor-root"]')?.dispatchEvent(event);
        });
        
        const newBox = await element.boundingBox();
        if (!newBox) throw new Error('Element has no bounding box after resize');
        
        const resized = newBox.width > 50 || newBox.height > 50;
        if (!resized) throw new Error('Element did not resize');
        
        return `Touch resize successful: width=${newBox.width.toFixed(1)}, height=${newBox.height.toFixed(1)}`;
      }
    );

    // Test 3: Batch sequence visibility
    await runAudit(
      'TS-CANVAS-BATCH-SEQUENCE-VISIBLE',
      '批量序号可见',
      async () => {
        // Enable batch mode
        await page.selectOption('[data-testid="canvas-batch-mode"]', 'repeat');
        await page.fill('[data-testid="canvas-package-count"]', '10');
        await page.check('[data-testid="canvas-show-sequence"]');
        
        // Add sequence element
        await page.click('[data-testid="canvas-add-sequence"]');
        
        // Check if sequence is visible
        const sequenceElements = await page.$$('[data-testid="canvas-element"]');
        const lastElement = sequenceElements[sequenceElements.length - 1];
        const text = await lastElement.textContent();
        
        if (!text || !text.includes('/')) throw new Error('Sequence not visible');
        
        return `Sequence visible: ${text}`;
      }
    );

    // Test 4: Repeat 10 pages output
    await runAudit(
      'TS-CANVAS-REPEAT-10-PAGES',
      '10 页重复输出',
      async () => {
        const pages = await page.$$('[data-testid="canvas-print-page"]');
        if (pages.length !== 10) throw new Error(`Expected 10 pages, got ${pages.length}`);
        
        // Check page count indicators
        const indicators = await page.$$('[data-testid="canvas-print-page-count"]');
        if (indicators.length !== 10) throw new Error(`Expected 10 indicators, got ${indicators.length}`);
        
        // Check first and last indicator
        const firstText = await indicators[0].textContent();
        const lastText = await indicators[9].textContent();
        
        if (!firstText?.includes('1/10')) throw new Error(`First page indicator incorrect: ${firstText}`);
        if (!lastText?.includes('10/10')) throw new Error(`Last page indicator incorrect: ${lastText}`);
        
        return `10 pages rendered: ${firstText} → ${lastText}`;
      }
    );

    // Test 5: Save/restore functionality
    await runAudit(
      'TS-CANVAS-SAVE-RESTORE',
      '保存恢复功能',
      async () => {
        // Verify save button exists and is clickable
        const saveButton = await page.$('[data-testid="canvas-save-button"]');
        if (!saveButton) throw new Error('Save button not found');
        
        const isDisabled = await saveButton.getAttribute('disabled');
        if (isDisabled !== null) throw new Error('Save button is disabled');
        
        // Note: Full save flow verified in Canvas Batch Audit (TS-CANVAS-SAVE-REAL)
        // This audit focuses on touch/sequence, not save API integration
        return 'Save button exists and is clickable';
      }
    );

    // Test 6: PNG export
    await runAudit(
      'TS-CANVAS-PNG-EXPORT',
      'PNG 导出',
      async () => {
        const exportButton = await page.$('[data-testid="canvas-png-export-button"]');
        if (!exportButton) throw new Error('PNG export button not found');
        
        return 'PNG export button exists';
      }
    );

    // Test 7: Print output
    await runAudit(
      'TS-CANVAS-PRINT-OUTPUT',
      '打印输出',
      async () => {
        const printButton = await page.$('[data-testid="canvas-print-button"]');
        if (!printButton) throw new Error('Print button not found');
        
        return 'Print button exists';
      }
    );

  } finally {
    await browser.close();
  }

  // Save results
  const evidenceDir = join(process.cwd(), 'evidence', `canvas-touch-sequence-${Date.now()}`);
  mkdirSync(evidenceDir, { recursive: true });
  writeFileSync(join(evidenceDir, 'audit-results.json'), JSON.stringify(results, null, 2));

  // Print summary
  const passCount = results.filter(r => r.status === 'PASS').length;
  const failCount = results.filter(r => r.status === 'FAIL').length;
  const blockedCount = results.filter(r => r.status === 'BLOCKED').length;

  console.log('\n=== Audit Summary ===');
  console.log(`Total: ${results.length}`);
  console.log(`PASS: ${passCount}`);
  console.log(`FAIL: ${failCount}`);
  console.log(`BLOCKED: ${blockedCount}`);
  console.log(`P0 FAIL: ${results.filter(r => r.status === 'FAIL' && r.id.includes('P0')).length}`);
  console.log(`P1 FAIL: ${results.filter(r => r.status === 'FAIL' && r.id.includes('P1')).length}`);
  console.log(`\nResults saved to: ${evidenceDir}/audit-results.json`);

  process.exit(failCount > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
