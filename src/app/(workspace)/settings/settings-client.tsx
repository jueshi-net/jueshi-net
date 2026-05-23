'use client';

import { useState, useEffect } from 'react';
import { Settings, Check } from 'lucide-react';

const THEME_COLORS = [
  { key: 'teal', label: '青绿', tw: 'bg-teal-500', ring: 'ring-teal-300' },
  { key: 'blue', label: '湛蓝', tw: 'bg-blue-500', ring: 'ring-blue-300' },
  { key: 'purple', label: '紫罗兰', tw: 'bg-purple-500', ring: 'ring-purple-300' },
  { key: 'orange', label: '橙光', tw: 'bg-orange-500', ring: 'ring-orange-300' },
  { key: 'red', label: '珊瑚红', tw: 'bg-red-500', ring: 'ring-red-300' },
  { key: 'slate', label: '岩灰', tw: 'bg-slate-600', ring: 'ring-slate-400' },
];

export default function SettingsClient({ userName, userEmail }: { userName: string; userEmail: string }) {
  const [selectedTheme, setSelectedTheme] = useState('teal');
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('wb:theme');
      if (saved) setSelectedTheme(saved);
    } catch {}
  }, []);

  useEffect(() => {
    if (toast) { const t = setTimeout(() => setToast(null), 2500); return () => clearTimeout(t); }
  }, [toast]);

  const selectTheme = (key: string) => {
    setSelectedTheme(key);
    try { localStorage.setItem('wb:theme', key); } catch {}
    const color = THEME_COLORS.find(c => c.key === key);
    setToast(`🎨 主题色已更新为「${color?.label}」`);
  };

  return (
    <div className="space-y-4">
      {toast && (
        <div className="fixed top-5 right-5 z-50 px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg bg-white/90 border border-gray-100">{toast}</div>
      )}

      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm">⚙️</span>
        <div>
          <h1 className="text-base font-bold text-gray-900 tracking-tight">账号设置</h1>
          <p className="text-[11px] text-gray-400 mt-0.5">管理个人信息与偏好</p>
        </div>
      </div>

      {/* Profile */}
      <div className="bg-white rounded-2xl border border-gray-100/80 divide-y divide-gray-50">
        <div className="p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">个人信息</h2>
          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-medium text-gray-500 mb-1 block">姓名</label>
              <input type="text" defaultValue={userName || '未设置'} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-200 transition-all" />
            </div>
            <div>
              <label className="text-[11px] font-medium text-gray-500 mb-1 block">邮箱</label>
              <input type="email" defaultValue={userEmail} disabled className="w-full px-3 py-2 border border-gray-100 rounded-xl text-sm bg-gray-50 text-gray-400" />
            </div>
            <div>
              <label className="text-[11px] font-medium text-gray-500 mb-1 block">二级域名</label>
              <div className="flex items-center gap-2">
                <input type="text" placeholder="专属域名（即将上线）" disabled className="w-44 px-3 py-2 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-400" />
                <span className="text-xs text-gray-400">.jueshi.net</span>
              </div>
            </div>
            <button className="px-5 py-2 bg-teal-600 text-white rounded-xl text-xs font-medium hover:bg-teal-700 transition-colors">
              保存修改
            </button>
          </div>
        </div>

        {/* Theme Colors */}
        <div className="p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">主题颜色</h2>
          <div className="flex flex-wrap gap-3">
            {THEME_COLORS.map(color => {
              const isSelected = selectedTheme === color.key;
              return (
                <button
                  key={color.key}
                  onClick={() => selectTheme(color.key)}
                  className={`relative w-10 h-10 rounded-xl ${color.tw} transition-all duration-200 hover:scale-110 ${
                    isSelected ? `ring-2 ${color.ring} ring-offset-2 scale-110` : 'opacity-60 hover:opacity-100'
                  }`}
                  title={color.label}
                >
                  {isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-gray-400 mt-2">当前主题：<span className="font-medium text-gray-600">{THEME_COLORS.find(c => c.key === selectedTheme)?.label}</span></p>
        </div>

        {/* Workspace */}
        <div className="p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">工作台设置</h2>
          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-medium text-gray-500 mb-1 block">工作台标题</label>
              <input type="text" defaultValue="我的工作台" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-200 transition-all" />
            </div>
            <button className="px-5 py-2 bg-teal-600 text-white rounded-xl text-xs font-medium hover:bg-teal-700 transition-colors">
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
