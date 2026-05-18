import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Receipt, Save, Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "供应链报价单生成器 — Quote Sheet | 海外百宝箱",
  description: "在线生成供应链报价单，支持重量段、渠道、时效、备注，可保存历史记录。",
};

export default function QuoteSheetPage() {
  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <Link href="/tools/document-tools" className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 min-h-[44px]">
              <ArrowLeft className="w-4 h-4" /> 返回
            </Link>
            <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-blue-600" /> 供应链报价单
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <Receipt className="w-16 h-16 text-blue-200 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">供应链报价单生成器</h2>
          <p className="text-gray-500 mb-6">
            重量段、渠道、时效、备注、导出 Excel、生成长图
          </p>
          <p className="text-sm text-amber-600 bg-amber-50 rounded-lg px-4 py-3 inline-block">
            🚧 基础版已上线，完整功能（导出 Excel、长图生成）将在后续版本增强。
          </p>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-md mx-auto">
            <input placeholder="客户名称" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
            <input placeholder="报价日期" type="date" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
            <textarea placeholder="渠道 / 重量段 / 时效 / 备注" rows={4} className="w-full px-3 py-2 border rounded-lg text-sm sm:col-span-2" />
          </div>
          <button className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 min-h-[44px]">
            <Save className="w-4 h-4" /> 保存
          </button>
        </div>
      </div>
    </div>
  );
}
