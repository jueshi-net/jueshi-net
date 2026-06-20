import { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumb } from '@/components/breadcrumb';
import { FAQSection } from '@/components/faq-section';
import { FileText, AlertCircle, CheckCircle, ArrowRight, Wrench, Zap, Download } from 'lucide-react';

export const metadata: Metadata = {
  title: '商业发票填写指南：国际贸易必备单据 | 绝世百宝箱',
  description: '详解商业发票的填写要点、必备字段、常见错误和注意事项。提供发票样本、字段说明和填写示例，帮助您快速生成符合国际标准的商业发票。',
  keywords: '商业发票,Commercial Invoice,国际贸易发票,发票填写,外贸单据',
};

const faqItems = [
  {
    question: '商业发票必须用英文填写吗？',
    answer: '国际交易中建议使用英文。部分国家接受双语（如中英文对照），但纯中文发票在大多数国家无法用于清关。发票金额可以用数字+大写两种方式标注以防篡改。',
  },
  {
    question: '商业发票和增值税发票有什么区别？',
    answer: '商业发票（Commercial Invoice）是国际贸易单据，用于跨境交易清关和付款。增值税发票（VAT Invoice）是中国国内税务凭证。两者用途完全不同，不可互相替代。',
  },
  {
    question: '发票上的贸易条款（Incoterms）怎么填？',
    answer: '常用的贸易条款包括：EXW（工厂交货）、FOB（装运港船上交货）、CIF（成本加保险费加运费）、DDP（完税后交货）。选择取决于买卖双方的责任划分，建议与买家确认。',
  },
  {
    question: '个人寄送物品需要开发票吗？',
    answer: '需要。即使是个人物品，国际快递也要求提供发票用于海关申报。可以使用形式发票（Proforma Invoice），标注 "Not for Commercial Use" 或 "Personal Effects"。',
  },
  {
    question: '发票金额可以低于实际交易价格吗？',
    answer: '不建议。低报价格属于违法行为，一旦被海关发现可能面临罚款、补税甚至刑事责任。应如实申报交易价格，包括运费和保险费（取决于贸易条款）。',
  },
];

