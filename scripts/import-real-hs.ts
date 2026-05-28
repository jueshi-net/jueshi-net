import { config } from "dotenv";
import { resolve } from "path";
import { existsSync } from "fs";

if (existsSync(resolve(__dirname, "../.env.production"))) {
  config({ path: resolve(__dirname, "../.env.production") });
} else {
  config({ path: resolve(__dirname, "../.env") });
}

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import axios from "axios";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const DATA_URL = "https://raw.githubusercontent.com/datasets/harmonized-system/master/data/harmonized-system.csv";

function parseCSV(text: string) {
  const lines: string[] = [];
  let currentLine = "";
  let insideQuotes = false;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === '\n' && !insideQuotes) {
      lines.push(currentLine);
      currentLine = "";
    } else {
      currentLine += char;
    }
  }
  if (currentLine) lines.push(currentLine);
  
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',');
  const data: Record<string, string>[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const values = line.split(',');
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h.trim()] = (values[idx] || '').replace(/^"|"$/g, '').trim();
    });
    data.push(row);
  }
  return data;
}

async function main() {
  console.log("═══════════════════════════════════════");
  console.log("📥 真实海关底库灌浆启动");
  console.log("═══════════════════════════════════════");

  console.log("⬇️ 正在下载开源海关数据...");
  const { data: csvString } = await axios.get(DATA_URL);
  
  const rows = parseCSV(csvString);
  console.log(`✅ 解析完成，共 ${rows.length} 条真实数据。`);

  // Prepare for Prisma
  const records = rows.map(row => {
    const code = (row.hscode || "").trim();
    const desc = (row.description || "").trim();
    const level = parseInt(row.level || "6", 10); 
    
    return {
      code: code,
      level: isNaN(level) ? 6 : level,
      description: desc, 
      descriptionEn: desc,
      taxRate: null,
      notes: row.parent ? `上级编码: ${row.parent}` : null,
      category: row.section ? `Section ${row.section}` : null,
      isActive: true,
      parentId: null, // FK to id (cuid) requires 2-pass, skip for now
    };
  });

  // Batch insert
  const batchSize = 500;
  let inserted = 0;
  console.log("🚀 开始批量灌入数据库...");
  
  await prisma.hSCode.deleteMany({});

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    await prisma.hSCode.createMany({
      data: batch,
      skipDuplicates: true,
    });
    inserted += batch.length;
    if ((i / batchSize + 1) % 5 === 0) console.log(`  进度: ${Math.min(i + batchSize, records.length)}/${records.length}`);
  }

  console.log(`\n✅ 真实数据灌浆完成！共灌入 ${inserted} 条。`);
  const finalCount = await prisma.hSCode.count();
  console.log(`📈 当前 HsCode 表总量: ${finalCount}`);
  
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("💥 导入失败:", e);
  process.exit(1);
});
