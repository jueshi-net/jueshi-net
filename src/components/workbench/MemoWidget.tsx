'use client';

import { useState, useEffect, useRef } from 'react';
import { StickyNote, Clock } from 'lucide-react';

/**
 * 轻量备忘录 Widget
 * - 纯前端 LocalStorage 持久化
 * - 显示"上次保存时间"
 * - Apple Notion 极简便签风格
 */
export default function MemoWidget() {
  const [content, setContent] = useState('');
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('workbench:memo');
      const savedTime = localStorage.getItem('workbench:memo:savedAt');
      if (saved) setContent(saved);
      if (savedTime) setSavedAt(new Date(savedTime));
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Auto-save with debounce
  const handleContentChange = (value: string) => {
    setContent(value);
    setIsSaving(true);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      try {
        localStorage.setItem('workbench:memo', value);
        const now = new Date();
        localStorage.setItem('workbench:memo:savedAt', now.toISOString());
        setSavedAt(now);
      } catch {
        // Ignore
      } finally {
        setIsSaving(false);
      }
    }, 800);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const formatSavedTime = (date: Date | null) => {
    if (!date) return '尚未保存';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return '刚刚保存';
    if (diffMin < 60) return `${diffMin} 分钟前保存`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr} 小时前保存`;
    return date.toLocaleDateString('zh-CN');
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm shadow-gray-100/50 p-4 transition-all duration-200 hover:shadow-md hover:border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center">
            <StickyNote className="w-4 h-4 text-amber-500" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900">备忘录</h3>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          {isSaving ? (
            <>
              <Clock className="w-3 h-3 animate-spin" />
              <span>保存中...</span>
            </>
          ) : savedAt ? (
            <>
              <Clock className="w-3 h-3" />
              <span>{formatSavedTime(savedAt)}</span>
            </>
          ) : null}
        </div>
      </div>

      {/* Content area */}
      <textarea
        value={content}
        onChange={(e) => handleContentChange(e.target.value)}
        placeholder="写下你的想法、待办或备忘..."
        rows={5}
        className="w-full text-sm text-gray-700 placeholder:text-gray-300 bg-amber-50/30 rounded-lg border-0 resize-none focus:outline-none focus:ring-2 focus:ring-amber-200 p-3 transition-all"
        spellCheck={false}
      />
    </div>
  );
}
