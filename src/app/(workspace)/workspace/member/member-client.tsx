"use client";

import { Crown, Shield, Zap, Star, ArrowRight, Infinity, HeadphonesIcon, Sparkles, Check, X as XIcon, TrendingUp, Award } from "lucide-react";
import Link from "next/link";
import PageHeader from "@/components/workspace/PageHeader";

const ROLE_META: Record<string, { label: string; icon: React.ReactNode; color: string; gradient: string }> = {
  admin: { 
    label: "管理员", 
    icon: <Shield className="w-5 h-5" />, 
    color: "text-violet-600",
    gradient: "from-violet-500 to-purple-600"
  },
  member: { 
    label: "会员", 
    icon: <Crown className="w-5 h-5" />, 
    color: "text-amber-600",
    gradient: "from-amber-400 to-orange-500"
  },
  user: { 
    label: "免费版用户", 
    icon: <Zap className="w-5 h-5" />, 
    color: "text-slate-600",
    gradient: "from-gray-400 to-slate-500"
  },
};

const BENEFITS = [
  { icon: <Zap className="w-4 h-4" />, label: "在线填写与实时预览", free: true, member: true },
  { icon: <Star className="w-4 h-4" />, label: "导出 PDF / PNG", free: true, member: true },
  { icon: <Shield className="w-4 h-4" />, label: "本地保存草稿 (10份)", free: true, member: true },
  { icon: <Sparkles className="w-4 h-4" />, label: "云端保存草稿 (无限)", free: false, member: true },
  { icon: <Crown className="w-4 h-4" />, label: "上传公司 Logo", free: false, member: true },
  { icon: <Infinity className="w-4 h-4" />, label: "多套公司信息模板 (10套)", free: false, member: true },
  { icon: <HeadphonesIcon className="w-4 h-4" />, label: "导出 Word (.docx)", free: false, member: true },
  { icon: <Shield className="w-4 h-4" />, label: "去除页脚品牌标识", free: false, member: true },
];

export default function MemberClient({ userData, permissions }: { userData: any; permissions: any }) {
  const role = userData?.role || "user";
  const roleInfo = ROLE_META[role] || ROLE_META.user;
  const isMember = role === "member";
  const memberUntil = userData?.memberUntil;
  const growthValue = userData?.growthValue || 0;

  const limits = permissions?.limits;

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        icon={<Crown className="w-5 h-5" />}
        title="会员与权益"
        description="查看你的会员状态、配额和权益"
      />

      {/* 会员状态卡 */}
      <div className={`bg-gradient-to-br ${roleInfo.gradient} rounded-2xl p-6 text-white mb-6 shadow-lg`}>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
            {roleInfo.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl font-bold">{roleInfo.label}</span>
              {memberUntil && (
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
                  有效期至 {new Date(memberUntil).toLocaleDateString("zh-CN")}
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" />
                <span>成长值 {growthValue}</span>
              </div>
            </div>
          </div>
        </div>

        {!isMember && (
          <div className="mt-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
            <p className="text-sm mb-3">
              升级会员解锁更多权益：云端保存、Logo 上传、多套公司模板、Word 导出等。
            </p>
            <div className="flex items-center gap-3">
              <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-amber-600 rounded-lg text-sm font-bold hover:bg-white/90 transition-colors shadow-sm">
                升级会员 <ArrowRight className="w-4 h-4" />
              </button>
              <span className="text-xs text-white/80">支付系统内测中，请联系管理员</span>
            </div>
          </div>
        )}

        {isMember && (
          <div className="mt-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
            <p className="text-sm">
              🎉 感谢你的支持！你已解锁全部会员权益。
            </p>
          </div>
        )}
      </div>

      {/* 当前配额 */}
      {limits && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-teal-600" /> 
            当前配额
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: "草稿上限", value: `${limits.maxDrafts} 份`, warn: limits.maxDrafts <= 10, icon: "📄" },
              { label: "公司资料", value: `${limits.companyProfilesMax} 套`, warn: limits.companyProfilesMax <= 1, icon: "🏢" },
              { label: "标签批量", value: `${limits.labelBatchMax} 张/批`, warn: limits.labelBatchMax <= 5, icon: "🏷️" },
              { label: "备忘上限", value: `${limits.memoMax} 条`, warn: limits.memoMax <= 10, icon: "📝" },
              { label: "Word 导出", value: limits.canExportWord ? "可用" : "会员专属", warn: !limits.canExportWord, icon: "📤" },
              { label: "Logo 上传", value: limits.canUploadLogo ? "可用" : "会员专属", warn: !limits.canUploadLogo, icon: "🖼️" },
            ].map(item => (
              <div 
                key={item.label} 
                className={`rounded-xl p-4 border ${
                  item.warn 
                    ? 'bg-amber-50 border-amber-200' 
                    : 'bg-gray-50 border-gray-100'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{item.icon}</span>
                  <div className="text-xs text-gray-500">{item.label}</div>
                </div>
                <div className={`text-lg font-bold ${item.warn ? "text-amber-600" : "text-gray-900"}`}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 升级理由 */}
      {!isMember && (
        <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl border border-teal-100 p-6 mb-6">
          <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-600" />
            为什么升级会员？
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { title: "多公司主体", desc: "支持 10 套公司模板，管理多个业务主体" },
              { title: "正式文档导出", desc: "导出 Word (.docx) 格式，方便编辑和打印" },
              { title: "Logo 品牌化", desc: "上传公司 Logo，单据自动显示品牌标识" },
              { title: "云端草稿保存", desc: "无限云端存储，随时随地访问你的草稿" },
              { title: "去除品牌标识", desc: "去除页脚品牌标识，单据更专业" },
              { title: "批量标签打印", desc: "每批最多 20 张标签，提高效率" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 text-teal-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900 mb-0.5">{item.title}</div>
                  <div className="text-xs text-gray-500">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 权益对比表 */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-900">权益对比</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">功能</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500">免费版</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-amber-600 bg-amber-50">会员版</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {BENEFITS.map((b, i) => (
                <tr key={i} className="hover:bg-gray-50/50">
                  <td className="px-6 py-3 text-gray-700">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">{b.icon}</span>
                      {b.label}
                    </div>
                  </td>
                  <td className="px-6 py-3 text-center">
                    {b.free ? (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-50">
                        <Check className="w-3.5 h-3.5 text-green-500" />
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-50">
                        <XIcon className="w-3.5 h-3.5 text-red-300" />
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-center bg-amber-50/30">
                    {b.member ? (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-50">
                        <Check className="w-3.5 h-3.5 text-green-500" />
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-50">
                        <XIcon className="w-3.5 h-3.5 text-red-300" />
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CTA */}
      {!isMember && (
        <div className="mt-6 bg-white rounded-xl border border-gray-100 p-6 text-center">
          <h3 className="text-base font-bold text-gray-900 mb-2">准备好升级了吗？</h3>
          <p className="text-sm text-gray-500 mb-4">解锁全部会员权益，提升工作效率</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg text-sm font-bold hover:bg-teal-700 transition-colors shadow-sm">
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
  );
}
