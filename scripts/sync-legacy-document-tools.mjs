/**
 * Sync legacy document tools into the Tool table via pg client (no Prisma needed).
 * Run: cd /home/deploy/xixiong-saas && node scripts/sync-legacy-document-tools.mjs
 *
 * Rules:
 * - Modern tools are skipped (no duplicate in Tool table).
 * - Legacy non-duplicate tools are upserted as category=documents, isActive=true.
 * - Route points to /tools/documents/[key] (legacy editor).
 * - Safe to re-run.
 */

import fs from "fs";
import pg from "pg";

const { Pool } = pg;

// Canonical map: legacy key → modern canonical key (or null if non-duplicate)
const CANONICAL_MAP = {
  // Modern tools — skip, do NOT add duplicate
  "commercial-invoice": "commercial-invoice",
  "quotation": "quote-sheet",
  "consolidation-inbound-receipt": "inbound-receipt",
  "label-maker": "shipping-label",
  "shipping-mark": "shipping-mark",
  // Non-duplicate legacy tools — safe to add
  "proforma-invoice": null,
  "sales-contract": null,
  "packing-list": null,
  "booking-instruction": null,
  "shipping-instruction": null,
  "delivery-note": null,
  "trucking-dispatch-order": null,
  "container-loading-list": null,
  "customs-declaration-authorization": null,
  "express-declaration": null,
  "certificate-of-origin-template": null,
  "fumigation-certificate-template": null,
  "consolidation-packing-list": null,
  "return-packing-list": null,
  "freight-statement": null,
  "letter-of-credit-info-sheet": null,
};

// Legacy tool definitions (mirrors document-tools-config.ts)
const documentTools = [
  { key: "proforma-invoice", titleZh: "形式发票", titleEn: "Proforma Invoice", description: "交易前向买方出具的预开发票，用于报价和确认交易条件", category: "trade", emoji: "📋" },
  { key: "commercial-invoice", titleZh: "商业发票", titleEn: "Commercial Invoice", description: "实际交易完成后出具的正式发票，是报关、结汇的核心单据", category: "trade", emoji: "🧾" },
  { key: "quotation", titleZh: "通用报价单", titleEn: "Quotation", description: "向客户发送的产品/服务/物流项目报价文件", category: "trade", emoji: "📝" },
  { key: "sales-contract", titleZh: "外贸销售合同", titleEn: "Sales Contract", description: "买卖双方就商品、价格、交货、付款等条款达成的书面协议", category: "trade", emoji: "📄" },
  { key: "packing-list", titleZh: "装箱单", titleEn: "Packing List", description: "列明货物包装、数量、重量、体积等详细信息的单据", category: "logistics", emoji: "📦" },
  { key: "booking-instruction", titleZh: "订舱委托书", titleEn: "Booking Instruction", description: "委托货代向船公司/航空公司预订舱位的书面文件", category: "logistics", emoji: "🚢" },
  { key: "shipping-instruction", titleZh: "提单补料", titleEn: "Shipping Instruction", description: "向船公司提交提单内容资料，确认提单信息", category: "logistics", emoji: "📋" },
  { key: "delivery-note", titleZh: "送货单", titleEn: "Delivery Note", description: "记录送货货物明细的单据，用于仓库收货签收", category: "logistics", emoji: "🚚" },
  { key: "trucking-dispatch-order", titleZh: "拖车派车单", titleEn: "Trucking Dispatch Order", description: "安排拖车运输的派车单据，调度司机提柜送货", category: "logistics", emoji: "🚛" },
  { key: "shipping-mark", titleZh: "唛头通用模板", titleEn: "Shipping Mark", description: "货物外包装唛头标识，便于目的港分拣识别", category: "logistics", emoji: "🏷️" },
  { key: "container-loading-list", titleZh: "装柜明细单", titleEn: "Container Loading List", description: "记录装柜货物详细信息，监装签收", category: "logistics", emoji: "📦" },
  { key: "customs-declaration-authorization", titleZh: "报关委托书", titleEn: "Customs Declaration Authorization", description: "委托报关行代为办理报关手续的授权文件", category: "customs", emoji: "🏛️" },
  { key: "express-declaration", titleZh: "国际快递申报单", titleEn: "International Express Declaration", description: "国际快递寄件时填写的物品申报单据", category: "customs", emoji: "✈️" },
  { key: "certificate-of-origin-template", titleZh: "原产地证 CO 模板", titleEn: "Certificate of Origin Template", description: "原产地证资料整理模板（非官方证书）", category: "customs", emoji: "🏅" },
  { key: "fumigation-certificate-template", titleZh: "熏蒸证明模板", titleEn: "Fumigation Certificate Template", description: "熏蒸证明资料整理模板（非检疫证书）", category: "customs", emoji: "🪵" },
  { key: "consolidation-inbound-receipt", titleZh: "集运入库单", titleEn: "Consolidation Inbound Receipt", description: "集运仓库收到客户包裹时的入库记录单据", category: "consolidation", emoji: "📥" },
  { key: "consolidation-packing-list", titleZh: "集运合箱打包清单", titleEn: "Consolidation Packing List", description: "将多个包裹合并装箱后的详细清单", category: "consolidation", emoji: "📫" },
  { key: "return-packing-list", titleZh: "退货装箱清单", titleEn: "Return Packing List", description: "跨境电商退货、退运清关时的装箱明细", category: "consolidation", emoji: "↩️" },
  { key: "freight-statement", titleZh: "运费对账单", titleEn: "Freight Statement", description: "与客户对账确认运费及各项杂费的明细清单", category: "finance", emoji: "💰" },
  { key: "letter-of-credit-info-sheet", titleZh: "信用证简易资料单", titleEn: "Letter of Credit Info Sheet", description: "信用证关键信息整理单", category: "finance", emoji: "💳" },
  { key: "label-maker", titleZh: "唛头/标签生成器", titleEn: "Label Maker", description: "外箱唛头、仓库标签、集运入库贴、合箱标签等，支持批量打印", category: "label", emoji: "📌" },
];

