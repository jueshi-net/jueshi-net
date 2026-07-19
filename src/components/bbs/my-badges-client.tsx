"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Award, Lock } from "lucide-react";

interface Badge {
  key: string;
  name: string;
  description: string;
  iconText: string;
  color: string;
  conditionText?: string;
  awardedAt?: string;
  reason?: string;
  earned?: boolean;
}

function getColorClasses(color: string): string {
  const colorMap: Record<string, string> = {
    "blue-500": "bg-blue-50 border-blue-200 text-blue-600",
    "teal-500": "bg-teal-50 border-teal-200 text-teal-600",
    "green-500": "bg-green-50 border-green-200 text-green-600",
    "amber-500": "bg-amber-50 border-amber-200 text-amber-600",
    "rose-500": "bg-rose-50 border-rose-200 text-rose-600",
    "pink-500": "bg-pink-50 border-pink-200 text-pink-600",
    "indigo-500": "bg-indigo-50 border-indigo-200 text-indigo-600",
    "purple-500": "bg-purple-50 border-purple-200 text-purple-600",
  };
  return colorMap[color] || "bg-gray-50 border-gray-200 text-gray-600";
}

export function MyBadgesClient() {
  const [earned, setEarned] = useState<Badge[]>([]);
  const [unearned, setUnearned] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notLoggedIn, setNotLoggedIn] = useState(false);

  useEffect(() => {
    async function fetchBadges() {
      try {
        const res = await fetch("/api/forum/my-badges");
        if (res.status === 401) {
          setNotLoggedIn(true);
          return;
        }
        if (!res.ok) throw new Error("加载失败");
        const data = await res.json();
        setEarned(data.earned || []);
        setUnearned(data.unearned || []);
      } catch (e) {
        setError("加载勋章失败，请稍后重试");
      } finally {
        setLoading(false);
      }
    }
    fetchBadges();
  }, []);

  if (notLoggedIn) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <Award className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-gray-900 mb-2">需要登录</h2>
        <p className="text-sm text-slate-500 mb-6">登录后查看你的勋章</p>
        <Link
          href="/api/auth/signin"
          className="inline-flex items-center px-4 py-2 bg-brand text-white rounded-lg text-sm hover:bg-brand/90"
        >
          去登录
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <div className="inline-block w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm text-slate-500">加载中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <p className="text-sm text-red-500 mb-3">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-sm text-brand hover:underline"
        >
          重试
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Earned badges */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-semibold text-gray-900">
            已获得勋章
          </h2>
          <span className="text-sm text-slate-400">({earned.length})</span>
        </div>

        {earned.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-sm text-slate-500">
              还没有获得勋章，参与社区活动来获取吧！
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {earned.map((badge) => (
              <div
                key={badge.key}
                className={`rounded-xl border p-4 text-center ${getColorClasses(badge.color)}`}
              >
                <div className="text-3xl mb-2">{badge.iconText}</div>
                <h3 className="text-sm font-semibold mb-1">{badge.name}</h3>
                <p className="text-xs text-slate-500 line-clamp-2">
                  {badge.description}
                </p>
                {badge.awardedAt && (
                  <p className="text-xs text-slate-400 mt-2">
                    {new Date(badge.awardedAt).toLocaleDateString("zh-CN")}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Unearned badges */}
      {unearned.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-5 h-5 text-slate-400" />
            <h2 className="text-lg font-semibold text-gray-900">
              未获得勋章
            </h2>
            <span className="text-sm text-slate-400">({unearned.length})</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {unearned.map((badge) => (
              <div
                key={badge.key}
                className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center opacity-70"
              >
                <div className="text-3xl mb-2 grayscale">{badge.iconText}</div>
                <h3 className="text-sm font-semibold text-slate-600 mb-1">
                  {badge.name}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2">
                  {badge.conditionText || badge.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="bg-brand/5 rounded-xl border border-brand/20 p-6 text-center">
        <p className="text-sm text-slate-600 mb-3">
          参与社区活动获得更多勋章
        </p>
        <Link
          href="/bbs"
          className="inline-flex items-center px-4 py-2 bg-brand text-white rounded-lg text-sm hover:bg-brand/90"
        >
          浏览论坛
        </Link>
      </div>
    </div>
  );
}
