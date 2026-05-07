import { Metadata } from 'next';
import Link from 'next/link';
import { HelpCircle, ChevronDown, Search, ArrowRight, Book, MessageSquare, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: '帮助中心 - 海外百宝箱',
  description: '查找问题的答案，了解平台功能和使用方法',
};

const faqs = [
  {
    category: '🚀 快速开始',
    items: [
      { q: '如何注册账号？', a: '点击右上角"立即注册"，输入邮箱和密码即可完成注册。也支持第三方登录。' },
      { q: '如何创建我的工作区？', a: '登录后进入个人中心，点击"创建工作区"，填写名称和描述即可。' },
      { q: '如何添加导航链接？', a: '在工作台中点击"添加链接"按钮，填写名称、URL 和描述，选择分类后保存。' },
    ],
  },
  {
    category: '🔗 链接管理',
    items: [
      { q: '如何导入大量链接？', a: '管理员可在后台使用 CSV 批量导入功能，支持拖拽上传和模板下载。' },
      { q: '如何检测失效链接？', a: '管理员可在后台使用"链接健康检查"功能，一键检测所有链接的可用性。' },
      { q: '如何分享链接给他人？', a: '点击链接的分享按钮，生成分享卡片页，复制链接分享给他人即可。' },
    ],
  },
  {
    category: '🛠️ 工具箱',
    items: [
      { q: '体积计算器怎么用？', a: '输入长、宽、高和单位，自动计算体积重量（CBM），支持厘米/英寸切换。' },
      { q: '汇率查询支持哪些货币？', a: '支持主流货币实时汇率查询，包括 CNY、USD、EUR、GBP、JPY、HKD 等。' },
      { q: '如何生成二维码？', a: '在工具箱中选择"二维码生成器"，输入文本或链接，点击生成即可下载。' },
    ],
  },
  {
    category: '📧 订阅与通知',
    items: [
      { q: '如何订阅邮件通知？', a: '在首页底部输入邮箱地址，点击订阅即可。确认邮件发送后点击链接完成验证。' },
      { q: '如何管理通知偏好？', a: '进入"设置 > 偏好设置"，可配置主题、语言、紧凑模式、每页条数和邮件通知开关。' },
    ],
  },
  {
    category: '🔐 账户与安全',
    items: [
      { q: '忘记密码怎么办？', a: '在登录页点击"忘记密码"，输入注册邮箱，系统将发送重置密码链接。' },
      { q: '如何修改邮箱？', a: '进入个人中心 > 账户设置，点击邮箱旁边的"修改"按钮，验证新邮箱后即可更新。' },
    ],
  },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-700 text-white">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl font-bold mb-2">❓ 帮助中心</h1>
          <p className="text-teal-100 text-lg mb-6">查找问题的答案，了解平台功能和使用方法</p>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
          >
            <Search className="w-5 h-5" />
            搜索全站内容
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 快捷入口 */}
        <div className="grid md:grid-cols-3 gap-4 mb-10">
          <Link href="/api-docs" className="bg-white rounded-xl border p-5 hover:shadow-md transition-all group">
            <Book className="w-8 h-8 text-blue-500 mb-3" />
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">API 文档</h3>
            <p className="text-sm text-gray-500 mt-1">完整的 REST API 接口文档</p>
          </Link>
          <Link href="/feedback" className="bg-white rounded-xl border p-5 hover:shadow-md transition-all group">
            <MessageSquare className="w-8 h-8 text-green-500 mb-3" />
            <h3 className="font-semibold text-gray-900 group-hover:text-green-600">意见反馈</h3>
            <p className="text-sm text-gray-500 mt-1">提交建议或报告问题</p>
          </Link>
          <a href="mailto:contact@kjbxb.com" className="bg-white rounded-xl border p-5 hover:shadow-md transition-all group">
            <Mail className="w-8 h-8 text-purple-500 mb-3" />
            <h3 className="font-semibold text-gray-900 group-hover:text-purple-600">联系我们</h3>
            <p className="text-sm text-gray-500 mt-1">contact@kjbxb.com</p>
          </a>
        </div>

        {/* FAQ */}
        <div className="space-y-8">
          {faqs.map((section, i) => (
            <div key={i}>
              <h2 className="text-xl font-bold text-gray-900 mb-4">{section.category}</h2>
              <div className="space-y-3">
                {section.items.map((faq, j) => (
                  <details key={j} className="bg-white rounded-lg border border-gray-200 group">
                    <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-900">{faq.q}</span>
                      <ChevronDown className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" />
                    </summary>
                    <div className="px-4 pb-4 text-gray-600 text-sm leading-relaxed">
                      {faq.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 底部引导 */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 text-center border border-blue-100">
          <HelpCircle className="w-12 h-12 text-blue-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">没找到答案？</h3>
          <p className="text-gray-600 mb-4">我们随时为您提供帮助</p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/feedback"
              className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <MessageSquare className="w-4 h-4" />
              提交反馈
            </Link>
            <a
              href="mailto:contact@kjbxb.com"
              className="inline-flex items-center gap-2 px-5 py-2 border border-gray-300 rounded-lg hover:bg-white"
            >
              <Mail className="w-4 h-4" />
              邮件联系
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
