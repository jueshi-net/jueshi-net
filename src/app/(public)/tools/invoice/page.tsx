'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { buttonVariants, cardStyles } from "@/lib/ui-styles";

export default function InvoiceRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/tools/documents/commercial-invoice');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className={cardStyles.base + " max-w-md text-center"}>
        <h2 className={cardStyles.header + " text-base"}>单据工具已升级</h2>
        <p className="text-gray-500 mb-6">
          发票生成功能已整合到新的「外贸单据生成器」中，正在跳转...
        </p>
        <Link
          href="/tools/documents/commercial-invoice"
          className={buttonVariants.primary}
        >
          立即前往
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
