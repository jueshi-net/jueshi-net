'use client';

import { useState, useEffect } from 'react';
import { Gift, Plus, Edit2, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import Link from 'next/link';
import { WorkspacePageHeader } from '@/components/saas/WorkspacePageHeader';
import { SectionCard } from '@/components/saas/SectionCard';
import { StatusBadge } from '@/components/design-system/StatusBadge';
import { EmptyState } from '@/components/design-system/EmptyState';

interface RewardRule {
  id: string;
  name: string;
  trigger: string;
  rewardType: string;
  rewardValue: number;
  rewardMetadata: any;
  enabled: boolean;
  startsAt: string | null;
  endsAt: string | null;
  maxRewardsPerInviter: number | null;
  maxRewardsTotal: number | null;
  createdAt: string;
  updatedAt: string;
}

const REWARD_TYPE_LABELS: Record<string, string> = {
  MEMBER_DAYS: '会员天数',
  AD_SLOT_DAYS: '广告位天数',
  POINTS: '积分',
  GROWTH: '成长值',
  BADGE: '勋章',
  CUSTOM_ENTITLEMENT: '自定义权益',
};

const REWARD_TYPE_VARIANT: Record<string, 'info' | 'success' | 'warning' | 'processing' | 'neutral' | 'pending'> = {
  MEMBER_DAYS: 'processing',
  AD_SLOT_DAYS: 'info',
  POINTS: 'warning',
  GROWTH: 'success',
  BADGE: 'pending',
  CUSTOM_ENTITLEMENT: 'neutral',
};

export default function AdminRewardRulesPage() {
  const [rules, setRules] = useState<RewardRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState<RewardRule | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    trigger: 'INVITE_REGISTER_SUCCESS',
    rewardType: 'MEMBER_DAYS',
    rewardValue: 3,
    enabled: true,
    startsAt: '',
    endsAt: '',
    maxRewardsPerInviter: '',
    maxRewardsTotal: '',
  });

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const res = await fetch('/api/admin/reward-rules');
      const data = await res.json();
      if (data.success) {
        setRules(data.rules);
      }
    } catch (error) {
      console.error('Failed to fetch rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...formData,
        rewardValue: parseInt(formData.rewardValue as any),
        startsAt: formData.startsAt || null,
        endsAt: formData.endsAt || null,
        maxRewardsPerInviter: formData.maxRewardsPerInviter ? parseInt(formData.maxRewardsPerInviter) : null,
        maxRewardsTotal: formData.maxRewardsTotal ? parseInt(formData.maxRewardsTotal) : null,
      };

      const url = editingRule ? `/api/admin/reward-rules/${editingRule.id}` : '/api/admin/reward-rules';
      const method = editingRule ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        setEditingRule(null);
        setFormData({
          name: '',
          trigger: 'INVITE_REGISTER_SUCCESS',
          rewardType: 'MEMBER_DAYS',
          rewardValue: 3,
          enabled: true,
          startsAt: '',
          endsAt: '',
          maxRewardsPerInviter: '',
          maxRewardsTotal: '',
        });
        fetchRules();
      } else {
        alert(data.error || '操作失败');
      }
    } catch (error) {
      console.error('Failed to submit:', error);
      alert('操作失败');
    }
  };

  const handleToggle = async (id: string, enabled: boolean) => {
    try {
      const res = await fetch(`/api/admin/reward-rules/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !enabled }),
      });

      const data = await res.json();
      if (data.success) {
        fetchRules();
      }
    } catch (error) {
      console.error('Failed to toggle:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除此规则？')) return;

    try {
      const res = await fetch(`/api/admin/reward-rules/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (data.success) {
        fetchRules();
      }
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const handleEdit = (rule: RewardRule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      trigger: rule.trigger,
      rewardType: rule.rewardType,
      rewardValue: rule.rewardValue,
      enabled: rule.enabled,
      startsAt: rule.startsAt ? rule.startsAt.split('T')[0] : '',
      endsAt: rule.endsAt ? rule.endsAt.split('T')[0] : '',
      maxRewardsPerInviter: rule.maxRewardsPerInviter?.toString() || '',
      maxRewardsTotal: rule.maxRewardsTotal?.toString() || '',
    });
    setShowForm(true);
  };

  const inputCls = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-colors bg-white";
  const labelCls = "text-sm font-medium text-gray-700 mb-1.5 block";

  return (
    <div className="min-h-screen bg-gray-50/50">
      <WorkspacePageHeader
        title="奖励规则配置"
        subtitle="配置邀请奖励规则"
        icon={<Gift className="w-5 h-5" />}
        breadcrumbs={[
          { label: '管理后台', href: '/admin' },
          { label: '邀请管理', href: '/admin/invites' },
          { label: '奖励规则' },
        ]}
        actions={
          <button
            onClick={() => {
              setEditingRule(null);
              setFormData({
                name: '',
                trigger: 'INVITE_REGISTER_SUCCESS',
                rewardType: 'MEMBER_DAYS',
                rewardValue: 3,
                enabled: true,
                startsAt: '',
                endsAt: '',
                maxRewardsPerInviter: '',
                maxRewardsTotal: '',
              });
              setShowForm(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            新建规则
          </button>
        }
      />

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200">
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
                <h2 className="font-bold text-gray-900 text-lg">
                  {editingRule ? '编辑奖励规则' : '新建奖励规则'}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingRule(null);
                  }}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="text-gray-400 text-lg">✕</span>
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className={labelCls}>规则名称</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className={inputCls}
                    placeholder="例如：邀请成功送 3 天会员"
                  />
                </div>
                <div>
                  <label className={labelCls}>触发条件</label>
                  <select
                    value={formData.trigger}
                    onChange={e => setFormData({ ...formData, trigger: e.target.value })}
                    className={inputCls}
                  >
                    <option value="INVITE_REGISTER_SUCCESS">邀请注册成功</option>
                    <option value="INVITE_QUALIFIED">邀请符合条件</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>奖励类型</label>
                  <select
                    value={formData.rewardType}
                    onChange={e => setFormData({ ...formData, rewardType: e.target.value })}
                    className={inputCls}
                  >
                    <option value="MEMBER_DAYS">会员天数</option>
                    <option value="AD_SLOT_DAYS">广告位天数</option>
                    <option value="POINTS">积分</option>
                    <option value="GROWTH">成长值</option>
                    <option value="BADGE">勋章</option>
                    <option value="CUSTOM_ENTITLEMENT">自定义权益</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>奖励数值</label>
                  <input
                    type="number"
                    value={formData.rewardValue}
                    onChange={e => setFormData({ ...formData, rewardValue: parseInt(e.target.value) || 0 })}
                    className={inputCls}
                    min="0"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>开始时间</label>
                    <input
                      type="date"
                      value={formData.startsAt}
                      onChange={e => setFormData({ ...formData, startsAt: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>结束时间</label>
                    <input
                      type="date"
                      value={formData.endsAt}
                      onChange={e => setFormData({ ...formData, endsAt: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>每个邀请人最多奖励次数</label>
                    <input
                      type="number"
                      value={formData.maxRewardsPerInviter}
                      onChange={e => setFormData({ ...formData, maxRewardsPerInviter: e.target.value })}
                      className={inputCls}
                      placeholder="不限制"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>全局最多奖励次数</label>
                    <input
                      type="number"
                      value={formData.maxRewardsTotal}
                      onChange={e => setFormData({ ...formData, maxRewardsTotal: e.target.value })}
                      className={inputCls}
                      placeholder="不限制"
                      min="0"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="enabled"
                    checked={formData.enabled}
                    onChange={e => setFormData({ ...formData, enabled: e.target.checked })}
                    className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                  />
                  <label htmlFor="enabled" className="text-sm font-medium text-gray-700">
                    启用此规则
                  </label>
                </div>
              </div>
              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-100 px-6 py-4 flex items-center justify-end gap-3 rounded-b-2xl">
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingRule(null);
                  }}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100"
                >
                  取消
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-5 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors shadow-sm"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Rules List */}
        {loading ? (
          <div className="text-center text-gray-400 py-12">加载中...</div>
        ) : rules.length === 0 ? (
          <EmptyState
            variant="no-data"
            title="还没有奖励规则"
            description="创建奖励规则，配置邀请奖励"
            icon={<Gift className="w-12 h-12" />}
            primaryAction={{ label: '创建第一个规则', onClick: () => setShowForm(true) }}
          />
        ) : (
          <SectionCard title="规则列表" subtitle={`共 ${rules.length} 条规则`}>
            <div className="space-y-3">
              {rules.map(rule => (
                <div key={rule.id} className="p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-base font-bold text-gray-900">{rule.name}</h3>
                        <StatusBadge
                          label={rule.enabled ? '启用' : '停用'}
                          variant={rule.enabled ? 'success' : 'neutral'}
                          size="sm"
                          dot
                        />
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500 flex-wrap">
                        <span>触发: {rule.trigger === 'INVITE_REGISTER_SUCCESS' ? '邀请注册成功' : '邀请符合条件'}</span>
                        <StatusBadge
                          label={REWARD_TYPE_LABELS[rule.rewardType] || rule.rewardType}
                          variant={REWARD_TYPE_VARIANT[rule.rewardType] || 'neutral'}
                          size="sm"
                        />
                        <span className="font-bold text-gray-900">{rule.rewardValue}</span>
                      </div>
                      {(rule.startsAt || rule.endsAt) && (
                        <div className="text-xs text-gray-400 mt-2">
                          活动时间: {rule.startsAt ? new Date(rule.startsAt).toLocaleDateString('zh-CN') : '不限'} - {rule.endsAt ? new Date(rule.endsAt).toLocaleDateString('zh-CN') : '不限'}
                        </div>
                      )}
                      {(rule.maxRewardsPerInviter || rule.maxRewardsTotal) && (
                        <div className="text-xs text-gray-400 mt-1">
                          限制: {rule.maxRewardsPerInviter ? `每人最多 ${rule.maxRewardsPerInviter} 次` : '不限制每人'}
                          {rule.maxRewardsTotal ? `，全局最多 ${rule.maxRewardsTotal} 次` : ''}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggle(rule.id, rule.enabled)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        title={rule.enabled ? '停用' : '启用'}
                      >
                        {rule.enabled ? (
                          <ToggleRight className="w-5 h-5 text-green-600" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                      <button
                        onClick={() => handleEdit(rule)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        title="编辑"
                      >
                        <Edit2 className="w-4 h-4 text-gray-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(rule.id)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* Link to Reward Grants */}
        <div>
          <Link
            href="/admin/invites/rewards/grants"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-teal-700 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors font-medium"
          >
            查看奖励发放记录 →
          </Link>
        </div>
      </div>
    </div>
  );
}
