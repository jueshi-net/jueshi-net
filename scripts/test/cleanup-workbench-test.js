const url = require("url");
const pg = require("pg");

const dbUrl = process.argv[2];
const parsed = url.parse(dbUrl);
const auth = parsed.auth.split(":");
const user = auth[0];
const pass = decodeURIComponent(auth[1]);
const db = parsed.pathname.slice(1).split("?")[0];

const pool = new pg.Pool({ host: "127.0.0.1", port: 5432, user, password: pass, database: db });

async function main() {
  console.log("=== Cleanup test-workbench users ===\n");

  const { rows } = await pool.query("SELECT id, email FROM users WHERE email LIKE $1", ["test-workbench-%@local.test"]);
  console.log("Found", rows.length, "test-workbench users");

  for (const u of rows) {
    console.log("Cleaning", u.email, u.id);
    await pool.query("DELETE FROM tool_favorites WHERE \"userId\" = $1", [u.id]);
    await pool.query("DELETE FROM workbench_links WHERE \"userId\" = $1", [u.id]);
    await pool.query("DELETE FROM workspaces WHERE \"ownerId\" = $1", [u.id]);
    await pool.query("DELETE FROM accounts WHERE \"userId\" = $1", [u.id]);
    await pool.query("DELETE FROM sessions WHERE \"userId\" = $1", [u.id]);
    await pool.query("DELETE FROM users WHERE id = $1", [u.id]);
    console.log("  Deleted", u.email);
  }

  // Verify
  const { rows: v } = await pool.query("SELECT COUNT(*) FROM users WHERE email LIKE $1", ["test-workbench-%@local.test"]);
  console.log("\nVerification: count =", v[0].count);

  if (parseInt(v[0].count) === 0) {
    console.log("✅ Cleanup complete");
  } else {
    console.error("❌ Cleanup incomplete");
    process.exit(1);
  }

  await pool.end();
}

main().catch(e => { console.error(e); process.exit(1); });
