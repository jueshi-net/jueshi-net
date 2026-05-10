"use client";

import Link from "next/link";
import { getAdsByPlacement, AdPlacement, AdVariant } from "@/lib/data/ads";
import { Megaphone } from "lucide-react";

interface AdSlotProps {
  placement: AdPlacement;
  variant?: AdVariant;
  className?: string;
}

function AdCard({ ad, variant }: { ad: ReturnType<typeof getAdsByPlacement>[0]; variant?: AdVariant }) {
  if (!ad) return null;

  const isText = variant === "text";
  const isBanner = variant === "banner";

  if (isText) {
    return (
      <Link
        href={ad.targetUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 py-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
      >
        <span className="inline-flex items-center px-1.5 py-0.5 bg-gray-100 text-gray-400 text-xs rounded">
          {ad.label || "推广"}
        </span>
        <span>{ad.title}</span>
        {ad.description && (
          <span className="text-gray-400">— {ad.description}</span>
        )}
      </Link>
    );
  }

  if (isBanner) {
    return (
      <Link
        href={ad.targetUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 hover:shadow-md transition-all relative"
      >
        <span className="absolute top-2 right-3 inline-flex items-center px-1.5 py-0.5 bg-blue-100 text-blue-500 text-xs rounded">
          {ad.label || "推广"}
        </span>
        <div className="flex items-center gap-3">
          <Megaphone className="w-5 h-5 text-blue-400 flex-shrink-0" />
          <div>
            <p className="font-medium text-gray-900">{ad.title}</p>
            {ad.description && (
              <p className="text-sm text-gray-500 mt-0.5">{ad.description}</p>
            )}
          </div>
        </div>
      </Link>
    );
  }

  // Default: card variant
  return (
    <Link
      href={ad.targetUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md hover:border-blue-200 transition-all relative"
    >
      <span className="absolute top-2 right-3 inline-flex items-center px-1.5 py-0.5 bg-amber-50 text-amber-600 text-xs rounded font-medium">
        {ad.label || "推广"}
      </span>
      <div className="flex items-start gap-3">
        <Megaphone className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-gray-900">{ad.title}</p>
          {ad.description && (
            <p className="text-sm text-gray-500 mt-1">{ad.description}</p>
          )}
          {ad.sponsorName && (
            <p className="text-xs text-gray-400 mt-2">赞助方: {ad.sponsorName}</p>
          )}
        </div>
      </div>
    </Link>
  );
}

/**
 * AdSlot 组件
 * - 无匹配广告时返回 null（不渲染）
 * - enabled=false 时不渲染
 * - 不接 AdSense，不加载第三方脚本
 */
export function AdSlot({ placement, variant = "card", className = "" }: AdSlotProps) {
  const matched = getAdsByPlacement(placement, { max: 1 });

  if (matched.length === 0) return null;

  const ad = matched[0];

  return (
    <div className={className}>
      <AdCard ad={ad} variant={variant} />
    </div>
  );
}
