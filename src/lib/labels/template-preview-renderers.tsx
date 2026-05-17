/**
 * Template Preview Renderers for Label Maker — v1.20.4
 * 8 template-specific React JSX renderers for the preview panel.
 */

import { LabelStyle } from "./label-types";
import { buildVisualStyle, LabelVisualStyle } from "./template-renderers";

function val(v: any): string {
  return v != null && v !== '' ? String(v) : '';
}

// ===================== HEADER COMPONENT =====================

function HeaderBar({ zh, en, vs }: { zh: string; en: string; vs: LabelVisualStyle }) {
  const hs = vs.headerStyle;
  if (hs.bg && hs.bg !== 'transparent') {
    return (
      <div style={{ background: hs.bg, color: hs.color, padding: hs.padding, borderRadius: '6px 6px 0 0', margin: '-12px -12px 12px -12px' }}>
        <div style={{ fontSize: vs.titleStyle.size, fontWeight: vs.titleStyle.weight as any, color: hs.color, letterSpacing: vs.titleStyle.letterSpacing }}>{zh}</div>
        <div style={{ fontSize: '10px', opacity: 0.8, marginTop: '2px' }}>{en}</div>
      </div>
    );
  }
  return (
    <div style={{ paddingBottom: '10px', marginBottom: '12px', borderBottom: hs.borderBottom }}>
      <div style={{ fontSize: vs.titleStyle.size, fontWeight: vs.titleStyle.weight as any, color: hs.color, letterSpacing: vs.titleStyle.letterSpacing }}>{zh}</div>
      <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>{en}</div>
    </div>
  );
}

// ===================== FIELD ROW =====================

function FieldRow({ label, value, vs }: { label: string; value: string; vs: LabelVisualStyle }) {
  if (!value) return null;
  return (
    <div style={{ padding: '6px 0', borderBottom: '1px solid #f0f0f0' }}>
      <div style={{ fontSize: vs.mutedStyle.size, color: vs.mutedStyle.color, textTransform: vs.mutedStyle.transform as any, marginBottom: '2px' }}>{label}</div>
      <div style={{ fontSize: vs.emphasisStyle.size, fontWeight: vs.emphasisStyle.weight as any, color: vs.emphasisStyle.color, background: vs.emphasisStyle.bg, padding: vs.emphasisStyle.padding, borderRadius: '3px' }}>{value}</div>
    </div>
  );
}

// ===================== A. SHIPPING MARK =====================

function ShippingMarkPreview({ fd, vs }: { fd: Record<string, any>; vs: LabelVisualStyle }) {
  return (
    <>
      <HeaderBar zh="通用外箱唛头" en="SHIPPING MARK" vs={vs} />
      {fd.mainMark && (
        <div style={{ border: `${vs.borderStyle.width} ${vs.borderStyle.style} ${vs.borderStyle.color}`, borderRadius: vs.borderStyle.radius, padding: '14px', marginBottom: '14px' }}>
          <div style={{ fontSize: vs.mutedStyle.size, color: vs.mutedStyle.color, textTransform: vs.mutedStyle.transform as any, marginBottom: '4px' }}>MAIN MARK / 主唛</div>
          <div style={{ fontSize: '20px', fontWeight: 900, color: '#111', lineHeight: 1.4, whiteSpace: 'pre-wrap' }}>{val(fd.mainMark)}</div>
        </div>
      )}
      {fd.sideMark && (
        <div style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '14px', borderRadius: vs.borderStyle.radius }}>
          <div style={{ fontSize: vs.mutedStyle.size, color: vs.mutedStyle.color, textTransform: vs.mutedStyle.transform as any, marginBottom: '4px' }}>SIDE MARK / 侧唛</div>
          <div style={{ fontSize: '12px', color: '#333', whiteSpace: 'pre-wrap' }}>{val(fd.sideMark)}</div>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px', marginBottom: '14px', borderTop: '2px solid #333', paddingTop: '10px' }}>
        <FieldRow label="目的港 / Destination" value={fd.destination || ''} vs={vs} />
        <FieldRow label="箱号 / C/No." value={fd.cartonNo ? `C/No. ${val(fd.cartonNo)}` : ''} vs={vs} />
        <FieldRow label="毛重 / G.W." value={fd.grossWeight || ''} vs={vs} />
        <FieldRow label="净重 / N.W." value={fd.netWeight || ''} vs={vs} />
        <FieldRow label="尺寸 / MEAS." value={fd.measurement || ''} vs={vs} />
        <FieldRow label="原产地 / Origin" value={fd.origin || ''} vs={vs} />
      </div>
      {fd.remark && (
        <div style={{ borderTop: '1px solid #ccc', paddingTop: '8px', fontSize: '11px', color: '#666' }}>备注: {val(fd.remark)}</div>
      )}
    </>
  );
}

