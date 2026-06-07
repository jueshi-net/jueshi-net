"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Bell,
  Search,
  Send,
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle,
  XCircle,
  Mail,
  Megaphone,
  Eye,
  EyeOff,
} from "lucide-react";
import type { AdminNotificationListResult } from "@/lib/notifications";

const TYPE_LABELS: Record<string, string> = {
  growth_reward: "成长值",
  badge_awarded: "勋章",
  level_up: "等级",
  review_approved: "点评通过",
  review_rejected: "点评拒绝",
  forum_post_approved: "帖子通过",
  forum_post_rejected: "帖子拒绝",
  forum_comment_approved: "评论通过",
  forum_comment_hidden: "评论隐藏",
  system: "系统",
  admin_message: "管理员",
};

const TYPE_COLORS: Record<string, string> = {
  growth_reward: "bg-emerald-100 text-emerald-700",
  badge_awarded: "bg-purple-100 text-purple-700",
  level_up: "bg-amber-100 text-amber-700",
  review_approved: "bg-green-100 text-green-700",
  review_rejected: "bg-red-100 text-red-700",
  forum_post_approved: "bg-green-100 text-green-700",
  forum_post_rejected: "bg-red-100 text-red-700",
  forum_comment_approved: "bg-green-100 text-green-700",
  forum_comment_hidden: "bg-gray-100 text-gray-600",
  system: "bg-blue-100 text-blue-700",
  admin_message: "bg-indigo-100 text-indigo-700",
};

interface Props {
  initialResult: AdminNotificationListResult;
  initialFilters: { email: string; type: string; unreadOnly: boolean };
}

