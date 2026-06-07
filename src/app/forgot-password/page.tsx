'use client';

import { useState } from 'react';
import { Mail, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setError('请输入有效邮箱');
      return;
    }

    setLoading(true);
    setError('');

    // 模拟发送（实际环境需要后端支持）
    await new Promise(r => setTimeout(r, 1000));
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg border p-8 max-w-md w-full">
        <Link href="/login" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft className="w-4 h-4" />
          返回登录
        </Link>

        {sent ? (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-center text-gray-900 mb-2">邮件已发送</h2>
            <p className="text-gray-500 text-center mb-6">
              如果 <strong>{email}</strong> 是已注册的邮箱，您将收到密码重置链接。
            </p>
            <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-700">
              <p>💡 提示：</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>请检查收件箱和垃圾邮件文件夹</li>
                <li>链接 30 分钟内有效</li>
                <li>如未收到，可稍后重试</li>
              </ul>
            </div>
            <button
              onClick={() => setSent(false)}
              className="mt-4 w-full text-center text-sm text-blue-600 hover:text-blue-700"
            >
              使用其他邮箱重试
            </button>
          </>
        ) : (
          <>
            <div className="text-center mb-6">
              <Mail className="w-12 h-12 text-blue-500 mx-auto mb-3" />
              <h2 className="text-xl font-semibold text-gray-900">忘记密码</h2>
              <p className="text-gray-500 text-sm mt-1">输入注册邮箱，我们将发送重置链接</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">邮箱地址</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 rounded-lg p-2">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin inline" />
                ) : (
                  '发送重置链接'
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