function getRoute(tool) {
  if (tool.key === "label-maker") return "/tools/documents/shipping-label";
  return `/tools/documents/${tool.key}`;
}

async function main() {
  // Load env — parse DATABASE_URL carefully (password may contain special chars)
  const env = fs.readFileSync(".env.production", "utf8");
  const rawLine = env.match(/^DATABASE_URL="?(.+?)"?\s*$/m)[1];
  // Strip query params: postgresql://user:pass@host:port/db?schema=public → postgresql://user:pass@host:port/db
  const rawUrl = rawLine.replace(/\?.*$/, "");
  // Fix: the password contains @ so we need the full URL with query stripped
  
  const pool = new Pool({ connectionString: rawUrl });

  console.log("=== Legacy Document Tool Table Finalization ===\n");

  // Before counts
  const beforeRows = await pool.query("SELECT id, is_active, category FROM tools");
  const beforeTotal = beforeRows.rows.length;
  const beforeActive = beforeRows.rows.filter(t => t.is_active).length;
  const beforeDocs = beforeRows.rows.filter(t => t.category === "documents").length;

  console.log(`[Before] Tool table: total=${beforeTotal}, active=${beforeActive}, documents=${beforeDocs}\n`);

  const total = documentTools.length;
  console.log(`[Config] documentTools count: ${total}\n`);

  let created = 0;
  let updated = 0;
  let skipped = 0;
  const skippedList = [];
  const createdList = [];
  const updatedList = [];

  for (const tool of documentTools) {
    const canonical = CANONICAL_MAP[tool.key];

    if (canonical) {
      console.log(`[SKIP] ${tool.key} → duplicate of ${canonical}`);
      skipped++;
      skippedList.push(`${tool.key} (${tool.titleZh}) → ${canonical}`);
      continue;
    }

    const route = getRoute(tool);
    const name = `${tool.titleZh} / ${tool.titleEn}`;

    // Check if exists
    const existing = await pool.query("SELECT id, name, category FROM tools WHERE slug = $1", [tool.key]);

    if (existing.rows.length > 0) {
      await pool.query(
        `UPDATE tools SET name = $1, description = $2, category = $3, is_active = true, route = $4, icon = $5, updated_at = NOW() WHERE slug = $6`,
        [name, tool.description, "documents", route, tool.emoji, tool.key]
      );
      updated++;
      updatedList.push(tool.key);
      console.log(`[UPDATE] ${tool.key} → ${route}`);
    } else {
      await pool.query(
        `INSERT INTO tools (id, slug, name, description, category, is_active, route, icon, url, "isInternal", "sourceType", popularity_score, sort_order, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, true, $5, $6, $7, true, 'internal', 0, 100, NOW(), NOW())`,
        [tool.key, name, tool.description, "documents", route, tool.emoji, route]
      );
      created++;
      createdList.push(tool.key);
      console.log(`[CREATE] ${tool.key} → ${route}`);
    }
  }

  // After counts
  const afterRows = await pool.query("SELECT id, is_active, category FROM tools");
  const afterTotal = afterRows.rows.length;
  const afterActive = afterRows.rows.filter(t => t.is_active).length;
  const afterDocs = afterRows.rows.filter(t => t.category === "documents").length;

  console.log(`\n[After] Tool table: total=${afterTotal}, active=${afterActive}, documents=${afterDocs}`);
  console.log(`\n=== Summary ===`);
  console.log(`documentTools total: ${total}`);
  console.log(`Created: ${created}`);
  console.log(`Updated: ${updated}`);
  console.log(`Skipped (duplicates): ${skipped}`);
  console.log(`\nCreated list: ${createdList.join(", ")}`);
  console.log(`Updated list: ${updatedList.join(", ") || "(none)"}`);
  console.log(`Skipped list: ${skippedList.join(", ")}`);

  await pool.end();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
