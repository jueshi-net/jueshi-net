'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Users, Check } from 'lucide-react';
import { getRoleInfo, setRole, type UserRole } from '@/lib/membership/permissions';

const roles: { role: UserRole; label: string; desc: string; color: string }[] = [
  { role: 'guest', label: '游客', desc: '3份草稿，默认模板样式，导出PDF/PNG', color: 'gray' },
  { role: 'user', label: '注册用户', desc: '10份草稿，1套公司信息，导出PDF/PNG', color: 'blue' },
  { role: 'member', label: '会员', desc: '无限草稿，多套公司，自定义风格，Word导出', color: 'amber' },
  { role: 'admin', label: '管理员', desc: '全部权限（同会员）', color: 'red' },
];

export default function RoleSwitcherPage() {
  const currentRole = getRoleInfo().role;
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setRole(selectedRole);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/tools/documents" className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> 返回
            </Link>
            <h1 className="font-bold text-gray-900">角色切换（测试工具）</h1>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Current role badge */}
        <div className="bg-white rounded-xl border p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-6 h-6 text-blue-600" />
            <div>
              <p className="text-sm text-gray-500">当前角色</p>
              <p className="text-2xl font-bold">{roles.find(r => r.role === currentRole)?.label}</p>
            </div>
          </div>
          <p className="text-xs text-gray-400">
            此工具用于测试不同会员等级下的功能权限。切换后立即生效，刷新页面可查看效果。
          </p>
        </div>

        {/* Role cards */}
        <div className="space-y-3 mb-6">
          {roles.map(r => (
            <button
              key={r.role}
              onClick={() => setSelectedRole(r.role)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                selectedRole === r.role
                  ? `border-${r.color}-500 bg-${r.color}-50`
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    r.color === 'gray' ? 'bg-gray-100 text-gray-700' :
                    r.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                    r.color === 'amber' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {r.label}
                  </span>
                  <p className="text-sm text-gray-600 mt-1">{r.desc}</p>
                </div>
                {selectedRole === r.role && (
                  <Check className="w-5 h-5 text-blue-600" />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={selectedRole === currentRole}
          className={`w-full py-3 rounded-xl font-semibold transition-colors ${
            selectedRole === currentRole
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {saved ? '✅ 已切换！刷新页面查看效果' : selectedRole === currentRole ? '当前已是此角色' : `切换为「${roles.find(r => r.role === selectedRole)?.label}」`}
        </button>

        {/* Permission comparison */}
        <div className="mt-8 bg-white rounded-xl border p-6">
          <h3 className="font-semibold text-gray-900 mb-4">权限对比</h3>
          <div className="space-y-2 text-sm">
            {[
              { feature: '草稿数量', guest: '3份', user: '10份', member: '无限', admin: '无限' },
              { feature: '公司信息模板', guest: '不可保存', user: '1套', member: '多套', admin: '多套' },
              { feature: '上传 Logo', guest: '❌', user: '❌', member: '✅', admin: '✅' },
              { feature: '自定义模板风格', guest: '❌', user: '❌', member: '✅', admin: '✅' },
              { feature: '去除页脚品牌', guest: '❌', user: '❌', member: '✅', admin: '✅' },
              { feature: '导出 Word', guest: '❌', user: '❌', member: '✅', admin: '✅' },
            ].map(row => (
              <div key={row.feature} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-gray-700">{row.feature}</span>
                <span className="text-xs text-gray-400">
                  {row[selectedRole as keyof typeof row] as string}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
