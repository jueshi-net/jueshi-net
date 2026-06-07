const { Pool } = require("pg");
const fs = require("fs");

const env = fs.readFileSync(".env.production", "utf8");
const rawUrl = env.match(/^DATABASE_URL="?(.+?)"?\s*$/m)[1].replace(/\?.*$/, "");
const pool = new Pool({ connectionString: rawUrl });

async function main() {
  // Check recent events for proforma-invoice
  const events = await pool.query(
    `SELECT * FROM event_logs WHERE action LIKE '%proforma-invoice%' ORDER BY "createdAt" DESC LIMIT 10`
  );
  console.log("\n=== Recent events for proforma-invoice ===");
  for (const row of events.rows) {
    console.log(JSON.stringify({ eventType: row.eventType, action: row.action, createdAt: row.createdAt }));
  }

  // Check for Document_Save events
  const saves = await pool.query(
    `SELECT * FROM event_logs WHERE "eventType" = 'Document_Save' ORDER BY "createdAt" DESC LIMIT 5`
  );
  console.log("\n=== Recent Document_Save events ===");
  for (const row of saves.rows) {
    console.log(JSON.stringify({ eventType: row.eventType, action: row.action, createdAt: row.createdAt }));
  }

  // Check for Document_Export events
  const exports = await pool.query(
    `SELECT * FROM event_logs WHERE "eventType" = 'Document_Export' ORDER BY "createdAt" DESC LIMIT 5`
  );
  console.log("\n=== Recent Document_Export events ===");
  for (const row of exports.rows) {
    console.log(JSON.stringify({ eventType: row.eventType, action: row.action, createdAt: row.createdAt }));
  }

  // Check ToolMetricDaily for proforma-invoice
  const metrics = await pool.query(
    `SELECT * FROM tool_metric_dailies WHERE tool_slug = 'proforma-invoice' ORDER BY date DESC LIMIT 5`
  );
  console.log("\n=== ToolMetricDaily for proforma-invoice ===");
  for (const row of metrics.rows) {
    console.log(JSON.stringify({ toolSlug: row.tool_slug, date: row.date, views: row.views, clicks: row.clicks, saves: row.saves }));
  }

  // Overall tool counts
  const total = await pool.query("SELECT COUNT(*) FROM tools WHERE is_active = true");
  const docs = await pool.query("SELECT COUNT(*) FROM tools WHERE is_active = true AND category = 'documents'");
  const ai = await pool.query("SELECT COUNT(*) FROM tools WHERE is_active = true AND category = 'ai-content'");
  console.log("\n=== Tool counts ===");
  console.log("Total active:", total.rows[0].count);
  console.log("Documents:", docs.rows[0].count);
  console.log("AI Content:", ai.rows[0].count);

  // Check for shipping-mark
  const sm = await pool.query("SELECT id, slug, name, is_active, category FROM tools WHERE slug = 'shipping-mark'");
  console.log("\n=== shipping-mark ===");
  console.log(JSON.stringify(sm.rows[0]));

  // Check for commercial-invice (typo)
  const typo = await pool.query("SELECT id, slug, name FROM tools WHERE slug = 'commercial-invice'");
  console.log("\n=== commercial-invice (typo check) ===");
  console.log("Found:", typo.rows.length > 0);

  // Check ToolMetricDaily for packing-list
  const metricsPacking = await pool.query(
    `SELECT * FROM tool_metric_dailies WHERE tool_slug = 'packing-list' ORDER BY date DESC LIMIT 5`
  );
  console.log("\n=== ToolMetricDaily for packing-list ===");
  for (const row of metricsPacking.rows) {
    console.log(JSON.stringify({ toolSlug: row.tool_slug, date: row.date, views: row.views, clicks: row.clicks, saves: row.saves }));
  }

  // Check ToolMetricDaily for sales-contract
  const metricsSales = await pool.query(
    `SELECT * FROM tool_metric_dailies WHERE tool_slug = 'sales-contract' ORDER BY date DESC LIMIT 5`
  );
  console.log("\n=== ToolMetricDaily for sales-contract ===");
  for (const row of metricsSales.rows) {
    console.log(JSON.stringify({ toolSlug: row.tool_slug, date: row.date, views: row.views, clicks: row.clicks, saves: row.saves }));
  }

  await pool.end();
}

main().catch(e => { console.error(e); process.exit(1); });
