/**
 * Template Renderers for Label Maker — v1.20.4
 * 8 template-specific layout renderers for both:
 *   - React preview (page.tsx inline rendering)
 *   - HTML export (a4-export-renderer.ts)
 *
 * Each renderer has real layout differences, not just colors.
 * The `LabelVisualStyle` extends the basic style with header, border, title,
 * emphasis, muted, background, and block style helpers.
 */

import { LabelStyle, labelStyles } from "./label-types";

// ===================== VISUAL STYLE EXPANSION =====================

export interface LabelVisualStyle extends LabelStyle {
  /** Header bar: bg color, text color, border-bottom, padding style */
  headerStyle: { bg: string; color: string; borderBottom: string; padding: string; textTransform: string };
  /** Border style for the outer container */
  borderStyle: { width: string; style: string; color: string; radius: string };
  /** Title/header text styling */
  titleStyle: { size: string; weight: string; color: string; letterSpacing: string };
  /** Emphasis (big number/key fields) styling */
  emphasisStyle: { size: string; weight: string; color: string; bg: string; padding: string };
  /** Muted/label text styling */
  mutedStyle: { size: string; color: string; transform: string };
  /** Inner block (section) background */
  blockStyle: { bg: string; border: string; radius: string; padding: string };
}

/**
 * Build a LabelVisualStyle from the base LabelStyle.
 * This replaces the old "just colors" approach with structural visual differences.
 */
