/**
 * LabelA4ExportRenderer v1.20.4 (Template Layout Upgrade)
 * Uses template-renderers.ts for 8 distinct commercial layouts.
 * Page padding: 56px 64px 44px 64px
 * Content width: 666px
 */

import { LabelStyle } from "./label-types";
import { buildVisualStyle, renderLabelExport, LabelVisualStyle } from "./template-renderers";

export interface LabelExportData {
  type: string;
  titleZh: string;
  titleEn: string;
  formData: Record<string, any>;
  style: { primaryColor: string; borderColor: string };
  showBarcode?: boolean;
  showQrCode?: boolean;
  canRemoveBranding: boolean;
}

const PAD_TOP = 56;
const PAD_X = 64;
const PAD_BOTTOM = 44;

function val(v: any): string {
  return v != null && v !== '' ? String(v) : '';
}

function esc(s: string): string {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function buildLabelA4ExportHTML(data: LabelExportData): string {
  // Build full visual style from base style
  const baseStyle: LabelStyle = {
    id: 'black-white',
    name: 'Black & White',
    primaryColor: data.style.primaryColor,
    borderColor: data.style.borderColor,
    headingBgColor: 'transparent',
    textColor: '#000',
    fontSize: '12pt',
    showBorder: true,
    labelDensity: 'normal',
  };
  const vs: LabelVisualStyle = buildVisualStyle(baseStyle);

  // Render type-specific content
  const typeContent = renderLabelExport(data.type, {
    formData: data.formData,
    style: vs,
    titleZh: data.titleZh,
    titleEn: data.titleEn,
  });

  // Wrap in A4 container with border
  const bc = data.style.borderColor || '#000';
  const bordered = `<div style="border: ${vs.borderStyle.width} ${vs.borderStyle.style} ${bc}; border-radius: ${vs.borderStyle.radius}; padding: 16px; overflow: hidden;">
    ${typeContent}
  </div>`;

  // Barcode / QR section
  let barcodeSection = '';
  if (data.showBarcode || data.showQrCode) {
    const fd = data.formData;
    const barcodeVal = fd.barcodeSource && fd.barcodeSource !== 'custom'
      ? (fd[fd.barcodeSource] || '')
      : (fd.barcodeValue || '');
    barcodeSection = `<div style="margin-top: 20px; padding-top: 12px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: end;">
      <div style="font-size: 10px; color: #94a3b8;">${esc(barcodeVal)}</div>
      <div style="display: flex; gap: 16px;">
        ${data.showBarcode ? `<div style="text-align: center;"><div style="width: 80px; height: 40px; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: center; font-size: 9px; color: #94a3b8; background: #f8fafc; font-family: monospace; letter-spacing: 1px;">CODE128</div></div>` : ''}
        ${data.showQrCode ? `<div style="text-align: center;"><div style="width: 56px; height: 56px; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: center; font-size: 9px; color: #94a3b8; background: #f8fafc;">QR</div></div>` : ''}
      </div>
    </div>`;
  }

  const inner = bordered + barcodeSection;

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: 794px; min-width: 794px; max-width: 794px; background: #ffffff; color: #111827; }
body { font-family: Arial, "Noto Sans SC", "Microsoft YaHei", sans-serif; font-size: 12px; line-height: 1.5; }
.a4-page { width: 794px; min-height: 1123px; background: #ffffff; padding: ${PAD_TOP}px ${PAD_X}px ${PAD_BOTTOM}px ${PAD_X}px; }
.a4-inner { width: 100%; height: 100%; position: relative; }
@media print { @page { margin: 0; size: A4; } }
</style>
</head>
<body>
<div class="a4-page"><div class="a4-inner">${inner}</div></div>
</body>
</html>`;

  return html;
}

export const A4_WIDTH = 794;
export const A4_HEIGHT = 1123;
export const A4_EXPORT_SCALE = 2;
