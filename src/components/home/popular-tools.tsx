import { prisma } from "@/lib/prisma";
import {
  Globe, MapPin, Hash, Calculator, Container, ArrowLeftRight, FileText, Package,
  Sparkles, Truck, Ship, Clock, Warehouse, Scale, Shield, Phone, BarChart3,
  QrCode, FileBox, Tag, Receipt, Plane, LinkIcon,
} from "lucide-react";
import Link from "next/link";

const ICON_MAP: Record<string, React.ElementType> = {
  MapPin, Hash, FileText, Globe, Sparkles, Package,
  Calculator, Plane, Ship, Clock,
  Warehouse, Scale, Shield, Phone, BarChart3, QrCode,
  ArrowLeftRight, Container, Receipt, LinkIcon,
};

// 硬编码回退列表 — 当 DB 不可用时渲染
const FALLBACK_TOOLS = [
  { name: "运费计算器", desc: "多渠道运费比价与估算", href: "/tools/shipping-calculator", icon: "Calculator" },
  { name: "HS编码查询", desc: "51,838条海关商品编码", href: "/tools/hs-code", icon: "Hash" },
  { name: "单据中心", desc: "外贸单据模板与制作工具", href: "/tools/documents", icon: "FileBox" },
  { name: "邮编查询", desc: "支持200+国家邮编校验", href: "/tools/postal-code", icon: "MapPin" },
  { name: "AI商品文案", desc: "一键生成多语言产品描述", href: "/ai-tools/product-copy", icon: "Sparkles" },
  { name: "汇率换算", desc: "实时汇率+历史走势", href: "/tools/exchange-rate", icon: "ArrowLeftRight" },
  { name: "集装箱查询", desc: "各船公司集装箱规格", href: "/tools/container", icon: "Container" },
  { name: "物流追踪", desc: "多承运商包裹实时跟踪", href: "/tracking", icon: "Truck" },
  { name: "敏感货查询", desc: "各国敏感货物清单", href: "/tools/sensitive-goods", icon: "Shield" },
  { name: "商业发票", desc: "自动生成商业发票模板", href: "/tools/commercial-invoice", icon: "FileText" },
  { name: "提单确认书", desc: "提单核对与确认", href: "/tools/handover-note", icon: "Receipt" },
  { name: "形式发票", desc: "快速生成PI单据", href: "/tools/invoice", icon: "FileText" },
  { name: "借记单", desc: "借记单生成工具", href: "/tools/debit-note", icon: "Receipt" },
  { name: "报价单", desc: "外贸报价单制作", href: "/tools/documents/quotation", icon: "Tag" },
  { name: "快递面单", desc: "快递面单批量生成", href: "/tools/shipping-label", icon: "Package" },
  { name: "收发货单", desc: "入库出库单据管理", href: "/tools/inbound", icon: "Warehouse" },
  { name: "备忘录", desc: "跨境业务备忘录", href: "/tools/memo", icon: "FileBox" },
  { name: "计算器", desc: "常用计算工具合集", href: "/tools/calculator", icon: "Calculator" },
  { name: "二维码生成", desc: "在线二维码生成器", href: "/tools/qrcode", icon: "QrCode" },
  { name: "压缩解压", desc: "文件在线压缩解压", href: "/tools/zip", icon: "FileBox" },
  { name: "时效查询", desc: "各国物流时效", href: "/logistics", icon: "Clock" },
  { name: "目的国指南", desc: "各国清关与派送", href: "/destinations", icon: "Globe" },
  { name: "资源导航", desc: "出海必备资源合集", href: "/resources", icon: "LinkIcon" },
  { name: "专题库", desc: "场景化解决方案", href: "/topics", icon: "BarChart3" },
  { name: "国际电话区号", desc: "各国区号速查", href: "/tools/postal-code", icon: "Phone" },
  { name: "重量体积换算", desc: "计费重量计算", href: "/tools/shipping-estimator", icon: "Scale" },
  { name: "装柜计算", desc: "集装箱装载方案", href: "/tools/container", icon: "Container" },
  { name: "唛头生成器", desc: "标准 shipping mark", href: "/tools/shipping-mark", icon: "Tag" },
  { name: "视频脚本SOP", desc: "短视频脚本模板", href: "/tools/video-script-sop", icon: "Sparkles" },
  { name: "收款单", desc: "外贸收款单据", href: "/tools/receipt", icon: "Receipt" },
  { name: "报价单模板", desc: "标准报价单格式", href: "/tools/documents/quotation", icon: "FileText" },
  { name: "地址格式化", desc: "国际地址标准化", href: "/tools/address-formatter", icon: "MapPin" },
  { name: "报关单生成", desc: "各国报关单据", href: "/tools/customs-generator", icon: "Shield" },
  { name: "文档工具箱", desc: "常用文档工具合集", href: "/tools/document-tools", icon: "FileBox" },
  { name: "收件入库单", desc: "入库管理工具", href: "/tools/inbound-receipt", icon: "Warehouse" },
  { name: "单据草稿", desc: "草稿箱管理", href: "/tools/documents/drafts", icon: "FileBox" },
];

export default async function PopularTools() {
  let tools: { name: string; desc: string; href: string; icon: string }[] = [];

  try {
    const dbTools = await prisma.tool.findMany({
      where: { isActive: true },
      orderBy: { popularityScore: "desc" },
      take: 36,
      select: { name: true, description: true, slug: true, route: true, url: true, isInternal: true, icon: true },
    });
    if (dbTools.length > 0) {
      tools = dbTools.map((t) => ({
        name: t.name,
        desc: t.description || "实用出海工具",
        href: t.isInternal && t.route ? t.route : (t.url || "#"),
        icon: t.icon || "Globe",
      }));
      console.log(`[PopularTools] Loaded ${tools.length} tools from DB`);
    }
  } catch (err) {
    console.error("[PopularTools] DB query failed, using fallback:", err);
  }

  // 如果 DB 无数据，使用硬编码回退列表
  if (tools.length === 0) {
    tools = FALLBACK_TOOLS;
    console.log(`[PopularTools] Using ${tools.length} fallback tools`);
  }

  return (
    <section className="w-full bg-[#f8fafc]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
        {/* Title */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#111111]">热门工具</h2>
          <Link
            href="/tools"
            className="text-xs text-[#1966f2] hover:underline"
          >
            查看全部 →
          </Link>
        </div>

        {/* Grid: 6 cols wide, 5 lg, 4 md, 3 sm, 2 xs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5">
          {tools.map((tool) => {
            const Icon = ICON_MAP[tool.icon] || Globe;
            return (
              <Link
                key={tool.name + tool.href}
                href={tool.href}
                target={tool.href.startsWith("http") ? "_blank" : undefined}
                rel={tool.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="group flex items-start gap-2.5 p-2.5 bg-white border border-[#e5e7eb] rounded-[8px] shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:border-[#1966f2]/40 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:-translate-y-[1px] transition-all"
              >
                <div className="w-8 h-8 flex items-center justify-center rounded-[6px] bg-[#f8fafc] flex-shrink-0">
                  <Icon className="w-4 h-4 text-[#666666] group-hover:text-[#1966f2] transition-colors" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#111111] group-hover:text-[#1966f2] transition-colors truncate">
                    {tool.name}
                  </div>
                  <div className="text-[11px] text-[#666666] mt-0.5 line-clamp-1 leading-snug">
                    {tool.desc}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
