'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Check, ArrowRight, Package, Star } from 'lucide-react';
import Link from 'next/link';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Animated Check */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <Check className="w-10 h-10 text-green-500" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            支付成功！
          </h1>
          <p className="text-gray-500 mb-6">
            感谢您的订阅，现在可以享受 Pro 全部功能
          </p>

          {sessionId && (
            <div className="bg-gray-50 rounded-lg p-3 mb-6">
              <p className="text-xs text-gray-400">会话 ID</p>
              <p className="text-sm font-mono text-gray-600 truncate">
                {sessionId}
              </p>
            </div>
          )}

          {/* Features Unlocked */}
          <div className="text-left bg-blue-50 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              已解锁功能
            </h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                全部导航链接
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                无限工具使用
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                高级数据分析
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                API 接口访问
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                优先技术支持
              </li>
            </ul>
          </div>

          {/* Next Steps */}
          <div className="space-y-3">
            <Link
              href="/dashboard"
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Package className="w-5 h-5" />
              前往工作台
            </Link>
            
            <Link
              href="/tools"
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              探索工具
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Receipt Link */}
        <p className="text-center text-sm text-gray-400 mt-4">
          收据已发送至您的邮箱
        </p>
      </div>
    </div>
  );
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
