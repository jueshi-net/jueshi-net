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
  console.log("🚀 商业级 HS-CIQ 全量终极灌浆");
  console.log("═══════════════════════════════════════");

  const startTime = Date.now();

  console.log("📖 读取全量 JSON 数据...");
  const data = JSON.parse(readFileSync("/home/deploy/xixiong-saas/data/hs_codes_ready_v2.json", "utf-8"));
  console.log(`   共 ${data.length.toLocaleString()} 条记录`);

  console.log("🔥 彻底清空 hs_codes 表...");
  await pool.query("TRUNCATE TABLE hs_codes RESTART IDENTITY CASCADE");
  console.log("✅ 旧数据已焚毁");

  console.log("📥 开始全量灌入...");
  const batchSize = 1000;
  let inserted = 0;

  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    const values = batch.map((_: any, idx: number) => {
      const base = idx * 9;
      return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8}, $${base + 9})`;
    }).join(", ");
    
    const flatValues = batch.flatMap((r: any) => {
      const id = `hs_${r.code}_${inserted + batch.indexOf(r)}`;
      const now = new Date().toISOString();
      return [
        id, r.code, r.level, null, r.description,
        r.descriptionEn || r.description, r.category,
        r.notes || null, now
      ];
    });
    
    await pool.query(
      `INSERT INTO hs_codes (id, code, level, "parentId", description, "descriptionEn", category, notes, "updatedAt") 
       VALUES ${values}`,
      flatValues
    );
    
    inserted += batch.length;
    if (inserted % 10000 === 0 || inserted === data.length) {
      console.log(`   ✅ 已灌入 ${inserted.toLocaleString()}/${data.length.toLocaleString()} 条`);
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n✅ 全量灌浆完成！共灌入 ${inserted.toLocaleString()} 条，耗时 ${elapsed} 秒`);
  
  const result = await pool.query("SELECT COUNT(*) FROM hs_codes");
  console.log(`📈 当前 HsCode 表总量: ${result.rows[0].count}`);
  
  await pool.end();
}

main().catch((e) => {
  console.error("💥 导入失败:", e.message);
  process.exit(1);
});
