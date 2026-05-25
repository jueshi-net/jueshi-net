"use client";

import { useState, useCallback } from "react";
import { Mail, Send, CheckCircle, Loader2, AlertCircle } from "lucide-react";

export default function NewsletterForm({
  className = "",
  variant = "inline",
}: {
  className?: string;
  variant?: "inline" | "footer";
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email || !email.includes("@")) {
        setStatus("error");
        setMessage("请输入有效的邮箱地址");
        return;
      }

      setStatus("loading");
      try {
        const res = await fetch("/api/newsletter/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();

        if (res.ok) {
          setStatus("success");
          setMessage(data.message || "订阅成功！每周为您推送出海锦囊");
          setEmail("");
        } else {
          setStatus("error");
          setMessage(data.error || "订阅失败，请稍后重试");
        }
      } catch {
        setStatus("error");
        setMessage("网络异常，请稍后重试");
      }
    },
    [email]
  );

  if (status === "success") {
    return (
      <div className={`flex items-center gap-3 text-green-600 dark:text-green-400 ${className}`}>
        <CheckCircle className="w-5 h-5 flex-shrink-0" />
        <span className="text-sm font-medium">{message}</span>
      </div>
    );
  }

  if (variant === "footer") {
    return (
      <form onSubmit={handleSubmit} className={`w-full max-w-md ${className}`}>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status === "error") setStatus("idle");
              }}
              placeholder="your@email.com"
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400/50 text-sm min-h-[44px]"
              disabled={status === "loading"}
            />
          </div>
          <button
            type="submit"
            disabled={status === "loading"}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-white font-medium text-sm transition-colors disabled:opacity-50 min-h-[44px]"
          >
            {status === "loading" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                订阅
              </>
            )}
          </button>
        </div>
        {status === "error" && (
          <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {message}
          </p>
        )}
      </form>
    );
  }

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl
        bg-gradient-to-br from-teal-500/90 to-blue-600/90
        backdrop-blur-xl border border-white/20
        p-6 sm:p-8
        ${className}
      `}
    >
      {/* Decorative blur orbs */}
      <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
      <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-teal-300/20 rounded-full blur-xl" />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <Mail className="w-5 h-5 text-white/90" />
          <h3 className="text-lg font-bold text-white">订阅出海锦囊</h3>
        </div>
        <p className="text-sm text-white/80 mb-4">
          每周获取最新高阶工具与物流避坑指南
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status === "error") setStatus("idle");
              }}
              placeholder="your@email.com"
              className="w-full pl-4 pr-4 py-2.5 rounded-lg bg-white/90 backdrop-blur text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm min-h-[44px]"
              disabled={status === "loading"}
            />
          </div>
          <button
            type="submit"
            disabled={status === "loading"}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-white text-teal-600 font-semibold text-sm hover:bg-white/90 transition-colors disabled:opacity-50 min-h-[44px]"
          >
            {status === "loading" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                立即订阅
              </>
            )}
          </button>
        </form>
        {status === "error" && (
          <p className="mt-2 text-xs text-white/80 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
