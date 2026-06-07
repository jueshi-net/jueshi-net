'use client';

import { useState, useEffect } from 'react';
import { Tag as TagIcon, Plus, Trash2, Loader2, Search } from 'lucide-react';

interface Tag {
  id: string;
  name: string;
  createdAt: string;
  _count?: { links: number };
}

export default function AdminTagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTag, setNewTag] = useState('');
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const fetchTags = async () => {
    const res = await fetch('/api/tags');
    const data = await res.json();
    setTags(data.tags || data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const createTag = async () => {
    if (!newTag.trim()) return;
    setSaving(true);
    await fetch('/api/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newTag.trim() }),
    });
    setNewTag('');
    fetchTags();
    setSaving(false);
  };

  const deleteTag = async (id: string) => {
    if (!confirm('确定删除？')) return;
    await fetch(`/api/tags?id=${id}`, { method: 'DELETE' });
    fetchTags();
  };

  const filtered = tags.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <TagIcon className="w-6 h-6" />
          标签管理
        </h1>
        <span className="text-sm text-gray-500">共 {tags.length} 个标签</span>
      </div>

      {/* 创建 */}
      <div className="bg-white rounded-lg shadow-sm border p-4 flex gap-3">
        <input
          type="text"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && createTag()}
          placeholder="输入新标签名称..."
          className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={createTag}
          disabled={saving || !newTag.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <Plus className="w-4 h-4 inline mr-1" /> 添加
        </button>
      </div>

      {/* 搜索 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索标签..."
          className="w-full pl-10 pr-4 py-2 border rounded-lg"
        />
      </div>

      {/* 列表 */}
      {loading ? (
        <div className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex flex-wrap gap-2">
            {filtered.map(tag => (
              <div
                key={tag.id}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full group"
              >
                <TagIcon className="w-3 h-3" />
                <span className="text-sm font-medium">{tag.name}</span>
                <span className="text-xs text-blue-400">{(tag as any)._count?.links || 0}</span>
                <button
                  onClick={() => deleteTag(tag.id)}
                  className="ml-1 p-0.5 text-blue-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
          {filtered.length === 0 && (
            <p className="text-center text-gray-500 py-8">
              {search ? '没有找到匹配的标签' : '暂无标签'}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
