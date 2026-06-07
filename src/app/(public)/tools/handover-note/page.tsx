/**
 * Handover Note Page
 * 
 * Server wrapper that passes draftId to the Client component.
 */
"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import HandoverNoteClient from "./handover-note-client";

export default function HandoverNotePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <HandoverNotePageInner />
    </Suspense>
  );
}

function HandoverNotePageInner() {
  const searchParams = useSearchParams();
  const draftId = searchParams?.get("draftId") ?? null;
  return <HandoverNoteClient draftId={draftId} />;
}
