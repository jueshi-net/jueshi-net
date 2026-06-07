/**
 * Handover Note Preview Component
 * 
 * Renders the visual preview and print content for the Handover Note.
 * Used in both the main preview panel and the print helper.
 */

import { HandoverNoteData } from './handover-note-types';

interface HandoverNotePreviewProps {
  data: HandoverNoteData;
  innerRef?: React.Ref<HTMLDivElement>;
}

export default function HandoverNotePreview({ data, innerRef }: HandoverNotePreviewProps) {
  return (
    <div ref={innerRef} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-8 min-h-[700px] overflow-x-auto" style={{ fontFamily: "Arial, sans-serif" }}>
      <div className="min-w-[280px]">
        <h1 className="text-2xl font-bold text-center text-teal-700 mb-6">货物交接单</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-xs text-gray-500 mb-1">交接方</p>
            <p className="font-bold">{data.fromParty || data.companyName || "—"}</p>
            <p className="text-sm text-gray-600">{data.companyPhone}{data.companyEmail ? ` · ${data.companyEmail}` : ""}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">接收方</p>
            <p className="font-bold">{data.toParty || "—"}</p>
            <p className="text-sm text-gray-600">{data.contact || ""}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-sm">
          <div><span className="text-gray-500">交接单号: </span><span className="font-medium">{data.handoverNo}</span></div>
          <div><span className="text-gray-500">日期: </span><span className="font-medium">{data.date}</span></div>
          <div><span className="text-gray-500">件数: </span><span className="font-medium">{data.packages}</span></div>
        </div>

        {data.cargoDescription && (
          <div className="mb-6 text-sm">
            <p className="text-gray-500 mb-1">货物描述</p>
            <p className="text-gray-900 whitespace-pre-wrap break-words">{data.cargoDescription}</p>
          </div>
        )}

        {data.notes && (
          <div className="mb-6 text-sm">
            <p className="text-gray-500 mb-1">备注</p>
            <p className="text-gray-900 whitespace-pre-wrap break-words">{data.notes}</p>
          </div>
        )}

        <div className="sig mt-12 pt-8 border-t border-gray-200">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-8">交接人签字</p>
            <p className="text-sm text-gray-400">_______________</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-8">接收人签字</p>
            <p className="text-sm text-gray-400">_______________</p>
          </div>
        </div>
      </div>
    </div>
  );
}
