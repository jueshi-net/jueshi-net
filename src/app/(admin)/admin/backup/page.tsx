'use client';

import { useState } from 'react';
import { Download, Database, Loader2, FileText, Link, Users, Mail } from 'lucide-react';

export default function AdminBackupPage() {
  const [exporting, setExporting] = useState(false);
  const [counts, setCounts] = useState<Record<string, number> | null>(null);

  const handleExport = async () => {
    setExporting(true);
    const res = await fetch('/api/admin/backup/export');
    const data = await res.json();
    setCounts(data.counts);

    // 触发下载
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kjbxb-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  };

  const stats = [
    { label: '用户', icon: Users, key: 'users' },
    { label: '链接', icon: Link, key: 'links' },
    { label: '分类', icon: FileText, key: 'categories' },
    { label: '文章', icon: FileText, key: 'articles' },
    { label: '订阅', icon: Mail, key: 'subscriptions' },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Database className="w-6 h-6" />
          数据备份
        </h1>
        <p className="text-gray-500 mt-1">导出平台所有数据为 JSON 文件</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6 text-center space-y-4">
        <Database className="w-16 h-16 text-blue-500 mx-auto" />
        <h2 className="text-xl font-semibold">导出全部数据</h2>
        <p className="text-gray-500 max-w-md mx-auto">
          包含所有用户、链接、分类、文章、反馈、订阅和短链接数据。
          导出文件为 JSON 格式，可用于数据迁移或备份。
        </p>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
        >
          {exporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
          {exporting ? '导出中...' : '导出数据'}
        </button>
      </div>

      {counts && (
        <div className="bg-white rounded-lg shadow-sm border p-5">
          <h3 className="font-medium mb-4">导出数据统计</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {stats.map(stat => {
              const Icon = stat.icon;
              return (
                <div key={stat.key} className="bg-gray-50 rounded-lg p-4 text-center">
                  <Icon className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{counts[stat.key] || 0}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
