"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import HandoverNoteClient from "./handover-note-client";
import ToolWorkspaceShell from "@/components/tools/ToolWorkspaceShell";

export default function HandoverNotePage() {
  return (
    <ToolWorkspaceShell
      title="交接单"
      subtitle="生成交接单文档，支持公司资料、草稿保存和导出功能。"
    >
      <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
        <HandoverNotePageInner />
      </Suspense>
    </ToolWorkspaceShell>
  );
}

function HandoverNotePageInner() {
  const searchParams = useSearchParams();
  const draftId = searchParams?.get("draftId") ?? null;
  return <HandoverNoteClient draftId={draftId} />;
}