export default function NotificationsAdminClient({
  initialResult,
  initialFilters,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [items, setItems] = useState(initialResult.items);
  const [total, setTotal] = useState(initialResult.total);
  const [page, setPage] = useState(initialResult.page);
  const [pageSize] = useState(initialResult.pageSize);
  const [totalPages, setTotalPages] = useState(initialResult.totalPages);

  const [email, setEmail] = useState(initialFilters.email);
  const [type, setType] = useState(initialFilters.type);
  const [unreadOnly, setUnreadOnly] = useState(initialFilters.unreadOnly);

  const [sendOpen, setSendOpen] = useState(false);
  const [broadcastOpen, setBroadcastOpen] = useState(false);

  // Send form
  const [sendEmail, setSendEmail] = useState("");
  const [sendType, setSendType] = useState("admin_message");
  const [sendTitle, setSendTitle] = useState("");
  const [sendBody, setSendBody] = useState("");
  const [sendLink, setSendLink] = useState("");
  const [sendLoading, setSendLoading] = useState(false);
  const [sendMsg, setSendMsg] = useState("");

  // Broadcast form
  const [bcType, setBcType] = useState("admin_message");
  const [bcTitle, setBcTitle] = useState("");
  const [bcBody, setBcBody] = useState("");
  const [bcLink, setBcLink] = useState("");
  const [bcConfirm, setBcConfirm] = useState("");
  const [bcLoading, setBcLoading] = useState(false);
  const [bcMsg, setBcMsg] = useState("");

  const fetchList = useCallback(
    async (p: number, e?: string, t?: string, u?: boolean) => {
      const params = new URLSearchParams();
      params.set("page", String(p));
      params.set("pageSize", String(pageSize));
      if (e) params.set("email", e);
      if (t) params.set("type", t);
      if (u) params.set("unreadOnly", "true");

      const res = await fetch(`/api/admin/notifications?${params}`);
      const data = await res.json();
      if (data.success) {
        setItems(data.items);
        setTotal(data.total);
        setPage(data.page);
        setTotalPages(data.totalPages);
      }

      // Update URL
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.set("page", String(p));
      if (e) newParams.set("email", e);
      else newParams.delete("email");
      if (t) newParams.set("type", t);
      else newParams.delete("type");
      if (u) newParams.set("unreadOnly", "true");
      else newParams.delete("unreadOnly");

      router.push(`${pathname}?${newParams.toString()}`);
    },
    [pageSize, router, pathname, searchParams]
  );

  const handleFilter = () => {
    setPage(1);
    fetchList(1, email, type, unreadOnly);
  };

  const handleSend = async () => {
    setSendLoading(true);
    setSendMsg("");
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: sendEmail,
          type: sendType,
          title: sendTitle,
          message: sendBody,
          link: sendLink || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSendMsg("✅ 通知已发送");
        setSendEmail("");
        setSendTitle("");
        setSendBody("");
        setSendLink("");
        fetchList(1, email, type, unreadOnly);
      } else {
        setSendMsg(`❌ ${data.error || "发送失败"}`);
      }
    } catch {
      setSendMsg("❌ 网络错误");
    }
    setSendLoading(false);
  };

  const handleBroadcast = async () => {
    setBcLoading(true);
    setBcMsg("");
    try {
      const res = await fetch("/api/admin/notifications/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: bcType,
          title: bcTitle,
          message: bcBody,
          link: bcLink || null,
          confirm: bcConfirm,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setBcMsg(`✅ ${data.message}`);
        setBcTitle("");
        setBcBody("");
        setBcLink("");
        setBcConfirm("");
        fetchList(1, email, type, unreadOnly);
      } else {
        setBcMsg(`❌ ${data.error || "群发失败"}`);
      }
    } catch {
      setBcMsg("❌ 网络错误");
    }
    setBcLoading(false);
  };

  const totalPagesNum = totalPages || 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">通知管理</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            查看通知记录、发送通知给用户、群发系统通知
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSendOpen(!sendOpen)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium min-h-[44px]"
          >
            <Send className="w-4 h-4" />
            发送通知
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">用户邮箱</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleFilter()}
                placeholder="搜索邮箱..."
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <label className="block text-xs text-gray-500 mb-1">类型</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
            >
              <option value="">全部类型</option>
              {Object.entries(TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:w-36">
            <label className="block text-xs text-gray-500 mb-1">状态</label>
            <select
              value={unreadOnly ? "unread" : "all"}
              onChange={(e) => setUnreadOnly(e.target.value === "unread")}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
            >
              <option value="all">全部</option>
              <option value="unread">未读</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleFilter}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium min-h-[44px]"
            >
              <Filter className="w-4 h-4" />
              筛选
            </button>
          </div>
        </div>
      </div>

      {/* Send notification form */}
      {sendOpen && (
        <div className="bg-white rounded-xl border border-blue-200 p-5">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Send className="w-5 h-5 text-blue-600" />
            发送通知给用户
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                用户邮箱 *
              </label>
              <input
                type="email"
                value={sendEmail}
                onChange={(e) => setSendEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">类型</label>
              <select
                value={sendType}
                onChange={(e) => setSendType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
              >
                <option value="admin_message">管理员消息</option>
                <option value="system">系统通知</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-gray-500 mb-1">
                标题 *
                <span className="text-gray-400 ml-1">({sendTitle.length}/80)</span>
              </label>
              <input
                type="text"
                value={sendTitle}
                onChange={(e) =>
                  setSendTitle(e.target.value.slice(0, 80))
                }
                placeholder="通知标题"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-gray-500 mb-1">
                内容 *
                <span className="text-gray-400 ml-1">({sendBody.length}/500)</span>
              </label>
              <textarea
                value={sendBody}
                onChange={(e) =>
                  setSendBody(e.target.value.slice(0, 500))
                }
                placeholder="通知内容"
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-gray-500 mb-1">
                链接（可选）
              </label>
              <input
                type="text"
                value={sendLink}
                onChange={(e) => setSendLink(e.target.value)}
                placeholder="/dashboard 或 https://jueshi.net/..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
              />
            </div>
          </div>
          {sendMsg && (
            <div
              className={`mt-3 p-3 rounded-lg text-sm ${
                sendMsg.startsWith("✅")
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {sendMsg}
            </div>
          )}
          <button
            onClick={handleSend}
            disabled={
              sendLoading || !sendEmail || !sendTitle || !sendBody
            }
            className="mt-4 inline-flex items-center gap-1.5 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium min-h-[44px]"
          >
            {sendLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            发送
          </button>
        </div>
      )}

      {/* Notification table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 text-sm">通知记录</h2>
          <span className="text-xs text-gray-400">
            共 {total} 条
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-2.5 text-xs text-gray-500 font-medium whitespace-nowrap">
                  时间
                </th>
                <th className="text-left px-4 py-2.5 text-xs text-gray-500 font-medium whitespace-nowrap">
                  用户
                </th>
                <th className="text-left px-4 py-2.5 text-xs text-gray-500 font-medium whitespace-nowrap">
                  类型
                </th>
                <th className="text-left px-4 py-2.5 text-xs text-gray-500 font-medium whitespace-nowrap">
                  标题
                </th>
                <th className="text-left px-4 py-2.5 text-xs text-gray-500 font-medium whitespace-nowrap hidden sm:table-cell">
                  内容
                </th>
                <th className="text-left px-4 py-2.5 text-xs text-gray-500 font-medium whitespace-nowrap">
                  状态
                </th>
                <th className="text-left px-4 py-2.5 text-xs text-gray-500 font-medium whitespace-nowrap hidden md:table-cell">
                  readAt
                </th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-gray-400"
                  >
                    暂无通知记录
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr
                    key={item.id}
                    className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                      !item.isRead ? "bg-blue-50/30" : ""
                    }`}
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                      {new Date(item.createdAt).toLocaleString("zh-CN", {
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-gray-900 font-medium">
                        {item.userEmail}
                      </div>
                      {item.userNickname && (
                        <div className="text-xs text-gray-400">
                          {item.userNickname}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          TYPE_COLORS[item.type] || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {TYPE_LABELS[item.type] || item.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900 max-w-[200px] truncate">
                        {item.title}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <div className="text-xs text-gray-500 max-w-[200px] truncate">
                        {item.message}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {item.isRead ? (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                          <Eye className="w-3 h-3" /> 已读
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-blue-600 font-medium">
                          <EyeOff className="w-3 h-3" /> 未读
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-400 hidden md:table-cell">
                      {item.readAt
                        ? new Date(item.readAt).toLocaleString("zh-CN", {
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPagesNum > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              第 {page} / {totalPagesNum} 页
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => fetchList(page - 1, email, type, unreadOnly)}
                disabled={page <= 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px]"
              >
                <ChevronLeft className="w-4 h-4" /> 上一页
              </button>
              <button
                onClick={() => fetchList(page + 1, email, type, unreadOnly)}
                disabled={page >= totalPagesNum}
                className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px]"
              >
                下一页 <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Broadcast section */}
      <details className="bg-white rounded-xl border border-orange-200 overflow-hidden">
        <summary
          className="px-5 py-4 cursor-pointer font-semibold text-orange-700 hover:bg-orange-50 transition-colors flex items-center gap-2 min-h-[44px]"
        >
          <Megaphone className="w-5 h-5" />
          群发系统通知
          <span className="text-xs text-orange-400 font-normal ml-1">
            （谨慎操作，需 CONFIRM 确认）
          </span>
        </summary>
        <div className="px-5 pb-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">类型</label>
              <select
                value={bcType}
                onChange={(e) => setBcType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[44px]"
              >
                <option value="admin_message">管理员消息</option>
                <option value="system">系统通知</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                标题 *
                <span className="text-gray-400 ml-1">({bcTitle.length}/80)</span>
              </label>
              <input
                type="text"
                value={bcTitle}
                onChange={(e) => setBcTitle(e.target.value.slice(0, 80))}
                placeholder="群发标题"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[44px]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-gray-500 mb-1">
                内容 *
                <span className="text-gray-400 ml-1">({bcBody.length}/500)</span>
              </label>
              <textarea
                value={bcBody}
                onChange={(e) => setBcBody(e.target.value.slice(0, 500))}
                placeholder="群发内容"
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-gray-500 mb-1">
                链接（可选）
              </label>
              <input
                type="text"
                value={bcLink}
                onChange={(e) => setBcLink(e.target.value)}
                placeholder="/dashboard 或 https://jueshi.net/..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[44px]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-red-500 mb-1">
                ⚠️ 输入 CONFIRM 确认群发
              </label>
              <input
                type="text"
                value={bcConfirm}
                onChange={(e) => setBcConfirm(e.target.value)}
                placeholder="输入 CONFIRM 确认"
                className="w-full px-3 py-2 border border-red-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[44px]"
              />
            </div>
          </div>
          {bcMsg && (
            <div
              className={`p-3 rounded-lg text-sm ${
                bcMsg.startsWith("✅")
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {bcMsg}
            </div>
          )}
          <button
            onClick={handleBroadcast}
            disabled={
              bcLoading ||
              !bcTitle ||
              !bcBody ||
              bcConfirm !== "CONFIRM"
            }
            className="inline-flex items-center gap-1.5 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium min-h-[44px]"
          >
            {bcLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Megaphone className="w-4 h-4" />
            )}
            确认群发
          </button>
        </div>
      </details>
    </div>
  );
}
