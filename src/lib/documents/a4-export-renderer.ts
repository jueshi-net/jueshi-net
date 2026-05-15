/**
 * DocumentA4ExportRenderer - Fixed A4 export engine v1.12.8
 * 
 * Builds a complete A4 document using ONLY inline CSS (px units, hex colors).
 * NO Tailwind classes, NO responsive layout, NO lab/oklch.
 * Renders into a fixed-width hidden iframe, captured by html2canvas.
 * 
 * Output: 794px base × 1123px height @ scale 2 = 1588×2246px PNG
 */

// ---- Color utilities ----
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

// ---- Section types ----
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
  // Company
  companyName: string;
  companyNameEn: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  companyWebsite: string;
  // Document
  documentNo: string;
  documentDate: string;
  titleZh: string;
  titleEn: string;
  // Content
  sections: ExportSection[];
  lineItems: {
    columns: ExportColumn[];
    rows: Record<string, any>[];
    totals: ExportTotal[];
  };
  terms: string;
  canRemoveBranding: boolean;
  // Style
  style: {
    primaryColor: string;
    borderColor: string;
    headingBgColor: string;
  };
}

// ---- Main builder ----
export function buildA4ExportHTML(data: A4ExportData): string {
  const pc = toHex(data.style.primaryColor);
  const bc = toHex(data.style.borderColor);
  const hbg = toHex(data.style.headingBgColor);
  const safeBg = (c: string) => { const h = toHex(c); return h === '#000000' ? '#f3f4f6' : h; };

  let body = '';

  // === HEADER: Company info left, document info right ===
  body += `<div style="border-bottom:2px solid ${bc}; padding-bottom:12px; margin-bottom:14px; display:flex; justify-content:space-between; align-items:flex-start;">`;
  // Left: Company
  body += `<div style="flex:1;">`;
  body += `<div style="font-size:16px; font-weight:bold; color:${pc}; margin-bottom:3px;">${esc(data.companyName) || '<span style="color:#9ca3af;">公司名称</span>'}</div>`;
  if (data.companyNameEn) body += `<div style="font-size:10px; color:#6b7280; margin-bottom:2px;">${esc(data.companyNameEn)}</div>`;
  if (data.companyAddress) body += `<div style="font-size:10px; color:#6b7280; margin-bottom:2px;">${esc(data.companyAddress)}</div>`;
  if (data.companyPhone || data.companyEmail) {
    body += `<div style="font-size:10px; color:#6b7280;">`;
    if (data.companyPhone) body += `Tel: ${esc(data.companyPhone)}`;
    if (data.companyPhone && data.companyEmail) body += ' | ';
    if (data.companyEmail) body += `Email: ${esc(data.companyEmail)}`;
    body += `</div>`;
  }
  body += `</div>`;
  // Right: Document title + info
  body += `<div style="text-align:right; flex:0 0 auto; min-width:200px;">`;
  body += `<div style="font-size:22px; font-weight:bold; color:${pc}; margin-bottom:2px;">${esc(data.titleZh)}</div>`;
  body += `<div style="font-size:12px; color:#6b7280; margin-bottom:8px;">${esc(data.titleEn)}</div>`;
  body += `<div style="font-size:11px; margin-bottom:3px;"><strong>No.:</strong> ${esc(data.documentNo) || '<span style="color:#d1d5db;">___________</span>'}</div>`;
  body += `<div style="font-size:11px;"><strong>Date:</strong> ${esc(data.documentDate) || '<span style="color:#d1d5db;">____-__-__</span>'}</div>`;
  body += `</div></div>`;

  // === SECTIONS ===
  for (const section of data.sections) {
    const visibleFields = section.fields.filter(f => val(section.data[f.key]));
    if (visibleFields.length === 0) continue;
    body += `<div style="margin-bottom:10px;">`;
    body += `<div style="background-color:${safeBg(hbg)}; color:${pc}; font-size:12px; font-weight:bold; padding:4px 8px; margin-bottom:6px; border-left:3px solid ${pc};">${esc(section.title)}</div>`;
    body += `<div style="display:grid; grid-template-columns:1fr 1fr; gap:3px 16px; font-size:11px; padding:0 4px;">`;
    for (const field of section.fields) {
      const v = section.data[field.key];
      if (!v && v !== 0) continue;
      const span = field.colspan === 2 ? 'grid-column: span 2;' : '';
      body += `<div style="${span}"><span style="color:#6b7280;">${esc(field.label)}: </span><span style="color:#111827;">${esc(String(v))}</span></div>`;
    }
    body += `</div></div>`;
  }

  // === LINE ITEMS TABLE ===
  if (data.lineItems.columns.length > 0 && data.lineItems.rows.length > 0) {
    body += `<div style="margin-bottom:10px;">`;
    body += `<div style="background-color:${safeBg(hbg)}; color:${pc}; font-size:12px; font-weight:bold; padding:4px 8px; margin-bottom:6px; border-left:3px solid ${pc};">货物/项目明细</div>`;
    body += `<table style="width:100%; border-collapse:collapse; font-size:11px;">`;
    body += `<thead><tr>`;
    for (const col of data.lineItems.columns) {
      body += `<th style="border:1px solid ${bc}; padding:5px 6px; text-align:left; font-weight:bold; color:${pc}; background-color:${safeBg(hbg)}; white-space:nowrap;">${esc(col.label)}</th>`;
    }
    body += `</tr></thead><tbody>`;
    for (const row of data.lineItems.rows) {
      body += `<tr>`;
      for (const col of data.lineItems.columns) {
        const v = row[col.key] ?? '';
        const isNum = col.key === 'amount' || col.key === 'totalValue' || col.key === 'unitPrice' || col.key === 'quantity' || col.key === 'grossWeight' || col.key === 'netWeight' || col.key === 'volume';
        body += `<td style="border:1px solid ${bc}; padding:4px 6px;${isNum ? ' text-align:right;' : ''}">${esc(String(v))}</td>`;
      }
      body += `</tr>`;
    }
    if (data.lineItems.totals.length > 0) {
      body += `<tfoot><tr style="background-color:${safeBg(hbg)}; font-weight:bold;">`;
      body += `<td colspan="${data.lineItems.columns.length}" style="border:1px solid ${bc}; padding:5px 6px; text-align:right;">`;
      for (const t of data.lineItems.totals) {
        body += `<span style="margin-left:20px; font-size:11px;">${esc(t.label)}: ${esc(t.value)}</span>`;
      }
      body += `</td></tr></tfoot>`;
    }
    body += `</tbody></table></div>`;
  }

  // === TERMS ===
  if (data.terms) {
    body += `<div style="margin-bottom:10px;">`;
    body += `<div style="background-color:${safeBg(hbg)}; color:${pc}; font-size:12px; font-weight:bold; padding:4px 8px; margin-bottom:6px; border-left:3px solid ${pc};">备注条款</div>`;
    body += `<div style="font-size:11px; color:#111827; white-space:pre-wrap; padding:0 4px;">${esc(data.terms)}</div></div>`;
  }

  // === SIGNATURE AREA ===
  body += `<div style="margin-top:40px; padding-top:12px; border-top:1px solid ${bc};">`;
  body += `<div style="display:grid; grid-template-columns:1fr 1fr; gap:40px;">`;
  body += `<div style="font-size:11px;">`;
  body += `<div style="color:#6b7280; margin-bottom:50px;">卖方/制单人签字盖章：</div>`;
  body += `<div>日期：____________</div></div>`;
  body += `<div style="font-size:11px;">`;
  body += `<div style="color:#6b7280; margin-bottom:50px;">买方/审核人签字盖章：</div>`;
  body += `<div>日期：____________</div></div>`;
  body += `</div></div>`;

  // === FOOTER ===
  if (!data.canRemoveBranding) {
    body += `<div style="margin-top:20px; padding-top:8px; border-top:1px solid #e5e7eb; text-align:center; font-size:8px; color:#d1d5db;">由海外百宝箱生成，仅供参考 | kjbxb.com</div>`;
  }

  // Wrap in A4 page
  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: 794px; min-width: 794px; max-width: 794px; background: #ffffff; color: #111827; }
body { font-family: "SimSun", "Noto Serif SC", "Songti SC", "Microsoft YaHei", serif; font-size: 12px; line-height: 1.5; padding: 32px 36px; }
.a4-page { width: 794px; min-height: 1123px; background: #ffffff; }
table { page-break-inside: auto; }
tr { page-break-inside: avoid; }
@media print { @page { margin: 0; size: A4; } }
</style>
</head>
<body>
<div class="a4-page">${body}</div>
</body>
</html>`;

  return html;
}

// ---- A4 dimensions ----
export const A4_WIDTH = 794;   // px at 96dpi
export const A4_HEIGHT = 1123; // px at 96dpi
export const A4_EXPORT_SCALE = 2; // output: 1588×2246px
