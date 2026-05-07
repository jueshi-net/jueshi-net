import { Metadata } from 'next';
import Link from 'next/link';
import { FileText, Scale, AlertCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: '服务条款 - 海外百宝箱',
  description: '海外百宝箱平台服务条款',
};

export default function TermsPage() {
  const terms = [
    {
      title: '服务说明',
      content: '海外百宝箱提供海外华人常用工具与资源平台，包括导航链接管理、在线工具箱、内容管理等。我们致力于为用户提供稳定、高效的服务体验。',
    },
    {
      title: '账户责任',
      content: '用户需对其账户下的所有活动负责。请妥善保管账户信息，不得将账户转让、出借给第三方。如发现账户被盗用，请立即联系我们。',
    },
    {
      title: '使用规范',
      content: '用户不得利用本平台从事以下行为：传播违法有害信息；侵犯他人知识产权；干扰或破坏平台正常运行；进行任何未经授权的自动化访问。',
    },
    {
      title: '知识产权',
      content: '平台上的所有内容（包括但不限于文字、图片、代码、设计）均受知识产权保护。未经书面许可，不得复制、修改、传播或用于商业用途。',
    },
    {
      title: '服务变更与终止',
      content: '我们保留随时修改、暂停或终止服务的权利，无需事先通知。对于免费用户，我们可能在提前 7 天通知后终止服务。',
    },
    {
      title: '免责声明',
      content: '本平台按"现状"提供服务，不保证服务 uninterrupted 或无错误。对于因使用本平台造成的任何间接损失，我们不承担责任。',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-gray-700 to-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 py-10">
          <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
            <Scale className="w-8 h-8" />
            服务条款
          </h1>
          <p className="text-gray-300">最后更新日期：2026年5月5日</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-amber-800 text-sm">
            使用海外百宝箱的服务即表示您同意遵守本服务条款的所有条款。请仔细阅读。
          </p>
        </div>

        <div className="space-y-4">
          {terms.map((term, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border p-5">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-400" />
                {i + 1}. {term.title}
              </h2>
              <p className="text-gray-600 leading-relaxed">{term.content}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>如有疑问，请联系 <a href="mailto:contact@kjbxb.com" className="text-blue-600 hover:underline">contact@kjbxb.com</a></p>
          <p className="mt-2">
            <Link href="/privacy" className="text-blue-600 hover:underline mr-4">隐私政策</Link>
            <Link href="/" className="text-blue-600 hover:underline">返回首页</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
