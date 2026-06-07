import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-guard';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const admin = await requireAdmin();
  if (admin instanceof NextResponse) return admin;

  const subscriptions = await prisma.subscription.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json(subscriptions);
}
