'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ToolWorkspaceShell from "@/components/tools/ToolWorkspaceShell";
import { buttonVariants, cardStyles } from "@/lib/ui-styles";

export default function InvoiceRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/tools/documents/commercial-invoice');
  }, [router]);

  return (
    <ToolWorkspaceShell title="单据工具已升级"
      subtitle="发票生成功能已整合到新的「外贸单据生成器」中"
    >
      <div className={cardStyles.base + " max-w-md text-center mx-auto"}>
        <p className="text-gray-500 mb-6">
          正在跳转到新的外贸单据生成器...
        </p>
        <Link
          href="/tools/documents/commercial-invoice"
          className={buttonVariants.primary}
        >
          立即前往
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </ToolWorkspaceShell>
  );
}
