/**
 * Tool Search Aliases — 中文关键词 + 英文别名映射
 *
 * Purpose: Enable Chinese keyword search in Tool Center (/tools?q=xxx).
 *
 * The current search only matches `name`, `description`, and `slug`.
 * Many modern tools have English-only names (e.g., "Quote Sheet"),
 * so searching "报价单" won't match them without aliases.
 *
 * Usage: Imported by tool-center.ts and merged into search matching.
 */

export const TOOL_SEARCH_ALIASES: Record<string, string[]> = {
  // === Modern Document Tools ===
  "commercial-invoice": [
    "商业发票",
    "发票",
    "外贸发票",
    "commercial invoice",
    "invoice",
    "CI",
  ],
  "shipping-label": [
    "快递面单",
    "面单",
    "shipping label",
    "标签",
  ],
  "quote-sheet": [
    "报价单",
    "报价表",
    "quote",
    "quotation",
    "供应链报价单",
  ],
  "inbound-receipt": [
    "入库单",
    "入库签收",
    "入库",
    "inbound receipt",
    "签收单",
  ],
  "handover-note": [
    "交接单",
    "提单确认书",
    "handover note",
    "货物交接",
  ],
  "debit-note": [
    "借记单",
    "扣款通知",
    "debit note",
    "财务对账",
  ],
  "video-script-sop": [
    "短视频脚本",
    "视频脚本",
    "SOP",
    "脚本模板",
    "video script",
  ],

  // === Legacy Document Tools ===
  "proforma-invoice": [
    "形式发票",
    "PI",
    "proforma invoice",
  ],
  "sales-contract": [
    "销售合同",
    "外贸合同",
    "合同",
    "sales contract",
  ],
  "packing-list": [
    "装箱单",
    "箱单",
    "packing list",
    "PL",
  ],
  "booking-instruction": [
    "订舱委托书",
    "订舱",
    "booking instruction",
  ],
  "shipping-instruction": [
    "提单补料",
    "补料",
    "shipping instruction",
    "SI",
  ],
  "delivery-note": [
    "送货单",
    "delivery note",
  ],
  "trucking-dispatch-order": [
    "拖车派车单",
    "拖车",
    "派车单",
    "trucking dispatch",
  ],
  "shipping-mark": [
    "唛头",
    "唛头模板",
    "shipping mark",
  ],
  "container-loading-list": [
    "装柜清单",
    "装柜明细",
    "装柜",
    "container loading",
  ],
  "customs-declaration-authorization": [
    "报关委托书",
    "报关",
    "customs declaration",
  ],
  "express-declaration": [
    "快递申报",
    "国际快递",
    "express declaration",
  ],
  "certificate-of-origin-template": [
    "原产地证",
    "CO",
    "certificate of origin",
    "原产地",
  ],
  "fumigation-certificate-template": [
    "熏蒸证明",
    "熏蒸证书",
    "fumigation",
  ],
  "consolidation-packing-list": [
    "集运装箱单",
    "合箱打包",
    "consolidation packing",
    "集运",
  ],
  "return-packing-list": [
    "退运装箱单",
    "退货装箱",
    "return packing",
    "退货",
    "退运",
  ],
  "freight-statement": [
    "运费对账单",
    "运费",
    "freight statement",
  ],
  "letter-of-credit-info-sheet": [
    "信用证",
    "信用证资料单",
    "LC",
    "letter of credit",
  ],
};

/**
 * Check if a tool slug matches a search query using aliases.
 * Returns true if the query matches any alias for that slug.
 */
export function matchesAlias(slug: string, query: string): boolean {
  const aliases = TOOL_SEARCH_ALIASES[slug];
  if (!aliases) return false;
  const q = query.toLowerCase().trim();
  return aliases.some((alias) => alias.toLowerCase().includes(q));
}

/**
 * Get all aliases for a given slug.
 */
export function getAliases(slug: string): string[] {
  return TOOL_SEARCH_ALIASES[slug] || [];
}