// ===================== B. CONSOLIDATION INBOUND =====================

function ConsolInboundPreview({ fd, vs }: { fd: Record<string, any>; vs: LabelVisualStyle }) {
  return (
    <>
      <HeaderBar zh="📥 集运入库标签" en="INBOUND LABEL" vs={{ ...vs, headerStyle: { ...vs.headerStyle, bg: '#1e40af' }}} />
      <div style={{ textAlign: 'center', padding: '16px 0 12px 0' }}>
        <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>集运账号 / ACCOUNT</div>
        <div style={{ fontSize: '26px', fontWeight: 900, color: '#1e40af', letterSpacing: '1px' }}>{val(fd.customerAccount) || '—'}</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '4px', padding: '10px', textAlign: 'center' }}>
          <div style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase' }}>快递单号</div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e40af', wordBreak: 'break-all' }}>{val(fd.trackingNo) || '—'}</div>
        </div>
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '4px', padding: '10px', textAlign: 'center' }}>
          <div style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase' }}>客户昵称</div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#16a34a' }}>{val(fd.customerNickname) || '—'}</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
        {fd.itemType && (
          <div style={{ textAlign: 'center', padding: '6px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px', flex: 1 }}>
            <div style={{ fontSize: '9px', color: '#64748b' }}>物品类型</div>
            <div style={{ fontSize: '12px', fontWeight: 600 }}>{val(fd.itemType)}</div>
          </div>
        )}
        {fd.arrivalDate && (
          <div style={{ textAlign: 'center', padding: '6px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px', flex: 1 }}>
            <div style={{ fontSize: '9px', color: '#64748b' }}>到仓日期</div>
            <div style={{ fontSize: '12px', fontWeight: 600 }}>{val(fd.arrivalDate)}</div>
          </div>
        )}
        {fd.packageCount && (
          <div style={{ textAlign: 'center', padding: '6px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px', flex: 1 }}>
            <div style={{ fontSize: '9px', color: '#64748b' }}>包裹数</div>
            <div style={{ fontSize: '12px', fontWeight: 600 }}>{val(fd.packageCount)}</div>
          </div>
        )}
      </div>
      {fd.handlingNote && (
        <div style={{ background: '#fffbeb', border: '1px dashed #f59e0b', padding: '8px', borderRadius: '4px', textAlign: 'center' }}>
          <span style={{ fontSize: '11px', color: '#92400e' }}>⚠️ 收货核对: {val(fd.handlingNote)}</span>
        </div>
      )}
    </>
  );
}

// ===================== C. CONSOLIDATION COMBINED =====================

