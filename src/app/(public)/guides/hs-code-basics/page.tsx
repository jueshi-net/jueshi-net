import { Breadcrumb } from '@/components/breadcrumb';
import { RelatedGuidesSection } from '@/components/related-guides-section';
import { FAQSection } from '@/components/faq-section';
import { PublicLandingPageFrame } from '@/components/templates/public/PublicLandingPageFrame';

// Server component version - no client-side hooks
export default function HSCodeBasicsGuide() {
  // Static data for related guides - in real implementation this would come from API
  const relatedGuidesSlugs = [
    'shipping-guide',
    'commercial-invoice-basics',
    'customs-declaration'
  ];

  // FAQ data
  const faqs = [
    {
      question: "什么是HS编码？",
      answer: "HS编码（Harmonized System Code）是国际通用的商品分类编码体系，由世界海关组织（WCO）维护。前6位全球统一，各国可在此基础上扩展到8-10位。用于海关报关、关税计算、贸易统计等。"
    },
    {
      question: "为什么同一个商品可能有不同编码？",
      answer: "HS编码前6位是全球统一的，但各国可以扩展至8-10位。同一商品在不同国家可能有不同的后几位编码。此外，商品如果有多重用途或材质，可能归入不同类别。"
    },
    {
      question: "如何确定商品的正确HS编码？",
      answer: "确定HS编码需要综合考虑：商品材质、用途、加工工艺、包装方式等。本工具提供关键词匹配结果供参考，但最终归类应以海关或专业报关行的判断为准。如有疑问，可申请海关预归类。"
    },
    {
      question: "HS编码和关税有什么关系？",
      answer: "HS编码决定了商品适用的关税税率。不同编码对应不同的最惠国税率、暂定税率、协定税率等。正确归类可以避免多缴税或被处罚。"
    }
  ];

  return (
    <PublicLandingPageFrame 
      title="HS编码基础知识" 
      subtitle="全面了解HS编码的定义、作用及查询方法"
      breadcrumbs={<Breadcrumb />}
      variant="content"
    >
      <div className="prose max-w-none">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">什么是HS编码？</h2>
          <p className="text-gray-700 leading-relaxed">
            HS编码（Harmonized System Code），全称为《商品名称及编码协调制度》，是由世界海关组织（World Customs Organization, WCO）制定的一套国际贸易商品分类标准。该制度于1988年正式生效，目前已被全球超过200个国家和地区采用。
          </p>
          <p className="text-gray-700 leading-relaxed mt-3">
            HS编码的目的是为了统一国际贸易中的商品分类，便于海关统计、征税、贸易管制等。HS编码分为21类、97章，每章下设品目和子目，形成了一个层次分明的商品分类体系。
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">HS编码的结构</h2>
          <p className="text-gray-700 leading-relaxed">
            标准的HS编码由6位数字组成：
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-2 text-gray-700">
            <li><span className="font-semibold">第1-2位</span>：章（Chapter）- 按商品的基本材料或功能进行分类</li>
            <li><span className="font-semibold">第3-4位</span>：品目（Heading）- 在章的基础上进一步细分</li>
            <li><span className="font-semibold">第5-6位</span>：子目（Subheading）- 在品目的基础上再细分</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-3">
            各国可在6位HS编码基础上增加本国子目，形成8位、10位或更多位的编码。例如，中国的HS编码通常是8位或10位。
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">HS编码的作用</h2>
          <ul className="list-disc pl-6 mt-3 space-y-2 text-gray-700">
            <li><span className="font-semibold">关税征收：</span> 不同HS编码对应不同的关税税率</li>
            <li><span className="font-semibold">贸易统计：</span> 用于统计各类商品的进出口数量和金额</li>
            <li><span className="font-semibold">贸易管制：</span> 实施反倾销、反补贴等贸易措施的基础</li>
            <li><span className="font-semibold">原产地规则：</span> 确定商品原产地的重要依据</li>
            <li><span className="font-semibold">许可证管理：</span> 某些商品需要特定许可证才能进出口</li>
          </ul>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">HS编码查询技巧</h2>
          <p className="text-gray-700 leading-relaxed">
            查询HS编码时，建议遵循以下步骤：
          </p>
          <ol className="list-decimal pl-6 mt-3 space-y-2 text-gray-700">
            <li><span className="font-semibold">了解商品属性：</span> 包括材质、用途、规格、加工工艺等</li>
            <li><span className="font-semibold">使用关键词：</span> 中文名称、英文名称、行业术语等</li>
            <li><span className="font-semibold">查看详细描述：</span> 对比商品描述与HS编码条目的具体描述</li>
            <li><span className="font-semibold">注意特殊规定：</span> 某些商品有特殊的归类规则</li>
            <li><span className="font-semibold">验证准确性：</span> 通过多个渠道交叉验证结果</li>
          </ol>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">HS编码查询注意事项</h2>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-amber-800">
              <span className="font-semibold">重要提醒：</span>HS编码查询结果仅供参考，不构成海关、税务或法律意见。正式报关前请以目的国海关、报关行或专业归类意见为准。同一商品可能因材质、用途、规格不同而归入不同编码。
            </p>
          </div>
          <ul className="list-disc pl-6 mt-3 space-y-2 text-gray-700">
            <li>HS编码具有时效性，定期更新，需关注最新版本</li>
            <li>不同国家对相同商品可能有不同归类解释</li>
            <li>复合材料或多功能商品归类较为复杂</li>
            <li>敏感商品（如电池、液体、食品、药品）可能有特殊监管要求</li>
          </ul>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">实用资源</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a 
              href="https://www.wcoomd.org/en/topics/nomenclature/hs-nomenclature/hs-nomenclature-2022-edition.aspx" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
            >
              <h3 className="font-semibold text-blue-700">WCO国际协调制度</h3>
              <p className="text-sm text-blue-600 mt-1">世界海关组织官方HS编码资料</p>
            </a>
            <a 
              href="https://www.customs.gov.cn" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors"
            >
              <h3 className="font-semibold text-green-700">中国海关总署</h3>
              <p className="text-sm text-green-600 mt-1">中国海关HS编码查询</p>
            </a>
            <a 
              href="/tools/hs-code" 
              className="block p-4 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200 transition-colors"
            >
              <h3 className="font-semibold text-teal-700">HS编码查询工具</h3>
              <p className="text-sm text-teal-600 mt-1">在线HS编码辅助查询</p>
            </a>
            <a 
              href="/tools/documents/commercial-invoice" 
              className="block p-4 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors"
            >
              <h3 className="font-semibold text-purple-700">商业发票工具</h3>
              <p className="text-sm text-purple-600 mt-1">制作含HS编码的商业发票</p>
            </a>
          </div>
        </div>
      </div>

      <FAQSection title="HS编码常见问题" items={faqs} />
      
      <RelatedGuidesSection slugs={relatedGuidesSlugs} />
    </PublicLandingPageFrame>
  );
}