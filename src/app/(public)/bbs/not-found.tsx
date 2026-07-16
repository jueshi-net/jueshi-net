import Link from "next/link";
import { Home, MessageSquare } from "lucide-react";
import JueshiV4PublicShell from "@/components/layout/JueshiV4PublicShell";

export default function NotFound() {
  return (
    <JueshiV4PublicShell>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-7xl font-bold text-gray-200 mb-4">404</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            帖子或分类不存在
          </h1>
          <p className="text-gray-600 mb-8">
            您访问的帖子或分类可能已被删除、移动或从未存在。
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/bbs"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-dark transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              返回论坛
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <Home className="w-4 h-4" />
              返回首页
            </Link>
          </div>
        </div>
      </div>
    </JueshiV4PublicShell>
  );
}