function ConsolCombinedPreview({ fd, vs }: { fd: Record<string, any>; vs: LabelVisualStyle }) {
  return (
    <>
      <HeaderBar zh="📫 合箱标签" en="COMBINED PARCEL LABEL" vs={{ ...vs, headerStyle: { ...vs.headerStyle, bg: '#7c3aed' }}} />
      <div style={{ textAlign: 'center', padding: '16px 0 12px 0' }}>
        <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>合箱编号 / COMBINED NO.</div>
        <div style={{ fontSize: '28px', fontWeight: 900, color: '#7c3aed', letterSpacing: '1px' }}>{val(fd.combinedNo) || '—'}</div>
        <div style={{ fontSize: '11px', color: '#64748b' }}>客户 ID: {val(fd.customerId) || '—'}</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
        {fd.originalPackages && (
          <div style={{ background: '#f5f3ff', border: '1px solid #c4b5fd', borderRadius: '6px', padding: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase' }}>原包裹数</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#6d28d9' }}>{val(fd.originalPackages)}</div>
          </div>
        )}
        {fd.totalWeight && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase' }}>总重量</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#16a34a' }}>{val(fd.totalWeight)}</div>
          </div>
        )}
        {fd.destCountry && (
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase' }}>目的地</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#2563eb' }}>{val(fd.destCountry)}</div>
          </div>
        )}
        {fd.combinedBoxNo && (
          <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '6px', padding: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase' }}>合箱后箱号</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#d97706' }}>{val(fd.combinedBoxNo)}</div>
          </div>
        )}
      </div>
      <div style={{ background: 'linear-gradient(90deg, #059669, #10b981)', color: '#fff', textAlign: 'center', padding: '6px', borderRadius: '4px', fontSize: '13px', fontWeight: 700, letterSpacing: '1px', marginBottom: '10px' }}>
        ✅ 已合箱 / COMBINED — 待出库
      </div>
      {(fd.operator || fd.date) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
          {fd.operator ? <span>操作员: {val(fd.operator)}</span> : <span></span>}
          {fd.date ? <span>日期: {val(fd.date)}</span> : null}
        </div>
      )}
    </>
  );
}

// ===================== D. WAREHOUSE LOCATION =====================

function WarehouseLocationPreview({ fd, vs }: { fd: Record<string, any>; vs: LabelVisualStyle }) {
  return (
    <>
      <HeaderBar zh="🏪 仓库库位" en="WAREHOUSE LOCATION" vs={{ ...vs, headerStyle: { ...vs.headerStyle, bg: '#374151' }}} />
      <div style={{ textAlign: 'center', padding: '24px 0' }}>
        <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '6px' }}>仓库 / WAREHOUSE</div>
        <div style={{ fontSize: '16px', fontWeight: 700, color: '#374151', marginBottom: '16px' }}>{val(fd.warehouseCode) || '—'}</div>
        <div style={{ fontSize: '56px', fontWeight: 900, color: '#111', lineHeight: 1.1, letterSpacing: '4px', marginBottom: '14px', padding: '16px', border: '3px solid #111' }}>
          {val(fd.locationNo) || '—'}
        </div>
        <div style={{ display: 'inline-flex', gap: '14px', fontSize: '13px', color: '#4b5563', flexWrap: 'wrap', justifyContent: 'center' }}>
          {fd.zone && <span><span style={{ color: '#6b7280' }}>区域</span> {val(fd.zone)}</span>}
          {fd.rackNo && <span><span style={{ color: '#6b7280' }}>货架</span> {val(fd.rackNo)}</span>}
          {fd.level && <span><span style={{ color: '#6b7280' }}>层号</span> {val(fd.level)}</span>}
        </div>
      </div>
      {fd.labelDesc && (
        <div style={{ marginTop: '16px', padding: '6px', background: '#f3f4f6', borderRadius: '4px', fontSize: '10px', color: '#4b5563' }}>{val(fd.labelDesc)}</div>
      )}
    </>
  );
}

// ===================== E. PARCEL INFO =====================

