import type { Metadata } from 'next';
import JueshiV4HomeCandidateShell from '@/components/ui-lab/jueshi-v4-home-candidate/JueshiV4HomeCandidateShell';

export const metadata: Metadata = {
  title: '绝世百宝箱 UI V4 首页候选版预览',
  description: '绝世百宝箱 UI V4 设计预览 - 首页候选版，完整首页结构，包含底部 Tab 和 Footer',
  robots: {
    index: false,
    follow: false,
  },
};

export default function JueshiV4HomeCandidatePage() {
  return <JueshiV4HomeCandidateShell />;
}
