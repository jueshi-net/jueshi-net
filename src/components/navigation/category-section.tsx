"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import LinkCard from "./link-card";

interface CategoryHeaderProps {
  category: {
    id: string;
    name: string;
    icon?: string;
    linkCount: number;
  };
  isExpanded: boolean;
  onToggle: () => void;
}

export function CategoryHeader({ category, isExpanded, onToggle }: CategoryHeaderProps) {
  return (
    <div
      className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 sticky top-14 z-10 backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 cursor-pointer select-none hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-colors"
      onClick={onToggle}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          {category.icon && <span className="text-xl">{category.icon}</span>}
          {category.name}
          <span className="text-sm font-normal text-gray-400 dark:text-gray-500">
            ({category.linkCount})
          </span>
        </h2>
        <button
          className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label={isExpanded ? "收起" : "展开"}
        >
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>
      </div>
    </div>
  );
}

interface CategoryContentProps {
  links: Array<{
    id: string;
    title: string;
    description?: string;
    icon?: string;
    url: string;
    color?: string;
  }>;
  categoryId: string;
}

export function CategoryContent({ links, categoryId }: CategoryContentProps) {
  const [isExpanded, setIsExpanded] = useState(() => {
    if (typeof window === "undefined") return true;
    const saved = localStorage.getItem(`cat-${categoryId}`);
    if (saved !== null) return saved === "1";
    return true;
  });

  const toggle = () => {
    const next = !isExpanded;
    setIsExpanded(next);
    localStorage.setItem(`cat-${categoryId}`, next ? "1" : "0");
  };

  return (
    <div
      className="overflow-hidden transition-all duration-300 ease-in-out"
      style={{ maxHeight: isExpanded ? "5000px" : "0", opacity: isExpanded ? 1 : 0 }}
    >
      <div className="p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {links.map((link) => (
            <LinkCard
              key={link.id}
              link={{
                id: link.id,
                title: link.title,
                description: link.description,
                icon: link.icon,
                url: link.url,
                color: link.color,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Combined wrapper component
export function CategorySection({ category, links }: {
  category: { id: string; name: string; icon?: string; linkCount: number };
  links: Array<{ id: string; title: string; description?: string; icon?: string; url: string; color?: string }>;
}) {
  const [isExpanded, setIsExpanded] = useState(() => {
    if (typeof window === "undefined") return true;
    const saved = localStorage.getItem(`cat-${category.id}`);
    if (saved !== null) return saved === "1";
    return true;
  });

  const toggle = () => {
    const next = !isExpanded;
    setIsExpanded(next);
    localStorage.setItem(`cat-${category.id}`, next ? "1" : "0");
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden scroll-mt-20">
      <CategoryHeader category={category} isExpanded={isExpanded} onToggle={toggle} />
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: isExpanded ? "5000px" : "0", opacity: isExpanded ? 1 : 0 }}
      >
        <div className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {links.map((link) => (
              <LinkCard
                key={link.id}
                link={{
                  id: link.id,
                  title: link.title,
                  description: link.description,
                  icon: link.icon,
                  url: link.url,
                  color: link.color,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
