import Link from "next/link";
import { Check } from "lucide-react";

export default function PromoSection() {
  const features = [
    "海量工具 · 免费使用",
    "实时数据 · 精准可靠",
    "专业客服 · 快速响应",
  ];

  return (
    <section className="w-full bg-gradient-to-r from-[#0077e8] to-[#2090ff]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left */}
          <div className="text-white">
            <h2 className="text-2xl font-bold mb-4">为什么选择海外百宝箱？</h2>
            <div className="space-y-3 mb-6">
              {features.map((f) => (
                <div key={f} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm">{f}</span>
                </div>
              ))}
            </div>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-[#0077e8] text-sm font-bold rounded-[8px] hover:bg-white/90 transition-colors"
            >
              立即使用
            </Link>
          </div>

          {/* Right: Visual placeholder */}
          <div className="hidden md:flex items-center justify-center">
            <div className="relative w-full max-w-sm">
              {/* Decorative cards */}
              <div className="bg-white/10 backdrop-blur-sm rounded-[10px] p-4 border border-white/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-white/20 rounded-[8px] flex items-center justify-center">
                    <span className="text-white text-lg">🚢</span>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">物流专线</div>
                    <div className="text-xs text-white/70">实时追踪 · 多渠道</div>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div className="w-3/4 h-full bg-white rounded-full" />
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 bg-white/10 backdrop-blur-sm rounded-[10px] p-3 border border-white/20">
                <div className="text-xs text-white font-bold">200+ 国家覆盖</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
