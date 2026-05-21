"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  PackageSearch,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Cloud,
  Gem,
  Sparkles,
  Shield,
} from "lucide-react";

const TRUST_POINTS = [
  { icon: Cloud, label: "云端同步工作台", desc: "收藏网址、工具配置自动同步" },
  { icon: Gem, label: "积分与会员权益", desc: "签到赚积分，兑换 AI 次数" },
  { icon: Sparkles, label: "AI 工具与资源收藏", desc: "翻译、摘要、文案一键生成" },
];

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (isLogin) {
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });
        if (result?.error) {
          setError("邮箱或密码错误");
        } else {
          window.location.href = "/tools";
        }
      } else {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name, inviteCode }),
        });
        const data = await res.json();
        if (!data.success) {
          setError(data.error || "注册失败");
          setLoading(false);
          return;
        }
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });
        if (result?.error) {
          setError("注册失败，请重试");
        } else {
          setSuccess("注册成功，正在登录...");
          window.location.href = "/tools";
        }
      }
    } catch {
      setError("网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-700 text-white">
        <div className="max-w-5xl mx-auto px-4 py-10 md:py-16">
          <div className="flex flex-col md:flex-row md:items-center md:gap-12">
            {/* Left: Text */}
            <div className="flex-1 mb-8 md:mb-0">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm mb-6">
                <Shield className="w-4 h-4" />
                安全可靠的个人工作台
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-3">
                登录海外百宝箱
              </h1>
              <p className="text-teal-100 text-lg leading-relaxed max-w-md">
                继续使用你的工作台、积分、AI 工具额度和收藏资源。
              </p>

              {/* Trust Points */}
              <div className="mt-8 space-y-4">
                {TRUST_POINTS.map((tp, i) => {
                  const Icon = tp.icon;
                  return (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-semibold">{tp.label}</div>
                        <div className="text-teal-100 text-sm">{tp.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Login Card */}
            <div className="w-full md:w-[380px] shrink-0">
              <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <PackageSearch className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {isLogin ? "欢迎回来" : "创建账户"}
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    {isLogin ? "登录以继续使用所有功能" : "注册免费账户"}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isLogin && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full pl-4 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 min-h-[48px]"
                          placeholder="你的姓名"
                          required={!isLogin}
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 min-h-[48px]"
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 min-h-[48px]"
                        placeholder="至少6位密码"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        aria-label={showPassword ? "隐藏密码" : "显示密码"}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {!isLogin && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">邀请码 (Invite Code) *</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={inviteCode}
                          onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                          className="w-full pl-4 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 font-mono tracking-widest min-h-[48px]"
                          placeholder="如 PIONEER2026"
                          required={!isLogin}
                          maxLength={20}
                        />
                      </div>
                      <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1">
                        🔒 当前为内测阶段，仅限先锋探路官凭邀请码入驻
                      </p>
                    </div>
                  )}

                  {error && (
                    <div className="text-sm text-red-600 bg-red-50 rounded-lg p-3 border border-red-100">
                      {error}
                    </div>
                  )}
                  {success && (
                    <div className="text-sm text-green-600 bg-green-50 rounded-lg p-3 border border-green-100">
                      {success}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 min-h-[48px] bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {isLogin ? "登录中..." : "注册中..."}
                      </>
                    ) : (
                      isLogin ? "登录" : "注册"
                    )}
                  </button>
                </form>

                <div className="mt-5 text-center">
                  <button
                    onClick={() => { setIsLogin(!isLogin); setError(""); }}
                    className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                  >
                    {isLogin ? "还没有账户？立即注册" : "已有账户？返回登录"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Terms Footer */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="text-center text-xs text-gray-400 space-y-1">
          <p>
            登录即代表同意{" "}
            <Link href="/terms" className="text-gray-500 hover:text-gray-700 underline">
              服务条款
            </Link>{" "}
            与{" "}
            <Link href="/privacy" className="text-gray-500 hover:text-gray-700 underline">
              隐私政策
            </Link>
          </p>
          <Link href="/" className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors">
            ← 返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}
