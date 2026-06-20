'use client';

import { useState, useEffect } from 'react';
import { Gift, CheckCircle, XCircle, AlertCircle, Clock, RefreshCw } from 'lucide-react';
import { WorkspacePageHeader } from '@/components/saas/WorkspacePageHeader';
import { SectionCard } from '@/components/saas/SectionCard';
import { StatusBadge } from '@/components/saas/StatusBadge';
import { MetricCard } from '@/components/saas/MetricCard';
import { SaasEmptyState } from '@/components/saas/SaasEmptyState';

interface RewardGrant {
  id: string;
  userId: string;
  inviteRedemptionId: string | null;
  rewardRuleId: string;
  rewardType: string;
  rewardValue: number;
  rewardMetadata: any;
  status: string;
  grantedAt: string | null;
  expiresAt: string | null;
  failureReason: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  inviteRedemption: {
    id: string;
    inviterUserId: string;
    inviteeUserId: string;
  } | null;
  rewardRule: {
    id: string;
    name: string;
  };
}

const STATUS_CONFIG: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'neutral' | 'pending' }> = {
  PENDING: { label: '待发放', variant: 'warning' },
  GRANTED: { label: '已发放', variant: 'success' },
  FAILED: { label: '失败', variant: 'danger' },
  REVOKED: { label: '已撤销', variant: 'neutral' },
};

const REWARD_TYPE_LABELS: Record<string, string> = {
  MEMBER_DAYS: '会员天数',
  AD_SLOT_DAYS: '广告位天数',
  POINTS: '积分',
  GROWTH: '成长值',
  BADGE: '勋章',
  CUSTOM_ENTITLEMENT: '自定义权益',
};

export default function AdminRewardGrantsPage() {
  const [grants, setGrants] = useState<RewardGrant[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('');
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
  });

  useEffect(() => {
    fetchGrants();
  }, [filter, pagination.page]);

  const fetchGrants = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        pageSize: pagination.pageSize.toString(),
      });
      if (filter) params.set('status', filter);

      const res = await fetch(`/api/admin/reward-grants?${params}`);
      const data = await res.json();
      if (data.success) {
        setGrants(data.grants);
        setPagination(prev => ({
          ...prev,
          total: data.total,
        }));
      }
    } catch (error) {
      console.error('Failed to fetch grants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async (id: string) => {
    if (!confirm('确定重试此发放？')) return;

    setRetryingId(id);
    try {
      const res = await fetch(`/api/admin/reward-grants/${id}/retry`, {
        method: 'POST',
      });

      const data = await res.json();
      if (data.success) {
        alert('重试成功');
        fetchGrants();
      } else {
        alert(data.error || '重试失败');
      }
    } catch (error) {
      console.error('Failed to retry:', error);
      alert('重试失败');
    } finally {
      setRetryingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <WorkspacePageHeader
        title="奖励发放记录"
        subtitle="查看所有奖励发放记录"
        icon={<Gift className="w-5 h-5" />}
        breadcrumbs={[
          { label: '管理后台', href: '/admin' },
          { label: '邀请管理', href: '/admin/invites' },
          { label: '奖励规则', href: '/admin/invites/rewards' },
          { label: '发放记录' },
        ]}
        actions={
          <select
            value={filter}
            onChange={e => {
              setFilter(e.target.value);
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-colors"
          >
            <option value="">全部状态</option>
            <option value="PENDING">待发放</option>
            <option value="GRANTED">已发放</option>
            <option value="FAILED">失败</option>
            <option value="REVOKED">已撤销</option>
          </select>
        }
      />

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            label="总记录"
            value={pagination.total}
            icon={<Gift className="w-5 h-5" />}
          />
          <MetricCard
            label="已发放"
            value={grants.filter(g => g.status === 'GRANTED').length}
            icon={<CheckCircle className="w-5 h-5" />}
          />
          <MetricCard
            label="待发放"
            value={grants.filter(g => g.status === 'PENDING').length}
            icon={<Clock className="w-5 h-5" />}
          />
          <MetricCard
            label="失败"
            value={grants.filter(g => g.status === 'FAILED').length}
            icon={<XCircle className="w-5 h-5" />}
          />
        </div>

        {/* Grants List */}
        {loading ? (
          <div className="text-center text-gray-400 py-12">加载中...</div>
        ) : grants.length === 0 ? (
          <SaasEmptyState
            variant="no-data"
            title="还没有奖励发放记录"
            description="当用户成功邀请好友注册后，奖励发放记录会显示在这里"
            icon={<Gift className="w-12 h-12" />}
          />
        ) : (
          <SectionCard title="发放记录列表">
            <div className="space-y-4">
              {grants.map(grant => {
                const statusConfig = STATUS_CONFIG[grant.status] || STATUS_CONFIG.PENDING;

                return (
                  <div key={grant.id} className="flex items-start justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 transition-all">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <StatusBadge
                          label={statusConfig.label}
                          variant={statusConfig.variant}
                          dot
                        />
                        <span className="text-sm font-medium text-gray-900">
                          {grant.user.name || grant.user.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>规则: <span className="text-gray-700 font-medium">{grant.rewardRule.name}</span></span>
                        <span>类型: <span className="text-gray-700">{REWARD_TYPE_LABELS[grant.rewardType] || grant.rewardType}</span></span>
                        <span className="font-bold text-gray-900">{grant.rewardValue}</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-2">
                        创建时间: {new Date(grant.createdAt).toLocaleString('zh-CN')}
                        {grant.grantedAt && (
                          <span className="ml-4">发放时间: {new Date(grant.grantedAt).toLocaleString('zh-CN')}</span>
                        )}
                        {grant.expiresAt && (
                          <span className="ml-4">过期时间: {new Date(grant.expiresAt).toLocaleString('zh-CN')}</span>
                        )}
                      </div>
                      {grant.failureReason && (
                        <div className="text-xs text-red-600 mt-2 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          失败原因: {grant.failureReason}
                        </div>
                      )}
                    </div>
                    {grant.status === 'FAILED' && (
                      <button
                        onClick={() => handleRetry(grant.id)}
                        disabled={retryingId === grant.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg text-xs font-medium hover:bg-teal-100 transition-colors disabled:opacity-50 border border-teal-200"
                      >
                        {retryingId === grant.id ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            重试中...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-3.5 h-3.5" />
                            重试
                          </>
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </SectionCard>
        )}

        {/* Pagination */}
        {pagination.total > pagination.pageSize && (
          <div className="flex items-center justify-center gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              上一页
            </button>
            <span className="text-sm text-gray-500 px-2">
              {pagination.page} / {Math.ceil(pagination.total / pagination.pageSize)}
            </span>
            <button
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              下一页
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
