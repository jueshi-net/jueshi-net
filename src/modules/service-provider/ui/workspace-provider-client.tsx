"use client";

import { useState } from "react";
import Link from "next/link";

interface WorkspaceProviderClientProps {
  provider: { id: string; displayName: string; status: string; verificationStatus: string; slug: string; };
  services: { id: string; title: string; status: string; sortOrder: number; priceMode: string; }[];
  inquiries: { id: string; status: string; message: string; createdAt: string; }[];
  members: { id: string; userId: string; role: string; status: string; }[];
  userRole: string;
}

const STATUS_LABELS: Record<string, string> = {
  draft: "草稿",
  pending_review: "审核中",
  published: "已发布",
  suspended: "已暂停",
};

const INQUIRY_STATUS_LABELS: Record<string, string> = {
  pending: "待处理",
  responded: "已回复",
  closed: "已关闭",
};

const ROLE_LABELS: Record<string, string> = {
  OWNER: "所有者",
  ADMIN: "管理员",
  EDITOR: "编辑",
  VIEWER: "查看者",
};

export function WorkspaceProviderClient({
  provider,
  services,
  inquiries,
  members,
  userRole,
}: WorkspaceProviderClientProps) {
  const [activeTab, setActiveTab] = useState<"services" | "inquiries" | "members">("services");
  const canManage = userRole === "OWNER" || userRole === "ADMIN";
  const canEdit = canManage || userRole === "EDITOR";

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {(["services", "inquiries", "members"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab === "services" ? `服务项目 (${services.length})` : tab === "inquiries" ? `咨询 (${inquiries.length})` : `成员 (${members.length})`}
          </button>
        ))}
      </div>

      <div className="p-4">
        {/* Services Tab */}
        {activeTab === "services" && (
          <div>
            {canEdit && (
              <div className="mb-3">
                <Link
                  href={`/api/service-providers/${provider.id}/services`}
                  prefetch={false}
                  className="inline-block rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                >
                  + 创建服务
                </Link>
              </div>
            )}
            {services.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">暂无服务项目</p>
            ) : (
              <div className="space-y-2">
                {services.map((s) => (
                  <div key={s.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{s.title}</p>
                      <p className="text-xs text-gray-400">{s.priceMode}</p>
                    </div>
                    <span className={`rounded px-2 py-0.5 text-xs ${s.status === "published" ? "bg-green-50 text-green-600" : s.status === "pending_review" ? "bg-yellow-50 text-yellow-600" : "bg-gray-50 text-gray-500"}`}>
                      {STATUS_LABELS[s.status] ?? s.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Inquiries Tab */}
        {activeTab === "inquiries" && (
          <div>
            {inquiries.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">暂无咨询</p>
            ) : (
              <div className="space-y-2">
                {inquiries.map((i) => (
                  <div key={i.id} className="rounded-lg border border-gray-100 p-3">
                    <div className="flex items-center justify-between">
                      <span className={`rounded px-2 py-0.5 text-xs ${i.status === "pending" ? "bg-yellow-50 text-yellow-600" : i.status === "responded" ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-500"}`}>
                        {INQUIRY_STATUS_LABELS[i.status] ?? i.status}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(i.createdAt).toLocaleString("zh-CN")}
                      </span>
                    </div>
                    {i.message && <p className="mt-2 text-sm text-gray-600">{i.message.slice(0, 100)}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Members Tab */}
        {activeTab === "members" && (
          <div>
            {canManage && (
              <p className="mb-3 text-xs text-gray-400">成员管理：OWNER 拥有全部权限，ADMIN 可管理资料和成员，EDITOR 可编辑资料和服务，VIEWER 只读</p>
            )}
            <div className="space-y-2">
              {members.map((m) => (
                <div key={m.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs text-gray-500">
                      {m.userId.slice(0, 4)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{ROLE_LABELS[m.role] ?? m.role}</p>
                      <p className="text-xs text-gray-400">{m.status}</p>
                    </div>
                  </div>
                  {canManage && m.role !== "OWNER" && (
                    <span className="text-xs text-gray-400">管理</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
