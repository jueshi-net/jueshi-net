"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Globe, ChevronDown } from "lucide-react";
import FavoriteLinkCard from "@/components/navigation/favorite-link-card";

// 拼音匹配
import PinyinMatch from "pinyin-match";

interface LinkItem {
  id: string;
  title: string;
  url: string;
  description: string | null;
  icon: string | null;
  categoryId: string | null;
  category?: { id: string; name: string; slug: string };
}

interface SearchBarProps {
  categories: { slug: string; name: string; icon?: string }[];
}

// 搜索引擎配置
const ENGINES = [
  { id: "local", name: "本地搜索", icon: Search, color: "text-blue-500" },
  { id: "google", name: "Google", icon: Globe, color: "text-red-500" },
  { id: "bing", name: "Bing", icon: Globe, color: "text-blue-600" },
  { id: "baidu", name: "百度", icon: Globe, color: "text-gray-600" },
];

// 搜索引擎 URL 模板
const ENGINE_URLS: Record<string, string> = {
  google: "https://www.google.com/search?q=",
  bing: "https://www.bing.com/search?q=",
  baidu: "https://www.baidu.com/s?wd=",
};

export default function SearchBar({ categories }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [results, setResults] = useState<LinkItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // 从 localStorage 读取上次选择的引擎
  const [activeEngine, setActiveEngine] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("search-engine") || "local";
    }
    return "local";
  });

  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 点击外部关闭下拉
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Ctrl+K / Cmd+K 聚焦搜索框
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // 拼音匹配搜索
  const pinyinMatch = (text: string, keyword: string): boolean => {
    if (!text || !keyword) return false;
    return PinyinMatch.match(text, keyword) !== false;
  };

  const handleSearch = async () => {
    if (!query.trim() && activeCategory === "all") {
      setResults([]);
      setHasSearched(false);
      return;
    }

    // 外部搜索引擎直接跳转
    if (activeEngine !== "local" && query.trim()) {
      const url = ENGINE_URLS[activeEngine] + encodeURIComponent(query.trim());
      window.open(url, "_blank", "noopener,noreferrer");
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      if (activeCategory !== "all") params.set("category", activeCategory);

      const res = await fetch(`/api/search?${params}`);
      const data = await res.json();
      let serverResults = data.data || [];

      // 本地搜索结果 + 拼音匹配补充
      if (query.trim()) {
        // 将拼音匹配但服务端未返回的结果补充进来
        // 这里简化处理：客户端对已有结果做拼音高亮
      }

      setResults(serverResults);
    } catch {
      console.error("Search failed");
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const clearSearch = () => {
    setQuery("");
    setActiveCategory("all");
    setResults([]);
    setHasSearched(false);
  };

  const selectEngine = (engineId: string) => {
    setActiveEngine(engineId);
    localStorage.setItem("search-engine", engineId);
    setShowDropdown(false);
  };

  const ActiveEngineIcon = ENGINES.find(e => e.id === activeEngine)?.icon || Search;
  const activeEngineColor = ENGINES.find(e => e.id === activeEngine)?.color || "text-gray-400";

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Search Input */}
      <div className="relative mb-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            {/* 搜索引擎选择按钮 */}
            <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className={`p-1 rounded-md hover:bg-gray-100 transition-colors ${activeEngineColor}`}
                title="切换搜索引擎"
              >
                <ActiveEngineIcon className="w-5 h-5" />
              </button>

              {/* 下拉菜单 */}
              {showDropdown && (
                <div className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 w-40 z-50">
                  {ENGINES.map(engine => {
                    const Icon = engine.icon;
                    return (
                      <button
                        key={engine.id}
                        onClick={() => selectEngine(engine.id)}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                          activeEngine === engine.id ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600" : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${engine.color}`} />
                        <span>{engine.name}</span>
                        {activeEngine === engine.id && (
                          <span className="ml-auto text-blue-600">✓</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                activeEngine === "local"
                  ? "搜索网址、工具或关键词... (Ctrl+K)"
                  : `使用 ${ENGINES.find(e => e.id === activeEngine)?.name} 搜索...`
              }
              className="w-full pl-12 pr-10 py-3.5 bg-white dark:bg-gray-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base shadow-sm border border-gray-200 dark:border-gray-700"
            />
            {query && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-semibold transition-colors shadow-sm"
          >
            {isSearching ? "搜索中..." : activeEngine === "local" ? "搜索" : "跳转"}
          </button>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              activeCategory === "all"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
            }`}
          >
            全部
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setActiveCategory(cat.slug)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                activeCategory === cat.slug
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Search Results */}
      {hasSearched && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              找到 {results.length} 个结果
              {query && <span className="ml-1">「{query}」</span>}
            </h3>
            <button onClick={clearSearch} className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
              清除搜索
            </button>
          </div>
          {results.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {results.map((link) => (
                <FavoriteLinkCard
                  key={link.id}
                  id={link.id}
                  title={link.title}
                  description={link.description || undefined}
                  icon={link.icon || undefined}
                  url={link.url}
                  color="blue"
                  highlightKeyword={query}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 dark:text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
              <p>没有找到匹配的结果</p>
              <p className="text-sm mt-1">试试其他关键词或切换搜索引擎</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
