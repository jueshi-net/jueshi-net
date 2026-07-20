"use client";

import { useState } from "react";
import Link from "next/link";

interface MobileFilterDrawerProps {
  params: Record<string, string | undefined>;
  categories: { id: string; name: string; providerCount: number }[];
}

const TYPE_OPTIONS = [
  { value: "ORGANIZATION", label: "企业" },
  { value: "PROFESSIONAL", label: "专业人员" },
  { value: "OFFICIAL", label: "平台官方" },
];

const VERIFICATION_OPTIONS = [
  { value: "verified", label: "已认证" },
  { value: "pending", label: "认证中" },
  { value: "unverified", label: "未认证" },
];

export function MobileFilterDrawer({ params, categories }: MobileFilterDrawerProps) {
  const [open, setOpen] = useState(false);

  function buildQuery(updates: Record<string, string | undefined>): string {
    const merged = { ...params, ...updates };
    const clean = Object.entries(merged).filter(([, v]) => v && v !== "");
    return "/service-providers?" + clean.map(([k, v]) => `${k}=${encodeURIComponent(v!)}`).join("&");
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1 text-xs text-gray-600 lg:hidden"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M6 12h12M10 20h4" />
        </svg>
        筛选
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="absolute right-0 top-0 h-full w-80 max-w-[85vw] overflow-y-auto bg-white p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">筛选</h3>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Category */}
            <div className="mb-4">
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">服务分类</h4>
              <div className="space-y-1">
                <Link
                  href={buildQuery({ categoryId: undefined, page: undefined })}
                  onClick={() => setOpen(false)}
                  className={`block rounded px-2 py-1.5 text-sm ${!params.categoryId ? "bg-blue-50 font-medium text-blue-700" : "text-gray-600"}`}
                >
                  全部分类
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={buildQuery({ categoryId: cat.id, page: undefined })}
                    onClick={() => setOpen(false)}
                    className={`block rounded px-2 py-1.5 text-sm ${params.categoryId === cat.id ? "bg-blue-50 font-medium text-blue-700" : "text-gray-600"}`}
                  >
                    {cat.name} ({cat.providerCount})
                  </Link>
                ))}
              </div>
            </div>

            {/* Type */}
            <div className="mb-4">
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">服务商类型</h4>
              <div className="space-y-1">
                {TYPE_OPTIONS.map((opt) => (
                  <Link
                    key={opt.value}
                    href={buildQuery({ type: params.type === opt.value ? undefined : opt.value, page: undefined })}
                    onClick={() => setOpen(false)}
                    className={`block rounded px-2 py-1.5 text-sm ${params.type === opt.value ? "bg-blue-50 font-medium text-blue-700" : "text-gray-600"}`}
                  >
                    {opt.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Verification */}
            <div className="mb-4">
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">认证状态</h4>
              <div className="space-y-1">
                {VERIFICATION_OPTIONS.map((opt) => (
                  <Link
                    key={opt.value}
                    href={buildQuery({ verification: params.verification === opt.value ? undefined : opt.value, page: undefined })}
                    onClick={() => setOpen(false)}
                    className={`block rounded px-2 py-1.5 text-sm ${params.verification === opt.value ? "bg-blue-50 font-medium text-blue-700" : "text-gray-600"}`}
                  >
                    {opt.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
