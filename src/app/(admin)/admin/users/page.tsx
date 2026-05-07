"use client";

import { useState, useEffect } from "react";
import { Users, Shield, Trash2, Crown, Loader2, CheckCircle, AlertCircle, UserMinus } from "lucide-react";

interface AdminUser {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  subdomain: string | null;
  createdAt: string;
  _count: { favorites: number };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(data.data || []);
    } catch {
      console.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdating(userId);
    setMessage({ type: "", text: "" });
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: `角色已更新为${newRole === "ADMIN" ? "管理员" : "用户"}` });
        fetchUsers();
      } else {
        setMessage({ type: "error", text: data.error || "更新失败" });
      }
    } catch {
      setMessage({ type: "error", text: "网络错误" });
    } finally {
      setUpdating(null);
    }
  };

  const handleDelete = async (userId: string, email: string) => {
    if (!confirm(`确定删除用户 ${email}？此操作不可恢复。`)) return;
    setUpdating(userId);
    try {
      const res = await fetch(`/api/users/${userId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: `用户 ${email} 已删除` });
        fetchUsers();
      } else {
        setMessage({ type: "error", text: data.error || "删除失败" });
      }
    } catch {
      setMessage({ type: "error", text: "网络错误" });
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return <div className="p-6 text-center text-gray-500">加载中...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="w-6 h-6" />
          用户管理
        </h1>
        <span className="text-sm text-gray-500">共 {users.length} 个用户</span>
      </div>

      {message.text && (
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${
          message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
        }`}>
          {message.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500">姓名</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">邮箱</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">角色</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">二级域名</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">收藏</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">注册</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{user.name || "-"}</td>
                <td className="px-4 py-3 text-gray-500">{user.email || "-"}</td>
                <td className="px-4 py-3">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    disabled={updating === user.id}
                    className={`px-2 py-1 rounded text-xs border ${
                      user.role === "ADMIN"
                        ? "bg-red-50 text-red-600 border-red-200"
                        : "bg-blue-50 text-blue-600 border-blue-200"
                    }`}
                  >
                    <option value="USER">用户</option>
                    <option value="ADMIN">管理员</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-gray-500">{user.subdomain ? `${user.subdomain}.kjbxb.com` : "-"}</td>
                <td className="px-4 py-3 text-gray-500">{user._count.favorites}</td>
                <td className="px-4 py-3 text-gray-500">{new Date(user.createdAt).toLocaleDateString("zh-CN")}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleDelete(user.id, user.email || "")}
                    disabled={updating === user.id}
                    className="text-red-600 hover:text-red-700 inline-flex items-center gap-1 disabled:opacity-50"
                  >
                    {updating === user.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="p-8 text-center text-gray-400">暂无用户</div>
        )}
      </div>
    </div>
  );
}
