"use client";
import { useEffect, useState } from "react";
import { Link as LinkIcon, Copy, Trash2, Plus, ExternalLink, QrCode } from "lucide-react";

export default function AdminShortLinksPage() {
  const [shortLinks, setShortLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [targetUrl, setTargetUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchShortLinks();
  }, []);

  const fetchShortLinks = async () => {
    const res = await fetch("/api/short-links");
    const data = await res.json();
    setShortLinks(data.shortLinks || []);
    setLoading(false);
  };

  const createShortLink = async () => {
    if (!targetUrl.trim()) return;
    const res = await fetch("/api/short-links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUrl, code: customCode || undefined })
    });
    if (res.ok) {
      setTargetUrl("");
      setCustomCode("");
      setShowForm(false);
      fetchShortLinks();
    }
  };

  const deleteShortLink = async (id: string) => {
    if (!confirm("确定删除？")) return;
    await fetch(`/api/short-links?id=${id}`, { method: "DELETE" });
    fetchShortLinks();
  };

  const copyToClipboard = (code: string) => {
    const url = `${window.location.origin}/s/${code}`;
    navigator.clipboard.writeText(url);
    setCopiedId(code);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) return <div className="flex items-center justify-center h-64">加载中...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <LinkIcon className="w-6 h-6" />
          短链管理
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          创建短链
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex flex-col gap-3">
            <input
              type="text"
              value={targetUrl}
              onChange={e => setTargetUrl(e.target.value)}
              placeholder="目标链接 (https://...)"
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
            <div className="flex gap-3">
              <input
                type="text"
                value={customCode}
                onChange={e => setCustomCode(e.target.value)}
                placeholder="自定义短链码 (留空自动生成)"
                className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
              <button onClick={createShortLink} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                创建
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500">短链码</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">目标链接</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">点击</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">状态</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">创建时间</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
            {shortLinks.map(sl => (
              <tr key={sl.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-4 py-3">
                  <code className="text-blue-600 dark:text-blue-400 font-mono">{sl.code}</code>
                </td>
                <td className="px-4 py-3 max-w-xs truncate text-gray-500 text-xs">{sl.targetUrl}</td>
                <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">{sl.clicks}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    sl.active ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"
                  }`}>
                    {sl.active ? "活跃" : "禁用"}
                  </span>
                  {sl.expiresAt && new Date(sl.expiresAt) < new Date() && (
                    <span className="px-2 py-0.5 rounded text-xs bg-red-50 text-red-600 ml-1">已过期</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{new Date(sl.createdAt).toLocaleDateString("zh-CN")}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(sl.code)}
                      className="text-gray-400 hover:text-blue-600"
                      title="复制链接"
                    >
                      {copiedId === sl.code ? "已复制" : <Copy className="w-4 h-4" />}
                    </button>
                    <a
                      href={`/s/${sl.code}`}
                      target="_blank"
                      className="text-gray-400 hover:text-green-600"
                      title="访问"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => deleteShortLink(sl.id)}
                      className="text-gray-400 hover:text-red-600"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {shortLinks.length === 0 && (
          <div className="p-8 text-center text-gray-400">暂无短链</div>
        )}
      </div>
    </div>
  );
}
