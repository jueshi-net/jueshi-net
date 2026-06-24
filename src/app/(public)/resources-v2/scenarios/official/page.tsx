import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

const SCENARIO = {
  "title": "我要找官方机构",
  "desc": "海关、邮政、商务部门",
  "icon": "🏛️",
  "tools": [],
  "resources": [
    "中国海关",
    "中国邮政",
    "商务部",
    "国家外汇管理局"
  ],
  "official": [
    "海关总署",
    "中国邮政集团",
    "商务部"
  ]
};

export default async function ScenarioPage() {
  let resources: any[] = [];
  try {
    resources = await prisma.resource.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      take: 20,
    });
  } catch {}

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/resources-v2" className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block">
          ← 返回资源导航
        </Link>

        <div className="bg-white rounded-xl border p-6 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{SCENARIO.icon}</span>
            <div>
              <h1 className="text-xl font-bold text-gray-800">{SCENARIO.title}</h1>
              <p className="text-sm text-gray-500">{SCENARIO.desc}</p>
            </div>
          </div>
        </div>

        <div data-testid="resources-v2-scenario-page" className="space-y-6">
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-3">推荐工具</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {SCENARIO.tools.length > 0 ? (
                SCENARIO.tools.map((tool: any) => (
                  <Link
                    key={tool.route}
                    href={tool.route}
                    className="bg-white rounded-xl border p-4 hover:border-blue-300 hover:shadow-sm transition-all"
                  >
                    <div className="text-2xl mb-2">{tool.icon}</div>
                    <div className="text-sm font-medium text-gray-800">{tool.name}</div>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-gray-400 col-span-full">暂无直接关联工具</p>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-3">官方资源</h2>
            <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
              <ul className="space-y-2">
                {SCENARIO.official.map((o: string) => (
                  <li key={o} className="text-sm text-gray-700 flex items-center gap-2">
                    <span className="text-amber-500">🏛️</span>
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-3">相关资源</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {resources.slice(0, 6).map((r: any) => (
                <a
                  key={r.id}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white rounded-xl border p-4 hover:border-blue-300 hover:shadow-sm transition-all"
                >
                  <div className="text-sm font-medium text-gray-800">{r.name}</div>
                  <div className="text-xs text-gray-400 mt-1">{r.description || ""}</div>
                  <div className="text-xs text-blue-500 mt-1">{r.sourceType === "official" ? "官方" : "第三方"}</div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
