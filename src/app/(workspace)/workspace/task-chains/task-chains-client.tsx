'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Package, Plus, Archive, Trash2, Play, Loader2, Clock,
  CheckCircle, AlertCircle, ChevronRight, ExternalLink,
  FileText, MapPin, Calculator, Shield,
} from 'lucide-react';
import { WorkspacePageHeader } from '@/components/saas/WorkspacePageHeader';
import { SectionCard } from '@/components/saas/SectionCard';
import { MetricCard } from '@/components/saas/MetricCard';
import { StatusBadge } from '@/components/saas/StatusBadge';

interface TaskChainDraft {
  id: string;
  title: string;
  status: string;
  sourceTool: string;
  lastActiveTool: string | null;
  currentStep: number;
  completedSteps: number[];
  context: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

const STEP_LABELS = [
  '商品信息', 'HS编码', '合规检查', 'CBM/重量',
  '目的地址', '商业发票', '装箱单', '汇率成本',
  '报价模板', '完成',
];

const STATUS_CONFIG: Record<string, { label: string; variant: 'info' | 'success' | 'warning' | 'processing' }> = {
  active: { label: '进行中', variant: 'processing' },
  completed: { label: '已完成', variant: 'success' },
  archived: { label: '已归档', variant: 'info' },
};

export default function TaskChainsClient() {
  const [taskChains, setTaskChains] = useState<TaskChainDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'archived'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchTaskChains();
  }, []);

  const fetchTaskChains = async () => {
    try {
      const res = await fetch('/api/task-chains');
      if (res.status === 401) {
        window.location.href = '/login?callbackUrl=/workspace/task-chains';
        return;
      }
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setTaskChains(data.data || []);
    } catch {
      setError('加载任务链失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async (id: string) => {
    try {
      const res = await fetch(`/api/task-chains/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'archived' }),
      });
      if (res.ok) {
        setTaskChains(prev => prev.map(tc => tc.id === id ? { ...tc, status: 'archived' } : tc));
      }
    } catch (err) {
      console.error('Failed to archive:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个任务链吗？此操作不可恢复。')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/task-chains/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTaskChains(prev => prev.filter(tc => tc.id !== id));
      }
    } catch {
      alert('删除失败');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredChains = filter === 'all'
    ? taskChains
    : taskChains.filter(tc => tc.status === filter);

  const activeCount = taskChains.filter(tc => tc.status === 'active').length;
  const completedCount = taskChains.filter(tc => tc.status === 'completed').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <WorkspacePageHeader
        title="任务链"
        subtitle="跨境发货全流程任务管理"
        icon={<Package className="w-5 h-5" />}
        breadcrumbs={[
          { label: '工作台', href: '/workspace' },
          { label: '任务链' },
        ]}
        actions={
          <Link
            href="/workspace/task-chains/shipping/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> 新建发货任务
          </Link>
        }
        tabs={[
          { label: `全部 (${taskChains.length})`, active: filter === 'all', onClick: () => setFilter('all') },
          { label: `进行中 (${activeCount})`, active: filter === 'active', onClick: () => setFilter('active') },
          { label: `已完成 (${completedCount})`, active: filter === 'completed', onClick: () => setFilter('completed') },
          { label: '已归档', active: filter === 'archived', onClick: () => setFilter('archived') },
        ]}
      />

      <div className="px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MetricCard
            label="总任务数"
            value={taskChains.length}
            icon={<Package className="w-5 h-5" />}
          />
          <MetricCard
            label="进行中"
            value={activeCount}
            icon={<Play className="w-5 h-5" />}
            trend={activeCount > 0 ? { value: '进行中', positive: true } : undefined}
          />
          <MetricCard
            label="已完成"
            value={completedCount}
            icon={<CheckCircle className="w-5 h-5" />}
          />
          <MetricCard
            label="待处理"
            value={taskChains.filter(tc => tc.status === 'active' && tc.completedSteps.length < 10).length}
            icon={<AlertCircle className="w-5 h-5" />}
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            {error}
            <button onClick={fetchTaskChains} className="ml-2 underline font-medium">重试</button>
          </div>
        )}

        {/* Task Chain List */}
        {filteredChains.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-gray-600 font-medium mb-1">
              {filter === 'all' ? '暂无任务链' : `暂无${STATUS_CONFIG[filter]?.label || ''}任务`}
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              创建一个新的发货任务，开始跨境贸易流程
            </p>
            <Link
              href="/workspace/task-chains/shipping/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
            >
              <Plus className="w-4 h-4" /> 新建发货任务
            </Link>
          </div>
        ) : (
          <SectionCard title={`${filter === 'all' ? '全部任务' : STATUS_CONFIG[filter]?.label || ''} (${filteredChains.length})`}>
            <div className="space-y-3">
              {filteredChains.map((tc) => {
                const statusCfg = STATUS_CONFIG[tc.status] || STATUS_CONFIG.active;
                const progress = tc.completedSteps.length;
                const progressPercent = Math.round((progress / 10) * 100);

                return (
                  <div
                    key={tc.id}
                    className="border border-gray-100 rounded-xl p-4 hover:border-teal-200 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start gap-4">
                      {/* Step Progress Indicator */}
                      <div className="hidden sm:flex flex-col items-center gap-1 min-w-[60px]">
                        <div className="relative w-12 h-12 rounded-full border-3 border-gray-100 flex items-center justify-center">
                          <svg className="absolute inset-0 w-12 h-12 -rotate-90">
                            <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="3" className="text-gray-100" />
                            <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="3"
                              className="text-teal-500"
                              strokeDasharray={`${progressPercent * 1.256} 125.6`}
                              strokeLinecap="round"
                            />
                          </svg>
                          <span className="text-xs font-bold text-gray-700">{progress}/10</span>
                        </div>
                        <span className="text-[10px] text-gray-400">步骤</span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">{tc.title}</h3>
                          <StatusBadge label={statusCfg.label} variant={statusCfg.variant} size="sm" dot />
                        </div>

                        {/* Step Progress Bar */}
                        <div className="flex items-center gap-0.5 mb-2">
                          {STEP_LABELS.map((label, idx) => {
                            const isCompleted = tc.completedSteps.includes(idx);
                            const isCurrent = tc.currentStep === idx;
                            return (
                              <div
                                key={idx}
                                className={`h-1.5 flex-1 rounded-full ${
                                  isCompleted ? 'bg-teal-500' : isCurrent ? 'bg-teal-200' : 'bg-gray-100'
                                }`}
                                title={`${idx + 1}. ${label}${isCompleted ? ' ✓' : ''}`}
                              />
                            );
                          })}
                        </div>

                        {/* Meta info */}
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(tc.updatedAt).toLocaleDateString('zh-CN')}
                          </span>
                          {tc.lastActiveTool && (
                            <span className="flex items-center gap-1">
                              <ExternalLink className="w-3 h-3" />
                              {tc.lastActiveTool}
                            </span>
                          )}
                          {tc.context?.productName && (
                            <span className="truncate max-w-[150px]">
                              商品: {tc.context.productName}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {tc.status === 'active' && (
                          <Link
                            href={`/workspace/task-chains/shipping/${tc.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors shadow-sm"
                          >
                            <Play className="w-3 h-3" /> 继续
                          </Link>
                        )}
                        {tc.status === 'completed' && (
                          <Link
                            href={`/workspace/task-chains/shipping/${tc.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-teal-700 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
                          >
                            <ChevronRight className="w-3 h-3" /> 查看
                          </Link>
                        )}
                        {tc.status === 'active' && (
                          <button
                            onClick={() => handleArchive(tc.id)}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="归档"
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(tc.id)}
                          disabled={deletingId === tc.id}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 transition-colors"
                          title="删除"
                        >
                          {deletingId === tc.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        )}

        {/* Help Section */}
        <SectionCard title="关于任务链" subtitle="跨境发货全流程指引">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="rounded-lg bg-blue-50 border border-blue-100 p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
                <span className="font-semibold text-blue-800 text-sm">商品信息</span>
              </div>
              <p className="text-xs text-blue-700">录入商品名称、品牌、材质、用途等基础信息</p>
            </div>
            <div className="rounded-lg bg-purple-50 border border-purple-100 p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-purple-600" />
                </div>
                <span className="font-semibold text-purple-800 text-sm">合规检查</span>
              </div>
              <p className="text-xs text-purple-700">HS编码、敏感货物检查、认证要求</p>
            </div>
            <div className="rounded-lg bg-amber-50 border border-amber-100 p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Calculator className="w-4 h-4 text-amber-600" />
                </div>
                <span className="font-semibold text-amber-800 text-sm">成本估算</span>
              </div>
              <p className="text-xs text-amber-700">CBM计算、汇率换算、运费估算</p>
            </div>
            <div className="rounded-lg bg-green-50 border border-green-100 p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-green-600" />
                </div>
                <span className="font-semibold text-green-800 text-sm">单据生成</span>
              </div>
              <p className="text-xs text-green-700">商业发票、装箱单、报价模板一键生成</p>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
