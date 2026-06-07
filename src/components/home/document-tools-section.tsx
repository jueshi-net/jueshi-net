import Link from "next/link";
import { ArrowRight, FileText, Package, Tag, Receipt, Truck, Sparkles, FileCheck, Shield, Send, Calculator, CreditCard, Clipboard } from "lucide-react";
import { prisma } from "@/lib/prisma";

// Lucide icon name → component mapping
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  FileText, Package, Tag, Receipt, Truck, Sparkles, FileCheck, Shield, Send, Calculator, CreditCard, Clipboard,
};

// Modern tool slugs that should appear first
const MODERN_SLUGS = [
  'commercial-invoice',
  'shipping-label',
  'quote-sheet',
  'inbound-receipt',
  'handover-note',
  'debit-note',
];

// Default fallback icons per slug
const defaultIcons: Record<string, string> = {
  'commercial-invoice': 'FileText',
  'shipping-label': 'Package',
  'quote-sheet': 'Tag',
  'inbound-receipt': 'Receipt',
  'handover-note': 'Truck',
  'debit-note': 'FileText',
  'video-script-sop': 'Sparkles',
  'proforma-invoice': 'FileText',
  'sales-contract': 'FileCheck',
  'packing-list': 'Package',
  'booking-instruction': 'Clipboard',
  'shipping-instruction': 'Truck',
  'delivery-note': 'Truck',
  'trucking-dispatch-order': 'Truck',
  'container-loading-list': 'Package',
  'customs-declaration-authorization': 'Shield',
  'express-declaration': 'Send',
  'certificate-of-origin-template': 'FileCheck',
  'fumigation-certificate-template': 'Shield',
  'consolidation-packing-list': 'Package',
  'return-packing-list': 'Package',
  'freight-statement': 'Calculator',
  'letter-of-credit-info-sheet': 'CreditCard',
  'shipping-mark': 'Tag',
};

// Descriptions for legacy tools
const defaultDescriptions: Record<string, string> = {
  'commercial-invoice': '自动生成商业发票，符合各国海关要求',
  'shipping-label': '快递面单批量生成，支持多承运商格式',
  'quote-sheet': '标准外贸报价单模板，快速制作专业报价',
  'inbound-receipt': '入库出库单据管理，仓库收发一目了然',
  'handover-note': '提单确认书生成，跨境交接标准文档',
  'debit-note': '借记单快速制作，财务结算必备工具',
  'video-script-sop': '短视频脚本 SOP 模板，提升内容产出效率',
  'proforma-invoice': '形式发票模板，用于预付款和样品确认',
  'sales-contract': '外贸销售合同模板，标准交易条款',
  'packing-list': '装箱单模板，列明货物明细与包装信息',
  'booking-instruction': '订舱委托书，向货代提交订舱申请',
  'shipping-instruction': '补料/提单确认书，确认提单内容',
  'delivery-note': '送货单模板，物流交接凭证',
  'trucking-dispatch-order': '拖车派车单，调度集卡运输',
  'container-loading-list': '装柜清单，记录集装箱装载明细',
  'customs-declaration-authorization': '报关委托书，授权代理报关',
  'express-declaration': '快件报关单，国际快递申报',
  'certificate-of-origin-template': '原产地证模板，享受关税优惠',
  'fumigation-certificate-template': '熏蒸证明模板，木质包装必备',
  'consolidation-packing-list': '集运装箱单，多包裹合并装箱',
  'return-packing-list': '退运装箱单，退货/退运场景',
  'freight-statement': '运费清单，物流费用明细统计',
  'letter-of-credit-info-sheet': '信用证信息单，L/C 条款摘要',
  'shipping-mark': '唛头通用模板，外箱标识规范',
};

interface DocToolItem {
  name: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  slug: string;
}

async function getDocumentTools(): Promise<DocToolItem[]> {
  try {
    const tools = await prisma.tool.findMany({
      where: { isActive: true, category: 'documents' },
      select: { name: true, slug: true, description: true, icon: true, route: true },
    });

    const seen = new Set<string>();
    const result: DocToolItem[] = [];

    // Phase 1: Modern tools first (by predefined order)
    for (const slug of MODERN_SLUGS) {
      const tool = tools.find(t => t.slug === slug);
      if (tool && !seen.has(slug)) {
        seen.add(slug);
        const icon = iconMap[tool.icon || defaultIcons[slug] || 'FileText'] || FileText;
        result.push({
          name: tool.name,
          desc: tool.description || defaultDescriptions[slug] || '单据模板生成工具',
          icon,
          href: tool.route || `/tools/documents/${slug}`,
          slug,
        });
      }
    }

    // Phase 2: Remaining legacy tools
    for (const tool of tools) {
      if (!seen.has(tool.slug)) {
        seen.add(tool.slug);
        const icon = iconMap[tool.icon || defaultIcons[tool.slug] || 'FileText'] || FileText;
        result.push({
          name: tool.name,
          desc: tool.description || defaultDescriptions[tool.slug] || '单据模板生成工具',
          icon,
          href: tool.route || `/tools/documents/${tool.slug}`,
          slug: tool.slug,
        });
      }
    }

    return result;
  } catch {
    // Safe fallback on DB failure
    return [
      { name: 'Commercial Invoice', desc: '自动生成商业发票，符合各国海关要求', icon: FileText, href: '/tools/documents/commercial-invoice', slug: 'commercial-invoice' },
      { name: 'Shipping Label', desc: '快递面单批量生成，支持多承运商格式', icon: Package, href: '/tools/documents/shipping-label', slug: 'shipping-label' },
      { name: 'Quote Sheet', desc: '标准外贸报价单模板，快速制作专业报价', icon: Tag, href: '/tools/documents/quote-sheet', slug: 'quote-sheet' },
      { name: 'Inbound Receipt', desc: '入库出库单据管理，仓库收发一目了然', icon: Receipt, href: '/tools/documents/inbound-receipt', slug: 'inbound-receipt' },
      { name: 'Handover Note', desc: '提单确认书生成，跨境交接标准文档', icon: Truck, href: '/tools/documents/handover-note', slug: 'handover-note' },
      { name: 'Debit Note', desc: '借记单快速制作，财务结算必备工具', icon: FileText, href: '/tools/documents/debit-note', slug: 'debit-note' },
    ];
  }
}

export default async function DocumentToolsSection() {
  const tools = await getDocumentTools();
  // Limit to 12 items for homepage display
  const displayTools = tools.slice(0, 12);

  return (
    <section className="w-full bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">外贸单据工具箱</h2>
          <p className="mt-1.5 text-sm text-gray-500">专业外贸与集运文件生成，一键导出标准格式</p>
          <Link href="/tools?cat=documents" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors">
            查看更多单据工具 <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {displayTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.slug}
                className="group flex flex-col p-4 bg-[#f8fafc] border border-gray-200 rounded-[20px] hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-teal-100">
                    <Icon className="w-5 h-5 text-teal-600" />
                  </div>
                </div>
                <div className="text-sm font-bold text-gray-900 mb-1">{tool.name}</div>
                <div className="text-xs text-gray-500 leading-relaxed flex-1">{tool.desc}</div>
                <Link
                  href={tool.href}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors"
                >
                  立即使用 <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
