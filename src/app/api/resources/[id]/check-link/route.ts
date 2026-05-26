import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 查找资源
    const resource = await prisma.resource.findUnique({
      where: { id },
      select: { url: true, name: true },
    });

    if (!resource) {
      return NextResponse.json({ success: false, error: '资源不存在' }, { status: 404 });
    }

    // 检测链接可用性
    let httpStatus: number | null = null;
    let ok = false;
    let error: string | undefined;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const resp = await fetch(resource.url, {
        method: 'HEAD',
        redirect: 'follow',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; JueshiBot/1.0; +https://jueshi.net)',
        },
      });

      clearTimeout(timeoutId);
      httpStatus = resp.status;
      ok = resp.status < 400;
    } catch (err: any) {
      // 尝试 GET 回退（有些服务器不支持 HEAD）
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const resp = await fetch(resource.url, {
          method: 'GET',
          redirect: 'follow',
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; JueshiBot/1.0; +https://jueshi.net)',
          },
        });

        clearTimeout(timeoutId);
        httpStatus = resp.status;
        ok = resp.status < 400;
      } catch (err2: any) {
        error = err2.name === 'AbortError' ? '超时' : (err2.message || '连接失败');
      }
    }

    // 更新 checkFailCount 和 lastChecked
    const newFailCount = ok ? 0 : (resource ? 1 : 0);
    await prisma.resource.update({
      where: { id },
      data: {
        lastChecked: new Date(),
      },
    });

    return NextResponse.json({ success: true, httpStatus, ok, error });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
