import { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumb } from '@/components/breadcrumb';
import { FAQSection } from '@/components/faq-section';
import { Hash, Search, AlertCircle, CheckCircle, ArrowRight, Wrench, Zap, BookOpen } from 'lucide-react';

export const metadata: Metadata = {
  title: 'HS 编码入门：如何查询商品海关编码 | 绝世百宝箱',
  description: 'HS 编码是什么？如何查询商品的海关编码？本文详解 HS 编码的结构、查询方法、常见商品编码示例和注意事项，帮助外贸新手快速掌握海关编码查询技巧。',
  keywords: 'HS编码,海关编码,HS Code,商品编码查询,国际贸易编码',
};

const faqItems = [
  {
    question: 'HS 编码和海关编码是同一个东西吗？',
    answer: '是的，HS 编码（Harmonized System Code）就是海关编码，也叫税则号列、商品编码。国际通用前 6 位，各国在此基础上扩展到 8-10 位用于本国税率和统计。',
  },
  {
    question: '为什么不同国家的 HS 编码后几位不一样？',
    answer: 'HS 编码前 6 位是国际统一的（由 WCO 维护），第 7 位起由各国自行扩展。例如同一商品在中国可能是 8471.30.1000，在美国可能是 8471.30.0100。前 6 位一定相同。',
  },
  {
    question: '找不到完全匹配的编码怎么办？',
    answer: '选择最接近的类别。如果商品跨多个类别，按主要功能或材质归类。不确定的情况下可以咨询报关行或海关预归类服务。错误归类可能导致罚款或税率差异。',
  },
  {
    question: 'HS 编码多久更新一次？',
    answer: '国际 HS 编码每 5 年修订一次（最新版为 2022 版）。各国本国税号可能更频繁调整。建议发货前确认最新编码。',
  },
  {
    question: '没有 HS 编码可以发货吗？',
    answer: '大多数国家要求国际快递和贸易件提供 HS 编码。缺少编码可能导致清关延误、退件或罚款。部分国家对低价值个人物品有豁免，但建议始终提供。',
  },
];

