"use client";

import { useState } from "react";
import { Building2, Plus, Edit3, Crown, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function CompanyProfilesClient({ profiles, isMember }: { profiles: any[]; isMember: boolean }) {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building2 className="w-6 h-6 text-purple-600" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">公司资料</h1>
            <p className="text-sm text-gray-500">管理你的公司信息，用于单据自动填充</p>
          </div>
        </div>
        <button
          onClick={() => { setEditingId(null); setShowModal(true); }}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> 新建
        </button>
      </div>

      {!isMember && profiles.length >= 1 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <Crown className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">免费版限制：最多 1 套公司资料</p>
            <p className="text-xs text-amber-600 mt-1">升级会员可创建最多 10 套公司模板</p>
          </div>
        </div>
      )}

      {profiles.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-10 text-center">
          <Building2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-1">还没有公司资料</p>
          <p className="text-sm text-gray-400 mb-4">创建公司资料后，填写单据时可以自动填充公司信息</p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700"
          >
            创建公司资料 <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {profiles.map(profile => (
            <div key={profile.id} className="bg-white border border-gray-100 rounded-xl p-5 hover:border-teal-200 hover:shadow-sm transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-gray-900">{profile.companyName || "未命名"}</h3>
                    <p className="text-xs text-gray-400">更新于 {new Date(profile.updatedAt).toLocaleDateString("zh-CN")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-1.5 text-xs text-gray-500">
                {profile.contactPerson && <p>联系人：{profile.contactPerson}</p>}
                {profile.email && <p>邮箱：{profile.email}</p>}
                {profile.phone && <p>电话：{profile.phone}</p>}
                {profile.address && <p className="truncate">地址：{profile.address}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="font-bold text-gray-900">{editingId ? "编辑公司资料" : "新建公司资料"}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <span className="text-gray-400 text-lg">✕</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">公司名称 <span className="text-red-500">*</span></label>
                <input type="text" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-200" placeholder="请输入公司全称" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">联系人</label>
                <input type="text" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-200" placeholder="联系人姓名" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">邮箱</label>
                  <input type="email" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-200" placeholder="company@example.com" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">电话</label>
                  <input type="tel" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-200" placeholder="+86" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">地址</label>
                <textarea className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-200" rows={2} placeholder="公司详细地址" />
              </div>
              {!isMember && (
                <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-xs text-amber-700">
                  免费版支持 1 套公司资料，不支持上传 Logo。<Link href="/workspace/member" className="text-teal-600 hover:underline inline-flex items-center gap-1">升级会员 <ExternalLink className="w-3 h-3" /></Link>
                </div>
              )}
            </div>
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-100 px-6 py-4 flex items-center justify-end gap-3 rounded-b-2xl">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">取消</button>
              <button className="px-5 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700">保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
