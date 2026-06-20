import { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumb } from '@/components/breadcrumb';
import { FAQSection } from '@/components/faq-section';
import { Package, AlertCircle, CheckCircle, ArrowRight, Wrench, Zap, FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: '装箱单填写指南：国际物流必备单据 | 绝世百宝箱',
  description: '详解装箱单的填写要点、必备字段、与商业发票的区别、常见错误和注意事项。提供装箱单样本和填写示例，帮助您快速生成符合国际标准的装箱单。',
  keywords: '装箱单,Packing List,国际物流单据,装箱单填写,外贸包装清单',
};

const faqItems = [
  {
    question: '装箱单和商业发票有什么区别？',
    answer: '商业发票侧重交易信息（价格、付款条件、贸易条款），用于海关估价和征税。装箱单侧重包装信息（箱数、每箱内容、重量、体积），用于物流操作和仓库收货。两者互补，通常一起使用。',
  },
  {
    question: '装箱单上需要写价格吗？',
    answer: '通常不需要。装箱单主要记录货物的物理信息（数量、重量、体积、包装方式），不包含价格。价格信息在商业发票中体现。但部分情况下可以加上参考价值。',
  },
  {
    question: '什么是唛头（Shipping Mark）？',
    answer: '唛头是印在外箱上的标识信息，用于识别货物。通常包括：收货人简称、目的港、箱号（如 C/No. 1-50）、订单号等。有些货物使用 "N/M"（No Mark）表示无唛头。',
  },
  {
    question: '毛重和净重有什么区别？',
    answer: '毛重（Gross Weight）= 货物净重 + 包装重量（包括内包装和外箱）。净重（Net Weight）= 货物本身的重量，不含任何包装。海关和物流公司通常关注毛重。',
  },
  {
    question: '装箱单必须用英文吗？',
    answer: '国际物流建议使用英文。部分国家接受双语版本。纯中文装箱单在目的港可能无法被仓库或海关识别，导致操作延误。',
  },
];

