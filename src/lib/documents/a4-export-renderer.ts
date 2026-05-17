/**
 * DocumentA4ExportRenderer v1.12.8 (Layout Fixed)
 *
 * Builds a complete A4 document using ONLY inline CSS (px units, hex colors).
 * NO Tailwind classes, NO responsive layout, NO lab/oklch.
 *
 * Layout specs:
 * - Page: 794px × 1123px
 * - Inner padding: 56px top, 64px left/right, 44px bottom
 * - Content width: 666px (794 - 128)
 * - All content rendered inside .a4-inner container
 *
 * Output: 794px × 1123px @ scale 2 = 1588×2246px PNG
 */

function toHex(c: string): string {
  if (!c || c === 'transparent') return '#d1d5db';
  if (/^#[0-9a-fA-F]{6}$/.test(c)) return c;
  if (/^#[0-9a-fA-F]{3}$/.test(c)) return `#${c[1]}${c[1]}${c[2]}${c[2]}${c[3]}${c[3]}`;
  return '#000000';
}

function esc(s: string): string {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function val(v: any): string {
  return v != null && v !== '' ? String(v) : '';
}

export interface ExportSection {
  title: string;
  fields: { key: string; label: string; colspan?: number }[];
  data: Record<string, any>;
}

export interface ExportColumn {
  key: string;
  label: string;
  width?: string;
}

export interface ExportTotal {
  label: string;
  value: string;
}

export interface A4ExportData {
  companyName: string;
  companyNameEn: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  companyWebsite: string;
  documentNo: string;
  documentDate: string;
  titleZh: string;
  titleEn: string;
  sections: ExportSection[];
  lineItems: {
    columns: ExportColumn[];
    rows: Record<string, any>[];
    totals: ExportTotal[];
  };
  terms: string;
  canRemoveBranding: boolean;
  style: {
    primaryColor: string;
    borderColor: string;
    headingBgColor: string;
  };
}

// ---- Page layout constants ----
const PAD_TOP = 56;
const PAD_X = 64;
const PAD_BOTTOM = 44;

export function buildA4ExportHTML(data: A4ExportData): string {
  const pc = toHex(data.style.primaryColor);
  const bc = toHex(data.style.borderColor);
  const hbg = toHex(data.style.headingBgColor);
  const safeBg = (c: string) => { const h = toHex(c); return h === '#000000' ? '#f3f4f6' : h; };

  let inner = '';

  // ===================== HEADER =====================
  inner += `<div style="padding-bottom:14px; margin-bottom:20px; border-bottom:2px solid ${bc}; display:flex; justify-content:space-between; align-items:flex-start;">`;
  // Left: Company
  inner += `<div style="flex:1; min-width:0;">`;
  inner += `<div style="font-size:18px; font-weight:bold; color:${pc}; margin-bottom:4px; line-height:1.3;">${esc(data.companyName) || '<span style="color:#cbd5e1;">公司名称</span>'}</div>`;
  if (data.companyNameEn) inner += `<div style="font-size:10px; color:#64748b; margin-bottom:2px;">${esc(data.companyNameEn)}</div>`;
  if (data.companyAddress) inner += `<div style="font-size:10px; color:#64748b; margin-bottom:2px;">${esc(data.companyAddress)}</div>`;
  if (data.companyPhone || data.companyEmail) {
    inner += `<div style="font-size:10px; color:#64748b;">`;
    if (data.companyPhone) inner += `Tel: ${esc(data.companyPhone)}`;
    if (data.companyPhone && data.companyEmail) inner += ' | ';
    if (data.companyEmail) inner += `Email: ${esc(data.companyEmail)}`;
    inner += `</div>`;
  }
  inner += `</div>`;
  // Right: Document title
  inner += `<div style="text-align:right; flex:0 0 auto; min-width:180px;">`;
  inner += `<div style="font-size:24px; font-weight:bold; color:${pc}; margin-bottom:2px; line-height:1.2;">${esc(data.titleZh)}</div>`;
  inner += `<div style="font-size:11px; color:#64748b; margin-bottom:10px;">${esc(data.titleEn)}</div>`;
  inner += `<div style="font-size:11px; color:#334155; margin-bottom:3px;"><span style="color:#64748b;">No.:</span> <strong>${esc(data.documentNo) || '<span style="color:#cbd5e1;">—</span>'}</strong></div>`;
  inner += `<div style="font-size:11px; color:#334155;"><span style="color:#64748b;">Date:</span> <strong>${esc(data.documentDate) || '<span style="color:#cbd5e1;">—</span>'}</strong></div>`;
  inner += `</div></div>`;

  // ===================== SECTIONS =====================
  for (const section of data.sections) {
    const visibleFields = section.fields.filter(f => val(section.data[f.key]));
    if (visibleFields.length === 0) continue;

    inner += `<div style="margin-bottom:18px;">`;
    inner += `<div style="font-size:12px; font-weight:bold; color:${pc}; margin-bottom:8px; padding-bottom:4px; border-bottom:1px solid ${safeBg(hbg)};">${esc(section.title)}</div>`;
    inner += `<div style="display:grid; grid-template-columns:1fr 1fr; gap:5px 20px; font-size:11px;">`;
    for (const field of section.fields) {
      const v = section.data[field.key];
      if (!v && v !== 0) continue;
      const span = field.colspan === 2 ? 'grid-column: span 2;' : '';
      inner += `<div style="${span}"><span style="color:#64748b;">${esc(field.label)}:</span><br/><span style="color:#1e293b;">${esc(String(v))}</span></div>`;
    }
    inner += `</div></div>`;
  }

  // ===================== LINE ITEMS TABLE =====================
  if (data.lineItems.columns.length > 0 && data.lineItems.rows.length > 0) {
    inner += `<div style="margin-bottom:18px;">`;
    inner += `<div style="font-size:12px; font-weight:bold; color:${pc}; margin-bottom:8px; padding-bottom:4px; border-bottom:1px solid ${safeBg(hbg)};">货物/项目明细</div>`;
    inner += `<table style="width:100%; border-collapse:collapse; font-size:11px; table-layout:auto;">`;
    inner += `<thead><tr>`;
    for (const col of data.lineItems.columns) {
      inner += `<th style="border-bottom:2px solid ${bc}; padding:8px 8px; text-align:left; font-weight:bold; color:${pc}; background-color:${safeBg(hbg)}; white-space:nowrap;">${esc(col.label)}</th>`;
    }
    inner += `</tr></thead><tbody>`;
    let rowIdx = 0;
    for (const row of data.lineItems.rows) {
      const bg = rowIdx % 2 === 0 ? '#ffffff' : safeBg(hbg);
      inner += `<tr style="background-color:${bg};">`;
      for (const col of data.lineItems.columns) {
        const v = row[col.key] ?? '';
        const isNum = col.key === 'amount' || col.key === 'totalValue' || col.key === 'unitPrice' || col.key === 'quantity' || col.key === 'grossWeight' || col.key === 'netWeight' || col.key === 'volume';
        inner += `<td style="border-bottom:1px solid ${bc}; padding:6px 8px;${isNum ? ' text-align:right;' : ''}">${esc(String(v)) || '—'}</td>`;
      }
      inner += `</tr>`;
      rowIdx++;
    }
    if (data.lineItems.totals.length > 0) {
      inner += `<tfoot><tr style="background-color:${safeBg(hbg)}; font-weight:bold;">`;
      inner += `<td colspan="${data.lineItems.columns.length}" style="border-top:2px solid ${bc}; padding:8px 8px; text-align:right; font-size:12px; color:#1e293b;">`;
      for (const t of data.lineItems.totals) {
        inner += `<span style="margin-left:24px;">${esc(t.label)}: ${esc(t.value)}</span>`;
      }
      inner += `</td></tr></tfoot>`;
    }
    inner += `</tbody></table></div>`;
  }

  // ===================== TERMS =====================
  if (data.terms) {
    inner += `<div style="margin-bottom:18px;">`;
    inner += `<div style="font-size:12px; font-weight:bold; color:${pc}; margin-bottom:8px; padding-bottom:4px; border-bottom:1px solid ${safeBg(hbg)};">备注条款</div>`;
    inner += `<div style="font-size:11px; color:#334155; white-space:pre-wrap; line-height:1.6;">${esc(data.terms)}</div></div>`;
  }

  // ===================== SIGNATURES =====================
  inner += `<div style="margin-top:36px; padding-top:16px; border-top:1px solid ${bc};">`;
  inner += `<div style="display:flex; justify-content:space-between; gap:32px;">`;
  inner += `<div style="width:48%; font-size:11px;">`;
  inner += `<div style="color:#475569; margin-bottom:48px; border-bottom:1px solid #cbd5e1; padding-bottom:4px;">卖方/制单人签字盖章</div>`;
  inner += `<div style="color:#475569;">日期：<span style="display:inline-block; width:100px; border-bottom:1px solid #cbd5e1;">&nbsp;</span></div>`;
  inner += `</div>`;
  inner += `<div style="width:48%; font-size:11px;">`;
  inner += `<div style="color:#475569; margin-bottom:48px; border-bottom:1px solid #cbd5e1; padding-bottom:4px;">买方/审核人签字盖章</div>`;
  inner += `<div style="color:#475569;">日期：<span style="display:inline-block; width:100px; border-bottom:1px solid #cbd5e1;">&nbsp;</span></div>`;
  inner += `</div>`;
  inner += `</div></div>`;

  // ===================== FOOTER =====================
  if (!data.canRemoveBranding) {
    inner += `<div style="margin-top:16px; padding-top:8px; border-top:1px solid #e2e8f0; text-align:center; font-size:8px; color:#94a3b8; line-height:1.4;">由海外百宝箱生成，仅供参考 | jueshi.net</div>`;
  }

  // Wrap in A4 page with proper padding + inner container
  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body {
  width: 794px; min-width: 794px; max-width: 794px;
  background: #ffffff; color: #111827;
}
body {
  font-family: Arial, "Noto Sans SC", "Microsoft YaHei", "SimSun", sans-serif;
  font-size: 12px; line-height: 1.5;
}
.a4-page {
  width: 794px; min-height: 1123px; background: #ffffff;
  padding: ${PAD_TOP}px ${PAD_X}px ${PAD_BOTTOM}px ${PAD_X}px;
}
.a4-inner {
  width: 100%; height: 100%; position: relative;
}
table { page-break-inside: auto; }
tr { page-break-inside: avoid; }
@media print { @page { margin: 0; size: A4; } }
</style>
</head>
<body>
<div class="a4-page">
<div class="a4-inner">${inner}</div>
</div>
</body>
</html>`;

  return html;
}

export const A4_WIDTH = 794;
export const A4_HEIGHT = 1123;
export const A4_EXPORT_SCALE = 2;
