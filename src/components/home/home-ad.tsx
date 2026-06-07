import { getAdForSlot, type AdPlacement } from "@/lib/ads";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { AD_SLOTS, AD_SLOT_PLACEMENTS, type AdSlotKey } from "@/lib/ad-slots";
import { getHomepageConfig } from "@/lib/homepage-config";

export default async function HomeAd({ slot }: { slot: AdSlotKey }) {
  const config = await getHomepageConfig();
  const adConfig = config.ads[slot] || { enabled: true, fallbackMode: "hide" };
  if (!adConfig.enabled) return null;

  const dbPlacement = AD_SLOT_PLACEMENTS[slot];
  const ad = await getAdForSlot(dbPlacement as AdPlacement);

  if (!ad) {
    if (adConfig.fallbackMode === "hide") return null;
    if (adConfig.fallbackMode === "placeholder" && process.env.NODE_ENV === "production") return null;
  }

  if (ad?.codeSnippet) {
    return <div className="my-6 flex justify-center"><div className="rounded-2xl overflow-hidden border border-gray-200" dangerouslySetInnerHTML={{ __html: ad.codeSnippet }} /></div>;
  }

  return (
    <Link href={ad?.targetUrl || "#"} className="block my-6 group">
      <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow max-w-[728px] mx-auto">
        {ad?.imageUrl ? (
          <img src={ad.imageUrl} alt={ad.title || "Ad"} className="w-full h-auto object-cover" />
        ) : (
          <div className="flex flex-col items-center justify-center h-[90px] bg-gradient-to-r from-teal-50 to-cyan-50">
            <span className="text-xs text-gray-400 uppercase tracking-widest mb-1">赞助内容</span>
            <span className="text-sm font-semibold text-gray-700">{ad?.title || "优质出海服务推荐"}</span>
          </div>
        )}
        <span className="absolute top-2 right-2 text-[9px] font-bold text-gray-500 bg-white/80 px-1.5 py-0.5 rounded">
          赞助 <ExternalLink className="inline w-3 h-3 ml-0.5" />
        </span>
      </div>
    </Link>
  );
}
