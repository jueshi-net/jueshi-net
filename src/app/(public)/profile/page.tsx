import { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { User, Mail, Calendar, Link as LinkIcon, FolderOpen, Star, Settings, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '个人中心 - 海外百宝箱',
  description: '管理您的账户信息、收藏和使用记录',
};

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      _count: {
        select: {
          links: true,
          ownedWorkspaces: true,
          favorites: true,
          memos: true,
        },
      },
      preferences: true,
    },
  });

  if (!user) redirect('/login');

  const stats = [
    { label: '导航链接', value: user._count.links, icon: LinkIcon, color: 'blue', href: '/my-links' },
    { label: '工作区', value: user._count.ownedWorkspaces, icon: FolderOpen, color: 'green', href: '/dashboard' },
    { label: '收藏', value: user._count.favorites, icon: Star, color: 'purple', href: '/favorites' },
    { label: '备忘录', value: user._count.memos, icon: FolderOpen, color: 'orange', href: '/tools/memo' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
              {user.name?.[0] || user.email[0]}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user.name || '未设置昵称'}</h1>
              <p className="text-blue-100">{user.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-6">
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <Link
                key={i}
                href={stat.href}
                className="bg-white rounded-xl shadow-sm border p-4 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-${stat.color}-100 flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 text-${stat.color}-600`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 ml-auto group-hover:text-gray-500" />
                </div>
              </Link>
            );
          })}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* 账户信息 */}
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              账户信息
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">昵称</span>
                <span className="font-medium">{user.name || '未设置'}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">邮箱</span>
                <span className="font-medium">{user.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">角色</span>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                  {user.role === 'admin' ? '管理员' : '普通用户'}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-500">注册时间</span>
                <span className="font-medium">{new Date(user.createdAt).toLocaleDateString('zh-CN')}</span>
              </div>
            </div>
          </div>

          {/* 偏好设置 */}
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              偏好设置
            </h2>
            {user.preferences ? (
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">主题</span>
                  <span className="font-medium">
                    {user.preferences.theme === 'system' ? '跟随系统' : user.preferences.theme === 'dark' ? '深色' : '浅色'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">语言</span>
                  <span className="font-medium">{user.preferences.language}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">紧凑模式</span>
                  <span className="font-medium">{user.preferences.compactMode ? '开启' : '关闭'}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">每页条数</span>
                  <span className="font-medium">{user.preferences.itemsPerPage}</span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">尚未配置偏好设置</p>
            )}
            <Link
              href="/preferences"
              className="mt-4 inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
            >
              修改偏好设置 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* 快捷操作 */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">快捷操作</h2>
          <div className="flex gap-3 flex-wrap">
            <Link href="/dashboard" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
              进入工作台
            </Link>
            <Link href="/my-links" className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm">
              管理链接
            </Link>
            <Link href="/preferences" className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm">
              偏好设置
            </Link>
            <Link href="/notifications" className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm">
              通知中心
            </Link>
            {user.role === 'admin' && (
              <Link href="/admin" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">
                管理后台
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';
