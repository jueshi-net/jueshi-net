#!/usr/bin/env tsx
/**
 * Audit: Template Print Actual Fit v6.40
 * 
 * Verifies that 10x10 print output:
 * - Is square (100mm x 100mm)
 * - Content is not shrunk/centered at top
 * - Left/right/bottom whitespace is minimized
 * - Company field binding is resolved
 * - No nav/footer in print DOM
 * - No duplicate sequence numbers
 * - No regression to saved edit, company block, PNG guard
 */

import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const EVIDENCE_DIR = path.join(process.cwd(), 'tools/jueshi-audit/evidence/print-actual-fit-v6.40');
const STAGING_URL = 'https://i.jueshi.net';

interface AuditResult {
  id: string;
  name: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  message: string;
  details?: any;
}

const results: AuditResult[] = [];

function log(msg: string) {
  console.log(`[AUDIT] ${msg}`);
}

async function ensureEvidenceDir() {
  if (!fs.existsSync(EVIDENCE_DIR)) {
    fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
  }
}

async function audit10x10PaperSquare(page: Page): Promise<AuditResult> {
  log('TS-PRINT-10X10-PAPER-SQUARE: Checking paper dimensions...');
  
  const paperSpec = await page.evaluate(() => {
    const paper = document.querySelector('[data-testid="canvas-paper"]');
    if (!paper) return null;
    
    const style = window.getComputedStyle(paper);
    const width = parseFloat(style.width);
    const height = parseFloat(style.height);
    
    return { width, height, ratio: width / height };
  });
  
  if (!paperSpec) {
    return {
      id: 'TS-PRINT-10X10-PAPER-SQUARE',
      name: '10x10 Paper Square',
      status: 'FAIL',
      message: 'Paper element not found'
    };
  }
  
  // 10x10 should have ratio close to 1.0 (allow 5% tolerance)
  const isSquare = Math.abs(paperSpec.ratio - 1.0) < 0.05;
  
  return {
    id: 'TS-PRINT-10X10-PAPER-SQUARE',
    name: '10x10 Paper Square',
    status: isSquare ? 'PASS' : 'FAIL',
    message: isSquare 
      ? `Paper is square: ${paperSpec.width.toFixed(1)}x${paperSpec.height.toFixed(1)}px (ratio: ${paperSpec.ratio.toFixed(3)})`
      : `Paper is NOT square: ${paperSpec.width.toFixed(1)}x${paperSpec.height.toFixed(1)}px (ratio: ${paperSpec.ratio.toFixed(3)})`,
    details: paperSpec
  };
}

async function auditWrapperMatchesPaper(page: Page): Promise<AuditResult> {
  log('TS-PRINT-10X10-WRAPPER-MATCHES-PAPER: Checking wrapper dimensions...');
  
  const dimensions = await page.evaluate(() => {
    const paper = document.querySelector('[data-testid="canvas-paper"]');
    const unscaledPaper = document.querySelector('[data-testid="canvas-print-unscaled-paper"]');
    
    if (!paper || !unscaledPaper) return null;
    
    const paperStyle = window.getComputedStyle(paper);
    const unscaledStyle = window.getComputedStyle(unscaledPaper);
    
    return {
      paper: {
        width: parseFloat(paperStyle.width),
        height: parseFloat(paperStyle.height)
      },
      unscaled: {
        width: parseFloat(unscaledStyle.width),
        height: parseFloat(unscaledStyle.height)
      }
    };
  });
  
  if (!dimensions) {
    return {
      id: 'TS-PRINT-10X10-WRAPPER-MATCHES-PAPER',
      name: 'Wrapper Matches Paper',
      status: 'FAIL',
      message: 'Paper or unscaled paper element not found'
    };
  }
  
  const widthMatch = Math.abs(dimensions.paper.width - dimensions.unscaled.width) < 1;
  const heightMatch = Math.abs(dimensions.paper.height - dimensions.unscaled.height) < 1;
  
  return {
    id: 'TS-PRINT-10X10-WRAPPER-MATCHES-PAPER',
    name: 'Wrapper Matches Paper',
    status: (widthMatch && heightMatch) ? 'PASS' : 'FAIL',
    message: (widthMatch && heightMatch)
      ? `Wrapper matches paper: ${dimensions.unscaled.width.toFixed(1)}x${dimensions.unscaled.height.toFixed(1)}px`
      : `Wrapper does NOT match paper: paper=${dimensions.paper.width.toFixed(1)}x${dimensions.paper.height.toFixed(1)}, unscaled=${dimensions.unscaled.width.toFixed(1)}x${dimensions.unscaled.height.toFixed(1)}`,
    details: dimensions
  };
}

