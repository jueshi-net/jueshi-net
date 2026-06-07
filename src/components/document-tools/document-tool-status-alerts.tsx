/**
 * Document Tool Status Alerts — shows loading, saved, error messages.
 */

"use client";

import { Loader2 } from "lucide-react";

interface DocumentToolStatusAlertsProps {
  loadingDraft: boolean;
  draftError: string | null;
  error: string | null;
  saved: boolean;
  saveMsg: string;
}

export default function DocumentToolStatusAlerts({
  loadingDraft,
  draftError,
  error,
  saved,
  saveMsg,
}: DocumentToolStatusAlertsProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 mt-3 space-y-2">
      {loadingDraft && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-sm text-blue-700 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> 正在加载草稿...
        </div>
      )}

      {saved && saveMsg && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-sm text-green-700">
          {saveMsg}
        </div>
      )}

      {(draftError || error) && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-sm text-red-700">
          {draftError || error}
        </div>
      )}
    </div>
  );
}
