import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { generateSlug, deduplicateLinks, getUniqueCategories } from '@/lib/bookmark-parser';

/**
 * POST /api/admin/import/bookmarks
 * 
 * Body: { html: string } - The raw bookmark HTML content
 * Returns: { preview, stats } - Preview of what will be imported
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: '未授权' }, { status: 403 });
  }

  const body = await req.json();
  const { html, mode = 'preview' } = body;

  if (!html) {
    return NextResponse.json({ error: '缺少书签HTML数据' }, { status: 400 });
  }

  // 解析书签
  const result = await parseBookmarkHtml(html);
  
  if (mode === 'preview') {
    return NextResponse.json({
      success: true,
      mode: 'preview',
      data: {
        categories: result.categories.length,
        links: result.links.length,
        preview: {
          categories: result.categories.slice(0, 20),
          links: result.links.slice(0, 30),
        }
      }
    });
  }

  // 实际导入
  const importResult = await importBookmarks(result, body);
  
  return NextResponse.json({
    success: true,
    mode: 'import',
    data: importResult,
  });
}

/**
 * Parse bookmark HTML and extract categories + links
 */
async function parseBookmarkHtml(html: string) {
  const categories: { name: string; slug: string; sortOrder: number }[] = [];
  const links: { title: string; url: string; description: string; categoryName: string; sortOrder: number }[] = [];

  // Simple regex-based parsing (works for all browser bookmark formats)
  const folderRegex = /<DT><H3[^>]*>(.*?)<\/H3>/gi;
  const linkRegex = /<DT><A[^>]*HREF="([^"]*)"[^>]*>(.*?)<\/A>/gi;
  const addDateRegex = /ADD_DATE="(\d+)"/i;

  // Extract folders
  let folderMatch;
  let currentFolder = '未分类';
  let folderOrder = 0;
  const seenFolders = new Set<string>();

  // Build a combined regex approach
  // Split by <DT> to process each item
  const dtSplit = html.split('<DT>');
  
  for (const dt of dtSplit) {
    // Check for folder (H3 tag)
    const h3Match = dt.match(/<H3[^>]*>(.*?)<\/H3>/i);
    if (h3Match) {
      const name = h3Match[1].trim();
      currentFolder = name || '未分类';
      
      if (!seenFolders.has(name.toLowerCase())) {
        seenFolders.add(name.toLowerCase());
        categories.push({
          name,
          slug: generateSlug(name),
          sortOrder: folderOrder++,
        });
      }
    }

    // Check for link (A tag with HREF)
    const aMatch = dt.match(/<A[^>]*HREF="([^"]*)"[^>]*>(.*?)<\/A>/i);
    if (aMatch) {
      const url = aMatch[1].trim();
      const title = aMatch[2].trim().replace(/<[^>]*>/g, '') || '未命名';

      if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
        links.push({
          title,
          url,
          description: '',
          categoryName: currentFolder,
          sortOrder: 0,
        });
      }
    }
  }

  // 确保"未分类"存在
  if (!categories.find(c => c.name === '未分类')) {
    categories.unshift({
      name: '未分类',
      slug: 'unclassified',
      sortOrder: 0,
    });
  }

  // 去重链接
  const uniqueLinks = deduplicateLinks(links.map(l => ({ title: l.title, url: l.url, folder: l.categoryName })));
  const linkMap = new Map<string, { title: string; url: string; folder: string }>();
  uniqueLinks.forEach(l => linkMap.set(l.url, l));

  // 重建链接数组（按原始顺序）
  const finalLinks: { title: string; url: string; description: string; categoryName: string; sortOrder: number }[] = [];
  const seenUrls = new Set<string>();

  for (const link of links) {
    if (!seenUrls.has(link.url)) {
      seenUrls.add(link.url);
      finalLinks.push(link);
    }
  }

  return { categories, links: finalLinks };
}

/**
 * Import parsed bookmarks into the database
 */
async function importBookmarks(
  parsed: { categories: { name: string; slug: string; sortOrder: number }[]; links: { title: string; url: string; description: string; categoryName: string; sortOrder: number }[] },
  options: { skipExisting?: boolean }
) {
  const results = {
    categoriesCreated: 0,
    categoriesSkipped: 0,
    linksCreated: 0,
    linksSkipped: 0,
    errors: [] as string[],
  };

  const skipExisting = options.skipExisting !== false;

  // Step 1: Create categories (or find existing)
  const categoryMap = new Map<string, string>(); // name -> id

  for (const cat of parsed.categories) {
    try {
      const existing = await prisma.category.findFirst({
        where: { OR: [{ name: cat.name }, { slug: cat.slug }] },
      });

      if (existing) {
        categoryMap.set(cat.name, existing.id);
        results.categoriesSkipped++;
      } else {
        const created = await prisma.category.create({
          data: {
            name: cat.name,
            slug: cat.slug,
            sortOrder: cat.sortOrder,
          },
        });
        categoryMap.set(cat.name, created.id);
        results.categoriesCreated++;
      }
    } catch (err: any) {
      results.errors.push(`分类 "${cat.name}": ${err.message}`);
    }
  }

  // Step 2: Create links
  for (const link of parsed.links) {
    try {
      const categoryId = categoryMap.get(link.categoryName);

      // Check if link already exists
      if (skipExisting) {
        const existing = await prisma.linkItem.findFirst({
          where: { url: link.url },
        });
        if (existing) {
          results.linksSkipped++;
          continue;
        }
      }

      await prisma.linkItem.create({
        data: {
          title: link.title,
          url: link.url,
          description: link.description || null,
          categoryId: categoryId || null,
          status: 'active',
        },
      });
      results.linksCreated++;
    } catch (err: any) {
      results.errors.push(`链接 "${link.title}": ${err.message}`);
    }
  }

  return results;
}
