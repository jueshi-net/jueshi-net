"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { CATEGORY_MAP } from "@/lib/tool-types";

interface ToolFilterBarProps {
  currentQuery?: string;
  currentCategory?: string;
  currentSort?: string;
  /** If provided, only show these category keys (hides empty categories) */
  presentCategories?: string[];
}

export default function ToolFilterBar({ currentQuery, currentCategory, currentSort, presentCategories }: ToolFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = createQueryString("q", e.target.value);
    router.push(`${pathname}?${q}`, { scroll: false });
  };

  const handleCategory = (cat: string) => {
    const q = createQueryString("cat", cat);
    router.push(`${pathname}?${q}`);
  };

  const handleSort = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const q = createQueryString("sort", e.target.value);
    router.push(`${pathname}?${q}`);
  };

  // Generate categories dynamically based on map + "all"
  // If presentCategories is provided, only show categories that have tools
  const allCategories = Object.entries(CATEGORY_MAP).map(([k, v]) => ({ key: k, label: v }));
  const filteredCategories = presentCategories
    ? allCategories.filter(c => presentCategories.includes(c.key))
    : allCategories;
  const categories = [{ key: "all", label: "全部" }, ...filteredCategories];

  return (
    <div className="bg-white border-b z-30 shadow-sm md:sticky md:top-[80px] md:z-30">
      <div className="max-w-6xl mx-auto px-4 py-3 space-y-3">
        {/* Search and Sort Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              defaultValue={currentQuery || ""}
              placeholder="搜索工具名称或描述..."
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-gray-500" />
            <select
              value={currentSort || "popular"}
              onChange={handleSort}
              className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white cursor-pointer"
            >
              <option value="popular">热门排序</option>
              <option value="latest">最新上线</option>
              <option value="saves">最多保存</option>
              <option value="favorites">最多收藏</option>
            </select>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => handleCategory(cat.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                currentCategory === cat.key
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
