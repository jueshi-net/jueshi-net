import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/permissions';

export async function GET(req: NextRequest) {
  const adminCheck = await requireAdmin();
  if ('error' in adminCheck) return adminCheck.error;

  try {
    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') || 'json';
    const tables = searchParams.get('tables')?.split(',') || ['links'];

    const data: Record<string, any> = {};

    // Fetch requested tables
    for (const table of tables) {
      switch (table) {
        case 'links':
          data.links = await prisma.linkItem.findMany({
            include: { category: true, tags: { include: { tag: true } } },
            orderBy: { createdAt: 'desc' }
          });
          break;
        case 'categories':
          data.categories = await prisma.category.findMany({
            orderBy: { sortOrder: 'asc' }
          });
          break;
        case 'favorites':
          data.favorites = await prisma.favorite.findMany({
            include: { link: true },
            orderBy: { createdAt: 'desc' }
          });
          break;
        case 'memos':
          data.memos = await prisma.memo.findMany({
            orderBy: { createdAt: 'desc' }
          });
          break;
        case 'articles':
          data.articles = await prisma.article.findMany({
            where: { status: 'published' },
            orderBy: { createdAt: 'desc' }
          });
          break;
        case 'ads':
          data.ads = await prisma.adSlot.findMany({
            orderBy: { createdAt: 'desc' }
          });
          break;
      }
    }

    // Add metadata
    data._metadata = {
      exportedAt: new Date().toISOString(),
      version: '1.0',
      tables: tables,
      recordCount: Object.entries(data)
        .filter(([k]) => !k.startsWith('_'))
        .reduce((sum, [, v]) => sum + (Array.isArray(v) ? v.length : 0), 0)
    };

    // Generate response based on format
    switch (format) {
      case 'json':
        return new NextResponse(JSON.stringify(data, null, 2), {
          headers: {
            'Content-Type': 'application/json',
            'Content-Disposition': `attachment; filename="kjbxb-export-${Date.now()}.json"`
          }
        });

      case 'csv':
        // Convert first table to CSV
        const firstTable = tables[0];
        const rows = data[firstTable] || [];
        if (rows.length === 0) {
          return new NextResponse('No data', { status: 200 });
        }
        const headers = Object.keys(rows[0]).join(',');
        const csvRows = [headers, ...rows.map((row: any) => 
          Object.values(row).map(v => 
            typeof v === 'object' ? JSON.stringify(v) : `"${String(v).replace(/"/g, '""')}"`
          ).join(',')
        )].join('\n');
        
        return new NextResponse(csvRows, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="kjbxb-export-${Date.now()}.csv"`
          }
        });

      default:
        return new NextResponse(JSON.stringify(data, null, 2), {
          headers: {
            'Content-Type': 'application/json',
            'Content-Disposition': `attachment; filename="kjbxb-export-${Date.now()}.json"`
          }
        });
    }
  } catch (error) {
    console.error('Export error:', error);
    return new NextResponse(
      JSON.stringify({ error: '导出失败', details: (error as Error).message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  } finally {
    await prisma.$disconnect();
  }
}
