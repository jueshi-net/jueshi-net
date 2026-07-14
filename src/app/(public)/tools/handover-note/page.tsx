"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import HandoverNoteClient from "./handover-note-client";
import JueshiV4PublicShell from "@/components/layout/JueshiV4PublicShell";
import PublicLandingPageFrame from "@/components/templates/PublicLandingPageFrame";
import { FileText } from "lucide-react";

export default function HandoverNotePage() {
  return (
    <JueshiV4PublicShell>
      <PublicLandingPageFrame
        title="交接单"
        description="生成交接单文档，支持公司资料、草稿保存和导出功能。"
        icon={<FileText className="w-6 h-6" />}
        variant="tool"
      >
        <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
          <HandoverNotePageInner />
        </Suspense>
      </PublicLandingPageFrame>
    </JueshiV4PublicShell>
  );
}

function HandoverNotePageInner() {
  const searchParams = useSearchParams();
  const draftId = searchParams?.get("draftId") ?? null;
  return <HandoverNoteClient draftId={draftId} />;
}
