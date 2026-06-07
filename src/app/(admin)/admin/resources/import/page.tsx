'use client';

import { useState, useCallback } from 'react';
import {
  Upload, FileJson, CheckCircle, XCircle, Loader2,
  ArrowRight, BookOpen, Sparkles, AlertTriangle, ExternalLink, ClipboardPaste,
} from 'lucide-react';

export default function ResourceImportPage() {
  const [jsonText, setJsonText] = useState('');
  const [createTopic, setCreateTopic] = useState(false);
  const [topicName, setTopicName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    imported: number;
    skipped: number;
    errors: Array<{ name: string; url: string; error: string }>;
    topicId: string | null;
    details: { created: number; updated: number };
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [parsePreview, setParsePreview] = useState<{ count: number; items: any[] } | null>(null);

  const handleParseJson = useCallback(() => {
    setError(null);
    setParsePreview(null);
    try {
      const parsed = JSON.parse(jsonText);
      const items = Array.isArray(parsed) ? parsed : parsed.resources;
      if (!Array.isArray(items) || items.length === 0) {
        setError('JSON 必须是一个包含至少一条资源的数组');
        return;
      }
      const valid = items.filter(r => r.name && r.url).length;
      const empty = items.length - valid;
      setParsePreview({
        count: items.length,
        items: items.slice(0, 5),
      });
      if (empty > 0) {
        setError(`警告：${empty} 条数据缺少 name 或 url，将被跳过`);
      }
    } catch {
      setError('JSON 格式错误，请检查语法（逗号、引号、括号匹配）');
    }
  }, [jsonText]);

  const handleImport = async () => {
    setError(null);
    setResult(null);

    let resources: any[];
    try {
      const parsed = JSON.parse(jsonText);
      resources = Array.isArray(parsed) ? parsed : parsed.resources;
      if (!Array.isArray(resources) || resources.length === 0) {
        setError('JSON 必须是一个包含至少一条资源的数组');
        return;
      }
    } catch {
      setError('JSON 格式错误');
      return;
    }

    setLoading(true);

    const body: any = { resources };
    if (createTopic && topicName.trim()) {
      body.createTopic = true;
      body.topicName = topicName.trim();
    }

    try {
      const res = await fetch('/api/admin/resources/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || `请求失败 (${res.status})`);
        return;
      }

      setResult(data);
    } catch {
      setError('请求失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setJsonText('');
    setCreateTopic(false);
    setTopicName('');
    setResult(null);
    setError(null);
    setParsePreview(null);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setJsonText(text);
    } catch {
      setError('无法读取剪贴板内容');
    }
  };

  const validCategories = ['life', 'logistics', 'business', 'templates'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-5 text-white">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-white/10 rounded-lg">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold flex items-center gap-2">
              资源批量导入
            </h1>
            <p className="text-sm text-emerald-100 mt-1">
              粘贴爬虫生成的 JSON 数组，一键导入资源库。支持自动生成专题（Topic）草稿。
            </p>
          </div>
        </div>
      </div>

      {/* JSON Input */}
      <div className="bg-white rounded-xl shadow-sm border p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileJson className="w-5 h-5 text-emerald-600" />
            JSON 数据
          </h2>
          <div className="flex gap-2">
            <button
              onClick={handlePaste}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors min-h-[36px]"
            >
              <ClipboardPaste className="w-4 h-4" />
              粘贴
            </button>
            <button
              onClick={handleParseJson}
              disabled={!jsonText.trim()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors min-h-[36px]"
            >
              预览解析
            </button>
          </div>
        </div>

        <textarea
          value={jsonText}
          onChange={(e) => { setJsonText(e.target.value); setParsePreview(null); setError(null); }}
          placeholder={`[
  {
    "name": "Amazon",
    "url": "https://www.amazon.com",
    "description": "全球最大的电商平台",
    "category": "business",
    "tags": ["电商", "购物"],
    "sourceType": "official"
  }
]`}
          rows={12}
          className="w-full px-4 py-3 border rounded-lg font-mono text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all resize-y"
        />

        {/* Parse Preview */}
        {parsePreview && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-900 mb-2">
              解析成功：共 {parsePreview.count} 条数据
            </p>
            <div className="space-y-1">
              {parsePreview.items.map((item: any, i: number) => (
                <div key={i} className="flex items-center gap-2 text-sm text-blue-800">
                  <span className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </span>
                  <span className="font-medium">{item.name}</span>
                  <span className="text-blue-400 truncate max-w-[300px]">{item.url}</span>
                  {item.category && (
                    <span className={`px-1.5 py-0.5 text-xs rounded ${
                      validCategories.includes(item.category)
                        ? 'bg-blue-200 text-blue-800'
                        : 'bg-yellow-200 text-yellow-800'
                    }`}>
                      {item.category}
                    </span>
                  )}
                </div>
              ))}
              {parsePreview.count > 5 && (
                <p className="text-xs text-blue-500 mt-1">... 还有 {parsePreview.count - 5} 条</p>
              )}
            </div>
          </div>
        )}

        {/* Error */}
        {error && !result && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-sm text-amber-700">{error}</p>
          </div>
        )}
      </div>

      {/* Topic Options */}
      <div className="bg-white rounded-xl shadow-sm border p-5 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          专题生成选项
        </h2>

        <label className="flex items-center gap-3 cursor-pointer select-none">
          <div className="relative">
            <input
              type="checkbox"
              checked={createTopic}
              onChange={(e) => setCreateTopic(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
          </div>
          <div>
            <span className="text-sm font-medium text-gray-700">自动生成"场景资源包"（Topic）</span>
            <p className="text-xs text-gray-500">导入完成后自动创建一个草稿专题，包含所有导入的资源</p>
          </div>
        </label>

        {createTopic && (
          <div className="ml-14 space-y-2 animate-in fade-in">
            <label className="block text-sm font-medium text-gray-700">
              专题名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={topicName}
              onChange={(e) => setTopicName(e.target.value)}
              placeholder="如：东南亚 TikTok 小店工具包"
              className="w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
            />
            <p className="text-xs text-gray-400">
              专题将创建为草稿状态，可在 /admin/topics 中编辑后发布
            </p>
          </div>
        )}
      </div>

      {/* Import Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleImport}
          disabled={loading || !jsonText.trim()}
          className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl text-base font-bold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[48px]"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              正在批量导入...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              开始批量导入
            </>
          )}
        </button>
        {(result || jsonText) && (
          <button
            onClick={handleReset}
            className="px-5 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors min-h-[48px]"
          >
            重置
          </button>
        )}
      </div>

      {/* Result */}
      {result && (
        <div className="bg-white rounded-xl shadow-sm border p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            导入结果
          </h2>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-3xl font-extrabold text-green-600">{result.imported}</p>
              <p className="text-xs text-gray-500 mt-1">处理成功</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-3xl font-extrabold text-blue-600">{result.details?.created || 0}</p>
              <p className="text-xs text-gray-500 mt-1">新增</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <p className="text-3xl font-extrabold text-purple-600">{result.details?.updated || 0}</p>
              <p className="text-xs text-gray-500 mt-1">更新</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-3xl font-extrabold text-gray-500">{result.skipped}</p>
              <p className="text-xs text-gray-500 mt-1">跳过</p>
            </div>
          </div>

          {/* Topic Created */}
          {result.topicId && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <BookOpen className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-900">
                    ✅ 专题已自动生成
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    专题 ID: <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono">{result.topicId}</code>
                  </p>
                  <p className="text-xs text-amber-600 mt-1">
                    状态：草稿（需在专题管理中编辑并发布）
                  </p>
                  <a
                    href="/admin/topics"
                    className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
                  >
                    前往专题管理
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Errors */}
          {result.errors && result.errors.length > 0 && (
            <div>
              <p className="text-sm font-medium text-red-600 flex items-center gap-1 mb-2">
                <XCircle className="w-4 h-4" />
                错误详情（{result.errors.length} 条）
              </p>
              <div className="bg-red-50 rounded-lg p-3 max-h-40 overflow-y-auto space-y-1">
                {result.errors.slice(0, 20).map((err, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-red-700">
                    <span className="text-red-400 mt-0.5 shrink-0">•</span>
                    <span>
                      <strong>{err.name}</strong>{err.url && ` (${err.url})`}：{err.error}
                    </span>
                  </div>
                ))}
                {result.errors.length > 20 && (
                  <p className="text-xs text-red-500 mt-1">... 还有 {result.errors.length - 20} 条错误</p>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2 border-t">
            <a
              href="/admin/resources"
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              返回资源管理
            </a>
            {result.topicId && (
              <a
                href={`/admin/topics`}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium transition-colors"
              >
                查看生成的专题
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            <button
              onClick={handleReset}
              className="ml-auto inline-flex items-center gap-1.5 px-4 py-2 text-gray-600 hover:text-gray-800 text-sm"
            >
              继续导入
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
