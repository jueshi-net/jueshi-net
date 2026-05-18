"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Star,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Gem,
  Zap,
  Gift,
  TrendingUp,
  Shield,
  Sparkles,
  Users,
  Clock,
  Coins,
  Loader2,
} from "lucide-react";


const POINT_TYPE_LABELS: Record<string, { label: string; icon: string }> = {
  daily_checkin: { label: "签到", icon: "📅" },
  task_complete: { label: "任务", icon: "✅" },
  export_word: { label: "导出", icon: "📄" },
  admin_adjust: { label: "调整", icon: "⚙️" },
  reward_redeem: { label: "兑换", icon: "🎁" },
  system_adjust: { label: "系统", icon: "🔧" },
};

interface PointLog {
  id: string;
  type: string;
  points: number;
  reason: string | null;
  createdAt: string;
}

interface Stats {
  earned: number;
  count: number;
}

interface PointsData {
  logs: PointLog[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
  stats: {
    today: Stats;
    thisWeek: Stats;
    thisMonth: Stats;
  };
  filters: { type: string | null; types: string[] };
}

const TYPE_FILTERS = [
  { value: "", label: "全部" },
  { value: "daily_checkin", label: "📅 签到" },
  { value: "task_complete", label: "✅ 任务" },
  { value: "reward_redeem", label: "🎁 兑换" },
  { value: "export_word", label: "📄 导出" },
  { value: "admin_adjust", label: "⚙️ 调整" },
];

const EARNING_METHODS = [
  { icon: "📅", title: "每日签到", desc: "每天登录签到获取积分，连续签到有加成", badge: "每日" },
  { icon: "✅", title: "完成任务", desc: "完成平台指定的任务和活动", badge: "不定期" },
  { icon: "💬", title: "工具短评", desc: "对使用过的工具留下有用评价", badge: "每次" },
  { icon: "🛠️", title: "使用工作台", desc: "活跃使用工作台功能获取积分", badge: "持续" },
];

const REDEEM_OPTIONS = [
  { icon: "⚡", title: "兑换 AI 次数", desc: "用积分兑换 AI 工具的调用次数", status: "待开放" },
  { icon: "👑", title: "兑换会员体验", desc: "体验会员专属功能和高额度", status: "待开放" },
  { icon: "📚", title: "兑换资源权益", desc: "解锁高级资源库内容", status: "待开放" },
];

const MEMBERSHIP_TIERS = [
  {
    name: "免费用户",
    price: "免费",
    icon: Star,
    color: "gray",
    features: ["每日签到赚积分", "AI 工具基础额度", "实用工具箱全访问", "工作台收藏网址"],
    cta: "当前方案",
    ctaLink: null,
  },
  {
    name: "会员用户",
    price: "¥29/月",
    icon: Gem,
    color: "amber",
    popular: true,
    features: ["更高 AI 每日额度", "积分加成奖励", "会员专属工具", "优先新功能体验"],
    cta: "会员购买功能待开放",
    ctaLink: null,
  },
];

export default function PointsPage() {
  const [data, setData] = useState<PointsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginRequired, setLoginRequired] = useState(false);
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: "20",
      });
      if (typeFilter) params.set("type", typeFilter);

      const res = await fetch(`/api/points/logs?${params.toString()}`);
      if (res.status === 401) {
        setLoginRequired(true);
        setLoading(false);
        return;
      }
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error("Failed to fetch points:", e);
    } finally {
      setLoading(false);
    }
  }, [page, typeFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 flex items-center justify-center min-h-[50vh]">
        <div className="text-gray-500 flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          加载中...
        </div>
      </div>
    );
  }

  if (loginRequired) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-6">🔐</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">请先登录</h1>
        <p className="text-gray-600 mb-6">积分明细需要登录后查看</p>
        <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors min-h-[48px] font-semibold">
          前往登录
        </Link>
      </div>
    );
  }

  if (!data) return null;

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")} ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <Link href="/dashboard" className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <span className="text-sm text-white/80">返回工作台</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            积分与会员中心
          </h1>
          <p className="text-white/80 text-lg max-w-lg">
            用积分兑换权益，用会员解锁更高额度和高级功能。
          </p>

          {/* Stats Row */}
          <div className="mt-6 grid grid-cols-3 gap-3 md:gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 md:p-4">
              <div className="text-xs text-white/70 mb-1">今日获得</div>
              <div className="text-xl md:text-2xl font-bold">+{data.stats.today.earned}</div>
              <div className="text-xs text-white/60">{data.stats.today.count} 笔</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 md:p-4">
              <div className="text-xs text-white/70 mb-1">本周获得</div>
              <div className="text-xl md:text-2xl font-bold">+{data.stats.thisWeek.earned}</div>
              <div className="text-xs text-white/60">{data.stats.thisWeek.count} 笔</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 md:p-4">
              <div className="text-xs text-white/70 mb-1">本月获得</div>
              <div className="text-xl md:text-2xl font-bold">+{data.stats.thisMonth.earned}</div>
              <div className="text-xs text-white/60">{data.stats.thisMonth.count} 笔</div>
            </div>
          </div>
        </div>
      </div>

      {/* Earning Methods */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-green-600" />
          <h2 className="text-lg font-bold text-gray-900">如何获取积分</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {EARNING_METHODS.map((m, i) => (
            <div key={i} className="bg-white rounded-xl border p-4 hover:shadow-md transition-shadow">
              <div className="text-2xl mb-2">{m.icon}</div>
              <div className="font-semibold text-sm text-gray-900 mb-1">{m.title}</div>
              <div className="text-xs text-gray-500 mb-2">{m.desc}</div>
              <span className="inline-block text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">
                {m.badge}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Redeem Options */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Gift className="w-5 h-5 text-amber-600" />
          <h2 className="text-lg font-bold text-gray-900">积分兑换</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {REDEEM_OPTIONS.map((r, i) => (
            <div key={i} className="bg-white rounded-xl border p-4 flex items-start gap-3">
              <div className="text-2xl">{r.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-gray-900 mb-0.5">{r.title}</div>
                <div className="text-xs text-gray-500 mb-1">{r.desc}</div>
                <span className="inline-block text-[10px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full font-medium">
                  {r.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Growth Value & Badges Explanation */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-5">
        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          📈 成长值与勋章说明
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
          <div className="space-y-2">
            <p className="font-medium text-gray-900">🔹 积分</p>
            <ul className="space-y-1 text-xs">
              <li>• <strong>可消费</strong>，用于兑换 AI 次数、会员体验等站内权益</li>
              <li>• 兑换功能待开放</li>
            </ul>
          </div>
          <div className="space-y-2">
            <p className="font-medium text-gray-900">🔹 成长值</p>
            <ul className="space-y-1 text-xs">
              <li>• <strong>不可消费</strong>，只用于升级会员等级，不会被消耗</li>
              <li>• 等级从 Lv.1 到 Lv.5，通过积累成长值升级</li>
            </ul>
          </div>
          <div className="space-y-2">
            <p className="font-medium text-gray-900">🔹 勋章</p>
            <ul className="space-y-1 text-xs">
              <li>• 代表用户行为记录，可通过签到、点评、收藏、专题贡献等获得</li>
              <li>• 会员购买仍待开放，不要误导</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Growth Task Entry */}
      <Link
        href="/dashboard/tasks"
        className="block bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl border border-teal-200 p-5 hover:shadow-md transition-shadow"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center shrink-0">
            <span className="text-2xl">🎯</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 mb-1">成长任务中心</h3>
            <p className="text-sm text-gray-500">
              完成每日任务获取成长值和勋章，提升社区等级 →
            </p>
          </div>
          <ArrowLeft className="w-5 h-5 text-teal-500 shrink-0 rotate-180" />
        </div>
      </Link>

      {/* Membership Comparison */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Gem className="w-5 h-5 text-amber-600" />
          <h2 className="text-lg font-bold text-gray-900">会员权益对比</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MEMBERSHIP_TIERS.map((tier, i) => {
            const Icon = tier.icon;
            return (
              <div
                key={i}
                className={`relative bg-white rounded-xl border-2 p-6 flex flex-col ${
                  tier.popular ? "border-amber-400 shadow-lg" : "border-gray-200"
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-amber-500 text-white text-xs font-medium rounded-full">
                    推荐
                  </div>
                )}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-lg bg-${tier.color}-100 flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 text-${tier.color}-600`} />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{tier.name}</div>
                    <div className="text-sm text-gray-500">{tier.price}</div>
                  </div>
                </div>
                <ul className="space-y-2 flex-1 mb-5">
                  {tier.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-gray-700">
                      <Shield className="w-4 h-4 text-green-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                {tier.ctaLink ? (
                  <Link
                    href={tier.ctaLink}
                    className={`w-full text-center py-2.5 rounded-lg font-medium min-h-[44px] transition-colors ${
                      tier.popular
                        ? "bg-amber-500 text-white hover:bg-amber-600"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {tier.cta}
                  </Link>
                ) : (
                  <div
                    className={`w-full text-center py-2.5 rounded-lg font-medium min-h-[44px] text-sm ${
                      tier.popular
                        ? "bg-amber-50 text-amber-700"
                        : "bg-gray-50 text-gray-500"
                    }`}
                  >
                    {tier.cta}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Ledger Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-bold text-gray-900">积分明细</h2>
          <span className="text-sm text-gray-400">共 {data.pagination.total} 条</span>
        </div>

        {/* Type Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => { setTypeFilter(f.value); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
                typeFilter === f.value
                  ? "bg-teal-100 text-teal-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Ledger Table */}
        <div className="bg-white rounded-xl border overflow-hidden">
          {data.logs.length === 0 ? (
            <div className="text-center text-gray-400 py-12">
              <Coins className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>暂无积分记录</p>
              <p className="text-sm mt-1">通过签到和完成任务获取积分</p>
            </div>
          ) : (
            <div className="divide-y">
              {data.logs.map((log) => {
                const typeInfo = POINT_TYPE_LABELS[log.type] || { label: log.type, icon: "❓" };
                return (
                  <div key={log.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-lg shrink-0">{typeInfo.icon}</span>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-900">{typeInfo.label}</div>
                        {log.reason && log.reason !== typeInfo.label && (
                          <div className="text-xs text-gray-400 truncate">{log.reason}</div>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <div className={`text-sm font-bold ${log.points > 0 ? "text-green-600" : "text-red-600"}`}>
                        {log.points > 0 ? "+" : ""}{log.points}
                      </div>
                      <div className="text-xs text-gray-400">{formatTime(log.createdAt)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-500">
              第 {data.pagination.page} / {data.pagination.totalPages} 页，共 {data.pagination.total} 条
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded-lg border text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition-colors min-h-[44px]"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))}
                disabled={page >= data.pagination.totalPages}
                className="px-3 py-1.5 rounded-lg border text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition-colors min-h-[44px]"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl border border-teal-100 p-6">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-teal-600" />
          <h3 className="font-bold text-gray-900">快速入口</h3>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors min-h-[44px]">
            返回工作台
          </Link>
          <Link href="/ai-tools/product-copy" className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white text-gray-700 rounded-lg text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors min-h-[44px]">
            AI 商品文案
          </Link>
          <Link href="/ai-tools/translate-polish" className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white text-gray-700 rounded-lg text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors min-h-[44px]">
            AI 翻译润色
          </Link>
          <Link href="/resources" className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white text-gray-700 rounded-lg text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors min-h-[44px]">
            资源库
          </Link>
        </div>
      </div>
    </div>
  );
}
