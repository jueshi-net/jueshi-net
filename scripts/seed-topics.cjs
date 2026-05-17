// scripts/seed-topics.cjs
// Seed the topics CMS with the overseas-essential-apps data
// Uses raw SQL via psql to avoid Prisma client issues

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Load env
const envPath = path.join(__dirname, "..", ".env.production");
const envContent = fs.readFileSync(envPath, "utf-8");
const envVars = {};
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith("#")) {
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx > 0) {
      let key = trimmed.slice(0, eqIdx);
      let val = trimmed.slice(eqIdx + 1);
      // Remove quotes
      val = val.replace(/^["']|["']$/g, "");
      envVars[key] = val;
    }
  }
}

const DATABASE_URL = envVars.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("ERROR: DATABASE_URL not found in .env.production");
  process.exit(1);
}

// Extract connection params from DATABASE_URL
// postgresql://user:pass@host:port/db?schema=public
const match = DATABASE_URL.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/);
if (!match) {
  console.error("ERROR: Cannot parse DATABASE_URL");
  process.exit(1);
}

const [, DB_USER, DB_PASS_ENCODED, DB_HOST, DB_PORT, DB_NAME] = match;
const DB_PASS = decodeURIComponent(DB_PASS_ENCODED);

function psql(sql) {
  const safePass = DB_PASS.replace(/'/g, "''");
  const cmd = `PGPASSWORD='${safePass}' psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME} -t -A -c "${sql.replace(/"/g, '\\"')}"`;
  return execSync(cmd, { encoding: "utf-8" }).trim();
}

function psqlMulti(sql) {
  const safePass = DB_PASS.replace(/'/g, "''");
  const cmd = `PGPASSWORD='${safePass}' psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME} -c "${sql.replace(/"/g, '\\"')}"`;
  return execSync(cmd, { encoding: "utf-8" }).trim();
}

async function main() {
  console.log("🌱 Seeding topics CMS...");

  // Check if topic exists
  const existingSlug = psql(`SELECT id FROM topics WHERE slug = 'overseas-essential-apps'`);

  let topicId;
  if (existingSlug) {
    console.log(`📝 Topic already exists, updating...`);
    topicId = existingSlug;
    psqlMulti(`UPDATE topics SET 
      title = '出海之后必装 APP 评级推荐',
      subtitle = 'S/A/B/C/D 评级，18 个海外生活必备 APP',
      summary = '刚出国不知道装什么？这 18 个 APP 帮你从通讯、社交、学习到工作全覆盖。',
      status = 'published',
      template_type = 'rating_list',
      cover_emoji = '📱',
      seo_title = '出海之后必装 APP 评级推荐 — 海外百宝箱',
      seo_description = 'S/A/B/C/D 评级，18 个海外生活必备 APP 推荐。每个 APP 都有国内类比、避坑提醒、适合人群。',
      published_at = NOW(),
      updated_at = NOW()
      WHERE id = '${topicId}'`);
  } else {
    console.log(`✨ Creating topic...`);
    topicId = psql(`INSERT INTO topics (slug, title, subtitle, summary, status, template_type, cover_emoji, seo_title, seo_description, published_at) 
      VALUES ('overseas-essential-apps', '出海之后必装 APP 评级推荐', 'S/A/B/C/D 评级，18 个海外生活必备 APP', '刚出国不知道装什么？这 18 个 APP 帮你从通讯、社交、学习到工作全覆盖。', 'published', 'rating_list', '📱', '出海之后必装 APP 评级推荐 — 海外百宝箱', 'S/A/B/C/D 评级，18 个海外生活必备 APP 推荐。', NOW()) 
      RETURNING id`);
  }

  console.log(`📋 Topic ID: ${topicId}`);

  // Delete existing items
  psqlMulti(`DELETE FROM topic_items WHERE topic_id = '${topicId}'`);

  // Import apps data
  const { apps } = require("../src/lib/topics/overseas-essential-apps");

  console.log(`📦 Seeding ${apps.length} APP items...`);

  for (let i = 0; i < apps.length; i++) {
    const app = apps[i];
    const values = [
      topicId,
      app.name.replace(/'/g, "''"),
      (app.alias || "").replace(/'/g, "''"),
      app.rating,
      app.category,
      app.iconText,
      app.iconBg,
      app.iconFg,
      app.installPriority,
      app.description.replace(/'/g, "''"),
      app.analogy.replace(/'/g, "''"),
      app.suitableFor.replace(/'/g, "''"),
      app.beginnerAdvice.replace(/'/g, "''"),
      app.warning.replace(/'/g, "''"),
      app.domain,
      app.beginnerRecommended ? "true" : "false",
      i.toString(),
    ];

    psqlMulti(`INSERT INTO topic_items (topic_id, name, alias, rating, category, icon_text, icon_bg, icon_fg, install_priority, description, analogy, suitable_for, beginner_advice, risk_tip, official_url, is_beginner_friendly, sort_order)
      VALUES ('${values[0]}', '${values[1]}', '${values[2]}', '${values[3]}', '${values[4]}', '${values[5]}', '${values[6]}', '${values[7]}', '${values[8]}', '${values[9]}', '${values[10]}', '${values[11]}', '${values[12]}', '${values[13]}', '${values[14]}', ${values[15]}, ${values[16]})`);
  }

  console.log("✅ Topics CMS seed complete!");
  console.log(`   Topic: overseas-essential-apps (published)`);
  console.log(`   Items: ${apps.length}`);
}

main().catch((e) => {
  console.error("❌ Seed failed:", e.message);
  process.exit(1);
});
