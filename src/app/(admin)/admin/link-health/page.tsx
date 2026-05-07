'use client';

import { useState } from 'react';
import { HeartPulse, CheckCircle, XCircle, Loader2, Play, AlertTriangle } from 'lucide-react';

interface LinkHealth {
  id: string;
  name: string;
  url: string;
  status: number;
  ok: boolean;
  error?: string;
}

export default function AdminLinkHealthPage() {
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [results, setResults] = useState<LinkHealth[]>([]);
  const [stats, setStats] = useState({ total: 0, healthy: 0, unhealthy: 0 });

  const checkHealth = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/link-health');
    const data = await res.json();
    setResults(data.links || []);
    setStats({ total: data.total || 0, healthy: data.healthy || 0, unhealthy: data.unhealthy || 0 });
    setLoading(false);
  };

  const runCheck = async () => {
    setChecking(true);
    const res = await fetch('/api/admin/link-health/check', { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      checkHealth();
    }
    setChecking(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <HeartPulse className="w-6 h-6" />
            链接健康检查
          </h1>
          <p className="text-gray-500 mt-1">检测失效链接并自动标记</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={runCheck}
            disabled={checking}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            运行检查
          </button>
          <button
            onClick={checkHealth}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <HeartPulse className="w-4 h-4" />}
            查看结果
          </button>
        </div>
      </div>

      {/* 统计 */}
      {stats.total > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <p className="text-sm text-gray-500">检查总数</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-green-50 rounded-lg border border-green-200 p-4">
            <p className="text-sm text-green-600 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" /> 正常
            </p>
            <p className="text-2xl font-bold text-green-700">{stats.healthy}</p>
          </div>
          <div className="bg-red-50 rounded-lg border border-red-200 p-4">
            <p className="text-sm text-red-600 flex items-center gap-1">
              <XCircle className="w-4 h-4" /> 异常
            </p>
            <p className="text-2xl font-bold text-red-700">{stats.unhealthy}</p>
          </div>
        </div>
      )}

      {/* 结果列表 */}
      {results.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">状态</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">名称</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">URL</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">HTTP</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {results.map((link) => (
                  <tr key={link.id} className={!link.ok ? 'bg-red-50' : ''}>
                    <td className="px-6 py-3">
                      {link.ok ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                      )}
                    </td>
                    <td className="px-6 py-3 text-sm font-medium">{link.name}</td>
                    <td className="px-6 py-3 text-sm text-gray-500 truncate max-w-xs">{link.url}</td>
                    <td className="px-6 py-3 text-sm">
                      {link.status > 0 ? (
                        <span className={`font-mono ${link.ok ? 'text-green-600' : 'text-red-600'}`}>
                          {link.status}
                        </span>
                      ) : (
                        <span className="text-red-500 text-xs">{link.error}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
