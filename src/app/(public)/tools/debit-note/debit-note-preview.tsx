/**
 * Debit Note Preview Component
 * 
 * Renders the visual preview and print content for the Debit Note.
 */

import { DebitNoteData } from './debit-note-types';

interface DebitNotePreviewProps {
  data: DebitNoteData;
  innerRef?: React.Ref<HTMLDivElement>;
}

export default function DebitNotePreview({ data, innerRef }: DebitNotePreviewProps) {
  // Recalculate subtotal for display
  const subtotal = data.items.reduce((s, i) => s + i.amount, 0);

  return (
    <div ref={innerRef} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-8 min-h-[700px] overflow-x-auto" style={{ fontFamily: "Arial, sans-serif" }}>
      <div className="min-w-[280px]">
        <h1 className="text-2xl font-bold text-center text-teal-700 mb-6">DEBIT NOTE</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-xs text-gray-500 mb-1">收款方</p>
            <p className="font-bold">{data.companyName || "—"}</p>
            <p className="text-sm text-gray-600">{data.companyPhone}{data.companyEmail ? ` · ${data.companyEmail}` : ""}</p>
            <p className="text-sm text-gray-600">{data.companyAddress || ""}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">付款方</p>
            <p className="font-bold">{data.customerName || "—"}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-sm">
          <div><span className="text-gray-500">Debit Note No: </span><span className="font-medium">{data.noteNo}</span></div>
          <div><span className="text-gray-500">Date: </span><span className="font-medium">{data.date}</span></div>
        </div>

        <table className="w-full text-sm mb-6">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left px-3 py-2 border-b font-medium">Description</th>
              <th className="text-right px-3 py-2 border-b font-medium">Amount ({data.currency})</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map(i => (
              <tr key={i.id} className="border-b border-gray-50">
                <td className="px-3 py-2 break-words">{i.description || "—"}</td>
                <td className="px-3 py-2 text-right">{i.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="text-right total">
          <span className="text-gray-500">Total: </span>
          <span className="text-teal-700 text-lg font-bold">{data.currency} {subtotal.toFixed(2)}</span>
        </div>

        {data.paymentInfo && (
          <div className="mt-6 text-sm">
            <p className="text-gray-500 mb-1">Payment Information</p>
            <p className="text-gray-900 whitespace-pre-wrap break-words">{data.paymentInfo}</p>
          </div>
        )}

        {data.notes && (
          <div className="mt-4 text-sm">
            <p className="text-gray-500 mb-1">Notes</p>
            <p className="text-gray-900 whitespace-pre-wrap break-words">{data.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
