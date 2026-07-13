import type { Metadata } from 'next';
import JueshiV4HomeCandidateV2Shell from '@/components/ui-lab/jueshi-v4-home-candidate-v2/JueshiV4HomeCandidateV2Shell';

export const metadata: Metadata = {
  title: '绝世百宝箱 UI V4 首页候选版 V2 预览',
  description: '绝世百宝箱 UI V4 设计预览 - 首页候选版 V2，品牌化底部 Tab，信息密度提升',
  robots: {
    index: false,
    follow: false,
  },
};

export default function JueshiV4HomeCandidateV2Page() {
  return <JueshiV4HomeCandidateV2Shell />;
}
