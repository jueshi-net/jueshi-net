"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, Box, Check } from "lucide-react";

export default function HeroSection({ stats }: { stats: { tools: number; users: number; docs: number; topics: number } }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = useCallback(() => {
    const q = query.trim();
    if (!q) return;
    router.push(`/tools?q=${encodeURIComponent(q)}`);
  }, [query, router]);

  const trustItems = [
    stats.tools > 0 ? `已上线 ${stats.tools} 个专业工具` : "专业工具持续更新",
    stats.docs > 0 ? `已生成 ${stats.docs}+ 份单据` : "草稿永久保存",
    stats.users > 0 ? `${stats.users}+ 用户正在使用` : "支持公司资料复用",
  ];

  return (
    <section className="w-full bg-gradient-to-b from-white via-[#f8fafc] to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
              <span className="text-teal-600">绝世百宝箱</span>
            </h1>
            <p className="mt-3 text-base sm:text-lg text-gray-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              海外华人的实用工具箱
              <span className="text-gray-900 font-semibold">一个账号全部搞定</span>
            </p>

            <div className="mt-5 flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 text-sm text-gray-500">
              {trustItems.map((t) => (
                <span key={t} className="flex items-center gap-1.5"><Check className="w-4 h-4 text-teal-500" />{t}</span>
              ))}
            </div>

            <div className="mt-6 max-w-lg mx-auto lg:mx-0">
              <div className="flex items-center shadow-lg rounded-2xl border border-gray-200 bg-white overflow-hidden">
                <Search className="w-5 h-5 text-gray-400 ml-4 shrink-0" />
                <input
                  type="text"
                  placeholder="搜索工具、文章、专题…"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleSearch(); }}
                  className="flex-1 h-12 px-3 text-base bg-transparent focus:outline-none placeholder:text-gray-400"
                />
                <button
                  onClick={handleSearch}
                  className="h-12 px-5 bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-colors shrink-0 flex items-center gap-1.5"
                >
                  <Search className="w-4 h-4" /><span className="hidden sm:inline">搜索</span>
                </button>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <Link href="/tools" className="inline-flex items-center gap-2 px-6 py-2.5 bg-teal-600 text-white text-sm font-semibold rounded-2xl hover:bg-teal-700 transition-all shadow-md hover:shadow-lg">
                立即开始 <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/register" className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-gray-700 text-sm font-semibold rounded-2xl border border-gray-300 hover:bg-gray-50 transition-all">
                免费注册
              </Link>
            </div>
          </div>

          <div className="hidden lg:flex items-center justify-center">
            <div className="relative w-full max-w-lg">
              <div className="bg-white rounded-[20px] shadow-xl border border-gray-200 p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center"><Box className="w-5 h-5 text-teal-600" /></div>
                  <div><div className="text-sm font-bold text-gray-900">工具矩阵</div><div className="text-xs text-gray-500">{stats.tools}+ 实用工具</div></div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {["📦 运费计算", "📄 商业发票", "🔍 HS编码", "💱 汇率换算", "📮 邮编查询", "🤖 AI 文案"].map((t) => (
                    <div key={t} className="p-2 bg-gray-50 rounded-xl text-center text-[11px] font-medium text-gray-700 border border-gray-100">{t}</div>
                  ))}
                </div>
              </div>
              <div className="absolute -top-3 -right-3 bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg">免费使用</div>
              <div className="absolute -bottom-3 -left-3 bg-teal-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg">持续更新</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