export default function HSCodeBasicsPage() {
  return (
    <>
      <Breadcrumb />
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        {/* Hero */}
        <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl p-6 sm:p-10 text-white mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Hash className="w-5 h-5 text-violet-200" />
            <span className="text-sm font-medium text-violet-200">出海经营指南</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-4">
            HS 编码入门：如何查询商品海关编码
          </h1>
          <p className="text-violet-100 text-base sm:text-lg leading-relaxed">
            了解 HS 编码的结构和查询方法，快速找到商品对应的海关编码，避免清关延误。
          </p>
        </div>

        {/* Target Audience */}
        <div className="bg-teal-50 border border-teal-100 rounded-xl p-5 mb-8">
          <h2 className="text-sm font-bold text-teal-800 mb-2 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> 适用人群
          </h2>
          <p className="text-sm text-teal-700">
            跨境电商卖家、外贸新手、报关员、国际物流操作人员、需要填写海关申报信息的个人寄件者。
          </p>
        </div>

        {/* What is HS Code */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-violet-600" />
            什么是 HS 编码？
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            HS 编码（Harmonized System Code）是国际通用的商品分类编码系统，由世界海关组织（WCO）维护。全球 200 多个国家和地区使用这套系统对贸易商品进行分类，用于关税征收、贸易统计和监管。
          </p>
          <div className="bg-violet-50 rounded-lg p-4 text-sm text-violet-800">
            <p className="font-medium mb-1">核心要点：</p>
            <ul className="space-y-1">
              <li>• 前 6 位国际统一，后几位由各国自行扩展</li>
              <li>• 每 5 年修订一次（当前版本：HS 2022）</li>
              <li>• 涵盖约 5,000 个商品组别，超过 20 万条明细</li>
              <li>• 是国际贸易中不可缺少的标识符</li>
            </ul>
          </div>
        </div>

        {/* HS Code Structure */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📐 HS 编码结构</h2>
          <p className="text-gray-700 text-sm mb-4">
            以 <code className="bg-gray-100 px-1.5 py-0.5 rounded text-violet-700">8471.30.1000</code>（笔记本电脑）为例：
          </p>
          <div className="overflow-x-auto">
            <div className="min-w-[500px]">
              <div className="flex border-b border-gray-200">
                <div className="flex-1 bg-violet-100 p-3 text-center font-bold text-violet-800 rounded-tl-lg">84</div>
                <div className="flex-1 bg-violet-200 p-3 text-center font-bold text-violet-800">71</div>
                <div className="flex-1 bg-violet-300 p-3 text-center font-bold text-violet-900">.</div>
                <div className="flex-1 bg-purple-100 p-3 text-center font-bold text-purple-800">30</div>
                <div className="flex-1 bg-purple-200 p-3 text-center font-bold text-purple-900">.</div>
                <div className="flex-1 bg-fuchsia-100 p-3 text-center font-bold text-fuchsia-800 rounded-tr-lg">1000</div>
              </div>
              <div className="flex text-xs text-center">
                <div className="flex-1 p-2 text-gray-600">章（Chapter）<br/>84 = 机械设备</div>
                <div className="flex-1 p-2 text-gray-600">品目（Heading）<br/>71 = 数据处理设备</div>
                <div className="flex-1 p-2"></div>
                <div className="flex-1 p-2 text-gray-600">子目（Subheading）<br/>30 = 便携式</div>
                <div className="flex-1 p-2"></div>
                <div className="flex-1 p-2 text-gray-600">本国税号<br/>1000 = 具体细分</div>
              </div>
            </div>
          </div>
          <div className="mt-4 bg-gray-50 rounded-lg p-4 text-sm text-gray-700">
            <p className="font-medium mb-2">层级说明：</p>
            <ul className="space-y-1">
              <li>• <strong>第 1-2 位</strong>（章 Chapter）：大类，如 84 = 核反应堆、锅炉、机械</li>
              <li>• <strong>第 3-4 位</strong>（品目 Heading）：中类，如 8471 = 数据处理设备</li>
              <li>• <strong>第 5-6 位</strong>（子目 Subheading）：国际统一的最小分类</li>
              <li>• <strong>第 7-10 位</strong>：各国自行扩展，用于税率和统计</li>
            </ul>
          </div>
        </div>

        {/* How to Query */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">🔍 查询 HS 编码的步骤</h2>
          <ol className="space-y-3 text-sm text-gray-700">
            <li className="flex gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-violet-100 text-violet-700 font-bold text-xs shrink-0">1</span>
              <span>明确商品的名称、材质、用途、功能</span>
            </li>
            <li className="flex gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-violet-100 text-violet-700 font-bold text-xs shrink-0">2</span>
              <span>使用我们的 HS 编码查询工具，输入商品关键词（中英文均可）</span>
            </li>
            <li className="flex gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-violet-100 text-violet-700 font-bold text-xs shrink-0">3</span>
              <span>在搜索结果中找到最匹配的商品描述</span>
            </li>
            <li className="flex gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-violet-100 text-violet-700 font-bold text-xs shrink-0">4</span>
              <span>确认前 6 位编码，如需出口到特定国家，查询该国的扩展编码</span>
            </li>
            <li className="flex gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-violet-100 text-violet-700 font-bold text-xs shrink-0">5</span>
              <span>将编码填入发票和报关单中</span>
            </li>
          </ol>
        </div>

        {/* Common HS Codes */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📋 常见商品 HS 编码示例</h2>
          <p className="text-sm text-gray-600 mb-4">以下为前 6 位国际通用编码，仅供参考：</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 pr-4 font-semibold text-gray-700">HS 编码</th>
                  <th className="text-left py-2 pr-4 font-semibold text-gray-700">商品描述</th>
                </tr>
              </thead>
              <tbody className="text-gray-600">
                <tr className="border-b border-gray-50"><td className="py-2 pr-4 font-mono text-violet-700">8471.30</td><td className="py-2">便携式笔记本电脑</td></tr>
                <tr className="border-b border-gray-50"><td className="py-2 pr-4 font-mono text-violet-700">8517.12</td><td className="py-2">智能手机</td></tr>
                <tr className="border-b border-gray-50"><td className="py-2 pr-4 font-mono text-violet-700">6109.10</td><td className="py-2">棉质 T 恤</td></tr>
                <tr className="border-b border-gray-50"><td className="py-2 pr-4 font-mono text-violet-700">9503.00</td><td className="py-2">玩具（三轮车、拼图等）</td></tr>
                <tr className="border-b border-gray-50"><td className="py-2 pr-4 font-mono text-violet-700">4202.21</td><td className="py-2">皮革面手提包</td></tr>
                <tr className="border-b border-gray-50"><td className="py-2 pr-4 font-mono text-violet-700">8528.72</td><td className="py-2">彩色电视接收机</td></tr>
                <tr className="border-b border-gray-50"><td className="py-2 pr-4 font-mono text-violet-700">6110.30</td><td className="py-2">化纤制针织套头衫</td></tr>
                <tr className="border-b border-gray-50"><td className="py-2 pr-4 font-mono text-violet-700">9603.21</td><td className="py-2">牙刷</td></tr>
                <tr className="border-b border-gray-50"><td className="py-2 pr-4 font-mono text-violet-700">3923.21</td><td className="py-2">塑料制包装袋</td></tr>
                <tr><td className="py-2 pr-4 font-mono text-violet-700">7323.93</td><td className="py-2">不锈钢制餐桌厨房用具</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Common Mistakes */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            注意事项
          </h2>
          <div className="space-y-4">
            <div className="flex gap-3">
              <span className="text-amber-500 font-bold shrink-0">⚠</span>
              <div>
                <p className="text-sm font-medium text-gray-900">编码不是万能的</p>
                <p className="text-sm text-gray-600">同一商品在不同国家可能有不同的后几位扩展码，使用前请确认目的地国家的具体要求</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-amber-500 font-bold shrink-0">⚠</span>
              <div>
                <p className="text-sm font-medium text-gray-900">归类规则复杂</p>
                <p className="text-sm text-gray-600">多功能商品、组合商品、半成品等的归类需要专业知识，不确定时请咨询报关行</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-amber-500 font-bold shrink-0">⚠</span>
              <div>
                <p className="text-sm font-medium text-gray-900">编码会更新</p>
                <p className="text-sm text-gray-600">HS 编码每 5 年修订，各国税率也经常调整。请使用最新数据查询</p>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-100 rounded-lg px-4 py-3 mb-8">
          <p className="text-sm text-amber-800">
            <span className="font-medium">免责声明：</span>
            本指南提供的 HS 编码信息仅供参考。实际归类应以海关裁定或专业报关行的意见为准。错误归类可能导致罚款、补税或货物扣押。
          </p>
        </div>

        {/* Related Tools */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-teal-600" />
            相关工具
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <Link href="/tools/hs-code" className="flex items-center gap-3 p-4 rounded-lg border border-gray-100 bg-gray-50 hover:bg-white hover:border-teal-200 hover:shadow-sm transition-all group">
              <span className="text-2xl">🔍</span>
              <div>
                <p className="font-medium text-gray-900 group-hover:text-teal-700">HS 编码查询工具</p>
                <p className="text-xs text-gray-500">输入关键词快速查找编码</p>
              </div>
            </Link>
            <Link href="/tools/commercial-invoice" className="flex items-center gap-3 p-4 rounded-lg border border-gray-100 bg-gray-50 hover:bg-white hover:border-teal-200 hover:shadow-sm transition-all group">
              <span className="text-2xl">📄</span>
              <div>
                <p className="font-medium text-gray-900 group-hover:text-teal-700">商业发票生成器</p>
                <p className="text-xs text-gray-500">在发票中填入 HS 编码</p>
              </div>
            </Link>
            <Link href="/tools/customs-generator" className="flex items-center gap-3 p-4 rounded-lg border border-gray-100 bg-gray-50 hover:bg-white hover:border-teal-200 hover:shadow-sm transition-all group">
              <span className="text-2xl">📦</span>
              <div>
                <p className="font-medium text-gray-900 group-hover:text-teal-700">报关单生成</p>
                <p className="text-xs text-gray-500">生成含 HS 编码的报关单</p>
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
                <p className="text-xs text-gray-500">包含 HS 编码查询步骤</p>
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
            href="/tools/hs-code"
            className="inline-flex items-center gap-2 px-8 py-4 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20 min-h-[48px]"
          >
            <Search className="w-5 h-5" />
            使用 HS 编码查询工具
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </>
  );
}