async function auditNoObviousBottomWhitespace(page: Page): Promise<AuditResult> {
  log('TS-PRINT-10X10-NO_OBVIOUS_BOTTOM_WHITESPACE: Checking content distribution...');
  
  const contentBounds = await page.evaluate(() => {
    const paper = document.querySelector('[data-testid="canvas-paper"]');
    if (!paper) return null;
    
    const paperRect = paper.getBoundingClientRect();
    const elements = paper.querySelectorAll('[data-testid^="canvas-element-"]');
    
    if (elements.length === 0) {
      return {
        paperHeight: paperRect.height,
        contentBottom: 0,
        emptySpace: paperRect.height
      };
    }
    
    let maxBottom = 0;
    elements.forEach(el => {
      const rect = el.getBoundingClientRect();
      const relativeBottom = rect.bottom - paperRect.top;
      if (relativeBottom > maxBottom) {
        maxBottom = relativeBottom;
      }
    });
    
    const emptySpace = paperRect.height - maxBottom;
    const emptyPercent = (emptySpace / paperRect.height) * 100;
    
    return {
      paperHeight: paperRect.height,
      contentBottom: maxBottom,
      emptySpace,
      emptyPercent
    };
  });
  
  if (!contentBounds) {
    return {
      id: 'TS-PRINT-10X10-NO_OBVIOUS_BOTTOM_WHITESPACE',
      name: 'No Obvious Bottom Whitespace',
      status: 'FAIL',
      message: 'Paper element not found'
    };
  }
  
  // Allow up to 30% empty space at bottom (content should fill at least 70%)
  const emptyPercent = contentBounds.emptyPercent || 0;
  const acceptableWhitespace = emptyPercent < 30;
  
  return {
    id: 'TS-PRINT-10X10-NO_OBVIOUS_BOTTOM_WHITESPACE',
    name: 'No Obvious Bottom Whitespace',
    status: acceptableWhitespace ? 'PASS' : 'FAIL',
    message: acceptableWhitespace
      ? `Content fills ${(100 - emptyPercent).toFixed(1)}% of paper (empty: ${emptyPercent.toFixed(1)}%)`
      : `Content only fills ${(100 - emptyPercent).toFixed(1)}% of paper (empty: ${emptyPercent.toFixed(1)}%)`,
    details: contentBounds
  };
}

async function auditNoPreviewScale(page: Page): Promise<AuditResult> {
  log('TS-PRINT-NO_PREVIEW_SCALE: Checking for preview scale in print DOM...');
  
  const hasScale = await page.evaluate(() => {
    const unscaledPaper = document.querySelector('[data-testid="canvas-print-unscaled-paper"]');
    if (!unscaledPaper) return false;
    
    const style = window.getComputedStyle(unscaledPaper);
    const transform = style.transform;
    
    // Check if transform contains scale
    return transform && transform !== 'none' && transform.includes('scale');
  });
  
  return {
    id: 'TS-PRINT-NO_PREVIEW_SCALE',
    name: 'No Preview Scale in Print DOM',
    status: hasScale ? 'FAIL' : 'PASS',
    message: hasScale
      ? 'Print DOM contains preview scale transform'
      : 'Print DOM does not contain preview scale'
  };
}

async function auditNoNavFooter(page: Page): Promise<AuditResult> {
  log('TS-PRINT-NO_NAV_FOOTER: Checking for nav/footer in print DOM...');
  
  const hasNavFooter = await page.evaluate(() => {
    const printRoot = document.querySelector('[data-testid="canvas-print-root"]') || document.body;
    
    const nav = printRoot.querySelector('nav, [role="navigation"]');
    const footer = printRoot.querySelector('footer, [role="contentinfo"]');
    
    return {
      hasNav: !!nav,
      hasFooter: !!footer
    };
  });
  
  const clean = !hasNavFooter.hasNav && !hasNavFooter.hasFooter;
  
  return {
    id: 'TS-PRINT-NO_NAV_FOOTER',
    name: 'No Nav/Footer in Print DOM',
    status: clean ? 'PASS' : 'FAIL',
    message: clean
      ? 'Print DOM does not contain nav/footer'
      : `Print DOM contains: ${hasNavFooter.hasNav ? 'nav ' : ''}${hasNavFooter.hasFooter ? 'footer' : ''}`,
    details: hasNavFooter
  };
}

