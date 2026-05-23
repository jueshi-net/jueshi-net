import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const dbUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_eL9DhSpQHZ5a@ep-morning-sun-amgb7w40-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&pgbouncer=true';
const adapter = new PrismaPg({ connectionString: dbUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  const users = await prisma.user.findMany({ take: 10, select: { id: true, email: true, name: true, createdAt: true } });
  console.log(`Total users: ${users.length}`);
  console.log(JSON.stringify(users, null, 2));
  await prisma.$disconnect();
}
main().catch(e => { console.error(e.message); process.exit(1); });
