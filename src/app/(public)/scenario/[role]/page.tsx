import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, FileText, DollarSign, MapPin, Hash, Truck, Globe, Calculator, Sparkles } from 'lucide-react';
import { documentTools } from '@/lib/document-tools-config';

const SCENARIOS = {
  student: {
    title: '留学生专区',
    description: '为留学生定制的工具集：从单据生成到生活查询，一站式解决海外学习生活难题。',
    tools: [
      { name: '商业发票', href: '/tools/documents/commercial-invoice', icon: FileText, desc: '行李/物品清关必备' },
      { name: '装箱单', href: '/tools/documents/packing-list', icon: FileText, desc: '行李清单整理' },
      { name: '唛头标签生成', href: '/tools/documents/shipping-label', icon: Truck, desc: '行李标签/集运贴' },
      { name: '实时汇率', href: '/tools/exchange-rate', icon: DollarSign, desc: '学费/生活费换算' },
      { name: '全球邮编查询', href: '/tools/postal-code', icon: MapPin, desc: '学校/租房地址校验' },
      { name: 'HS编码查询', href: '/tools/hs-code', icon: Hash, desc: '携带物品申报参考' },
    ]
  },
  merchant: {
    title: '出海商家',
    description: '跨境电商、SOHO外贸商家的硬核工具库，助你高效搞定单据与合规。',
    tools: [
      { name: '形式发票', href: '/tools/documents/proforma-invoice', icon: FileText, desc: '交易前报价/确认' },
      { name: '商业发票', href: '/tools/documents/commercial-invoice', icon: FileText, desc: '出口报关/结汇核心' },
      { name: '装箱单', href: '/tools/documents/packing-list', icon: FileText, desc: '报关/提货明细' },
      { name: '外贸销售合同', href: '/tools/documents/sales-contract', icon: FileText, desc: '买卖双方签约协议' },
      { name: '实时汇率', href: '/tools/exchange-rate', icon: DollarSign, desc: '收款/结汇精算' },
      { name: 'HS编码查询', href: '/tools/hs-code', icon: Hash, desc: '商品归类/关税查询' },
      { name: '体积/运费计算器', href: '/tools/shipping-calculator', icon: Calculator, desc: '海空运成本估算' },
    ]
  },
  traveler: {
    title: '务工旅行',
    description: '为出国务工与旅行者提供实用工具，让行程规划更轻松。',
    tools: [
      { name: '全球邮编查询', href: '/tools/postal-code', icon: MapPin, desc: '地址规划/导航' },
      { name: '实时汇率', href: '/tools/exchange-rate', icon: DollarSign, desc: '当地消费/换汇参考' },
      { name: 'HS编码查询', href: '/tools/hs-code', icon: Hash, desc: '入境物品申报' },
    ]
  },
  nomad: {
    title: '数字游民',
    description: '面向远程办公和数字游民的实用辅助工具，连接全球资源。',
    tools: [
      { name: '全球邮编查询', href: '/tools/postal-code', icon: MapPin, desc: '地址/邮寄校验' },
      { name: '实时汇率', href: '/tools/exchange-rate', icon: DollarSign, desc: '全球收入结算' },
      { name: 'AI翻译润色', href: '/ai-tools/translate-polish', icon: Globe, desc: '本地化/文档润色' },
    ]
  },
};

export async function generateStaticParams() {
  return Object.keys(SCENARIOS).map((role) => ({ role }));
}

export async function generateMetadata({ params }: { params: Promise<{ role: string }> | { role: string } }): Promise<Metadata> {
  const resolvedParams = params instanceof Promise ? await params : params;
  const scenario = SCENARIOS[resolvedParams.role as keyof typeof SCENARIOS];
  return {
    title: `${scenario?.title || '场景专区'} - 海外百宝箱`,
    description: scenario?.description || '场景专区',
  };
}

export default async function ScenarioPage({ params }: { params: Promise<{ role: string }> | { role: string } }) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const scenario = SCENARIOS[resolvedParams.role as keyof typeof SCENARIOS] || SCENARIOS.student;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-teal-600 to-blue-700 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">{scenario.title}</h1>
          <p className="text-lg text-teal-100 max-w-2xl mx-auto">{scenario.description}</p>
        </div>
      </div>

      {/* Tools */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-8">专属工具推荐</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {scenario.tools.map((tool, i) => (
            <Link 
              key={i} 
              href={tool.href} 
              className="group bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-teal-200 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-teal-50 rounded-lg group-hover:bg-teal-100 transition-colors">
                  <tool.icon className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 group-hover:text-teal-700 transition-colors">{tool.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{tool.desc}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center text-teal-600 text-sm font-medium group-hover:text-teal-700">
                立即使用 <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <Link href="/tools" className="inline-flex items-center px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
            查看全部工具 <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>
    </div>
  );
}