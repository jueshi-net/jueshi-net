'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

interface ResourceSearchBarProps {
  /** Current search value coming from URL params. */
  initialValue: string;
  /** Called (debounced) when the user types. */
  onSearch: (value: string) => void;
  placeholder?: string;
  /** Hero variant uses a larger, white-on-brand style. */
  variant?: 'hero' | 'inline';
}

/**
 * Large search input with a leading icon and clear button.
 * Debounces the onSearch callback so the URL (and server query) only
 * updates after the user stops typing.
 */
export function ResourceSearchBar({
  initialValue,
  onSearch,
  placeholder = '搜索资源名称、描述或网址…',
  variant = 'hero',
}: ResourceSearchBarProps) {
  const [value, setValue] = useState(initialValue);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep local state in sync when the URL param changes (e.g. cleared).
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  // Cleanup on unmount.
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleChange = (v: string) => {
    setValue(v);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onSearch(v), 450);
  };

  const handleClear = () => {
    setValue('');
    if (timerRef.current) clearTimeout(timerRef.current);
    onSearch('');
  };

  const isHero = variant === 'hero';

  return (
    <div className="relative w-full">
      <Search
        className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none ${
          isHero ? 'text-white/60' : 'text-gray-400'
        }`}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full pl-12 pr-10 py-3 rounded-xl text-sm focus:outline-none transition-all ${
          isHero
            ? 'bg-white/15 backdrop-blur text-white placeholder-white/50 border border-white/25 focus:bg-white/20 focus:border-white/40 focus:ring-2 focus:ring-white/30'
            : 'bg-white text-title border border-border focus:border-brand focus:ring-2 focus:ring-brand/20 shadow-sm'
        }`}
      />
      {value && (
        <button
          onClick={handleClear}
          className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${
            isHero ? 'text-white/60 hover:text-white' : 'text-gray-400 hover:text-gray-600'
          }`}
          aria-label="清除搜索"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

export default ResourceSearchBar;
