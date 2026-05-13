'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdSlot } from '@/components/ad-slot';
import { FAQSection } from '@/components/faq-section';
import { trackEvent } from '@/lib/analytics';
import {
  Package,
  Search,
  Copy,
  Check,
  Plus,
  Trash2,
  ExternalLink,
  Clock,
  Truck,
  CheckCircle,
  AlertCircle,
  XCircle,
  HelpCircle,
  Download,
  Upload,
} from 'lucide-react';

const STORAGE_KEY = 'tracking_numbers';

type TrackingStatus = 'pending' | 'in-transit' | 'delivered' | 'exception' | 'unknown';

interface TrackingEntry {
  id: string;
  number: string;
  carrier: string;
  status: TrackingStatus;
  note: string;
  createdAt: string;
  updatedAt: string;
}

const CARRIER_OPTIONS = [
  '未选择',
  '17TRACK',
  '中通快递',
  '圆通速递',
  '韵达快递',
  '申通快递',
  '顺丰速运',
  '京东物流',
  'EMS中国邮政',
  '极兔速递',
  'DHL',
  'FedEx',
  'UPS',
  'USPS',
  'Canada Post',
];

const STATUS_CONFIG: Record<TrackingStatus, { label: string; color: string; icon: typeof Package }> = {
  'pending': { label: '待查询', color: 'bg-gray-100 text-gray-600', icon: Clock },
  'in-transit': { label: '运输中', color: 'bg-blue-100 text-blue-700', icon: Truck },
  'delivered': { label: '已签收', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  'exception': { label: '异常', color: 'bg-red-100 text-red-700', icon: AlertCircle },
  'unknown': { label: '未知', color: 'bg-yellow-100 text-yellow-700', icon: HelpCircle },
};

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

function loadTracking(): TrackingEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as TrackingEntry[];
  } catch {
    console.error('Failed to load tracking data');
  }
  return [];
}

function saveTracking(entries: TrackingEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    console.error('Failed to save tracking data');
  }
}

