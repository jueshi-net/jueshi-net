/**
 * Document Type Normalization Utilities
 * 
 * Problem: Document types are saved with hyphens (e.g., "packing-list")
 * but Workspace expects underscores (e.g., "packing_list").
 * 
 * Solution: Normalize all document types to use underscores internally.
 */

/**
 * Normalize document type to use underscores (canonical format)
 * Examples:
 *   "packing-list" -> "packing_list"
 *   "proforma-invoice" -> "proforma_invoice"
 *   "commercial_invoice" -> "commercial_invoice" (no change)
 */
export function normalizeDocumentType(type: string): string {
  if (!type) return type;
  return type.replace(/-/g, '_');
}

/**
 * Convert document type to hyphen format (for URLs)
 * Examples:
 *   "packing_list" -> "packing-list"
 *   "proforma_invoice" -> "proforma-invoice"
 */
export function documentTypeToHyphen(type: string): string {
  if (!type) return type;
  return type.replace(/_/g, '-');
}

/**
 * Get display label for document type
 */
export function getDocumentTypeLabel(type: string): string {
  const normalized = normalizeDocumentType(type);
  const labels: Record<string, string> = {
    commercial_invoice: '外贸发票',
    proforma_invoice: '形式发票',
    packing_list: '装箱单',
    quote_sheet: '供应链报价单',
    quotation: '通用报价单',
    shipping_label: '唛头标签',
    inbound_receipt: '商品入库单',
    handover_note: '出货交接单',
    debit_note: 'Debit Note',
    video_script_sop: '短视频 SOP 脚本',
    sales_contract: '销售合同',
    booking_instruction: '订舱委托书',
    customs_declaration_authorization: '报关委托书',
    delivery_note: '送货单',
    freight_statement: '运费对账单',
    consolidation_inbound_receipt: '集运入库单',
    consolidation_packing_list: '集运合箱清单',
    express_declaration: '快递申报单',
    shipping_instruction: '提单补料',
    trucking_dispatch_order: '拖车派车单',
    shipping_mark: '唛头模板',
    container_loading_list: '装柜明细单',
    return_packing_list: '退货装箱清单',
    certificate_of_origin_template: '原产地证模板',
    fumigation_certificate_template: '熏蒸证明模板',
    letter_of_credit_info_sheet: '信用证资料单',
    label_maker: '唛头/标签生成器',
  };
  return labels[normalized] || type;
}

/**
 * Get tool href for document type (for links)
 */
export function getDocumentTypeHref(type: string): string {
  const normalized = normalizeDocumentType(type);
  const hrefs: Record<string, string> = {
    commercial_invoice: '/tools/commercial-invoice',
    proforma_invoice: '/tools/documents/proforma-invoice',
    packing_list: '/tools/documents/packing-list',
    quote_sheet: '/tools/documents/quotation',
    quotation: '/tools/documents/quotation',
    shipping_label: '/tools/documents/shipping-label',
    inbound_receipt: '/tools/inbound-receipt',
    handover_note: '/tools/handover-note',
    debit_note: '/tools/debit-note',
    video_script_sop: '/tools/video-script-sop',
    sales_contract: '/tools/documents/sales-contract',
    booking_instruction: '/tools/documents/booking-instruction',
    customs_declaration_authorization: '/tools/documents/customs-declaration-authorization',
    delivery_note: '/tools/documents/delivery-note',
    freight_statement: '/tools/documents/freight-statement',
    consolidation_inbound_receipt: '/tools/documents/consolidation-inbound-receipt',
    consolidation_packing_list: '/tools/documents/consolidation-packing-list',
    express_declaration: '/tools/documents/express-declaration',
    shipping_instruction: '/tools/documents/shipping-instruction',
    trucking_dispatch_order: '/tools/documents/trucking-dispatch-order',
    shipping_mark: '/tools/documents/shipping-mark',
    container_loading_list: '/tools/documents/container-loading-list',
    return_packing_list: '/tools/documents/return-packing-list',
    certificate_of_origin_template: '/tools/documents/certificate-of-origin-template',
    fumigation_certificate_template: '/tools/documents/fumigation-certificate-template',
    letter_of_credit_info_sheet: '/tools/documents/letter-of-credit-info-sheet',
    label_maker: '/tools/documents/shipping-label',
  };
  return hrefs[normalized] || `/tools/documents/${documentTypeToHyphen(type)}`;
}
