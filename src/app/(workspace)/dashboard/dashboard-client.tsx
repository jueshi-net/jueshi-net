"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Crown, Shield, Zap, Star, ChevronRight, ArrowRight,
  Sparkles, Infinity, HeadphonesIcon, Palette, Database,
  FileText, Link2, Bot, TrendingUp, Clock, Loader2,
} from "lucide-react";
import { buttonVariants, cardStyles, badgeStyles } from "@/lib/ui-styles";
import { isAdminRole } from "@/lib/auth/role-utils";

// ===== Types =====

interface MembershipData {
  growthValue: number;
  levelKey: string;
  level: { key: string; name: string; minGrowth: number; maxGrowth: number | null; iconText: string; color: string; benefits: any } | null;
  badges: { id: string; key: string; name: string; iconText: string; color: string; category: string; description: string | null; awardedAt: string; reason: string | null }[];
  nextLevel: { key: string; name: string; minGrowth: number; iconText: string; color: string } | null;
  isActiveMember: boolean;
  membershipStatus: "active" | "inactive";
  membershipExpiresAt: string | null;
}

interface PermissionsData {
  authenticated: boolean;
  role: string;
  limits: {
    memoMax: number;
    companyProfilesMax: number;
    labelBatchMax: number;
    maxDrafts: number;
    canUploadLogo: boolean;
    canUseCustomStyle: boolean;
    canRemoveBranding: boolean;
    canCloudDraft: boolean;
    canExportWord: boolean;
    wordExportDailyLimit: number;
  };
  points?: number;
  memberUntil?: string | null;
  isMember?: boolean;
}

interface DashboardData {
  role: string;
  points: number;
  checkinStreak: number;
  checkedInToday: boolean;
  todayEarned: number;
  todayLogCount: number;
  dailyPointCap: number;
  taskStats: { pending: number; done: number; archived: number; total: number };
  recentLogs: { id: string; type: string; points: number; reason: string | null; createdAt: string }[];
}

interface QuotaItem {
  icon: React.ReactNode;
  label: string;
  used: number;
  total: number;
  unit: string;
  upgradeHint: string;
}

// ===== Quota Progress Bar =====

function QuotaBar({ item }: { item: QuotaItem }) {
  const pct = Math.min((item.used / item.total) * 100, 100);
  const isWarning = pct >= 80;
  const isCritical = pct >= 95;

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500 group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
            {item.icon}
          </div>
          <div>
            <span className="text-sm font-medium text-gray-900">{item.label}</span>
            {isWarning && (
              <span className="ml-2 text-[10px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">即将用完</span>
            )}
          </div>
        </div>
        <div className="text-right">
          <span className={`text-sm font-bold ${isCritical ? "text-red-600" : isWarning ? "text-amber-600" : "text-gray-900"}`}>
            {item.used}
          </span>
          <span className="text-sm text-gray-400"> / {item.total} {item.unit}</span>
        </div>
      </div>
      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${
            isCritical
              ? "bg-gradient-to-r from-red-400 to-red-500"
              : isWarning
              ? "bg-gradient-to-r from-amber-400 to-amber-500"
              : "bg-gradient-to-r from-teal-400 to-emerald-400"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {pct < 100 && (
        <p className="text-[11px] text-gray-400 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          还可使用 {item.total - item.used} {item.unit} · {item.upgradeHint}
        </p>
      )}
    </div>
  );
}

// ===== Feature Card =====

