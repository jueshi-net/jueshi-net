import { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumb } from '@/components/breadcrumb';
import { FAQSection } from '@/components/faq-section';
import { Package, Calculator, AlertCircle, CheckCircle, ArrowRight, Wrench, Zap, BookOpen } from 'lucide-react';

export const metadata: Metadata = {
  title: 'CBM 计算指南：体积重与计费重量的计算方法 | 绝世百宝箱',
  description: '什么是 CBM（立方米）？如何计算体积重量？体积重和实重哪个决定运费？本文详解 CBM 计算公式、计费重量规则、常见错误，帮助外贸和跨境卖家准确估算物流费用。',
  keywords: 'CBM计算,体积重量,计费重量,立方米,国际物流计费,体积重实重',
};

const faqItems = [
  {
    question: 'CBM 和体积重量是一回事吗？',
    answer: '不完全相同。CBM（Cubic Meter）是货物的实际体积，单位为立方米。体积重量（Volumetric Weight / Dimensional Weight）是根据货物体积按一定系数折算出的"重量"，用于和实际重量比较后取较大值作为计费重量。',
  },
  {
    question: '为什么物流要按体积重量收费？',
    answer: '因为运输工具的载货空间有限。轻泡货（如棉花、枕头）虽然重量轻但占用大量空间，如果只按实重收费，物流公司会亏损。体积重量机制确保运费能反映货物实际占用的运输资源。',
  },
  {
    question: '海运和空运的体积重系数一样吗？',
    answer: '不一样。空运通常按 1 CBM = 167 KG 计算体积重（即除以 6000），海运拼箱按 1 CBM = 1000 KG（即 1 吨）计算，快递通常按 1 CBM = 200 KG（即除以 5000）。不同物流方式系数不同，请确认具体渠道。',
  },
  {
    question: '计费重量是取体积重和实重的较大值吗？',
    answer: '是的。国际物流通用的规则是：计费重量 = MAX（实际重量, 体积重量）。这就是为什么轻泡货的运费往往比预期高——因为体积重大于实重。',
  },
  {
    question: '如何降低体积重带来的运费？',
    answer: '可以压缩包装减少体积、使用真空袋、拆掉不必要的包装、合并多个小包裹为一个大箱（减少包装间隙）。对于长期发货，优化产品设计或包装方案是最有效的方法。',
  },
];

