import { Metadata } from 'next';
import { buildCanonical, buildTitle } from '@/lib/seo';
import PostalCodeClient from './postal-code-client';
import ToolReviewServer from '@/components/tools/tool-review-server';

const description = '查询和校验加拿大、美国、英国、澳洲、新西兰邮编格式与地区信息，适合海外地址核对、集运收货、物流派送和清关前检查。';

export const metadata: Metadata = {
  title: buildTitle('邮编查询工具'),
  description,
  alternates: { canonical: buildCanonical('/tools/postal-code') },
  openGraph: {
    title: buildTitle('邮编查询工具'),
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
    </>
  );
}
