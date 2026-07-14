import { Metadata } from 'next';
import Link from 'next/link';
import { FAQSection } from '@/components/faq-section';
import PublicLandingPageFrame from '@/components/templates/PublicLandingPageFrame';
import JueshiV4PublicShell from '@/components/layout/JueshiV4PublicShell';
import { MapPin, Globe, AlertCircle, CheckCircle, ArrowRight, Wrench, Zap } from 'lucide-react';

export const metadata: Metadata = {
  title: '国际地址格式指南：如何正确填写海外收件地址 | 绝世百宝箱',
  description: '详解美国、加拿大、英国、日本、澳大利亚等国家的标准地址格式，包含地址结构说明、示例地址、常见错误和注意事项，帮助您正确填写国际快递收件地址。',
  keywords: '国际地址格式,海外收件地址,美国地址格式,日本地址写法,国际快递地址',
};

const faqItems = [
  {
    question: '国际快递地址必须用英文填写吗？',
    answer: '大多数国际快递（DHL、FedEx、UPS）要求用英文或目的地国家语言填写。寄往日本的地址可以用日文汉字，但建议同时标注英文/罗马字以便中转环节识别。',
  },
  {
    question: '地址写错了怎么办？',
    answer: '如果快递还未揽收，可以联系快递公司修改。已揽收的包裹，部分快递公司支持付费改址（如 USPS Package Intercept），但费用较高且不一定成功。建议发货前仔细核对。',
  },
  {
    question: '邮编（Postal Code）一定要填吗？',
    answer: '是的，邮编是国际地址中最重要的字段之一。它直接决定分拣路线，缺少邮编可能导致延误或退件。使用我们的邮编校验工具可以验证格式是否正确。',
  },
  {
    question: '电话号码必须填写吗？',
    answer: '强烈建议填写收件人电话号码。国际快递在派送时通常需要电话联系，缺少电话可能导致派送失败。部分国家（如日本）的快递员一定会先打电话确认。',
  },
  {
    question: '公寓号/房间号应该写在哪里？',
    answer: '通常写在街道地址的同一行，用逗号、#号或 "Apt/Unit/Room" 分隔。例如：123 Main St, Apt 4B 或 123 Main Street, Unit 4B。日本地址中写在建筑物名之后。',
  },
];

