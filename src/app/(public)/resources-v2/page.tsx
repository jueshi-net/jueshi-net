import { prisma } from "@/lib/prisma";
import ResourcesV2Client from "./resources-v2-client";

export const dynamic = "force-dynamic";

const SCENARIOS = [
  { slug: "shipping", title: "我要寄件", desc: "国际物流、快递、专线", icon: "📦", color: "bg-blue-50 hover:bg-blue-100 border-blue-200" },
  { slug: "invoice", title: "我要做发票", desc: "商业发票、形式发票", icon: "🧾", color: "bg-green-50 hover:bg-green-100 border-green-200" },
  { slug: "postal", title: "我要查邮编", desc: "邮编查询、地址格式化", icon: "📮", color: "bg-purple-50 hover:bg-purple-100 border-purple-200" },
  { slug: "official", title: "我要找官方机构", desc: "海关、邮政、商务部门", icon: "🏛️", color: "bg-amber-50 hover:bg-amber-100 border-amber-200" },
  { slug: "documents", title: "我要做外贸单据", desc: "报价、合同、装箱单", icon: "📋", color: "bg-rose-50 hover:bg-rose-100 border-rose-200" },
  { slug: "payment", title: "我要找跨境收款", desc: "收款平台、汇率查询", icon: "💰", color: "bg-emerald-50 hover:bg-emerald-100 border-emerald-200" },
  { slug: "company", title: "我要注册公司", desc: "海外公司注册指南", icon: "🏢", color: "bg-indigo-50 hover:bg-indigo-100 border-indigo-200" },
  { slug: "customs", title: "我要查海关", desc: "HS编码、报关流程", icon: "🛃", color: "bg-cyan-50 hover:bg-cyan-100 border-cyan-200" },
  { slug: "life", title: "我要海外生活", desc: "签证、学校、日常生活", icon: "🎓", color: "bg-pink-50 hover:bg-pink-100 border-pink-200" },
];

const POPULAR_COUNTRIES = [
  { code: "CA", name: "加拿大", flag: "🇨🇦" },
  { code: "US", name: "美国", flag: "🇺🇸" },
  { code: "AU", name: "澳大利亚", flag: "🇦🇺" },
  { code: "GB", name: "英国", flag: "🇬🇧" },
  { code: "JP", name: "日本", flag: "🇯🇵" },
  { code: "DE", name: "德国", flag: "🇩🇪" },
];

const RELATED_TOOLS = [
  { name: "商业发票", route: "/tools/documents/commercial-invoice", icon: "🧾" },
  { name: "装箱单", route: "/tools/documents/packing-list", icon: "📦" },
  { name: "邮编查询", route: "/tools/postal-code", icon: "📮" },
  { name: "HS编码", route: "/tools/hs-code", icon: "🔍" },
  { name: "汇率查询", route: "/tools/exchange-rate", icon: "💱" },
  { name: "运费计算", route: "/tools/shipping-calculator", icon: "🚢" },
];

export default async function ResourcesV2Page() {
  let resources: any[] = [];
  let officialResources: any[] = [];
  let dbError = false;

  try {
    [resources, officialResources] = await Promise.all([
      prisma.resource.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        take: 50,
      }),
      prisma.resource.findMany({
        where: { isActive: true, sourceType: "official" },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        take: 8,
      }),
    ]);
  } catch {
    // DB not available — client will render error state
    dbError = true;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ResourcesV2Client
        scenarios={SCENARIOS}
        countries={POPULAR_COUNTRIES}
        tools={RELATED_TOOLS}
        error={dbError}
        resources={resources.map((r) => ({
          id: r.id,
          name: r.name,
          url: r.url,
          description: r.description || "",
          category: r.category,
          sourceType: r.sourceType,
          usage: r.usage || "",
          tags: r.tags || [],
        }))}
        officialResources={officialResources.map((r) => ({
          id: r.id,
          name: r.name,
          url: r.url,
          description: r.description || "",
        }))}
      />
    </div>
  );
}
