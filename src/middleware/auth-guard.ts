import { prisma } from '@/lib/prisma';

export async function requireAdmin(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { role: true }
  });

  if (!user || !['管理员', 'ADMIN', 'admin'].includes(user.role)) {
    throw new Error('无权访问');
  }

  return true;
}
