const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Try to load env manually
const envPath = path.join(__dirname, '..', '.env.production');
if (fs.existsSync(envPath)) {
  const envConfig = dotenv.parse(fs.readFileSync(envPath));
  process.env.DATABASE_URL = envConfig.DATABASE_URL;
}

const { PrismaClient } = require('@prisma/client');
const rawUrl = process.env.DATABASE_URL;
if (!rawUrl) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

// PrismaClient will automatically read DATABASE_URL from process.env
const prisma = new PrismaClient({});

async function main() {
  try {
    // Use raw query to check tables
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    const tableNames = tables.map(t => t.table_name);
    const checks = [
      'homepage_configs',
      'tool_metric_dailies',
      'ad_campaigns',
      'event_logs',
      'tool_document_drafts',
      'user_company_profiles',
      'tools',
      'topics',
      'users'
    ];

    console.log("=== PRODUCTION DB TABLE CHECK ===");
    for (const t of checks) {
      const exists = tableNames.includes(t);
      console.log(`- ${t}: ${exists ? 'EXISTS' : 'MISSING'}`);
    }
  } catch (e) {
    console.error("Error:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
