/**
 * Document Tool Header
 * 
 * Standard header for document tool pages.
 * Contains:
 * - Back link
 * - Tool title & icon
 * - Action buttons (Preview toggle, Save, Reset, Print)
 * - ToolHistoryPanel slot
 * 
 * Usage:
 * <DocumentToolHeader
 *   title="交接单"
 *   icon={<FileText />}
 *   backHref="/tools"
 *   currentDocId={docId}
 *   toolKey="handover_note"
 *   onRestore={handleRestore}
 *   showPreview={showPreview}
 *   onTogglePreview={() => setShowPreview(!showPreview)}
 *   onSave={handleSave}
 *   onReset={handleReset}
 *   onPrint={handlePrint}
 *   saving={saving}
 *   saved={saved}
 *   saveMsg="已保存草稿"
 * />
 */

import Link from 'next/link';
import { ArrowLeft, Save, Printer, Eye, Code, Loader2 } from 'lucide-react';
import ToolHistoryPanel from '@/components/document-tools/tool-history-panel';

interface DocumentToolHeaderProps {
  /** Tool display title */
  title: string;
  /** Tool icon element */
  icon: React.ReactNode;
  /** Back navigation URL */
  backHref: string;
  /** Current document ID for history panel */
  currentDocId: string | null;
  /** Tool key for history panel */
  toolKey: string;
  /** Callback when restoring from history */
  onRestore: (dataJson: string) => void;
  /** Whether preview is currently visible */
  showPreview: boolean;
  /** Toggle preview visibility */
  onTogglePreview: () => void;
  /** Save callback */
  onSave: () => void;
  /** Reset callback */
  onReset: () => void;
  /** Print callback */
  onPrint: () => void;
  /** Is save in progress? */
  saving: boolean;
  /** Was save just successful? */
  saved: boolean;
  /** Save success message */
  saveMsg: string | null;
}

export default function DocumentToolHeader({
  title,
  icon,
  backHref,
  currentDocId,
  toolKey,
  onRestore,
  showPreview,
  onTogglePreview,
  onSave,
  onReset,
  onPrint,
  saving,
  saved,
  saveMsg,
}: DocumentToolHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 overflow-x-hidden">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        {/* Left: Back & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <Link href={backHref} className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 min-h-[44px] shrink-0">
            <ArrowLeft className="w-4 h-4" /> 返回
          </Link>
          <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2 min-w-0">
            <span className="shrink-0">{icon}</span>
            <span className="truncate">{title}</span>
          </h1>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {currentDocId && (
            <ToolHistoryPanel documentId={currentDocId} toolKey={toolKey} onRestore={onRestore} />
          )}
          
          <button
            onClick={onTogglePreview}
            className="inline-flex items-center gap-1 px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 min-h-[44px]"
          >
            {showPreview ? <><Code className="w-4 h-4" /> 编辑</> : <><Eye className="w-4 h-4" /> 预览</>}
          </button>

          <button
            onClick={onSave}
            disabled={saving}
            className="inline-flex items-center gap-1 px-4 py-2 text-sm text-white bg-teal-600 rounded-lg hover:bg-teal-700 disabled:opacity-50 min-h-[44px]"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? '保存中...' : saved ? '已保存' : '保存草稿'}
          </button>

          <button
            onClick={onReset}
            className="inline-flex items-center gap-1 px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 min-h-[44px]"
          >
            🗑️ 清空
          </button>

          <button
            onClick={onPrint}
            className="inline-flex items-center gap-1 px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 min-h-[44px]"
          >
            <Printer className="w-4 h-4" /> 打印
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {saved && saveMsg && (
        <div className="max-w-7xl mx-auto px-4 mt-3">
          <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-sm text-green-700">
            {saveMsg}
          </div>
        </div>
      )}
    </header>
  );
}
