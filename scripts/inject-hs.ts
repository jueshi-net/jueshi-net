import { config } from "dotenv";
import { resolve } from "path";
import { existsSync, readFileSync } from "fs";

if (existsSync(resolve(__dirname, "../.env.production"))) {
  config({ path: resolve(__dirname, "../.env.production") });
} else {
  config({ path: resolve(__dirname, "../.env") });
}

import pg from "pg";
const { Pool } = pg;

// Use URL parser to properly handle special chars in password
const url = new URL(process.env.DATABASE_URL!);
const pool = new Pool({
  host: url.hostname,
  port: parseInt(url.port),
  database: url.pathname.slice(1),
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
});

async function main() {
  console.log("═══════════════════════════════════════");
  console.log("🚀 极速灌浆启动");
  console.log("═══════════════════════════════════════");

  // Step 1: Read JSON
  console.log("📖 读取 JSON 数据...");
  const data = JSON.parse(readFileSync("/home/deploy/xixiong-saas/data/hs_codes_full.json", "utf-8"));
  console.log(`   共 ${data.length} 条记录`);

  // Step 2: Clear existing data
  console.log("⚠️ 正在清空 hs_codes 表...");
  await pool.query("TRUNCATE TABLE hs_codes RESTART IDENTITY CASCADE");
  console.log("✅ 表已清空");

  // Step 3: Batch insert
  console.log("📥 开始批量灌入...");
  const batchSize = 500;
  let inserted = 0;
  const startTime = Date.now();

  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    const values = batch.map((_, idx) => {
      const base = idx * 11;
      return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8}, $${base + 9}, $${base + 10}, $${base + 11})`;
    }).join(", ");
    
    const flatValues = batch.flatMap((r: any) => {
      const id = `hs_${r.code}`;
      const now = new Date().toISOString();
      return [
        id, r.code, r.level, null, r.description, r.descriptionEn || r.description,
        r.category, null, `第${r.code.substring(0, 2)}章 - ${r.category}`, true, now
      ];
    });
    
    await pool.query(
      `INSERT INTO hs_codes (id, code, level, "parentId", description, "descriptionEn", category, "taxRate", notes, "isActive", "updatedAt") 
       VALUES ${values} ON CONFLICT (code) DO NOTHING`,
      flatValues
    );
    
    inserted += batch.length;
    if (inserted % 10000 === 0 || inserted === data.length) {
      console.log(`   ✅ 已灌入 ${inserted.toLocaleString()}/${data.length.toLocaleString()} 条`);
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n✅ 灌浆完成！共灌入 ${inserted.toLocaleString()} 条，耗时 ${elapsed} 秒`);
  
  const result = await pool.query("SELECT COUNT(*) FROM hs_codes");
  console.log(`📈 当前 HsCode 表总量: ${result.rows[0].count}`);
  
  await pool.end();
}

main().catch((e) => {
  console.error("💥 导入失败:", e.message);
  process.exit(1);
});