export default function TrackingPage() {
  const [entries, setEntries] = useState<TrackingEntry[]>(() => loadTracking());
  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<TrackingStatus | 'all'>('all');
  const [message, setMessage] = useState({ type: '' as 'success' | 'error' | '', text: '' });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showBatchInput, setShowBatchInput] = useState(false);
  const [batchInput, setBatchInput] = useState('');

  const flashMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 2500);
  };

  const persist = (updated: TrackingEntry[]) => {
    setEntries(updated);
    saveTracking(updated);
  };

  const addTracking = useCallback(() => {
    const trimmed = inputValue.trim();
    if (!trimmed) {
      flashMessage('error', '请输入快递单号');
      return;
    }

    // Check duplicate
    if (entries.some(e => e.number === trimmed)) {
      flashMessage('error', '该单号已存在');
      return;
    }

    const now = new Date().toISOString();
    const newEntry: TrackingEntry = {
      id: generateId(),
      number: trimmed,
      carrier: '未选择',
      status: 'pending',
      note: '',
      createdAt: now,
      updatedAt: now,
    };

    persist([newEntry, ...entries]);
    trackEvent.trackingClick17track();
    setInputValue('');
    flashMessage('success', '已添加单号');
  }, [inputValue, entries]);

  const addBatchTracking = useCallback(() => {
    const lines = batchInput.split(/[\n,;，；]+/).map(s => s.trim()).filter(Boolean);
    if (lines.length === 0) {
      flashMessage('error', '请输入至少一个单号');
      return;
    }

    const existingNumbers = new Set(entries.map(e => e.number));
    const now = new Date().toISOString();
    const newEntries: TrackingEntry[] = [];

    for (const num of lines) {
      if (!existingNumbers.has(num)) {
        newEntries.push({
          id: generateId(),
          number: num,
          carrier: '未选择',
          status: 'pending',
          note: '',
          createdAt: now,
          updatedAt: now,
        });
        existingNumbers.add(num);
      }
    }

    if (newEntries.length === 0) {
      flashMessage('error', '所有单号均已存在');
      return;
    }

    persist([...newEntries, ...entries]);
    setBatchInput('');
    setShowBatchInput(false);
    flashMessage('success', `成功添加 ${newEntries.length} 个单号`);
  }, [batchInput, entries]);

  const removeEntry = useCallback((id: string) => {
    persist(entries.filter(e => e.id !== id));
    flashMessage('success', '已删除');
  }, [entries]);

  const updateEntry = useCallback((id: string, updates: Partial<TrackingEntry>) => {
    const updated = entries.map(e =>
      e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e
    );
    persist(updated);
  }, [entries]);

  const copyNumber = useCallback(async (number: string, id: string) => {
    try {
      await navigator.clipboard.writeText(number);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
      trackEvent.trackingCopy();
    } catch {
      flashMessage('error', '复制失败');
    }
  }, []);

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `快递单号备份_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    flashMessage('success', '导出成功');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const imported = JSON.parse(ev.target?.result as string) as TrackingEntry[];
          if (!Array.isArray(imported)) throw new Error('Invalid format');
          const existingIds = new Set(entries.map(e => e.number));
          const newEntries = imported.filter(e => !existingIds.has(e.number));
          if (newEntries.length === 0) {
            flashMessage('error', '没有新的单号可导入');
            return;
          }
          persist([...newEntries, ...entries]);
          flashMessage('success', `成功导入 ${newEntries.length} 个单号`);
        } catch {
          flashMessage('error', '导入失败，文件格式不正确');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  // Filtering & sorting
  const filteredEntries = entries
    .filter(e => {
      const matchesSearch = !searchQuery ||
        e.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.carrier.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.note.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || e.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      // Pending and exception first, then in-transit, then delivered
      const statusOrder: Record<string, number> = {
        'exception': 0,
        'pending': 1,
        'in-transit': 2,
        'unknown': 3,
        'delivered': 4,
      };
      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status];
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  // Stats
  const stats = {
    total: entries.length,
    pending: entries.filter(e => e.status === 'pending').length,
    inTransit: entries.filter(e => e.status === 'in-transit').length,
    delivered: entries.filter(e => e.status === 'delivered').length,
    exception: entries.filter(e => e.status === 'exception').length,
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">物流追踪</h1>
          <p className="text-sm text-gray-500 mt-1">单号整理 · 状态备注 · 跳转第三方查询 · 实际物流轨迹以承运商为准</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleImport}
            className="px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-1.5"
          >
            <Upload className="w-4 h-4" /> 导入
          </button>
          <button
            onClick={handleExport}
            disabled={entries.length === 0}
            className="px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" /> 导出
          </button>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800">
          <strong>本站为单号整理工具，不提供物流轨迹查询服务。</strong>实际物流信息请以承运商官网或 17TRACK 等第三方平台为准。
        </p>
      </div>

      {/* Stats */}
      {entries.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <div className="bg-white rounded-xl border p-3 text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-xs text-gray-500">全部单号</div>
          </div>
          <div className="bg-white rounded-xl border p-3 text-center">
            <div className="text-2xl font-bold text-gray-600">{stats.pending}</div>
            <div className="text-xs text-gray-500">待查询</div>
          </div>
          <div className="bg-white rounded-xl border p-3 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.inTransit}</div>
            <div className="text-xs text-gray-500">运输中</div>
          </div>
          <div className="bg-white rounded-xl border p-3 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
            <div className="text-xs text-gray-500">已签收</div>
          </div>
          <div className="bg-white rounded-xl border p-3 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.exception}</div>
            <div className="text-xs text-gray-500">异常</div>
          </div>
        </div>
      )}

      {/* Add single tracking number */}
      <div className="bg-white rounded-xl border p-4 mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') addTracking(); }}
              placeholder="输入快递单号，回车添加"
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={addTracking}
            className="px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> 添加
          </button>
          <button
            onClick={() => setShowBatchInput(!showBatchInput)}
            className="px-3 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 text-sm"
          >
            批量添加
          </button>
        </div>

        {/* Batch input */}
        {showBatchInput && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <textarea
              value={batchInput}
              onChange={(e) => setBatchInput(e.target.value)}
              placeholder="每行一个单号，或用逗号、分号分隔&#10;例如：&#10;SF1234567890&#10;YT1234567890&#10;ZTO1234567890"
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={addBatchTracking}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
              >
                批量添加
              </button>
              <button
                onClick={() => { setShowBatchInput(false); setBatchInput(''); }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200"
              >
                取消
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick 17Track link */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-center justify-between">
        <div>
          <h3 className="font-medium text-blue-900">前往第三方平台查询物流</h3>
          <p className="text-sm text-blue-700 mt-1">本站不保存真实物流轨迹，点击下方按钮前往 17TRACK 查询</p>
        </div>
        <a
          href="https://t.17track.net/zh-cn"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent.trackingClick17track()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2 text-sm"
        >
          <ExternalLink className="w-4 h-4" /> 前往 17TRACK
        </a>
      </div>

      {/* Message Toast */}
      {message.text && (
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm mb-4 ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Search & Filter */}
      {entries.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索单号、快递公司或备注..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm min-w-[120px]"
          >
            <option value="all">全部状态</option>
            <option value="pending">待查询</option>
            <option value="in-transit">运输中</option>
            <option value="delivered">已签收</option>
            <option value="exception">异常</option>
            <option value="unknown">未知</option>
          </select>
        </div>
      )}

      {/* Tracking list */}
      <div className="space-y-3">
        {filteredEntries.map((entry) => {
          const statusConfig = STATUS_CONFIG[entry.status];
          const StatusIcon = statusConfig.icon;
          return (
            <div
              key={entry.id}
              className="bg-white rounded-xl border p-4 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-3">
                {/* Copy button + number */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <button
                      onClick={() => copyNumber(entry.number, entry.id)}
                      className="font-mono text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors flex items-center gap-1.5"
                      title="点击复制"
                    >
                      {copiedId === entry.id ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                      {entry.number}
                    </button>
                    <span className={`px-2 py-0.5 text-xs rounded-md font-medium ${statusConfig.color}`}>
                      <StatusIcon className="w-3 h-3 inline mr-0.5" />
                      {statusConfig.label}
                    </span>
                  </div>

                  {/* Carrier + Note */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <select
                      value={entry.carrier}
                      onChange={(e) => updateEntry(entry.id, { carrier: e.target.value })}
                      className="px-2 py-1 border border-gray-200 rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {CARRIER_OPTIONS.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <input
                      value={entry.note}
                      onChange={(e) => updateEntry(entry.id, { note: e.target.value })}
                      placeholder="添加备注..."
                      className="px-2 py-1 border border-gray-200 rounded text-xs flex-1 min-w-[150px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <p className="text-xs text-gray-400 mt-2">
                    添加于 {new Date(entry.createdAt).toLocaleString('zh-CN')}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1 shrink-0">
                  <a
                    href={`https://t.17track.net/zh-cn#nums=${entry.number}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-gray-400 hover:text-blue-600 rounded transition-colors"
                    title="跳转第三方查询"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => copyNumber(entry.number, entry.id)}
                    className="p-1.5 text-gray-400 hover:text-green-600 rounded transition-colors"
                    title="复制单号"
                  >
                    {copiedId === entry.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => removeEntry(entry.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded transition-colors"
                    title="删除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Status update buttons */}
              <div className="flex gap-1 mt-3 pt-3 border-t border-gray-50">
                {(['pending', 'in-transit', 'delivered', 'exception'] as TrackingStatus[]).map(s => (
                  <button
                    key={s}
                    onClick={() => updateEntry(entry.id, { status: s })}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
                      entry.status === s
                        ? `${STATUS_CONFIG[s].color} font-medium`
                        : 'text-gray-400 hover:bg-gray-100'
                    }`}
                  >
                    {STATUS_CONFIG[s].label}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
        {filteredEntries.length === 0 && entries.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400">
            没有找到匹配的单号
          </div>
        )}
        {entries.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400">还没有单号，输入单号开始整理</p>
          </div>
        )}
      </div>

      {/* FAQ */}
      <div className="max-w-5xl mx-auto px-4 pb-16">
        <FAQSection title="物流单号管理常见问题" items={[
          {
            question: '本站可以查询物流轨迹吗？',
            answer: '本站为单号整理和状态备注工具，不提供物流轨迹查询服务。每条单号旁边都有「跳转查询」按钮，点击后会前往 17TRACK 等第三方平台查看真实物流信息。',
          },
          {
            question: '支持哪些快递公司？',
            answer: '本工具支持管理任意快递公司的单号。实际物流查询通过 17TRACK 平台进行，该平台支持中国大陆（顺丰、中通、圆通、韵达等）、国际快递（DHL、FedEx、UPS）等 1500+ 承运商。',
          },
          {
            question: '单号数据保存在哪里？',
            answer: '单号和备注信息保存在您浏览器的本地存储（localStorage）中，不会上传到任何服务器。清除浏览器数据会导致单号列表丢失，建议定期使用导出功能备份。',
          },
          {
            question: '如何批量添加单号？',
            answer: '点击「批量添加」按钮，在文本框中输入多个单号，每行一个或用逗号、分号分隔。点击「批量添加」即可一次性导入。',
          },
        ]} />

        {/* Tool-specific ads */}
        <AdSlot placement="tool-tracking-bottom" className="mt-8 mb-8" />
      </div>
    </div>
  );
}