export default function AddressFormatGuidePage() {
  return (
    <JueshiV4PublicShell>
      <PublicLandingPageFrame
        title="国际地址格式指南：如何正确填写海外收件地址"
        description="详解美国、加拿大、英国、日本、澳大利亚等国家的标准地址格式，避免因地址错误导致包裹延误或退件。"
        icon={<Globe className="w-6 h-6" />}
        variant="form"
      >
        {/* Target Audience */}
        <div className="bg-teal-50 border border-teal-100 rounded-xl p-5 mb-8">
          <h2 className="text-sm font-bold text-teal-800 mb-2 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> 适用人群
          </h2>
          <p className="text-sm text-teal-700">
            需要向海外寄送包裹的个人或商家、跨境电商卖家、集运用户、留学生寄件、海外华人收寄包裹。
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            地址结构通用原则
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            国际地址通常遵循「从小到大」或「从大到小」两种排列方式。英语国家一般从小到大（门牌→街道→城市→州/省→邮编→国家），而日本、中国等东亚国家传统上从大到小。国际快递建议使用英文从小到大格式。
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">通用地址字段</h3>
            <ol className="space-y-2 text-sm text-gray-700">
              <li className="flex gap-2"><span className="font-bold text-blue-600 shrink-0">1.</span><span><strong>收件人姓名</strong>（Recipient Name）— 全名，与证件一致</span></li>
              <li className="flex gap-2"><span className="font-bold text-blue-600 shrink-0">2.</span><span><strong>公司名</strong>（Company）— 可选，商务件必填</span></li>
              <li className="flex gap-2"><span className="font-bold text-blue-600 shrink-0">3.</span><span><strong>街道地址</strong>（Street Address）— 门牌号 + 路名 + 公寓/房间号</span></li>
              <li className="flex gap-2"><span className="font-bold text-blue-600 shrink-0">4.</span><span><strong>城市</strong>（City）</span></li>
              <li className="flex gap-2"><span className="font-bold text-blue-600 shrink-0">5.</span><span><strong>州/省/地区</strong>（State/Province/Region）</span></li>
              <li className="flex gap-2"><span className="font-bold text-blue-600 shrink-0">6.</span><span><strong>邮编</strong>（Postal/ZIP Code）— 格式因国家而异</span></li>
              <li className="flex gap-2"><span className="font-bold text-blue-600 shrink-0">7.</span><span><strong>国家</strong>（Country）— 使用英文全称</span></li>
              <li className="flex gap-2"><span className="font-bold text-blue-600 shrink-0">8.</span><span><strong>电话号码</strong>（Phone）— 含国际区号</span></li>
            </ol>
          </div>
        </div>

        {/* Country-specific formats */}
        <div className="space-y-6 mb-8">
          {/* United States */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">🇺🇸 美国地址格式</h2>
            <div className="bg-blue-50 rounded-lg p-4 mb-4 font-mono text-sm leading-relaxed">
              <div>John Smith</div>
              <div>1234 Oak Street, Apt 5B</div>
              <div>Los Angeles, CA 90001</div>
              <div>UNITED STATES</div>
              <div>+1 (213) 555-0123</div>
            </div>
            <ul className="text-sm text-gray-700 space-y-1.5">
              <li>• 州名使用两位缩写（CA、NY、TX 等）</li>
              <li>• ZIP Code 为 5 位数字，可选扩展为 ZIP+4（90001-1234）</li>
              <li>• 公寓号可用 Apt、Unit、#、Ste（Suite）等标注</li>
              <li>• 电话号码格式：+1 (区号) 号码</li>
            </ul>
          </div>

          {/* Canada */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">🇨🇦 加拿大地址格式</h2>
            <div className="bg-blue-50 rounded-lg p-4 mb-4 font-mono text-sm leading-relaxed">
              <div>Jean Tremblay</div>
              <div>456 Rue Sainte-Catherine Ouest</div>
              <div>Montréal, QC H3B 1A7</div>
              <div>CANADA</div>
              <div>+1 (514) 555-0198</div>
            </div>
            <ul className="text-sm text-gray-700 space-y-1.5">
              <li>• 邮编格式为字母-数字-字母 空格 数字-字母-数字（如 H3B 1A7）</li>
              <li>• 省份使用两位缩写（QC、ON、BC、AB 等）</li>
              <li>• 法语地区（魁北克）地址可能含法语词汇（Rue、Ouest、Boul）</li>
            </ul>
          </div>

          {/* United Kingdom */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">🇬🇧 英国地址格式</h2>
            <div className="bg-blue-50 rounded-lg p-4 mb-4 font-mono text-sm leading-relaxed">
              <div>James Wilson</div>
              <div>Flat 3, 78 Baker Street</div>
              <div>London</div>
              <div>NW1 6XE</div>
              <div>UNITED KINGDOM</div>
              <div>+44 20 7946 0958</div>
            </div>
            <ul className="text-sm text-gray-700 space-y-1.5">
              <li>• 邮编由字母和数字组成（如 NW1 6XE、SW1A 1AA）</li>
              <li>• 公寓写为 Flat X 或 Unit X</li>
              <li>• 伦敦地址可不写 "London" 如果邮编已含区域信息</li>
              <li>• 郡名（County）在现代地址中可省略</li>
            </ul>
          </div>

          {/* Japan */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">🇯🇵 日本地址格式</h2>
            <div className="bg-blue-50 rounded-lg p-4 mb-4 font-mono text-sm leading-relaxed">
              <div>田中 太郎（Tanaka Taro）</div>
              <div>〒160-0023</div>
              <div>東京都新宿区西新宿 1-1-1</div>
              <div>新宿三井ビル 20F</div>
              <div>JAPAN</div>
              <div>+81 3-5321-1111</div>
            </div>
            <ul className="text-sm text-gray-700 space-y-1.5">
              <li>• 邮编 7 位数字，格式为 XXX-XXXX</li>
              <li>• 传统格式从大到小：都道府县→市区町村→丁目-番-号</li>
              <li>• 英文格式从小到大：Building, Number-Chome-Ban-Go, Ward, City, Prefecture</li>
              <li>• 建筑物名和楼层号写在地址之后</li>
              <li>• 建议使用日文地址以提高派送准确率</li>
            </ul>
          </div>

          {/* Australia */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">🇦🇺 澳大利亚地址格式</h2>
            <div className="bg-blue-50 rounded-lg p-4 mb-4 font-mono text-sm leading-relaxed">
              <div>Emma Thompson</div>
              <div>42 Wallaby Drive, Unit 7</div>
              <div>Sydney NSW 2000</div>
              <div>AUSTRALIA</div>
              <div>+61 2 9876 5432</div>
            </div>
            <ul className="text-sm text-gray-700 space-y-1.5">
              <li>• 邮编为 4 位数字（NSW: 1000-2599、VIC: 3000-3999 等）</li>
              <li>• 州名缩写：NSW、VIC、QLD、SA、WA、TAS、NT、ACT</li>
              <li>• 城市与州名写在同一行，邮编紧跟其后</li>
            </ul>
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
                <p className="text-sm font-medium text-gray-900">邮编格式错误</p>
                <p className="text-sm text-gray-600">如把美国 5 位邮编写成 6 位，或日本邮编漏掉连字符</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-red-500 font-bold shrink-0">✗</span>
              <div>
                <p className="text-sm font-medium text-gray-900">州/省缩写不正确</p>
                <p className="text-sm text-gray-600">如用 "Cal" 代替 "CA"，或把加拿大省份写成全称而非缩写</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-red-500 font-bold shrink-0">✗</span>
              <div>
                <p className="text-sm font-medium text-gray-900">缺少电话号码</p>
                <p className="text-sm text-gray-600">国际快递派送通常需要电话确认，缺号可能导致退件</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-red-500 font-bold shrink-0">✗</span>
              <div>
                <p className="text-sm font-medium text-gray-900">使用中文写非中文目的地</p>
                <p className="text-sm text-gray-600">寄往欧美日的地址应使用英文或当地文字，中文仅用于从中国发出的国内段</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-red-500 font-bold shrink-0">✗</span>
              <div>
                <p className="text-sm font-medium text-gray-900">国家名拼写不完整</p>
                <p className="text-sm text-gray-600">写 "USA" 不如写 "UNITED STATES" 清晰，避免与南美国家混淆</p>
              </div>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📝 正确填写地址的步骤</h2>
          <ol className="space-y-3 text-sm text-gray-700">
            <li className="flex gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs shrink-0">1</span>
              <span>确认收件人全名（与身份证件一致），获取完整街道地址</span>
            </li>
            <li className="flex gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs shrink-0">2</span>
              <span>查询目的地邮编，确认格式符合该国标准（使用邮编校验工具）</span>
            </li>
            <li className="flex gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs shrink-0">3</span>
              <span>使用目的地国家的州/省标准缩写</span>
            </li>
            <li className="flex gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs shrink-0">4</span>
              <span>添加收件人电话号码（含国际区号）</span>
            </li>
            <li className="flex gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs shrink-0">5</span>
              <span>使用地址格式化工具一键生成标准格式，避免手动拼写错误</span>
            </li>
          </ol>
        </div>

        {/* Related Tools */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-teal-600" />
            相关工具
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <Link href="/tools/address-formatter" className="flex items-center gap-3 p-4 rounded-lg border border-gray-100 bg-gray-50 hover:bg-white hover:border-teal-200 hover:shadow-sm transition-all group">
              <span className="text-2xl">📝</span>
              <div>
                <p className="font-medium text-gray-900 group-hover:text-teal-700">地址格式化工具</p>
                <p className="text-xs text-gray-500">一键生成标准国际地址</p>
              </div>
            </Link>
            <Link href="/tools/postal-code" className="flex items-center gap-3 p-4 rounded-lg border border-gray-100 bg-gray-50 hover:bg-white hover:border-teal-200 hover:shadow-sm transition-all group">
              <span className="text-2xl">📮</span>
              <div>
                <p className="font-medium text-gray-900 group-hover:text-teal-700">邮编格式校验</p>
                <p className="text-xs text-gray-500">验证 5 国邮编格式</p>
              </div>
            </Link>
            <Link href="/tools/shipping-calculator" className="flex items-center gap-3 p-4 rounded-lg border border-gray-100 bg-gray-50 hover:bg-white hover:border-teal-200 hover:shadow-sm transition-all group">
              <span className="text-2xl">🧮</span>
              <div>
                <p className="font-medium text-gray-900 group-hover:text-teal-700">运费估算器</p>
                <p className="text-xs text-gray-500">计算体积重和费用参考</p>
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
                <p className="text-xs text-gray-500">从地址填写到生成单据一条龙</p>
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
            href="/tools/address-formatter"
            className="inline-flex items-center gap-2 px-8 py-4 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20 min-h-[48px]"
          >
            <MapPin className="w-5 h-5" />
            使用地址格式化工具
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </PublicLandingPageFrame>
    </JueshiV4PublicShell>
  );
}
