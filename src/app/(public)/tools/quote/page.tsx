'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function QuoteRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/tools/documents/quotation');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl border p-8 max-w-md text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-3">报价工具已升级</h2>
        <p className="text-gray-500 mb-6">
          报价单生成功能已整合到新的「外贸单据生成器」中，正在跳转...
        </p>
        <Link
          href="/tools/documents/quotation"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
        >
          立即前往
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
