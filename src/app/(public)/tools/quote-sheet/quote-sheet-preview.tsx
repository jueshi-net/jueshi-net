/**
 * Quote Sheet Preview Component
 *
 * Renders the printable/exportable preview of the quote sheet.
 */

"use client";

import { QuoteSheetData, calculateTotals } from "./quote-sheet-types";

interface QuoteSheetPreviewProps {
  data: QuoteSheetData;
  innerRef?: React.RefObject<HTMLDivElement | null>;
}

export default function QuoteSheetPreview({ data, innerRef }: QuoteSheetPreviewProps) {
  const total = calculateTotals(data.lines);

  return (
    <div
      ref={innerRef}
      className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-8 min-h-[700px] overflow-x-auto"
      style={{ fontFamily: "Arial, sans-serif" }}
    >
      <div className="min-w-[280px]">
        <h1 className="text-2xl font-bold text-center text-teal-700 mb-6">供应链报价单</h1>

        {/* Company & Client */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-xs text-gray-500 mb-1">报价方</p>
            <p className="font-bold">{data.companyName || "—"}</p>
            <p className="text-sm text-gray-600">
              {data.companyContact}
              {data.companyEmail ? ` · ${data.companyEmail}` : ""}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">客户</p>
            <p className="font-bold">{data.clientName || "—"}</p>
            <p className="text-sm text-gray-600">{data.clientContact || "—"}</p>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6 text-sm">
          <div>
            <span className="text-gray-500">报价日期: </span>
            <span className="font-medium">{data.quoteDate}</span>
          </div>
          <div>
            <span className="text-gray-500">有效期至: </span>
            <span className="font-medium">{data.validUntil || "—"}</span>
          </div>
        </div>

        {/* Line Items Table */}
        <table className="w-full text-sm mb-6">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left px-3 py-2 border-b font-medium">描述</th>
              <th className="text-right px-3 py-2 border-b font-medium">数量</th>
              <th className="text-right px-3 py-2 border-b font-medium">单价</th>
              <th className="text-right px-3 py-2 border-b font-medium">小计</th>
            </tr>
          </thead>
          <tbody>
            {data.lines.map((l) => (
              <tr key={l.id} className="border-b border-gray-50">
                <td className="px-3 py-2 break-words">
                  {l.description || "—"}
                  {l.weight && <span className="text-xs text-gray-400 ml-1">({l.weight})</span>}
                </td>
                <td className="px-3 py-2 text-right">{l.qty}</td>
                <td className="px-3 py-2 text-right">{l.pricePerUnit.toFixed(2)}</td>
                <td className="px-3 py-2 text-right">{(l.qty * l.pricePerUnit).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Total */}
        <div className="text-right">
          <span className="text-lg font-bold text-teal-700">总计: {total.toFixed(2)}</span>
        </div>

        {/* Channel info */}
        {data.lines.some((l) => l.channel) && (
          <p className="text-xs text-gray-500 mt-4">
            渠道: {data.lines.filter((l) => l.channel).map((l) => `${l.description}→${l.channel}`).join("; ")}
          </p>
        )}

        {/* Notes */}
        {data.lines.some((l) => l.notes) && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-1">备注</p>
            {data.lines
              .filter((l) => l.notes)
              .map((l) => (
                <p key={l.id} className="text-xs text-gray-600">
                  {l.description}: {l.notes}
                </p>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
