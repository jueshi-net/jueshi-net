'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

const ROUTE_NAMES: Record<string, string> = {
  tools: '工具中心',
  tracking: '物流追踪',
  shipping: '跨境寄送',
  resources: '资源库',
  guides: '指南教程',
  nav: '网址导航',
  starter: '外网新手',
  admin: '管理后台',
  'shipping-calculator': '运费计算器',
  'hs-code': 'HS编码',
  'postal-code': '邮编地址',
  'exchange-rate': '汇率查询',
  memo: '工作便签',
  invoice: '发票生成',
  quote: '报价单',
  calculator: '计算器',
  'sensitive-goods': '敏感货',
  'customs-generator': '报关单生成',
  'address-formatter': '地址格式化',
  container: '集装箱',
  inbound: '入库管理',
  qrcode: '二维码',
  receipt: '收据',
  documents: '单据中心',
  'label-maker': '唛头面单',
  'shipping-label': '唛头面单',
  'ai-tools': 'AI工具',
  'video-learning': '视频学习',
  'overseas-life': '海外生活',
  'business-tools': '出海经营',
  security: '账号安全',
  'browser-extensions': '浏览器插件',
  bbs: '社区',
  // 单据类型 → 中文映射
  'proforma-invoice': '形式发票',
  'commercial-invoice': '商业发票',
  'packing-list': '装箱单',
  'sales-contract': '销售合同',
  'booking-instruction': '订舱委托书',
  'customs-declaration-authorization': '报关委托书',
  'delivery-note': '送货单',
  'freight-statement': '运费对账单',
  'consolidation-inbound-receipt': '集运入库单',
  'consolidation-packing-list': '合箱打包清单',
  'express-declaration': '快递申报单',
  quotation: '报价单',
  'shipping-instruction': '提单补料',
  'trucking-dispatch-order': '拖车派车单',
  'shipping-mark': '唛头模板',
  'container-loading-list': '装柜明细单',
  'return-packing-list': '退货装箱清单',
  'certificate-of-origin-template': '原产地证模板',
  'fumigation-certificate-template': '熏蒸证明模板',
  'letter-of-credit-info-sheet': '信用证资料单',
  drafts: '我的草稿',
};

export function Breadcrumb() {
  const pathname = usePathname();
  
  // Don't show on homepage
  if (pathname === '/') return null;
  
  const segments = pathname.split('/').filter(Boolean);
  
  // Don't show for admin routes (they have their own nav)
  if (segments[0] === 'admin') return null;
  
  return (
    <nav className="max-w-6xl mx-auto px-4 py-3" aria-label="Breadcrumb">
      <ol className="flex items-center gap-1 text-sm text-gray-500">
        <li>
          <Link href="/" className="hover:text-gray-700 transition-colors flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            <span className="sr-only">首页</span>
          </Link>
        </li>
        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1;
          const href = '/' + segments.slice(0, index + 1).join('/');
          const name = ROUTE_NAMES[segment] || segment;
          
          return (
            <li key={segment} className="flex items-center gap-1">
              <ChevronRight className="w-3 h-3 text-gray-400" />
              {isLast ? (
                <span className="text-gray-900 font-medium truncate max-w-[150px]">{name}</span>
              ) : (
                <Link href={href} className="hover:text-gray-700 transition-colors truncate max-w-[150px]">
                  {name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
