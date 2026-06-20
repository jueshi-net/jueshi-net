"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight } from "lucide-react";

interface RewardItem {
  id: string;
  code: string;
  name: string;
  description: string | null;
  costPoints: number;
  rewardType: string;
  rewardValue: number;
  enabled: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  _count: {
    userRewards: number;
  };
}

interface RewardItemsClientProps {
  initialItems: RewardItem[];
}

const REWARD_TYPES = [
  { value: "member_trial", label: "会员体验", description: "延长会员有效期" },
  { value: "ad_slot_days", label: "广告权益", description: "广告展示天数" },
  { value: "word_export_coupon", label: "文档导出券", description: "Word 导出次数" },
  { value: "no_branding_coupon", label: "去品牌券", description: "去除品牌标识" },
  { value: "points", label: "积分补贴", description: "直接发放积分" },
  { value: "growth", label: "成长值", description: "增加成长值" },
];

export default function RewardItemsClient({ initialItems }: RewardItemsClientProps) {
  const [items, setItems] = useState<RewardItem[]>(initialItems);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<RewardItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    costPoints: 0,
    rewardType: "member_trial",
    rewardValue: 1,
    enabled: true,
    sortOrder: 0,
  });

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      description: "",
      costPoints: 0,
      rewardType: "member_trial",
      rewardValue: 1,
      enabled: true,
      sortOrder: 0,
    });
    setEditingItem(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const url = editingItem
        ? `/api/admin/reward-items/${editingItem.id}`
        : "/api/admin/reward-items";
      const method = editingItem ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "操作失败");
      }

      setSuccess(editingItem ? "奖励项已更新" : "奖励项已创建");
      resetForm();
      
      // Refresh items
      const refreshRes = await fetch("/api/admin/reward-items");
      const refreshData = await refreshRes.json();
      if (refreshData.success) {
        setItems(refreshData.items);
      }
    } catch (err: any) {
      setError(err.message || "操作失败");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: RewardItem) => {
    setEditingItem(item);
    setFormData({
      code: item.code,
      name: item.name,
      description: item.description || "",
      costPoints: item.costPoints,
      rewardType: item.rewardType,
      rewardValue: item.rewardValue,
      enabled: item.enabled,
      sortOrder: item.sortOrder,
    });
    setShowForm(true);
  };

  const handleToggle = async (item: RewardItem) => {
    try {
      const res = await fetch(`/api/admin/reward-items/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !item.enabled }),
      });

      if (!res.ok) {
        throw new Error("更新失败");
      }

      setItems(items.map((i) =>
        i.id === item.id ? { ...i, enabled: !i.enabled } : i
      ));
      setSuccess(`已${item.enabled ? "停用" : "启用"} ${item.name}`);
    } catch (err: any) {
      setError(err.message || "更新失败");
    }
  };

  const handleDelete = async (item: RewardItem) => {
    if (!confirm(`确定要删除 "${item.name}" 吗？此操作不可恢复。`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/reward-items/${item.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("删除失败");
      }

      setItems(items.filter((i) => i.id !== item.id));
      setSuccess(`已删除 ${item.name}`);
    } catch (err: any) {
      setError(err.message || "删除失败");
    }
  };

  const getRewardTypeLabel = (type: string) => {
    return REWARD_TYPES.find((t) => t.value === type)?.label || type;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">奖励项管理</h1>
        <p className="text-gray-600">管理用户可兑换的奖励项，包括会员体验、广告权益、文档导出券等。</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800">{success}</p>
        </div>
      )}

      <div className="mb-6 flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-600">
            共 {items.length} 个奖励项，{items.filter((i) => i.enabled).length} 个已启用
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          新建奖励项
        </button>
      </div>

      {showForm && (
        <div className="mb-8 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {editingItem ? "编辑奖励项" : "新建奖励项"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  唯一标识 (code) *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="如：member_3day"
                  required
                  disabled={!!editingItem}
                />
                <p className="text-xs text-gray-500 mt-1">唯一标识，创建后不可修改</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  显示名称 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="如：3天会员体验"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                说明
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
                placeholder="奖励项的详细说明"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  奖励类型 *
                </label>
                <select
                  value={formData.rewardType}
                  onChange={(e) => setFormData({ ...formData, rewardType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {REWARD_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label} - {type.description}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  奖励数值 *
                </label>
                <input
                  type="number"
                  value={formData.rewardValue}
                  onChange={(e) => setFormData({ ...formData, rewardValue: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">天数、次数或数值</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  所需积分 *
                </label>
                <input
                  type="number"
                  value={formData.costPoints}
                  onChange={(e) => setFormData({ ...formData, costPoints: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">兑换所需积分</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  排序
                </label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">数字越小越靠前</p>
              </div>
              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.enabled}
                    onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">启用此奖励项</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? "保存中..." : editingItem ? "更新" : "创建"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                名称
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                类型
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                积分
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                数值
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                已兑换
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                状态
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{item.name}</div>
                    <div className="text-xs text-gray-500">{item.code}</div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {getRewardTypeLabel(item.rewardType)}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {item.costPoints}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {item.rewardValue}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {item._count.userRewards} 次
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      item.enabled
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {item.enabled ? "已启用" : "已停用"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleToggle(item)}
                      className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
                      title={item.enabled ? "停用" : "启用"}
                    >
                      {item.enabled ? (
                        <ToggleRight className="w-5 h-5" />
                      ) : (
                        <ToggleLeft className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
                      title="编辑"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                      title="删除"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && (
          <div className="px-4 py-12 text-center text-gray-500">
            暂无奖励项，点击"新建奖励项"创建第一个奖励项。
          </div>
        )}
      </div>
    </div>
  );
}
