"use client";

import { useEffect, useState } from "react";

interface Coupon {
  id: string;
  couponType: string;
  quantity: number;
  usedCount: number;
  status: string;
  expiresAt: string | null;
  createdAt: string;
}

function formatDateOnly(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export default function CouponsClient() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await fetch("/api/coupons");
      const data = await res.json();
      if (data.success) {
        setCoupons(data.data.coupons);
      }
    } catch (error) {
      console.error("Failed to fetch coupons:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-green-100 text-green-800",
      used: "bg-gray-100 text-gray-800",
      expired: "bg-red-100 text-red-800",
    };
    const labels: Record<string, string> = {
      active: "有效",
      used: "已用完",
      expired: "已过期",
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colors[status] || "bg-gray-100"}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getCouponTypeLabel = (couponType: string) => {
    const typeMap: Record<string, string> = {
      word_export: "Word 导出券",
      no_branding: "去品牌券",
    };
    return typeMap[couponType] || couponType;
  };

  const getCouponTypeDescription = (couponType: string) => {
    const descMap: Record<string, string> = {
      word_export: "在文档工具中导出 Word 格式时自动使用",
      no_branding: "在文档工具中导出时选择去品牌选项",
    };
    return descMap[couponType] || "";
  };

  if (loading) {
    return <div className="p-6">加载中...</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">我的券</h1>
      </div>

      {coupons.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
          暂无券类权益
        </div>
      ) : (
        <div className="space-y-4">
          {coupons.map((coupon) => {
            const remaining = coupon.quantity - coupon.usedCount;
            return (
              <div
                key={coupon.id}
                className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">
                        {getCouponTypeLabel(coupon.couponType)}
                      </h3>
                      {getStatusBadge(coupon.status)}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        剩余: {remaining}/{coupon.quantity} 次
                      </p>
                      {coupon.expiresAt && (
                        <p>
                          有效期至: {formatDateOnly(coupon.expiresAt)}
                        </p>
                      )}
                      <p className="text-xs mt-2">
                        {getCouponTypeDescription(coupon.couponType)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
