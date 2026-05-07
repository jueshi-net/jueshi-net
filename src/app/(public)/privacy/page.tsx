import { Metadata } from 'next';
import Link from 'next/link';
import { Shield, AlertTriangle, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: '隐私政策 - 海外百宝箱',
  description: '海外百宝箱平台隐私政策',
};

export default function PrivacyPage() {
  const sections = [
    {
      title: '信息收集',
      icon: Shield,
      content: '我们收集您在使用服务过程中主动提供的信息，包括：注册时提供的邮箱地址、昵称；使用工具时产生的操作记录；反馈意见中的联系信息。',
    },
    {
      title: '信息使用',
      icon: CheckCircle,
      content: '收集的信息仅用于：提供和改善服务；发送重要通知（如服务变更、安全提醒）；分析使用情况以优化产品体验。',
    },
    {
      title: 'Cookie 使用',
      icon: AlertTriangle,
      content: '我们使用 Cookie 和类似技术来记住登录状态、偏好设置和分析网站使用情况。您可以通过浏览器设置管理 Cookie。',
    },
    {
      title: '数据保护',
      icon: Shield,
      content: '我们采用行业标准的安全措施保护您的个人信息，包括但不限于：加密传输 (HTTPS)、访问控制、定期安全审计。',
    },
    {
      title: '数据删除',
      icon: XCircle,
      content: '您可以随时申请删除个人账户及相关数据。删除后，相关数据将在 30 天内从我们的系统中永久移除。',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-gray-700 to-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 py-10">
          <h1 className="text-3xl font-bold mb-2">🔒 隐私政策</h1>
          <p className="text-gray-300">最后更新日期：2026年5月5日</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <p className="text-gray-600 leading-relaxed">
            海外百宝箱（以下简称"我们"）重视用户隐私保护。本政策说明我们如何收集、使用、存储和保护您的个人信息。使用我们的服务即表示您同意本政策的内容。
          </p>
        </div>

        <div className="space-y-4">
          {sections.map((section, i) => {
            const Icon = section.icon;
            return (
              <div key={i} className="bg-white rounded-xl shadow-sm border p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">{i + 1}. {section.title}</h2>
                </div>
                <p className="text-gray-600 leading-relaxed pl-13">{section.content}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-8 bg-blue-50 rounded-xl p-5 border border-blue-100">
          <h3 className="font-semibold text-blue-900 mb-2">联系我们</h3>
          <p className="text-blue-700 text-sm">
            如果您对本隐私政策有任何疑问，请通过 <a href="mailto:contact@kjbxb.com" className="underline">contact@kjbxb.com</a> 联系我们。
          </p>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-blue-600 hover:text-blue-700 text-sm">
            ← 返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}