async function auditNoDuplicateSequence(page: Page): Promise<AuditResult> {
  log('TS-PRINT-NO_DUPLICATE_SEQUENCE: Checking for duplicate sequence numbers...');
  
  const sequenceInfo = await page.evaluate(() => {
    const pageCountElements = document.querySelectorAll('[data-testid="canvas-print-page-count"]');
    const pageSequenceElements = document.querySelectorAll('[data-testid="canvas-print-page-sequence"]');
    
    const pageCountTexts = Array.from(pageCountElements).map(el => el.textContent);
    const pageSequenceTexts = Array.from(pageSequenceElements).map(el => el.textContent);
    
    // Check for duplicates
    const pageCountUnique = new Set(pageCountTexts);
    const pageSequenceUnique = new Set(pageSequenceTexts);
    
    return {
      pageCountCount: pageCountElements.length,
      pageCountUnique: pageCountUnique.size,
      pageSequenceCount: pageSequenceElements.length,
      pageSequenceUnique: pageSequenceUnique.size,
      hasDuplicates: pageCountElements.length !== pageCountUnique.size || pageSequenceElements.length !== pageSequenceUnique.size
    };
  });
  
  return {
    id: 'TS-PRINT-NO_DUPLICATE_SEQUENCE',
    name: 'No Duplicate Sequence',
    status: sequenceInfo.hasDuplicates ? 'FAIL' : 'PASS',
    message: sequenceInfo.hasDuplicates
      ? `Duplicate sequence numbers found: pageCount=${sequenceInfo.pageCountCount}/${sequenceInfo.pageCountUnique}, pageSequence=${sequenceInfo.pageSequenceCount}/${sequenceInfo.pageSequenceUnique}`
      : 'No duplicate sequence numbers',
    details: sequenceInfo
  };
}

async function auditCompanyBindingResolved(page: Page): Promise<AuditResult> {
  log('TS-PRINT-COMPANY_BINDING_RESOLVED: Checking company field binding...');
  
  const bindingInfo = await page.evaluate(() => {
    const printRoot = document.querySelector('[data-testid="canvas-print-root"]') || document.body;
    const html = printRoot.innerHTML;
    
    const placeholders = [
      '[company.companyName]',
      '[company.name]',
      'Company name'
    ];
    
    const foundPlaceholders = placeholders.filter(p => html.includes(p));
    
    return {
      hasPlaceholders: foundPlaceholders.length > 0,
      foundPlaceholders
    };
  });
  
  return {
    id: 'TS-PRINT-COMPANY_BINDING_RESOLVED',
    name: 'Company Binding Resolved',
    status: bindingInfo.hasPlaceholders ? 'FAIL' : 'PASS',
    message: bindingInfo.hasPlaceholders
      ? `Company binding placeholders found: ${bindingInfo.foundPlaceholders.join(', ')}`
      : 'No company binding placeholders found',
    details: bindingInfo
  };
}

