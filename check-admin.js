
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  try {
    const users = await prisma.user.findMany({ where: { role: 'admin' }, take: 5, select: { id: true, email: true, name: true, role: true } });
    console.log('Admin users:', JSON.stringify(users, null, 2));
    const total = await prisma.user.count();
    console.log('Total users:', total);
    await prisma.$disconnect();
  } catch (e) {
    console.error('Error:', e.message);
    await prisma.$disconnect();
  }
})();
