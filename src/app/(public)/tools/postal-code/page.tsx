import { Metadata } from 'next';
import { buildCanonical, buildTitle } from '@/lib/seo';
import PostalCodeClient from './postal-code-client';
import ToolReviewServer from '@/components/tools/tool-review-server';
import { RelatedDiscussions } from '@/components/community/related-discussions';
import ToolLandingPageShell from '@/components/tools/ToolLandingPageShell';

const description = '快速查询和整理海外地址、邮编信息，支持 51+ 国家，适合寄件、集运、表单填写和地址核对。';

export const metadata: Metadata = {
  title: buildTitle('邮编查询'),
  description,
  keywords: "邮编查询,国际邮编,海外邮编,地址查询,集运邮编,国际快递邮编,加拿大邮编,美国邮编,英国邮编,澳大利亚邮编",
  alternates: { canonical: buildCanonical('/tools/postal-code') },
  openGraph: {
    title: buildTitle('邮编查询'),
    description,
    url: buildCanonical('/tools/postal-code'),
  },
};

export default function PostalCodePage() {
  return (
    <ToolLandingPageShell
      title="邮编查询"
      subtitle="快速查询和整理海外地址、邮编信息，支持 51+ 国家"
      privacyNotice={
        <span>
          <strong>数据来源于公开邮编数据源，结果仅供参考。</strong>
          正式发货前请以当地邮政或物流服务商信息为准。
        </span>
      }
    >
      <PostalCodeClient />
      <div className="mt-8">
        <ToolReviewServer toolKey="postal-code" />
      </div>
      <div className="mt-8">
        <RelatedDiscussions tool="postal-code" />
      </div>
    </ToolLandingPageShell>
  );
}
