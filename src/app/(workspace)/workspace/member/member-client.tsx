"use client";

import { Crown, Shield, Zap, Star, ArrowRight, Infinity, HeadphonesIcon, Sparkles } from "lucide-react";

const ROLE_META: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  admin: { label: "管理员", icon: <Shield className="w-5 h-5" />, color: "text-violet-600" },
  member: { label: "会员", icon: <Crown className="w-5 h-5" />, color: "text-amber-600" },
  user: { label: "免费版用户", icon: <Zap className="w-5 h-5" />, color: "text-slate-600" },
};

const BENEFITS_FREE = [
  { icon: <Zap className="w-4 h-4" />, label: "在线填写与实时预览", available: true },
  { icon: <Star className="w-4 h-4" />, label: "导出 PDF / PNG", available: true },
  { icon: <Shield className="w-4 h-4" />, label: "本地保存草稿 (10份)", available: true },
  { icon: <Sparkles className="w-4 h-4" />, label: "云端保存草稿", available: false },
  { icon: <Crown className="w-4 h-4" />, label: "上传公司 Logo", available: false },
  { icon: <Infinity className="w-4 h-4" />, label: "多套公司信息模板", available: false },
  { icon: <HeadphonesIcon className="w-4 h-4" />, label: "导出 Word (.docx)", available: false },
  { icon: <Shield className="w-4 h-4" />, label: "去除页脚品牌标识", available: false },
];

const BENEFITS_MEMBER = [
  { icon: <Zap className="w-4 h-4" />, label: "在线填写与实时预览", available: true },
  { icon: <Star className="w-4 h-4" />, label: "导出 PDF / PNG", available: true },
  { icon: <Shield className="w-4 h-4" />, label: "云端保存草稿 (无限)", available: true },
  { icon: <Crown className="w-4 h-4" />, label: "上传公司 Logo", available: true },
  { icon: <Infinity className="w-4 h-4" />, label: "多套公司信息模板 (10套)", available: true },
  { icon: <HeadphonesIcon className="w-4 h-4" />, label: "导出 Word (.docx)", available: true },
  { icon: <Shield className="w-4 h-4" />, label: "去除页脚品牌标识", available: true },
];

export default function MemberClient({ userData, permissions }: { userData: any; permissions: any }) {
  const role = userData?.role || "user";
  const roleInfo = ROLE_META[role] || ROLE_META.user;
  const isMember = role === "member";
  const memberUntil = userData?.memberUntil;
  const growthValue = userData?.growthValue || 0;

  const limits = permissions?.limits;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Identity card */}
      <div className="bg-gradient-to-br from-amber-50 to-teal-50 rounded-xl border border-amber-200 p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isMember ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-500"}`}>
            {roleInfo.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900 text-lg">{roleInfo.label}</span>
              {memberUntil && (
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                  有效期至 {new Date(memberUntil).toLocaleDateString("zh-CN")}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">成长值 {growthValue}</p>
          </div>
        </div>

        {!isMember && (
          <div className="mt-4 p-3 bg-white/80 rounded-lg border border-amber-100">
            <p className="text-sm text-gray-700">
              升级会员解锁更多权益：云端保存、Logo 上传、多套公司模板、Word 导出等。
            </p>
            <div className="mt-2 flex items-center gap-2">
              <button className="inline-flex items-center gap-1 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors">
                升级会员 <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs text-gray-400">支付系统即将上线</span>
            </div>
          </div>
        )}
      </div>

      {/* Current limits */}
      {limits && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-teal-600" /> 当前配额
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: "草稿上限", value: `${limits.maxDrafts} 份`, warn: limits.maxDrafts <= 10 },
              { label: "公司资料", value: `${limits.companyProfilesMax} 套`, warn: limits.companyProfilesMax <= 1 },
              { label: "标签批量", value: `${limits.labelBatchMax} 张/批`, warn: limits.labelBatchMax <= 5 },
              { label: "备忘上限", value: `${limits.memoMax} 条`, warn: limits.memoMax <= 10 },
              { label: "Word 导出", value: limits.canExportWord ? "可用" : "会员专属", warn: !limits.canExportWord },
              { label: "Logo 上传", value: limits.canUploadLogo ? "可用" : "会员专属", warn: !limits.canUploadLogo },
            ].map(item => (
              <div key={item.label} className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">{item.label}</div>
                <div className={`text-sm font-bold ${item.warn ? "text-amber-600" : "text-gray-900"}`}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Benefits comparison */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-900">权益对比</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">功能</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500">免费版</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-amber-600">会员版</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(isMember ? BENEFITS_MEMBER : BENEFITS_FREE).map((b, i) => (
                <tr key={i} className="hover:bg-gray-50/50">
                  <td className="px-6 py-3 text-gray-700 flex items-center gap-2">
                    <span className="text-gray-400">{b.icon}</span>
                    {b.label}
                  </td>
                  <td className="px-6 py-3 text-center text-gray-400">{isMember ? <span className="text-green-500">✓</span> : (b.available ? <span className="text-green-500">✓</span> : <span className="text-red-300">✗</span>)}</td>
                  <td className="px-6 py-3 text-center text-amber-600 font-medium"><span className="text-green-500">✓</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
