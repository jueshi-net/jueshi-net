import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Search, Wrench } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* V2 Brand Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E8ECF3] shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[76px]">
            <Link href="/" className="flex items-center flex-shrink-0">
              <Image
                src="/brand/v2/logo-horizontal-color.svg"
                alt="绝世百宝箱"
                width={160}
                height={44}
                className="h-[44px] w-auto object-contain"
                priority
              />
            </Link>
            <nav className="hidden lg:flex items-center gap-6">
              <Link href="/" className="text-sm font-medium text-gray-600 hover:text-[#0A1D6B] transition-colors">首页</Link>
              <Link href="/tools" className="text-sm font-medium text-gray-600 hover:text-[#0A1D6B] transition-colors">工具</Link>
              <Link href="/guides" className="text-sm font-medium text-gray-600 hover:text-[#0A1D6B] transition-colors">指南</Link>
              <Link href="/resources" className="text-sm font-medium text-gray-600 hover:text-[#0A1D6B] transition-colors">资源</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* 404 Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-md">
          <div className="text-8xl font-bold text-gray-200 mb-4">404</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">页面未找到</h1>
          <p className="text-gray-600 mb-8">
            抱歉，您访问的页面不存在或已被移除。
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0A1D6B] text-white rounded-lg text-sm font-medium hover:bg-[#0A1D6B]/90 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              返回首页
            </Link>
            <Link
              href="/tools"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <Wrench className="w-4 h-4" />
              浏览工具
            </Link>
          </div>

          {/* Quick links */}
          <div className="mt-10 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-4">您可能想找：</p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Link href="/tools/postal-code" className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs text-gray-600 hover:border-[#0A1D6B] hover:text-[#0A1D6B] transition-colors">邮编查询</Link>
              <Link href="/tools/hs-code" className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs text-gray-600 hover:border-[#0A1D6B] hover:text-[#0A1D6B] transition-colors">HS编码</Link>
              <Link href="/tools/shipping-calculator" className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs text-gray-600 hover:border-[#0A1D6B] hover:text-[#0A1D6B] transition-colors">运费计算</Link>
              <Link href="/guides" className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs text-gray-600 hover:border-[#0A1D6B] hover:text-[#0A1D6B] transition-colors">实用指南</Link>
              <Link href="/help" className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs text-gray-600 hover:border-[#0A1D6B] hover:text-[#0A1D6B] transition-colors">帮助中心</Link>
            </div>
          </div>
        </div>
      </main>

      {/* V2 Brand Footer */}
      <footer className="bg-[#0A1D6B] text-white">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Image
                src="/brand/v2/logo-horizontal-inverse.svg"
                alt="绝世百宝箱"
                width={120}
                height={32}
                className="h-[32px] w-auto object-contain"
              />
              <span className="text-sm text-white/60">海外华人的实用工具箱</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-white/60">
              <Link href="/help" className="hover:text-white transition-colors">帮助</Link>
              <Link href="/feedback" className="hover:text-white transition-colors">反馈</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">隐私</Link>
              <Link href="/terms" className="hover:text-white transition-colors">条款</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