export function buildVisualStyle(style: LabelStyle): LabelVisualStyle {
  switch (style.id) {
    case "black-white":
      return { ...style,
        headerStyle: { bg: "transparent", color: "#000", borderBottom: "2px solid #000", padding: "0", textTransform: "uppercase" },
        borderStyle: { width: "2px", style: "solid", color: "#000", radius: "0" },
        titleStyle: { size: "16px", weight: "900", color: "#000", letterSpacing: "0.5px" },
        emphasisStyle: { size: "14px", weight: "700", color: "#000", bg: "#f8f8f8", padding: "6px 10px" },
        mutedStyle: { size: "10px", color: "#666", transform: "uppercase" },
        blockStyle: { bg: "#fff", border: "1px solid #ccc", radius: "0", padding: "8px" },
      };
    case "blue-trade":
      return { ...style,
        headerStyle: { bg: "linear-gradient(135deg, #1e40af, #2563eb)", color: "#fff", borderBottom: "none", padding: "10px 12px", textTransform: "none" },
        borderStyle: { width: "1px", style: "solid", color: "#93c5fd", radius: "6px" },
        titleStyle: { size: "16px", weight: "800", color: "#1e40af", letterSpacing: "0.3px" },
        emphasisStyle: { size: "13px", weight: "700", color: "#1e40af", bg: "#eff6ff", padding: "6px 10px" },
        mutedStyle: { size: "10px", color: "#64748b", transform: "uppercase" },
        blockStyle: { bg: "#f8faff", border: "1px solid #dbeafe", radius: "4px", padding: "10px" },
      };
    case "dark-gray":
      return { ...style,
        headerStyle: { bg: "#374151", color: "#f9fafb", borderBottom: "2px solid #1f2937", padding: "10px 12px", textTransform: "none" },
        borderStyle: { width: "1px", style: "solid", color: "#9ca3af", radius: "2px" },
        titleStyle: { size: "15px", weight: "800", color: "#1f2937", letterSpacing: "0.2px" },
        emphasisStyle: { size: "13px", weight: "700", color: "#1f2937", bg: "#f3f4f6", padding: "6px 10px" },
        mutedStyle: { size: "10px", color: "#6b7280", transform: "uppercase" },
        blockStyle: { bg: "#f9fafb", border: "1px solid #e5e7eb", radius: "2px", padding: "8px" },
      };
    case "yellow-warning":
      return { ...style,
        headerStyle: { bg: "linear-gradient(135deg, #b45309, #d97706)", color: "#fff", borderBottom: "none", padding: "10px 12px", textTransform: "uppercase" },
        borderStyle: { width: "3px", style: "dashed", color: "#f59e0b", radius: "0" },
        titleStyle: { size: "18px", weight: "900", color: "#92400e", letterSpacing: "1px" },
        emphasisStyle: { size: "16px", weight: "800", color: "#92400e", bg: "#fef3c7", padding: "8px 12px" },
        mutedStyle: { size: "11px", color: "#a16207", transform: "uppercase" },
        blockStyle: { bg: "#fffbeb", border: "1px solid #fbbf24", radius: "0", padding: "10px" },
      };
    case "minimal":
      return { ...style,
        headerStyle: { bg: "transparent", color: "#111", borderBottom: "none", padding: "4px 0", textTransform: "none" },
        borderStyle: { width: "0", style: "none", color: "transparent", radius: "0" },
        titleStyle: { size: "15px", weight: "600", color: "#111", letterSpacing: "0" },
        emphasisStyle: { size: "13px", weight: "600", color: "#111", bg: "transparent", padding: "4px 0" },
        mutedStyle: { size: "10px", color: "#999", transform: "none" },
        blockStyle: { bg: "transparent", border: "none", radius: "0", padding: "6px 0" },
      };
    case "large-bold":
      return { ...style,
        headerStyle: { bg: "linear-gradient(135deg, #b91c1c, #dc2626)", color: "#fff", borderBottom: "none", padding: "10px 14px", textTransform: "uppercase" },
        borderStyle: { width: "3px", style: "solid", color: "#dc2626", radius: "4px" },
        titleStyle: { size: "20px", weight: "900", color: "#dc2626", letterSpacing: "1px" },
        emphasisStyle: { size: "18px", weight: "900", color: "#dc2626", bg: "#fee2e2", padding: "10px 14px" },
        mutedStyle: { size: "12px", color: "#6b7280", transform: "uppercase" },
        blockStyle: { bg: "#fff5f5", border: "1px solid #fecaca", radius: "4px", padding: "12px" },
      };
    default:
      return { ...style,
        headerStyle: { bg: "transparent", color: style.primaryColor, borderBottom: `2px solid ${style.borderColor}`, padding: "8px", textTransform: "none" },
        borderStyle: { width: "1px", style: "solid", color: style.borderColor, radius: "4px" },
        titleStyle: { size: "16px", weight: "800", color: style.primaryColor, letterSpacing: "0" },
        emphasisStyle: { size: "13px", weight: "700", color: style.primaryColor, bg: "#f8f8f8", padding: "6px 10px" },
        mutedStyle: { size: "10px", color: "#666", transform: "uppercase" },
        blockStyle: { bg: "#fff", border: "1px solid #ddd", radius: "4px", padding: "8px" },
      };
  }
}

// ===================== FIELD HELPER =====================

function val(v: any): string {
  return v != null && v !== '' ? String(v) : '';
}

function fieldRow(label: string, value: string, vs: LabelVisualStyle, spanFull = false): string {
  if (!value) return '';
  return `<div style="${spanFull ? 'grid-column: 1 / -1;' : ''} padding: 6px 0; border-bottom: 1px solid #f0f0f0;">
    <div style="font-size: ${vs.mutedStyle.size}; color: ${vs.mutedStyle.color}; ${vs.mutedStyle.transform ? `text-transform: ${vs.mutedStyle.transform};` : ''} margin-bottom: 2px;">${label}</div>
    <div style="font-size: ${vs.emphasisStyle.size}; font-weight: ${vs.emphasisStyle.weight}; color: ${vs.emphasisStyle.color}; background: ${vs.emphasisStyle.bg}; padding: ${vs.emphasisStyle.padding}; border-radius: 3px;">${value}</div>
  </div>`;
}

// ===================== EXPORT RENDERERS (HTML string) =====================

