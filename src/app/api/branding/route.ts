import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import * as path from 'path';

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'system-settings.json');

const DEFAULT_BRANDING = {
  logoUrl: '/brand/jueshi-logo-placeholder.svg',
  logoAlt: '绝世百宝箱 jueshi.net',
  logoWidth: 168,
  logoHeight: 42,
};

// GET /api/branding - 公开 API，供 Header 读取品牌配置
export async function GET() {
  try {
    const raw = await fs.readFile(SETTINGS_FILE, 'utf-8');
    const settings = JSON.parse(raw);
    const branding = settings.branding || DEFAULT_BRANDING;
    
    // 安全校验：logoUrl 必须是站内路径或 https
    if (branding.logoUrl) {
      const isSafe = branding.logoUrl.startsWith('/') || branding.logoUrl.startsWith('https://');
      if (!isSafe) {
        branding.logoUrl = DEFAULT_BRANDING.logoUrl;
      }
      // 禁止 javascript: 和 data: URL
      if (branding.logoUrl.startsWith('javascript:') || branding.logoUrl.startsWith('data:')) {
        branding.logoUrl = DEFAULT_BRANDING.logoUrl;
      }
    }
    
    // alt 不能为空
    if (!branding.logoAlt || branding.logoAlt.trim() === '') {
      branding.logoAlt = DEFAULT_BRANDING.logoAlt;
    }
    
    // width/height 范围校验
    if (branding.logoWidth < 50 || branding.logoWidth > 500) {
      branding.logoWidth = DEFAULT_BRANDING.logoWidth;
    }
    if (branding.logoHeight < 20 || branding.logoHeight > 200) {
      branding.logoHeight = DEFAULT_BRANDING.logoHeight;
    }
    
    return NextResponse.json(branding);
  } catch {
    return NextResponse.json(DEFAULT_BRANDING);
  }
}