export default function PackingListPage() {
  return (
    <>
      <Breadcrumb />
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        {/* Hero */}
        <div className="bg-gradient-to-br from-cyan-600 to-blue-700 rounded-2xl p-6 sm:p-10 text-white mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-cyan-200" />
            <span className="text-sm font-medium text-cyan-200">出海经营指南</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-4">
            装箱单填写指南：国际物流必备单据
          </h1>
          <p className="text-cyan-100 text-base sm:text-lg leading-relaxed">
            掌握装箱单的填写要点，确保包装信息准确清晰，提高物流操作效率。
          </p>
        </div>

        {/* Target Audience */}
        <div className="bg-teal-50 border border-teal-100 rounded-xl p-5 mb-8">
          <h2 className="text-sm font-bold text-teal-800 mb-2 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> 适用人群
          </h2>
          <p className="text-sm text-teal-700">
            外贸从业者、跨境电商卖家、仓库管理人员、国际物流操作人员、需要打包发货的商家。
          </p>
        </div>

        {/* What is Packing List */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-cyan-600" />
            什么是装箱单？
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            装箱单（Packing List）是详细记录货物包装情况的单据。它告诉物流公司、仓库和海关：这批货有多少箱、每箱装了什么、多重、多大。装箱单不包含价格信息（那是商业发票的职责）。
          </p>
          <div className="bg-cyan-50 rounded-lg p-4 text-sm text-cyan-800">
            <p className="font-medium mb-1">装箱单的核心作用：</p>
            <ul className="space-y-1">
              <li>• 物流操作：仓库根据装箱单收货、分拣、上架</li>
              <li>• 海关查验：核对实际货物与申报是否一致</li>
              <li>• 收货确认：买方根据装箱单清点到货数量</li>
              <li>• 运费计算：根据重量和体积计算物流费用</li>
            </ul>
          </div>
        </div>

        {/* Packing List Elements */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📋 装箱单必备字段</h2>

          <div className="space-y-3">
            <div className="border border-gray-100 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 text-sm mb-2">1. 基本信息</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 单据编号（Packing List Number）— 可与发票号关联</li>
                <li>• 日期（Date）</li>
                <li>• 关联发票号（Invoice Reference）— 可选</li>
              </ul>
            </div>

            <div className="border border-gray-100 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 text-sm mb-2">2. 交易双方信息</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 发货人（Shipper）— 公司名、地址</li>
                <li>• 收货人（Consignee）— 公司名、地址</li>
              </ul>
            </div>

            <div className="border border-gray-100 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 text-sm mb-2">3. 包装明细</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 总箱数/件数（Total Packages）</li>
                <li>• 每箱内容（Contents per Carton）— 品名、数量</li>
                <li>• 唛头（Shipping Mark）— 外箱标识</li>
                <li>• 箱号（Carton Number）— 如 C/No. 1 of 50</li>
              </ul>
            </div>

            <div className="border border-gray-100 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 text-sm mb-2">4. 重量和体积</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 毛重（Gross Weight）— 含包装的总重量，单位 KG</li>
                <li>• 净重（Net Weight）— 货物本身重量，单位 KG</li>
                <li>• 外箱尺寸（Carton Dimensions）— 长×宽×高，单位 CM</li>
                <li>• 总体积（Total Volume）— 单位 CBM（立方米）</li>
              </ul>
            </div>

            <div className="border border-gray-100 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 text-sm mb-2">5. 运输信息</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 起运地（Place of Loading）</li>
                <li>• 目的地（Place of Destination）</li>
                <li>• 运输方式（By sea/air/express）</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Sample Packing List */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📄 装箱单样本示例</h2>
          <div className="bg-gray-50 rounded-lg p-4 font-mono text-xs leading-relaxed overflow-x-auto">
            <div className="text-center font-bold text-sm mb-3">PACKING LIST</div>
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <div className="font-semibold">Packing List No: PL-2024-001</div>
                <div>Date: 2024-06-15</div>
              </div>
              <div className="text-right">
                <div>Invoice Ref: INV-2024-001</div>
              </div>
            </div>
            <div className="border-t border-gray-300 pt-2 mb-2">
              <div className="font-semibold">Shipper:</div>
              <div>ABC Trading Co., Ltd., Shanghai, China</div>
            </div>
            <div className="border-t border-gray-300 pt-2 mb-2">
              <div className="font-semibold">Consignee:</div>
              <div>XYZ Import LLC, Los Angeles, USA</div>
            </div>
            <div className="border-t border-gray-300 pt-2">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="text-left py-1">Carton No.</th>
                    <th className="text-left py-1">Contents</th>
                    <th className="text-right py-1">Qty</th>
                    <th className="text-right py-1">G.W.(KG)</th>
                    <th className="text-right py-1">N.W.(KG)</th>
                    <th className="text-right py-1">Meas.(CM)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="py-1">1-10</td>
                    <td className="py-1">Men's Cotton T-Shirt</td>
                    <td className="text-right">50 pcs/ctn</td>
                    <td className="text-right">15.0</td>
                    <td className="text-right">13.5</td>
                    <td className="text-right">60×40×40</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-1">11-16</td>
                    <td className="py-1">Women's Cotton T-Shirt</td>
                    <td className="text-right">50 pcs/ctn</td>
                    <td className="text-right">14.0</td>
                    <td className="text-right">12.8</td>
                    <td className="text-right">60×40×40</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="border-t border-gray-300 font-bold">
                    <td className="py-1">TOTAL: 16 CTNS</td>
                    <td></td>
                    <td className="text-right">800 pcs</td>
                    <td className="text-right">232.0</td>
                    <td className="text-right">212.8</td>
                    <td className="text-right">0.768 CBM</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div className="mt-3 text-xs">
              <div>Shipping Mark: XYZ / LOS ANGELES / C/No. 1-16</div>
              <div>Place of Loading: Shanghai, China</div>
              <div>Place of Destination: Los Angeles, USA</div>
            </div>
          </div>
        </div>

        {/* Difference with Invoice */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">🔄 装箱单 vs 商业发票</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-cyan-50 rounded-lg p-4">
              <h3 className="font-bold text-cyan-800 mb-2 flex items-center gap-2">
                <Package className="w-4 h-4" /> 装箱单（Packing List）
              </h3>
              <ul className="text-sm text-cyan-700 space-y-1">
                <li>• 侧重：包装和物理信息</li>
                <li>• 包含：箱数、重量、体积、尺寸</li>
                <li>• 不包含：价格、付款条件</li>
                <li>• 用途：物流操作、仓库收货</li>
                <li>• 使用者：仓库、物流公司、海关</li>
              </ul>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <h3 className="font-bold text-orange-800 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" /> 商业发票（Commercial Invoice）
              </h3>
              <ul className="text-sm text-orange-700 space-y-1">
                <li>• 侧重：交易和财务信息</li>
                <li>• 包含：价格、金额、贸易条款</li>
                <li>• 不包含：详细包装信息</li>
                <li>• 用途：海关估价、征税、付款</li>
                <li>• 使用者：海关、银行、买方财务</li>
              </ul>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-4">
            两份单据的数量、品名必须一致。海关会核对发票金额和装箱单数量是否匹配。
          </p>
        </div>

        {/* Steps */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📝 填写装箱单的步骤</h2>
          <ol className="space-y-3 text-sm text-gray-700">
            <li className="flex gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-100 text-cyan-700 font-bold text-xs shrink-0">1</span>
              <span>确认包装方案：多少箱、每箱装什么、装多少</span>
            </li>
            <li className="flex gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-100 text-cyan-700 font-bold text-xs shrink-0">2</span>
              <span>称量每箱毛重和净重，测量外箱尺寸</span>
            </li>
            <li className="flex gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-100 text-cyan-700 font-bold text-xs shrink-0">3</span>
              <span>确定唛头内容（收货人简称、目的港、箱号范围）</span>
            </li>
            <li className="flex gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-100 text-cyan-700 font-bold text-xs shrink-0">4</span>
              <span>使用装箱单生成工具，填入所有信息</span>
            </li>
            <li className="flex gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-100 text-cyan-700 font-bold text-xs shrink-0">5</span>
              <span>核对总数：箱数、总件数、总重量、总体积是否计算正确</span>
            </li>
            <li className="flex gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-100 text-cyan-700 font-bold text-xs shrink-0">6</span>
              <span>导出 PDF，打印后随货附寄或发送给物流公司</span>
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
                <p className="text-sm font-medium text-gray-900">数量计算错误</p>
                <p className="text-sm text-gray-600">每箱数量 × 箱数 ≠ 总数量，导致收货时数量不符</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-red-500 font-bold shrink-0">✗</span>
              <div>
                <p className="text-sm font-medium text-gray-900">重量单位混淆</p>
                <p className="text-sm text-gray-600">KG 和 LBS 混用，或毛重净重填反。国际物流统一使用 KG</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-red-500 font-bold shrink-0">✗</span>
              <div>
                <p className="text-sm font-medium text-gray-900">尺寸单位错误</p>
                <p className="text-sm text-gray-600">CM 和 INCH 混用。体积计算时注意单位换算（CM³ → CBM 需除以 1,000,000）</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-red-500 font-bold shrink-0">✗</span>
              <div>
                <p className="text-sm font-medium text-gray-900">与发票数据不一致</p>
                <p className="text-sm text-gray-600">装箱单的数量与发票的数量对不上，海关可能要求修改或扣货</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-red-500 font-bold shrink-0">✗</span>
              <div>
                <p className="text-sm font-medium text-gray-900">缺少唛头信息</p>
                <p className="text-sm text-gray-600">没有唛头或唛头不清晰，导致仓库无法识别和分拣货物</p>
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
            <Link href="/tools/documents" className="flex items-center gap-3 p-4 rounded-lg border border-gray-100 bg-gray-50 hover:bg-white hover:border-teal-200 hover:shadow-sm transition-all group">
              <span className="text-2xl">📋</span>
              <div>
                <p className="font-medium text-gray-900 group-hover:text-teal-700">单据中心</p>
                <p className="text-xs text-gray-500">装箱单、发票等多种单据</p>
              </div>
            </Link>
            <Link href="/tools/commercial-invoice" className="flex items-center gap-3 p-4 rounded-lg border border-gray-100 bg-gray-50 hover:bg-white hover:border-teal-200 hover:shadow-sm transition-all group">
              <span className="text-2xl">📄</span>
              <div>
                <p className="font-medium text-gray-900 group-hover:text-teal-700">商业发票生成器</p>
                <p className="text-xs text-gray-500">配套使用商业发票</p>
              </div>
            </Link>
            <Link href="/tools/shipping-calculator" className="flex items-center gap-3 p-4 rounded-lg border border-gray-100 bg-gray-50 hover:bg-white hover:border-teal-200 hover:shadow-sm transition-all group">
              <span className="text-2xl">🧮</span>
              <div>
                <p className="font-medium text-gray-900 group-hover:text-teal-700">运费估算器</p>
                <p className="text-xs text-gray-500">根据重量体积计算运费</p>
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
                <p className="text-xs text-gray-500">从装箱到发货一条龙</p>
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
            href="/tools/documents"
            className="inline-flex items-center gap-2 px-8 py-4 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20 min-h-[48px]"
          >
            <Package className="w-5 h-5" />
            生成装箱单
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </>
  );
}
