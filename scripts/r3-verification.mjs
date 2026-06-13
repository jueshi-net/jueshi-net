/**
 * v1.20.42.6.71-R3 Logged-in Verification Script
 * Tests: Packing List, Proforma Invoice, Container
 * - Login verification
 * - Save draft / restore
 * - Export (PNG, Word)
 * - Workspace visibility
 * - 375px mobile layout
 */
import { chromium } from 'playwright';
import fs from 'fs';

const BASE = 'http://localhost:3000';
const EMAIL = 'test@jueshi.net';
const PASSWORD = '[REDACTED]';

const results = {
  login: { success: false, method: '' },
  packingList: {
    page200: false,
    fillExample: false,
    fieldsEditable: false,
    preview: false,
    saveDraft: { success: false, draftId: null, apiResponse: null },
    restore: { success: false, path: '' },
    workspaceVisible: false,
    pngExport: { clicked: false, error: null },
    wordExport: { clicked: false, error: null },
    printButton: false,
    companyProfile: { reused: false, note: '' },
    mobile375: { pass: false, issues: [] }
  },
  proformaInvoice: {
    page200: false,
    fillExample: false,
    fieldsEditable: false,
    preview: false,
    subtotalLogic: false,
    bankInfo: false,
    saveDraft: { success: false, draftId: null, apiResponse: null },
    restore: { success: false, path: '' },
    workspaceVisible: false,
    pngExport: { clicked: false, error: null },
    wordExport: { clicked: false, error: null },
    printButton: false,
    companyProfile: { reused: false, note: '' },
    mobile375: { pass: false, issues: [] }
  },
  container: {
    page200: false,
    fillExample: false,
    singleCBM: null,
    totalCBM: null,
    totalWeight: null,
    batchVolumeUtil20GP: null,
    batchWeightUtil20GP: null,
    maxItems20GP: null,
    batches20GP: null,
    misleadingText: false,
    mobile375: { pass: false, issues: [] }
  }
};

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  // Collect console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', err => consoleErrors.push(err.message));

  // ========== 1. LOGIN ==========
  console.log('=== Step 1: Login ===');
  try {
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.fill('input[type="email"]', EMAIL);
    await page.fill('input[type="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/workspace**', { timeout: 10000 });
    results.login.success = true;
    results.login.method = 'email/password → /workspace redirect';
    console.log('✅ Login successful');
  } catch (e) {
    console.log('❌ Login failed:', e.message);
    // Take screenshot for debugging
    await page.screenshot({ path: '/Users/chq/xixiong-saas/reports/r3-login-fail.png' });
  }

  // ========== 2. PACKING LIST ==========
  console.log('\n=== Step 2: Packing List ===');
  try {
    await page.goto(`${BASE}/tools/documents/packing-list`, { waitUntil: 'networkidle', timeout: 15000 });
    results.packingList.page200 = true;
    console.log('✅ Page 200');

    // Fill example
    const fillBtn = await page.locator('button:has-text("填充示例")').first();
    if (await fillBtn.isVisible()) {
      await fillBtn.click();
      await sleep(500);
      results.packingList.fillExample = true;
      console.log('✅ Fill example clicked');
    }

    // Check fields are editable
    const firstInput = await page.locator('input').first();
    if (await firstInput.isEditable()) {
      results.packingList.fieldsEditable = true;
      console.log('✅ Fields editable');
    }

    // Check preview
    const preview = await page.locator('text=预览').first();
    if (await preview.isVisible().catch(() => false)) {
      results.packingList.preview = true;
      console.log('✅ Preview visible');
    }

    // Check print button
    const printBtn = await page.locator('button:has-text("打印"), button:has-text("PDF")').first();
    if (await printBtn.isVisible().catch(() => false)) {
      results.packingList.printButton = true;
      console.log('✅ Print button visible');
    }

    // Check export buttons
    const pngBtn = await page.locator('button:has-text("PNG")').first();
    if (await pngBtn.isVisible().catch(() => false)) {
      results.packingList.pngExport.clicked = true;
      console.log('✅ PNG button visible');
    }

    const wordBtn = await page.locator('button:has-text("Word")').first();
    if (await wordBtn.isVisible().catch(() => false)) {
      results.packingList.wordExport.clicked = true;
      console.log('✅ Word button visible');
    }

    // Save draft
    console.log('Attempting to save draft...');
    const saveBtn = await page.locator('button:has-text("保存草稿"), button:has-text("Save")').first();
    if (await saveBtn.isVisible().catch(() => false)) {
      // Listen for API response
      const responsePromise = page.waitForResponse(resp => 
        resp.url().includes('/api/') && (resp.url().includes('draft') || resp.url().includes('document')),
        { timeout: 10000 }
      ).catch(() => null);
      
      await saveBtn.click();
      await sleep(2000);
      
      const resp = await responsePromise;
      if (resp) {
        const status = resp.status();
        let body = null;
        try { body = await resp.json(); } catch {}
        results.packingList.saveDraft.apiResponse = { status, body: body ? JSON.stringify(body).substring(0, 200) : null };
        if (status === 200 || status === 201) {
          results.packingList.saveDraft.success = true;
          if (body?.id) results.packingList.saveDraft.draftId = body.id;
          if (body?.draftId) results.packingList.saveDraft.draftId = body.draftId;
          if (body?.data?.id) results.packingList.saveDraft.draftId = body.data.id;
          console.log('✅ Save draft success, ID:', results.packingList.saveDraft.draftId);
        } else {
          console.log('⚠️ Save draft response:', status);
        }
      } else {
        console.log('⚠️ No API response detected for save');
      }
    } else {
      console.log('⚠️ Save button not found or not visible');
    }

    // Check company profile
    const companySection = await page.locator('text=公司资料, text=Company, text=Logo').first();
    if (await companySection.isVisible().catch(() => false)) {
      results.packingList.companyProfile.note = 'Company profile section visible';
    } else {
      results.packingList.companyProfile.note = 'Company profile section not found in current view';
    }

    // Take screenshot
    await page.screenshot({ path: '/Users/chq/xixiong-saas/reports/r3-packing-list.png', fullPage: true });

  } catch (e) {
    console.log('❌ Packing List error:', e.message);
  }

  // ========== 3. PROFORMA INVOICE ==========
  console.log('\n=== Step 3: Proforma Invoice ===');
  try {
    await page.goto(`${BASE}/tools/documents/proforma-invoice`, { waitUntil: 'networkidle', timeout: 15000 });
    results.proformaInvoice.page200 = true;
    console.log('✅ Page 200');

    // Fill example
    const fillBtn = await page.locator('button:has-text("填充示例")').first();
    if (await fillBtn.isVisible()) {
      await fillBtn.click();
      await sleep(500);
      results.proformaInvoice.fillExample = true;
      console.log('✅ Fill example clicked');
    }

    // Check fields
    const firstInput = await page.locator('input').first();
    if (await firstInput.isEditable()) {
      results.proformaInvoice.fieldsEditable = true;
      console.log('✅ Fields editable');
    }

    // Check preview
    const preview = await page.locator('text=预览').first();
    if (await preview.isVisible().catch(() => false)) {
      results.proformaInvoice.preview = true;
      console.log('✅ Preview visible');
    }

    // Check subtotal logic - look for total display
    const totalDisplay = await page.locator('text=合计, text=Total, text=小计').first();
    if (await totalDisplay.isVisible().catch(() => false)) {
      results.proformaInvoice.subtotalLogic = true;
      console.log('✅ Total/subtotal display visible');
    }

    // Check bank info
    const bankField = await page.locator('input[name*="bank"], input[placeholder*="银行"]').first();
    if (await bankField.isVisible().catch(() => false)) {
      results.proformaInvoice.bankInfo = true;
      console.log('✅ Bank info fields visible');
    }

    // Check print/export buttons
    const printBtn = await page.locator('button:has-text("打印"), button:has-text("PDF")').first();
    if (await printBtn.isVisible().catch(() => false)) {
      results.proformaInvoice.printButton = true;
      console.log('✅ Print button visible');
    }

    const pngBtn = await page.locator('button:has-text("PNG")').first();
    if (await pngBtn.isVisible().catch(() => false)) {
      results.proformaInvoice.pngExport.clicked = true;
      console.log('✅ PNG button visible');
    }

    const wordBtn = await page.locator('button:has-text("Word")').first();
    if (await wordBtn.isVisible().catch(() => false)) {
      results.proformaInvoice.wordExport.clicked = true;
      console.log('✅ Word button visible');
    }

    // Save draft
    console.log('Attempting to save draft...');
    const saveBtn = await page.locator('button:has-text("保存草稿"), button:has-text("Save")').first();
    if (await saveBtn.isVisible().catch(() => false)) {
      const responsePromise = page.waitForResponse(resp => 
        resp.url().includes('/api/') && (resp.url().includes('draft') || resp.url().includes('document')),
        { timeout: 10000 }
      ).catch(() => null);
      
      await saveBtn.click();
      await sleep(2000);
      
      const resp = await responsePromise;
      if (resp) {
        const status = resp.status();
        let body = null;
        try { body = await resp.json(); } catch {}
        results.proformaInvoice.saveDraft.apiResponse = { status, body: body ? JSON.stringify(body).substring(0, 200) : null };
        if (status === 200 || status === 201) {
          results.proformaInvoice.saveDraft.success = true;
          if (body?.id) results.proformaInvoice.saveDraft.draftId = body.id;
          if (body?.draftId) results.proformaInvoice.saveDraft.draftId = body.draftId;
          if (body?.data?.id) results.proformaInvoice.saveDraft.draftId = body.data.id;
          console.log('✅ Save draft success, ID:', results.proformaInvoice.saveDraft.draftId);
        } else {
          console.log('⚠️ Save draft response:', status);
        }
      } else {
        console.log('⚠️ No API response detected for save');
      }
    } else {
      console.log('⚠️ Save button not found or not visible');
    }

    // Company profile
    const companySection = await page.locator('text=公司资料, text=Company, text=Logo').first();
    if (await companySection.isVisible().catch(() => false)) {
      results.proformaInvoice.companyProfile.note = 'Company profile section visible';
    } else {
      results.proformaInvoice.companyProfile.note = 'Company profile section not found in current view';
    }

    await page.screenshot({ path: '/Users/chq/xixiong-saas/reports/r3-proforma-invoice.png', fullPage: true });

  } catch (e) {
    console.log('❌ Proforma Invoice error:', e.message);
  }

  // ========== 4. WORKSPACE CHECK ==========
  console.log('\n=== Step 4: Workspace ===');
  try {
    await page.goto(`${BASE}/workspace/documents`, { waitUntil: 'networkidle', timeout: 15000 });
    await sleep(1000);
    
    // Check if any drafts are visible
    const content = await page.content();
    const hasPackingList = content.includes('packing-list') || content.includes('Packing List') || content.includes('装箱单');
    const hasProforma = content.includes('proforma-invoice') || content.includes('Proforma Invoice');
    
    if (hasPackingList || hasProforma) {
      results.packingList.workspaceVisible = hasPackingList;
      results.proformaInvoice.workspaceVisible = hasProforma;
      console.log('✅ Workspace shows documents:', { hasPackingList, hasProforma });
    } else {
      console.log('⚠️ No saved documents found in workspace');
    }
    
    await page.screenshot({ path: '/Users/chq/xixiong-saas/reports/r3-workspace.png', fullPage: true });
  } catch (e) {
    console.log('❌ Workspace error:', e.message);
  }

  // ========== 5. CONTAINER CALCULATOR ==========
  console.log('\n=== Step 5: Container Calculator ===');
  try {
    await page.goto(`${BASE}/tools/container`, { waitUntil: 'networkidle', timeout: 15000 });
    results.container.page200 = true;
    console.log('✅ Page 200');

    // Fill example
    const fillBtn = await page.locator('button:has-text("填充示例")').first();
    if (await fillBtn.isVisible()) {
      await fillBtn.click();
      await sleep(500);
      results.container.fillExample = true;
      console.log('✅ Fill example clicked');
    }

    // Read the summary text
    const summaryText = await page.locator('.bg-blue-50, .dark\\:bg-blue-900\\/20').first().textContent().catch(() => '');
    console.log('Summary text:', summaryText?.substring(0, 200));
    
    // Parse values
    const cbmMatch = summaryText?.match(/([\d.]+)\s*CBM/);
    if (cbmMatch) results.container.totalCBM = parseFloat(cbmMatch[1]);
    
    const weightMatch = summaryText?.match(/([\d.]+)\s*kg/);
    if (weightMatch) results.container.totalWeight = parseFloat(weightMatch[1]);

    // Read 20GP card
    const cards = await page.locator('[class*="border-2"]').all();
    if (cards.length > 0) {
      const firstCard = cards[0];
      const cardText = await firstCard.textContent();
      console.log('First card text:', cardText?.substring(0, 300));
      
      // Check for misleading text
      if (cardText?.includes('可装') && cardText?.includes('件') && !cardText?.includes('理论可装')) {
        results.container.misleadingText = true;
        console.log('⚠️ Misleading text detected');
      }
      
      // Parse batch utilization
      const volUtilMatch = cardText?.match(/当前批次占体积[\s\S]*?([\d.]+)%/);
      if (volUtilMatch) results.container.batchVolumeUtil20GP = parseFloat(volUtilMatch[1]);
      
      const weightUtilMatch = cardText?.match(/当前批次占重量[\s\S]*?([\d.]+)%/);
      if (weightUtilMatch) results.container.batchWeightUtil20GP = parseFloat(weightUtilMatch[1]);
      
      // Parse max items
      const maxItemsMatch = cardText?.match(/理论可装[\s\S]*?([\d]+)\s*件/);
      if (maxItemsMatch) results.container.maxItems20GP = parseInt(maxItemsMatch[1]);
      
      // Parse batches
      const batchesMatch = cardText?.match(/可装同等批次[\s\S]*?([\d]+)\s*批/);
      if (batchesMatch) results.container.batches20GP = parseInt(batchesMatch[1]);
    }

    await page.screenshot({ path: '/Users/chq/xixiong-saas/reports/r3-container.png', fullPage: true });
  } catch (e) {
    console.log('❌ Container error:', e.message);
  }

  // ========== 6. MOBILE 375px ==========
  console.log('\n=== Step 6: Mobile 375px ===');
  const mobilePage = await context.newPage();
  await mobilePage.setViewportSize({ width: 375, height: 812 });

  // Packing List mobile
  try {
    await mobilePage.goto(`${BASE}/tools/documents/packing-list`, { waitUntil: 'networkidle', timeout: 15000 });
    await sleep(500);
    
    const bodyWidth = await mobilePage.evaluate(() => document.body.scrollWidth);
    const viewportWidth = 375;
    const overflow = bodyWidth > viewportWidth;
    
    results.packingList.mobile375.pass = !overflow;
    if (overflow) {
      results.packingList.mobile375.issues.push(`Body width ${bodyWidth}px > viewport ${viewportWidth}px`);
    }
    
    // Check header
    const header = await mobilePage.locator('header, nav').first();
    if (await header.isVisible().catch(() => false)) {
      const headerOverflow = await header.evaluate(el => el.scrollWidth > window.innerWidth);
      if (headerOverflow) results.packingList.mobile375.issues.push('Header overflow');
    }
    
    await mobilePage.screenshot({ path: '/Users/chq/xixiong-saas/reports/r3-packing-list-mobile.png', fullPage: true });
    console.log(`Packing List mobile: ${!overflow ? '✅' : '❌'} (body: ${bodyWidth}px)`);
  } catch (e) {
    console.log('❌ Packing List mobile error:', e.message);
  }

  // Proforma Invoice mobile
  try {
    await mobilePage.goto(`${BASE}/tools/documents/proforma-invoice`, { waitUntil: 'networkidle', timeout: 15000 });
    await sleep(500);
    
    const bodyWidth = await mobilePage.evaluate(() => document.body.scrollWidth);
    const overflow = bodyWidth > 375;
    
    results.proformaInvoice.mobile375.pass = !overflow;
    if (overflow) {
      results.proformaInvoice.mobile375.issues.push(`Body width ${bodyWidth}px > viewport 375px`);
    }
    
    await mobilePage.screenshot({ path: '/Users/chq/xixiong-saas/reports/r3-proforma-invoice-mobile.png', fullPage: true });
    console.log(`Proforma Invoice mobile: ${!overflow ? '✅' : '❌'} (body: ${bodyWidth}px)`);
  } catch (e) {
    console.log('❌ Proforma Invoice mobile error:', e.message);
  }

  // Container mobile
  try {
    await mobilePage.goto(`${BASE}/tools/container`, { waitUntil: 'networkidle', timeout: 15000 });
    await sleep(500);
    
    const bodyWidth = await mobilePage.evaluate(() => document.body.scrollWidth);
    const overflow = bodyWidth > 375;
    
    results.container.mobile375.pass = !overflow;
    if (overflow) {
      results.container.mobile375.issues.push(`Body width ${bodyWidth}px > viewport 375px`);
    }
    
    await mobilePage.screenshot({ path: '/Users/chq/xixiong-saas/reports/r3-container-mobile.png', fullPage: true });
    console.log(`Container mobile: ${!overflow ? '✅' : '❌'} (body: ${bodyWidth}px)`);
  } catch (e) {
    console.log('❌ Container mobile error:', e.message);
  }

  await mobilePage.close();

  // ========== RESTORE TEST ==========
  console.log('\n=== Step 7: Restore Test ===');
  // Try to restore packing list draft if we got an ID
  if (results.packingList.saveDraft.draftId) {
    try {
      const draftId = results.packingList.saveDraft.draftId;
      await page.goto(`${BASE}/tools/documents/packing-list?draftId=${draftId}`, { waitUntil: 'networkidle', timeout: 15000 });
      await sleep(1000);
      
      // Check if data was restored
      const docNo = await page.locator('input[name="documentNo"], input[placeholder*="编号"]').first().inputValue().catch(() => '');
      if (docNo && docNo.length > 0) {
        results.packingList.restore.success = true;
        results.packingList.restore.path = `/tools/documents/packing-list?draftId=${draftId}`;
        console.log(`✅ Packing List restore success, documentNo: ${docNo}`);
      } else {
        console.log('⚠️ Packing List restore: fields empty after loading with draftId');
      }
    } catch (e) {
      console.log('❌ Packing List restore error:', e.message);
    }
  }

  if (results.proformaInvoice.saveDraft.draftId) {
    try {
      const draftId = results.proformaInvoice.saveDraft.draftId;
      await page.goto(`${BASE}/tools/documents/proforma-invoice?draftId=${draftId}`, { waitUntil: 'networkidle', timeout: 15000 });
      await sleep(1000);
      
      const docNo = await page.locator('input[name="documentNo"], input[placeholder*="编号"]').first().inputValue().catch(() => '');
      if (docNo && docNo.length > 0) {
        results.proformaInvoice.restore.success = true;
        results.proformaInvoice.restore.path = `/tools/documents/proforma-invoice?draftId=${draftId}`;
        console.log(`✅ Proforma Invoice restore success, documentNo: ${docNo}`);
      } else {
        console.log('⚠️ Proforma Invoice restore: fields empty after loading with draftId');
      }
    } catch (e) {
      console.log('❌ Proforma Invoice restore error:', e.message);
    }
  }

  // ========== EXPORT TEST ==========
  console.log('\n=== Step 8: Export Test ===');
  // Test PNG export for Packing List
  try {
    await page.goto(`${BASE}/tools/documents/packing-list`, { waitUntil: 'networkidle', timeout: 15000 });
    const fillBtn = await page.locator('button:has-text("填充示例")').first();
    await fillBtn.click();
    await sleep(500);
    
    const pngBtn = await page.locator('button:has-text("PNG")').first();
    if (await pngBtn.isVisible()) {
      // Listen for download or file creation
      const downloadPromise = page.waitForEvent('download', { timeout: 10000 }).catch(() => null);
      await pngBtn.click();
      await sleep(2000);
      
      const download = await downloadPromise;
      if (download) {
        const path = await download.path();
        const suggestedFilename = download.suggestedFilename();
        results.packingList.pngExport.clicked = true;
        results.packingList.pngExport.filename = suggestedFilename;
        console.log(`✅ PNG download triggered: ${suggestedFilename}`);
      } else {
        // Check if any console errors occurred
        const pngErrors = consoleErrors.filter(e => e.includes('png') || e.includes('export') || e.includes('html2canvas'));
        if (pngErrors.length > 0) {
          results.packingList.pngExport.error = pngErrors.join('; ');
          console.log('⚠️ PNG export errors:', pngErrors);
        } else {
          console.log('⚠️ PNG: no download event, no errors detected');
        }
      }
    }
  } catch (e) {
    console.log('❌ PNG export test error:', e.message);
  }

  // Test Word export
  try {
    const wordBtn = await page.locator('button:has-text("Word")').first();
    if (await wordBtn.isVisible()) {
      const downloadPromise = page.waitForEvent('download', { timeout: 10000 }).catch(() => null);
      await wordBtn.click();
      await sleep(2000);
      
      const download = await downloadPromise;
      if (download) {
        const suggestedFilename = download.suggestedFilename();
        results.packingList.wordExport.filename = suggestedFilename;
        console.log(`✅ Word download triggered: ${suggestedFilename}`);
      } else {
        const wordErrors = consoleErrors.filter(e => e.includes('word') || e.includes('docx') || e.includes('export'));
        if (wordErrors.length > 0) {
          results.packingList.wordExport.error = wordErrors.join('; ');
          console.log('⚠️ Word export errors:', wordErrors);
        } else {
          console.log('⚠️ Word: no download event, no errors detected');
        }
      }
    }
  } catch (e) {
    console.log('❌ Word export test error:', e.message);
  }

  // ========== SUMMARY ==========
  console.log('\n\n========== RESULTS SUMMARY ==========');
  console.log(JSON.stringify(results, null, 2));
  
  // Write results to file
  fs.writeFileSync(
    '/Users/chq/xixiong-saas/reports/r3-verification-results.json',
    JSON.stringify(results, null, 2)
  );
  
  console.log('\nConsole errors:', consoleErrors.length > 0 ? consoleErrors.slice(0, 10) : 'None');
  
  await browser.close();
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
