/**
 * Export-only rendering: builds a pure HTML string with ONLY hex/rgb colors,
 * no Tailwind classes, no CSS variables, no lab/oklch.
 * html2canvas screenshots this isolated container.
 */

interface ExportData {
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
  sections: { title: string; fields: { key: string; label: string; colspan?: number }[]; data: Record<string, any> }[];
  lineItems: { columns: { key: string; label: string }[]; rows: Record<string, any>[]; totals: { key: string; label: string; value: string }[] };
  terms: string;
  canRemoveBranding: boolean;
  style: {
    primaryColor: string;
    borderColor: string;
    headingBgColor: string;
  };
}

function hex(c: string): string {
  // Ensure it's a valid hex color
  if (/^#[0-9a-fA-F]{6}$/.test(c)) return c;
  if (/^#[0-9a-fA-F]{3}$/.test(c)) return `#${c[1]}${c[1]}${c[2]}${c[2]}${c[3]}${c[3]}`;
  return '#000000';
}

export function buildExportHTML(data: ExportData): string {
  const { primaryColor, borderColor, headingBgColor } = data.style;
  const pc = hex(primaryColor);
  const bc = hex(borderColor);
  const hbg = hex(headingBgColor);

  const safeBg = (v: string) => {
    const c = hex(v);
    return c === '#000000' ? '#f3f4f6' : c;
  };

  let html = '';

  // Header
  html += `<div style="border-bottom:2px solid ${bc}; padding-bottom:16px; margin-bottom:16px;">`;
  html += `<div style="display:flex; justify-content:space-between;">`;
  html += `<div>`;
  html += `<h2 style="color:${pc}; font-size:14pt; font-weight:bold; margin:0 0 4px 0;">${esc(data.companyName || '公司名称')}</h2>`;
  if (data.companyNameEn) html += `<p style="color:#6b7280; font-size:9pt; margin:0 0 2px 0;">${esc(data.companyNameEn)}</p>`;
  if (data.companyAddress) html += `<p style="color:#6b7280; font-size:9pt; margin:0 0 2px 0;">${esc(data.companyAddress)}</p>`;
  if (data.companyPhone || data.companyEmail) {
    html += `<p style="color:#6b7280; font-size:9pt; margin:0;">`;
    if (data.companyPhone) html += `Tel: ${esc(data.companyPhone)}`;
    if (data.companyPhone && data.companyEmail) html += ` | `;
    if (data.companyEmail) html += `Email: ${esc(data.companyEmail)}`;
    html += `</p>`;
  }
  html += `</div>`;
  html += `<div style="text-align:right;">`;
  html += `<h1 style="color:${pc}; font-size:18pt; font-weight:bold; margin:0 0 2px 0;">${esc(data.titleZh)}</h1>`;
  html += `<p style="color:#6b7280; font-size:10pt; margin:0 0 8px 0;">${esc(data.titleEn)}</p>`;
  html += `<p style="font-size:10pt; margin:0 0 2px 0;">No.: <strong>${esc(data.documentNo || '___')}</strong></p>`;
  html += `<p style="font-size:10pt; margin:0;">Date: ${esc(data.documentDate || '___')}</p>`;
  html += `</div></div></div>`;

  // Sections
  for (const section of data.sections) {
    const hasData = section.fields.some(f => section.data[f.key]);
    if (!hasData) continue;
    html += `<div style="margin-bottom:12px;">`;
    html += `<h3 style="background-color:${safeBg(hbg)}; color:${pc}; font-size:10pt; font-weight:bold; margin:0 0 6px 0; padding:4px 8px;">${esc(section.title)}</h3>`;
    html += `<div style="display:grid; grid-template-columns:1fr 1fr; gap:4px 16px; font-size:9pt;">`;
    for (const field of section.fields) {
      const val = section.data[field.key];
      if (!val) continue;
      const span = field.colspan === 2 ? 'grid-column:span 2;' : '';
      html += `<div style="${span}"><span style="color:#6b7280;">${esc(field.label)}: </span><span style="color:#111827;">${esc(String(val))}</span></div>`;
    }
    html += `</div></div>`;
  }

  // Line items table
  if (data.lineItems.columns.length > 0 && data.lineItems.rows.length > 0) {
    html += `<div style="margin-bottom:12px;">`;
    html += `<h3 style="background-color:${safeBg(hbg)}; color:${pc}; font-size:10pt; font-weight:bold; margin:0 0 6px 0; padding:4px 8px;">货物/项目明细</h3>`;
    html += `<table style="width:100%; border-collapse:collapse; font-size:9pt;">`;
    html += `<thead><tr style="background-color:${safeBg(hbg)};">`;
    for (const col of data.lineItems.columns) {
      html += `<th style="border:1px solid ${bc}; padding:4px 8px; text-align:left; color:${pc}; font-weight:bold;">${esc(col.label)}</th>`;
    }
    html += `</tr></thead><tbody>`;
    for (const row of data.lineItems.rows) {
      html += `<tr>`;
      for (const col of data.lineItems.columns) {
        const val = row[col.key] ?? '';
        const isAmt = col.key === 'amount' || col.key === 'totalValue' || col.key === 'unitPrice';
        html += `<td style="border:1px solid ${bc}; padding:4px 8px;${isAmt ? ' text-align:right;' : ''}">${esc(String(val))}</td>`;
      }
      html += `</tr>`;
    }
    if (data.lineItems.totals.length > 0) {
      html += `<tfoot><tr style="background-color:${safeBg(hbg)}; font-weight:bold;">`;
      html += `<td colspan="${data.lineItems.columns.length}" style="border:1px solid ${bc}; padding:4px 8px; text-align:right;">`;
      for (const t of data.lineItems.totals) {
        html += `<span style="margin-left:16px;">${esc(t.label)}: ${esc(t.value)}</span>`;
      }
      html += `</td></tr></tfoot>`;
    }
    html += `</tbody></table></div>`;
  }

  // Terms
  if (data.terms) {
    html += `<div style="margin-bottom:12px;">`;
    html += `<h3 style="background-color:${safeBg(hbg)}; color:${pc}; font-size:10pt; font-weight:bold; margin:0 0 6px 0; padding:4px 8px;">备注条款</h3>`;
    html += `<p style="font-size:9pt; white-space:pre-wrap; color:#111827;">${esc(data.terms)}</p></div>`;
  }

  // Signature
  html += `<div style="margin-top:32px; padding-top:16px; border-top:1px solid ${bc};">`;
  html += `<div style="display:grid; grid-template-columns:1fr 1fr; gap:32px; font-size:9pt;">`;
  html += `<div><p style="color:#6b7280; margin:0 0 48px 0;">卖方/制单人签字盖章：</p><p style="margin:0;">日期：____________</p></div>`;
  html += `<div><p style="color:#6b7280; margin:0 0 48px 0;">买方/审核人签字盖章：</p><p style="margin:0;">日期：____________</p></div>`;
  html += `</div></div>`;

  // Branding
  if (!data.canRemoveBranding) {
    html += `<div style="margin-top:24px; padding-top:12px; border-top:1px solid ${bc}; text-align:center; font-size:8pt; color:#d1d5db;">由海外百宝箱生成，仅供参考 | kjbxb.com</div>`;
  }

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    * { box-sizing: border-box; }
    body { font-family: "SimSun", "Noto Serif SC", serif; margin: 0; padding: 0; background: #fff; color: #111827; }
    @page { margin: 0; }
  </style></head><body style="padding:24px;">${html}</body></html>`;
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
