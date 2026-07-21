/**
 * Canonical Quote Sheet page at /tools/documents/quotation
 * Imports the actual QuoteSheetClient from the legacy /tools/quote-sheet directory.
 */

import { Metadata } from "next";
import { Suspense } from "react";
import QuotationPageInner from "./quotation-inner";
import JueshiV4PublicShell from "@/components/layout/JueshiV4PublicShell";
import ToolWorkspaceShell from "@/components/tools/ToolWorkspaceShell";
import { FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "报价单生成器 - 绝世百宝箱",
  description: "专业外贸报价单在线生成工具，支持多币种、多条款、公司Logo，导出PDF/PNG/Word格式。适用于跨境贸易、SOHO、外贸新手。",
  alternates: {
    canonical: "https://jueshi.net/tools/documents/quotation",
  },
  robots: { index: true, follow: true },
};

export default function QuotationPage() {
  return (
    <JueshiV4PublicShell>
      <ToolWorkspaceShell title="报价单生成器"
        subtitle="专业外贸报价单在线生成工具，支持多币种、多条款、公司Logo，导出PDF/PNG/Word格式。"
      >
        <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><span className="text-gray-500">加载中...</span></div>}>
          <QuotationPageInner />
        </Suspense>
      </ToolWorkspaceShell>
    </JueshiV4PublicShell>
  );
}
