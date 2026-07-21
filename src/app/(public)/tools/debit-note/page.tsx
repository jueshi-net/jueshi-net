/**
 * Debit Note Page
 * 
 * Server wrapper that passes draftId to the Client component.
 */
"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import DebitNoteClient from "./debit-note-client";
import ToolWorkspaceShell from "@/components/tools/ToolWorkspaceShell";

export default function DebitNotePage() {
  return (
    <ToolWorkspaceShell
      title="借记单"
      subtitle="快速生成专业借记单据，支持PDF导出"
    >
      <Suspense fallback={<div className="flex items-center justify-center py-12"><div className="text-gray-500">加载中...</div></div>}>
        <DebitNotePageInner />
      </Suspense>
    </ToolWorkspaceShell>
  );
}

function DebitNotePageInner() {
  const searchParams = useSearchParams();
  const draftId = searchParams?.get("draftId") ?? null;
  return <DebitNoteClient draftId={draftId} />;
}