export default function CBMCalculationGuidePage() {
  return (
    <>
      <Breadcrumb />
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        {/* Hero */}
        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 sm:p-10 text-white mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-orange-200" />
            <span className="text-sm font-medium text-orange-200">国际物流指南</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-4">
            CBM 计算指南：体积重与计费重量的计算方法
          </h1>
          <p className="text-orange-100 text-base sm:text-lg leading-relaxed">
            了解 CBM 的含义和计算公式，掌握体积重量与实重的比较规则，准确预估国际物流费用。
          </p>
        </div>

        {/* Target Audience */}
        <div className="bg-teal-50 border border-teal-100 rounded-xl p-5 mb-8">
          <h2 className="text-sm font-bold text-teal-800 mb-2 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> 适用人群
          </h2>
          <p className="text-sm text-teal-700">
            跨境电商卖家、外贸业务员、国际物流操作人员、FBA 卖家、需要估算运费的进出口商、集运用户。
          </p>
        </div>

        {/* What is CBM */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-orange-600" />
            什么是 CBM？
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            CBM 是 Cubic Meter 的缩写，即「立方米」，是国际物流中衡量货物体积的标准单位。在海运拼箱（LCL）中，运费通常直接按 CBM 计算；在空运和快递中，CBM 用于换算体积重量，再与实际重量比较确定计费重量。
          </p>
          <div className="bg-orange-50 rounded-lg p-4 text-sm text-orange-800">
            <p className="font-medium mb-1">核心概念：</p>
            <ul className="space-y-1">
              <li>• CBM = 货物的长 × 宽 × 高（单位：米）</li>
              <li>• 1 CBM = 1 立方米 = 1,000,000 立方厘米</li>
              <li>• 海运拼箱运费通常按 CBM 计价（USD/CBM）</li>
              <li>• 空运/快递中 CBM 用于换算体积重量</li>
            </ul>
          </div>
        </div>

        {/* Calculation Formula */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-orange-600" />
            计算公式
          </h2>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">CBM 计算公式</h3>
            <div className="bg-white rounded border border-gray-200 p-4 text-center font-mono text-lg text-orange-700 mb-3">
              CBM = 长(m) × 宽(m) × 高(m) × 件数
            </div>
            <p className="text-sm text-gray-600">如果尺寸单位是厘米：CBM = 长(cm) × 宽(cm) × 高(cm) × 件数 ÷ 1,000,000</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">体积重量计算公式</h3>
            <div className="space-y-3">
              <div className="bg-white rounded border border-gray-200 p-3">
                <p className="text-sm font-medium text-gray-700 mb-1">空运（÷6000）：</p>
                <p className="font-mono text-sm text-orange-700">体积重(KG) = 长(cm) × 宽(cm) × 高(cm) ÷ 6000</p>
              </div>
              <div className="bg-white rounded border border-gray-200 p-3">
                <p className="text-sm font-medium text-gray-700 mb-1">快递（÷5000）：</p>
                <p className="font-mono text-sm text-orange-700">体积重(KG) = 长(cm) × 宽(cm) × 高(cm) ÷ 5000</p>
              </div>
              <div className="bg-white rounded border border-gray-200 p-3">
                <p className="text-sm font-medium text-gray-700 mb-1">海运拼箱：</p>
                <p className="font-mono text-sm text-orange-700">1 CBM = 1000 KG（即 1 吨）</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">计算示例</h3>
            <p className="text-sm text-blue-700 mb-2">一个纸箱尺寸 60cm × 40cm × 50cm，实重 15KG：</p>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• CBM = 0.6 × 0.4 × 0.5 = <strong>0.12 CBM</strong></li>
              <li>• 空运体积重 = 60 × 40 × 50 ÷ 6000 = <strong>20 KG</strong></li>
              <li>• 快递体积重 = 60 × 40 × 50 ÷ 5000 = <strong>24 KG</strong></li>
              <li>• 空运计费重量 = MAX(15, 20) = <strong>20 KG</strong>（按体积重计费）</li>
            </ul>
          </div>
        </div>

        {/* Volumetric vs Actual Weight */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">⚖️ 体积重量 vs 实重</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">重货（实重 &gt; 体积重）</h3>
              <p className="text-sm text-green-700">如金属零件、液体、书籍等密度大的商品。按实际重量计费，运费较低。</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-4">
              <h3 className="font-semibold text-amber-800 mb-2">轻泡货（体积重 &gt; 实重）</h3>
              <p className="text-sm text-amber-700">如枕头、棉服、塑料制品等。按体积重量计费，运费较高。</p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <strong>判断标准：</strong>当货物的实际密度大于 167 KG/CBM（空运标准）时为重货，小于则为轻泡货。海运标准为 1000 KG/CBM。
            </p>
          </div>
        </div>

        {/* Chargeable Weight */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">💰 计费重量规则</h2>
          <p className="text-gray-700 text-sm mb-4">
            国际物流通用的计费重量规则：
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="font-mono text-center text-lg text-orange-700 font-bold">
              计费重量 = MAX（实际重量, 体积重量）
            </p>
          </div>
          <ol className="space-y-3 text-sm text-gray-700">
            <li className="flex gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-700 font-bold text-xs shrink-0">1</span>
              <span>测量每件货物的长、宽、高（取最凸出点）</span>
            </li>
            <li className="flex gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-700 font-bold text-xs shrink-0">2</span>
              <span>按对应物流方式的系数计算体积重量</span>
            </li>
            <li className="flex gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-700 font-bold text-xs shrink-0">3</span>
              <span>将体积重量与实际重量比较，取较大值</span>
            </li>
            <li className="flex gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-700 font-bold text-xs shrink-0">4</span>
              <span>多件货物可逐件比较或整体比较（取决于物流商规则）</span>
            </li>
            <li className="flex gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-700 font-bold text-xs shrink-0">5</span>
              <span>用计费重量 × 单价 = 运费</span>
            </li>
          </ol>
        </div>

        {/* Common Mistakes */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            常见错误
          </h2>
          <div className="space-y-4">
            <div className="flex gap-3">
              <span className="text-red-500 font-bold shrink-0">✗</span>
              <div>
                <p className="text-sm font-medium text-gray-900">尺寸测量不准确</p>
                <p className="text-sm text-gray-600">未取最凸出点测量，或忽略了包装凸起部分。物流公司会重新测量，以他们的数据为准。</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-red-500 font-bold shrink-0">✗</span>
              <div>
                <p className="text-sm font-medium text-gray-900">混淆不同物流方式的系数</p>
                <p className="text-sm text-gray-600">空运用 6000、快递用 5000、海运用 1000。用错系数会导致运费估算偏差 20% 以上。</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-red-500 font-bold shrink-0">✗</span>
              <div>
                <p className="text-sm font-medium text-gray-900">忘记乘以件数</p>
                <p className="text-sm text-gray-600">计算多件相同货物时，忘记将单件 CBM 乘以总件数，导致总体积严重低估。</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-red-500 font-bold shrink-0">✗</span>
              <div>
                <p className="text-sm font-medium text-gray-900">单位换算错误</p>
                <p className="text-sm text-gray-600">厘米和米混用。用厘米计算时忘记除以 1,000,000 转换为 CBM。</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-red-500 font-bold shrink-0">✗</span>
              <div>
                <p className="text-sm font-medium text-gray-900">只比较总重而忽略逐件计费</p>
                <p className="text-sm text-gray-600">部分物流商按逐件取大值计费，而非整体取大值。这会导致轻泡货的运费更高。</p>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-100 rounded-lg px-4 py-3 mb-8">
          <p className="text-sm text-amber-800">
            <span className="font-medium">免责声明：</span>
            本指南提供的计算公式和系数仅供参考。不同物流公司的计费规则可能有差异（如进位规则、最低收费标准等），实际运费以物流商报价为准。
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
                <p className="text-xs text-gray-500">计算体积重和费用参考</p>
              </div>
            </Link>
            <Link href="/tools/commercial-invoice" className="flex items-center gap-3 p-4 rounded-lg border border-gray-100 bg-gray-50 hover:bg-white hover:border-teal-200 hover:shadow-sm transition-all group">
              <span className="text-2xl">📄</span>
              <div>
                <p className="font-medium text-gray-900 group-hover:text-teal-700">商业发票生成器</p>
                <p className="text-xs text-gray-500">在发票中填写重量和尺寸</p>
              </div>
            </Link>
            <Link href="/tools/packing-list" className="flex items-center gap-3 p-4 rounded-lg border border-gray-100 bg-gray-50 hover:bg-white hover:border-teal-200 hover:shadow-sm transition-all group">
              <span className="text-2xl">📋</span>
              <div>
                <p className="font-medium text-gray-900 group-hover:text-teal-700">装箱单生成器</p>
                <p className="text-xs text-gray-500">记录每件货物的尺寸和重量</p>
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
                <p className="text-xs text-gray-500">包含体积重计算和运费估算</p>
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
            <Calculator className="w-5 h-5" />
            使用运费估算工具
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </>
  );
}
