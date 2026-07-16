"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { Search } from "lucide-react";
import { CATEGORY_MAP } from "@/lib/tool-types";

interface ToolFilterBarProps {
  currentQuery?: string;
  currentCategory?: string;
  /** If provided, only show these category keys (hides empty categories) */
  presentCategories?: string[];
}

export default function ToolFilterBar({ currentQuery, currentCategory, presentCategories }: ToolFilterBarProps) {
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

  const allCategories = Object.entries(CATEGORY_MAP).map(([k, v]) => ({ key: k, label: v }));
  const filteredCategories = presentCategories
    ? allCategories.filter(c => presentCategories.includes(c.key))
    : allCategories;
  const categories = [{ key: "all", label: "全部" }, ...filteredCategories];

  return (
    <div className="space-y-4">
      {/* Search Box */}
      <div className="relative" data-testid="tool-search-container">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          data-testid="tool-search-input"
          defaultValue={currentQuery || ""}
          placeholder="搜索工具名称或描述..."
          onChange={handleSearch}
          className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all text-sm"
        />
      </div>

      {/* Category Chips */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => handleCategory(cat.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
              currentCategory === cat.key
                ? "bg-teal-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
}
