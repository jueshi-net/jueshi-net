const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  try {
    await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS homepage_configs (id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, key TEXT UNIQUE NOT NULL, value_json JSONB NOT NULL, updated_by TEXT, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW())`);
    await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS tool_metric_dailies (id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, tool_slug TEXT NOT NULL, date DATE NOT NULL, views INT DEFAULT 0, clicks INT DEFAULT 0, saves INT DEFAULT 0, favorites INT DEFAULT 0, UNIQUE(tool_slug, date))`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_tmd_slug ON tool_metric_dailies(tool_slug)`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_tmd_date ON tool_metric_dailies(date)`);
    console.log('Tables created successfully');
  } catch(e) { console.error(e.message); }
  finally { await prisma.$disconnect(); }
}
run();
