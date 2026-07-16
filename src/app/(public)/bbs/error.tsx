"use client";

import Link from "next/link";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import JueshiV4PublicShell from "@/components/layout/JueshiV4PublicShell";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <JueshiV4PublicShell>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            页面加载出错
          </h1>
          <p className="text-sm text-gray-600 mb-2">
            论坛页面加载时发生错误，请重试或返回首页。
          </p>
          {error.digest && (
            <p className="text-xs text-gray-400 mb-6">
              错误代码: {error.digest}
            </p>
          )}
          {!error.digest && <div className="mb-6" />}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-dark transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              重试
            </button>
            <Link
              href="/bbs"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <Home className="w-4 h-4" />
              返回论坛
            </Link>
          </div>
        </div>
      </div>
    </JueshiV4PublicShell>
  );
}
