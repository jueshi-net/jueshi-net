'use client';

import { useEffect, useState, useRef } from 'react';
import { Megaphone, ExternalLink } from 'lucide-react';

interface AdData {
  id: string;
  adType: 'DIRECT' | 'NETWORK';
  imageUrl: string | null;
  targetUrl: string | null;
  codeSnippet: string | null;
  title: string;
}

interface AdSlotProps {
  placement: string;
  country?: string;
  className?: string;
  /** @deprecated variant is ignored in the new API-driven AdSlot. Kept for backward compat. */
  variant?: string;
}

/**
 * AdSlot — 系统级广告渲染组件（双轨制）
 *
 * 从 /api/ads/dispatch 获取匹配的广告，根据 adType 条件渲染：
 * - DIRECT: 渲染 <a><img></a>，点击时调用 /api/ads/[id]/click 打点
 * - NETWORK: 使用 dangerouslySetInnerHTML 注入第三方代码（Google Ads 等）
 * - 无匹配广告：安全降级显示「广告位招租」占位
 */
export function AdSlot({ placement, country, className = '' }: AdSlotProps) {
  const [ad, setAd] = useState<AdData | null>(null);
  const [loading, setLoading] = useState(true);
  const snippetContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchAd = async () => {
      try {
        const params = new URLSearchParams({ placement });
        if (country) params.set('country', country);

        const res = await fetch(`/api/ads/dispatch?${params}`);
        const data = await res.json();

        if (data.ad) {
          setAd(data.ad);
        } else {
          setAd(null);
        }
      } catch (e) {
        console.error('[AdSlot] Fetch failed:', e);
        setAd(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAd();
  }, [placement, country]);

  // Inject script tags for NETWORK ads (Next.js client-side injection)
  useEffect(() => {
    if (ad?.adType === 'NETWORK' && ad.codeSnippet && snippetContainerRef.current) {
      const container = snippetContainerRef.current;
      container.innerHTML = ''; // Clear previous

      // Parse HTML and extract <script> tags for dynamic injection
      const parser = new DOMParser();
      const doc = parser.parseFromString(ad.codeSnippet, 'text/html');

      // Insert non-script elements directly
      const fragment = document.createDocumentFragment();
      const scripts: HTMLScriptElement[] = [];

      Array.from(doc.body.childNodes).forEach(node => {
        if (node instanceof HTMLScriptElement) {
          scripts.push(node);
        } else {
          fragment.appendChild(node.cloneNode(true));
        }
      });

      container.appendChild(fragment);

      // Dynamically inject scripts
      scripts.forEach(oldScript => {
        const newScript = document.createElement('script');
        Array.from(oldScript.attributes).forEach(attr => {
          newScript.setAttribute(attr.name, attr.value);
        });
        if (oldScript.textContent) {
          newScript.textContent = oldScript.textContent;
        }
        container.appendChild(newScript);
      });
    }
  }, [ad?.id, ad?.codeSnippet, ad?.adType]);

  // Loading skeleton — 短暂加载中不占位，避免布局跳动
  if (loading) {
    return null;
  }

  // 无匹配广告 → 彻底隐身，不渲染任何 DOM
  if (!ad) {
    return null;
  }

  // DIRECT: Image + link ad
  if (ad.adType === 'DIRECT') {
    return (
      <div className={`bg-white border border-gray-100 rounded-xl overflow-hidden relative ${className}`}>
        <span className="absolute top-2 right-3 z-10 inline-flex items-center px-1.5 py-0.5 bg-amber-50 text-amber-600 text-xs rounded font-medium">
          推广
        </span>
        <a
          href={ad.targetUrl || '#'}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            fetch(`/api/ads/${ad.id}/click`, { method: 'POST' }).catch(() => {});
          }}
          className="block group"
        >
          {ad.imageUrl && (
            <img
              src={ad.imageUrl}
              alt={ad.title}
              className="w-full object-cover max-h-48"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
          <div className="p-4 flex items-start gap-3">
            <Megaphone className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                {ad.title}
              </p>
              {ad.targetUrl && (
                <div className="flex items-center gap-1 mt-1 text-xs text-blue-500">
                  <ExternalLink className="w-3 h-3" /> 了解详情
                </div>
              )}
            </div>
          </div>
        </a>
      </div>
    );
  }

  // NETWORK: Third-party code snippet (Google Ads, etc.)
  if (ad.adType === 'NETWORK') {
    return (
      <div className={`bg-white border border-gray-100 rounded-xl p-2 relative ${className}`}>
        <span className="absolute top-1 right-2 z-10 inline-flex items-center px-1.5 py-0.5 bg-gray-100 text-gray-400 text-[10px] rounded">
          广告
        </span>
        <div
          ref={snippetContainerRef}
          className="w-full min-h-[60px]"
        />
      </div>
    );
  }

  // Fallback (should not reach here)
  return null;
}
