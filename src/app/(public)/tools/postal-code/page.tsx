import { Metadata } from 'next';
import { buildCanonical, buildTitle } from '@/lib/seo';
import PostalCodeClient from './postal-code-client';
import ToolReviewServer from '@/components/tools/tool-review-server';
import { RelatedDiscussions } from '@/components/community/related-discussions';

const description = '快速查询和整理海外地址、邮编信息，适合寄件、集运、表单填写和地址核对。';

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
    <>
      <PostalCodeClient />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ToolReviewServer toolKey="postal-code" />
      </div>
      <div className="max-w-5xl mx-auto px-4 pb-8">
        <RelatedDiscussions tool="postal-code" />
      </div>
    </>
  );
}
