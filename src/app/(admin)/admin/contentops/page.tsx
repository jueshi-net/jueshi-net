'use client';

import { useState, useEffect } from 'react';
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
} from 'lucide-react';

interface ContentDraft {
  id: string;
  title: string;
  slug: string;
  contentType: string;
  state: string;
  summary: string;
  version: number;
  qualityScore?: number;
  seoScore?: number;
  geoScore?: number;
  createdBy: string;
  updatedAt: string;
  targetEnvironment: string;
  publishedUrl?: string;
  publishError?: string;
}

const STATE_COLORS: Record<string, string> = {
  IDEA: 'bg-gray-100 text-gray-700',
  RESEARCHING: 'bg-blue-100 text-blue-700',
  DRAFTING: 'bg-indigo-100 text-indigo-700',
  DRAFT: 'bg-yellow-100 text-yellow-700',
  NEEDS_REVIEW: 'bg-orange-100 text-orange-700',
  CHANGES_REQUESTED: 'bg-red-100 text-red-700',
  APPROVED: 'bg-green-100 text-green-700',
  SCHEDULED: 'bg-purple-100 text-purple-700',
  PUBLISHING: 'bg-cyan-100 text-cyan-700',
  PUBLISHED: 'bg-emerald-100 text-emerald-700',
  FAILED: 'bg-red-100 text-red-700',
  UNPUBLISHED: 'bg-gray-100 text-gray-700',
  ROLLED_BACK: 'bg-gray-100 text-gray-700',
};

const STATE_LABELS: Record<string, string> = {
  IDEA: '选题',
  RESEARCHING: '调研中',
  DRAFTING: '撰写中',
  DRAFT: '草稿',
  NEEDS_REVIEW: '待审核',
  CHANGES_REQUESTED: '需修改',
  APPROVED: '已批准',
  SCHEDULED: '已排期',
  PUBLISHING: '发布中',
  PUBLISHED: '已发布',
  FAILED: '失败',
  UNPUBLISHED: '已下架',
  ROLLED_BACK: '已回滚',
};

