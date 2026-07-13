"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
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
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const TRUST_POINTS = [
  { icon: Cloud, label: "云端同步工作台", desc: "收藏网址、工具配置自动同步", color: "from-blue-500 to-cyan-500" },
  { icon: Gem, label: "积分与会员权益", desc: "签到赚积分，兑换 AI 次数", color: "from-purple-500 to-pink-500" },
  { icon: Sparkles, label: "AI 工具与资源收藏", desc: "翻译、摘要、文案一键生成", color: "from-amber-500 to-orange-500" },
];

export default function LoginPage({ defaultMode = "login" }: { defaultMode?: "login" | "signup" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLogin, setIsLogin] = useState(defaultMode === "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Read invite code from URL params
  useEffect(() => {
    const inviteFromUrl = searchParams.get("invite") || searchParams.get("ref");
    if (inviteFromUrl) {
      setInviteCode(inviteFromUrl.toUpperCase());
      // Auto-switch to signup mode if invite code present
      if (defaultMode === "login") {
        setIsLogin(false);
      }
    }
  }, [searchParams, defaultMode]);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-700">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-pulse delay-1000"></div>
          </div>
        </div>
        
        <div className="relative max-w-6xl mx-auto px-4 py-12 md:py-20">
          <div className="flex flex-col lg:flex-row lg:items-center lg:gap-16">
            {/* Left: Text */}
            <div className="flex-1 mb-12 lg:mb-0">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-4 py-2 text-sm mb-6 border border-white/30">
                <Shield className="w-4 h-4" />
                <span className="font-medium">安全可靠的个人工作台</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                登录绝世百宝箱
              </h1>
              <p className="text-lg md:text-xl text-blue-100 leading-relaxed max-w-lg mb-8">
                继续使用你的工作台、积分、AI 工具额度和收藏资源。
              </p>

              {/* Trust Points */}
              <div className="space-y-4">
                {TRUST_POINTS.map((tp, i) => {
                  const Icon = tp.icon;
                  return (
                    <div key={i} className="group flex items-start gap-4 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 hover:bg-white/20 transition-all hover:scale-105">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tp.color} flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-white mb-1">{tp.label}</div>
                        <div className="text-blue-100 text-sm">{tp.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Login Card */}
            <div className="w-full lg:w-[420px] shrink-0">
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal-500/30 hover:scale-110 transition-transform">
                    <PackageSearch className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    {isLogin ? "欢迎回来" : "创建账户"}
                  </h2>
                  <p className="text-gray-500 text-sm mt-2">
                    {isLogin ? "登录以继续使用所有功能" : "注册免费账户"}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {!isLogin && (
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">姓名</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full pl-4 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 min-h-[52px] transition-all group-hover:border-gray-300"
                          placeholder="你的姓名"
                          required={!isLogin}
                        />
                      </div>
                    </div>
                  )}

                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">邮箱</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 min-h-[52px] transition-all group-hover:border-gray-300"
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">密码</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 min-h-[52px] transition-all group-hover:border-gray-300"
                        placeholder="至少6位密码"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-600 transition-colors"
                        aria-label={showPassword ? "隐藏密码" : "显示密码"}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {isLogin && (
                      <div className="text-right mt-2">
                        <Link href="/forgot-password" className="text-xs text-teal-600 hover:text-teal-700 font-medium hover:underline">
                          忘记密码？
                        </Link>
                      </div>
                    )}
                  </div>

                  {!isLogin && (
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">邀请码 (Invite Code) *</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={inviteCode}
                          onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                          className="w-full pl-4 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 font-mono tracking-widest min-h-[52px] transition-all group-hover:border-gray-300"
                          placeholder="如 PIONEER2026"
                          required={!isLogin}
                          maxLength={20}
                        />
                      </div>
                      <p className="text-xs text-amber-600 mt-2 flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5" />
                        当前为内测阶段，仅限先锋探路官凭邀请码入驻
                      </p>
                    </div>
                  )}

                  {error && (
                    <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 rounded-xl p-4 border border-red-100">
                      <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}
                  {success && (
                    <div className="flex items-start gap-2 text-sm text-green-600 bg-green-50 rounded-xl p-4 border border-green-100">
                      <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <span>{success}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 min-h-[52px] bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40 hover:scale-[1.02] flex items-center justify-center gap-2 group"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>{isLogin ? "登录中..." : "注册中..."}</span>
                      </>
                    ) : (
                      <>
                        <span>{isLogin ? "登录" : "注册"}</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <button
                    onClick={() => { setIsLogin(!isLogin); setError(""); }}
                    className="text-sm text-teal-600 hover:text-teal-700 font-semibold hover:underline transition-colors"
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
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center text-sm text-gray-500 space-y-2">
          <p>
            登录即代表同意{" "}
            <Link href="/terms" className="text-gray-700 hover:text-teal-600 underline font-medium">
              服务条款
            </Link>{" "}
            与{" "}
            <Link href="/privacy" className="text-gray-700 hover:text-teal-600 underline font-medium">
              隐私政策
            </Link>
          </p>
          <Link href="/" className="inline-flex items-center gap-1.5 text-gray-600 hover:text-teal-600 transition-colors font-medium">
            <ArrowRight className="w-4 h-4 rotate-180" /> 返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}
