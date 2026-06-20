import { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumb } from '@/components/breadcrumb';
import { FAQSection } from '@/components/faq-section';
import { Plane, AlertCircle, CheckCircle, ArrowRight, Wrench, Zap, BookOpen } from 'lucide-react';

export const metadata: Metadata = {
  title: '中国寄美国物流指南：FBA入仓、关税计算与清关流程 | 绝世百宝箱',
  description: '从中国发货到美国，如何选择物流方式？FBA 入仓怎么操作？关税怎么算？本文详解中国到美国的物流方式对比、FBA 入仓流程、关税计算、清关流程和注意事项。',
  keywords: '中国寄美国,FBA入仓,美国关税,中国到美国物流,美国清关,跨境电商美国',
};

const faqItems = [
  {
    question: '中国寄美国最低免税额度是多少？',
    answer: '美国的最低免税额度（De Minimis）为 800 美元（Section 321）。单票申报价值不超过 800 美元的货物可以免关税入境。这是全球最高的免税额度之一，对跨境电商非常有利。',
  },
  {
    question: 'FBA 入仓需要做什么准备？',
    answer: '需要准备：Amazon 发货计划（Shipping Plan）、FBA 标签（FNSKU）、外箱标签、装箱清单。货物需符合 Amazon 的包装要求（如不能超重、尺寸限制）。建议先发少量测试，确认流程顺畅后再大批量发货。',
  },
  {
    question: '美国关税税率怎么查？',
    answer: '美国关税税率可以在 USITC（美国国际贸易委员会）官网查询，输入 HS 编码即可查看对应税率。注意：部分中国商品可能受 301 条款加征关税影响，实际税率可能高于最惠国税率。',
  },
  {
    question: '海运和空运到美国哪个划算？',
    answer: '取决于货物特征。小件高价值、时效要求高的选空运（7-15 天）；大批量低价值、不急的选海运（25-40 天）。一般来说，超过 100KG 的货物海运更经济，100KG 以下空运专线可能更有性价比。',
  },
  {
    question: '发货到美国需要购买保险吗？',
    answer: '强烈建议购买运输保险，尤其是高价值货物。国际运输中丢失、损坏的风险始终存在。保险费率通常为货物价值的 0.3%-1%，成本不高但可以在出险时获得全额赔付。',
  },
];

