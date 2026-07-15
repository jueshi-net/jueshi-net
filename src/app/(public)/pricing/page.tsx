import { Metadata } from 'next';
import { buildCanonical, buildTitle } from '@/lib/seo';
import PricingClient from './pricing-client';
import JueshiV4PublicShell from '@/components/layout/JueshiV4PublicShell';
import { PublicLandingPageFrame } from '@/components/templates/public/PublicLandingPageFrame';

export const metadata: Metadata = {
  title: buildTitle('价格方案与会员权益'),
  description: '查看绝世百宝箱免费版、积分权益、会员权益和即将开放的升级方案。',
  alternates: { canonical: buildCanonical('/pricing') },
  openGraph: {
    title: buildTitle('价格方案与会员权益'),
    description: '查看绝世百宝箱免费版、积分权益、会员权益和即将开放的升级方案。',
    url: buildCanonical('/pricing'),
  },
};

export default function PricingPage() {
  return (
    <JueshiV4PublicShell>
      <PublicLandingPageFrame
        title="💎 定价方案"
        subtitle="选择适合您的方案，从个人免费到企业定制，灵活应对不同需求"
        variant="content"
      >
        <PricingClient />
      </PublicLandingPageFrame>
    </JueshiV4PublicShell>
  );
}
