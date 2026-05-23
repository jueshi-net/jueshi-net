import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';

const dbUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_eL9DhSpQHZ5a@ep-morning-sun-amgb7w40-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&pgbouncer=true';
const adapter = new PrismaPg({ connectionString: dbUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = 'test@jueshi.net';
  const password = 'Test123456!';
  const name = '测试用户';

  // Check if exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    // Update password
    const hash = await bcrypt.hash(password, 10);
    await prisma.user.update({ where: { email }, data: { password: hash, name } });
    console.log(`✅ Updated existing user: ${email}`);
  } else {
    const hash = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: { email, name, password: hash, role: 'user' },
    });
    console.log(`✅ Created new user: ${email}`);
  }
  console.log(`📧 Email: ${email}`);
  console.log(`🔑 Password: ${password}`);
  await prisma.$disconnect();
}
main().catch(e => { console.error(e.message); process.exit(1); });
