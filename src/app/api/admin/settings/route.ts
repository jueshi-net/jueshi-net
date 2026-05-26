import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { promises as fs } from 'fs';
import * as path from 'path';
import { isAdminRole } from '@/lib/auth/permissions';

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'system-settings.json');

async function readSettings() {
  try {
    const raw = await fs.readFile(SETTINGS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return {
      siteName: process.env.SITE_NAME || '海外百宝箱',
      siteDescription: process.env.SITE_DESCRIPTION || '海外华人的常用工具与资源平台',
      allowRegistration: process.env.ALLOW_REGISTRATION !== 'false',
      maintenanceMode: process.env.MAINTENANCE_MODE === 'true',
      maxLinksPerUser: parseInt(process.env.MAX_LINKS_PER_USER || '100'),
      emailEnabled: !!process.env.SMTP_HOST,
    };
  }
}

async function writeSettings(data: Record<string, unknown>) {
  await fs.mkdir(path.dirname(SETTINGS_FILE), { recursive: true });
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// GET /api/admin/settings - 获取系统设置
export async function GET() {
  const session = await auth();
  if (!session?.user || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: '未授权' }, { status: 403 });
  }

  const settings = await readSettings();
  return NextResponse.json(settings);
}

// POST /api/admin/settings - 更新系统设置
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: '未授权' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const current = await readSettings();
    const updated = { ...current, ...body };
    await writeSettings(updated);
    return NextResponse.json({
      success: true,
      message: '设置已保存并持久化',
      settings: updated,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '保存失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