function FeatureCard({ icon, title, desc, locked, upgradeLabel }: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  locked: boolean;
  upgradeLabel?: string;
}) {
  return (
    <div className={`relative p-5 rounded-2xl border transition-all hover:shadow-md hover:-translate-y-0.5 ${
      locked
        ? "bg-gray-50/50 border-gray-100"
        : "bg-white border-gray-100 hover:border-teal-200"
    }`}>
      {locked && (
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-500">
            会员专属
          </span>
        </div>
      )}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
        locked
          ? "bg-gray-100 text-gray-400"
          : "bg-gradient-to-br from-teal-50 to-emerald-50 text-teal-600"
      }`}>
        {icon}
      </div>
      <h4 className={`text-sm font-semibold mb-1 ${locked ? "text-gray-500" : "text-gray-900"}`}>
        {title}
      </h4>
      <p className={`text-xs leading-relaxed ${locked ? "text-gray-400" : "text-gray-500"}`}>
        {desc}
      </p>
      {locked && upgradeLabel && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <span className="text-[11px] font-medium text-teal-600 flex items-center gap-1">
            <Crown className="w-3 h-3" /> {upgradeLabel}
          </span>
        </div>
      )}
    </div>
  );
}

// ===== Main Component =====

export default function DashboardClient() {
  const [membership, setMembership] = useState<MembershipData | null>(null);
  const [permissions, setPermissions] = useState<PermissionsData | null>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginRequired, setLoginRequired] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      // Fetch membership data
      const memRes = await fetch("/api/me/membership");
      if (memRes.ok) {
        const memData = await memRes.json();
        if (memData?.success) setMembership(memData.data);
      }

      // Fetch permissions
      const permRes = await fetch("/api/me/permissions");
      if (permRes.ok) {
        const permData = await permRes.json();
        setPermissions(permData);
      }

      // Fetch dashboard summary for points
      const dashRes = await fetch("/api/dashboard/summary");
      if (dashRes.status === 401) {
        setLoginRequired(true);
      } else if (dashRes.ok) {
        const dashData = await dashRes.json();
        setDashboard(dashData);
      }
    } catch (e) {
      console.error("Failed to fetch membership data:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ===== Loading / Error States =====

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="h-36 bg-white rounded-2xl border border-gray-100 animate-pulse" />
        <div className="h-72 bg-white rounded-2xl border border-gray-100 animate-pulse" />
        <p className="text-center text-xs text-gray-400 animate-pulse">⏳ 会员数据加载中 (Loading Dashboard)...</p>
      </div>
    );
  }

  if (loginRequired) {
    return (
      <div className="flex items-center justify-center px-4 py-20">
        <div className="bg-white rounded-2xl border shadow-sm p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">请先登录</h1>
          <p className="text-gray-500 mb-6">会员权益与配额管理需要登录后使用</p>
          <Link href="/login" className={`${buttonVariants.primary} w-full justify-center`}>
            前往登录 <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // ===== Derived State =====

  const isPremium = membership?.isActiveMember || permissions?.isMember || permissions?.role === "member" || isAdminRole(permissions?.role);
  const userPoints = permissions?.points ?? dashboard?.points ?? 0;
  const memberUntil = membership?.membershipExpiresAt || permissions?.memberUntil;

  const roleLabels: Record<string, string> = { guest: "游客", user: "普通用户", member: "高级会员", admin: "管理员" };

  // Quota items (based on real limits from permissions)
  const quotas: QuotaItem[] = [
    {
      icon: <Link2 className="w-4 h-4" />,
      label: "自定义网址收藏",
      used: 0, // TODO: fetch from API
      total: permissions?.limits.memoMax || 20,
      unit: "个",
      upgradeHint: "会员可收藏 50 个",
    },
    {
      icon: <FileText className="w-4 h-4" />,
      label: "云草稿存储",
      used: 0, // TODO: fetch from API
      total: permissions?.limits.maxDrafts || 10,
      unit: "份",
      upgradeHint: "会员可存 100 份",
    },
    {
      icon: <Bot className="w-4 h-4" />,
      label: "AI 辅助次数",
      used: 0, // TODO: fetch from API
      total: 5,
      unit: "次/日",
      upgradeHint: "会员无限制",
    },
    {
      icon: <FileText className="w-4 h-4" />,
      label: "物流单据生成",
      used: 0, // TODO: fetch from API
      total: 10,
      unit: "份/日",
      upgradeHint: "会员无限制",
    },
    {
      icon: <Star className="w-4 h-4" />,
      label: "当前积分余额",
      used: userPoints,
      total: Math.max(userPoints + 500, 1000), // visual cap
      unit: "分",
      upgradeHint: "积分可兑换专属权益",
    },
  ];

  // ===== Render =====

  return (
    <div className="space-y-5">

      {/* ===== PREMIUM IDENTITY CARD ===== */}
      {isPremium ? (
        /* --- VIP State: Dark premium card --- */
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 shadow-lg">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-500/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-teal-500/10 to-transparent rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Crown icon */}
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30 flex-shrink-0">
              <Crown className="w-7 h-7 text-white" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-bold text-white">
                  {roleLabels[permissions?.role || "user"] || "高级会员"}
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Sparkles className="w-3 h-3" /> 尊享权益
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-300">
                {memberUntil && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    到期 {new Date(memberUntil).toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" })}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-400" />
                  积分 <span className="font-bold text-white">{userPoints}</span>
                </span>
                {membership && (
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-teal-400" />
                    成长值 {membership.growthValue}
                  </span>
                )}
              </div>
            </div>

            {/* Membership level badge */}
            {membership?.level && (
              <div className="flex-shrink-0 text-right">
                <div className="text-3xl mb-1">{membership.level.iconText}</div>
                <div className="text-xs text-gray-400">{membership.level.name}</div>
              </div>
            )}
          </div>

          {/* Progress to next level */}
          {membership?.nextLevel && (
            <div className="relative mt-5 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                <span>距离 {membership.nextLevel.iconText} {membership.nextLevel.name}</span>
                <span className="text-amber-400 font-medium">
                  还需 {membership.nextLevel.minGrowth - membership.growthValue} 成长值
                </span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-teal-400 rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min(
                      ((membership.growthValue - (membership.level?.minGrowth || 0)) /
                      (membership.nextLevel.minGrowth - (membership.level?.minGrowth || 0))) * 100,
                      100
                    )}%`
                  }}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        /* --- Free State: Clean card with upgrade CTA --- */
        <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
          {/* Decorative accent */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-teal-50 to-transparent rounded-full -translate-y-1/2 translate-x-1/3" />

          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Icon */}
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0">
              <Zap className="w-7 h-7 text-gray-500" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-bold text-gray-900">
                  {roleLabels[permissions?.role || "user"] || "普通用户"}
                </h2>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${badgeStyles.neutral}`}>
                  免费版
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-500" />
                  积分 <span className="font-bold text-gray-900">{userPoints}</span>
                </span>
                {membership && (
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-teal-500" />
                    成长值 {membership.growthValue}
                  </span>
                )}
              </div>
            </div>

            {/* Upgrade CTA */}
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl text-sm font-semibold hover:from-teal-700 hover:to-emerald-700 transition-all shadow-md shadow-teal-500/20 hover:shadow-lg hover:shadow-teal-500/30 hover:-translate-y-0.5 min-h-[44px]"
            >
              <Crown className="w-4 h-4" />
              升级高级会员
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Free user teaser */}
          <div className="relative mt-5 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-3">升级后可解锁以下权益：</p>
            <div className="flex flex-wrap gap-2">
              {["无限云草稿", "AI 无限制", "专属客服", "去品牌水印", "优先新功能"].map((t) => (
                <span key={t} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-teal-50 text-teal-700 border border-teal-100">
                  <Sparkles className="w-3 h-3" /> {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== QUOTA & USAGE DASHBOARD ===== */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-teal-600" />
              我的权益与配额
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">查看各项功能的使用情况与剩余容量</p>
          </div>
          {isPremium && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-teal-50 text-teal-700 border border-teal-100">
              <Infinity className="w-3 h-3" /> 会员扩容中
            </span>
          )}
        </div>

        <div className="space-y-5">
          {quotas.map((q, i) => (
            <QuotaBar key={i} item={q} />
          ))}
        </div>
      </div>

      {/* ===== FEATURES UNLOCK GRID ===== */}
      <div>
        <div className="mb-4">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            升级后可解锁的特权
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">高级会员专享，让工作更高效</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <FeatureCard
            icon={<Infinity className="w-5 h-5" />}
            title="无限容量"
            desc="云草稿、网址收藏、工具使用次数无上限，随心使用不设限"
            locked={!isPremium}
            upgradeLabel={isPremium ? "已解锁 ✓" : "升级后无限使用"}
          />
          <FeatureCard
            icon={<Bot className="w-5 h-5" />}
            title="高阶 AI 辅助"
            desc="每日 AI 辅助次数无限制，智能生成单据、翻译、数据分析"
            locked={!isPremium}
            upgradeLabel={isPremium ? "已解锁 ✓" : "每日 5 次 → 无限制"}
          />
          <FeatureCard
            icon={<HeadphonesIcon className="w-5 h-5" />}
            title="优先客服"
            desc="专属客服通道，工作日 2 小时内响应，问题优先处理"
            locked={!isPremium}
            upgradeLabel={isPremium ? "已解锁 ✓" : "升级后专享"}
          />
          <FeatureCard
            icon={<Palette className="w-5 h-5" />}
            title="去品牌水印"
            desc="导出的单据和文档不再带有平台品牌标识，专业形象加分"
            locked={!isPremium}
            upgradeLabel={isPremium ? "已解锁 ✓" : "升级后自动移除"}
          />
          <FeatureCard
            icon={<FileText className="w-5 h-5" />}
            title="高阶汇率工具"
            desc="实时汇率 API、历史走势、多币种换算、自定义汇率提醒"
            locked={!isPremium}
            upgradeLabel={isPremium ? "已解锁 ✓" : "升级后解锁"}
          />
          <FeatureCard
            icon={<TrendingUp className="w-5 h-5" />}
            title="成长加速"
            desc="会员签到和任务获得双倍成长值，等级提升更快，专属勋章"
            locked={!isPremium}
            upgradeLabel={isPremium ? "已解锁 ✓" : "升级后 2× 加速"}
          />
        </div>
      </div>

      {/* ===== RECENT POINT LOGS (compact) ===== */}
      {dashboard?.recentLogs && dashboard.recentLogs.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500" />
              最近积分记录
            </h3>
            <Link href="/dashboard/points" className="text-xs text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1">
              查看全部 <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="p-5">
            <div className="divide-y divide-gray-50">
              {dashboard.recentLogs.slice(0, 3).map((log) => (
                <div key={log.id} className="flex items-center justify-between py-2.5">
                  <span className="text-xs text-gray-600">{log.type === "daily_checkin" ? "每日签到" : log.type === "task_complete" ? "完成任务" : log.reason || log.type}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold ${log.points > 0 ? "text-green-600" : "text-red-600"}`}>
                      {log.points > 0 ? "+" : ""}{log.points}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(log.createdAt).toLocaleDateString("zh-CN", { month: "2-digit", day: "2-digit" })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== MEMBERSHIP GROWTH (if data available) ===== */}
      {membership && membership.badges.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4">
            <Crown className="w-4 h-4 text-amber-500" />
            已获得勋章
          </h3>
          <div className="flex flex-wrap gap-2">
            {membership.badges.slice(0, 8).map((b) => (
              <div
                key={b.id}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100 text-xs font-medium text-gray-700"
              >
                <span className="text-sm">{b.iconText}</span>
                {b.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
