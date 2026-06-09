'use client';

import { useEffect, useState, useRef, useCallback } from 'react';

interface AdData {
  placementKey: string;
  campaignId: string;
  creativeId: string;
  creativeType: string;
  imageUrl: string | null;
  headline: string | null;
  bodyText: string | null;
  ctaText: string | null;
  targetUrl: string | null;
  adRenderToken: string;
  sponsoredLabel: string;
  expiresAt: string;
}

interface SafeAdSlotProps {
  placementKey: string;
  pageType?: string;
  pagePath?: string;
  className?: string;
  maxHeight?: string;
  showSponsoredLabel?: boolean;
}

/**
 * SafeAdSlot — 安全广告渲染组件（adRenderToken 强制）
 *
 * - 客户端异步请求 /api/ads/resolve
 * - 无广告 / 加载失败 → 静默不显示
 * - impression 仅在广告真实渲染后上报
 * - click 仅在用户点击后上报
 * - 所有上报携带 adRenderToken
 * - 不渲染 HTML/codeSnippet 类型
 * - 预留高度避免 CLS
 * - 移动端安全：不遮挡、不弹窗、不 sticky
 */
export function SafeAdSlot({
  placementKey,
  pageType = '',
  pagePath = '',
  className = '',
  maxHeight = '180px',
  showSponsoredLabel = true,
}: SafeAdSlotProps) {
  const [ad, setAd] = useState<AdData | null>(null);
  const [loading, setLoading] = useState(true);
  const impressionReported = useRef(false);

  const resolveAd = useCallback(async () => {
    try {
      const params = new URLSearchParams({ placementKey });
      if (pageType) params.set('pageType', pageType);
      if (pagePath) params.set('pagePath', pagePath);

      const res = await fetch(`/api/ads/resolve?${params}`, {
        cache: 'no-store',
      });

      if (!res.ok) {
        setAd(null);
        return;
      }

      const data = await res.json();
      if (data?.ad && data.ad.creativeType !== 'html' && data.ad.creativeType !== 'codeSnippet') {
        setAd(data.ad);
      } else {
        setAd(null);
      }
    } catch {
      setAd(null);
    } finally {
      setLoading(false);
    }
  }, [placementKey, pageType, pagePath]);

  useEffect(() => {
    resolveAd();
  }, [resolveAd]);

  // Report impression after ad is rendered
  useEffect(() => {
    if (ad && !impressionReported.current) {
      impressionReported.current = true;
      reportEvent('impression');
    }
  }, [ad]);

  const reportEvent = async (eventType: 'impression' | 'click') => {
    if (!ad) return;
    try {
      await fetch('/api/ads/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: ad.campaignId,
          creativeId: ad.creativeId,
          placementKey: ad.placementKey,
          eventType,
          adRenderToken: ad.adRenderToken,
        }),
      });
    } catch {
      // Silently fail — reporting should never break the page
    }
  };

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!ad?.targetUrl) return;
    await reportEvent('click');
    window.open(ad.targetUrl, '_blank', 'noopener,noreferrer');
  };

  // Loading: return null to avoid CLS (container reserved by parent)
  if (loading) {
    return null;
  }

  // No ad or unsupported type: completely hidden
  if (!ad) {
    return null;
  }

  // --- RENDER ---

  // Image-type creative
  if (ad.creativeType === 'image' && ad.imageUrl) {
    return (
      <div className={`relative bg-white border border-gray-100 rounded-xl overflow-hidden ${className}`} style={{ maxHeight }}>
        {showSponsoredLabel && (
          <span className="absolute top-2 right-3 z-10 inline-flex items-center px-1.5 py-0.5 bg-amber-50 text-amber-600 text-xs rounded font-medium">
            {ad.sponsoredLabel || '推广'}
          </span>
        )}
        <a
          href={ad.targetUrl || '#'}
          onClick={handleClick}
          className="block group"
        >
          <img
            src={ad.imageUrl}
            alt={ad.headline || ad.ctaText || ''}
            className="w-full object-cover"
            style={{ maxHeight }}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
          {(ad.headline || ad.bodyText) && (
            <div className="p-3">
              {ad.headline && (
                <p className="font-medium text-gray-900 text-sm group-hover:text-teal-600 transition-colors line-clamp-1">
                  {ad.headline}
                </p>
              )}
              {ad.bodyText && (
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{ad.bodyText}</p>
              )}
            </div>
          )}
        </a>
      </div>
    );
  }

  // Native-type creative (headline + body + CTA, no image)
  if (ad.creativeType === 'native' || (ad.creativeType === 'image' && !ad.imageUrl)) {
    return (
      <div className={`relative bg-white border border-gray-100 rounded-xl overflow-hidden ${className}`}>
        {showSponsoredLabel && (
          <span className="absolute top-2 right-3 z-10 inline-flex items-center px-1.5 py-0.5 bg-amber-50 text-amber-600 text-xs rounded font-medium">
            {ad.sponsoredLabel || '推广'}
          </span>
        )}
        <a
          href={ad.targetUrl || '#'}
          onClick={handleClick}
          className="block p-4 group"
        >
          {ad.headline && (
            <p className="font-semibold text-gray-900 group-hover:text-teal-600 transition-colors">
              {ad.headline}
            </p>
          )}
          {ad.bodyText && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{ad.bodyText}</p>
          )}
          {ad.ctaText && (
            <span className="inline-block mt-3 text-sm text-teal-600 font-medium">
              {ad.ctaText} →
            </span>
          )}
        </a>
      </div>
    );
  }

  // Fallback: unknown type → hidden
  return null;
}
