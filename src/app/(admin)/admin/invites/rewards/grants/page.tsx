'use client';

import { useState, useEffect } from 'react';
import { Gift, CheckCircle, XCircle, AlertCircle, Clock, RefreshCw } from 'lucide-react';

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

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  PENDING: { label: '待发放', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
  GRANTED: { label: '已发放', color: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle },
  FAILED: { label: '失败', color: 'bg-red-50 text-red-700 border-red-200', icon: XCircle },
  REVOKED: { label: '已撤销', color: 'bg-gray-50 text-gray-700 border-gray-200', icon: AlertCircle },
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
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Gift className="w-6 h-6 text-purple-600" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">奖励发放记录</h1>
            <p className="text-sm text-gray-500">查看所有奖励发放记录</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={e => {
              setFilter(e.target.value);
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-200"
          >
            <option value="">全部状态</option>
            <option value="PENDING">待发放</option>
            <option value="GRANTED">已发放</option>
            <option value="FAILED">失败</option>
            <option value="REVOKED">已撤销</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="text-xs text-gray-500 mb-1">总记录</div>
          <div className="text-2xl font-bold text-gray-900">{pagination.total}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="text-xs text-gray-500 mb-1">已发放</div>
          <div className="text-2xl font-bold text-green-600">
            {grants.filter(g => g.status === 'GRANTED').length}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="text-xs text-gray-500 mb-1">待发放</div>
          <div className="text-2xl font-bold text-amber-600">
            {grants.filter(g => g.status === 'PENDING').length}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="text-xs text-gray-500 mb-1">失败</div>
          <div className="text-2xl font-bold text-red-600">
            {grants.filter(g => g.status === 'FAILED').length}
          </div>
        </div>
      </div>

      {/* Grants List */}
      {loading ? (
        <div className="text-center text-gray-400 py-12">加载中...</div>
      ) : grants.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Gift className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-base font-semibold text-gray-900 mb-2">还没有奖励发放记录</h3>
          <p className="text-sm text-gray-500">当用户成功邀请好友注册后，奖励发放记录会显示在这里</p>
        </div>
      ) : (
        <div className="space-y-4">
          {grants.map(grant => {
            const statusConfig = STATUS_CONFIG[grant.status] || STATUS_CONFIG.PENDING;
            const StatusIcon = statusConfig.icon;

            return (
              <div key={grant.id} className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <StatusIcon className={`w-5 h-5 ${
                        grant.status === 'GRANTED' ? 'text-green-600' :
                        grant.status === 'FAILED' ? 'text-red-600' :
                        grant.status === 'PENDING' ? 'text-amber-600' :
                        'text-gray-600'
                      }`} />
                      <span className={`text-xs px-2 py-0.5 rounded border ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {grant.user.name || grant.user.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>规则: {grant.rewardRule.name}</span>
                      <span>类型: {REWARD_TYPE_LABELS[grant.rewardType] || grant.rewardType}</span>
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
                      <div className="text-xs text-red-600 mt-2">
                        失败原因: {grant.failureReason}
                      </div>
                    )}
                  </div>
                  {grant.status === 'FAILED' && (
                    <button
                      onClick={() => handleRetry(grant.id)}
                      disabled={retryingId === grant.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg text-xs font-medium hover:bg-teal-100 transition-colors disabled:opacity-50"
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
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.total > pagination.pageSize && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            disabled={pagination.page <= 1}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            上一页
          </button>
          <span className="text-sm text-gray-500">
            {pagination.page} / {Math.ceil(pagination.total / pagination.pageSize)}
          </span>
          <button
            disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
}
