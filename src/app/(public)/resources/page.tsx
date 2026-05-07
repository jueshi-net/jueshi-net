import { Metadata } from 'next';
import Link from 'next/link';
import { FileText, LifeBuoy, Truck, Briefcase, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: '资源库 - 海外百宝箱',
  description: '海外华人常用生活资源、跨境寄送资料、出海经营模板下载',
};

export default function ResourcesPage() {
  const categories = [
    { name: "海外生活资源", slug: "life", icon: LifeBuoy, desc: "政府、银行、医疗、教育、生活服务常用网站与指南", color: "bg-green-100 text-green-600" },
    { name: "集运物流参考", slug: "logistics", icon: Truck, desc: "承运商查询、集运渠道介绍、敏感货邮寄指南", color: "bg-blue-100 text-blue-600" },
    { name: "出海经营资源", slug: "business", icon: Briefcase, desc: "跨境平台、收款工具、广告投放、AI工具导航", color: "bg-purple-100 text-purple-600" },
    { name: "模板资源", slug: "templates", icon: FileText, desc: "报价单、发票、装箱单、箱唛等可编辑模板下载", color: "bg-orange-100 text-orange-600" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-teal-500 via-teal-600 to-blue-700 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">资源库</h1>
          <p className="text-lg text-teal-100">海外生活、集运物流、出海经营的实用资料与模板</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-8 pb-16">
        <div className="grid md:grid-cols-2 gap-6">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.slug}
                href={`/resources/${cat.slug}`}
                className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-md hover:border-teal-300 transition-all"
              >
                <div className={`w-14 h-14 rounded-xl ${cat.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">{cat.name}</h2>
                <p className="text-gray-500 mb-4">{cat.desc}</p>
                <div className="flex items-center gap-2 text-teal-600 font-medium">
                  进入资源 <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
