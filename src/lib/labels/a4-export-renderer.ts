/**
 * LabelA4ExportRenderer - Fixed A4 export for labels/marks
 * Builds complete A4 document with pure inline CSS, NO Tailwind.
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

export function buildLabelA4ExportHTML(data: LabelExportData): string {
  const pc = toHex(data.style.primaryColor);
  const bc = toHex(data.style.borderColor);
  const fd = data.formData;

  let body = '';

  // Header
  body += `<div style="border:2px solid ${bc}; padding:20px; margin-bottom:12px;">`;
  body += `<div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:1px solid ${bc}; padding-bottom:12px; margin-bottom:12px;">`;
  body += `<div>`;
  body += `<div style="font-size:20px; font-weight:bold; color:${pc}; margin-bottom:3px;">${esc(data.titleZh)}</div>`;
  body += `<div style="font-size:11px; color:#6b7280;">${esc(data.titleEn)}</div>`;
  body += `</div>`;
  body += `<div style="text-align:right; font-size:11px;">`;
  if (fd.destination || fd.destCountry) body += `<div style="margin-bottom:2px;">${esc(fd.destination || fd.destCountry)}</div>`;
  if (fd.cartonNo) body += `<div style="font-size:16px; font-weight:bold;">C/No. ${esc(fd.cartonNo)}</div>`;
  if (fd.combinedNo) body += `<div>合箱: ${esc(fd.combinedNo)}</div>`;
  body += `</div></div>`;

  // Type-specific content
  if (data.type === 'shipping-mark') {
    if (fd.mainMark) {
      body += `<div style="border:1px solid ${bc}; padding:10px; margin-bottom:8px;">`;
      body += `<div style="font-size:9px; color:#6b7280; margin-bottom:3px;">Main Mark</div>`;
      body += `<div style="font-size:13px; font-weight:bold; white-space:pre-wrap;">${esc(fd.mainMark)}</div></div>`;
    }
    if (fd.sideMark) {
      body += `<div style="border:1px solid ${bc}; padding:10px; margin-bottom:8px;">`;
      body += `<div style="font-size:9px; color:#6b7280; margin-bottom:3px;">Side Mark</div>`;
      body += `<div style="font-size:11px; white-space:pre-wrap;">${esc(fd.sideMark)}</div></div>`;
    }
    body += `<div style="display:grid; grid-template-columns:1fr 1fr; gap:6px 16px; font-size:11px;">`;
    if (fd.grossWeight) body += `<div><span style="color:#6b7280;">G.W.: </span><span style="font-weight:bold;">${esc(fd.grossWeight)}</span></div>`;
    if (fd.netWeight) body += `<div><span style="color:#6b7280;">N.W.: </span><span style="font-weight:bold;">${esc(fd.netWeight)}</span></div>`;
    if (fd.measurement) body += `<div><span style="color:#6b7280;">MEAS: </span><span style="font-weight:bold;">${esc(fd.measurement)}</span></div>`;
    if (fd.origin) body += `<div><span style="color:#6b7280;">Origin: </span><span style="font-weight:bold;">${esc(fd.origin)}</span></div>`;
    body += `</div>`;
  } else if (data.type === 'consolidation-inbound-label' || data.type === 'consolidation-combined-label') {
    body += `<div style="display:grid; grid-template-columns:1fr 1fr; gap:6px 16px; font-size:11px;">`;
    if (fd.customerAccount) body += `<div><span style="color:#6b7280;">账号: </span><span style="font-weight:bold;">${esc(fd.customerAccount)}</span></div>`;
    if (fd.customerNickname) body += `<div><span style="color:#6b7280;">昵称: </span>${esc(fd.customerNickname)}</div>`;
    if (fd.trackingNo) body += `<div><span style="color:#6b7280;">单号: </span><span style="font-weight:bold;">${esc(fd.trackingNo)}</span></div>`;
    if (fd.itemType) body += `<div><span style="color:#6b7280;">类型: </span>${esc(fd.itemType)}</div>`;
    if (fd.totalWeight) body += `<div><span style="color:#6b7280;">重量: </span>${esc(fd.totalWeight)}</div>`;
    if (fd.totalVolume) body += `<div><span style="color:#6b7280;">体积: </span>${esc(fd.totalVolume)}</div>`;
    body += `</div>`;
    if (fd.handlingNote) body += `<div style="background:#fef3c7; border:1px solid #fbbf24; padding:8px; margin-top:8px; font-size:10px; color:#92400e;">⚠️ ${esc(fd.handlingNote)}</div>`;
  } else if (data.type === 'warehouse-location-label') {
    body += `<div style="text-align:center; padding:30px 0;">`;
    body += `<div style="font-size:10px; color:#6b7280; margin-bottom:8px;">仓库: ${esc(fd.warehouseCode) || '—'}</div>`;
    body += `<div style="font-size:48px; font-weight:bold; color:${pc}; margin-bottom:8px;">${esc(fd.locationNo) || '—'}</div>`;
    body += `<div style="font-size:11px; color:#9ca3af;">${esc(fd.zone) || ''} ${esc(fd.rackNo) || ''} ${esc(fd.level) || ''}</div>`;
    body += `</div>`;
  } else if (data.type === 'parcel-info-label') {
    body += `<div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; font-size:11px; margin-bottom:8px;">`;
    body += `<div style="border:1px solid ${bc}; padding:8px;">`;
    body += `<div style="font-size:9px; color:#6b7280; margin-bottom:3px;">寄件人 Sender</div>`;
    body += `<div style="font-weight:bold; white-space:pre-wrap;">${esc(fd.senderName) || '—'}</div>`;
    if (fd.senderPhone) body += `<div style="color:#9ca3af; font-size:10px;">${esc(fd.senderPhone)}</div>`;
    body += `</div>`;
    body += `<div style="border:1px solid ${bc}; padding:8px;">`;
    body += `<div style="font-size:9px; color:#6b7280; margin-bottom:3px;">收件人 Receiver</div>`;
    body += `<div style="font-weight:bold; white-space:pre-wrap;">${esc(fd.receiverName) || '—'}</div>`;
    if (fd.receiverPhone) body += `<div style="color:#9ca3af; font-size:10px;">${esc(fd.receiverPhone)}</div>`;
    body += `</div></div>`;
    if (fd.receiverAddress) body += `<div style="font-size:11px; margin-bottom:6px;"><span style="color:#6b7280;">地址: </span>${esc(fd.receiverAddress)}</div>`;
    body += `<div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; font-size:11px;">`;
    if (fd.country) body += `<div><span style="color:#6b7280;">国家: </span>${esc(fd.country)}</div>`;
    if (fd.postalCode) body += `<div><span style="color:#6b7280;">邮编: </span>${esc(fd.postalCode)}</div>`;
    if (fd.refNo) body += `<div><span style="color:#6b7280;">单号: </span>${esc(fd.refNo)}</div>`;
    body += `</div>`;
  } else if (data.type === 'fba-carton-info-label') {
    body += `<div style="display:grid; grid-template-columns:1fr 1fr; gap:6px 16px; font-size:11px;">`;
    if (fd.shipmentId) body += `<div><span style="color:#6b7280;">Shipment ID: </span><span style="font-weight:bold;">${esc(fd.shipmentId)}</span></div>`;
    if (fd.boxNo) body += `<div><span style="color:#6b7280;">Box: </span><span style="font-weight:bold;">${esc(fd.boxNo)}</span></div>`;
    if (fd.sku) body += `<div><span style="color:#6b7280;">SKU: </span>${esc(fd.sku)}</div>`;
    if (fd.quantity) body += `<div><span style="color:#6b7280;">Qty: </span>${esc(fd.quantity)}</div>`;
    if (fd.grossWeight) body += `<div><span style="color:#6b7280;">GW: </span>${esc(fd.grossWeight)}</div>`;
    if (fd.cartonSize) body += `<div><span style="color:#6b7280;">Size: </span>${esc(fd.cartonSize)}</div>`;
    body += `</div>`;
  } else if (data.type === 'pallet-label') {
    body += `<div style="display:grid; grid-template-columns:1fr 1fr; gap:6px 16px; font-size:11px;">`;
    if (fd.palletNo) body += `<div><span style="color:#6b7280;">Pallet: </span><span style="font-weight:bold;">${esc(fd.palletNo)}</span></div>`;
    if (fd.totalPallets) body += `<div><span style="color:#6b7280;">Total: </span>${esc(fd.totalPallets)}</div>`;
    if (fd.cartonsOnPallet) body += `<div><span style="color:#6b7280;">Cartons: </span>${esc(fd.cartonsOnPallet)}</div>`;
    if (fd.grossWeight) body += `<div><span style="color:#6b7280;">GW: </span>${esc(fd.grossWeight)}</div>`;
    if (fd.destination) body += `<div><span style="color:#6b7280;">Dest: </span>${esc(fd.destination)}</div>`;
    if (fd.handlingInstruction && fd.handlingInstruction !== 'None') body += `<div style="color:#dc2626; font-weight:bold;">⚠️ ${esc(fd.handlingInstruction)}</div>`;
    body += `</div>`;
    if (fd.consignee) body += `<div style="font-size:11px; margin-top:6px;"><span style="color:#6b7280;">Consignee: </span>${esc(fd.consignee)}</div>`;
  } else if (data.type === 'handling-label') {
    body += `<div style="text-align:center; padding:40px 0;">`;
    const icon = val(fd.iconStyle)?.split(' ')[0] || '⚠️';
    body += `<div style="font-size:72px; margin-bottom:12px;">${icon}</div>`;
    if (fd.chineseText) body += `<div style="font-size:24px; font-weight:bold; margin-bottom:6px;">${esc(fd.chineseText)}</div>`;
    if (fd.englishText) body += `<div style="font-size:20px; font-weight:bold; color:${pc};">${esc(fd.englishText)}</div>`;
    if (!fd.chineseText && !fd.englishText) {
      const lt = val(fd.labelType);
      const cn = lt.split(' ')[0] || '易碎';
      const en = lt.includes(' ') ? lt.split(' ').slice(1).join(' ') : 'FRAGILE';
      body += `<div style="font-size:24px; font-weight:bold; margin-bottom:6px;">${cn}</div>`;
      body += `<div style="font-size:20px; font-weight:bold; color:${pc};">${en}</div>`;
    }
    body += `</div>`;
  } else {
    // Generic: render all fields in a clean layout
    body += `<div style="display:grid; grid-template-columns:1fr 1fr; gap:6px 16px; font-size:11px;">`;
    if (data.type === 'shipping-mark' || true) {
      // Show all non-empty fields
      const skipKeys = ['barcodeSource', 'barcodeValue', 'logoUrl'];
      for (const [k, v] of Object.entries(fd)) {
        if (skipKeys.includes(k)) continue;
        if (!v && v !== 0) continue;
        body += `<div><span style="color:#6b7280;">${esc(k)}: </span><span style="font-weight:bold;">${esc(String(v))}</span></div>`;
      }
    }
    body += `</div>`;
  }

  // Barcode/QR placeholder
  if (data.showBarcode || data.showQrCode) {
    const barcodeVal = fd.barcodeSource && fd.barcodeSource !== 'custom' ? (fd[fd.barcodeSource] || '') : (fd.barcodeValue || '');
    body += `<div style="margin-top:12px; padding-top:8px; border-top:1px solid ${bc}; display:flex; justify-content:space-between; align-items:end;">`;
    body += `<div style="font-size:9px; color:#9ca3af;">${esc(barcodeVal)}</div>`;
    body += `<div style="display:flex; gap:12px;">`;
    if (data.showBarcode) body += `<div style="text-align:center;"><div style="width:64px; height:32px; border:1px solid #e5e7eb; display:flex; align-items:center; justify-content:center; font-size:8px; color:#9ca3af;">CODE128</div></div>`;
    if (data.showQrCode) body += `<div style="text-align:center;"><div style="width:48px; height:48px; border:1px solid #e5e7eb; display:flex; align-items:center; justify-content:center; font-size:8px; color:#9ca3af;">QR</div></div>`;
    body += `</div></div>`;
  }

  // Footer
  if (!data.canRemoveBranding) {
    body += `<div style="margin-top:12px; padding-top:6px; border-top:1px solid ${bc}; text-align:center; font-size:8px; color:#d1d5db;">由海外百宝箱生成，仅供参考 | kjbxb.com</div>`;
  }
  body += `</div>`; // close outer border

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: 794px; min-width: 794px; max-width: 794px; background: #ffffff; color: #111827; }
body { font-family: "SimSun", "Noto Serif SC", "Songti SC", "Microsoft YaHei", sans-serif; font-size: 12px; line-height: 1.5; padding: 32px 36px; }
.a4-page { width: 794px; min-height: 1123px; background: #ffffff; }
@media print { @page { margin: 0; size: A4; } }
</style>
</head>
<body>
<div class="a4-page">${body}</div>
</body>
</html>`;
}

export const A4_WIDTH = 794;
export const A4_HEIGHT = 1123;
export const A4_EXPORT_SCALE = 2;
