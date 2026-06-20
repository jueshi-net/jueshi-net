import { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumb } from '@/components/breadcrumb';
import { FAQSection } from '@/components/faq-section';
import { ClipboardList, AlertCircle, CheckCircle, ArrowRight, Wrench, Zap, BookOpen } from 'lucide-react';

export const metadata: Metadata = {
  title: '跨境发货检查清单：发货前必备准备与文件清单 | 绝世百宝箱',
  description: '跨境发货前需要准备什么？本文提供完整的跨境发货检查清单，包含发货前准备、文件清单、包装要求、标签要求和常见问题，帮助外贸和跨境电商卖家避免发货遗漏和错误。',
  keywords: '跨境发货清单,国际物流准备,出口文件清单,包装要求,标签要求,跨境发货检查',
};

const faqItems = [
  {
    question: '跨境发货前最重要的准备工作是什么？',
    answer: '最重要的是确认：1) 目的地国家的进口政策和禁运物品；2) 商品是否需要特殊认证或许可；3) 准备齐全的清关文件（发票、装箱单、报关单）；4) 选择合适的物流渠道并确认费用。建议制作一份标准化清单，每次发货前逐项核对。',
  },
  {
    question: '商业发票和装箱单有什么区别？',
    answer: '商业发票（Commercial Invoice）记录交易信息：买卖双方、商品描述、单价、总价、贸易条款等，用于海关估价和征税。装箱单（Packing List）记录包装信息：件数、毛重、净重、体积、箱规等，用于物流操作和验货。两者配合使用，缺一不可。',
  },
  {
    question: '包装不合格会导致什么问题？',
    answer: '包装不合格可能导致：货物在运输中损坏、被物流公司拒收、海关查验时包装破损导致延误、收件人拒收。国际运输通常经历多次装卸和长途运输，包装标准应高于国内快递。',
  },
  {
    question: '国际快递标签需要包含哪些信息？',
    answer: '国际快递标签通常需要：收发件人完整地址和联系方式、运单号/追踪号、件数标识（如 1/3, 2/3）、重量、目的地国家、以及必要的警示标签（如易碎、向上、锂电池标签等）。FBA 货物还需要 FNSKU 和 FBA 箱标。',
  },
  {
    question: '如何避免清关被查验或扣货？',
    answer: '关键措施：1) 如实申报价值和数量；2) 提供准确的 HS 编码；3) 商品描述要具体（不要写 "gift" 或 "sample" 模糊描述）；4) 确保所有必要文件齐全；5) 避免发送禁运或限制物品；6) 选择信誉好的物流渠道。',
  },
];