export interface ExportLabelData {
  formData: Record<string, any>;
  style: LabelVisualStyle;
  titleZh: string;
  titleEn: string;
}

/** A. 通用外箱唛头 shipping-mark */
export function renderShippingMarkExport(data: ExportLabelData): string {
  const { fd: f, vs, tz, te } = destructure(data);
  return `
    ${headerBlock(tz, te, vs)}
    <div style="margin: 16px 0;">
      ${f.mainMark ? `<div style="border: ${vs.borderStyle.width} ${vs.borderStyle.style} ${vs.borderStyle.color}; border-radius: ${vs.borderStyle.radius}; padding: 16px; margin-bottom: 16px;">
        <div style="font-size: ${vs.mutedStyle.size}; color: ${vs.mutedStyle.color}; text-transform: ${vs.mutedStyle.transform}; margin-bottom: 4px;">MAIN MARK / 主唛</div>
        <div style="font-size: 22px; font-weight: 900; color: #111; line-height: 1.4; white-space: pre-wrap;">${esc(f.mainMark)}</div>
      </div>` : ''}
      ${f.sideMark ? `<div style="border: 1px solid #ccc; padding: 12px; margin-bottom: 16px; border-radius: ${vs.borderStyle.radius};">
        <div style="font-size: ${vs.mutedStyle.size}; color: ${vs.mutedStyle.color}; text-transform: ${vs.mutedStyle.transform}; margin-bottom: 4px;">SIDE MARK / 侧唛</div>
        <div style="font-size: 13px; color: #333; white-space: pre-wrap;">${esc(f.sideMark)}</div>
      </div>` : ''}
    </div>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0 24px; margin-bottom: 16px; border-top: 2px solid #333; padding-top: 12px;">
      ${fieldRow('目的港 / Destination', f.destination || '', vs)}
      ${fieldRow('箱号 / C/No.', f.cartonNo ? `C/No. ${esc(f.cartonNo)}` : '', vs)}
      ${fieldRow('毛重 / G.W.', f.grossWeight || '', vs)}
      ${fieldRow('净重 / N.W.', f.netWeight || '', vs)}
      ${fieldRow('尺寸 / MEAS.', f.measurement || '', vs)}
      ${fieldRow('原产地 / Origin', f.origin || '', vs)}
    </div>
    ${f.remark ? `<div style="border-top: 1px solid #ccc; padding-top: 8px; font-size: 11px; color: #666;">备注: ${esc(f.remark)}</div>` : ''}
  `;
}

/** B. 集运入库标签 consolidation-inbound-label */
export function renderConsolidationInboundExport(data: ExportLabelData): string {
  const { fd: f, vs, tz, te } = destructure(data);
  return `
    ${headerBlock('📥 集运入库标签', 'INBOUND LABEL', { ...vs, headerStyle: { ...vs.headerStyle, bg: '#1e40af' }})}
    <div style="text-align: center; padding: 20px 0 16px 0;">
      <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">集运账号 / ACCOUNT</div>
      <div style="font-size: 28px; font-weight: 900; color: #1e40af; letter-spacing: 1px;">${esc(f.customerAccount) || '—'}</div>
    </div>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; margin-bottom: 16px;">
      <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 12px; text-align: center;">
        <div style="font-size: 10px; color: #64748b; text-transform: uppercase;">快递单号</div>
        <div style="font-size: 16px; font-weight: 700; color: #1e40af; word-break: break-all;">${esc(f.trackingNo) || '—'}</div>
      </div>
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 4px; padding: 12px; text-align: center;">
        <div style="font-size: 10px; color: #64748b; text-transform: uppercase;">客户昵称</div>
        <div style="font-size: 16px; font-weight: 700; color: #16a34a;">${esc(f.customerNickname) || '—'}</div>
      </div>
    </div>
    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 16px;">
      ${f.itemType ? `<div style="text-align: center; padding: 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px;"><div style="font-size: 10px; color: #64748b;">物品类型</div><div style="font-size: 14px; font-weight: 600;">${esc(f.itemType)}</div></div>` : ''}
      ${f.arrivalDate ? `<div style="text-align: center; padding: 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px;"><div style="font-size: 10px; color: #64748b;">到仓日期</div><div style="font-size: 14px; font-weight: 600;">${esc(f.arrivalDate)}</div></div>` : ''}
      ${f.packageCount ? `<div style="text-align: center; padding: 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px;"><div style="font-size: 10px; color: #64748b;">包裹数</div><div style="font-size: 14px; font-weight: 600;">${esc(f.packageCount)}</div></div>` : ''}
    </div>
    ${f.handlingNote ? `<div style="background: #fffbeb; border: 1px dashed #f59e0b; padding: 10px; border-radius: 4px; text-align: center;">
      <span style="font-size: 12px; color: #92400e;">⚠️ 收货核对: ${esc(f.handlingNote)}</span>
    </div>` : ''}
  `;
}

