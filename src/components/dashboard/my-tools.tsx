"use client";

import { useState, useCallback } from "react";
import { Wrench, Star, Trash2, ExternalLink } from "lucide-react";

interface ToolFavorite {
  toolKey: string;
  sortOrder: number;
}

interface ToolRecommendation {
  key: string;
  title: string;
  href: string;
  icon: string;
  comingSoon?: boolean;
}

interface MyToolsProps {
  favorites: ToolFavorite[];
  recommendedTools: ToolRecommendation[];
  onRefresh: () => void;
}

// Icon mapping
const ICON_MAP: Record<string, React.ReactNode> = {
  FileText: <span className="text-lg">📄</span>,
  Tag: <span className="text-lg">🏷️</span>,
  MapPin: <span className="text-lg">📍</span>,
  Truck: <span className="text-lg">🚚</span>,
  StickyNote: <span className="text-lg">📝</span>,
  Sparkles: <span className="text-lg">✨</span>,
  Store: <span className="text-lg">🏪</span>,
  Hash: <span className="text-lg">#️⃣</span>,
  Calculator: <span className="text-lg">🧮</span>,
  BookOpen: <span className="text-lg">📚</span>,
  ShoppingBag: <span className="text-lg">🛍️</span>,
  Link: <span className="text-lg">🔗</span>,
  Cpu: <span className="text-lg">🤖</span>,
  MessageSquare: <span className="text-lg">💬</span>,
  Languages: <span className="text-lg">🌐</span>,
};

export default function MyTools({ favorites, recommendedTools, onRefresh }: MyToolsProps) {
  const [removingKey, setRemovingKey] = useState<string | null>(null);

  const handleRemove = useCallback(async (toolKey: string) => {
    setRemovingKey(toolKey);
    try {
      const res = await fetch(`/api/workbench/favorites/${encodeURIComponent(toolKey)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        onRefresh();
      }
    } catch {
      alert("取消收藏失败");
    } finally {
      setRemovingKey(null);
    }
  }, [onRefresh]);

  const hasFavorites = favorites.length > 0;

  return (
    <div className="bg-white rounded-xl border p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Wrench className="w-5 h-5 text-blue-500" />
          我的常用工具
        </h3>
      </div>

      {hasFavorites ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {favorites.map((fav) => (
            <div
              key={fav.toolKey}
              className="flex items-center gap-2 p-3 rounded-lg border bg-gray-50 group"
            >
              <a
                href={`/tools/${fav.toolKey}`}
                className="flex-1 min-w-0 text-sm font-medium text-gray-900 hover:text-blue-600 truncate"
              >
                {fav.toolKey}
              </a>
              <button
                onClick={() => handleRemove(fav.toolKey)}
                disabled={removingKey === fav.toolKey}
                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-opacity"
                title="取消收藏"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : recommendedTools.length > 0 ? (
        <div>
          <p className="text-sm text-gray-600 mb-3">
            收藏站内工具，快速访问常用功能
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {recommendedTools.map((tool) => (
              <ToolCard key={tool.key} tool={tool} onRefresh={onRefresh} />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500">
          <Wrench className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">还没有收藏工具</p>
          <p className="text-xs text-gray-400 mt-1">浏览工具页收藏你常用的功能</p>
        </div>
      )}
    </div>
  );
}

function ToolCard({ tool, onRefresh }: { tool: ToolRecommendation; onRefresh: () => void }) {
  const [adding, setAdding] = useState(false);

  const handleFavorite = useCallback(async () => {
    setAdding(true);
    try {
      const res = await fetch("/api/workbench/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolKey: tool.key }),
      });
      if (res.ok) {
        onRefresh();
      } else {
        const data = await res.json();
        if (data.code === "ALREADY_FAVORITED") {
          onRefresh();
        }
      }
    } catch {
      // Ignore
    } finally {
      setAdding(false);
    }
  }, [tool.key, onRefresh]);

  return (
    <div className="flex items-center gap-2 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
      <div className="flex-shrink-0">
        {ICON_MAP[tool.icon] || <Wrench className="w-5 h-5 text-gray-400" />}
      </div>
      <div className="flex-1 min-w-0">
        {tool.comingSoon ? (
          <span className="text-sm text-gray-500">{tool.title}</span>
        ) : (
          <a
            href={tool.href}
            className="text-sm font-medium text-gray-900 hover:text-blue-600 truncate block"
          >
            {tool.title}
          </a>
        )}
      </div>
      {!tool.comingSoon && (
        <button
          onClick={handleFavorite}
          disabled={adding}
          className="p-1 text-gray-400 hover:text-amber-500 transition-colors"
          title="收藏此工具"
        >
          <Star className="w-4 h-4" />
        </button>
      )}
      {tool.comingSoon && (
        <span className="text-xs text-gray-400">即将开放</span>
      )}
    </div>
  );
}
