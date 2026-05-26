"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, ChevronDown, Menu, X, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface Subcategory {
  id: string;
  name: string;
  linkCount: number;
}

interface Category {
  id: string;
  name: string;
  icon?: string;
  linkCount: number;
  children?: Subcategory[];
}

interface NavSidebarProps {
  categories: Category[];
}

export default function NavSidebar({ categories }: NavSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [scrollProgress, setScrollProgress] = useState(0);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // 滚动监听：高亮当前分类 + 计算进度
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);

      // 找到当前可见的分类
      for (let i = categories.length - 1; i >= 0; i--) {
        const el = document.getElementById(`category-${categories[i].id}`);
        if (el && el.getBoundingClientRect().top <= 150) {
          setActiveId(categories[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [categories]);

  // 点击分类跳转
  const scrollToCategory = (id: string) => {
    const el = document.getElementById(`category-${id}`);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: "smooth" });
    }
    setMobileOpen(false);
  };

  // 展开/收起分类
  const toggleExpand = (e: React.MouseEvent, catId: string) => {
    e.stopPropagation();
    e.preventDefault();
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(catId)) {
        next.delete(catId);
      } else {
        next.add(catId);
      }
      return next;
    });
  };

  // 返回顶部
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setMobileOpen(false);
  };

  // 有子分类的类别
  const categoriesWithChildren = categories.filter(c => c.children && c.children.length > 0);
  const simpleCategories = categories.filter(c => !c.children || c.children.length === 0);

  return (
    <>
      {/* 滚动进度条 */}
      <div className="fixed top-0 left-0 right-0 h-0.5 z-[60] bg-gray-200">
        <div
          className="h-full bg-blue-500 transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* 移动端汉堡菜单按钮 */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 bg-white rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* 移动端遮罩 */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* 侧边栏 */}
      <div
        ref={sidebarRef}
        className={cn(
          "fixed top-0 left-0 h-full z-50 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-300 flex flex-col",
          "md:top-14",
          collapsed ? "md:w-16" : "md:w-56",
          mobileOpen ? "w-72 translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* 侧边栏头部 */}
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between shrink-0">
          {!collapsed && (
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-blue-500" />
              分类导航
            </h3>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors ml-auto"
            title={collapsed ? "展开" : "收起"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* 分类列表 */}
        <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
          {/* 热门/置顶 */}
          <button
            onClick={scrollToTop}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
              activeId === null
                ? "bg-blue-50 text-blue-600 font-medium"
                : "text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
            )}
          >
            <span className="text-lg">🔥</span>
            {!collapsed && <span className="truncate">热门网站</span>}
          </button>

          {/* 分隔线 */}
          <div className="my-2 border-t border-gray-100 dark:border-gray-700" />

          {/* 有子分类的类别（可折叠） */}
          {categoriesWithChildren.map((cat) => {
            const isExpanded = expandedCategories.has(cat.id);
            const isActive = activeId === cat.id;

            return (
              <div key={cat.id}>
                <button
                  onClick={(e) => {
                    if (!collapsed) toggleExpand(e, cat.id);
                    scrollToCategory(cat.id);
                  }}
                  className={cn(
                    "w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors relative group",
                    isActive && !isExpanded
                      ? "bg-blue-50 text-blue-600 font-medium"
                      : "text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                  )}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-600 rounded-r" />
                  )}
                  {cat.icon && <span className="text-lg shrink-0">{cat.icon}</span>}
                  {!collapsed && (
                    <>
                      <span className="truncate flex-1 text-left">{cat.name}</span>
                      <span className="text-xs text-gray-400 shrink-0">{cat.linkCount}</span>
                      {/* 折叠箭头 */}
                      <ChevronDown
                        className={cn(
                          "w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform duration-200",
                          isExpanded ? "rotate-180" : ""
                        )}
                      />
                    </>
                  )}
                </button>

                {/* 子分类列表（动画展开/收起） */}
                {!collapsed && cat.children && cat.children.length > 0 && (
                  <div
                    className={cn(
                      "overflow-hidden transition-all duration-300 ease-in-out",
                      isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    )}
                  >
                    <div className="pl-4 pr-2 space-y-0.5">
                      {cat.children.map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => scrollToCategory(sub.id)}
                          className={cn(
                            "w-full flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg transition-colors",
                            activeId === sub.id
                              ? "bg-blue-50 text-blue-600 font-medium"
                              : "text-gray-500 hover:bg-gray-50 hover:text-gray-700 dark:hover:bg-gray-800"
                          )}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />
                          <span className="truncate flex-1 text-left">{sub.name}</span>
                          <span className="text-[10px] text-gray-400">{sub.linkCount}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* 简单分类（无子分类） */}
          {simpleCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => scrollToCategory(cat.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors relative",
                activeId === cat.id
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
              )}
            >
              {activeId === cat.id && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-600 rounded-r" />
              )}
              {cat.icon && <span className="text-lg shrink-0">{cat.icon}</span>}
              {!collapsed && (
                <>
                  <span className="truncate flex-1 text-left">{cat.name}</span>
                  <span className="text-xs text-gray-400 shrink-0">{cat.linkCount}</span>
                </>
              )}
            </button>
          ))}
        </div>

        {/* 侧边栏底部 */}
        {!collapsed && (
          <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-400 shrink-0">
            {categories.length} 个分类
          </div>
        )}
      </div>
    </>
  );
}
