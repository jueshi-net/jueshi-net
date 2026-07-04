"use client";

import { Clock, Eye } from "lucide-react";

const articles = [
  {
    title: "2026 加拿大留学生必备 APP 清单",
    description: "从地图导航到银行开户，覆盖出行、支付、住宿、学习全场景",
    category: "留学指南",
    readTime: "8 分钟",
    views: "12.5K",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&q=80",
  },
  {
    title: "国际运费怎么算？三大快递对比",
    description: "DHL、FedEx、UPS 价格时效全面对比，附省钱技巧",
    category: "物流",
    readTime: "6 分钟",
    views: "8.3K",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&q=80",
  },
  {
    title: "外贸单据填写指南：商业发票",
    description: "从 HS 编码到贸易术语，一步步教你填写商业发票",
    category: "外贸",
    readTime: "10 分钟",
    views: "6.7K",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&q=80",
  },
  {
    title: "海外租房避坑指南",
    description: "从看房到签约，这些细节一定要注意",
    category: "生活",
    readTime: "7 分钟",
    views: "9.1K",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&q=80",
  },
];

export default function JueshiV4ContentSection() {
  return (
    <section className="px-6 lg:px-12 py-8 border-t border-[#3a3e45]">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">推荐内容</h2>
          <p className="text-sm text-gray-400 mt-1">留学指南、物流攻略、生活技巧</p>
        </div>
        <a href="/guides" className="text-sm text-[#6c5dd3] hover:text-[#ab99ff] transition-colors">
          查看全部 →
        </a>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {articles.map((article) => (
          <a
            key={article.title}
            href="/guides"
            className="group bg-[#2a2d35] border border-[#3a3e45] rounded-xl overflow-hidden hover:border-[#6c5dd3]/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300"
          >
            {/* Image */}
            <div className="relative h-32 overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-300"
                style={{ backgroundImage: `url(${article.image})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1b1d21] to-transparent" />
              {/* Category Badge */}
              <div className="absolute top-3 left-3 px-2 py-1 bg-[#6c5dd3]/80 backdrop-blur-sm rounded text-xs text-white font-medium">
                {article.category}
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="font-semibold text-white mb-2 line-clamp-2 group-hover:text-[#ab99ff] transition-colors">
                {article.title}
              </h3>
              <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                {article.description}
              </p>

              {/* Meta */}
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {article.readTime}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {article.views}
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
