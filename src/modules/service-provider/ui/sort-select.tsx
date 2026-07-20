"use client";

const SORT_OPTIONS = [
  { value: "recommended", label: "推荐" },
  { value: "newest", label: "最新入驻" },
  { value: "verified", label: "已认证优先" },
  { value: "services", label: "服务数量" },
  { value: "name", label: "名称" },
];

export function SortSelect({
  currentSort,
  params,
}: {
  currentSort: string;
  params: Record<string, string | undefined>;
}) {
  function buildQuery(updates: Record<string, string | undefined>): string {
    const merged = { ...params, ...updates };
    const clean = Object.entries(merged).filter(([, v]) => v && v !== "");
    return "/service-providers?" + clean.map(([k, v]) => `${k}=${encodeURIComponent(v!)}`).join("&");
  }

  return (
    <>
      <label className="text-xs text-gray-400">排序</label>
      <select
        defaultValue={currentSort}
        onChange={(e) => {
          window.location.href = buildQuery({ sort: e.target.value, page: undefined });
        }}
        className="rounded-lg border border-gray-300 px-2 py-1 text-xs"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </>
  );
}
