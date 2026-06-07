/**
 * Debit Note Page
 * 
 * Server wrapper that passes draftId to the Client component.
 */
"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import DebitNoteClient from "./debit-note-client";

export default function DebitNotePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <DebitNotePageInner />
    </Suspense>
  );
}

function DebitNotePageInner() {
  const searchParams = useSearchParams();
  const draftId = searchParams?.get("draftId") ?? null;
  return <DebitNoteClient draftId={draftId} />;
}
