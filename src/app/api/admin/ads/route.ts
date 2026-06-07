import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/permissions';
import { prisma } from '@/lib/prisma';

// GET /api/admin/ads — 获取所有广告
export async function GET() {
  const res = await requireAdmin();
  if ('error' in res) return res.error;

  try {
    const campaigns = await prisma.adCampaign.findMany({
      orderBy: [{ createdAt: 'desc' }],
    });
    return NextResponse.json({ success: true, data: campaigns });
  } catch (e) {
    return NextResponse.json({ success: false, error: '获取广告列表失败' }, { status: 500 });
  }
}

// POST /api/admin/ads — 创建广告
export async function POST(req: NextRequest) {
  const res = await requireAdmin();
  if ('error' in res) return res.error;

  try {
    const body = await req.json();

    if (!body.title?.trim()) {
      return NextResponse.json({ success: false, error: '广告名称不能为空' }, { status: 400 });
    }
    if (!Array.isArray(body.placements) || body.placements.length === 0) {
      return NextResponse.json({ success: false, error: '至少选择一个投放位置' }, { status: 400 });
    }

    // 直投广告校验
    if (body.adType === 'DIRECT') {
      if (!body.imageUrl?.trim()) {
        return NextResponse.json({ success: false, error: '直投广告需要图片 URL' }, { status: 400 });
      }
    }
    // 网盟广告校验
    if (body.adType === 'NETWORK') {
      if (!body.codeSnippet?.trim()) {
        return NextResponse.json({ success: false, error: '网盟广告需要填写代码片段' }, { status: 400 });
      }
    }

    const campaign = await prisma.adCampaign.create({
      data: {
        title: body.title.trim(),
        adType: body.adType || 'DIRECT',
        imageUrl: body.imageUrl?.trim() || null,
        targetUrl: body.targetUrl?.trim() || null,
        codeSnippet: body.codeSnippet || null,
        placements: body.placements,
        targetCountries: body.targetCountries || [],
        isActive: body.isActive !== false,
        priority: body.priority || 0,
        startDate: body.startDate ? new Date(body.startDate) : new Date(),
        endDate: body.endDate ? new Date(body.endDate) : null,
      },
    });

    return NextResponse.json({ success: true, data: campaign });
  } catch (e: any) {
    if (e.code === 'P2002') {
      return NextResponse.json({ success: false, error: '广告名称已存在' }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: '创建广告失败' }, { status: 500 });
  }
}

// PUT /api/admin/ads — 更新广告 (body 中需要 id)
export async function PUT(req: NextRequest) {
  const res = await requireAdmin();
  if ('error' in res) return res.error;

  try {
    const body = await req.json();

    if (!body.id) {
      return NextResponse.json({ success: false, error: '缺少广告 ID' }, { status: 400 });
    }

    const data: Record<string, any> = {};
    if (body.title !== undefined) data.title = body.title.trim();
    if (body.adType !== undefined) data.adType = body.adType;
    if (body.imageUrl !== undefined) data.imageUrl = body.imageUrl?.trim() || null;
    if (body.targetUrl !== undefined) data.targetUrl = body.targetUrl?.trim() || null;
    if (body.codeSnippet !== undefined) data.codeSnippet = body.codeSnippet || null;
    if (body.placements !== undefined) data.placements = body.placements;
    if (body.targetCountries !== undefined) data.targetCountries = body.targetCountries;
    if (body.isActive !== undefined) data.isActive = body.isActive;
    if (body.priority !== undefined) data.priority = body.priority;
    if (body.startDate !== undefined) data.startDate = new Date(body.startDate);
    if (body.endDate !== undefined) data.endDate = body.endDate ? new Date(body.endDate) : null;

    const campaign = await prisma.adCampaign.update({
      where: { id: body.id },
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
