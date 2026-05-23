'use client';

import { Clock, Hash, Percent, ArrowUpDown, ExternalLink } from 'lucide-react';
import Link from 'next/link';

/**
 * 快捷工具箱 Widget
 * - 4 个快捷入口: 汇率换算 / 包裹追踪 / 邮编查询 / 当前时间
 * - 极简图标 + 文字布局
 */

const QUICK_TOOLS = [
  {
    label: '汇率换算',
    icon: <ArrowUpDown className="w-4 h-4" />,
    href: '/tools/exchange-rate',
    color: 'text-blue-500',
    bg: 'bg-blue-50',
  },
  {
    label: '包裹追踪',
    icon: <Clock className="w-4 h-4" />,
    href: '/tracking',
    color: 'text-teal-500',
    bg: 'bg-teal-50',
  },
  {
    label: '邮编查询',
    icon: <Hash className="w-4 h-4" />,
    href: '/tools/postal-code',
    color: 'text-purple-500',
    bg: 'bg-purple-50',
  },
  {
    label: 'HS 编码',
    icon: <Percent className="w-4 h-4" />,
    href: '/tools/hs-code',
    color: 'text-amber-500',
    bg: 'bg-amber-50',
  },
];

export default function QuickToolsWidget() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', weekday: 'short' });

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm shadow-gray-100/50 p-4 transition-all duration-200 hover:shadow-md hover:border-gray-200">
      {/* Header: 当前时间 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center">
            <Clock className="w-4 h-4 text-teal-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">快捷工具箱</h3>
            <p className="text-[11px] text-gray-400">{dateStr} {timeStr}</p>
          </div>
        </div>
      </div>

      {/* Quick tools grid */}
      <div className="grid grid-cols-2 gap-2">
        {QUICK_TOOLS.map((tool) => (
          <Link
            key={tool.label}
            href={tool.href}
            className="flex items-center gap-2 p-2.5 rounded-lg bg-gray-50/50 border border-gray-100 hover:bg-white hover:border-gray-200 hover:shadow-sm transition-all group"
          >
            <div className={`w-7 h-7 rounded-md ${tool.bg} flex items-center justify-center flex-shrink-0 ${tool.color} group-hover:scale-105 transition-transform`}>
              {tool.icon}
            </div>
            <span className="text-xs text-gray-600 group-hover:text-gray-900 transition-colors truncate">
              {tool.label}
            </span>
            <ExternalLink className="w-3 h-3 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity ml-auto flex-shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
