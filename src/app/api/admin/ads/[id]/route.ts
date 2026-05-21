import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/permissions';
import { prisma } from '@/lib/prisma';

// PATCH /api/admin/ads/[id] — 更新单个字段（如 toggle isActive）
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const res = await requireAdmin();
  if ('error' in res) return res.error;

  try {
    const { id } = await params;
    const body = await req.json();

    const data: Record<string, any> = {};
    if (body.isActive !== undefined) data.isActive = body.isActive;
    if (body.title !== undefined) data.title = body.title.trim();
    if (body.adType !== undefined) data.adType = body.adType;
    if (body.imageUrl !== undefined) data.imageUrl = body.imageUrl?.trim() || null;
    if (body.targetUrl !== undefined) data.targetUrl = body.targetUrl?.trim() || null;
    if (body.codeSnippet !== undefined) data.codeSnippet = body.codeSnippet || null;
    if (body.placements !== undefined) data.placements = body.placements;
    if (body.targetCountries !== undefined) data.targetCountries = body.targetCountries;
    if (body.priority !== undefined) data.priority = body.priority;
    if (body.startDate !== undefined) data.startDate = new Date(body.startDate);
    if (body.endDate !== undefined) data.endDate = body.endDate ? new Date(body.endDate) : null;

    const campaign = await prisma.adCampaign.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, data: campaign });
  } catch (e: any) {
    if (e.code === 'P2025') {
      return NextResponse.json({ success: false, error: '广告不存在' }, { status: 404 });
    }
    return NextResponse.json({ success: false, error: '更新广告失败' }, { status: 500 });
  }
}

// DELETE /api/admin/ads/[id] — 删除广告
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const res = await requireAdmin();
  if ('error' in res) return res.error;

  try {
    const { id } = await params;
    await prisma.adCampaign.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    if (e.code === 'P2025') {
      return NextResponse.json({ success: false, error: '广告不存在' }, { status: 404 });
    }
    return NextResponse.json({ success: false, error: '删除广告失败' }, { status: 500 });
  }
}