/** C. 集运合箱标签 consolidation-combined-label */
export function renderConsolidationCombinedExport(data: ExportLabelData): string {
  const { fd: f, vs, tz, te } = destructure(data);
  return `
    ${headerBlock('📫 合箱标签', 'COMBINED PARCEL LABEL', { ...vs, headerStyle: { ...vs.headerStyle, bg: '#7c3aed' }})}
    <div style="text-align: center; padding: 18px 0 16px 0;">
      <div style="font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">合箱编号 / COMBINED NO.</div>
      <div style="font-size: 30px; font-weight: 900; color: #7c3aed; letter-spacing: 1px;">${esc(f.combinedNo) || '—'}</div>
      <div style="font-size: 12px; color: #64748b;">客户 ID: ${esc(f.customerId) || '—'}</div>
    </div>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 16px;">
      ${f.originalPackages ? `<div style="background: #f5f3ff; border: 1px solid #c4b5fd; border-radius: 6px; padding: 12px; text-align: center;"><div style="font-size: 10px; color: #64748b; text-transform: uppercase;">原包裹数</div><div style="font-size: 22px; font-weight: 800; color: #6d28d9;">${esc(f.originalPackages)}</div></div>` : ''}
      ${f.totalWeight ? `<div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 12px; text-align: center;"><div style="font-size: 10px; color: #64748b; text-transform: uppercase;">总重量</div><div style="font-size: 22px; font-weight: 800; color: #16a34a;">${esc(f.totalWeight)}</div></div>` : ''}
      ${f.destCountry ? `<div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 12px; text-align: center;"><div style="font-size: 10px; color: #64748b; text-transform: uppercase;">目的地</div><div style="font-size: 16px; font-weight: 700; color: #2563eb;">${esc(f.destCountry)}</div></div>` : ''}
      ${f.combinedBoxNo ? `<div style="background: #fef3c7; border: 1px solid #fde68a; border-radius: 6px; padding: 12px; text-align: center;"><div style="font-size: 10px; color: #64748b; text-transform: uppercase;">合箱后箱号</div><div style="font-size: 16px; font-weight: 700; color: #d97706;">${esc(f.combinedBoxNo)}</div></div>` : ''}
    </div>
    <div style="background: linear-gradient(90deg, #059669, #10b981); color: #fff; text-align: center; padding: 8px; border-radius: 4px; font-size: 14px; font-weight: 700; letter-spacing: 1px; margin-bottom: 12px;">
      ✅ 已合箱 / COMBINED — 待出库
    </div>
    ${f.operator || f.date ? `<div style="display: flex; justify-content: space-between; font-size: 11px; color: #64748b; padding-top: 8px; border-top: 1px solid #e2e8f0;">
      ${f.operator ? `<span>操作员: ${esc(f.operator)}</span>` : '<span></span>'}
      ${f.date ? `<span>日期: ${esc(f.date)}</span>` : ''}
    </div>` : ''}
  `;
}

/** D. 仓库库位标签 warehouse-location-label */
export function renderWarehouseLocationExport(data: ExportLabelData): string {
  const { fd: f, vs, tz, te } = destructure(data);
  return `
    ${headerBlock('🏪 仓库库位', 'WAREHOUSE LOCATION', { ...vs, headerStyle: { ...vs.headerStyle, bg: '#374151' }})}
    <div style="text-align: center; padding: 30px 0;">
      <div style="font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px;">仓库 / WAREHOUSE</div>
      <div style="font-size: 18px; font-weight: 700; color: #374151; margin-bottom: 20px;">${esc(f.warehouseCode) || '—'}</div>
      <div style="font-size: 64px; font-weight: 900; color: #111; line-height: 1.1; letter-spacing: 4px; margin-bottom: 16px; padding: 20px; border: 3px solid #111;">
        ${esc(f.locationNo) || '—'}
      </div>
      <div style="display: inline-flex; gap: 16px; font-size: 14px; color: #4b5563;">
        ${f.zone ? `<span><span style="color:#6b7280;">区域</span> ${esc(f.zone)}</span>` : ''}
        ${f.rackNo ? `<span><span style="color:#6b7280;">货架</span> ${esc(f.rackNo)}</span>` : ''}
        ${f.level ? `<span><span style="color:#6b7280;">层号</span> ${esc(f.level)}</span>` : ''}
      </div>
    </div>
    ${f.labelDesc ? `<div style="margin-top: 20px; padding: 8px; background: #f3f4f6; border-radius: 4px; font-size: 11px; color: #4b5563;">${esc(f.labelDesc)}</div>` : ''}
  `;
}

/** E. 国际包裹信息面单 parcel-info-label */
export function renderParcelInfoExport(data: ExportLabelData): string {
  const { fd: f, vs, tz, te } = destructure(data);
  return `
    ${headerBlock('📮 包裹信息面单', 'PARCEL INFO LABEL', { ...vs, headerStyle: { ...vs.headerStyle, bg: '#0e7490' }})}
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0; margin-bottom: 16px;">
      <div style="border: 1px solid #0e7490; padding: 14px; border-right: none; border-radius: 6px 0 0 6px;">
        <div style="font-size: 10px; color: #0e7490; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; font-weight: 700;">FROM / 寄件人</div>
        <div style="font-size: 14px; font-weight: 700; color: #111; white-space: pre-wrap; margin-bottom: 4px;">${esc(f.senderName) || '—'}</div>
        ${f.senderPhone ? `<div style="font-size: 11px; color: #475569;">☎ ${esc(f.senderPhone)}</div>` : ''}
      </div>
      <div style="border: 1px solid #0e7490; padding: 14px; border-radius: 0 6px 6px 0;">
        <div style="font-size: 10px; color: #0e7490; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; font-weight: 700;">TO / 收件人</div>
        <div style="font-size: 14px; font-weight: 700; color: #111; white-space: pre-wrap; margin-bottom: 4px;">${esc(f.receiverName) || '—'}</div>
        ${f.receiverPhone ? `<div style="font-size: 11px; color: #475569;">☎ ${esc(f.receiverPhone)}</div>` : ''}
      </div>
    </div>
    ${f.receiverAddress ? `<div style="background: #ecfeff; border: 1px solid #a5f3fc; border-radius: 4px; padding: 10px; margin-bottom: 16px;">
      <div style="font-size: 10px; color: #0e7490; text-transform: uppercase; margin-bottom: 4px;">地址 / ADDRESS</div>
      <div style="font-size: 13px; color: #164e63; white-space: pre-wrap;">${esc(f.receiverAddress)}</div>
    </div>` : ''}
    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 12px;">
      ${f.country ? `<div style="text-align: center; padding: 8px; background: #f0fdfa; border: 1px solid #99f6e4; border-radius: 4px;"><div style="font-size: 10px; color: #64748b;">国家</div><div style="font-size: 14px; font-weight: 600;">${esc(f.country)}</div></div>` : ''}
      ${f.postalCode ? `<div style="text-align: center; padding: 8px; background: #f0fdfa; border: 1px solid #99f6e4; border-radius: 4px;"><div style="font-size: 10px; color: #64748b;">邮编</div><div style="font-size: 14px; font-weight: 600;">${esc(f.postalCode)}</div></div>` : ''}
      ${f.refNo ? `<div style="text-align: center; padding: 8px; background: #f0fdfa; border: 1px solid #99f6e4; border-radius: 4px;"><div style="font-size: 10px; color: #64748b;">单号</div><div style="font-size: 14px; font-weight: 600;">${esc(f.refNo)}</div></div>` : ''}
    </div>
    ${f.declaredValue || f.quantity || f.itemDesc ? `<div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 12px;">
      ${f.quantity ? `<div style="text-align: center; padding: 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px;"><div style="font-size: 10px; color: #64748b;">数量</div><div style="font-size: 14px; font-weight: 600;">${esc(f.quantity)}</div></div>` : ''}
      ${f.declaredValue ? `<div style="text-align: center; padding: 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px;"><div style="font-size: 10px; color: #64748b;">申报价值</div><div style="font-size: 14px; font-weight: 600;">${esc(f.declaredValue)}</div></div>` : ''}
      ${f.itemDesc ? `<div style="text-align: center; padding: 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px;"><div style="font-size: 10px; color: #64748b;">物品</div><div style="font-size: 12px; font-weight: 600;">${esc(f.itemDesc)}</div></div>` : ''}
    </div>` : ''}
    <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 4px; padding: 8px; text-align: center;">
      <span style="font-size: 10px; color: #dc2626;">⚠️ 此标签非官方快递运单，仅用于信息整理或贴箱参考</span>
    </div>
  `;
}

/** F. FBA 外箱信息贴 fba-carton-info-label */
export function renderFBACartonExport(data: ExportLabelData): string {
  const { fd: f, vs, tz, te } = destructure(data);
  return `
    ${headerBlock('🏗️ FBA Reference Label', '装箱信息参考贴（非 Amazon 官方）', { ...vs, headerStyle: { ...vs.headerStyle, bg: '#1e293b' }})}
    <div style="border: 2px solid #333; border-radius: 0; margin: 16px 0; overflow: hidden;">
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #ddd; background: #f8fafc; font-size: 10px; color: #64748b; text-transform: uppercase; width: 35%;">Shipment ID</td>
          <td style="padding: 12px; border-bottom: 1px solid #ddd; font-size: 15px; font-weight: 700;">${esc(f.shipmentId) || '—'}</td>
        </tr>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #ddd; background: #f8fafc; font-size: 10px; color: #64748b; text-transform: uppercase;">Box No.</td>
          <td style="padding: 12px; border-bottom: 1px solid #ddd; font-size: 18px; font-weight: 900; text-align: center;">${esc(f.boxNo) || '—'}</td>
        </tr>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #ddd; background: #f8fafc; font-size: 10px; color: #64748b; text-transform: uppercase;">SKU / 产品名</td>
          <td style="padding: 12px; border-bottom: 1px solid #ddd; font-size: 13px; font-weight: 600;">${esc(f.sku) || '—'}</td>
        </tr>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #ddd; background: #f8fafc; font-size: 10px; color: #64748b; text-transform: uppercase;">Quantity</td>
          <td style="padding: 12px; border-bottom: 1px solid #ddd; font-size: 15px; font-weight: 700; text-align: center;">${esc(f.quantity) || '—'}</td>
        </tr>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #ddd; background: #f8fafc; font-size: 10px; color: #64748b; text-transform: uppercase;">Gross Weight</td>
          <td style="padding: 12px; border-bottom: 1px solid #ddd; font-size: 13px; font-weight: 600;">${esc(f.grossWeight) || '—'}</td>
        </tr>
        <tr>
          <td style="padding: 12px; background: #f8fafc; font-size: 10px; color: #64748b; text-transform: uppercase;">Carton Size</td>
          <td style="padding: 12px; font-size: 13px; font-weight: 600;">${esc(f.cartonSize) || '—'}</td>
        </tr>
      </table>
    </div>
    ${f.destWarehouse ? `<div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 8px; border-radius: 4px; margin-bottom: 8px;">
      <span style="font-size: 10px; color: #64748b;">目的仓库: </span><span style="font-weight: 600;">${esc(f.destWarehouse)}</span>
    </div>` : ''}
    <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 4px; padding: 8px; text-align: center; margin-top: 12px;">
      <span style="font-size: 10px; color: #dc2626;">⚠️ 此标签非 Amazon 官方 FBA 标签，仅供装箱信息整理参考</span>
    </div>
  `;
}

/** G. 托盘标签 pallet-label */
export function renderPalletExport(data: ExportLabelData): string {
  const { fd: f, vs, tz, te } = destructure(data);
  return `
    ${headerBlock('🏭 托盘标签', 'PALLET LABEL', { ...vs, headerStyle: { ...vs.headerStyle, bg: '#4338ca' }})}
    <div style="text-align: center; padding: 18px 0 14px 0;">
      <div style="font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">PALLET NO.</div>
      <div style="font-size: 36px; font-weight: 900; color: #4338ca; letter-spacing: 2px;">${esc(f.palletNo) || '—'}</div>
      ${f.totalPallets ? `<div style="font-size: 14px; color: #64748b;">共 ${esc(f.totalPallets)} 托盘</div>` : ''}
    </div>
    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 16px;">
      <div style="background: #eef2ff; border: 2px solid #c7d2fe; border-radius: 6px; padding: 16px 10px; text-align: center;">
        <div style="font-size: 10px; color: #64748b; text-transform: uppercase;">Cartons</div>
        <div style="font-size: 24px; font-weight: 800; color: #4338ca;">${esc(f.cartonsOnPallet) || '—'}</div>
      </div>
      <div style="background: #fef3c7; border: 2px solid #fde68a; border-radius: 6px; padding: 16px 10px; text-align: center;">
        <div style="font-size: 10px; color: #64748b; text-transform: uppercase;">Gross Weight</div>
        <div style="font-size: 24px; font-weight: 800; color: #d97706;">${esc(f.grossWeight) || '—'}</div>
      </div>
      <div style="background: #ecfdf5; border: 2px solid #a7f3d0; border-radius: 6px; padding: 16px 10px; text-align: center;">
        <div style="font-size: 10px; color: #64748b; text-transform: uppercase;">Destination</div>
        <div style="font-size: 16px; font-weight: 700; color: #059669;">${esc(f.destination) || '—'}</div>
      </div>
    </div>
    ${f.consignee ? `<div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 10px; margin-bottom: 12px;">
      <div style="font-size: 10px; color: #64748b; text-transform: uppercase; margin-bottom: 4px;">Consignee</div>
      <div style="font-size: 13px; color: #334155; white-space: pre-wrap;">${esc(f.consignee)}</div>
    </div>` : ''}
    ${f.handlingInstruction && f.handlingInstruction !== 'None' ? `<div style="background: linear-gradient(135deg, #dc2626, #b91c1c); color: #fff; text-align: center; padding: 10px; border-radius: 4px; font-size: 18px; font-weight: 900; letter-spacing: 1px;">
      ⚠️ ${esc(f.handlingInstruction)}
    </div>` : ''}
    ${f.remark ? `<div style="margin-top: 12px; padding: 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; font-size: 11px; color: #64748b;">Remark: ${esc(f.remark)}</div>` : ''}
  `;
}

/** H. 提示标签 handling-label */
export function renderHandlingExport(data: ExportLabelData): string {
  const { fd: f, vs, tz, te } = destructure(data);
  const icon = val(f.iconStyle)?.split(' ')[0] || '⚠️';
  const lt = val(f.labelType);
  const cn = f.chineseText || (lt.split(' ')[0] || '易碎');
  const en = f.englishText || (lt.includes(' ') ? lt.split(' ').slice(1).join(' ') : 'FRAGILE');

  // Special handling for yellow-warning style
  const isWarning = vs.id === 'yellow-warning';

  return `
    <div style="border: ${isWarning ? '4px dashed' : '3px solid'} ${isWarning ? '#d97706' : vs.borderStyle.color}; border-radius: ${vs.borderStyle.radius}; padding: 30px 20px; text-align: center; background: ${isWarning ? '#fffbeb' : 'transparent'}; margin: 16px 0;">
      <div style="font-size: 72px; margin-bottom: 12px; line-height: 1;">${icon}</div>
      <div style="font-size: 32px; font-weight: 900; color: ${isWarning ? '#92400e' : '#111'}; margin-bottom: 8px; line-height: 1.3;">${esc(cn)}</div>
      <div style="font-size: 24px; font-weight: 700; color: ${isWarning ? '#b45309' : vs.titleStyle.color}; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px;">${esc(en)}</div>
      ${f.remark ? `<div style="font-size: 12px; color: #64748b; padding-top: 12px; border-top: 1px solid #e2e8f0;">${esc(f.remark)}</div>` : ''}
    </div>
  `;
}

/** Route to the correct export renderer by type */
export function renderLabelExport(type: string, data: ExportLabelData): string {
  switch (type) {
    case 'shipping-mark': return renderShippingMarkExport(data);
    case 'consolidation-inbound-label': return renderConsolidationInboundExport(data);
    case 'consolidation-combined-label': return renderConsolidationCombinedExport(data);
    case 'warehouse-location-label': return renderWarehouseLocationExport(data);
    case 'parcel-info-label': return renderParcelInfoExport(data);
    case 'fba-carton-info-label': return renderFBACartonExport(data);
    case 'pallet-label': return renderPalletExport(data);
    case 'handling-label': return renderHandlingExport(data);
    default: return `<div style="text-align: center; padding: 40px; color: #999;">Unknown template type: ${esc(type)}</div>`;
  }
}

// ===================== INTERNAL HELPERS =====================

function destructure(data: ExportLabelData) {
  return { fd: data.formData, vs: data.style, tz: data.titleZh, te: data.titleEn };
}

function headerBlock(zh: string, en: string, vs: LabelVisualStyle): string {
  const hs = vs.headerStyle;
  if (hs.bg && hs.bg !== 'transparent') {
    return `<div style="background: ${hs.bg}; color: ${hs.color}; padding: ${hs.padding}; border-radius: 4px 4px 0 0; margin: -16px -16px 16px -16px;">
      <div style="font-size: ${vs.titleStyle.size}; font-weight: ${vs.titleStyle.weight}; color: ${hs.color}; letter-spacing: ${vs.titleStyle.letterSpacing};">${esc(zh)}</div>
      <div style="font-size: 10px; opacity: 0.8; margin-top: 2px;">${esc(en)}</div>
    </div>`;
  }
  return `<div style="padding-bottom: 12px; margin-bottom: 16px; border-bottom: ${hs.borderBottom};">
    <div style="font-size: ${vs.titleStyle.size}; font-weight: ${vs.titleStyle.weight}; color: ${hs.color}; letter-spacing: ${vs.titleStyle.letterSpacing};">${esc(zh)}</div>
    <div style="font-size: 10px; color: #64748b; margin-top: 2px;">${esc(en)}</div>
  </div>`;
}

function esc(s: string): string {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
