'use client';

import { useState, useEffect } from 'react';
import { Mail, Send, Loader2, Plus, Eye, Trash2 } from 'lucide-react';

interface Broadcast {
  id: string;
  subject: string;
  content: string;
  sentCount: number;
  status: string;
  createdAt: string;
}

interface Subscriber {
  id: string;
  email: string;
  createdAt: string;
}

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [sending, setSending] = useState(false);

  const fetchData = async () => {
    const res = await fetch('/api/admin/newsletter');
    const data = await res.json();
    setSubscribers(data.subscribers || []);
    setBroadcasts(data.broadcasts || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSend = async (isTest: boolean) => {
    if (!subject || !content) return;
    setSending(true);
    const res = await fetch('/api/admin/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject,
        content,
        testEmail: isTest ? testEmail : undefined,
      }),
    });
    const data = await res.json();
    if (data.success) {
      setSubject('');
      setContent('');
      setShowForm(false);
      fetchData();
    }
    setSending(false);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Mail className="w-6 h-6" />
            邮件订阅广播
          </h1>
          <p className="text-gray-500 mt-1">管理订阅用户并发送新闻邮件</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          新建广播
        </button>
      </div>

      {/* 订阅者统计 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-600 font-medium">活跃订阅用户</p>
            <p className="text-3xl font-bold text-blue-900 mt-1">{subscribers.length}</p>
          </div>
          <Mail className="w-12 h-12 text-blue-200" />
        </div>
        <div className="mt-3 flex gap-2 flex-wrap">
          {subscribers.slice(0, 10).map(sub => (
            <span key={sub.id} className="px-2 py-1 bg-white/60 rounded text-xs text-gray-600">
              {sub.email}
            </span>
          ))}
          {subscribers.length > 10 && (
            <span className="px-2 py-1 bg-white/60 rounded text-xs text-gray-500">+{subscribers.length - 10} more</span>
          )}
        </div>
      </div>

      {/* 发送表单 */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border p-5 space-y-4">
          <h2 className="text-lg font-semibold">新建邮件广播</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">邮件主题</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="输入邮件主题..."
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">邮件内容 (支持 HTML)</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="输入邮件内容..."
              rows={6}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            />
          </div>
          <div className="flex items-center gap-3">
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="测试邮箱地址..."
              className="px-4 py-2 border rounded-lg text-sm flex-1"
            />
            <button
              onClick={() => handleSend(true)}
              disabled={sending || !subject || !content}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 text-sm"
            >
              <Eye className="w-4 h-4 inline mr-1" />
              发送测试
            </button>
            <button
              onClick={() => handleSend(false)}
              disabled={sending || !subject || !content}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin inline mr-1" /> : <Send className="w-4 h-4 inline mr-1" />}
              发送给全部 ({subscribers.length} 人)
            </button>
          </div>
        </div>
      )}

      {/* 广播历史 */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="px-5 py-4 border-b">
          <h2 className="text-lg font-semibold">广播历史</h2>
        </div>
        {broadcasts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">暂无广播记录</div>
        ) : (
          <div className="divide-y">
            {broadcasts.map(b => (
              <div key={b.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{b.subject}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    发送 {b.sentCount} 封 · {new Date(b.createdAt).toLocaleString('zh-CN')}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  b.status === 'sent' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {b.status === 'sent' ? '已发送' : '草稿'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
