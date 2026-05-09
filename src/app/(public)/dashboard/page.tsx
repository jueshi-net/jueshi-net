import { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Star, Clock, FileText, Wrench, ArrowRight, PackageSearch, Calculator, FileText as FileTextIcon, MapPin } from 'lucide-react';

export const metadata: Metadata = {
  title: '我的工作台 - 海外百宝箱',
  description: '查看我的收藏、最近使用工具和备忘录',
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login?callbackUrl=/dashboard');
  }

  const tools = [
    { name: "物流追踪", href: "/tracking", icon: PackageSearch, color: "bg-blue-100 text-blue-600" },
    { name: "体积计算", href: "/tools/shipping-calculator", icon: Calculator, color: "bg-green-100 text-green-600" },
    { name: "发票生成", href: "/tools/invoice", icon: FileTextIcon, color: "bg-purple-100 text-purple-600" },
    { name: "邮编查询", href: "/tools/postal-code", icon: MapPin, color: "bg-orange-100 text-orange-600" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-slate-700 via-slate-800 to-gray-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">我的工作台</h1>
          <p className="text-slate-300">欢迎回来，{session.user.name || '用户'}</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-8 pb-16">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Stats cards */}
          <div className="bg-white rounded-xl shadow-sm border p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <Star className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-sm text-gray-500">我的收藏</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">4</p>
              <p className="text-sm text-gray-500">最近使用</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-sm text-gray-500">备忘录</p>
            </div>
          </div>
        </div>

        {/* Quick tools */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">常用工具</h2>
            <Link href="/tools" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
              查看全部 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {tools.map((t) => {
              const Icon = t.icon;
              return (
                <Link key={t.href} href={t.href} className="flex items-center gap-3 p-4 rounded-lg border hover:border-blue-300 hover:bg-blue-50 transition-all">
                  <div className={`w-10 h-10 rounded-lg ${t.color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-gray-900">{t.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">最近活动</h2>
          <div className="text-center py-8 text-gray-400">
            <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>暂无活动记录</p>
            <p className="text-sm mt-1">开始使用工具后，这里会显示您的最近记录</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';
