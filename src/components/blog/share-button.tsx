'use client';
import { Share2 } from "lucide-react";

export function ShareButton({ url }: { url: string }) {
  return (
    <button
      onClick={() => navigator.clipboard?.writeText(url)}
      className="flex items-center gap-1.5 text-gray-400 hover:text-blue-600 transition-colors"
    >
      <Share2 className="w-4 h-4" />
      分享
    </button>
  );
}
