"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

export function ArticleLayoutClient({ toc, children }: { toc: TocItem[]; children: React.ReactNode }) {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 600);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="flex flex-col lg:flex-row lg:gap-8">
      {/* Main content */}
      <div className="flex-1 min-w-0">{children}</div>

      {/* Sticky TOC sidebar (desktop only, only if TOC has items) */}
      {toc.length >= 2 && (
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto">
            <nav className="bg-white rounded-xl border border-gray-200 p-4" aria-label="文章目录">
              <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-1.5">
                📑 目录
              </h3>
              <ul className="space-y-1">
                {toc.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => scrollTo(item.id)}
                      className={`text-left w-full text-sm py-1 rounded transition-colors hover:text-teal-600 hover:bg-teal-50 ${
                        item.level === 3 ? "pl-4 text-gray-500" : "text-gray-700 font-medium"
                      }`}
                    >
                      {item.text}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </aside>
      )}

      {/* Mobile TOC (compact, above content) */}
      {toc.length >= 3 && (
        <div className="lg:hidden order-first mx-4 sm:mx-0 mb-4">
          <details className="bg-white rounded-xl border border-gray-200">
            <summary className="px-4 py-3 cursor-pointer text-sm font-bold text-gray-700 flex items-center gap-1.5">
              📑 文章目录 ({toc.length} 节)
            </summary>
            <ul className="px-4 pb-3 space-y-1">
              {toc.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => scrollTo(item.id)}
                    className={`text-left w-full text-sm py-1.5 rounded transition-colors hover:text-teal-600 ${
                      item.level === 3 ? "pl-4 text-gray-500" : "text-gray-700 font-medium"
                    }`}
                  >
                    {item.text}
                  </button>
                </li>
              ))}
            </ul>
          </details>
        </div>
      )}

      {/* Back to top */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-50 p-3 bg-teal-600 text-white rounded-full shadow-lg hover:bg-teal-700 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="返回顶部"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
