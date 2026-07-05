'use client';

import React from 'react';
import Link from 'next/link';
import type { AdGroup, AdItem } from './adInventory';

/** Pre-defined gradient palettes for image ad placeholders */
const imageGradients = [
  'from-[#6C5DD3] to-[#3F8CFF]',
  'from-[#FF754C] to-[#FFB26B]',
  'from-[#3F8CFF] to-[#3DC6F0]',
  'from-[#22C55E] to-[#6EE7B7]',
  'from-[#F43F5E] to-[#FB923C]',
  'from-[#8B5CF6] to-[#EC4899]',
  'from-[#0EA5E9] to-[#6366F1]',
  'from-[#F59E0B] to-[#EF4444]',
];

interface JueshiV4AdInventoryGroupProps {
  group: AdGroup;
}

export default function JueshiV4AdInventoryGroup({ group }: JueshiV4AdInventoryGroupProps) {
  // Hide entire group if disabled
  if (group.enabled === false) return null;

  // Filter out disabled ads
  const enabledTextAds = (group.textAds || []).filter((ad) => ad.enabled !== false);
  const enabledImageAds = (group.imageAds || []).filter((ad) => ad.enabled !== false);

  // Apply row limits for text ads
  const maxTextItems = group.maxTextRows * group.textColumns;
  const limitedTextAds = enabledTextAds.slice(0, maxTextItems);

  // Empty groups render nothing
  if (limitedTextAds.length === 0 && enabledImageAds.length === 0) return null;

  return (
    <section className="relative bg-gradient-to-br from-[#FAFBFE] to-[#F6F8FC] border border-[#E8ECF3] rounded-2xl p-5 md:p-6">
      {/* Ad label badge */}
      {group.showLabel && (
        <span className="absolute top-3 right-3 bg-[#FF754C]/10 text-[#FF754C] text-[10px] px-2 py-0.5 rounded font-medium z-10">
          推广
        </span>
      )}

      {/* Group header */}
      <div className="mb-4 pr-14">
        <h3 className="text-sm font-bold text-[#11142D]">{group.title}</h3>
        {group.description && (
          <p className="text-xs text-[#808191] mt-0.5">{group.description}</p>
        )}
      </div>

      {/* Text ads grid */}
      {limitedTextAds.length > 0 && (
        <div className="mb-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-2.5">
            {limitedTextAds.map((ad) => (
              <TextAdItem key={ad.slotKey} ad={ad} />
            ))}
          </div>
        </div>
      )}

      {/* Image ads grid */}
      {enabledImageAds.length > 0 && (
        <div>
          {/* Desktop/tablet: grid layout */}
          <div className="hidden sm:grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-3">
            {enabledImageAds.map((ad, idx) => (
              <ImageAdItem key={ad.slotKey} ad={ad} index={idx} />
            ))}
          </div>
          {/* Mobile: horizontal scroll */}
          <div className="sm:hidden flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
            {enabledImageAds.map((ad, idx) => (
              <div key={ad.slotKey} className="flex-shrink-0 w-[180px]">
                <ImageAdItem ad={ad} index={idx} />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

/* ─── Text Ad Item ──────────────────────────────────────────── */

function TextAdItem({ ad }: { ad: AdItem }) {
  const relProps = ad.nofollow ? { rel: 'nofollow sponsored' } : {};

  return (
    <Link
      href={ad.href}
      className="group relative bg-white rounded-xl p-2.5 border border-[#E8ECF3] hover:border-[#6C5DD3]/20 hover:shadow-sm transition-all block"
      {...relProps}
    >
      {/* 广告 micro label */}
      <span className="absolute top-1.5 right-1.5 text-[8px] text-[#808191]/50 font-normal">
        广告
      </span>

      <div className="pr-5">
        <h4 className="text-[11px] font-bold text-[#11142D] line-clamp-1 group-hover:text-[#6C5DD3] transition-colors">
          {ad.title}
        </h4>
        {ad.subtitle && (
          <p className="text-[9px] text-[#808191] mt-0.5 line-clamp-1">{ad.subtitle}</p>
        )}
      </div>

      <div className="flex items-center justify-between mt-1.5">
        {ad.tag && (
          <span className="text-[9px] bg-[#6C5DD3]/8 text-[#6C5DD3] px-1.5 py-0.5 rounded font-medium">
            {ad.tag}
          </span>
        )}
        {ad.ctaText && (
          <span className="text-[#6C5DD3] text-[10px] font-medium ml-auto">
            {ad.ctaText} →
          </span>
        )}
      </div>
    </Link>
  );
}

/* ─── Image Ad Item ─────────────────────────────────────────── */

function ImageAdItem({ ad, index }: { ad: AdItem; index: number }) {
  const relProps = ad.nofollow ? { rel: 'nofollow sponsored' } : {};
  const gradient = imageGradients[index % imageGradients.length];

  return (
    <Link
      href={ad.href}
      className="group bg-white rounded-xl overflow-hidden border border-[#E8ECF3] hover:shadow-md transition-all block"
      {...relProps}
    >
      {/* Gradient placeholder */}
      <div className={`relative h-20 bg-gradient-to-br ${gradient}`}>
        {/* 广告 badge on image */}
        <span className="absolute top-1.5 right-1.5 bg-black/20 backdrop-blur-sm text-white text-[8px] px-1.5 py-0.5 rounded">
          广告
        </span>
        {ad.tag && (
          <span className="absolute bottom-1.5 left-1.5 bg-white/80 backdrop-blur-sm text-[#11142D] text-[9px] px-1.5 py-0.5 rounded font-medium">
            {ad.tag}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-2.5">
        <h4 className="text-[11px] font-bold text-[#11142D] line-clamp-1 group-hover:text-[#6C5DD3] transition-colors">
          {ad.title}
        </h4>
        {ad.description && (
          <p className="text-[9px] text-[#808191] mt-0.5 line-clamp-1">{ad.description}</p>
        )}
        {ad.ctaText && (
          <span className="inline-block mt-1.5 text-[#6C5DD3] text-[10px] font-medium">
            {ad.ctaText} →
          </span>
        )}
      </div>
    </Link>
  );
}
