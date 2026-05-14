import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import SearchBar from '@/components/navigation/search-bar';
import NavSidebar from '@/components/navigation/nav-sidebar';
import { CategorySection } from '@/components/navigation/category-section';
import ThemeToggle from '@/components/navigation/theme-toggle';
import ScrollToTop from '@/components/navigation/scroll-to-top';
import { FolderOpen, Link2, TrendingUp, AlertTriangle } from 'lucide-react';

export const metadata: Metadata = {
  title: '网址导航 - 海外百宝箱',
  description: '海外华人常用网站分类收录：物流快递、生活资源、电商经营、工具服务',
};

export default async function NavPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let categories: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let linksByCategory: any[] = [];
  let totalLinks = 0;
  let totalCategories = 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let topLinks: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let sidebarCategoryData: any[] = [];
  let dbError: string | null = null;

  try {
    // Optimized: single query for all categories with link counts
    categories = await prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }],
      include: { _count: { select: { links: true } } },
    });

    // Single query for all links with categories
    linksByCategory = await prisma.category.findMany({
      where: { links: { some: { status: "active" } } },
      orderBy: [{ sortOrder: "asc" }],
      include: {
        links: {
          where: { status: "active" },
          orderBy: [{ clicks: "desc" }, { sortOrder: "asc" }],
        },
      },
    });

    // Optimized: single count query
    totalLinks = await prisma.linkItem.count({ where: { status: "active" } });
    totalCategories = categories.length;
    topLinks = await prisma.linkItem.findMany({
      where: { status: 'active' },
      orderBy: [{ clicks: 'desc' }],
      take: 8,
      select: { id: true, title: true, url: true, description: true, icon: true, clicks: true },
    });

    const categorySlugs = categories.map(c => ({
      slug: c.slug,
      name: c.name,
      icon: c.icon || undefined,
    }));

    const sidebarCategories = await prisma.category.findMany({
      orderBy: [{ sortOrder: 'asc' }],
      where: { parentId: null },
      include: {
        _count: { select: { links: true } },
        children: {
          orderBy: [{ sortOrder: 'asc' }],
          include: { _count: { select: { links: true } } },
        },
      },
    });

    sidebarCategoryData = sidebarCategories.map(c => ({
      id: c.id,
      name: c.name,
      icon: c.icon || undefined,
      linkCount: c._count.links,
      children: c.children.map(child => ({
        id: child.id,
        name: child.name,
        linkCount: child._count.links,
      })),
    }));

    return (
      <>
        <NavSidebar categories={sidebarCategoryData} />

        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 md:ml-56 transition-all">
          {/* Hero Header */}
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white">
            <div className="max-w-6xl mx-auto px-4 py-10 text-center">
              <h1 className="text-3xl md:text-4xl font-bold mb-3">🌐 网址导航</h1>
              <p className="text-blue-100 text-lg max-w-2xl mx-auto mb-6">
                分类收录全球物流、快递、船公司、电商、关务、支付等实用网站
              </p>
              <div className="flex justify-center gap-6 text-sm">
                <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full">
                  <Link2 className="w-4 h-4" />
                  {totalLinks} 个网站
                </span>
                <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full">
                  <FolderOpen className="w-4 h-4" />
                  {totalCategories} 个分类
                </span>
              </div>
            </div>
          </div>

          <div className="max-w-6xl mx-auto px-4 -mt-4">
            {/* Search Bar */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
              <SearchBar categories={categorySlugs} />
            </div>

            {/* Top Links */}
            {topLinks.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 mb-6">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-orange-500" />
                  热门网站
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                  {topLinks.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-col items-center text-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform overflow-hidden relative">
                        <Link2 className="w-5 h-5 text-blue-600 dark:text-blue-400 absolute" />
                        {link.url.startsWith('http') && (
                          <img
                            src={`https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(link.url)}&size=32`}
                            alt=""
                            className="w-6 h-6 object-contain relative z-10"
                            loading="lazy"
                          />
                        )}
                      </div>
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate w-full group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {link.title}
                      </span>
                      <span className="text-[10px] text-gray-400 mt-0.5">{link.clicks} 次点击</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Categories + Links (with collapsible) */}
            <div className="space-y-4 pb-10">
              {linksByCategory.map((category) => {
                const catData = {
                  id: category.id,
                  name: category.name,
                  icon: category.icon || undefined,
                  linkCount: category.links.length,
                };
                const linkData = category.links.map((link: any) => ({
                  id: link.id,
                  title: link.title,
                  description: link.description || undefined,
                  icon: link.icon || undefined,
                  url: link.url,
                  color: category.color || undefined,
                }));

                return (
                  <div
                    key={category.id}
                    id={`category-${category.id}`}
                    className="scroll-mt-20"
                  >
                    <CategorySection category={catData} links={linkData} />
                  </div>
                );
              })}
            </div>

            {/* Empty State */}
            {linksByCategory.length === 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center text-gray-400 dark:text-gray-500 mb-10">
                <FolderOpen className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">暂无导航链接</h3>
                <p>管理员正在添加更多实用网站</p>
              </div>
            )}
          </div>
        </div>

        {/* 浮动按钮 */}
        <ThemeToggle />
        <ScrollToTop />
      </>
    );
  } catch (error) {
    dbError = error instanceof Error ? error.message : 'Unknown error';
    return (
      <>
        <NavSidebar categories={[]} />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 md:ml-56 transition-all">
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white">
            <div className="max-w-6xl mx-auto px-4 py-10 text-center">
              <h1 className="text-3xl md:text-4xl font-bold mb-3">🌐 网址导航</h1>
              <p className="text-blue-100 text-lg max-w-2xl mx-auto mb-6">
                分类收录全球物流、快递、船公司、电商、关务、支付等实用网站
              </p>
            </div>
          </div>
          <div className="max-w-6xl mx-auto px-4 -mt-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-red-200 dark:border-red-800 p-12 text-center mb-10">
              <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">数据加载失败</h3>
              <p className="text-gray-500 dark:text-gray-400">数据库连接异常，请稍后再试</p>
            </div>
          </div>
        </div>
        <ThemeToggle />
        <ScrollToTop />
      </>
    );
  }
}

export const dynamic = 'force-dynamic';
