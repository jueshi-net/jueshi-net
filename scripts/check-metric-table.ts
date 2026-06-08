import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const tables = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name LIKE '%metric%'`;
  console.log('metric tables:', JSON.stringify(tables, null, 2));
  
  const migrations = await prisma.$queryRaw`SELECT migration_name, started_at, finished_at FROM _prisma_migrations ORDER BY started_at`;
  console.log('migrations:', JSON.stringify(migrations, null, 2));
  
  await prisma.$disconnect();
}

main().catch(console.error);