export default function ShippingFromChinaToUSAPage() {
  return (
    <>
      <Breadcrumb />
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        {/* Hero */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-800 rounded-2xl p-6 sm:p-10 text-white mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Plane className="w-5 h-5 text-blue-200" />
            <span className="text-sm font-medium text-blue-200">跨境物流指南</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-4">
            中国寄美国物流指南：FBA 入仓、关税计算与清关流程
          </h1>
          <p className="text-blue-100 text-base sm:text-lg leading-relaxed">
            全面了解从中国发货到美国的物流方式、FBA 入仓操作、关税计算方法和清关流程，助力跨境电商高效运营。
          </p>
        </div>

        {/* Target Audience */}
        <div className="bg-teal-50 border border-teal-100 rounded-xl p-5 mb-8">
          <h2 className="text-sm font-bold text-teal-800 mb-2 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> 适用人群
          </h2>
          <p className="text-sm text-teal-700">
            Amazon FBA 卖家、跨境电商独立站卖家、外贸出口商、美国海外仓用户、需要发货到美国的个人和企业。
          </p>
        </div>

        {/* Shipping Methods */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            物流方式对比
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 pr-4 font-semibold text-gray-700">物流方式</th>
                  <th className="text-left py-2 pr-4 font-semibold text-gray-700">时效</th>
                  <th className="text-left py-2 pr-4 font-semibold text-gray-700">参考费用</th>
                  <th className="text-left py-2 font-semibold text-gray-700">适用场景</th>
                </tr>
              </thead>
              <tbody className="text-gray-600">
                <tr className="border-b border-gray-50">
                  <td className="py-3 pr-4 font-medium text-gray-900">国际快递<br/><span className="text-xs text-gray-500">DHL/FedEx/UPS</span></td>
                  <td className="py-3 pr-4">3-7 工作日</td>
                  <td className="py-3 pr-4">¥35-80/KG</td>
                  <td className="py-3">紧急文件、样品、小件高价值</td>
                </tr>
                <tr className="border-b border-gray-50">
                  <td className="py-3 pr-4 font-medium text-gray-900">空运专线<br/><span className="text-xs text-gray-500">空派/美森快船</span></td>
                  <td className="py-3 pr-4">8-15 天</td>
                  <td className="py-3 pr-4">¥20-40/KG</td>
                  <td className="py-3">FBA 补货、中等批量</td>
                </tr>
                <tr className="border-b border-gray-50">
                  <td className="py-3 pr-4 font-medium text-gray-900">海运快船<br/><span className="text-xs text-gray-500">美森/Matson</span></td>
                  <td className="py-3 pr-4">18-25 天</td>
                  <td className="py-3 pr-4">¥10-18/KG</td>
                  <td className="py-3">FBA 入仓、大批量</td>
                </tr>
                <tr className="border-b border-gray-50">
                  <td className="py-3 pr-4 font-medium text-gray-900">海运普船<br/><span className="text-xs text-gray-500">LCL/FCL</span></td>
                  <td className="py-3 pr-4">25-40 天</td>
                  <td className="py-3 pr-4">¥6-12/KG 或按 CBM</td>
                  <td className="py-3">大批量贸易、不急的货物</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-medium text-gray-900">邮政小包<br/><span className="text-xs text-gray-500">E邮宝/EMS</span></td>
                  <td className="py-3 pr-4">10-25 天</td>
                  <td className="py-3 pr-4">¥30-60/KG</td>
                  <td className="py-3">轻小件、个人物品</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 mt-3">* 费用和时效仅供参考，实际以物流商报价为准。旺季（Q4）价格和时效会有较大波动。</p>
        </div>

        {/* FBA Inbound */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📦 FBA 入仓流程</h2>
          <ol className="space-y-3 text-sm text-gray-700">
            <li className="flex gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs shrink-0">1</span>
              <span><strong>创建 Shipping Plan</strong> — 在 Seller Central 创建发货计划，选择仓库和发货方式</span>
            </li>
            <li className="flex gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs shrink-0">2</span>
              <span><strong>贴 FNSKU 标签</strong> — 每个 SKU 贴 Amazon FNSKU 条码标签</span>
            </li>
            <li className="flex gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs shrink-0">3</span>
              <span><strong>外箱贴标</strong> — 外箱贴 FBA 箱标（含 Shipment ID），注意不要遮挡</span>
            </li>
            <li className="flex gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs shrink-0">4</span>
              <span><strong>选择物流渠道</strong> — 海运/空运/快递到 Amazon 仓库（SPD/LTL/FTL）</span>
            </li>
            <li className="flex gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs shrink-0">5</span>
              <span><strong>上传追踪号</strong> — 在 Seller Central 填写运单号，跟踪入仓进度</span>
            </li>
            <li className="flex gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs shrink-0">6</span>
              <span><strong>确认接收</strong> — 仓库签收后在后台确认库存上架</span>
            </li>
          </ol>
          <div className="bg-blue-50 rounded-lg p-4 mt-4 text-sm text-blue-800">
            <p className="font-medium mb-1">FBA 入仓注意事项：</p>
            <ul className="space-y-1">
              <li>• 单箱重量不超过 22.5KG（50 磅），超过需贴 "Team Lift" 标签</li>
              <li>• 箱子尺寸不超过 25 英寸（63.5cm）任意一边</li>
              <li>• 不同 SKU 不能混装在同一箱（除非是套装）</li>
              <li>• 旺季（10-12月）建议提前 4-6 周发货</li>
            </ul>
          </div>
        </div>

        {/* Tariff Calculation */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">💵 关税计算</h2>
          <p className="text-gray-700 text-sm mb-4">
            美国关税 = 货物申报价值（FOB）× 关税税率。需要注意以下几点：
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-gray-800 mb-2">关税计算要素</h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>• <strong>申报价值</strong>：通常为 FOB 价格（不含运费和保险）</li>
              <li>• <strong>HS 编码</strong>：决定适用税率的关键，前 6 位国际统一</li>
              <li>• <strong>基础税率</strong>：最惠国税率（MFN），可在 USITC 官网查询</li>
              <li>• <strong>301 加征关税</strong>：部分中国商品额外加征 7.5%-25%（需确认是否在清单内）</li>
              <li>• <strong>免税额度</strong>：单票 ≤ $800 可免关税（Section 321）</li>
            </ul>
          </div>
          <div className="bg-amber-50 rounded-lg p-4 text-sm text-amber-800">
            <p className="font-medium mb-1">计算示例：</p>
            <p>一批电子产品 FOB 价值 $5,000，HS 编码对应基础税率 3%，301 加征 25%：</p>
            <p className="mt-1">关税 = $5,000 × (3% + 25%) = <strong>$1,400</strong></p>
          </div>
        </div>

        {/* Customs Process */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">🛃 清关流程</h2>
          <ol className="space-y-3 text-sm text-gray-700">
            <li className="flex gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs shrink-0">1</span>
              <span><strong>货物到达美国口岸</strong> — 洛杉矶/长滩港（西海岸）、纽约/新泽西港（东海岸）</span>
            </li>
            <li className="flex gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs shrink-0">2</span>
              <span><strong>ISF 申报</strong> — 海运需在装船前 24 小时提交 Importer Security Filing（10+2 规则）</span>
            </li>
            <li className="flex gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs shrink-0">3</span>
              <span><strong>海关入境申报</strong> — 由报关行提交 CBP Form 3461（入境/即时提货申请）</span>
            </li>
            <li className="flex gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs shrink-0">4</span>
              <span><strong>审核与查验</strong> — CBP 审核文件，可能进行 X 光或实物查验</span>
            </li>
            <li className="flex gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs shrink-0">5</span>
              <span><strong>缴纳税费</strong> — 关税、MPF（货物处理费）、HMF（港口维护费，海运）</span>
            </li>
            <li className="flex gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs shrink-0">6</span>
              <span><strong>放行</strong> — 清关完成后提货或转运至最终目的地</span>
            </li>
          </ol>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            注意事项
          </h2>
          <div className="space-y-4">
            <div className="flex gap-3">
              <span className="text-amber-500 font-bold shrink-0">⚠</span>
              <div>
                <p className="text-sm font-medium text-gray-900">需要 Bond（保证金）</p>
                <p className="text-sm text-gray-600">进口价值超过 $2,500 的货物需要购买 Customs Bond（单次或年度）。没有 Bond 无法清关。年度 Bond 约 $500/年，适合频繁进口。</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-amber-500 font-bold shrink-0">⚠</span>
              <div>
                <p className="text-sm font-medium text-gray-900">301 关税影响</p>
                <p className="text-sm text-gray-600">大量中国商品被加征 7.5%-25% 的 301 关税。发货前务必确认商品是否在加征清单内，避免利润被关税吞噬。</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-amber-500 font-bold shrink-0">⚠</span>
              <div>
                <p className="text-sm font-medium text-gray-900">FDA/FCC 等监管要求</p>
                <p className="text-sm text-gray-600">食品、药品、化妆品需 FDA 注册；电子产品需 FCC 认证；儿童产品需 CPSC 合规。缺少认证会被海关扣押。</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-amber-500 font-bold shrink-0">⚠</span>
              <div>
                <p className="text-sm font-medium text-gray-900">旺季拥堵</p>
                <p className="text-sm text-gray-600">每年 9-12 月为美国进口旺季，港口拥堵、仓库爆仓常见。FBA 卖家建议 7-8 月开始备货发货。</p>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-100 rounded-lg px-4 py-3 mb-8">
          <p className="text-sm text-amber-800">
            <span className="font-medium">免责声明：</span>
            本指南提供的信息仅供参考。美国海关法规、关税税率和贸易政策可能随时变化（尤其是 301 关税政策），具体规定请以美国海关与边境保护局（CBP）官方公告为准。建议发货前咨询专业报关行。
          </p>
        </div>

        {/* Related Tools */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-teal-600" />
            相关工具
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <Link href="/tools/shipping-calculator" className="flex items-center gap-3 p-4 rounded-lg border border-gray-100 bg-gray-50 hover:bg-white hover:border-teal-200 hover:shadow-sm transition-all group">
              <span className="text-2xl">🧮</span>
              <div>
                <p className="font-medium text-gray-900 group-hover:text-teal-700">运费估算器</p>
                <p className="text-xs text-gray-500">估算到美国的运费</p>
              </div>
            </Link>
            <Link href="/tools/hs-code" className="flex items-center gap-3 p-4 rounded-lg border border-gray-100 bg-gray-50 hover:bg-white hover:border-teal-200 hover:shadow-sm transition-all group">
              <span className="text-2xl">🔍</span>
              <div>
                <p className="font-medium text-gray-900 group-hover:text-teal-700">HS 编码查询</p>
                <p className="text-xs text-gray-500">查找商品编码和税率</p>
              </div>
            </Link>
            <Link href="/tools/commercial-invoice" className="flex items-center gap-3 p-4 rounded-lg border border-gray-100 bg-gray-50 hover:bg-white hover:border-teal-200 hover:shadow-sm transition-all group">
              <span className="text-2xl">📄</span>
              <div>
                <p className="font-medium text-gray-900 group-hover:text-teal-700">商业发票生成器</p>
                <p className="text-xs text-gray-500">生成清关所需的商业发票</p>
              </div>
            </Link>
            <Link href="/tools/customs-generator" className="flex items-center gap-3 p-4 rounded-lg border border-gray-100 bg-gray-50 hover:bg-white hover:border-teal-200 hover:shadow-sm transition-all group">
              <span className="text-2xl">📦</span>
              <div>
                <p className="font-medium text-gray-900 group-hover:text-teal-700">报关单生成</p>
                <p className="text-xs text-gray-500">生成符合美国海关要求的报关单</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Related Task Chains */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            相关任务链
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <Link href="/workspace/task-chains/shipping/new" className="flex items-center gap-3 p-4 rounded-lg border border-gray-100 bg-gray-50 hover:bg-white hover:border-amber-200 hover:shadow-sm transition-all group">
              <span className="text-2xl">📦</span>
              <div>
                <p className="font-medium text-gray-900 group-hover:text-amber-700">新建发货任务</p>
                <p className="text-xs text-gray-500">包含 FBA 入仓和清关步骤</p>
              </div>
            </Link>
            <Link href="/workspace/task-chains" className="flex items-center gap-3 p-4 rounded-lg border border-gray-100 bg-gray-50 hover:bg-white hover:border-amber-200 hover:shadow-sm transition-all group">
              <span className="text-2xl">📋</span>
              <div>
                <p className="font-medium text-gray-900 group-hover:text-amber-700">任务链列表</p>
                <p className="text-xs text-gray-500">查看所有可用的工作流</p>
              </div>
            </Link>
          </div>
        </div>

        {/* FAQ */}
        <FAQSection items={faqItems} />

        {/* CTA */}
        <div className="mt-8 text-center">
          <Link
            href="/tools/shipping-calculator"
            className="inline-flex items-center gap-2 px-8 py-4 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20 min-h-[48px]"
          >
            <Plane className="w-5 h-5" />
            估算到美国的运费
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </>
  );
}
