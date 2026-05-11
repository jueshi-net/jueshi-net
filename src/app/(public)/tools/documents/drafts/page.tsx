'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText, Trash2, Edit3, Calendar, Plus } from 'lucide-react';
import { getDrafts, deleteDraft, type DocumentDraft } from '@/lib/documents/storage';
import { getRoleInfo } from '@/lib/membership/permissions';
import { getDocumentType } from '@/lib/documents/document-types';

export default function DraftsPage() {
  const roleInfo = getRoleInfo();
  const [drafts, setDrafts] = useState<DocumentDraft[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setDrafts(getDrafts());
  }, []);

  const handleDelete = (id: string) => {
    if (confirm('确定删除此草稿？')) {
      deleteDraft(id);
      setDrafts(prev => prev.filter(d => d.id !== id));
    }
  };

  const handleClearAll = () => {
    if (confirm(`确定删除全部 ${drafts.length} 份草稿？此操作不可撤销。`)) {
      // Delete all via storage
      const { saveDrafts } = require('@/lib/documents/storage');
      saveDrafts([]);
      setDrafts([]);
    }
  };

  const types = [...new Set(drafts.map(d => d.type))];
  const filtered = drafts.filter(d => {
    if (filter !== 'all' && d.type !== filter) return false;
    if (searchTerm && !d.documentNo.toLowerCase().includes(searchTerm.toLowerCase()) && !d.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/tools/documents" className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> 返回
            </Link>
            <div>
              <h1 className="font-bold text-gray-900">我的草稿</h1>
              <p className="text-xs text-gray-400">已保存 {drafts.length} / {roleInfo.maxDrafts === 999 ? '∞' : roleInfo.maxDrafts} 份</p>
            </div>
          </div>
          <Link
            href="/tools/documents"
            className="flex items-center gap-1.5 px-3 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> 新建单据
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Filters */}
        {drafts.length > 0 && (
          <div className="bg-white rounded-xl border p-4 mb-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="搜索单据编号或名称..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-2 overflow-x-auto">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1.5 text-xs rounded-full whitespace-nowrap ${filter === 'all' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                >
                  全部 ({drafts.length})
                </button>
                {types.map(t => {
                  const docType = getDocumentType(t);
                  const count = drafts.filter(d => d.type === t).length;
                  return (
                    <button
                      key={t}
                      onClick={() => setFilter(t)}
                      className={`px-3 py-1.5 text-xs rounded-full whitespace-nowrap ${filter === t ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                    >
                      {docType?.titleZh || t} ({count})
                    </button>
                  );
                })}
              </div>
            </div>
            {drafts.length > 3 && (
              <button onClick={handleClearAll} className="mt-2 text-xs text-red-500 hover:text-red-700">
                🗑️ 清空全部草稿
              </button>
            )}
          </div>
        )}

        {/* Draft list */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border p-16 text-center">
            <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 mb-2">暂无草稿</p>
            <p className="text-xs text-gray-400 mb-4">填写单据并点击「保存草稿」后可在此查看</p>
            <Link href="/tools/documents" className="inline-flex items-center gap-1.5 px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-lg">
              <Plus className="w-4 h-4" /> 开始创建
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(draft => {
              const docType = getDocumentType(draft.type);
              const updated = new Date(draft.updatedAt);
              const dateStr = updated.toLocaleDateString('zh-CN');
              const timeStr = updated.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

              return (
                <div key={draft.id} className="bg-white rounded-xl border p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg bg-gray-100">
                        {docType?.icon || '📄'}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{draft.title}</h3>
                        <p className="text-xs text-gray-400">{docType?.titleEn || draft.type}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {dateStr} {timeStr}
                          </span>
                          {draft.documentNo && (
                            <span className="bg-gray-100 px-1.5 py-0.5 rounded">No. {draft.documentNo}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/tools/documents/${draft.type}`}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg"
                      >
                        <Edit3 className="w-3 h-3" /> 编辑
                      </Link>
                      <button
                        onClick={() => handleDelete(draft.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Storage hint */}
        <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4 text-center text-xs text-blue-600">
          草稿保存在浏览器本地存储中。清除浏览器数据会导致草稿丢失。建议重要单据导出后妥善保存。
        </div>
      </div>
    </div>
  );
}
