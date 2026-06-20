import { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumb } from '@/components/breadcrumb';
import { FAQSection } from '@/components/faq-section';
import { FileText, ClipboardList, AlertCircle, CheckCircle, ArrowRight, Wrench, Zap, Download } from 'lucide-react';

export const metadata: Metadata = {
  title: '国际发货必备单据清单：商业发票、装箱单、报关单 | 绝世百宝箱',
  description: '国际发货需要哪些单据？详解商业发票、装箱单、报关单的用途、填写要点和常见问题，提供模板下载和在线生成工具，帮助您顺利完成国际物流。',
  keywords: '国际发货单据,商业发票,装箱单,报关单,国际物流文件',
};

const faqItems = [
  {
    question: '个人寄送物品也需要商业发票吗？',
    answer: '是的，即使是个人物品，国际快递也需要随附商业发票（或形式发票）用于海关申报。个人物品可以在发票上标注 "Personal Effects - Not for Sale"，并填写合理的申报价值。',
  },
  {
    question: '商业发票和形式发票有什么区别？',
    answer: '商业发票（Commercial Invoice）用于已付款的贸易交易，形式发票（Proforma Invoice）用于报价或预付款阶段。国际快递清关通常接受两者，但贸易件建议使用商业发票。',
  },
  {
    question: '报关单是由谁来填写？',
    answer: '通常由发货人或货代/报关行填写。使用我们的在线工具可以自助生成报关单据，然后交给快递公司或报关行提交。部分快递（如 DHL）支持电子预报关。',
  },
  {
    question: '单据语言要求是什么？',
    answer: '大多数国家接受英文单据。部分国家（如俄罗斯、巴西）可能要求当地语言或双语版本。建议统一使用英文，必要时附上翻译件。',
  },
  {
    question: '电子单据和纸质单据都可以吗？',
    answer: '越来越多国家和快递公司接受电子单据（e-AWB、电子发票），但部分目的地仍需纸质随货。建议同时准备电子版和打印版。',
  },
];

