"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

const SLIDES = [
  {
    href: "/topics/canada-shipping",
    title: "加拿大专线集运指南",
    desc: "从中国到多伦多/温哥华，海运/空运全渠道攻略",
    image: "https://images.unsplash.com/photo-1517940310602-26535839fe84?q=80&w=800&auto=format&fit=crop",
    tag: "集运专线",
  },
  {
    href: "/topics/sea-cross-border",
    title: "东南亚跨境电商实战",
    desc: "Shopee/Lazada/TikTok 全链路运营",
    image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=800&auto=format&fit=crop",
    tag: "东南亚",
  },
  {
    href: "/topics/uk-compliance",
    title: "英国本土店合规运营",
    desc: "VAT 注册·产品认证·平台规则·税务申报",
    image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=800&auto=format&fit=crop",
    tag: "欧洲合规",
  },
  {
    href: "/topics/ai-automation",
    title: "AI 自动化应用工具",
    desc: "跨境卖家如何用 AI 提升效率",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=800&auto=format&fit=crop",
    tag: "AI 工具",
  },
  {
    href: "/topics/digital-nomad",
    title: "数字游民签证合集",
    desc: "热门国家长居/工作签证指南",
    image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=800&auto=format&fit=crop",
    tag: "签证",
  },
  {
    href: "/topics/overseas-bank",
    title: "海外开户攻略全解",
    desc: "多国银行开户条件与流程",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=800&auto=format&fit=crop",
    tag: "金融",
  },
];

export default function FeaturedSlider() {
  const [pos, setPos] = useState(0);
  const visible = 4;
  const maxPos = Math.max(0, SLIDES.length - visible);
  const go = (d: number) => setPos((p) => Math.max(0, Math.min(maxPos, p + d)));

  return (
    <section className="w-full bg-white">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
        {/* Mobile title */}
        <h2 className="md:hidden text-base font-bold text-[#111111] mb-3">精品专题</h2>
        <div className="flex gap-8">
          {/* Left: Info */}
          <div className="hidden md:flex flex-col justify-center w-1/4 shrink-0">
            <h2 className="text-2xl font-bold text-[#111111] mb-2">精品专题</h2>
            <p className="text-sm text-[#666666] mb-6">精选出海场景，一站式解决方案</p>
            <div className="flex gap-2">
              <button
                onClick={() => go(-1)}
                disabled={pos === 0}
                className="w-10 h-10 flex items-center justify-center rounded-[8px] border border-[#e5e7eb] hover:border-[#1966f2] hover:text-[#1966f2] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => go(1)}
                disabled={pos >= maxPos}
                className="w-10 h-10 flex items-center justify-center rounded-[8px] border border-[#e5e7eb] hover:border-[#1966f2] hover:text-[#1966f2] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Right: Scrollable cards (desktop) + compact list (mobile) */}
          <div className="flex-1 overflow-hidden">
            {/* Desktop slider */}
            <div className="hidden md:block">
              <div
                className="flex gap-3 transition-transform duration-300"
                style={{ transform: `translateX(-${pos * (100 / visible)}%)` }}
              >
                {SLIDES.map((slide) => (
                  <div key={slide.href} className="w-[calc(25%-9px)] shrink-0">
                    <Link href={slide.href} className="group block rounded-[10px] overflow-hidden border border-[#e5e7eb] hover:border-[#1966f2]/30 transition-colors">
                      <div className="relative h-24 bg-[#f0f0f0]">
                        <Image src={slide.image} alt={slide.title} fill className="object-cover group-hover:scale-[1.02] transition-transform" />
                        <span className="absolute top-2 left-2 text-[10px] font-medium text-white bg-[#1966f2] px-1.5 py-0.5 rounded-md">
                          {slide.tag}
                        </span>
                      </div>
                      <div className="p-3">
                        <div className="text-sm font-bold text-[#111111] group-hover:text-[#1966f2] transition-colors line-clamp-1">
                          {slide.title}
                        </div>
                        <div className="text-xs text-[#666666] mt-0.5 line-clamp-2">{slide.desc}</div>
                        <div className="mt-2 text-xs text-[#1966f2] font-medium flex items-center gap-1">
                          Learn more <ArrowRight className="w-3 h-3" />
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile: compact vertical list */}
            <div className="md:hidden space-y-2">
              {SLIDES.map((slide) => (
                <Link key={slide.href + "-m"} href={slide.href} className="flex items-center gap-3 p-2 bg-white border border-[#e5e7eb] rounded-[8px] hover:border-[#1966f2]/30 transition-colors">
                  <div className="relative w-12 h-12 shrink-0 rounded-[6px] overflow-hidden bg-[#f0f0f0]">
                    <Image src={slide.image} alt={slide.title} fill className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-medium text-[#1966f2] bg-[#1966f2]/10 px-1.5 py-0.5 rounded shrink-0">
                        {slide.tag}
                      </span>
                      <span className="text-xs font-bold text-[#111111] truncate">{slide.title}</span>
                    </div>
                    <div className="text-[11px] text-[#666666] mt-0.5 line-clamp-1">{slide.desc}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#ccc] shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
