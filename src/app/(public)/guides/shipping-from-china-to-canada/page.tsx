import { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumb } from '@/components/breadcrumb';
import { FAQSection } from '@/components/faq-section';
import { Ship, AlertCircle, CheckCircle, ArrowRight, Wrench, Zap, BookOpen } from 'lucide-react';

export const metadata: Metadata = {
  title: '中国寄加拿大物流指南：海运空运快递对比与清关流程 | 绝世百宝箱',
  description: '从中国寄货到加拿大，选海运还是空运？时效多久？费用多少？本文详解中国到加拿大的物流方式对比、清关流程、禁运物品、关税计算和注意事项，帮助跨境卖家和个人寄件者顺利发货。',
  keywords: '中国寄加拿大,中国到加拿大物流,海运加拿大,空运加拿大,加拿大清关,加拿大关税',
};

const faqItems = [
  {
    question: '中国寄加拿大最快几天能到？',
    answer: '国际快递（DHL/FedEx/UPS）最快 3-5 个工作日到达主要城市。空运专线约 7-12 天。海运整柜约 25-35 天，海运拼箱约 30-40 天。具体时效取决于出发城市、目的城市和清关速度。',
  },
  {
    question: '加拿大的免税额度是多少？',
    answer: '加拿大的低值免税额度（LVS）为 20 加元（约合 105 人民币）。超过此金额的包裹需要缴纳 GST/HST（商品和服务税，5%-15% 不等）和可能的关税。通过邮政渠道（如中国邮政）寄送的包裹海关查验率相对较低。',
  },
  {
    question: '寄到加拿大需要哪些文件？',
    answer: '商业件需要：商业发票、装箱单、运单。个人物品需要：物品清单和申报价值。部分商品还需要原产地证、许可证或认证（如食品需 CFIA 许可、电子产品需 IC 认证）。',
  },
  {
    question: '加拿大有哪些禁运物品？',
    answer: '加拿大严格禁止：武器弹药、毒品、假冒商品、濒危动植物制品、未申报的食品和植物种子、含大麻成分产品（未经批准的）。限制类包括：锂电池（有数量限制）、液体、粉末、药品等。',
  },
  {
    question: '如何降低加拿大清关被税的概率？',
    answer: '合理申报价值（不要过低也不要过高）、确保 HS 编码准确、提供完整的商品描述、选择清关能力强的物流渠道。注意：故意低报属于违法行为，可能导致罚款和货物扣押。',
  },
];

