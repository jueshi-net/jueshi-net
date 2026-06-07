'use client';

import { useState, useEffect } from 'react';
import { Webhook, Plus, Trash2, Eye, Loader2, Copy, CheckCircle } from 'lucide-react';

interface WebhookData {
  id: string;
  url: string;
  events: string;
  secret: string | null;
  isActive: boolean;
  lastTriggered: string | null;
  createdAt: string;
}

const EVENT_OPTIONS = [
  'link.created', 'link.updated', 'link.deleted',
  'user.registered', 'user.login',
  'feedback.submitted', 'feedback.resolved',
  'subscription.created', 'subscription.cancelled',
];

export default function AdminWebhookPage() {
  const [webhooks, setWebhooks] = useState<WebhookData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    url: '',
    events: [] as string[],
    secret: '',
  });
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchWebhooks = async () => {
    const res = await fetch('/api/webhooks');
    const data = await res.json();
    setWebhooks(data.webhooks || data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const handleSave = async () => {
    if (!formData.url || formData.events.length === 0) return;
    setSaving(true);
    const res = await fetch('/api/webhooks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: formData.url,
        events: formData.events.join(','),
        secret: formData.secret || undefined,
      }),
    });
    if (res.ok) {
      setFormData({ url: '', events: [], secret: '' });
      setShowForm(false);
      fetchWebhooks();
    }
    setSaving(false);
  };

  const toggleWebhook = async (id: string, currentStatus: boolean) => {
    await fetch(`/api/webhooks?id=${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !currentStatus }),
    });
    fetchWebhooks();
  };

  const deleteWebhook = async (id: string) => {
    if (!confirm('确定删除此 Webhook？')) return;
    await fetch(`/api/webhooks?id=${id}`, { method: 'DELETE' });
    fetchWebhooks();
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleEvent = (event: string) => {
    setFormData(prev => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter(e => e !== event)
        : [...prev.events, event],
    }));
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Webhook className="w-6 h-6" />
            Webhook 管理
          </h1>
          <p className="text-gray-500 mt-1">配置外部系统事件推送</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          新建 Webhook
        </button>
      </div>

      {/* 创建表单 */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border p-5 space-y-4">
          <h2 className="text-lg font-semibold">新建 Webhook</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">推送地址 URL</label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://example.com/webhook"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">订阅事件</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {EVENT_OPTIONS.map(event => (
                <label
                  key={event}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                    formData.events.includes(event)
                      ? 'bg-blue-50 border-blue-300'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.events.includes(event)}
                    onChange={() => toggleEvent(event)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-mono">{event}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">签名密钥 (可选)</label>
            <input
              type="text"
              value={formData.secret}
              onChange={(e) => setFormData({ ...formData, secret: e.target.value })}
              placeholder="用于验证请求签名"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !formData.url || formData.events.length === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin inline mr-1" /> : <Plus className="w-4 h-4 inline mr-1" />}
              创建
            </button>
          </div>
        </div>
      )}

      {/* Webhook 列表 */}
      {loading ? (
        <div className="p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
        </div>
      ) : webhooks.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border p-12 text-center text-gray-500">
          <Webhook className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>暂无 Webhook 配置</p>
        </div>
      ) : (
        <div className="space-y-3">
          {webhooks.map(wh => (
            <div key={wh.id} className="bg-white rounded-xl shadow-sm border p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`w-2 h-2 rounded-full ${wh.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="font-mono text-sm text-gray-700 break-all">{wh.url}</span>
                    <button
                      onClick={() => copyToClipboard(wh.url, wh.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {copiedId === wh.id ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {wh.events.split(',').filter(Boolean).map(event => (
                      <span key={event} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-mono">
                        {event}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-4 mt-2 text-xs text-gray-500">
                    <span>创建 {new Date(wh.createdAt).toLocaleDateString('zh-CN')}</span>
                    {wh.lastTriggered && <span>最后触发 {new Date(wh.lastTriggered).toLocaleString('zh-CN')}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-4">
                  <label className="relative inline-flex items-center cursor-pointer mr-2">
                    <input
                      type="checkbox"
                      checked={wh.isActive}
                      onChange={() => toggleWebhook(wh.id, wh.isActive)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
                  </label>
                  <button
                    onClick={() => deleteWebhook(wh.id)}
                    className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