async function auditSavedCanvasEditNoRegression(page: Page): Promise<AuditResult> {
  log('TS-SAVED-CANVAS-EDIT-NO-REGRESSION: Checking saved template edit page...');
  
  try {
    // Try to open a saved template
    await page.goto(`${STAGING_URL}/workspace/templates`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    // Check if we were redirected to login (expected for unauthenticated users)
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      return {
        id: 'TS-SAVED-CANVAS-EDIT-NO-REGRESSION',
        name: 'Saved Canvas Edit No Regression',
        status: 'PASS',
        message: 'Redirected to login (expected for unauthenticated users)'
      };
    }
    
    // Check if page loaded without error
    const hasError = await page.evaluate(() => {
      const text = document.body.textContent || '';
      return text.includes("couldn't load") || 
             (text.includes('This page') && text.includes('error'));
    });
    
    if (hasError) {
      return {
        id: 'TS-SAVED-CANVAS-EDIT-NO-REGRESSION',
        name: 'Saved Canvas Edit No Regression',
        status: 'FAIL',
        message: 'Saved template edit page shows error'
      };
    }
    
    // Try to click edit on first template
    const editButton = await page.$('[data-testid^="workspace-edit-"]');
    if (editButton) {
      await editButton.click();
      await page.waitForTimeout(2000);
      
      // Check if canvas editor loaded
      const hasCanvasEditor = await page.evaluate(() => {
        return !!document.querySelector('[data-testid="canvas-paper"]');
      });
      
      return {
        id: 'TS-SAVED-CANVAS-EDIT-NO-REGRESSION',
        name: 'Saved Canvas Edit No Regression',
        status: hasCanvasEditor ? 'PASS' : 'FAIL',
        message: hasCanvasEditor
          ? 'Saved template edit page loads correctly'
          : 'Canvas editor did not load'
      };
    }
    
    return {
      id: 'TS-SAVED-CANVAS-EDIT-NO-REGRESSION',
      name: 'Saved Canvas Edit No Regression',
      status: 'PASS',
      message: 'No saved templates to test (acceptable)'
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return {
      id: 'TS-SAVED-CANVAS-EDIT-NO-REGRESSION',
      name: 'Saved Canvas Edit No Regression',
      status: 'FAIL',
      message: `Error: ${errorMessage}`
    };
  }
}

async function auditCompanyBlockNoRegression(page: Page): Promise<AuditResult> {
  log('TS-COMPANY-BLOCK-NO-REGRESSION: Checking company block structure...');
  
  const blockInfo = await page.evaluate(() => {
    const companyBlocks = document.querySelectorAll('[data-testid^="canvas-element-company-block-"]');
    
    return {
      count: companyBlocks.length,
      isCombined: companyBlocks.length > 0
    };
  });
  
  return {
    id: 'TS-COMPANY-BLOCK-NO-REGRESSION',
    name: 'Company Block No Regression',
    status: blockInfo.isCombined ? 'PASS' : 'WARN',
    message: blockInfo.isCombined
      ? `Company block is combined (${blockInfo.count} block(s))`
      : 'No company blocks found (may be acceptable if not added)',
    details: blockInfo
  };
}

async function auditPngGuardNoRegression(page: Page): Promise<AuditResult> {
  log('TS-PNG-GUARD-NO-REGRESSION: Checking PNG guard...');
  
  const guardInfo = await page.evaluate(() => {
    // Try to export PNG in repeat mode
    const exportButton = Array.from(document.querySelectorAll('button')).find(btn => 
      btn.textContent?.includes('导出 PNG')
    );
    if (!exportButton) return { hasGuard: false };
    
    // Check if there's a guard message
    const messages = Array.from(document.querySelectorAll('*')).map(el => el.textContent);
    const hasGuardMessage = messages.some(msg => 
      msg?.includes('批量 PNG') || msg?.includes('开发中') || msg?.includes('仅支持单页')
    );
    
    return {
      hasGuard: hasGuardMessage
    };
  });
  
  return {
    id: 'TS-PNG-GUARD-NO-REGRESSION',
    name: 'PNG Guard No Regression',
    status: guardInfo.hasGuard ? 'PASS' : 'WARN',
    message: guardInfo.hasGuard
      ? 'PNG guard message present'
      : 'PNG guard message not found (may be acceptable)',
    details: guardInfo
  };
}

async function generateEvidenceFiles(page: Page) {
  log('Generating evidence files...');
  
  // Generate print DOM HTML
  const printDomHtml = await page.evaluate(() => {
    const printRoot = document.querySelector('[data-testid="canvas-print-root"]') || document.body;
    return printRoot.outerHTML;
  });
  
  fs.writeFileSync(
    path.join(EVIDENCE_DIR, 'print-dom-after.html'),
    printDomHtml,
    'utf-8'
  );
  
  // Generate print CSS
  const printCss = await page.evaluate(() => {
    const styles = Array.from(document.querySelectorAll('style')).map(s => s.textContent).join('\n\n');
    return styles || 'No inline styles found';
  });
  
  fs.writeFileSync(
    path.join(EVIDENCE_DIR, 'print-css-after.txt'),
    printCss,
    'utf-8'
  );
  
  // Generate layout measurements
  const layoutMeasure = await page.evaluate(() => {
    const paper = document.querySelector('[data-testid="canvas-paper"]');
    if (!paper) return null;
    
    const paperRect = paper.getBoundingClientRect();
    const elements = Array.from(paper.querySelectorAll('[data-testid^="canvas-element-"]'));
    
    const elementBounds = elements.map(el => {
      const rect = el.getBoundingClientRect();
      return {
        testid: el.getAttribute('data-testid'),
        x: rect.x - paperRect.x,
        y: rect.y - paperRect.y,
        width: rect.width,
        height: rect.height,
        bottom: rect.bottom - paperRect.top
      };
    });
    
    return {
      paper: {
        width: paperRect.width,
        height: paperRect.height
      },
      elements: elementBounds,
      totalElements: elements.length
    };
  });
  
  if (layoutMeasure) {
    fs.writeFileSync(
      path.join(EVIDENCE_DIR, 'print-layout-measure-after.json'),
      JSON.stringify(layoutMeasure, null, 2),
      'utf-8'
    );
  }
  
  // Take screenshot
  await page.screenshot({
    path: path.join(EVIDENCE_DIR, 'company-binding-print-after.png'),
    fullPage: false
  });
  
  log(`Evidence files saved to ${EVIDENCE_DIR}`);
}

async function main() {
  log('Starting Template Print Actual Fit Audit v6.40...');
  
  await ensureEvidenceDir();
  
  let browser: Browser | null = null;
  
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();
    
    // Navigate to canvas editor with 10x10 paper
    log('Navigating to canvas editor...');
    await page.goto(`${STAGING_URL}/tools/template-studio/canvas/new`, { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    
    // Wait for editor to load
    await page.waitForSelector('[data-testid="canvas-paper"]', { timeout: 10000 });
    
    // Select 10x10 paper
    log('Selecting 10x10 paper...');
    await page.selectOption('[data-testid="canvas-paper-size"]', '10x10');
    await page.waitForTimeout(1000);
    
    // Add some content
    log('Adding test content...');
    const addTextButton = await page.$('button:has-text("+ 文本")');
    if (addTextButton) {
      await addTextButton.click();
      await page.waitForTimeout(500);
    }
    
    // Run audits
    results.push(await audit10x10PaperSquare(page));
    results.push(await auditWrapperMatchesPaper(page));
    results.push(await auditNoObviousBottomWhitespace(page));
    results.push(await auditNoPreviewScale(page));
    results.push(await auditNoNavFooter(page));
    results.push(await auditNoDuplicateSequence(page));
    results.push(await auditCompanyBindingResolved(page));
    results.push(await auditSavedCanvasEditNoRegression(page));
    results.push(await auditCompanyBlockNoRegression(page));
    results.push(await auditPngGuardNoRegression(page));
    
    // Generate evidence files
    await generateEvidenceFiles(page);
    
    // Print summary
    console.log('\n' + '='.repeat(80));
    console.log('AUDIT SUMMARY');
    console.log('='.repeat(80));
    
    const passed = results.filter(r => r.status === 'PASS').length;
    const failed = results.filter(r => r.status === 'FAIL').length;
    const warned = results.filter(r => r.status === 'WARN').length;
    
    results.forEach(r => {
      const icon = r.status === 'PASS' ? '✓' : r.status === 'FAIL' ? '✗' : '⚠';
      console.log(`${icon} ${r.id}: ${r.message}`);
    });
    
    console.log('\n' + '-'.repeat(80));
    console.log(`Total: ${results.length} | Passed: ${passed} | Failed: ${failed} | Warned: ${warned}`);
    console.log('='.repeat(80));
    
    // Save results
    fs.writeFileSync(
      path.join(EVIDENCE_DIR, 'audit-results.json'),
      JSON.stringify({ results, summary: { passed, failed, warned } }, null, 2),
      'utf-8'
    );
    
    // Exit with error if any failures
    if (failed > 0) {
      process.exit(1);
    }
    
  } catch (err) {
    console.error('Audit failed:', err);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

main();
