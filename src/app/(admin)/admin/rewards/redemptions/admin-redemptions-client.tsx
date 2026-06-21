"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Redemption {
  id: string;
  user: {
    email: string;
    name: string | null;
  };
  rewardItem: {
    code: string;
    name: string;
    rewardType: string;
  };
  rewardType: string;
  rewardValue: number;
  status: string;
  pointsCost: number;
  auditStatus: string;
  auditNote: string | null;
  createdAt: string;
  expiresAt: string | null;
  failureReason: string | null;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export default function AdminRedemptionsClient() {
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    userId: "",
    rewardType: "",
    status: "",
    auditStatus: "",
  });

  useEffect(() => {
    fetchRedemptions();
  }, [filters]);

  const fetchRedemptions = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.userId) params.set("userId", filters.userId);
      if (filters.rewardType) params.set("rewardType", filters.rewardType);
      if (filters.status) params.set("status", filters.status);
      if (filters.auditStatus) params.set("auditStatus", filters.auditStatus);

      const res = await fetch(`/api/admin/rewards/redemptions?${params}`);
      const data = await res.json();
      if (data.success) {
        setRedemptions(data.data.redemptions);
      }
    } catch (error) {
      console.error("Failed to fetch redemptions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAudit = async (id: string, action: "approve" | "reject") => {
    if (!confirm(`确定要${action === "approve" ? "通过" : "拒绝"}此兑换记录吗？`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/rewards/redemptions/${id}/audit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.success) {
        fetchRedemptions();
      } else {
        alert(data.error || "审核失败");
      }
    } catch (error) {
      console.error("Failed to audit redemption:", error);
      alert("审核失败");
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      active: "bg-green-100 text-green-800",
      used: "bg-gray-100 text-gray-800",
      expired: "bg-gray-100 text-gray-600",
      rejected: "bg-red-100 text-red-800",
    };
    const labels: Record<string, string> = {
      pending: "待审核",
      active: "有效",
      used: "已使用",
      expired: "已过期",
      rejected: "已拒绝",
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colors[status] || "bg-gray-100"}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getAuditStatusBadge = (auditStatus: string) => {
    const colors: Record<string, string> = {
      auto: "bg-blue-100 text-blue-800",
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    const labels: Record<string, string> = {
      auto: "自动",
      pending: "待审核",
      approved: "已通过",
      rejected: "已拒绝",
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colors[auditStatus] || "bg-gray-100"}`}>
        {labels[auditStatus] || auditStatus}
      </span>
    );
  };

  if (loading) {
    return <div className="p-6">加载中...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">兑换记录管理</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="用户 ID"
            value={filters.userId}
            onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
            className="border rounded px-3 py-2"
          />
          <select
            value={filters.rewardType}
            onChange={(e) => setFilters({ ...filters, rewardType: e.target.value })}
            className="border rounded px-3 py-2"
          >
            <option value="">全部奖励类型</option>
            <option value="member_trial">会员体验</option>
            <option value="growth">成长值</option>
            <option value="word_export_coupon">Word导出券</option>
            <option value="no_branding_coupon">去品牌券</option>
            <option value="ad_slot_days">广告权益</option>
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="border rounded px-3 py-2"
          >
            <option value="">全部状态</option>
            <option value="pending">待审核</option>
            <option value="active">有效</option>
            <option value="used">已使用</option>
            <option value="expired">已过期</option>
            <option value="rejected">已拒绝</option>
          </select>
          <select
            value={filters.auditStatus}
            onChange={(e) => setFilters({ ...filters, auditStatus: e.target.value })}
            className="border rounded px-3 py-2"
          >
            <option value="">全部审核状态</option>
            <option value="auto">自动</option>
            <option value="pending">待审核</option>
            <option value="approved">已通过</option>
            <option value="rejected">已拒绝</option>
          </select>
        </div>
      </div>

      {redemptions.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
          暂无兑换记录
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">用户</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">奖励</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">积分</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">审核</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">时间</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {redemptions.map((redemption) => (
                <tr key={redemption.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div>{redemption.user.email}</div>
                    <div className="text-gray-500 text-xs">{redemption.user.name || "未设置"}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="font-medium">{redemption.rewardItem.name}</div>
                    <div className="text-gray-500 text-xs">价值: {redemption.rewardValue}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {redemption.pointsCost}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {getStatusBadge(redemption.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {getAuditStatusBadge(redemption.auditStatus)}
                    {redemption.auditNote && (
                      <div className="text-gray-500 text-xs mt-1">{redemption.auditNote}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(redemption.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {redemption.auditStatus === "pending" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAudit(redemption.id, "approve")}
                          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs"
                        >
                          通过
                        </button>
                        <button
                          onClick={() => handleAudit(redemption.id, "reject")}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                        >
                          拒绝
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
