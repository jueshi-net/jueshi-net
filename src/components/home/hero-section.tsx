import { Search } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="w-full bg-white">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6">
        {/* Title */}
        <h1 className="text-center text-2xl sm:text-3xl font-bold text-[#111111] tracking-tight">
          全 <span className="inline-block bg-[#178b86] text-white px-1.5 py-0.5 rounded-md mx-0.5 text-[0.85em]">出海</span> 工具箱
        </h1>
        <p className="text-center mt-1.5 text-sm text-[#666666] max-w-lg mx-auto">
          物流 · 电商 · 财税 · AI — 跨境从业者每天在用的实用工具
        </p>

        {/* Search */}
        <div className="mt-4 max-w-xl mx-auto">
          <div className="flex items-center">
            <input
              type="text"
              placeholder='搜索工具，如"运费计算"、"HS编码"…'
              className="flex-1 h-11 px-4 text-sm bg-white border border-[#e5e7eb] border-r-0 rounded-l-[8px] focus:outline-none focus:border-[#1966f2] placeholder:text-[#999999] shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
            />
            <button className="h-11 px-5 bg-[#1966f2] text-white text-sm font-medium rounded-r-[8px] hover:bg-[#1452c4] transition-colors flex items-center gap-2">
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">搜索</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