export default function CrossBorderShippingChecklistPage() {
  return (
    <>
      <Breadcrumb />
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        {/* Hero */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-700 rounded-2xl p-6 sm:p-10 text-white mb-8">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList className="w-5 h-5 text-emerald-200" />
            <span className="text-sm font-medium text-emerald-200">跨境操作指南</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-4">
            跨境发货检查清单：发货前必备准备与文件清单
          </h1>
          <p className="text-emerald-100 text-base sm:text-lg leading-relaxed">
            一份完整的跨境发货检查清单，帮助您系统化准备发货所需的文件、包装和标签，避免因遗漏导致延误或退件。
          </p>
        </div>

        {/* Target Audience */}
        <div className="bg-teal-50 border border-teal-100 rounded-xl p-5 mb-8">
          <h2 className="text-sm font-bold text-teal-800 mb-2 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> 适用人群
          </h2>
          <p className="text-sm text-teal-700">
            跨境电商卖家、外贸业务员、国际物流操作人员、FBA 卖家、首次进行跨境发货的新手、需要标准化发货流程的企业。
          </p>
        </div>

        {/* Pre-shipment Preparation */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            发货前准备
          </h2>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">📋 信息确认</h3>
              <ul className="text-sm text-gray-700 space-y-1.5">
                <li className="flex gap-2"><span className="text-emerald-600">☐</span> 确认收件人姓名、地址、电话完整准确</li>
                <li className="flex gap-2"><span className="text-emerald-600">☐</span> 确认目的地国家的进口政策和禁运清单</li>
                <li className="flex gap-2"><span className="text-emerald-600">☐</span> 确认商品是否需要特殊认证（FDA、CE、FCC 等）</li>
                <li className="flex gap-2"><span className="text-emerald-600">☐</span> 确认商品的 HS 编码和适用税率</li>
                <li className="flex gap-2"><span className="text-emerald-600">☐</span> 确认贸易条款（FOB、CIF、DDP 等）</li>
              </ul>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">🚚 物流选择</h3>
              <ul className="text-sm text-gray-700 space-y-1.5">
                <li className="flex gap-2"><span className="text-emerald-600">☐</span> 比较不同物流渠道的时效和价格</li>
                <li className="flex gap-2"><span className="text-emerald-600">☐</span> 确认物流商是否提供清关服务</li>
                <li className="flex gap-2"><span className="text-emerald-600">☐</span> 确认是否包含保险，是否需要额外购买</li>
                <li className="flex gap-2"><span className="text-emerald-600">☐</span> 了解体积重计算规则和计费方式</li>
                <li className="flex gap-2"><span className="text-emerald-600">☐</span> 确认取件时间和方式</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Document Checklist */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📄 文件清单</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 pr-4 font-semibold text-gray-700">文件名称</th>
                  <th className="text-left py-2 pr-4 font-semibold text-gray-700">用途</th>
                  <th className="text-left py-2 font-semibold text-gray-700">是否必需</th>
                </tr>
              </thead>
              <tbody className="text-gray-600">
                <tr className="border-b border-gray-50">
                  <td className="py-3 pr-4 font-medium text-gray-900">商业发票<br/><span className="text-xs text-gray-500">Commercial Invoice</span></td>
                  <td className="py-3 pr-4">海关估价、征税依据</td>
                  <td className="py-3"><span className="text-emerald-600 font-bold">✓ 必需</span></td>
                </tr>
                <tr className="border-b border-gray-50">
                  <td className="py-3 pr-4 font-medium text-gray-900">装箱单<br/><span className="text-xs text-gray-500">Packing List</span></td>
                  <td className="py-3 pr-4">包装明细、验货依据</td>
                  <td className="py-3"><span className="text-emerald-600 font-bold">✓ 必需</span></td>
                </tr>
                <tr className="border-b border-gray-50">
                  <td className="py-3 pr-4 font-medium text-gray-900">运单/提单<br/><span className="text-xs text-gray-500">AWB / B/L</span></td>
                  <td className="py-3 pr-4">运输合同、提货凭证</td>
                  <td className="py-3"><span className="text-emerald-600 font-bold">✓ 必需</span></td>
                </tr>
                <tr className="border-b border-gray-50">
                  <td className="py-3 pr-4 font-medium text-gray-900">报关单<br/><span className="text-xs text-gray-500">Customs Declaration</span></td>
                  <td className="py-3 pr-4">海关申报</td>
                  <td className="py-3"><span className="text-emerald-600 font-bold">✓ 必需</span></td>
                </tr>
                <tr className="border-b border-gray-50">
                  <td className="py-3 pr-4 font-medium text-gray-900">原产地证<br/><span className="text-xs text-gray-500">Certificate of Origin</span></td>
                  <td className="py-3 pr-4">享受优惠税率</td>
                  <td className="py-3"><span className="text-amber-600">按需</span></td>
                </tr>
                <tr className="border-b border-gray-50">
                  <td className="py-3 pr-4 font-medium text-gray-900">许可证/认证<br/><span className="text-xs text-gray-500">License / Certificate</span></td>
                  <td className="py-3 pr-4">特殊商品准入</td>
                  <td className="py-3"><span className="text-amber-600">按需</span></td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-medium text-gray-900">保险单<br/><span className="text-xs text-gray-500">Insurance Policy</span></td>
                  <td className="py-3 pr-4">运输风险保障</td>
                  <td className="py-3"><span className="text-blue-600">建议</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Packaging Requirements */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📦 包装要求</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">外箱要求</h3>
              <ul className="text-sm text-gray-700 space-y-1.5">
                <li>• 使用坚固的五层瓦楞纸箱</li>
                <li>• 箱子无破损、无旧标签</li>
                <li>• 尺寸适合货物，减少空隙</li>
                <li>• 单箱重量不超过 22.5KG</li>
                <li>• 封箱使用 H 型胶带封法</li>
              </ul>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">内包装要求</h3>
              <ul className="text-sm text-gray-700 space-y-1.5">
                <li>• 易碎品使用气泡膜包裹</li>
                <li>• 填充物填满空隙防晃动</li>
                <li>• 液体密封并加防漏袋</li>
                <li>• 电子产品防静电包装</li>
                <li>• 不同商品分隔包装</li>
              </ul>
            </div>
          </div>
          <div className="bg-emerald-50 rounded-lg p-4 text-sm text-emerald-800">
            <p className="font-medium mb-1">特殊商品包装提示：</p>
            <ul className="space-y-1">
              <li>• <strong>锂电池</strong>：需使用 UN 认证包装，贴锂电池标签</li>
              <li>• <strong>液体/粉末</strong>：需密封 + 二次包装 + 防漏声明</li>
              <li>• <strong>易碎品</strong>：贴 FRAGILE 标签，使用双层包装</li>
              <li>• <strong>FBA 货物</strong>：需符合 Amazon 包装标准（不能超尺寸/超重）</li>
            </ul>
          </div>
        </div>

        {/* Label Requirements */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">🏷️ 标签要求</h2>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">外箱必须包含的标签信息</h3>
              <ul className="text-sm text-gray-700 space-y-1.5">
                <li className="flex gap-2"><span className="text-emerald-600">☐</span> 收件人完整姓名和地址（英文）</li>
                <li className="flex gap-2"><span className="text-emerald-600">☐</span> 发件人信息（可简化为公司名+国家）</li>
                <li className="flex gap-2"><span className="text-emerald-600">☐</span> 运单号 / 追踪号（条码）</li>
                <li className="flex gap-2"><span className="text-emerald-600">☐</span> 件数标识（如 Carton 1 of 5）</li>
                <li className="flex gap-2"><span className="text-emerald-600">☐</span> 毛重和净重</li>
                <li className="flex gap-2"><span className="text-emerald-600">☐</span> 目的地国家（大写英文）</li>
              </ul>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">特殊标签（按需）</h3>
              <ul className="text-sm text-gray-700 space-y-1.5">
                <li className="flex gap-2"><span className="text-amber-600">☐</span> FRAGILE / 易碎标签</li>
                <li className="flex gap-2"><span className="text-amber-600">☐</span> THIS SIDE UP / 向上标签</li>
                <li className="flex gap-2"><span className="text-amber-600">☐</span> 锂电池标签（UN3480/UN3481）</li>
                <li className="flex gap-2"><span className="text-amber-600">☐</span> MADE IN CHINA 原产地标签</li>
                <li className="flex gap-2"><span className="text-amber-600">☐</span> FNSKU 标签（FBA 货物）</li>
                <li className="flex gap-2"><span className="text-amber-600">☐</span> Team Lift 标签（超 22.5KG）</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Common Mistakes */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            常见问题与错误
          </h2>
          <div className="space-y-4">
            <div className="flex gap-3">
              <span className="text-red-500 font-bold shrink-0">✗</span>
              <div>
                <p className="text-sm font-medium text-gray-900">文件不齐全就发货</p>
                <p className="text-sm text-gray-600">缺少发票或装箱单会导致清关延误甚至退件。务必在取件前确认所有文件已随货附上或电子传输。</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-red-500 font-bold shrink-0">✗</span>
              <div>
                <p className="text-sm font-medium text-gray-900">包装不符合国际标准</p>
                <p className="text-sm text-gray-600">使用国内快递的薄纸箱发国际件，经过多次中转后破损。国际运输应使用更坚固的包装。</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-red-500 font-bold shrink-0">✗</span>
              <div>
                <p className="text-sm font-medium text-gray-900">申报信息模糊</p>
                <p className="text-sm text-gray-600">品名写 "gift"、"sample"、"accessories" 等模糊描述会被海关要求补充说明，延误清关。应写明具体品名和材质。</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-red-500 font-bold shrink-0">✗</span>
              <div>
                <p className="text-sm font-medium text-gray-900">忽略目的地国家的特殊要求</p>
                <p className="text-sm text-gray-600">不同国家有不同的进口限制和认证要求。如澳洲需要熏蒸证明（木质包装），美国需要 FDA 注册（食品接触品）。</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-red-500 font-bold shrink-0">✗</span>
              <div>
                <p className="text-sm font-medium text-gray-900">标签贴错位置或被遮挡</p>
                <p className="text-sm text-gray-600">运单标签应贴在箱子最大面的中央，不能被胶带覆盖条码，不能被其他标签遮挡。FBA 箱标同样需要清晰可见。</p>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-100 rounded-lg px-4 py-3 mb-8">
          <p className="text-sm text-amber-800">
            <span className="font-medium">免责声明：</span>
            本检查清单为通用参考，不同国家、不同物流渠道、不同商品类型可能有额外要求。建议根据具体发货情况调整清单内容，并在首次发往新国家时咨询专业报关行。
          </p>
        </div>

        {/* Related Tools */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-teal-600" />
            相关工具
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <Link href="/tools/commercial-invoice" className="flex items-center gap-3 p-4 rounded-lg border border-gray-100 bg-gray-50 hover:bg-white hover:border-teal-200 hover:shadow-sm transition-all group">
              <span className="text-2xl">📄</span>
              <div>
                <p className="font-medium text-gray-900 group-hover:text-teal-700">商业发票生成器</p>
                <p className="text-xs text-gray-500">快速生成标准商业发票</p>
              </div>
            </Link>
            <Link href="/tools/packing-list" className="flex items-center gap-3 p-4 rounded-lg border border-gray-100 bg-gray-50 hover:bg-white hover:border-teal-200 hover:shadow-sm transition-all group">
              <span className="text-2xl">📋</span>
              <div>
                <p className="font-medium text-gray-900 group-hover:text-teal-700">装箱单生成器</p>
                <p className="text-xs text-gray-500">生成标准装箱单</p>
              </div>
            </Link>
            <Link href="/tools/customs-generator" className="flex items-center gap-3 p-4 rounded-lg border border-gray-100 bg-gray-50 hover:bg-white hover:border-teal-200 hover:shadow-sm transition-all group">
              <span className="text-2xl">📦</span>
              <div>
                <p className="font-medium text-gray-900 group-hover:text-teal-700">报关单生成</p>
                <p className="text-xs text-gray-500">生成国际快递报关单</p>
              </div>
            </Link>
            <Link href="/tools/hs-code" className="flex items-center gap-3 p-4 rounded-lg border border-gray-100 bg-gray-50 hover:bg-white hover:border-teal-200 hover:shadow-sm transition-all group">
              <span className="text-2xl">🔍</span>
              <div>
                <p className="font-medium text-gray-900 group-hover:text-teal-700">HS 编码查询</p>
                <p className="text-xs text-gray-500">查找商品海关编码</p>
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
                <p className="text-xs text-gray-500">按清单步骤完成发货准备</p>
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
            href="/tools/commercial-invoice"
            className="inline-flex items-center gap-2 px-8 py-4 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20 min-h-[48px]"
          >
            <ClipboardList className="w-5 h-5" />
            生成发货文件
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </>
  );
}
