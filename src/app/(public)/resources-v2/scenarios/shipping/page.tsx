import { prisma } from "@/lib/prisma";
import Link from "next/link";
import JueshiV4PublicShell from '@/components/layout/JueshiV4PublicShell';
import PublicCategoryPageFrame from '@/components/templates/PublicCategoryPageFrame';

export const dynamic = "force-dynamic";

const SCENARIO = {
  title: "我要寄件",
  desc: "国际物流、快递、专线",
  icon: "📦",
  tools: [
    { name: "运费计算器", route: "/tools/shipping-calculator", icon: "🚢" },
    { name: "国际快递申报单", route: "/tools/documents/express-declaration", icon: "📋" },
  ],
  official: ["中国邮政", "海关总署"],
};

export default async function ScenarioPage() {
  let resources: any[] = [];
  let dbError = false;

  try {
    resources = await prisma.resource.findMany({
      where: {
        isActive: true,
        OR: [
          { category: "logistics" },
          { tags: { hasSome: ["物流", "快递", "shipping", "express", "专线", "寄递"] } },
        ],
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      take: 20,
    });
  } catch {
    dbError = true;
  }

  return (
    <JueshiV4PublicShell>
      <PublicCategoryPageFrame
        title={SCENARIO.title}
        description={SCENARIO.desc}
        icon={<span className="text-2xl">{SCENARIO.icon}</span>}
      >
        <div
          data-testid="resources-v2-scenario-page"
          className="space-y-6"
        >
          {/* Recommended tools */}
          <div>
            <h2 className="mb-3 text-sm font-semibold text-gray-700">
              推荐工具
            </h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {SCENARIO.tools.length > 0 ? (
                SCENARIO.tools.map((tool) => (
                  <Link
                    key={tool.route}
                    href={tool.route}
                    className="rounded-xl border bg-white p-4 transition-all hover:border-blue-300 hover:shadow-sm"
                  >
                    <div className="mb-2 text-2xl">{tool.icon}</div>
                    <div className="text-sm font-medium text-gray-800">
                      {tool.name}
                    </div>
                  </Link>
                ))
              ) : (
                <p className="col-span-full text-sm text-gray-400">
                  暂无直接关联工具
                </p>
              )}
            </div>
          </div>

          {/* Official resources */}
          <div>
            <h2 className="mb-3 text-sm font-semibold text-gray-700">
              官方资源
            </h2>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <ul className="space-y-2">
                {SCENARIO.official.map((o) => (
                  <li
                    key={o}
                    className="flex items-center gap-2 text-sm text-gray-700"
                  >
                    <span className="text-amber-500">🏛️</span>
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Related resources from DB */}
          <div>
            <h2 className="mb-3 text-sm font-semibold text-gray-700">
              相关资源
            </h2>
            {dbError ? (
              <div
                data-testid="resources-v2-empty-state"
                className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-600"
              >
                ⚠️ 资源数据加载失败,请稍后重试。
              </div>
            ) : resources.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {resources.map((r) => (
                  <a
                    key={r.id}
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl border bg-white p-4 transition-all hover:border-blue-300 hover:shadow-sm"
                    data-testid="resources-v2-resource-card"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-800">
                        {r.name}
                      </span>
                      <span
                        className={`ml-2 rounded px-1.5 py-0.5 text-xs ${
                          r.sourceType === "official"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {r.sourceType === "official" ? "官方" : "第三方"}
                      </span>
                    </div>
                    {r.description && (
                      <div className="mt-1 text-xs text-gray-400">
                        {r.description}
                      </div>
                    )}
                    {r.tags && r.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {r.tags.slice(0, 4).map((tag: string) => (
                          <span
                            key={tag}
                            className="rounded bg-gray-50 px-1.5 py-0.5 text-[10px] text-gray-400"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </a>
                ))}
              </div>
            ) : (
              <div
                data-testid="resources-v2-empty-state"
                className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center"
              >
                <div className="mb-2 text-3xl">📦</div>
                <p className="text-sm text-gray-400">
                  暂无寄件相关资源,资源库持续更新中。
                </p>
              </div>
            )}
          </div>
        </div>
      </PublicCategoryPageFrame>
    </JueshiV4PublicShell>
  );
}
