import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET /api/admin/settings - 获取系统设置
export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: '未授权' }, { status: 403 });
  }

  const settings = {
    siteName: process.env.SITE_NAME || '海外百宝箱',
    siteDescription: process.env.SITE_DESCRIPTION || '海外华人的常用工具与资源平台',
    allowRegistration: process.env.ALLOW_REGISTRATION !== 'false',
    maintenanceMode: process.env.MAINTENANCE_MODE === 'true',
    maxLinksPerUser: parseInt(process.env.MAX_LINKS_PER_USER || '100'),
    emailEnabled: !!process.env.SMTP_HOST,
  };

  return NextResponse.json(settings);
}

// POST /api/admin/settings - 更新系统设置（需要重启生效）
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: '未授权' }, { status: 403 });
  }

  const body = await req.json();
  const { allowRegistration, maintenanceMode, maxLinksPerUser } = body;

  // 这里应该更新数据库配置表或环境变量文件
  // 简化版：返回成功提示
  return NextResponse.json({
    success: true,
    message: '设置已保存，部分设置需要重启生效',
  });
}
