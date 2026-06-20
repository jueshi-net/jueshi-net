import { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumb } from '@/components/breadcrumb';
import { FAQSection } from '@/components/faq-section';
import { FileText, AlertCircle, CheckCircle, ArrowRight, Wrench, Zap, BookOpen } from 'lucide-react';

export const metadata: Metadata = {
  title: '出口单据清单：国际贸易必备文件详解 | 绝世百宝箱',
  description: '出口贸易需要哪些单据？本文详解商业发票、装箱单、报关单、原产地证等出口必备文件的内容要求、格式规范和注意事项，帮助外贸新手快速掌握出口单据准备技巧。',
  keywords: '出口单据,出口文件清单,商业发票,装箱单,报关单,原产地证,外贸单据',
};

const faqItems = [
  {
    question: '出口单据中最重要的文件是哪个？',
    answer: '商业发票（Commercial Invoice）是最重要的出口单据。它是海关估价征税的核心依据，也是买卖双方交易的法律凭证。发票信息错误可能导致清关延误、税率争议甚至罚款。装箱单和报关单同样重要，三者配合使用。',
  },
  {
    question: '原产地证有什么用？',
    answer: '原产地证（Certificate of Origin）证明货物的生产国/地区，主要用途：1) 享受自贸协定优惠税率（如 RCEP、中国-东盟 FTA）；2) 满足进口国强制要求（如部分中东国家）；3) 应对反倾销调查。没有原产地证可能无法享受关税减免。',
  },
  {
    question: '报关单可以自己填写吗？',
    answer: '理论上可以，但强烈建议由专业报关行代为填写。报关单涉及 HS 编码、监管条件、税率计算等专业内容，填写错误可能导致海关查验、罚款或货物扣押。报关行的服务费通常不高，但能大幅降低风险。',
  },
  {
    question: '不同国家对单据的要求一样吗？',
    answer: '不一样。例如：中东国家通常要求发票和原产地证经过领事认证；欧盟需要 CE 声明；美国需要 ISF 申报；澳洲需要熏蒸证明（木质包装）。发货前务必确认目的地国家的具体单据要求。',
  },
  {
    question: '单据信息不一致会怎样？',
    answer: '单据之间的信息必须一致（品名、数量、重量、金额等）。不一致会导致：海关查验、清关延误、银行拒付（信用证项下）、客户投诉。建议制作单据后交叉核对，确保所有文件数据统一。',
  },
];

