import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // 查询 6.38 相关事件
  const events = await prisma.eventLog.findMany({
    where: {
      OR: [
        { toolName: { in: ['postal-code', 'address-formatter', 'hs-code', 'exchange-rate'] } },
        { eventType: { contains: 'task' } },
      ]
    },
    orderBy: { createdAt: 'desc' },
    take: 20
  });

  console.log('=== EventLog 查询结果 ===');
  console.log(`总计: ${events.length} 条`);
  console.log('');
  
  events.forEach(e => {
    console.log(`- ${e.eventType} | ${e.toolName || '-'} | ${e.action || '-'} | ${e.path || '-'} | ${e.createdAt?.toISOString() || '-'}`);
  });

  // 统计各工具事件数
  const stats = await prisma.eventLog.groupBy({
    by: ['toolName'],
    where: {
      toolName: { in: ['postal-code', 'address-formatter', 'hs-code', 'exchange-rate'] }
    },
    _count: { _all: true }
  });

  console.log('\n=== 各工具事件统计 ===');
  stats.forEach(s => {
    console.log(`${s.toolName}: ${s._count._all} 条`);
  });

  await prisma.$disconnect();
  await pool.end();
}

main().catch(e => { console.error(e.message); process.exit(1); });