function ParcelInfoPreview({ fd, vs }: { fd: Record<string, any>; vs: LabelVisualStyle }) {
  return (
    <>
      <HeaderBar zh="📮 包裹信息面单" en="PARCEL INFO LABEL" vs={{ ...vs, headerStyle: { ...vs.headerStyle, bg: '#0e7490' }}} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0', marginBottom: '12px' }}>
        <div style={{ border: '1px solid #0e7490', padding: '12px', borderRight: 'none', borderRadius: '6px 0 0 6px' }}>
          <div style={{ fontSize: '9px', color: '#0e7490', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px', fontWeight: 700 }}>FROM / 寄件人</div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#111', whiteSpace: 'pre-wrap', marginBottom: '4px' }}>{val(fd.senderName) || '—'}</div>
          {fd.senderPhone && <div style={{ fontSize: '10px', color: '#475569' }}>☎ {val(fd.senderPhone)}</div>}
        </div>
        <div style={{ border: '1px solid #0e7490', padding: '12px', borderRadius: '0 6px 6px 0' }}>
          <div style={{ fontSize: '9px', color: '#0e7490', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px', fontWeight: 700 }}>TO / 收件人</div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#111', whiteSpace: 'pre-wrap', marginBottom: '4px' }}>{val(fd.receiverName) || '—'}</div>
          {fd.receiverPhone && <div style={{ fontSize: '10px', color: '#475569' }}>☎ {val(fd.receiverPhone)}</div>}
        </div>
      </div>
      {fd.receiverAddress && (
        <div style={{ background: '#ecfeff', border: '1px solid #a5f3fc', borderRadius: '4px', padding: '8px', marginBottom: '12px' }}>
          <div style={{ fontSize: '9px', color: '#0e7490', textTransform: 'uppercase', marginBottom: '4px' }}>地址 / ADDRESS</div>
          <div style={{ fontSize: '12px', color: '#164e63', whiteSpace: 'pre-wrap' }}>{val(fd.receiverAddress)}</div>
        </div>
      )}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
        {fd.country && (
          <div style={{ flex: 1, textAlign: 'center', padding: '6px', background: '#f0fdfa', border: '1px solid #99f6e4', borderRadius: '4px' }}>
            <div style={{ fontSize: '9px', color: '#64748b' }}>国家</div>
            <div style={{ fontSize: '13px', fontWeight: 600 }}>{val(fd.country)}</div>
          </div>
        )}
        {fd.postalCode && (
          <div style={{ flex: 1, textAlign: 'center', padding: '6px', background: '#f0fdfa', border: '1px solid #99f6e4', borderRadius: '4px' }}>
            <div style={{ fontSize: '9px', color: '#64748b' }}>邮编</div>
            <div style={{ fontSize: '13px', fontWeight: 600 }}>{val(fd.postalCode)}</div>
          </div>
        )}
        {fd.refNo && (
          <div style={{ flex: 1, textAlign: 'center', padding: '6px', background: '#f0fdfa', border: '1px solid #99f6e4', borderRadius: '4px' }}>
            <div style={{ fontSize: '9px', color: '#64748b' }}>单号</div>
            <div style={{ fontSize: '13px', fontWeight: 600 }}>{val(fd.refNo)}</div>
          </div>
        )}
      </div>
      {(fd.declaredValue || fd.quantity || fd.itemDesc) && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
          {fd.quantity && (
            <div style={{ flex: 1, textAlign: 'center', padding: '6px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
              <div style={{ fontSize: '9px', color: '#64748b' }}>数量</div>
              <div style={{ fontSize: '13px', fontWeight: 600 }}>{val(fd.quantity)}</div>
            </div>
          )}
          {fd.declaredValue && (
            <div style={{ flex: 1, textAlign: 'center', padding: '6px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
              <div style={{ fontSize: '9px', color: '#64748b' }}>申报价值</div>
              <div style={{ fontSize: '13px', fontWeight: 600 }}>{val(fd.declaredValue)}</div>
            </div>
          )}
          {fd.itemDesc && (
            <div style={{ flex: 1, textAlign: 'center', padding: '6px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
              <div style={{ fontSize: '9px', color: '#64748b' }}>物品</div>
              <div style={{ fontSize: '11px', fontWeight: 600 }}>{val(fd.itemDesc)}</div>
            </div>
          )}
        </div>
      )}
      <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '4px', padding: '6px', textAlign: 'center' }}>
        <span style={{ fontSize: '9px', color: '#dc2626' }}>⚠️ 此标签非官方快递运单，仅用于信息整理或贴箱参考</span>
      </div>
    </>
  );
}

// ===================== F. FBA CARTON =====================

function FBACartonPreview({ fd, vs }: { fd: Record<string, any>; vs: LabelVisualStyle }) {
  const rows = [
    { label: 'Shipment ID', value: fd.shipmentId, bold: true },
    { label: 'Box No.', value: fd.boxNo, big: true },
    { label: 'SKU / 产品名', value: fd.sku },
    { label: 'Quantity', value: fd.quantity, bold: true },
    { label: 'Gross Weight', value: fd.grossWeight },
    { label: 'Carton Size', value: fd.cartonSize },
  ];
  return (
    <>
      <HeaderBar zh="🏗️ FBA Reference Label" en="装箱信息参考贴（非 Amazon 官方）" vs={{ ...vs, headerStyle: { ...vs.headerStyle, bg: '#1e293b' }}} />
      <div style={{ border: '2px solid #333', borderRadius: '0', margin: '12px 0', overflow: 'hidden' }}>
        {rows.map((row, i) => (
          <div key={i} style={{ display: 'flex', borderBottom: i < rows.length - 1 ? '1px solid #ddd' : 'none' }}>
            <div style={{ padding: '10px 12px', background: '#f8fafc', fontSize: '9px', color: '#64748b', textTransform: 'uppercase', width: '35%', display: 'flex', alignItems: 'center' }}>{row.label}</div>
            <div style={{ padding: '10px 12px', fontSize: row.big ? '16px' : '12px', fontWeight: row.bold ? 700 : 600, textAlign: row.big ? 'center' : 'left', flex: 1 }}>
              {val(row.value) || '—'}
            </div>
          </div>
        ))}
      </div>
      {fd.destWarehouse && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '6px', borderRadius: '4px', marginBottom: '8px' }}>
          <span style={{ fontSize: '9px', color: '#64748b' }}>目的仓库: </span><span style={{ fontWeight: 600 }}>{val(fd.destWarehouse)}</span>
        </div>
      )}
      <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '4px', padding: '6px', textAlign: 'center', marginTop: '10px' }}>
        <span style={{ fontSize: '9px', color: '#dc2626' }}>⚠️ 此标签非 Amazon 官方 FBA 标签，仅供装箱信息整理参考</span>
      </div>
    </>
  );
}

