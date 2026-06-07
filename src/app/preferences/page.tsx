"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Preferences {
  theme: string;
  language: string;
  emailNotif: boolean;
  compactMode: boolean;
  itemsPerPage: number;
  defaultCategory: string | null;
}

export default function PreferencesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [prefs, setPrefs] = useState<Preferences>({
    theme: "system",
    language: "zh-CN",
    emailNotif: true,
    compactMode: false,
    itemsPerPage: 20,
    defaultCategory: null,
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
    if (status === "authenticated") {
      fetchPreferences();
    }
  }, [status, router]);

  const fetchPreferences = async () => {
    try {
      const res = await fetch("/api/preferences");
      if (res.ok) {
        const data = await res.json();
        if (data.preferences && Object.keys(data.preferences).length > 0) {
          setPrefs(data.preferences);
        }
      }
    } catch (error) {
      console.error("Failed to fetch preferences:", error);
    }
  };

  const savePreferences = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefs),
      });
      if (res.ok) {
        setMessage("偏好设置已保存！");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("保存失败");
      }
    } catch (error) {
      setMessage("保存失败");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">用户偏好设置</h1>

      {message && (
        <div className={`mb-4 p-3 rounded ${message.includes("已保存") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {message}
        </div>
      )}

      <div className="space-y-6">
        {/* 主题设置 */}
        <div className="p-4 border rounded-lg dark:border-gray-700">
          <h3 className="font-medium mb-3">主题</h3>
          <select
            value={prefs.theme}
            onChange={(e) => setPrefs({ ...prefs, theme: e.target.value })}
            className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
          >
            <option value="system">跟随系统</option>
            <option value="light">浅色模式</option>
            <option value="dark">深色模式</option>
          </select>
        </div>

        {/* 语言设置 */}
        <div className="p-4 border rounded-lg dark:border-gray-700">
          <h3 className="font-medium mb-3">语言</h3>
          <select
            value={prefs.language}
            onChange={(e) => setPrefs({ ...prefs, language: e.target.value })}
            className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
          >
            <option value="zh-CN">简体中文</option>
            <option value="en-US">English</option>
            <option value="ja-JP">日本語</option>
          </select>
        </div>

        {/* 显示设置 */}
        <div className="p-4 border rounded-lg dark:border-gray-700">
          <h3 className="font-medium mb-3">显示</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={prefs.compactMode}
                onChange={(e) => setPrefs({ ...prefs, compactMode: e.target.checked })}
                className="rounded"
              />
              <span>紧凑模式</span>
            </label>
            <div className="flex items-center gap-2">
              <span>每页显示：</span>
              <select
                value={prefs.itemsPerPage}
                onChange={(e) => setPrefs({ ...prefs, itemsPerPage: parseInt(e.target.value) })}
                className="p-1 border rounded dark:bg-gray-800 dark:border-gray-700"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>条</span>
            </div>
          </div>
        </div>

        {/* 通知设置 */}
        <div className="p-4 border rounded-lg dark:border-gray-700">
          <h3 className="font-medium mb-3">通知</h3>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={prefs.emailNotif}
              onChange={(e) => setPrefs({ ...prefs, emailNotif: e.target.checked })}
              className="rounded"
            />
            <span>接收邮件通知</span>
          </label>
        </div>

        <button
          onClick={savePreferences}
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "保存中..." : "保存设置"}
        </button>
      </div>
    </div>
  );
}
