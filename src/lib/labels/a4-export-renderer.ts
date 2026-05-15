/**
 * LabelA4ExportRenderer v1.12.8 (Layout Fixed)
 * Builds complete A4 document with pure inline CSS, NO Tailwind.
 * Same padding/margin standards as document renderer:
 * - Page padding: 56px 64px 44px 64px
 * - Content width: 666px
 * - All content inside .a4-inner
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

export function buildLabelA4ExportHTML(data: LabelExportData): string {
  const pc = toHex(data.style.primaryColor);
  const bc = toHex(data.style.borderColor);
  const fd = data.formData;

  let inner = '';

  // ===================== HEADER =====================
  inner += `<div style="padding-bottom:14px; margin-bottom:20px; border-bottom:2px solid ${bc};">`;
  inner += `<div style="display:flex; justify-content:space-between; align-items:flex-start;">`;
  inner += `<div style="flex:1;">`;
  inner += `<div style="font-size:22px; font-weight:bold; color:${pc}; margin-bottom:3px;">${esc(data.titleZh)}</div>`;
  inner += `<div style="font-size:11px; color:#64748b;">${esc(data.titleEn)}</div>`;
  inner += `</div>`;
  inner += `<div style="text-align:right; flex:0 0 auto; min-width:160px;">`;
  if (fd.destination || fd.destCountry) inner += `<div style="font-size:11px; color:#334155; margin-bottom:2px;">${esc(fd.destination || fd.destCountry)}</div>`;
  if (fd.cartonNo) inner += `<div style="font-size:18px; font-weight:bold; color:#1e293b;">C/No. ${esc(fd.cartonNo)}</div>`;
  if (fd.combinedNo) inner += `<div style="font-size:12px; color:#334155;">合箱: ${esc(fd.combinedNo)}</div>`;
  inner += `</div></div></div>`;

  // ===================== TYPE-SPECIFIC CONTENT =====================
  if (data.type === 'shipping-mark') {
    if (fd.mainMark) {
      inner += `<div style="margin-bottom:16px;">`;
      inner += `<div style="font-size:12px; font-weight:bold; color:${pc}; margin-bottom:6px; padding-bottom:4px; border-bottom:1px solid #e2e8f0;">Main Mark</div>`;
      inner += `<div style="font-size:14px; font-weight:bold; color:#1e293b; white-space:pre-wrap; line-height:1.5; padding:8px 0;">${esc(fd.mainMark)}</div>`;
      inner += `</div>`;
    }
    if (fd.sideMark) {
      inner += `<div style="margin-bottom:16px;">`;
      inner += `<div style="font-size:12px; font-weight:bold; color:${pc}; margin-bottom:6px; padding-bottom:4px; border-bottom:1px solid #e2e8f0;">Side Mark</div>`;
      inner += `<div style="font-size:12px; color:#334155; white-space:pre-wrap; line-height:1.5; padding:8px 0;">${esc(fd.sideMark)}</div>`;
      inner += `</div>`;
    }
    inner += `<div style="display:grid; grid-template-columns:1fr 1fr; gap:8px 24px; font-size:12px; margin-bottom:18px;">`;
    if (fd.grossWeight) inner += `<div><span style="color:#64748b;">G.W.:</span><br/><span style="font-weight:bold; color:#1e293b;">${esc(fd.grossWeight)}</span></div>`;
    if (fd.netWeight) inner += `<div><span style="color:#64748b;">N.W.:</span><br/><span style="font-weight:bold; color:#1e293b;">${esc(fd.netWeight)}</span></div>`;
    if (fd.measurement) inner += `<div><span style="color:#64748b;">MEAS:</span><br/><span style="font-weight:bold; color:#1e293b;">${esc(fd.measurement)}</span></div>`;
    if (fd.origin) inner += `<div><span style="color:#64748b;">Origin:</span><br/><span style="font-weight:bold; color:#1e293b;">${esc(fd.origin)}</span></div>`;
    inner += `</div>`;
  } else if (data.type === 'consolidation-inbound-label' || data.type === 'consolidation-combined-label') {
    inner += `<div style="display:grid; grid-template-columns:1fr 1fr; gap:8px 24px; font-size:12px; margin-bottom:18px;">`;
    if (fd.customerAccount) inner += `<div><span style="color:#64748b;">账号:</span><br/><span style="font-weight:bold; color:#1e293b;">${esc(fd.customerAccount)}</span></div>`;
    if (fd.customerNickname) inner += `<div><span style="color:#64748b;">昵称:</span><br/><span style="color:#334155;">${esc(fd.customerNickname)}</span></div>`;
    if (fd.trackingNo) inner += `<div><span style="color:#64748b;">单号:</span><br/><span style="font-weight:bold; color:#1e293b;">${esc(fd.trackingNo)}</span></div>`;
    if (fd.itemType) inner += `<div><span style="color:#64748b;">类型:</span><br/><span style="color:#334155;">${esc(fd.itemType)}</span></div>`;
    if (fd.totalWeight) inner += `<div><span style="color:#64748b;">重量:</span><br/><span style="color:#334155;">${esc(fd.totalWeight)}</span></div>`;
    if (fd.totalVolume) inner += `<div><span style="color:#64748b;">体积:</span><br/><span style="color:#334155;">${esc(fd.totalVolume)}</span></div>`;
    inner += `</div>`;
    if (fd.handlingNote) inner += `<div style="background:#fffbeb; border:1px solid #fbbf24; padding:10px; margin-bottom:18px; font-size:11px; color:#92400e; border-radius:4px;">⚠️ ${esc(fd.handlingNote)}</div>`;
  } else if (data.type === 'warehouse-location-label') {
    inner += `<div style="text-align:center; padding:40px 0 30px 0;">`;
    inner += `<div style="font-size:11px; color:#64748b; margin-bottom:12px;">仓库: ${esc(fd.warehouseCode) || '—'}</div>`;
    inner += `<div style="font-size:56px; font-weight:bold; color:${pc}; margin-bottom:12px; line-height:1.1;">${esc(fd.locationNo) || '—'}</div>`;
    inner += `<div style="font-size:13px; color:#94a3b8;">${esc(fd.zone) || ''} ${esc(fd.rackNo) || ''} ${esc(fd.level) || ''}</div>`;
    inner += `</div>`;
  } else if (data.type === 'parcel-info-label') {
    inner += `<div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:16px;">`;
    inner += `<div style="border:1px solid ${bc}; padding:10px;">`;
    inner += `<div style="font-size:10px; color:#64748b; margin-bottom:4px;">寄件人 Sender</div>`;
    inner += `<div style="font-weight:bold; color:#1e293b; font-size:12px; white-space:pre-wrap;">${esc(fd.senderName) || '—'}</div>`;
    if (fd.senderPhone) inner += `<div style="color:#64748b; font-size:10px; margin-top:2px;">${esc(fd.senderPhone)}</div>`;
    inner += `</div>`;
    inner += `<div style="border:1px solid ${bc}; padding:10px;">`;
    inner += `<div style="font-size:10px; color:#64748b; margin-bottom:4px;">收件人 Receiver</div>`;
    inner += `<div style="font-weight:bold; color:#1e293b; font-size:12px; white-space:pre-wrap;">${esc(fd.receiverName) || '—'}</div>`;
    if (fd.receiverPhone) inner += `<div style="color:#64748b; font-size:10px; margin-top:2px;">${esc(fd.receiverPhone)}</div>`;
    inner += `</div></div>`;
    if (fd.receiverAddress) inner += `<div style="margin-bottom:12px; font-size:12px; color:#334155;"><span style="color:#64748b;">地址:</span> ${esc(fd.receiverAddress)}</div>`;
    inner += `<div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px; font-size:12px; margin-bottom:18px;">`;
    if (fd.country) inner += `<div><span style="color:#64748b;">国家:</span><br/><span style="color:#334155;">${esc(fd.country)}</span></div>`;
    if (fd.postalCode) inner += `<div><span style="color:#64748b;">邮编:</span><br/><span style="color:#334155;">${esc(fd.postalCode)}</span></div>`;
    if (fd.refNo) inner += `<div><span style="color:#64748b;">单号:</span><br/><span style="color:#334155;">${esc(fd.refNo)}</span></div>`;
    inner += `</div>`;
  } else if (data.type === 'fba-carton-info-label') {
    inner += `<div style="display:grid; grid-template-columns:1fr 1fr; gap:8px 24px; font-size:12px; margin-bottom:18px;">`;
    if (fd.shipmentId) inner += `<div><span style="color:#64748b;">Shipment ID:</span><br/><span style="font-weight:bold; color:#1e293b;">${esc(fd.shipmentId)}</span></div>`;
    if (fd.boxNo) inner += `<div><span style="color:#64748b;">Box:</span><br/><span style="font-weight:bold; color:#1e293b;">${esc(fd.boxNo)}</span></div>`;
    if (fd.sku) inner += `<div><span style="color:#64748b;">SKU:</span><br/><span style="color:#334155;">${esc(fd.sku)}</span></div>`;
    if (fd.quantity) inner += `<div><span style="color:#64748b;">Qty:</span><br/><span style="color:#334155;">${esc(fd.quantity)}</span></div>`;
    if (fd.grossWeight) inner += `<div><span style="color:#64748b;">GW:</span><br/><span style="color:#334155;">${esc(fd.grossWeight)}</span></div>`;
    if (fd.cartonSize) inner += `<div><span style="color:#64748b;">Size:</span><br/><span style="color:#334155;">${esc(fd.cartonSize)}</span></div>`;
    inner += `</div>`;
  } else if (data.type === 'pallet-label') {
    inner += `<div style="display:grid; grid-template-columns:1fr 1fr; gap:8px 24px; font-size:12px; margin-bottom:18px;">`;
    if (fd.palletNo) inner += `<div><span style="color:#64748b;">Pallet:</span><br/><span style="font-weight:bold; color:#1e293b;">${esc(fd.palletNo)}</span></div>`;
    if (fd.totalPallets) inner += `<div><span style="color:#64748b;">Total:</span><br/><span style="color:#334155;">${esc(fd.totalPallets)}</span></div>`;
    if (fd.cartonsOnPallet) inner += `<div><span style="color:#64748b;">Cartons:</span><br/><span style="color:#334155;">${esc(fd.cartonsOnPallet)}</span></div>`;
    if (fd.grossWeight) inner += `<div><span style="color:#64748b;">GW:</span><br/><span style="color:#334155;">${esc(fd.grossWeight)}</span></div>`;
    if (fd.destination) inner += `<div><span style="color:#64748b;">Dest:</span><br/><span style="color:#334155;">${esc(fd.destination)}</span></div>`;
    if (fd.handlingInstruction && fd.handlingInstruction !== 'None') inner += `<div style="color:#dc2626; font-weight:bold; grid-column:span 2;">⚠️ ${esc(fd.handlingInstruction)}</div>`;
    inner += `</div>`;
    if (fd.consignee) inner += `<div style="margin-bottom:18px; font-size:12px; color:#334155;"><span style="color:#64748b;">Consignee:</span> ${esc(fd.consignee)}</div>`;
  } else if (data.type === 'handling-label') {
    inner += `<div style="text-align:center; padding:50px 0 40px 0;">`;
    const icon = val(fd.iconStyle)?.split(' ')[0] || '⚠️';
    inner += `<div style="font-size:80px; margin-bottom:16px;">${icon}</div>`;
    if (fd.chineseText) inner += `<div style="font-size:28px; font-weight:bold; color:#1e293b; margin-bottom:8px;">${esc(fd.chineseText)}</div>`;
    if (fd.englishText) inner += `<div style="font-size:22px; font-weight:bold; color:${pc};">${esc(fd.englishText)}</div>`;
    if (!fd.chineseText && !fd.englishText) {
      const lt = val(fd.labelType);
      const cn = lt.split(' ')[0] || '易碎';
      const en = lt.includes(' ') ? lt.split(' ').slice(1).join(' ') : 'FRAGILE';
      inner += `<div style="font-size:28px; font-weight:bold; color:#1e293b; margin-bottom:8px;">${cn}</div>`;
      inner += `<div style="font-size:22px; font-weight:bold; color:${pc};">${en}</div>`;
    }
    inner += `</div>`;
  } else {
    // Generic fallback
    inner += `<div style="display:grid; grid-template-columns:1fr 1fr; gap:8px 24px; font-size:12px;">`;
    const skipKeys = ['barcodeSource', 'barcodeValue', 'logoUrl'];
    for (const [k, v] of Object.entries(fd)) {
      if (skipKeys.includes(k)) continue;
      if (!v && v !== 0) continue;
      inner += `<div><span style="color:#64748b;">${esc(k)}:</span><br/><span style="font-weight:bold; color:#1e293b;">${esc(String(v))}</span></div>`;
    }
    inner += `</div>`;
  }

  // ===================== BARCODE / QR =====================
  if (data.showBarcode || data.showQrCode) {
    const barcodeVal = fd.barcodeSource && fd.barcodeSource !== 'custom' ? (fd[fd.barcodeSource] || '') : (fd.barcodeValue || '');
    inner += `<div style="margin-top:24px; padding-top:12px; border-top:1px solid ${bc}; display:flex; justify-content:space-between; align-items:end;">`;
    inner += `<div style="font-size:10px; color:#94a3b8;">${esc(barcodeVal)}</div>`;
    inner += `<div style="display:flex; gap:16px;">`;
    if (data.showBarcode) inner += `<div style="text-align:center;"><div style="width:80px; height:40px; border:1px solid #e2e8f0; display:flex; align-items:center; justify-content:center; font-size:9px; color:#94a3b8; background:#f8fafc;">CODE128</div></div>`;
    if (data.showQrCode) inner += `<div style="text-align:center;"><div style="width:56px; height:56px; border:1px solid #e2e8f0; display:flex; align-items:center; justify-content:center; font-size:9px; color:#94a3b8; background:#f8fafc;">QR</div></div>`;
    inner += `</div></div>`;
  }

  // ===================== FOOTER =====================
  if (!data.canRemoveBranding) {
    inner += `<div style="margin-top:16px; padding-top:8px; border-top:1px solid #e2e8f0; text-align:center; font-size:8px; color:#94a3b8;">由海外百宝箱生成，仅供参考 | kjbxb.com</div>`;
  }

  // Wrap in A4 page
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