export default function ShippingFromChinaToCanadaPage() {
  return (
    <>
      <Breadcrumb />
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        {/* Hero */}
        <div className="bg-gradient-to-br from-red-500 to-rose-700 rounded-2xl p-6 sm:p-10 text-white mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Ship className="w-5 h-5 text-red-200" />
            <span className="text-sm font-medium text-red-200">跨境物流指南</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-4">
            中国寄加拿大物流指南：海运空运快递对比与清关流程
          </h1>
          <p className="text-red-100 text-base sm:text-lg leading-relaxed">
            详解从中国发货到加拿大的物流方式选择、时效成本对比、清关流程和注意事项，帮助您高效、合规地完成跨境发货。
          </p>
        </div>

        {/* Target Audience */}
        <div className="bg-teal-50 border border-teal-100 rounded-xl p-5 mb-8">
          <h2 className="text-sm font-bold text-teal-800 mb-2 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> 适用人群
          </h2>
          <p className="text-sm text-teal-700">
            跨境电商卖家（Amazon.ca、Shopify 独立站）、外贸出口商、加拿大华人收寄包裹、留学生寄件、FBA 卖家。
          </p>
        </div>

        {/* Shipping Methods */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-red-600" />
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
                  <td className="py-3 pr-4">3-5 工作日</td>
                  <td className="py-3 pr-4">¥40-80/KG</td>
                  <td className="py-3">紧急文件、小件高价值商品</td>
                </tr>
                <tr className="border-b border-gray-50">
                  <td className="py-3 pr-4 font-medium text-gray-900">空运专线<br/><span className="text-xs text-gray-500">空加派</span></td>
                  <td className="py-3 pr-4">7-12 天</td>
                  <td className="py-3 pr-4">¥25-45/KG</td>
                  <td className="py-3">中等时效、中等价值商品</td>
                </tr>
                <tr className="border-b border-gray-50">
                  <td className="py-3 pr-4 font-medium text-gray-900">海运拼箱<br/><span className="text-xs text-gray-500">LCL</span></td>
                  <td className="py-3 pr-4">30-40 天</td>
                  <td className="py-3 pr-4">¥8-15/KG 或按 CBM</td>
                  <td className="py-3">大批量、低价值、不急的货物</td>
                </tr>
                <tr className="border-b border-gray-50">
                  <td className="py-3 pr-4 font-medium text-gray-900">海运整柜<br/><span className="text-xs text-gray-500">FCL</span></td>
                  <td className="py-3 pr-4">25-35 天</td>
                  <td className="py-3 pr-4">按柜型报价</td>
                  <td className="py-3">大批量贸易、FBA 入仓</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-medium text-gray-900">邮政小包<br/><span className="text-xs text-gray-500">EMS/中国邮政</span></td>
                  <td className="py-3 pr-4">15-30 天</td>
                  <td className="py-3 pr-4">¥30-60/KG</td>
                  <td className="py-3">个人物品、轻小件、清关宽松</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 mt-3">* 费用和时效仅供参考，实际以物流商报价为准。价格随季节和燃油附加费波动。</p>
        </div>

        {/* Customs Process */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">🛃 清关流程</h2>
          <ol className="space-y-3 text-sm text-gray-700">
            <li className="flex gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-700 font-bold text-xs shrink-0">1</span>
              <span><strong>货物到达加拿大口岸</strong>（温哥华、多伦多、蒙特利尔等主要港口/机场）</span>
            </li>
            <li className="flex gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-700 font-bold text-xs shrink-0">2</span>
              <span><strong>海关申报</strong> — 提交商业发票、装箱单、运单等文件</span>
            </li>
            <li className="flex gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-700 font-bold text-xs shrink-0">3</span>
              <span><strong>海关审核</strong> — CBSA（加拿大边境服务局）审核申报信息，决定是否查验</span>
            </li>
            <li className="flex gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-700 font-bold text-xs shrink-0">4</span>
              <span><strong>缴纳税费</strong> — GST/HST + 关税（如适用），由收件人或报关行代缴</span>
            </li>
            <li className="flex gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-700 font-bold text-xs shrink-0">5</span>
              <span><strong>放行提货</strong> — 清关完成后由当地快递或卡车派送到门</span>
            </li>
          </ol>
          <div className="bg-red-50 rounded-lg p-4 mt-4 text-sm text-red-800">
            <p className="font-medium mb-1">提示：</p>
            <p>加拿大海关对申报价值审核较严，建议如实申报。低报可能导致补税、罚款甚至货物扣押。使用 DDP（完税交货）服务可以让发件人预付税费，提升收件人体验。</p>
          </div>
        </div>

        {/* Prohibited Items */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            禁运与限制物品
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-red-700 mb-2 text-sm">🚫 禁止进口</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• 武器弹药及仿制品</li>
                <li>• 毒品及管制药物</li>
                <li>• 假冒伪劣商品</li>
                <li>• 濒危动植物及其制品</li>
                <li>• 未经批准的食品和保健品</li>
                <li>• 含大麻成分产品（未获许可）</li>
                <li>• 仇恨宣传材料</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-amber-700 mb-2 text-sm">⚠️ 限制进口（需许可/认证）</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• 锂电池（有容量和数量限制）</li>
                <li>• 电子产品（需 IC 认证）</li>
                <li>• 食品和化妆品（需 CFIA 许可）</li>
                <li>• 植物种子和土壤</li>
                <li>• 药品和医疗器械</li>
                <li>• 儿童玩具（需安全认证）</li>
                <li>• 纺织品（需标签合规）</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📌 注意事项</h2>
          <div className="space-y-4">
            <div className="flex gap-3">
              <span className="text-amber-500 font-bold shrink-0">⚠</span>
              <div>
                <p className="text-sm font-medium text-gray-900">如实申报价值</p>
                <p className="text-sm text-gray-600">加拿大海关有权重新估价。低报不仅违法，还可能导致罚款和信用降级，影响后续发货。</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-amber-500 font-bold shrink-0">⚠</span>
              <div>
                <p className="text-sm font-medium text-gray-900">注意省级差异</p>
                <p className="text-sm text-gray-600">加拿大各省 GST/HST 税率不同（5%-15%），阿尔伯塔省只有 5% GST，安大略省为 13% HST。</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-amber-500 font-bold shrink-0">⚠</span>
              <div>
                <p className="text-sm font-medium text-gray-900">偏远地区附加费</p>
                <p className="text-sm text-gray-600">加拿大地广人稀，北部和偏远地区可能收取偏远附加费，发货前确认目的地是否在偏远区域。</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-amber-500 font-bold shrink-0">⚠</span>
              <div>
                <p className="text-sm font-medium text-gray-900">冬季物流延迟</p>
                <p className="text-sm text-gray-600">每年 11 月至次年 3 月，加拿大暴风雪可能导致内陆运输延迟 3-7 天，建议预留缓冲时间。</p>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-100 rounded-lg px-4 py-3 mb-8">
          <p className="text-sm text-amber-800">
            <span className="font-medium">免责声明：</span>
            本指南提供的信息仅供参考。各国海关政策和税率可能随时变化，具体规定请以加拿大边境服务局（CBSA）官方公告为准。建议发货前咨询专业报关行或物流公司。
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
                <p className="text-xs text-gray-500">估算到加拿大的运费</p>
              </div>
            </Link>
            <Link href="/tools/hs-code" className="flex items-center gap-3 p-4 rounded-lg border border-gray-100 bg-gray-50 hover:bg-white hover:border-teal-200 hover:shadow-sm transition-all group">
              <span className="text-2xl">🔍</span>
              <div>
                <p className="font-medium text-gray-900 group-hover:text-teal-700">HS 编码查询</p>
                <p className="text-xs text-gray-500">查找商品海关编码</p>
              </div>
            </Link>
            <Link href="/tools/commercial-invoice" className="flex items-center gap-3 p-4 rounded-lg border border-gray-100 bg-gray-50 hover:bg-white hover:border-teal-200 hover:shadow-sm transition-all group">
              <span className="text-2xl">📄</span>
              <div>
                <p className="font-medium text-gray-900 group-hover:text-teal-700">商业发票生成器</p>
                <p className="text-xs text-gray-500">生成符合加拿大海关要求的发票</p>
              </div>
            </Link>
            <Link href="/tools/customs-generator" className="flex items-center gap-3 p-4 rounded-lg border border-gray-100 bg-gray-50 hover:bg-white hover:border-teal-200 hover:shadow-sm transition-all group">
              <span className="text-2xl">📦</span>
              <div>
                <p className="font-medium text-gray-900 group-hover:text-teal-700">报关单生成</p>
                <p className="text-xs text-gray-500">生成国际快递报关单</p>
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
                <p className="text-xs text-gray-500">从下单到生成单据一条龙</p>
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
            <Ship className="w-5 h-5" />
            估算到加拿大的运费
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </>
  );
}
