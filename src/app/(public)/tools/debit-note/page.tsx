import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileText, Save } from "lucide-react";

export const metadata: Metadata = {
  title: "Debit Note 生成器 | 海外百宝箱",
  description: "在线生成 Debit Note，支持客户信息、运输明细、费用项、银行信息、保存图片、打印/PDF。",
};

export default function DebitNotePage() {
  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <Link href="/tools/document-tools" className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 min-h-[44px]"><ArrowLeft className="w-4 h-4" /> 返回</Link>
            <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2"><FileText className="w-5 h-5 text-indigo-600" /> Debit Note</h1>
          </div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <FileText className="w-16 h-16 text-indigo-200 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Debit Note 生成器</h2>
          <p className="text-gray-500 mb-4">客户信息、运输明细、费用项、银行信息、保存/打印</p>
          <p className="text-sm text-amber-600 bg-amber-50 rounded-lg px-4 py-3 inline-block">🚧 基础版已上线，后续版本增强。</p>
          <button className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 min-h-[44px]"><Save className="w-4 h-4" /> 保存</button>
        </div>
      </div>
    </div>
  );
}