export default function InternationalShippingDocumentsPage() {
  return (
    <>
      <Breadcrumb />
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        {/* Hero */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-6 sm:p-10 text-white mb-8">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList className="w-5 h-5 text-emerald-200" />
            <span className="text-sm font-medium text-emerald-200">跨境寄送指南</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-4">
            国际发货必备单据清单：商业发票、装箱单、报关单
          </h1>
          <p className="text-emerald-100 text-base sm:text-lg leading-relaxed">
            了解国际发货所需的各种单据，掌握填写要点，避免因单据问题导致清关延误。
          </p>
        </div>

        {/* Target Audience */}
        <div className="bg-teal-50 border border-teal-100 rounded-xl p-5 mb-8">
          <h2 className="text-sm font-bold text-teal-800 mb-2 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> 适用人群
          </h2>
          <p className="text-sm text-teal-700">
            跨境电商卖家、外贸从业者、国际物流操作人员、首次寄送国际包裹的个人、集运仓操作员。
          </p>
        </div>

        {/* Documents Overview */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            国际发货核心单据
          </h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            国际发货通常需要以下三类核心单据。不同运输方式（快递、空运、海运）和目的地国家的要求可能略有差异，但这三份文件是最基本的。
          </p>

          <div className="space-y-4">
            {/* Commercial Invoice */}
            <div className="border border-gray-100 rounded-lg p-5">
              <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold">1</span>
                商业发票（Commercial Invoice）
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                国际贸易中最核心的单据，用于海关估价、征税和统计。记录了交易双方的信息和货物详情。
              </p>
              <div className="bg-gray-50 rounded-lg p-3 text-sm">
                <p className="font-medium text-gray-800 mb-1">必须包含的信息：</p>
                <ul className="text-gray-600 space-y-1">
                  <li>• 发货人和收货人的完整名称、地址、联系方式</li>
                  <li>• 发票编号和日期</li>
                  <li>• 每件商品的描述、数量、单价、总价</li>
                  <li>• HS 编码（海关编码）</li>
                  <li>• 贸易条款（Incoterms，如 FOB、CIF、DDP）</li>
                  <li>• 币种和付款方式</li>
                  <li>• 原产国</li>
                </ul>
              </div>
            </div>

            {/* Packing List */}
            <div className="border border-gray-100 rounded-lg p-5">
              <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold">2</span>
                装箱单（Packing List）
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                详细描述货物包装情况的单据，用于物流操作、仓库收货和海关查验。不包含价格信息。
              </p>
              <div className="bg-gray-50 rounded-lg p-3 text-sm">
                <p className="font-medium text-gray-800 mb-1">必须包含的信息：</p>
                <ul className="text-gray-600 space-y-1">
                  <li>• 发货人和收货人信息</li>
                  <li>• 包裹/箱数、每箱内容</li>
                  <li>• 每件商品的名称和数量</li>
                  <li>• 毛重（Gross Weight）和净重（Net Weight）</li>
                  <li>• 外箱尺寸和总体积</li>
                  <li>• 唛头（Shipping Mark）</li>
                </ul>
              </div>
            </div>

            {/* Customs Declaration */}
            <div className="border border-gray-100 rounded-lg p-5">
              <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold">3</span>
                报关单（Customs Declaration）
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                向海关申报货物信息的正式文件。快递件通常使用快递公司提供的简化报关单（如 CN22/CN23），正式贸易需要完整的报关单。
              </p>
              <div className="bg-gray-50 rounded-lg p-3 text-sm">
                <p className="font-medium text-gray-800 mb-1">必须包含的信息：</p>
                <ul className="text-gray-600 space-y-1">
                  <li>• 商品详细描述（不能只写 "Gift" 或 "Sample"）</li>
                  <li>• HS 编码</li>
                  <li>• 数量、重量、价值</li>
                  <li>• 原产国</li>
                  <li>• 用途说明（贸易/个人/样品）</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📝 准备发货单据的步骤</h2>
          <ol className="space-y-3 text-sm text-gray-700">
            <li className="flex gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs shrink-0">1</span>
              <span>确认货物信息：品名、数量、重量、尺寸、价值、HS 编码</span>
            </li>
            <li className="flex gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs shrink-0">2</span>
              <span>使用商业发票生成工具创建发票，填写交易双方信息和商品明细</span>
            </li>
            <li className="flex gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs shrink-0">3</span>
              <span>使用装箱单生成工具创建装箱单，填写包装信息和重量体积</span>
            </li>
            <li className="flex gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs shrink-0">4</span>
              <span>根据运输方式准备报关单（快递件通常由快递公司代为申报）</span>
            </li>
            <li className="flex gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs shrink-0">5</span>
              <span>打印所有单据，随货附寄或提前电子预报关</span>
            </li>
          </ol>
        </div>

        {/* Common Mistakes */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            常见错误与注意事项
          </h2>
          <div className="space-y-4">
            <div className="flex gap-3">
              <span className="text-red-500 font-bold shrink-0">✗</span>
              <div>
                <p className="text-sm font-medium text-gray-900">商品描述过于笼统</p>
                <p className="text-sm text-gray-600">写 "Gift"、"Clothes"、"Accessories" 不够具体，应写明材质和用途，如 "Men's cotton T-shirt"</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-red-500 font-bold shrink-0">✗</span>
              <div>
                <p className="text-sm font-medium text-gray-900">申报价值不合理</p>
                <p className="text-sm text-gray-600">过低申报可能被海关质疑并罚款，过高则多缴税。应如实申报交易价值</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-red-500 font-bold shrink-0">✗</span>
              <div>
                <p className="text-sm font-medium text-gray-900">缺少 HS 编码</p>
                <p className="text-sm text-gray-600">大多数国家要求提供 6 位以上的 HS 编码，缺少会导致清关延误</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-red-500 font-bold shrink-0">✗</span>
              <div>
                <p className="text-sm font-medium text-gray-900">发票与装箱单数据不一致</p>
                <p className="text-sm text-gray-600">两份单据的数量、重量必须一致，否则海关可能要求修改或扣货</p>
              </div>
            </div>
          </div>
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
                <p className="text-xs text-gray-500">在线生成标准商业发票</p>
              </div>
            </Link>
            <Link href="/tools/documents" className="flex items-center gap-3 p-4 rounded-lg border border-gray-100 bg-gray-50 hover:bg-white hover:border-teal-200 hover:shadow-sm transition-all group">
              <span className="text-2xl">📋</span>
              <div>
                <p className="font-medium text-gray-900 group-hover:text-teal-700">单据中心</p>
                <p className="text-xs text-gray-500">装箱单、报价单等多种单据</p>
              </div>
            </Link>
            <Link href="/tools/hs-code" className="flex items-center gap-3 p-4 rounded-lg border border-gray-100 bg-gray-50 hover:bg-white hover:border-teal-200 hover:shadow-sm transition-all group">
              <span className="text-2xl">🔍</span>
              <div>
                <p className="font-medium text-gray-900 group-hover:text-teal-700">HS 编码查询</p>
                <p className="text-xs text-gray-500">快速查找商品海关编码</p>
              </div>
            </Link>
            <Link href="/tools/customs-generator" className="flex items-center gap-3 p-4 rounded-lg border border-gray-100 bg-gray-50 hover:bg-white hover:border-teal-200 hover:shadow-sm transition-all group">
              <span className="text-2xl">📦</span>
              <div>
                <p className="font-medium text-gray-900 group-hover:text-teal-700">报关单生成</p>
                <p className="text-xs text-gray-500">快速生成报关单据</p>
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
              <span className="text-2xl">🚀</span>
              <div>
                <p className="font-medium text-gray-900 group-hover:text-amber-700">开始发货任务链</p>
                <p className="text-xs text-gray-500">从单据准备到下单发货一条龙</p>
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
            href="/workspace/task-chains/shipping/new"
            className="inline-flex items-center gap-2 px-8 py-4 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20 min-h-[48px]"
          >
            <Zap className="w-5 h-5" />
            开始发货任务链
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </>
  );
}
