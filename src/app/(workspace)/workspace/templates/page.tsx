"use client";

import { useState, useEffect, useCallback } from "react";
import WorkspacePageFrame from '@/components/workspace/WorkspacePageFrame';
import WorkspaceRightRail from '@/components/workspace/WorkspaceRightRail';

interface TemplateConfig {
  id: string;
  name: string;
  toolKey: string;
  origin: "official" | "user";
  style: {
    primaryColor: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface TemplateListResponse {
  success: boolean;
  data: TemplateConfig[];
}

interface WorkspaceStats {
  unreadNotifs: number;
  badgeCount: number;
  recentMemos: Array<{
    id: string;
    title: string;
    updatedAt: string;
  }>;
  userId: string;
}

export default function WorkspaceTemplatesPage() {
  const [templates, setTemplates] = useState<TemplateConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState("");
  const [workspaceStats, setWorkspaceStats] = useState<WorkspaceStats>({
    unreadNotifs: 0,
    badgeCount: 0,
    recentMemos: [],
    userId: ""
  });

  const fetchTemplates = useCallback(async () => {
    try {
      const res = await fetch("/api/template-studio/templates");
      if (res.ok) {
        const data: TemplateListResponse = await res.json();
        setTemplates(data.data || []);
      } else if (res.status === 401) {
        // Not logged in - redirect to login
        window.location.href = "/login?callbackUrl=/workspace/templates";
      }
    } catch (err) {
      console.error("Failed to fetch templates:", err);
    }
  }, []);

  const fetchWorkspaceStats = useCallback(async () => {
    try {
      // Use Promise.allSettled to fetch stats individually
      const [notifsRes, badgesRes, memosRes] = await Promise.allSettled([
        fetch('/api/workspace/notifications?limit=1').then(r => r.ok ? r.json() : { unread: 0 }),
        fetch('/api/workspace/badges/count').then(r => r.ok ? r.json() : { count: 0 }),
        fetch('/api/workspace/memos?limit=3').then(r => r.ok ? r.json() : { memos: [] })
      ]);

      const unreadNotifs = notifsRes.status === 'fulfilled' ? (notifsRes.value.unread || 0) : 0;
      const badgeCount = badgesRes.status === 'fulfilled' ? (badgesRes.value.count || 0) : 0;
      const recentMemos = memosRes.status === 'fulfilled' ? (memosRes.value.memos || []) : [];

      setWorkspaceStats({
        unreadNotifs,
        badgeCount,
        recentMemos,
        userId: "" // Will be set from session if needed
      });
    } catch (err) {
      console.error("Failed to fetch workspace stats:", err);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        fetchTemplates(),
        fetchWorkspaceStats()
      ]);
      setLoading(false); // 设置加载完成状态
    };

    fetchData();
  }, [fetchTemplates, fetchWorkspaceStats]);

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/template-studio/templates/${id}`, { method: "DELETE" });
      setDeleteConfirmId("");
      fetchTemplates(); // 重新获取模板列表
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <WorkspacePageFrame rightRail={null}>
        <div className="flex items-center justify-center py-20 text-gray-400">
          加载中...
        </div>
      </WorkspacePageFrame>
    );
  }

  return (
    <WorkspacePageFrame rightRail={
      <WorkspaceRightRail
        unreadNotifs={workspaceStats.unreadNotifs}
        badgeCount={workspaceStats.badgeCount}
        recentMemos={workspaceStats.recentMemos}
        userId={workspaceStats.userId}
      />
    } data-testid="workspace-templates-page">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">我的模板</h1>
          <p className="text-sm text-gray-500 mt-1">管理已保存的单据模板</p>
        </div>
        <div className="flex gap-2">
          <a
            href="/workspace"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200"
            data-testid="workspace-templates-back-button"
          >
            返回工作台
          </a>
          <a
            href="/tools"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200"
            data-testid="workspace-templates-tools-button"
          >
            工具中心
          </a>
          <a
            href="/tools/template-studio/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
            data-testid="workspace-templates-new-button"
          >
            + 新建模板
          </a>
        </div>
      </div>

      <div className="mt-6">
        {templates.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-lg font-semibold mb-2">暂无保存的模板</h3>
            <p className="text-gray-500 mb-6">前往模板工作室创建您的自定义单据模板</p>
            <a
              href="/tools/template-studio/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
              data-testid="workspace-templates-empty-cta"
            >
              创建第一个模板
            </a>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" data-testid="workspace-template-grid">
            {templates.map(t => {
              const displayName = t.name || "未命名模板";
              const displayType = t.toolKey || "自定义模板";
              const displayTime = (t.updatedAt || t.createdAt) ? new Date(t.updatedAt || t.createdAt).toLocaleDateString("zh-CN") : "时间未知";
              const hasId = !!t.id;

              return (
              <div
                key={t.id || Math.random()}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                data-testid={`workspace-template-card-${t.id || 'unknown'}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: t.style?.primaryColor || "#6366f1" }}
                  />
                  <h3 className="font-semibold text-sm truncate">{displayName}</h3>
                </div>
                <div className="text-xs text-gray-500 mb-3">
                  {displayType} · 更新于 {displayTime}
                </div>
                <div className="flex gap-2">
                  {hasId ? (
                    <a
                      href={`/tools/template-studio/canvas/${t.id}/edit`}
                      className="text-xs px-3 py-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                      data-testid={`workspace-edit-${t.id}`}
                    >
                      编辑
                    </a>
                  ) : (
                    <span className="text-xs px-3 py-1.5 bg-gray-100 text-gray-500 rounded">
                      异常项：缺少 ID
                    </span>
                  )}
                  {hasId && (
                    deleteConfirmId === t.id ? (
                      <span className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="text-xs px-2 py-1.5 bg-red-600 text-white rounded hover:bg-red-700"
                          data-testid={`workspace-confirm-delete-${t.id}`}
                        >
                          确认删除
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId("")}
                          className="text-xs px-2 py-1.5 bg-gray-200 rounded"
                        >
                          取消
                        </button>
                      </span>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(t.id)}
                        className="text-xs px-3 py-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100"
                        data-testid={`workspace-delete-${t.id}`}
                      >
                        删除
                      </button>
                    )
                  )}
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>
    </WorkspacePageFrame>
  );
}
