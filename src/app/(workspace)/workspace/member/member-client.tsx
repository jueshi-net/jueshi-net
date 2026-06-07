"use client";

import { Crown, Check, X, Sparkles } from "lucide-react";

const BENEFITS = [
  { name: "在线填写与实时预览", free: true, member: true },
  { name: "导出 PDF / PNG", free: true, member: true },
  { name: "本地保存草稿 (10份)", free: true, member: true },
  { name: "云端保存草稿", free: false, member: true },
  { name: "上传公司 Logo", free: false, member: true },
  { name: "多套公司信息模板", free: false, member: true },
  { name: "导出 Word (.docx)", free: false, member: true },
  { name: "去除页脚品牌标识", free: false, member: true },
];

export default function MemberClient({ user }: { user: any }) {
  const isMember = user.role === "admin" || user.role === "member";
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white shadow-lg flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1 flex items-center gap-2"><Crown className="w-6 h-6" /> 会员与权益</h1>
          <p className="text-amber-100 text-sm">当前身份: {isMember ? "尊贵会员" : "免费版用户"}</p>
        </div>
        {!isMember && (
          <button className="bg-white text-orange-600 px-5 py-2 rounded-xl font-semibold hover:bg-orange-50 transition-colors">升级会员</button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 flex items-center gap-2"><Sparkles className="w-4 h-4 text-amber-500" /> 权益对比</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-5 py-3 text-left font-medium text-gray-500">功能</th>
                <th className="px-5 py-3 text-center font-medium text-gray-400">免费版</th>
                <th className="px-5 py-3 text-center font-medium text-amber-600">会员版</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {BENEFITS.map((b, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-5 py-3 text-gray-700">{b.name}</td>
                  <td className="px-5 py-3 text-center">{b.free ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-gray-300 mx-auto" />}</td>
                  <td className="px-5 py-3 text-center"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