export default function ContentOpsDashboard() {
  const [drafts, setDrafts] = useState<ContentDraft[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchDrafts();
  }, [filter]);

  async function fetchDrafts() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter) params.set('state', filter);
      params.set('limit', '50');
      
      const res = await fetch(`/api/admin/contentops/drafts?${params}`);
      const data = await res.json();
      
      setDrafts(data.drafts || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Failed to fetch drafts:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleTransition(id: string, toState: string) {
    try {
      const res = await fetch('/api/admin/contentops/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'transition', id, toState }),
      });
      
      if (res.ok) {
        fetchDrafts();
      } else {
        const data = await res.json();
        alert(data.error || '操作失败');
      }
    } catch (error) {
      console.error('Transition failed:', error);
    }
  }

  async function handlePublish(id: string) {
    try {
      const res = await fetch('/api/admin/contentops/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'publish', id, target: 'staging' }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        alert(`发布成功: ${data.url}`);
        fetchDrafts();
      } else {
        alert(data.error || '发布失败');
      }
    } catch (error) {
      console.error('Publish failed:', error);
    }
  }

  async function handleQualityCheck(id: string) {
    try {
      const res = await fetch('/api/admin/contentops/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'quality_check', id }),
      });
      
      const data = await res.json();
      
      if (data.passed) {
        alert(`质量检查通过\n分数: ${data.qualityCheck.score}\nSEO: ${data.qualityCheck.seoScore}\nGEO: ${data.qualityCheck.geoScore}`);
      } else {
        alert(`质量检查未通过\n问题:\n${data.qualityCheck.issues.join('\n')}`);
      }
      
      fetchDrafts();
    } catch (error) {
      console.error('Quality check failed:', error);
    }
  }

  const filteredDrafts = drafts.filter(d => 
    !search || d.title.toLowerCase().includes(search.toLowerCase())
  );

  // Stats
  const stats = {
    total: total,
    draft: drafts.filter(d => d.state === 'DRAFT').length,
    needsReview: drafts.filter(d => d.state === 'NEEDS_REVIEW').length,
    approved: drafts.filter(d => d.state === 'APPROVED').length,
    published: drafts.filter(d => d.state === 'PUBLISHED').length,
    failed: drafts.filter(d => d.state === 'FAILED').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">ContentOps 发布中心</h1>
          <p className="text-gray-600 mt-1">管理内容草稿、审核和发布</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <StatCard label="全部" value={stats.total} icon={<FileText className="w-5 h-5" />} />
          <StatCard label="草稿" value={stats.draft} icon={<Edit className="w-5 h-5" />} color="yellow" />
          <StatCard label="待审核" value={stats.needsReview} icon={<Clock className="w-5 h-5" />} color="orange" />
          <StatCard label="已批准" value={stats.approved} icon={<CheckCircle className="w-5 h-5" />} color="green" />
          <StatCard label="已发布" value={stats.published} icon={<CheckCircle className="w-5 h-5" />} color="emerald" />
          <StatCard label="失败" value={stats.failed} icon={<AlertCircle className="w-5 h-5" />} color="red" />
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索标题..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">全部状态</option>
              {Object.entries(STATE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <button
              onClick={fetchDrafts}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              刷新
            </button>
          </div>
        </div>

        {/* Drafts Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">加载中...</div>
          ) : filteredDrafts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">暂无草稿</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">标题</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">类型</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">版本</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">质量</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SEO</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">更新时间</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDrafts.map((draft) => (
                  <tr key={draft.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 truncate max-w-xs">{draft.title}</div>
                      <div className="text-xs text-gray-500 truncate max-w-xs">{draft.slug}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">{draft.contentType}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${STATE_COLORS[draft.state] || 'bg-gray-100'}`}>
                        {STATE_LABELS[draft.state] || draft.state}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">v{draft.version}</td>
                    <td className="px-4 py-3">
                      <ScoreBadge score={draft.qualityScore} />
                    </td>
                    <td className="px-4 py-3">
                      <ScoreBadge score={draft.seoScore} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(draft.updatedAt).toLocaleDateString('zh-CN')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleQualityCheck(draft.id)}
                          className="p-1 text-gray-400 hover:text-blue-600"
                          title="质量检查"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        {draft.state === 'DRAFT' && (
                          <button
                            onClick={() => handleTransition(draft.id, 'NEEDS_REVIEW')}
                            className="p-1 text-gray-400 hover:text-orange-600"
                            title="提交审核"
                          >
                            <Clock className="w-4 h-4" />
                          </button>
                        )}
                        {draft.state === 'NEEDS_REVIEW' && (
                          <button
                            onClick={() => handleTransition(draft.id, 'APPROVED')}
                            className="p-1 text-gray-400 hover:text-green-600"
                            title="批准"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {draft.state === 'APPROVED' && (
                          <button
                            onClick={() => handlePublish(draft.id)}
                            className="p-1 text-gray-400 hover:text-emerald-600"
                            title="发布到 staging"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {draft.publishedUrl && (
                          <a
                            href={draft.publishedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-gray-400 hover:text-blue-600"
                            title="查看已发布页面"
                          >
                            <Eye className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color = 'gray' }: { 
  label: string; 
  value: number; 
  icon: React.ReactNode;
  color?: string;
}) {
  const colorClasses: Record<string, string> = {
    gray: 'bg-gray-100 text-gray-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    orange: 'bg-orange-100 text-orange-600',
    green: 'bg-green-100 text-green-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    red: 'bg-red-100 text-red-600',
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{label}</div>
        </div>
      </div>
    </div>
  );
}

function ScoreBadge({ score }: { score?: number }) {
  if (score === undefined) return <span className="text-gray-400">-</span>;
  
  let color = 'text-red-600';
  if (score >= 80) color = 'text-green-600';
  else if (score >= 60) color = 'text-yellow-600';
  
  return <span className={`font-medium ${color}`}>{score}</span>;
}
