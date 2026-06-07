const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load env
const envPath = path.join(__dirname, '..', '.env.production');
if (fs.existsSync(envPath)) {
  const envConfig = dotenv.parse(fs.readFileSync(envPath));
  process.env.DATABASE_URL = envConfig.DATABASE_URL;
}

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("DATABASE_URL missing");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString: dbUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  const tablesToCheck = ['homepage_configs', 'tool_metric_dailies', 'event_logs', 'ad_campaigns'];
  
  console.log("=== TABLE VERIFICATION ===");
  for (const table of tablesToCheck) {
    try {
      // Attempt a count query to verify existence and access
      // We use $queryRawUnsafe for direct table check or try a model query if mapped
      // Since model names might differ, checking information_schema is safer
      const result = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = ${table}
        ) as exists
      `;
      const exists = result[0]?.exists;
      console.log(`${table}: ${exists ? 'EXISTS' : 'MISSING'}`);
      
      if (exists && table === 'homepage_configs') {
        const count = await prisma.$queryRaw`SELECT count(*) from homepage_configs`;
        console.log(`  -> Records: ${count[0]?.count}`);
      }
      if (exists && table === 'event_logs') {
        const count = await prisma.$queryRaw`SELECT count(*) from event_logs`;
        console.log(`  -> Records: ${count[0]?.count}`);
      }
    } catch (e) {
      console.log(`${table}: ERROR - ${e.message}`);
    }
  }
  await prisma.$disconnect();
}

main();
