"use client";

import { useState } from "react";
import { Building2, Plus, Edit3, Crown, ExternalLink, Mail, Phone, MapPin, Check } from "lucide-react";
import Link from "next/link";
import PageHeader from "@/components/workspace/PageHeader";
import EmptyState from "@/components/workspace/EmptyState";

export default function CompanyProfilesClient({ profiles, isMember }: { profiles: any[]; isMember: boolean }) {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const maxProfiles = isMember ? 10 : 1;
  const canCreate = profiles.length < maxProfiles;

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        icon={<Building2 className="w-5 h-5" />}
        title="公司资料"
        description="管理你的公司信息，用于单据自动填充"
        action={
          canCreate ? (
            <button
              onClick={() => { setEditingId(null); setShowModal(true); }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
            >
              <Plus className="w-4 h-4" /> 新建
            </button>
          ) : (
            <Link
              href="/workspace/member"
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-sm font-medium hover:bg-amber-100 transition-colors"
            >
              <Crown className="w-4 h-4" /> 升级会员
            </Link>
          )
        }
      />

      {/* 配额提示 - 轻量化 */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">当前配额</span>
              <span className="text-lg font-bold text-gray-900">{profiles.length}/{maxProfiles}</span>
            </div>
            {!isMember && (
              <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">免费版</span>
            )}
            {isMember && (
              <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full">会员版</span>
            )}
          </div>
          {!isMember && profiles.length >= 1 && (
            <Link href="/workspace/member" className="text-xs text-teal-600 hover:underline flex items-center gap-1">
              升级会员可创建 10 套 <ExternalLink className="w-3 h-3" />
            </Link>
          )}
        </div>
      </div>

      {profiles.length === 0 ? (
        <EmptyState
          icon={<Building2 className="w-8 h-8" />}
          title="还没有公司资料"
          description="创建公司资料后，填写单据时可以自动填充公司信息，提高效率。支持公司名称、联系人、邮箱、电话、地址等信息。"
          primaryAction={{ 
            label: "创建第一套公司资料", 
            onClick: () => setShowModal(true) 
          }}
        />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {profiles.map(profile => (
            <div 
              key={profile.id} 
              className="bg-white border border-gray-100 rounded-xl p-5 hover:border-teal-200 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-gray-900">
                      {profile.companyName || "未命名"}
                      {profile.isDefault && (
                        <span className="ml-2 text-xs px-1.5 py-0.5 bg-teal-50 text-teal-700 rounded">默认</span>
                      )}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      更新于 {new Date(profile.updatedAt).toLocaleDateString("zh-CN")}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => { setEditingId(profile.id); setShowModal(true); }}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                  title="编辑"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2 text-xs text-gray-500">
                {profile.contactPerson && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">联系人:</span>
                    <span>{profile.contactPerson}</span>
                  </div>
                )}
                {profile.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3 text-gray-400" />
                    <span className="truncate">{profile.email}</span>
                  </div>
                )}
                {profile.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3 h-3 text-gray-400" />
                    <span>{profile.phone}</span>
                  </div>
                )}
                {profile.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span className="truncate">{profile.address}</span>
                  </div>
                )}
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
              <h2 className="font-bold text-gray-900">
                {editingId ? "编辑公司资料" : "新建公司资料"}
              </h2>
              <button 
                onClick={() => setShowModal(false)} 
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="text-gray-400 text-lg">✕</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  公司名称 <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-200" 
                  placeholder="请输入公司全称" 
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">联系人</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-200" 
                  placeholder="联系人姓名" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">邮箱</label>
                  <input 
                    type="email" 
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-200" 
                    placeholder="company@example.com" 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">电话</label>
                  <input 
                    type="tel" 
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-200" 
                    placeholder="+86" 
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">地址</label>
                <textarea 
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-200 resize-none" 
                  rows={2} 
                  placeholder="公司详细地址" 
                />
              </div>
              {!isMember && (
                <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-xs text-amber-700">
                  <div className="flex items-start gap-2">
                    <Crown className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium mb-1">免费版限制</p>
                      <p>免费版支持 1 套公司资料。升级会员可创建最多 10 套公司模板，并支持上传公司 Logo。</p>
                      <Link href="/workspace/member" className="text-teal-600 hover:underline inline-flex items-center gap-1 mt-2">
                        了解会员权益 <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-100 px-6 py-4 flex items-center justify-end gap-3 rounded-b-2xl">
              <button 
                onClick={() => setShowModal(false)} 
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                取消
              </button>
              <button className="px-5 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors">
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