// ===================== G. PALLET LABEL =====================

function PalletPreview({ fd, vs }: { fd: Record<string, any>; vs: LabelVisualStyle }) {
  return (
    <>
      <HeaderBar zh="🏭 托盘标签" en="PALLET LABEL" vs={{ ...vs, headerStyle: { ...vs.headerStyle, bg: '#4338ca' }}} />
      <div style={{ textAlign: 'center', padding: '14px 0 10px 0' }}>
        <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>PALLET NO.</div>
        <div style={{ fontSize: '32px', fontWeight: 900, color: '#4338ca', letterSpacing: '2px' }}>{val(fd.palletNo) || '—'}</div>
        {fd.totalPallets && <div style={{ fontSize: '12px', color: '#64748b' }}>共 {val(fd.totalPallets)} 托盘</div>}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '14px' }}>
        {fd.cartonsOnPallet && (
          <div style={{ background: '#eef2ff', border: '2px solid #c7d2fe', borderRadius: '6px', padding: '14px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase' }}>Cartons</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#4338ca' }}>{val(fd.cartonsOnPallet)}</div>
          </div>
        )}
        {fd.grossWeight && (
          <div style={{ background: '#fef3c7', border: '2px solid #fde68a', borderRadius: '6px', padding: '14px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase' }}>Gross Weight</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#d97706' }}>{val(fd.grossWeight)}</div>
          </div>
        )}
        {fd.destination && (
          <div style={{ background: '#ecfdf5', border: '2px solid #a7f3d0', borderRadius: '6px', padding: '14px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase' }}>Destination</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#059669' }}>{val(fd.destination)}</div>
          </div>
        )}
      </div>
      {fd.consignee && (
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '8px', marginBottom: '10px' }}>
          <div style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Consignee</div>
          <div style={{ fontSize: '12px', color: '#334155', whiteSpace: 'pre-wrap' }}>{val(fd.consignee)}</div>
        </div>
      )}
      {fd.handlingInstruction && fd.handlingInstruction !== 'None' && (
        <div style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)', color: '#fff', textAlign: 'center', padding: '8px', borderRadius: '4px', fontSize: '16px', fontWeight: 900, letterSpacing: '1px' }}>
          ⚠️ {val(fd.handlingInstruction)}
        </div>
      )}
      {fd.remark && (
        <div style={{ marginTop: '10px', padding: '6px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '10px', color: '#64748b' }}>Remark: {val(fd.remark)}</div>
      )}
    </>
  );
}

