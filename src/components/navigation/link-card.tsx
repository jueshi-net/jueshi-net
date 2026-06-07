"use client";

import { cn } from "@/lib/utils";
import {
  Package, Truck, Bird, Plane, Search, Globe, Shield,
  ShoppingCart, ShoppingBag, Building, Calculator, Receipt,
  FileText, Notebook, Languages, Star, Bookmark, Heart,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import HighlightText from "./highlight-text";

const iconMap: Record<string, React.ReactNode> = {
  package: <Package className="w-5 h-5" />,
  truck: <Truck className="w-5 h-5" />,
  bird: <Bird className="w-5 h-5" />,
  plane: <Plane className="w-5 h-5" />,
  search: <Search className="w-5 h-5" />,
  globe: <Globe className="w-5 h-5" />,
  shield: <Shield className="w-5 h-5" />,
  "shopping-cart": <ShoppingCart className="w-5 h-5" />,
  "shopping-bag": <ShoppingBag className="w-5 h-5" />,
  building: <Building className="w-5 h-5" />,
  calculator: <Calculator className="w-5 h-5" />,
  receipt: <Receipt className="w-5 h-5" />,
  "file-text": <FileText className="w-5 h-5" />,
  notebook: <Notebook className="w-5 h-5" />,
  languages: <Languages className="w-5 h-5" />,
  star: <Star className="w-5 h-5" />,
  bookmark: <Bookmark className="w-5 h-5" />,
  heart: <Heart className="w-5 h-5" />,
};

const colorMap: Record<string, { bg: string; darkBg: string; text: string; hover: string }> = {
  blue: { bg: "bg-blue-100", darkBg: "dark:bg-blue-900/30", text: "text-blue-600 dark:text-blue-400", hover: "hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700" },
  sky: { bg: "bg-sky-100", darkBg: "dark:bg-sky-900/30", text: "text-sky-600 dark:text-sky-400", hover: "hover:bg-sky-50 dark:hover:bg-sky-900/20 hover:border-sky-300 dark:hover:border-sky-700" },
  red: { bg: "bg-red-100", darkBg: "dark:bg-red-900/30", text: "text-red-600 dark:text-red-400", hover: "hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700" },
  orange: { bg: "bg-orange-100", darkBg: "dark:bg-orange-900/30", text: "text-orange-600 dark:text-orange-400", hover: "hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:border-orange-300 dark:hover:border-orange-700" },
  green: { bg: "bg-green-100", darkBg: "dark:bg-green-900/30", text: "text-green-600 dark:text-green-400", hover: "hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-300 dark:hover:border-green-700" },
  amber: { bg: "bg-amber-100", darkBg: "dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-400", hover: "hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:border-amber-300 dark:hover:border-amber-700" },
  purple: { bg: "bg-purple-100", darkBg: "dark:bg-purple-900/30", text: "text-purple-600 dark:text-purple-400", hover: "hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-700" },
  teal: { bg: "bg-teal-100", darkBg: "dark:bg-teal-900/30", text: "text-teal-600 dark:text-teal-400", hover: "hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:border-teal-300 dark:hover:border-teal-700" },
};

interface LinkCardProps {
  link: {
    id: string;
    title: string;
    description?: string;
    icon?: string;
    url: string;
    color?: string;
  };
  isFavorite?: boolean;
  onToggleFavorite?: (linkId: string) => void;
  showFavorite?: boolean;
  highlightKeyword?: string;
}

export default function LinkCard({ link, isFavorite = false, onToggleFavorite, showFavorite = true, highlightKeyword }: LinkCardProps) {
  const [fav, setFav] = useState(isFavorite);
  const [imgLoading, setImgLoading] = useState(true);
  const [imgError, setImgError] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleFav = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFav(!fav);
    onToggleFavorite?.(link.id);
  };

  const color = link.color && colorMap[link.color] ? colorMap[link.color] : colorMap.blue;

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return "";
    }
  };

  const domain = getDomain(link.url);
  const faviconUrl = domain && link.url.startsWith("http")
    ? `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(link.url)}&size=32`
    : "";

  const icon = link.icon ? iconMap[link.icon] || iconMap.globe : iconMap.globe;

  const showFavicon = faviconUrl && !imgError;
  const showSpinner = showFavicon && imgLoading;
  const showFallbackIcon = imgError || !showFavicon;

  return (
    <Link
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      title={`${link.title}${link.description ? " - " + link.description : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "group relative bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 transition-all duration-200 flex flex-col gap-3",
        "hover:shadow-md hover:-translate-y-0.5",
        color.hover
      )}
    >
      {/* 收藏按钮 */}
      {showFavorite && (
        <button
          onClick={handleFav}
          className={`absolute top-2 right-2 p-1 rounded-full transition-all z-10 ${
            hovered || fav ? "opacity-100" : "opacity-0"
          } hover:bg-gray-100 dark:hover:bg-gray-700`}
        >
          <Star
            className={cn(
              "w-3.5 h-3.5 transition-colors",
              fav ? "text-yellow-500 fill-yellow-500" : "text-gray-300 dark:text-gray-600 hover:text-yellow-400"
            )}
          />
        </button>
      )}

      {/* 图标区域 - 仿 MeNav 三级降级: spinner → favicon → fallback icon */}
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center relative overflow-hidden transition-transform group-hover:scale-105",
        color.bg, color.darkBg, color.text
      )}>
        {/* 加载中的 spinner */}
        {showSpinner && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <Loader2 className="w-5 h-5 animate-spin opacity-60" />
          </div>
        )}

        {/* Favicon 图片 */}
        {showFavicon && (
          <img
            src={faviconUrl}
            alt=""
            className={cn(
              "w-7 h-7 object-contain z-10 transition-opacity duration-200",
              imgLoading ? "opacity-0" : "opacity-100"
            )}
            loading="lazy"
            onLoad={() => setImgLoading(false)}
            onError={() => { setImgLoading(false); setImgError(true); }}
          />
        )}

        {/* 降级 fallback 图标 */}
        {showFallbackIcon && (
          <div className="flex items-center justify-center z-10">
            {icon}
          </div>
        )}
      </div>

      {/* 文字区域 */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate transition-colors">
          <HighlightText text={link.title} keyword={highlightKeyword || ""} />
        </h3>
        {link.description && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 line-clamp-2 leading-relaxed">
            <HighlightText text={link.description} keyword={highlightKeyword || ""} />
          </p>
        )}
      </div>

      {/* 底部域名提示 */}
      {domain && (
        <p className="text-[10px] text-gray-300 dark:text-gray-600 truncate mt-auto">
          {domain}
        </p>
      )}
    </Link>
  );
}
