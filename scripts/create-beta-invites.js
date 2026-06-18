const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createInviteCodes() {
  const codes = [
    { code: 'BETA2026-001', maxUses: 5, expiresAt: new Date('2026-07-18'), note: 'Beta 测试批次 1' },
    { code: 'BETA2026-002', maxUses: 5, expiresAt: new Date('2026-07-18'), note: 'Beta 测试批次 2' },
    { code: 'BETA2026-003', maxUses: 5, expiresAt: new Date('2026-07-18'), note: 'Beta 测试批次 3' }
  ];

  for (const c of codes) {
    try {
      const result = await prisma.inviteCode.create({
        data: {
          code: c.code,
          maxUses: c.maxUses,
          usedCount: 0,
          isActive: true,
          expiresAt: c.expiresAt,
          note: c.note,
          createdBy: 'system'
        }
      });
      console.log('Created:', result.code);
    } catch (e) {
      console.error('Error creating', c.code, ':', e.message);
    }
  }

  await prisma.$disconnect();
}

createInviteCodes().catch(console.error);