export default function ExportDocumentsChecklistPage() {
  return (
    <>
      <Breadcrumb />
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        {/* Hero */}
        <div className="bg-gradient-to-br from-slate-600 to-gray-800 rounded-2xl p-6 sm:p-10 text-white mb-8">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-slate-300" />
            <span className="text-sm font-medium text-slate-300">外贸操作指南</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-4">
            出口单据清单：国际贸易必备文件详解
          </h1>
          <p className="text-slate-200 text-base sm:text-lg leading-relaxed">
            系统了解出口贸易所需的各类单据，掌握每种文件的内容要求和格式规范，确保出口流程顺畅合规。
          </p>
        </div>

        {/* Target Audience */}
        <div className="bg-teal-50 border border-teal-100 rounded-xl p-5 mb-8">
          <h2 className="text-sm font-bold text-teal-800 mb-2 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> 适用人群
          </h2>
          <p className="text-sm text-teal-700">
            外贸新手、出口企业单证员、跨境电商卖家、报关员、国际物流操作人员、需要处理出口文件的企业。
          </p>
        </div>

        {/* Commercial Invoice */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-slate-600" />
            1. 商业发票（Commercial Invoice）
          </h2>
          <p className="text-gray-700 text-sm mb-4">
            商业发票是出口贸易中最核心的单据，记录交易的完整信息，是海关估价和征税的依据。
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-gray-800 mb-2">必须包含的内容</h3>
            <ul className="text-sm text-gray-700 space-y-1.5">
              <li>• <strong>发票编号和日期</strong> — 唯一编号，便于追溯</li>
              <li>• <strong>卖方信息</strong> — 公司名、地址、联系方式、税号</li>
              <li>• <strong>买方信息</strong> — 公司名、地址、联系方式</li>
              <li>• <strong>商品描述</strong> — 具体品名、材质、用途（不要模糊描述）</li>
              <li>• <strong>HS 编码</strong> — 国际通用的商品分类编码</li>
              <li>• <strong>数量和单位</strong> — 件数、重量、计量单位</li>
              <li>• <strong>单价和总价</strong> — 币种、单价、总金额</li>
              <li>• <strong>贸易条款</strong> — FOB、CIF、DDP 等（Incoterms 2020）</li>
              <li>• <strong>原产地</strong> — MADE IN CHINA</li>
              <li>• <strong>签章</strong> — 公司盖章和授权人签名</li>
            </ul>
          </div>
          <div className="bg-amber-50 rounded-lg p-4 text-sm text-amber-800">
            <p className="font-medium">⚠ 注意事项：</p>
            <ul className="space-y-1 mt-1">
              <li>• 商品描述必须具体，不能写 "gift" 或 "sample"</li>
              <li>• 金额必须与实际交易一致，低报属于违法行为</li>
              <li>• 币种需明确标注（USD、EUR、CNY 等）</li>
            </ul>
          </div>
        </div>

        {/* Packing List */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">2. 装箱单（Packing List）</h2>
          <p className="text-gray-700 text-sm mb-4">
            装箱单记录货物的包装细节，是物流操作和海关查验的重要依据。
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-gray-800 mb-2">必须包含的内容</h3>
            <ul className="text-sm text-gray-700 space-y-1.5">
              <li>• <strong>收发件人信息</strong> — 与发票一致</li>
              <li>• <strong>箱号/件数</strong> — 总件数及每件编号（如 1/10, 2/10）</li>
              <li>• <strong>每箱内容</strong> — 每箱装了什么、多少件</li>
              <li>• <strong>毛重（Gross Weight）</strong> — 含包装的总重量</li>
              <li>• <strong>净重（Net Weight）</strong> — 不含包装的商品重量</li>
              <li>• <strong>外箱尺寸</strong> — 长×宽×高（cm 或 inch）</li>
              <li>• <strong>总体积（CBM）</strong> — 总体积用于海运计费</li>
              <li>• <strong>包装方式</strong> — 纸箱、木箱、托盘等</li>
            </ul>
          </div>
        </div>

        {/* Customs Declaration */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">3. 报关单（Customs Declaration）</h2>
          <p className="text-gray-700 text-sm mb-4">
            报关单是向海关申报货物信息的正式文件，中国出口报关使用《中华人民共和国海关出口货物报关单》。
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-gray-800 mb-2">主要内容</h3>
            <ul className="text-sm text-gray-700 space-y-1.5">
              <li>• <strong>经营单位</strong> — 出口商的海关编码（10位）</li>
              <li>• <strong>发货单位</strong> — 实际发货人</li>
              <li>• <strong>运输方式</strong> — 海运/空运/陆运/快递</li>
              <li>• <strong>目的国/地区</strong> — 最终目的地</li>
              <li>• <strong>商品编号（HS Code）</strong> — 10 位中国海关编码</li>
              <li>• <strong>商品名称和规格</strong> — 详细描述</li>
              <li>• <strong>数量和单位</strong> — 法定计量单位</li>
              <li>• <strong>成交价格</strong> — 出口申报价</li>
              <li>• <strong>币制</strong> — 美元、人民币等</li>
              <li>• <strong>监管条件</strong> — 是否需要许可证、检验检疫等</li>
            </ul>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800">
            <p className="font-medium">💡 提示：</p>
            <p className="mt-1">报关单通常由报关行代为填写和提交。出口商需要提供准确的商品信息、发票和装箱单给报关行。中国海关推行无纸化报关，大部分通过单一窗口系统电子申报。</p>
          </div>
        </div>

        {/* Certificate of Origin */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">4. 原产地证（Certificate of Origin）</h2>
          <p className="text-gray-700 text-sm mb-4">
            原产地证证明货物的生产国/地区，是享受关税优惠的重要凭证。
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 pr-4 font-semibold text-gray-700">类型</th>
                  <th className="text-left py-2 pr-4 font-semibold text-gray-700">适用范围</th>
                  <th className="text-left py-2 font-semibold text-gray-700">签发机构</th>
                </tr>
              </thead>
              <tbody className="text-gray-600">
                <tr className="border-b border-gray-50">
                  <td className="py-3 pr-4 font-medium text-gray-900">一般原产地证<br/><span className="text-xs text-gray-500">CO</span></td>
                  <td className="py-3 pr-4">所有国家（非优惠）</td>
                  <td className="py-3">贸促会 / 海关</td>
                </tr>
                <tr className="border-b border-gray-50">
                  <td className="py-3 pr-4 font-medium text-gray-900">FORM A<br/><span className="text-xs text-gray-500">普惠制</span></td>
                  <td className="py-3 pr-4">给惠国（部分已取消）</td>
                  <td className="py-3">海关</td>
                </tr>
                <tr className="border-b border-gray-50">
                  <td className="py-3 pr-4 font-medium text-gray-900">FORM E<br/><span className="text-xs text-gray-500">中国-东盟</span></td>
                  <td className="py-3 pr-4">东盟 10 国</td>
                  <td className="py-3">海关 / 贸促会</td>
                </tr>
                <tr className="border-b border-gray-50">
                  <td className="py-3 pr-4 font-medium text-gray-900">RCEP 原产地证</td>
                  <td className="py-3 pr-4">RCEP 15 个成员国</td>
                  <td className="py-3">海关 / 贸促会</td>
                </tr>
                <tr className="border-b border-gray-50">
                  <td className="py-3 pr-4 font-medium text-gray-900">中澳/中新/中韩 FTA</td>
                  <td className="py-3 pr-4">对应自贸协定国家</td>
                  <td className="py-3">海关 / 贸促会</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-medium text-gray-900">中巴/中智等双边 FTA</td>
                  <td className="py-3 pr-4">对应国家</td>
                  <td className="py-3">海关</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="bg-emerald-50 rounded-lg p-4 mt-4 text-sm text-emerald-800">
            <p className="font-medium">💡 申请提示：</p>
            <p className="mt-1">原产地证可通过中国国际贸易单一窗口在线申请。建议在货物出运前或出运后 3 天内申请。部分自贸协定允许补发（出运后 1 年内）。</p>
          </div>
        </div>

        {/* Other Documents */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">5. 其他常见单据</h2>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">📜 检验检疫证书</h3>
              <p className="text-sm text-gray-700">部分商品需要出入境检验检疫局出具的证书，如：植物检疫证书（phytosanitary certificate）、卫生证书（health certificate）、兽医证书（veterinary certificate）。食品、农产品、木质包装通常需要。</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">🏦 银行单据（信用证项下）</h3>
              <p className="text-sm text-gray-700">使用信用证（L/C）付款时，需要提交：汇票（Draft/Bill of Exchange）、提单（Bill of Lading）、保险单（Insurance Policy）等，且必须严格符合信用证条款（单证一致）。</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">🚢 运输单据</h3>
              <p className="text-sm text-gray-700">海运提单（B/L）、空运运单（AWB）、快递运单。提单是物权凭证，可以转让；运单不是物权凭证，不能转让。</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">🛡️ 保险单据</h3>
              <p className="text-sm text-gray-700">CIF/CIP 条款下卖方需购买保险并提供保险单。即使 FOB 条款，也建议购买保险以规避运输风险。</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">📋 许可证和认证</h3>
              <p className="text-sm text-gray-700">部分商品出口需要许可证：出口许可证（配额商品）、机电产品出口证书、危险品包装使用鉴定结果单等。进口国可能要求的认证：CE（欧盟）、FCC（美国）、PSE（日本）等。</p>
            </div>
          </div>
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
                <p className="text-sm font-medium text-gray-900">单据之间信息不一致</p>
                <p className="text-sm text-gray-600">发票、装箱单、报关单上的品名、数量、重量、金额必须完全一致。不一致会导致海关查验或银行拒付。</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-red-500 font-bold shrink-0">✗</span>
              <div>
                <p className="text-sm font-medium text-gray-900">HS 编码错误</p>
                <p className="text-sm text-gray-600">错误的 HS 编码可能导致税率差异、监管条件遗漏、退税失败。建议由专业报关行确认编码。</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-red-500 font-bold shrink-0">✗</span>
              <div>
                <p className="text-sm font-medium text-gray-900">商品描述过于模糊</p>
                <p className="text-sm text-gray-600">如 "accessories"、"parts"、"gift" 等描述会被海关要求补充说明。应写明具体品名、材质、用途。</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-red-500 font-bold shrink-0">✗</span>
              <div>
                <p className="text-sm font-medium text-gray-900">忽略目的地国家的特殊单据要求</p>
                <p className="text-sm text-gray-600">如中东国家需要领事认证、澳洲需要熏蒸证明、欧盟需要 CE 声明。未提前准备会导致货物到港后无法清关。</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-red-500 font-bold shrink-0">✗</span>
              <div>
                <p className="text-sm font-medium text-gray-900">原产地证申请不及时</p>
                <p className="text-sm text-gray-600">部分自贸协定原产地证需在出运前或出运后 3 天内申请。过期可能需要补发，流程更复杂。</p>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-100 rounded-lg px-4 py-3 mb-8">
          <p className="text-sm text-amber-800">
            <span className="font-medium">免责声明：</span>
            本指南提供的单据要求为通用参考。不同国家、不同商品、不同贸易方式的具体单据要求可能有所不同。建议根据具体出口情况咨询专业报关行或贸易顾问，确保单据合规。
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
                <p className="text-xs text-gray-500">生成出口报关单</p>
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
                <p className="text-xs text-gray-500">包含单据生成步骤</p>
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
            生成出口单据
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </>
  );
}
