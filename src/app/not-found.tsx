import Link from "next/link";
import { PackageSearch, ArrowLeft, Search, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="fixed inset-0 bg-gray-50 flex items-center justify-center px-4 z-50">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <PackageSearch className="w-12 h-12 text-blue-600" />
        </div>
        <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
        <h2 className="text-xl font-semibold text-gray-700 mb-3">页面未找到</h2>
        <p className="text-gray-500 mb-8">
          抱歉，您访问的页面不存在或已被移除
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/" className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
            <Home className="w-4 h-4" /> 返回首页
          </Link>
          <Link href="/search" className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors">
            <Search className="w-4 h-4" /> 搜索
          </Link>
        </div>
      </div>
    </div>
  );
}
