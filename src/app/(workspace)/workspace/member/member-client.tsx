"use client";

import { Crown, Shield, Zap, Star, ArrowRight, Infinity, HeadphonesIcon, Sparkles, Check, X as XIcon, TrendingUp, Award, Megaphone, Calendar, Upload, Send, Gift } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { MetricCard } from "@/components/saas/MetricCard";
import { SectionCard } from "@/components/saas/SectionCard";
import { ActionCard } from "@/components/saas/ActionCard";
import { StatusBadge } from "@/components/saas/StatusBadge";
import { CompactTable } from "@/components/saas/CompactTable";
import { WorkspacePageHeader } from "@/components/saas/WorkspacePageHeader";
import { track } from "@/lib/analytics";

// Points Redemption Section Component
function PointsRedemptionSection({ userPoints }: { userPoints: number }) {
  const [rewardItems, setRewardItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/rewards/items")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setRewardItems(data.items || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleRedeem = async (itemId: string, itemName: string, costPoints: number) => {
    if (userPoints < costPoints) {
      setError("积分不足");
      return;
    }
    setRedeeming(itemId);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/rewards/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rewardItemId: itemId }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(`成功兑换 ${itemName}！`);
        track({ eventType: "reward_redeem", toolName: "member", action: "redeem", path: "/workspace/member", metadata: { itemId, itemName } });
        setTimeout(() => setSuccess(null), 3000);
        // Refresh reward items
        const refreshed = await fetch("/api/rewards/items").then((r) => r.json());
        if (refreshed.success) setRewardItems(refreshed.items || []);
      } else {
        setError(data.error || "兑换失败");
      }
    } catch {
      setError("网络错误，请重试");
    }
    setRedeeming(null);
  };

  if (loading) {
    return (
      <SectionCard title="积分兑换" subtitle="使用积分兑换会员天数、广告权益等奖励">
        <div className="text-sm text-gray-400">加载中...</div>
      </SectionCard>
    );
  }

  // Filter out ad_slot_7day — ad slots are managed separately via ad entitlements page
  const visibleItems = rewardItems.filter((item) => item.code !== "ad_slot_7day");

  if (visibleItems.length === 0) {
    return (
      <SectionCard title="积分兑换" subtitle="使用积分兑换会员天数、广告权益等奖励">
        <div className="text-sm text-gray-500">
          <p>当前积分：<span className="font-bold text-teal-600">{userPoints}</span></p>
          <p className="text-xs text-gray-400 mt-2">暂无可兑换的奖励项。请联系管理员添加奖励项。</p>
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="积分兑换" subtitle="使用积分兑换会员天数、广告权益等奖励">
      {success && <div className="bg-green-50 border border-green-200 rounded-lg p-2 mb-4 text-xs text-green-700">{success}</div>}
      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-2 mb-4 text-xs text-red-700">{error}</div>}
      <div className="text-sm text-gray-600 mb-4">
        当前积分：<span className="font-bold text-teal-600">{userPoints}</span>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {visibleItems.map((item) => {
          const canAfford = userPoints >= item.costPoints;
          const isRedeeming = redeeming === item.id;
          return (
            <div key={item.id} className="flex flex-col p-4 rounded-lg border border-gray-100 hover:border-teal-200 hover:bg-teal-50/30 transition-all">
              <div className="flex-1">
                <div className="text-sm font-bold text-gray-900 mb-1">{item.name}</div>
                {item.description && <div className="text-xs text-gray-500 mb-2">{item.description}</div>}
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-amber-600 font-bold">{item.costPoints} 积分</span>
                  <span className="text-gray-400">→</span>
                  <span className="text-teal-600">
                    {item.rewardType === "member_trial" && `${item.rewardValue} 天会员`}
                    {item.rewardType === "ad_slot_days" && `${item.rewardValue} 天广告`}
                    {item.rewardType === "word_export_coupon" && `${item.rewardValue} 次导出`}
                    {item.rewardType === "no_branding_coupon" && `${item.rewardValue} 次去品牌`}
                    {item.rewardType === "points" && `${item.rewardValue} 积分`}
                    {item.rewardType === "growth" && `成长值权益 +${item.rewardValue}`}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleRedeem(item.id, item.name, item.costPoints)}
                disabled={!canAfford || isRedeeming}
                className={`mt-3 w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  canAfford && !isRedeeming
                    ? "bg-teal-600 text-white hover:bg-teal-700"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                {isRedeeming ? "兑换中..." : canAfford ? "立即兑换" : "积分不足"}
              </button>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}


const ROLE_META: Record<string, { label: string; icon: React.ReactNode; color: string; gradient: string; badgeVariant: "success" | "warning" | "neutral" | "processing" | "info" | "danger" | "pending" }> = {
  admin: {
    label: "管理员",
    icon: <Shield className="w-5 h-5" />,
    color: "text-violet-600",
    gradient: "from-violet-500 to-purple-600",
    badgeVariant: "processing",
  },
  member: {
    label: "会员",
    icon: <Crown className="w-5 h-5" />,
    color: "text-amber-600",
    gradient: "from-amber-400 to-orange-500",
    badgeVariant: "success",
  },
  user: {
    label: "免费版用户",
    icon: <Zap className="w-5 h-5" />,
    color: "text-slate-600",
    gradient: "from-gray-400 to-slate-500",
    badgeVariant: "neutral",
  },
};

const BENEFITS = [
  { feature: "在线填写与实时预览", icon: <Zap className="w-4 h-4" />, free: true, member: true },
  { feature: "导出 PDF / PNG", icon: <Star className="w-4 h-4" />, free: true, member: true },
  { feature: "本地保存草稿 (10份)", icon: <Shield className="w-4 h-4" />, free: true, member: true },
  { feature: "云端保存草稿 (无限)", icon: <Sparkles className="w-4 h-4" />, free: false, member: true },
  { feature: "上传公司 Logo", icon: <Crown className="w-4 h-4" />, free: false, member: true },
  { feature: "多套公司信息模板 (10套)", icon: <Infinity className="w-4 h-4" />, free: false, member: true },
  { feature: "导出 Word (.docx)", icon: <HeadphonesIcon className="w-4 h-4" />, free: false, member: true },
  { feature: "去除页脚品牌标识", icon: <Shield className="w-4 h-4" />, free: false, member: true },
];

export default function MemberClient({ userData, permissions }: { userData: any; permissions: any }) {
  const role = userData?.role || "user";
  const roleInfo = ROLE_META[role] || ROLE_META.user;
  const isMember = role === 'member';
  const memberUntil = userData?.memberUntil;
  const growthValue = userData?.growthValue || 0;

  const limits = permissions?.limits;

  // Ad entitlement state
  const [adData, setAdData] = useState<any>(null);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [applyForm, setApplyForm] = useState({ placementKey: "", description: "", materialUrl: "", materialType: "image", startDate: "", endDate: "" });
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState("");
  const [applySuccess, setApplySuccess] = useState(false);

  useEffect(() => {
    fetch("/api/workspace/ad-entitlements")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setAdData(data);
          track({ eventType: "ad_entitlement_view", toolName: "ad-entitlements", action: "view", path: "/workspace/member" });
        }
      })
      .catch(() => {});
  }, []);

  // Hash-based section navigation: scroll to #rewards or top based on URL hash
  useEffect(() => {
    const scrollToSection = () => {
      const hash = window.location.hash;
      if (hash === "#rewards") {
        const el = document.getElementById("rewards");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }
      }
      // #benefits or empty hash → scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Handle initial hash on mount (small delay for DOM render)
    const timer = setTimeout(scrollToSection, 100);

    // Listen for hash changes (e.g., clicking sidebar link while already on page)
    window.addEventListener("hashchange", scrollToSection);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("hashchange", scrollToSection);
    };
  }, []);

  const handleApply = async () => {
    setApplyError("");
    setApplySuccess(false);
    if (!applyForm.placementKey || !applyForm.description) {
      setApplyError("请选择广告位并填写说明");
      return;
    }
    setApplying(true);
    try {
      const res = await fetch("/api/workspace/ad-entitlements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(applyForm),
      });
      const data = await res.json();
      if (data.success) {
        setApplySuccess(true);
        setShowApplyForm(false);
        setApplyForm({ placementKey: "", description: "", materialUrl: "", materialType: "image", startDate: "", endDate: "" });
        track({ eventType: "ad_entitlement_apply", toolName: "ad-entitlements", action: "apply", path: "/workspace/member", metadata: { placementKey: applyForm.placementKey } });
        const refreshed = await fetch("/api/workspace/ad-entitlements").then((r) => r.json());
        if (refreshed.success) setAdData(refreshed);
      } else {
        setApplyError(data.error || "提交失败");
      }
    } catch {
      setApplyError("网络错误，请重试");
    }
    setApplying(false);
  };

  const upgradeBenefits = [
    { title: "多公司主体", desc: "支持 10 套公司模板，管理多个业务主体", icon: <Shield className="w-4 h-4" /> },
    { title: "正式文档导出", desc: "导出 Word (.docx) 格式，方便编辑和打印", icon: <Upload className="w-4 h-4" /> },
    { title: "Logo 品牌化", desc: "上传公司 Logo，单据自动显示品牌标识", icon: <Crown className="w-4 h-4" /> },
    { title: "云端草稿保存", desc: "无限云端存储，随时随地访问你的草稿", icon: <Infinity className="w-4 h-4" /> },
    { title: "去除品牌标识", desc: "去除页脚品牌标识，单据更专业", icon: <Sparkles className="w-4 h-4" /> },
    { title: "批量标签打印", desc: "每批最多 20 张标签，提高效率", icon: <Award className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Page Header */}
      <WorkspacePageHeader
        title="会员中心"
        subtitle="管理会员权益、查看配额和使用情况"
        icon={<Crown className="w-5 h-5" />}
        breadcrumbs={[
          { label: "工作台", href: "/workspace" },
          { label: "会员中心" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge
              label={roleInfo.label}
              variant={roleInfo.badgeVariant}
              icon={roleInfo.icon}
              size="md"
            />
            {!isMember && (
              <button className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg text-xs font-bold hover:from-amber-600 hover:to-orange-600 transition-all shadow-sm">
                升级会员 <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        }
      />

      <div id="benefits" className="px-4 py-6 space-y-6">
        {/* Section Header: 会员权益 */}
        <div className="flex items-center gap-2 mb-2">
          <Crown className="w-5 h-5 text-amber-600" />
          <h2 className="text-base font-bold text-gray-900">会员权益</h2>
        </div>

        {/* Hero: Membership Status */}
        <div className={`bg-gradient-to-br ${roleInfo.gradient} rounded-xl p-6 text-white shadow-lg relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-12 translate-x-12" />
          <div className="absolute bottom-0 left-0 w-28 h-28 bg-white/5 rounded-full translate-y-8 -translate-x-8" />
          <div className="relative">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                {roleInfo.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl font-bold">{roleInfo.label}</span>
                  {memberUntil && (
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm inline-flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      有效期至 {new Date(memberUntil).toLocaleDateString("zh-CN")}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-white/80">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4" />
                    <span>成长值 {growthValue}</span>
                  </div>
                </div>
              </div>
              {!isMember && (
                <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-amber-600 rounded-lg text-sm font-bold hover:bg-white/90 transition-colors shadow-sm">
                  升级会员 <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
            {isMember && (
              <div className="mt-4 p-3 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20 text-sm">
                🎉 感谢你的支持！你已解锁全部会员权益。
              </div>
            )}
            {!isMember && (
              <div className="mt-4 p-3 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20 text-sm">
                升级会员解锁更多权益：云端保存、Logo 上传、多套公司模板、Word 导出等。
                <span className="text-white/70 ml-2">支付系统内测中，请联系管理员</span>
              </div>
            )}
          </div>
        </div>

        {/* Quota Metrics */}
        {limits && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <MetricCard
              label="草稿上限"
              value={`${limits.maxDrafts} 份`}
              icon={<span className="text-lg">📄</span>}
            />
            <MetricCard
              label="公司资料"
              value={`${limits.companyProfilesMax} 套`}
              icon={<span className="text-lg">🏢</span>}
            />
            <MetricCard
              label="标签批量"
              value={`${limits.labelBatchMax} 张`}
              icon={<span className="text-lg">🏷️</span>}
            />
            <MetricCard
              label="备忘上限"
              value={`${limits.memoMax} 条`}
              icon={<span className="text-lg">📝</span>}
            />
            <MetricCard
              label="Word 导出"
              value={limits.canExportWord ? "可用" : "会员"}
              icon={<span className="text-lg">📤</span>}
              trend={limits.canExportWord ? { value: "已解锁", positive: true } : undefined}
            />
            <MetricCard
              label="Logo 上传"
              value={limits.canUploadLogo ? "可用" : "会员"}
              icon={<span className="text-lg">🖼️</span>}
              trend={limits.canUploadLogo ? { value: "已解锁", positive: true } : undefined}
            />
          </div>
        )}

        {/* Ad Entitlements */}
        <SectionCard
          title="广告权益"
          subtitle="通过邀请好友获得广告位展示天数"
          action={
            adData && (adData.summary?.availableDays || 0) > 0 && !showApplyForm ? (
              <button
                onClick={() => {
                  setShowApplyForm(true);
                  track({ eventType: "ad_entitlement_view", toolName: "ad-entitlements", action: "click_apply", path: "/workspace/member" });
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-medium hover:bg-purple-700 transition-colors"
              >
                <Send className="w-3.5 h-3.5" /> 申请使用
              </button>
            ) : null
          }
        >
          {adData ? (
            <>
              {/* Ad Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <div className="rounded-lg p-3 bg-purple-50 border border-purple-100">
                  <div className="text-[10px] text-gray-500 mb-0.5">可用天数</div>
                  <div className="text-xl font-bold text-purple-600">{adData.summary?.availableDays || 0}</div>
                </div>
                <div className="rounded-lg p-3 bg-green-50 border border-green-100">
                  <div className="text-[10px] text-gray-500 mb-0.5">已获得</div>
                  <div className="text-xl font-bold text-green-600">{adData.summary?.totalDays || 0}</div>
                </div>
                <div className="rounded-lg p-3 bg-blue-50 border border-blue-100">
                  <div className="text-[10px] text-gray-500 mb-0.5">已使用</div>
                  <div className="text-xl font-bold text-blue-600">{adData.summary?.usedDays || 0}</div>
                </div>
                <div className="rounded-lg p-3 bg-gray-50 border border-gray-100">
                  <div className="text-[10px] text-gray-500 mb-0.5">已过期</div>
                  <div className="text-xl font-bold text-gray-400">{adData.summary?.expiredDays || 0}</div>
                </div>
              </div>

              {(adData.summary?.availableDays || 0) <= 0 && (
                <p className="text-xs text-gray-500 mb-4">
                  暂无可用广告权益天数。通过邀请好友可获得广告位展示天数。
                </p>
              )}

              {/* Apply Form */}
              {showApplyForm && (
                <div className="bg-purple-50 border border-purple-100 rounded-lg p-4 mb-4">
                  <h3 className="text-sm font-bold text-gray-900 mb-3">申请广告位</h3>
                  {applyError && <div className="bg-red-50 border border-red-200 rounded-lg p-2 mb-3 text-xs text-red-700">{applyError}</div>}
                  {applySuccess && <div className="bg-green-50 border border-green-200 rounded-lg p-2 mb-3 text-xs text-green-700">申请已提交，等待管理员审核</div>}

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">选择广告位 *</label>
                      <select
                        value={applyForm.placementKey}
                        onChange={(e) => setApplyForm({ ...applyForm, placementKey: e.target.value })}
                        className="w-full border border-gray-200 rounded-lg p-2 text-sm bg-white"
                      >
                        <option value="">请选择广告位</option>
                        {(adData.placements || []).map((p: any) => (
                          <option key={p.key} value={p.key}>{p.name} ({p.pageType}/{p.zone})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">申请说明 *</label>
                      <textarea
                        value={applyForm.description}
                        onChange={(e) => setApplyForm({ ...applyForm, description: e.target.value })}
                        className="w-full border border-gray-200 rounded-lg p-2 text-sm bg-white"
                        rows={2}
                        placeholder="请描述您的广告内容和投放目的..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-600 block mb-1">素材类型</label>
                        <select
                          value={applyForm.materialType}
                          onChange={(e) => setApplyForm({ ...applyForm, materialType: e.target.value })}
                          className="w-full border border-gray-200 rounded-lg p-2 text-sm bg-white"
                        >
                          <option value="image">图片</option>
                          <option value="html">HTML</option>
                          <option value="text">文字</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 block mb-1">素材 URL</label>
                        <input
                          type="text"
                          value={applyForm.materialUrl}
                          onChange={(e) => setApplyForm({ ...applyForm, materialUrl: e.target.value })}
                          className="w-full border border-gray-200 rounded-lg p-2 text-sm bg-white"
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-600 block mb-1">开始日期</label>
                        <input
                          type="date"
                          value={applyForm.startDate}
                          onChange={(e) => setApplyForm({ ...applyForm, startDate: e.target.value })}
                          className="w-full border border-gray-200 rounded-lg p-2 text-sm bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 block mb-1">结束日期</label>
                        <input
                          type="date"
                          value={applyForm.endDate}
                          onChange={(e) => setApplyForm({ ...applyForm, endDate: e.target.value })}
                          className="w-full border border-gray-200 rounded-lg p-2 text-sm bg-white"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleApply}
                        disabled={applying}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
                      >
                        {applying ? "提交中..." : "提交申请"}
                      </button>
                      <button
                        onClick={() => { setShowApplyForm(false); setApplyError(""); }}
                        className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Application Records */}
              {adData.applications && adData.applications.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-xs font-medium text-gray-700 mb-2">申请记录</h3>
                  <div className="space-y-1.5">
                    {adData.applications.slice(0, 5).map((app: any) => (
                      <div key={app.id} className="flex items-center justify-between text-xs bg-gray-50 rounded-lg p-2.5">
                        <div className="flex items-center gap-3">
                          <span className="text-gray-600">{app.placementKey}</span>
                          <StatusBadge
                            label={app.status === "PENDING" ? "待审核" : app.status === "APPROVED" ? "已批准" : app.status === "REJECTED" ? "已拒绝" : app.status}
                            variant={app.status === "PENDING" ? "warning" : app.status === "APPROVED" ? "success" : app.status === "REJECTED" ? "danger" : "neutral"}
                            size="sm"
                            dot
                          />
                        </div>
                        <span className="text-gray-400">{new Date(app.createdAt).toLocaleDateString("zh-CN")}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-sm text-gray-400">加载中...</div>
          )}
        </SectionCard>

        {/* Section Divider: 积分兑换 */}
        <div className="pt-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-gray-200" />
            <div className="flex items-center gap-2 px-4 py-1.5 bg-teal-50 rounded-full border border-teal-100">
              <Gift className="w-4 h-4 text-teal-600" />
              <span className="text-sm font-bold text-teal-700">积分兑换</span>
            </div>
            <div className="h-px flex-1 bg-gray-200" />
          </div>
        </div>

        {/* Points Redemption */}
        <div id="rewards" className="scroll-mt-6">
          <PointsRedemptionSection userPoints={userData?.points || 0} />
        </div>

        {/* Why Upgrade - Action Cards */}
        {!isMember && (
          <SectionCard title="为什么升级会员？" subtitle="解锁全部高级功能">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {upgradeBenefits.map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:border-teal-200 hover:bg-teal-50/30 transition-all">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0 text-teal-600">
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{item.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* Benefits Comparison Table */}
        <SectionCard title="权益对比" subtitle="免费版 vs 会员版功能对比">
          <CompactTable
            columns={[
              {
                key: "feature",
                header: "功能",
                render: (row: typeof BENEFITS[0]) => (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">{row.icon}</span>
                    <span className="text-gray-700">{row.feature}</span>
                  </div>
                ),
              },
              {
                key: "free",
                header: "免费版",
                align: "center",
                width: "100px",
                render: (row: typeof BENEFITS[0]) => (
                  row.free ? (
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-50">
                      <Check className="w-4 h-4 text-green-500" />
                    </span>
                  ) : (
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-50">
                      <XIcon className="w-4 h-4 text-red-300" />
                    </span>
                  )
                ),
              },
              {
                key: "member",
                header: "会员版",
                align: "center",
                width: "100px",
                render: (row: typeof BENEFITS[0]) => (
                  row.member ? (
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-50">
                      <Check className="w-4 h-4 text-green-500" />
                    </span>
                  ) : (
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-50">
                      <XIcon className="w-4 h-4 text-red-300" />
                    </span>
                  )
                ),
              },
            ]}
            data={BENEFITS}
            rowKey={(row, idx) => `benefit-${idx}`}
            striped
            hoverable
          />
        </SectionCard>

        {/* CTA */}
        {!isMember && (
          <div className="bg-gradient-to-r from-teal-50 via-cyan-50 to-blue-50 rounded-xl border border-teal-200 p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Crown className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">准备好升级了吗？</h3>
            <p className="text-sm text-gray-500 mb-5 max-w-md mx-auto">解锁全部会员权益，提升工作效率，享受更专业的服务体验</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg text-sm font-bold hover:from-teal-700 hover:to-cyan-700 transition-all shadow-md">
                升级会员 <ArrowRight className="w-4 h-4" />
              </button>
              <Link
                href="/feedback"
                className="text-sm text-teal-600 hover:underline"
              >
                联系管理员
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
