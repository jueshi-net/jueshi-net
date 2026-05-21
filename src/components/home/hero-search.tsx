"use client";

import { Search } from "lucide-react";
import { useCommandMenu } from "@/components/command-palette";

/**
 * HeroSearch — clickable search box in homepage hero.
 * Opens the global CommandMenu when clicked.
 */
export default function HeroSearch() {
  const { setOpen } = useCommandMenu();

  return (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(true); }}
      className="relative w-full flex items-center px-5 py-3.5 bg-white/95 backdrop-blur-sm rounded-xl text-base min-h-[56px] shadow-xl border border-transparent text-left text-gray-400 hover:border-gray-200 transition-colors cursor-text"
    >
      <Search className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
      <span className="flex-1">搜索工具、场景包、指南…</span>
      <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-1 bg-gray-100 border border-gray-200 rounded text-xs font-mono text-gray-400">
        ⌘K
      </kbd>
    </button>
  );
}
