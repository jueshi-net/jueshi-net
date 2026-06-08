/**
 * Document Tool Status Alerts
 * 
 * Displays loading, error, and success states for document tool operations.
 * 
 * Usage:
 * <DocumentToolStatusAlerts
 *   loadingDraft={loading}
 *   draftError={loadError}
 *   error={formError}
 *   saved={saved}
 *   saveMsg={saveMessage}
 * />
 */

import { Loader2 } from 'lucide-react';

interface DocumentToolStatusAlertsProps {
  /** Is draft currently loading? */
  loadingDraft: boolean;
  /** Draft loading error message */
  draftError: string | null;
  /** General form/validation error */
  error: string | null;
  /** Was save just successful? */
  saved: boolean;
  /** Save success message */
  saveMsg: string | null;
}

export default function DocumentToolStatusAlerts({
  loadingDraft,
  draftError,
  error,
  saved,
  saveMsg,
}: DocumentToolStatusAlertsProps) {
  return (
    <>
      {/* Loading Draft */}
      {loadingDraft && (
        <div className="max-w-7xl mx-auto px-4 mt-3">
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-sm text-blue-700 flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> 正在加载草稿...
          </div>
        </div>
      )}

      {/* Draft Error */}
      {draftError && (
        <div className="max-w-7xl mx-auto px-4 mt-3">
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-sm text-red-700">
            {draftError}
          </div>
        </div>
      )}

      {/* General Error */}
      {error && !draftError && (
        <div className="max-w-7xl mx-auto px-4 mt-3">
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-sm text-red-700">
            {error}
          </div>
        </div>
      )}

      {/* Save Success */}
      {saved && saveMsg && (
        <div className="max-w-7xl mx-auto px-4 mt-3">
          <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-sm text-green-700">
            {saveMsg}
          </div>
        </div>
      )}
    </>
  );
}
