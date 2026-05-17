import type { Metadata } from 'next';
import { buildCanonical, buildTitle } from '@/lib/seo';
import LabelMakerClient from './label-maker-client';

export const metadata: Metadata = {
  title: buildTitle("唛头标签生成器"),
  description: "在线生成外箱唛头、集运入库标签、合箱标签、库位标签、托盘标签和提示标签，支持多种商务化模板与打印导出。",
  alternates: { canonical: buildCanonical("/tools/label-maker") },
  openGraph: {
    title: buildTitle("唛头标签生成器"),
    description: "在线生成外箱唛头、集运入库标签、合箱标签、库位标签、托盘标签和提示标签，支持多种商务化模板与打印导出。",
    url: buildCanonical("/tools/label-maker"),
  },
};

export default function LabelMakerPage() {
  return <LabelMakerClient />;
}
