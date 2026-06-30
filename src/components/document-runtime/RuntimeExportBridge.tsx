/**
 * RuntimeExportBridge — 导出能力桥接组件
 * 
 * 在自定义工具中渲染导出按钮（PDF/Word/Print），
 * 并自动检查会员权益 — 非会员只能预览不能导出。
 * 
 * 使用方式（在自定义工具内部）：
 * const { export: exportAdapter } = useRuntimeContext();
 * if (exportAdapter) {
 *   return <RuntimeExportBridge adapter={exportAdapter} data={formData} />;
 * }
 * 
 * @module document-runtime/RuntimeExportBridge
 */

"use client";

import React, { useState } from "react";
import { Download, FileText, Printer, Loader2, Lock } from "lucide-react";
import type { ExportAdapter, ExportType } from "@/lib/document-runtime/types";

interface RuntimeExportBridgeProps {
  adapter: ExportAdapter;
  /** 要导出的数据 */
  data: unknown;
  /** 自定义渲染 */
  renderCustom?: (adapter: ExportAdapter, data: unknown) => React.ReactNode;
  /** data-testid 前缀 */
  testIdPrefix?: string;
}

const EXPORT_CONFIG: Record<ExportType, { label: string; icon: React.ElementType }> = {
  pdf: { label: "导出 PDF", icon: Download },
  word: { label: "导出 Word", icon: FileText },
  excel: { label: "导出 Excel", icon: FileText },
  print: { label: "打印", icon: Printer },
  image: { label: "导出图片", icon: Download },
};

export default function RuntimeExportBridge({
  adapter,
  data,
  renderCustom,
  testIdPrefix = "runtime-export",
}: RuntimeExportBridgeProps) {
  const [exporting, setExporting] = useState<ExportType | null>(null);

  if (renderCustom) {
    return <>{renderCustom(adapter, data)}</>;
  }

  const { formats, handleExport, isEntitled } = adapter;

  const onExport = async (type: ExportType) => {
    if (!isEntitled(type)) return;
    setExporting(type);
    try {
      await handleExport(type, data);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div data-testid={testIdPrefix} className="flex items-center gap-2">
      {formats.map((type) => {
        const config = EXPORT_CONFIG[type];
        const Icon = config.icon;
        const entitled = isEntitled(type);
        const isExporting = exporting === type;

        return (
          <button
            key={type}
            data-testid={`${testIdPrefix}-${type}`}
            onClick={() => onExport(type)}
            disabled={!entitled || isExporting}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors ${
              entitled
                ? "border border-gray-200 text-gray-600 hover:bg-gray-50"
                : "border border-gray-100 text-gray-300 cursor-not-allowed"
            }`}
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : !entitled ? (
              <Lock className="w-4 h-4" />
            ) : (
              <Icon className="w-4 h-4" />
            )}
            {config.label}
          </button>
        );
      })}
    </div>
  );
}
