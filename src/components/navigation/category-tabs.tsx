"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import { FolderOpen } from "lucide-react";

interface Category {
  slug: string;
  name: string;
  icon?: string;
}

interface CategoryTabsProps {
  categories: Category[];
  defaultActive?: string;
  onChange?: (slug: string) => void;
}

export default function CategoryTabs({ categories, defaultActive = "all", onChange }: CategoryTabsProps) {
  const [active, setActive] = useState(defaultActive);

  const handleClick = (slug: string) => {
    setActive(slug);
    onChange?.(slug);
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
      <button
        onClick={() => handleClick("all")}
        className={cn(
          "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
          active === "all"
            ? "bg-blue-600 text-white shadow-sm"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        )}
      >
        <FolderOpen className="w-3.5 h-3.5" />
        全部
      </button>
      {categories.map((cat) => (
        <button
          key={cat.slug}
          onClick={() => handleClick(cat.slug)}
          className={cn(
            "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
            active === cat.slug
              ? "bg-blue-600 text-white shadow-sm"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          )}
        >
          {cat.icon && <span className="text-base">{cat.icon}</span>}
          {cat.name}
        </button>
      ))}
    </div>
  );
}
