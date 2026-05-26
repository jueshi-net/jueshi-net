import type { Metadata } from 'next';
import { buildCanonical, buildTitle } from '@/lib/seo';
import Link from 'next/link';
import { Package, ArrowRight, FileText, Truck, MapPin, Palette } from 'lucide-react';

export const metadata: Metadata = {
  title: buildTitle("标签生成中心 — 唛头、入库、集运、FBA 标签一站生成"),
  description: "专业唛头标签、集运入库标签、外箱唛头、托盘标签生成器，支持热敏纸尺寸与批量箱号自动生成。",
  alternates: { canonical: buildCanonical("/tools/documents/shipping-label") },
};

const LABEL_TYPES = [
  {
    type: 'shipping-mark',
    titleZh: '通用外箱唛头',
    titleEn: 'Shipping Mark',
    icon: '📦',
    description: '标准外箱标识唛头，含收货人、目的港、原产地',
    href: '/tools/documents/shipping-mark',
    color: 'border-teal-200 bg-teal-50 hover:border-teal-400',
  },
  {
    type: 'fba-label',
    titleZh: '集运入库标签',
    titleEn: 'Inbound Label',
    icon: '📥',
    description: '集运仓入库标签，含订单号、客户代码、仓位信息',
    href: '/tools/documents/inbound-label',
    color: 'border-blue-200 bg-blue-50 hover:border-blue-400',
  },
  {
    type: 'consolidation-label',
    titleZh: '合箱标签',
    titleEn: 'Consolidation Label',
    icon: '📫',
    description: '合箱/拼箱标签，标注合箱编号和子包裹信息',
    href: '/tools/documents/consolidation-label',
    color: 'border-purple-200 bg-purple-50 hover:border-purple-400',
  },
  {
    type: 'pallet-label',
    titleZh: '托盘标签',
    titleEn: 'Pallet Label',
    icon: '🏗️',
    description: '整托货物标识，含托盘号、层数、总件数',
    href: '/tools/documents/pallet-label',
    color: 'border-amber-200 bg-amber-50 hover:border-amber-400',
  },
  {
    type: 'location-label',
    titleZh: '库位标签',
    titleEn: 'Location Label',
    icon: '📍',
    description: '仓库库位标识，含区域编码、货架号、仓位号',
    href: '/tools/documents/location-label',
    color: 'border-green-200 bg-green-50 hover:border-green-400',
  },
  {
    type: 'reminder-label',
    titleZh: '提示标签',
    titleEn: 'Reminder Label',
    icon: '⚠️',
    description: '易碎、防潮、向上等仓储提示标签',
    href: '/tools/documents/reminder-label',
    color: 'border-red-200 bg-red-50 hover:border-red-400',
  },
];

export default function LabelHubPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-teal-600 via-teal-700 to-blue-800 text-white">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <Link href="/tools/documents" className="inline-flex items-center gap-1 text-sm text-teal-100 hover:text-white mb-6">
            ← 返回单据中心
          </Link>
          <h1 className="text-3xl font-extrabold mb-2">🏷️ 标签生成中心</h1>
          <p className="text-lg text-teal-100/90">外箱唛头、入库标签、合箱标签、托盘标签 — 支持热敏纸尺寸与批量箱号自动生成</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-6 pb-16">
        {/* Label cards grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {LABEL_TYPES.map(lt => (
            <Link key={lt.type} href={lt.href}
              className={`block border rounded-xl p-5 transition-all duration-200 hover:shadow-md ${lt.color}`}>
              <div className="text-3xl mb-2">{lt.icon}</div>
              <div className="font-semibold text-gray-900 text-lg">{lt.titleZh}</div>
              <div className="text-xs text-gray-400 mb-2">{lt.titleEn}</div>
              <p className="text-sm text-gray-600 mb-3">{lt.description}</p>
              <div className="flex items-center gap-1 text-sm font-medium text-teal-600">
                立即生成 <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>

        {/* Feature highlights */}
        <div className="mt-10 bg-white border rounded-xl p-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Palette className="w-5 h-5 text-teal-600" /> 标签生成器特性
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="font-medium text-sm text-gray-900 mb-1">📐 热敏纸尺寸</div>
              <p className="text-xs text-gray-500">支持 10×10cm 与 10×15cm 标准热敏纸规格，打印自动适配</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="font-medium text-sm text-gray-900 mb-1">🔢 批量箱号</div>
              <p className="text-xs text-gray-500">填入总件数，自动生成 1/N, 2/N ... N/N 连续箱号标签</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="font-medium text-sm text-gray-900 mb-1">🖨️ 一键打印</div>
              <p className="text-xs text-gray-500">浏览器直接打印或导出 PNG，每页自动分页</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