export default function CommercialInvoicePage() {
  return (
    <>
      <Breadcrumb />
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        {/* Hero */}
        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 sm:p-10 text-white mb-8">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-orange-200" />
            <span className="text-sm font-medium text-orange-200">出海经营指南</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-4">
            商业发票填写指南：国际贸易必备单据
          </h1>
          <p className="text-orange-100 text-base sm:text-lg leading-relaxed">
            掌握商业发票的填写要点，确保单据符合国际标准，顺利完成跨境交易和清关。
          </p>
        </div>

        {/* Target Audience */}
        <div className="bg-teal-50 border border-teal-100 rounded-xl p-5 mb-8">
          <h2 className="text-sm font-bold text-teal-800 mb-2 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> 适用人群
          </h2>
          <p className="text-sm text-teal-700">
            外贸从业者、跨境电商卖家、国际物流操作人员、需要开具发票给海外客户的商家、首次接触国际贸易的新手。
          </p>
        </div>

        {/* Invoice Elements */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-orange-600" />
            商业发票必备字段
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            一份完整的商业发票应包含以下核心信息。缺少关键信息可能导致清关延误或被退回修改。
          </p>

          <div className="space-y-3">
            <div className="border border-gray-100 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 text-sm mb-2">1. 发票基本信息</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 发票编号（Invoice Number）— 唯一标识，建议按规则编号</li>
                <li>• 开票日期（Invoice Date）</li>
                <li>• 贸易条款（Incoterms，如 FOB Shanghai、CIF Los Angeles）</li>
                <li>• 付款条件（Payment Terms，如 T/T、L/C、D/P）</li>
              </ul>
            </div>

            <div className="border border-gray-100 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 text-sm mb-2">2. 交易双方信息</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 发货人/卖方（Shipper/Exporter）— 公司名、地址、联系方式</li>
                <li>• 收货人/买方（Consignee/Importer）— 公司名、地址、联系方式</li>
                <li>• 通知方（Notify Party）— 可选，通常是买方或其代理</li>
              </ul>
            </div>

            <div className="border border-gray-100 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 text-sm mb-2">3. 货物明细</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 商品描述（Description of Goods）— 详细品名，不能过于笼统</li>
                <li>• HS 编码（Harmonized System Code）— 6 位以上</li>
                <li>• 数量（Quantity）和单位</li>
                <li>• 单价（Unit Price）和总价（Total Amount）</li>
                <li>• 币种（Currency，如 USD、EUR、CNY）</li>
                <li>• 原产国（Country of Origin）</li>
              </ul>
            </div>

            <div className="border border-gray-100 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 text-sm mb-2">4. 运输信息</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 起运港/地（Port/Place of Loading）</li>
                <li>• 目的港/地（Port/Place of Discharge）</li>
                <li>• 运输方式（By sea/air/express）</li>
                <li>• 运费和保险费（如适用）</li>
              </ul>
            </div>

            <div className="border border-gray-100 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 text-sm mb-2">5. 签章</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 发货人签章或授权人签名</li>
                <li>• 公司盖章（部分国家要求）</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Sample Invoice */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📄 发票样本示例</h2>
          <div className="bg-gray-50 rounded-lg p-4 font-mono text-xs leading-relaxed overflow-x-auto">
            <div className="text-center font-bold text-sm mb-3">COMMERCIAL INVOICE</div>
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <div className="font-semibold">Invoice No: INV-2024-001</div>
                <div>Date: 2024-06-15</div>
              </div>
              <div className="text-right">
                <div>Terms: FOB Shanghai</div>
                <div>Payment: T/T 30% deposit</div>
              </div>
            </div>
            <div className="border-t border-gray-300 pt-2 mb-2">
              <div className="font-semibold">Shipper:</div>
              <div>ABC Trading Co., Ltd.</div>
              <div>123 Nanjing Road, Shanghai, China</div>
            </div>
            <div className="border-t border-gray-300 pt-2 mb-2">
              <div className="font-semibold">Consignee:</div>
              <div>XYZ Import LLC</div>
              <div>456 Market St, Los Angeles, CA 90001, USA</div>
            </div>
            <div className="border-t border-gray-300 pt-2">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="text-left py-1">Description</th>
                    <th className="text-center py-1">HS Code</th>
                    <th className="text-right py-1">Qty</th>
                    <th className="text-right py-1">Unit Price</th>
                    <th className="text-right py-1">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="py-1">Cotton T-Shirt, Men's</td>
                    <td className="text-center">6109.10</td>
                    <td className="text-right">500 pcs</td>
                    <td className="text-right">USD 3.50</td>
                    <td className="text-right">USD 1,750.00</td>
                  </tr>
                  <tr>
                    <td className="py-1">Cotton T-Shirt, Women's</td>
                    <td className="text-center">6109.10</td>
                    <td className="text-right">300 pcs</td>
                    <td className="text-right">USD 3.80</td>
                    <td className="text-right">USD 1,140.00</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="border-t border-gray-300 font-bold">
                    <td colSpan={4} className="text-right py-1">TOTAL:</td>
                    <td className="text-right py-1">USD 2,890.00</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div className="mt-3 text-xs">
              <div>Country of Origin: China</div>
              <div>Port of Loading: Shanghai, China</div>
              <div>Port of Discharge: Los Angeles, USA</div>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📝 填写商业发票的步骤</h2>
          <ol className="space-y-3 text-sm text-gray-700">
            <li className="flex gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-700 font-bold text-xs shrink-0">1</span>
              <span>准备交易信息：买卖双方资料、商品明细、价格、贸易条款</span>
            </li>
            <li className="flex gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-700 font-bold text-xs shrink-0">2</span>
              <span>确定每个商品的 HS 编码（使用 HS 编码查询工具）</span>
            </li>
            <li className="flex gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-700 font-bold text-xs shrink-0">3</span>
              <span>使用商业发票生成工具，填入所有必填字段</span>
            </li>
            <li className="flex gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-700 font-bold text-xs shrink-0">4</span>
              <span>核对金额计算是否正确，检查拼写和格式</span>
            </li>
            <li className="flex gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-700 font-bold text-xs shrink-0">5</span>
              <span>导出 PDF，打印签章后随货附寄或电子发送给买方</span>
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
                <p className="text-sm text-gray-600">写 "Garments" 不够具体，应写明 "Men's 100% cotton knitted T-shirt"</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-red-500 font-bold shrink-0">✗</span>
              <div>
                <p className="text-sm font-medium text-gray-900">金额计算错误</p>
                <p className="text-sm text-gray-600">单价 × 数量 ≠ 总价，或各商品总价之和 ≠ 合计金额</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-red-500 font-bold shrink-0">✗</span>
              <div>
                <p className="text-sm font-medium text-gray-900">缺少 HS 编码或原产国</p>
                <p className="text-sm text-gray-600">这两个字段是海关清关的必需信息，缺少会导致延误</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-red-500 font-bold shrink-0">✗</span>
              <div>
                <p className="text-sm font-medium text-gray-900">发票信息与其他单据不一致</p>
                <p className="text-sm text-gray-600">发票、装箱单、提单上的信息（如数量、重量）必须一致</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-red-500 font-bold shrink-0">✗</span>
              <div>
                <p className="text-sm font-medium text-gray-900">未注明币种</p>
                <p className="text-sm text-gray-600">金额必须标注币种（USD、EUR 等），否则海关可能按不利于发货人的汇率折算</p>
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
            <Link href="/tools/hs-code" className="flex items-center gap-3 p-4 rounded-lg border border-gray-100 bg-gray-50 hover:bg-white hover:border-teal-200 hover:shadow-sm transition-all group">
              <span className="text-2xl">🔍</span>
              <div>
                <p className="font-medium text-gray-900 group-hover:text-teal-700">HS 编码查询</p>
                <p className="text-xs text-gray-500">查找商品海关编码</p>
              </div>
            </Link>
            <Link href="/tools/documents" className="flex items-center gap-3 p-4 rounded-lg border border-gray-100 bg-gray-50 hover:bg-white hover:border-teal-200 hover:shadow-sm transition-all group">
              <span className="text-2xl">📋</span>
              <div>
                <p className="font-medium text-gray-900 group-hover:text-teal-700">单据中心</p>
                <p className="text-xs text-gray-500">装箱单、报价单等更多单据</p>
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
                <p className="font-medium text-gray-900 group-hover:text-amber-700">新建发货任务</p>
                <p className="text-xs text-gray-500">从发票到发货一条龙</p>
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
            <FileText className="w-5 h-5" />
            生成商业发票
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </>
  );
}
