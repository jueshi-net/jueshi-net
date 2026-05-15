/**
 * DocumentA4ExportRenderer v2 - Fixed for Safari compatibility
 * 
 * Instead of iframe (which Safari handles inconsistently),
 * we create a temporary DIV in the main document, render the A4 HTML into it,
 * screenshot with html2canvas, then remove it.
 * 
 * Key fix: The div is appended to document.body with explicit 794px width,
 * NOT hidden via display:none (which would make html2canvas skip it).
 */

import { A4_WIDTH, A4_HEIGHT, A4_EXPORT_SCALE } from './a4-export-renderer';

/**
 * Export PNG using temporary div approach (Safari-compatible)
 */
export async function exportDocumentPNG(
  html: string,
  fileName: string
): Promise<void> {
  // Create a temporary container
  const container = document.createElement('div');
  // Must NOT use display:none / visibility:hidden
  // Use offscreen positioning with exact dimensions
  container.style.cssText = `
    position: fixed;
    left: 0;
    top: 0;
    width: ${A4_WIDTH}px;
    height: ${A4_HEIGHT}px;
    overflow: hidden;
    z-index: -9999;
    pointer-events: none;
    opacity: 0;
  `;
  document.body.appendChild(container);

  try {
    // Load the HTML into the container
    container.innerHTML = html;

    // Wait for content to render
    await new Promise(r => setTimeout(r, 300));

    // Find the .a4-page element
    const a4Page = container.querySelector('.a4-page') as HTMLElement;
    if (!a4Page) {
      throw new Error('A4 page element not found');
    }

    // Dynamically import html2canvas
    const html2canvas = (await import('html2canvas')).default;

    // CRITICAL: Use these exact parameters
    const canvas = await html2canvas(a4Page, {
      backgroundColor: '#ffffff',
      scale: A4_EXPORT_SCALE,
      useCORS: true,
      logging: false,
      allowTaint: true,
      // Fixed viewport — this is the key fix
      width: A4_WIDTH,
      height: A4_HEIGHT,
      windowWidth: A4_WIDTH,
      windowHeight: A4_HEIGHT,
      foreignObjectRendering: false,
      // Disable scroll-based heuristics
      scrollX: 0,
      scrollY: 0,
      x: 0,
      y: 0,
    });

    // Verify dimensions
    const cw = canvas.width;
    const ch = canvas.height;
    const ratio = cw / ch;
    console.log(`[PNG Export] Canvas: ${cw}×${ch}, ratio: ${ratio.toFixed(3)}`);

    // Download
    const link = document.createElement('a');
    link.download = fileName;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } finally {
    // Always cleanup
    document.body.removeChild(container);
  }
}

/**
 * Export PNG using hidden iframe approach (fallback)
 * If the div approach fails, try iframe
 */
export async function exportDocumentPNGIframe(
  html: string,
  fileName: string
): Promise<void> {
  const container = document.createElement('div');
  container.style.cssText = `position:fixed;left:-10000px;top:0;width:${A4_WIDTH}px;height:${A4_HEIGHT + 200}px;border:0;z-index:-9999;`;
  document.body.appendChild(container);

  try {
    const iframe = document.createElement('iframe');
    iframe.style.cssText = `width:${A4_WIDTH}px;height:${A4_HEIGHT}px;border:0;`;
    container.appendChild(iframe);

    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('iframe timeout')), 10000);
      iframe.onload = () => { clearTimeout(timeout); resolve(); };
      iframe.srcdoc = html;
    });

    await new Promise(r => setTimeout(r, 500));

    const html2canvas = (await import('html2canvas')).default;
    const a4Page = iframe.contentDocument?.querySelector('.a4-page') as HTMLElement;
    if (!a4Page) throw new Error('A4 page not found');

    const canvas = await html2canvas(a4Page, {
      backgroundColor: '#ffffff',
      scale: A4_EXPORT_SCALE,
      useCORS: true,
      logging: false,
      allowTaint: true,
      width: A4_WIDTH,
      height: A4_HEIGHT,
      windowWidth: A4_WIDTH,
      windowHeight: A4_HEIGHT,
      foreignObjectRendering: false,
    });

    const cw = canvas.width;
    const ch = canvas.height;
    console.log(`[PNG Export iframe] Canvas: ${cw}×${ch}, ratio: ${(cw/ch).toFixed(3)}`);

    const link = document.createElement('a');
    link.download = fileName;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } finally {
    document.body.removeChild(container);
  }
}
