'use client';

import { useState, useEffect } from 'react';
import { Activity, Server, Database, Clock, CheckCircle, XCircle, AlertTriangle, Loader2, RefreshCw } from 'lucide-react';

export default function AdminHealthPage() {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkHealth = async () => {
    setLoading(true);
    const start = Date.now();
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setHealth({ ...data, responseTime: Date.now() - start });
    } catch {
      setHealth({ status: 'error', message: '无法连接服务器' });
    }
    setLastCheck(new Date());
    setLoading(false);
  };

  useEffect(() => {
    checkHealth();
  }, []);

  if (!health) return <div className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>;

  // Normalize API status values ('healthy' or 'ok' both mean healthy)
  const isHealthy = health.status === 'ok' || health.status === 'healthy';
  const isDbOk = health.database === 'ok' || health.database === 'healthy';

  const checks = [
    { name: '应用服务', status: isHealthy ? 'ok' : 'error', detail: isHealthy ? '运行正常' : '服务异常', icon: Server },
    { name: '数据库连接', status: isDbOk ? 'ok' : 'error', detail: isDbOk ? '连接正常' : '连接失败', icon: Database },
    { name: '响应时间', status: health.responseTime < 500 ? 'ok' : health.responseTime < 1000 ? 'warn' : 'error', detail: `${health.responseTime}ms`, icon: Clock },
    { name: '系统时间', status: 'ok', detail: new Date().toLocaleString('zh-CN'), icon: Clock },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-6 h-6" />
            系统健康
          </h1>
          <p className="text-gray-500 mt-1">实时监控平台运行状态</p>
        </div>
        <button
          onClick={checkHealth}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          重新检查
        </button>
      </div>

      {lastCheck && (
        <div className="text-sm text-gray-500">
          最后检查：{lastCheck.toLocaleString('zh-CN')}
        </div>
      )}

      {/* 检查项 */}
      <div className="grid md:grid-cols-2 gap-4">
        {checks.map((check, i) => {
          const Icon = check.icon;
          const statusConfig: Record<string, { color: string; icon: any; text: string }> = {
            ok: { color: 'green', icon: CheckCircle, text: '正常' },
            warn: { color: 'yellow', icon: AlertTriangle, text: '警告' },
            error: { color: 'red', icon: XCircle, text: '异常' },
          };
          const cfg = statusConfig[check.status] || statusConfig.error;
          const StatusIcon = cfg.icon;

          return (
            <div key={i} className={`bg-white rounded-xl border p-5 ${check.status === 'error' ? 'border-red-200 bg-red-50' : ''}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  cfg.color === 'green' ? 'bg-green-100' : cfg.color === 'yellow' ? 'bg-yellow-100' : 'bg-red-100'
                }`}>
                  <Icon className={`w-5 h-5 ${
                    cfg.color === 'green' ? 'text-green-600' : cfg.color === 'yellow' ? 'text-yellow-600' : 'text-red-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{check.name}</span>
                    <StatusIcon className={`w-4 h-4 ${
                      cfg.color === 'green' ? 'text-green-500' : cfg.color === 'yellow' ? 'text-yellow-500' : 'text-red-500'
                    }`} />
                  </div>
                  <p className="text-sm text-gray-500">{check.detail}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 总体状态 */}
      <div className={`rounded-xl p-6 text-center ${
        isHealthy ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
      }`}>
        <h2 className={`text-xl font-bold ${isHealthy ? 'text-green-700' : 'text-red-700'}`}>
          {isHealthy ? '✅ 所有服务正常运行' : '❌ 系统存在异常，请检查日志或探针配置'}
        </h2>
        <p className={`text-sm mt-1 ${isHealthy ? 'text-green-600' : 'text-red-600'}`}>
          {isHealthy ? `运行时间: ${Math.floor(health.uptime)}s · Node ${health.version}` : health.message}
        </p>
      </div>
    </div>
  );
}
