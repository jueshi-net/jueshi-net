'use client';

import { useState, useEffect } from 'react';
import { Gift, Plus, Edit2, Trash2, ToggleLeft, ToggleRight, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

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

const REWARD_TYPE_COLORS: Record<string, string> = {
  MEMBER_DAYS: 'bg-purple-50 text-purple-700 border-purple-200',
  AD_SLOT_DAYS: 'bg-blue-50 text-blue-700 border-blue-200',
  POINTS: 'bg-amber-50 text-amber-700 border-amber-200',
  GROWTH: 'bg-green-50 text-green-700 border-green-200',
  BADGE: 'bg-orange-50 text-orange-700 border-orange-200',
  CUSTOM_ENTITLEMENT: 'bg-gray-50 text-gray-700 border-gray-200',
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

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center text-gray-400">加载中...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Gift className="w-6 h-6 text-purple-600" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">奖励规则配置</h1>
            <p className="text-sm text-gray-500">配置邀请奖励规则</p>
          </div>
        </div>
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
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          新建规则
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="font-bold text-gray-900">
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
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">规则名称</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-200"
                  placeholder="例如：邀请成功送 3 天会员"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">触发条件</label>
                <select
                  value={formData.trigger}
                  onChange={e => setFormData({ ...formData, trigger: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-200"
                >
                  <option value="INVITE_REGISTER_SUCCESS">邀请注册成功</option>
                  <option value="INVITE_QUALIFIED">邀请符合条件</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">奖励类型</label>
                <select
                  value={formData.rewardType}
                  onChange={e => setFormData({ ...formData, rewardType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-200"
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
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">奖励数值</label>
                <input
                  type="number"
                  value={formData.rewardValue}
                  onChange={e => setFormData({ ...formData, rewardValue: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-200"
                  min="0"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">开始时间</label>
                  <input
                    type="date"
                    value={formData.startsAt}
                    onChange={e => setFormData({ ...formData, startsAt: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-200"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">结束时间</label>
                  <input
                    type="date"
                    value={formData.endsAt}
                    onChange={e => setFormData({ ...formData, endsAt: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-200"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">每个邀请人最多奖励次数</label>
                  <input
                    type="number"
                    value={formData.maxRewardsPerInviter}
                    onChange={e => setFormData({ ...formData, maxRewardsPerInviter: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-200"
                    placeholder="不限制"
                    min="0"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">全局最多奖励次数</label>
                  <input
                    type="number"
                    value={formData.maxRewardsTotal}
                    onChange={e => setFormData({ ...formData, maxRewardsTotal: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-200"
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
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                className="px-5 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rules List */}
      {rules.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Gift className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-base font-semibold text-gray-900 mb-2">还没有奖励规则</h3>
          <p className="text-sm text-gray-500 mb-6">创建奖励规则，配置邀请奖励</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg text-sm font-bold hover:bg-teal-700 transition-colors"
          >
            创建第一个规则
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {rules.map(rule => (
            <div key={rule.id} className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{rule.name}</h3>
                    {rule.enabled ? (
                      <span className="text-xs px-2 py-0.5 bg-green-50 text-green-700 rounded-full">启用</span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">停用</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>触发: {rule.trigger === 'INVITE_REGISTER_SUCCESS' ? '邀请注册成功' : '邀请符合条件'}</span>
                    <span className={`px-2 py-0.5 rounded border ${REWARD_TYPE_COLORS[rule.rewardType] || REWARD_TYPE_COLORS.CUSTOM_ENTITLEMENT}`}>
                      {REWARD_TYPE_LABELS[rule.rewardType] || rule.rewardType}
                    </span>
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
                <div className="flex items-center gap-2">
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
                    <Edit2 className="w-5 h-5 text-gray-400" />
                  </button>
                  <button
                    onClick={() => handleDelete(rule.id)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    title="删除"
                  >
                    <Trash2 className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Link to Reward Grants */}
      <div className="mt-6">
        <Link
          href="/admin/invites/rewards/grants"
          className="inline-flex items-center gap-2 text-sm text-teal-600 hover:underline"
        >
          查看奖励发放记录 →
        </Link>
      </div>
    </div>
  );
}
