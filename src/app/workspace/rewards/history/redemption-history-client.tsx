"use client";

import { useEffect, useState } from "react";

interface Redemption {
  id: string;
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
  createdAt: string;
  expiresAt: string | null;
  failureReason: string | null;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function formatDateOnly(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export default function RedemptionHistoryClient() {
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRedemptions();
  }, []);

  const fetchRedemptions = async () => {
    try {
      const res = await fetch("/api/rewards/history");
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

  const getRewardTypeLabel = (rewardType: string) => {
    const typeMap: Record<string, string> = {
      member_trial: "会员体验",
      growth: "成长值",
      word_export_coupon: "Word导出券",
      no_branding_coupon: "去品牌券",
      ad_slot_days: "广告权益",
    };
    return typeMap[rewardType] || rewardType;
  };

  if (loading) {
    return <div className="p-6">加载中...</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">兑换记录</h1>
      </div>

      {redemptions.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
          暂无兑换记录
        </div>
      ) : (
        <div className="space-y-4">
          {redemptions.map((redemption) => (
            <div
              key={redemption.id}
              className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg">
                      {redemption.rewardItem.name}
                    </h3>
                    {getStatusBadge(redemption.status)}
                    {getAuditStatusBadge(redemption.auditStatus)}
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      类型: {getRewardTypeLabel(redemption.rewardType)} | 价值:{" "}
                      {redemption.rewardValue}
                    </p>
                    <p>消耗积分: {redemption.pointsCost}</p>
                    <p>兑换时间: {formatDate(redemption.createdAt)}</p>
                    {redemption.expiresAt && (
                      <p>有效期至: {formatDateOnly(redemption.expiresAt)}</p>
                    )}
                    {redemption.failureReason && (
                      <p className="text-red-600">
                        失败原因: {redemption.failureReason}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
