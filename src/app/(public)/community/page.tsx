import type { Metadata } from "next";
import Link from "next/link";
import { Users, Home, ChevronRight, MessageCircle, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "社区 - 绝世百宝箱",
  description: "绝世百宝箱社区正在建设中，后续将用于海外生活、集运物流、外贸单据经验交流。",
  alternates: { canonical: "https://jueshi.net/community" },
  openGraph: {
    title: "社区 - 绝世百宝箱",
    description: "绝世百宝箱社区正在建设中，后续将用于海外生活、集运物流、外贸单据经验交流。",
    url: "https://jueshi.net/community",
    type: "website",
  },
};

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4">
          <nav className="flex items-center gap-1.5 text-sm text-blue-100 mb-6 min-h-[44px]">
            <Link href="/" className="hover:text-white transition-colors inline-flex items-center gap-1">
              <Home className="w-3.5 h-3.5" /> 首页
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white font-medium">社区</span>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full text-sm text-blue-100 border border-white/10 mb-6">
              <Users className="w-4 h-4" />
              <span>海外华人经验交流平台</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-3">社区</h1>
            <p className="text-lg text-blue-100/90 max-w-2xl leading-relaxed">
              绝世百宝箱社区正在建设中，后续将用于海外生活、集运物流、外贸单据经验交流。
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-6 pb-16 relative z-10">
        {/* 建设中提示 */}
        <div className="bg-white rounded-xl border border-gray-200 p-8 md:p-12 text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">社区正在建设中</h2>
          <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed mb-6">
            我们正在打造一个专属于海外华人的经验交流平台，涵盖集运物流、外贸单据、海外生活、留学移民等话题。
            敬请期待！
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/checklists" className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors min-h-[44px]">
              📋 查看清单
            </Link>
            <Link href="/tools" className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white text-gray-700 rounded-lg text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors min-h-[44px]">
              🛠️ 使用工具
            </Link>
            <Link href="/topics" className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white text-gray-700 rounded-lg text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors min-h-[44px]">
              📖 浏览专题
            </Link>
          </div>
        </div>

        {/* 旧论坛入口 */}
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 text-center">
          <p className="text-sm text-gray-500 mb-3">
            在正式社区上线前，您也可以访问我们的旧论坛继续交流：
          </p>
          <a
            href="https://bbs.jueshi.net"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 rounded-lg text-sm font-medium border border-gray-200 hover:bg-gray-50 hover:border-blue-300 transition-all min-h-[44px]"
          >
            <ExternalLink className="w-4 h-4" />
            旧论坛：bbs.jueshi.net
          </a>
        </div>
      </div>
    </div>
  );
}
