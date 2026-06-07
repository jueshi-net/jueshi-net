'use client';

import { useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';

function ConfirmContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('缺少确认令牌');
      return;
    }

    fetch(`/api/subscribe/confirm?token=${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'confirmed') {
          setStatus('success');
          setMessage(data.message);
        } else {
          setStatus('error');
          setMessage(data.error || '确认失败');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('网络错误，请稍后重试');
      });
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg border p-8 max-w-md w-full text-center">
        {status === 'loading' ? (
          <>
            <Loader2 className="w-16 h-16 animate-spin text-blue-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">确认中...</h2>
            <p className="text-gray-500">正在验证您的订阅</p>
          </>
        ) : status === 'success' ? (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">订阅成功！</h2>
            <p className="text-gray-500 mb-6">{message}</p>
            <Link href="/" className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              返回首页
            </Link>
          </>
        ) : (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">确认失败</h2>
            <p className="text-gray-500 mb-6">{message}</p>
            <Link href="/" className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              返回首页
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function SubscribeConfirmPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
      <ConfirmContent />
    </Suspense>
  );
}