// ===================== H. HANDLING LABEL =====================

function HandlingPreview({ fd, vs }: { fd: Record<string, any>; vs: LabelVisualStyle }) {
  const icon = val(fd.iconStyle).split(' ')[0] || '⚠️';
  const lt = val(fd.labelType);
  const cn = fd.chineseText || (lt.split(' ')[0] || '易碎');
  const en = fd.englishText || (lt.includes(' ') ? lt.split(' ').slice(1).join(' ') : 'FRAGILE');
  const isWarning = vs.id === 'yellow-warning';

  return (
    <div style={{
      border: `${isWarning ? '4px dashed' : '3px solid'} ${isWarning ? '#d97706' : vs.borderStyle.color}`,
      borderRadius: vs.borderStyle.radius,
      padding: '24px 16px',
      textAlign: 'center',
      background: isWarning ? '#fffbeb' : 'transparent',
      margin: '12px 0',
    }}>
      <div style={{ fontSize: '64px', marginBottom: '10px', lineHeight: 1 }}>{icon}</div>
      <div style={{ fontSize: '28px', fontWeight: 900, color: isWarning ? '#92400e' : '#111', marginBottom: '6px', lineHeight: 1.3 }}>{cn}</div>
      <div style={{ fontSize: '20px', fontWeight: 700, color: isWarning ? '#b45309' : vs.titleStyle.color, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px' }}>{en}</div>
      {fd.remark && (
        <div style={{ fontSize: '11px', color: '#64748b', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>{val(fd.remark)}</div>
      )}
    </div>
  );
}

// ===================== ROUTER =====================

export function renderLabelPreview(
  type: string,
  formData: Record<string, any>,
  baseStyle: LabelStyle,
  titleZh: string,
  titleEn: string,
) {
  const vs = buildVisualStyle(baseStyle);

  switch (type) {
    case 'shipping-mark':
      return <ShippingMarkPreview fd={formData} vs={vs} />;
    case 'consolidation-inbound-label':
      return <ConsolInboundPreview fd={formData} vs={vs} />;
    case 'consolidation-combined-label':
      return <ConsolCombinedPreview fd={formData} vs={vs} />;
    case 'warehouse-location-label':
      return <WarehouseLocationPreview fd={formData} vs={vs} />;
    case 'parcel-info-label':
      return <ParcelInfoPreview fd={formData} vs={vs} />;
    case 'fba-carton-info-label':
      return <FBACartonPreview fd={formData} vs={vs} />;
    case 'pallet-label':
      return <PalletPreview fd={formData} vs={vs} />;
    case 'handling-label':
      return <HandlingPreview fd={formData} vs={vs} />;
    default:
      return <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>Unknown template: {type}</div>;
  }
}
