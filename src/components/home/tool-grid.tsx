import { AdSlot } from '@/components/ads/AdSlot';
import { Wrench, Truck, MapPin, Hash, Coins, FileText, Sparkles, Calculator, Tag, QrCode, Flame } from 'lucide-react';

const TOOLS = [
  { name: '商业发票', desc: '外贸必备单据生成', icon: FileText, href: '/tools/commercial-invoice', heat: '2.3k', iconBg: 'from-blue-50 to-indigo-50', iconColor: 'text-blue-600' },
  { name: '包裹追踪', desc: '全球快递物流查询', icon: Truck, href: '/tracking', heat: '1.8k', iconBg: 'from-teal-50 to-emerald-50', iconColor: 'text-teal-600' },
  { name: '邮编查询', desc: '全球国家邮编地址', icon: MapPin, href: '/tools/postal-code', heat: '956', iconBg: 'from-violet-50 to-purple-50', iconColor: 'text-violet-600' },
  { name: 'HS编码查询', desc: '海关编码税率参考', icon: Hash, href: '/tools/hs-code', heat: '780', iconBg: 'from-amber-50 to-orange-50', iconColor: 'text-amber-600' },
  { name: '汇率换算', desc: '实时货币转换', icon: Coins, href: '/tools/exchange-rate', heat: '1.2k', iconBg: 'from-emerald-50 to-teal-50', iconColor: 'text-emerald-600' },
  { name: '运费计算', desc: '体积重计算参考', icon: Calculator, href: '/tools/shipping-calculator', heat: '640', iconBg: 'from-pink-50 to-rose-50', iconColor: 'text-pink-600' },
  { name: '唛头面单', desc: '一键生成标签', icon: Tag, href: '/tools/shipping-label', heat: '420', iconBg: 'from-sky-50 to-blue-50', iconColor: 'text-sky-600' },
  { name: '二维码生成', desc: '快速生成QR Code', icon: QrCode, href: '/tools/qrcode', isNew: true, iconBg: 'from-orange-50 to-amber-50', iconColor: 'text-orange-600' },
];

export default function ToolGrid() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-8">
      <div className="flex items-end justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Wrench className="w-5 h-5 text-teal-600" />
            常用工具箱
          </h2>
          <p className="mt-0.5 text-sm text-gray-500">精选高频工具，开箱即用</p>
        </div>
        <a href="/tools" className="text-sm font-medium text-teal-600 hover:text-teal-700 flex items-center gap-0.5">
          查看全部 <span className="text-lg leading-none">→</span>
        </a>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {TOOLS.map(tool => {
          const Icon = tool.icon;
          return (
            <a
              key={tool.name}
              href={tool.href}
              className="relative bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 shadow-sm shadow-gray-100/30 hover:shadow-lg hover:shadow-gray-200/50 hover:-translate-y-0.5 hover:border-teal-200 transition-all duration-200 group"
            >
              {/* Heat / New badge */}
              {tool.heat && (
                <span className="absolute right-2 top-2 inline-flex items-center gap-0.5 text-[10px] text-gray-400">
                  <Flame className="h-3 w-3 text-orange-400" />
                  {tool.heat}
                </span>
              )}
              {tool.isNew && (
                <span className="absolute right-2 top-2 inline-flex items-center gap-0.5 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  <Sparkles className="h-2.5 w-2.5" />
                  NEW
                </span>
              )}
              {/* Icon container */}
              <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${tool.iconBg} transition-transform duration-200 group-hover:scale-110`}>
                <Icon className={`w-5 h-5 ${tool.iconColor}`} />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-teal-700 text-sm mb-0.5">{tool.name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{tool.desc}</p>
            </a>
          );
        })}
        {/* Native Ad Slot (dynamic from Ad System) */}
        <AdSlot placement="tool-grid-native" />
      </div>
    </div>
  );
}
