"use client";
import { useState, useEffect, useCallback } from "react";
import { Search, X, Link2, FileText, Wrench, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface SearchResult {
  title: string;
  path: string;
  icon: React.ReactNode;
  category: string;
}

const staticResults: SearchResult[] = [
  { title: "首页", path: "/", icon: <Link2 className="w-4 h-4" />, category: "页面" },
  { title: "搜索链接", path: "/search", icon: <Search className="w-4 h-4" />, category: "页面" },
  { title: "工具集合", path: "/tools", icon: <Wrench className="w-4 h-4" />, category: "页面" },
  { title: "体积计算器", path: "/tools/calculator", icon: <Wrench className="w-4 h-4" />, category: "工具" },
  { title: "收据生成器", path: "/tools/receipt", icon: <Wrench className="w-4 h-4" />, category: "工具" },
  { title: "发票生成器", path: "/tools/invoice", icon: <Wrench className="w-4 h-4" />, category: "工具" },
  { title: "报价单生成器", path: "/tools/quote", icon: <Wrench className="w-4 h-4" />, category: "工具" },
  { title: "博客文章", path: "/blog", icon: <FileText className="w-4 h-4" />, category: "页面" },
  { title: "定价方案", path: "/pricing", icon: <Link2 className="w-4 h-4" />, category: "页面" },
  { title: "更新日志", path: "/changelog", icon: <Link2 className="w-4 h-4" />, category: "页面" },
  { title: "帮助中心", path: "/help", icon: <Link2 className="w-4 h-4" />, category: "页面" },
  { title: "API 文档", path: "/api-docs", icon: <Link2 className="w-4 h-4" />, category: "页面" },
  { title: "通知中心", path: "/notifications", icon: <Link2 className="w-4 h-4" />, category: "页面" },
  { title: "管理面板", path: "/admin", icon: <Link2 className="w-4 h-4" />, category: "后台" },
  { title: "链接管理", path: "/admin/links", icon: <Link2 className="w-4 h-4" />, category: "后台" },
  { title: "文章管理", path: "/admin/cms", icon: <FileText className="w-4 h-4" />, category: "后台" },
];

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => {
    setOpen(false);
    setQuery("");
    setSelectedIndex(0);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(prev => !prev);
      }
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [handleClose]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const filtered = query
    ? staticResults.filter(r =>
        r.title.toLowerCase().includes(query.toLowerCase()) ||
        r.path.toLowerCase().includes(query.toLowerCase()) ||
        r.category.toLowerCase().includes(query.toLowerCase())
      )
    : staticResults;

  const selectResult = (path: string) => {
    router.push(path);
    handleClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      selectResult(filtered[selectedIndex].path);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={handleClose} />

      {/* Palette */}
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-700">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="搜索页面、工具、功能..."
            className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 outline-none text-sm"
            autoFocus
          />
          <kbd className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-400">ESC</kbd>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">无匹配结果</div>
          ) : (
            filtered.map((result, idx) => (
              <button
                key={result.path + idx}
                onClick={() => selectResult(result.path)}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                  idx === selectedIndex ? "bg-blue-50 dark:bg-blue-900/20" : "hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <span className="text-gray-400">{result.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{result.title}</p>
                  <p className="text-xs text-gray-400 truncate">{result.path}</p>
                </div>
                <span className="text-xs text-gray-400 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">{result.category}</span>
                <ArrowRight className="w-4 h-4 text-gray-300" />
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700 flex items-center gap-4 text-xs text-gray-400">
          <span>↑↓ 导航</span>
          <span>↵ 选择</span>
          <span>ESC 关闭</span>
        </div>
      </div>
    </div>
  );
}
