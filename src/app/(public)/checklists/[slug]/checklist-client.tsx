"use client";

import { useState, useEffect } from "react";
import { Check, ChevronDown, ChevronRight, AlertTriangle } from "lucide-react";

interface ChecklistItem {
  id: string;
  title: string;
  description?: string;
  required?: boolean;
  priority?: "high" | "medium" | "low";
  timing?: string;
  warning?: string;
  relatedToolSlug?: string;
  officialLink?: { label: string; url: string };
  completedDefault?: boolean;
}

interface Section {
  id: string;
  title: string;
  description?: string;
  items: ChecklistItem[];
}

interface Props {
  sections: Section[];
  slug: string;
}

function getStorageKey(slug: string) {
  return `checklist-progress-${slug}`;
}

export default function ChecklistClient({ sections, slug }: Props) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const stored = localStorage.getItem(getStorageKey(slug));
      if (stored) {
        setChecked(JSON.parse(stored));
      }
    } catch {}
  }, [slug]);

  const toggle = (id: string) => {
    setChecked(prev => {
      const next = { ...prev, [id]: !prev[id] };
      try { localStorage.setItem(getStorageKey(slug), JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const toggleSection = (id: string) => {
    setCollapsed(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const total = sections.reduce((sum, s) => sum + s.items.length, 0);
  const done = Object.values(checked).filter(Boolean).length;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  if (!sections || sections.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      {/* Progress */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 sticky top-20 z-10 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-gray-900">📝 清单进度</span>
          <span className="text-sm text-gray-500">{done} / {total} ({percent}%)</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className="bg-teal-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${percent}%` }} />
        </div>
      </div>

      {/* Sections */}
      {sections.map((section) => {
        const isCollapsed = collapsed[section.id];
        const sectionDone = section.items.filter(i => checked[i.id]).length;
        return (
          <div key={section.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
            >
              <div>
                <h3 className="font-semibold text-gray-900">{section.title}</h3>
                {section.description && <p className="text-sm text-gray-500 mt-1">{section.description}</p>}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">{sectionDone}/{section.items.length}</span>
                {isCollapsed ? <ChevronRight className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </div>
            </button>
            {!isCollapsed && (
              <div className="px-4 pb-4 space-y-2 border-t border-gray-100 pt-2">
                {section.items.map((item) => {
                  const isChecked = !!checked[item.id];
                  return (
                    <div
                      key={item.id}
                      className={`flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer select-none ${
                        isChecked ? "bg-gray-50" : "hover:bg-gray-50"
                      }`}
                      onClick={() => toggle(item.id)}
                    >
                      <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${
                        isChecked ? "bg-teal-600 border-teal-600" : "border-gray-300"
                      }`}>
                        {isChecked && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-medium ${isChecked ? "text-gray-400 line-through" : "text-gray-900"}`}>
                            {item.title}
                          </span>
                          {item.required && <span className="px-1.5 py-0.5 bg-red-50 text-red-600 text-xs rounded">必做</span>}
                          {item.priority === "high" && <span className="px-1.5 py-0.5 bg-orange-50 text-orange-600 text-xs rounded">高优</span>}
                          {item.timing && <span className="text-xs text-gray-400">⏱ {item.timing}</span>}
                        </div>
                        {item.description && <p className="text-sm text-gray-500 mt-1">{item.description}</p>}
                        {item.warning && (
                          <div className="mt-2 flex items-start gap-1.5 text-xs text-amber-700 bg-amber-50 px-2 py-1.5 rounded">
                            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                            <span>{item.warning}</span>
                          </div>
                        )}
                        {item.relatedToolSlug && (
                          <a
                            href={`/tools/${item.relatedToolSlug}`}
                            className="mt-1 inline-block text-xs text-teal-600 hover:underline"
                            onClick={e => e.stopPropagation()}
                          >
                            查看工具: {item.relatedToolSlug}
                          </a>
                        )}
                        {item.officialLink && (
                          <a
                            href={item.officialLink.url}
                            target="_blank"
                            rel="nofollow noopener noreferrer"
                            className="mt-1 ml-2 inline-block text-xs text-blue-600 hover:underline"
                            onClick={e => e.stopPropagation()}
                          >
                            官方: {item.officialLink.label}
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}
