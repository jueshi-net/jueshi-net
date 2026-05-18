import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Package, Save } from "lucide-react";

export const metadata: Metadata = {
  title: "商品入库单 — Inbound Receipt | 海外百宝箱",
  description: "在线生成商品入库单，支持客户单位、货品名称、数量、日期、入库章样式。",
};

export default function InboundReceiptPage() {
  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <Link href="/tools/document-tools" className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 min-h-[44px]">
              <ArrowLeft className="w-4 h-4" /> 返回
            </Link>
            <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-green-600" /> 商品入库单
            </h1>
          </div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <Package className="w-16 h-16 text-green-200 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">商品入库单</h2>
          <p className="text-gray-500 mb-4">客户单位、货品名称、数量、日期、入库章样式</p>
          <p className="text-sm text-amber-600 bg-amber-50 rounded-lg px-4 py-3 inline-block">🚧 基础版已上线，后续版本增强导出功能。</p>
          <button className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 min-h-[44px]">
            <Save className="w-4 h-4" /> 保存
          </button>
        </div>
      </div>
    </div>
  );
}
