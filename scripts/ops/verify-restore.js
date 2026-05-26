// Backup restore verification script
const { execSync } = require("child_process");
const url = require("url");

const dbUrl = process.argv[2];
if (!dbUrl) {
  console.error("Usage: node verify-restore.js <DATABASE_URL>");
  process.exit(1);
}

const parsed = url.parse(dbUrl);
const auth = parsed.auth.split(":");
const user = auth[0];
const pass = decodeURIComponent(auth[1]);
const db = parsed.pathname.slice(1).split("?")[0];

const TEST_DB = "bxb_restore_test";
const BACKUP = "/var/backups/xixiong-saas/postgres/latest.sql.gz";

function run(cmd) {
  console.log(`> ${cmd}`);
  try {
    const result = execSync(cmd, { encoding: "utf8", env: { ...process.env, PGPASSWORD: pass } });
    return result;
  } catch (e) {
    console.error(e.stdout || e.message);
    throw e;
  }
}

async function main() {
  console.log("=== Backup Restore Verification ===\n");

  // Step 1: Kill connections and drop existing test db
  console.log("--- Step 1: Cleanup test db ---");
  run(`psql -h 127.0.0.1 -U ${user} -d ${db} -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='${TEST_DB}';"`);
  run(`psql -h 127.0.0.1 -U ${user} -d ${db} -c "DROP DATABASE IF EXISTS ${TEST_DB};"`);

  // Step 2: Create test db
  console.log("\n--- Step 2: Create test db ---");
  run(`psql -h 127.0.0.1 -U ${user} -d ${db} -c "CREATE DATABASE ${TEST_DB};"`);

  // Step 3: Restore backup
  console.log("\n--- Step 3: Restore backup ---");
  run(`gunzip -c ${BACKUP} | psql -h 127.0.0.1 -U ${user} -d ${TEST_DB} 2>&1 | tail -5`);
  console.log("Restore done\n");

  // Step 4: Verify old tables
  console.log("--- Step 4: Verify core old tables ---");
  const oldTables = ["users", "postal_codes", "point_ledgers", "daily_check_ins", "user_tasks", "export_logs", "reward_items", "user_rewards"];
  const tableCounts = run(`psql -h 127.0.0.1 -U ${user} -d ${TEST_DB} -t -c "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename;"`);
  const tables = tableCounts.split("\n").map(s => s.trim()).filter(Boolean);

  for (const t of oldTables) {
    const exists = tables.includes(t);
    const count = exists ? run(`psql -h 127.0.0.1 -U ${user} -d ${TEST_DB} -t -c "SELECT COUNT(*) FROM \\"${t}\\";"`).trim() : "N/A";
    console.log(`  ${t}: ${exists ? "✅ EXISTS" : "❌ MISSING"} (rows: ${count})`);
  }

  // Step 5: Verify v1.16 new tables
  console.log("\n--- Step 5: Verify v1.16 new tables ---");
  for (const t of ["workbench_links", "tool_favorites"]) {
    const exists = tables.includes(t);
    const count = exists ? run(`psql -h 127.0.0.1 -U ${user} -d ${TEST_DB} -t -c "SELECT COUNT(*) FROM \\"${t}\\";"`).trim() : "N/A";
    console.log(`  ${t}: ${exists ? "✅ EXISTS" : "❌ MISSING"} (rows: ${count})`);
  }

  // Step 6: Verify users.profile_type column
  console.log("\n--- Step 6: Verify users.profile_type ---");
  const profileCol = run(`psql -h 127.0.0.1 -U ${user} -d ${TEST_DB} -t -c "SELECT column_name, data_type FROM information_schema.columns WHERE table_name='users' AND column_name='profile_type';"`).trim();
  console.log(`  profile_type: ${profileCol ? "✅ EXISTS (" + profileCol + ")" : "❌ MISSING"}`);

  // Step 7: Verify indexes
  console.log("\n--- Step 7: Verify indexes ---");
  const indexes = run(`psql -h 127.0.0.1 -U ${user} -d ${TEST_DB} -t -c "SELECT indexname FROM pg_indexes WHERE schemaname='public' AND tablename IN ('workbench_links','tool_favorites') ORDER BY indexname;"`);
  for (const idx of indexes.split("\n").map(s => s.trim()).filter(Boolean)) {
    console.log(`  Index: ✅ ${idx}`);
  }

  // Verify unique constraint
  const uniqueIdx = run(`psql -h 127.0.0.1 -U ${user} -d ${TEST_DB} -t -c "SELECT indexname FROM pg_indexes WHERE schemaname='public' AND tablename='tool_favorites' AND indexname LIKE '%unique%';"`).trim();
  console.log(`  tool_favorites unique: ${uniqueIdx ? "✅ " + uniqueIdx : "❌ MISSING"}`);

  // Step 8: Cleanup
  console.log("\n--- Step 8: Cleanup ---");
  run(`psql -h 127.0.0.1 -U ${user} -d ${db} -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='${TEST_DB}';"`);
  run(`psql -h 127.0.0.1 -U ${user} -d ${db} -c "DROP DATABASE IF EXISTS ${TEST_DB};"`);
  console.log("  ✅ Test db dropped\n");

  console.log("=== Verification Complete ===");
}

main().catch(e => {
  console.error("Verification failed:", e.message);
  // Try cleanup
  try {
    run(`psql -h 127.0.0.1 -U ${user} -d ${db} -c "DROP DATABASE IF EXISTS ${TEST_DB};"`);
  } catch {}
  process.exit(1);
});
