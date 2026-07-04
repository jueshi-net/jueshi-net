import type { Metadata } from 'next';
import JueshiV4TopNavShell from '@/components/ui-lab/jueshi-v4-topnav/JueshiV4TopNavShell';

export const metadata: Metadata = {
  title: '绝世百宝箱 UI V4 顶部导航单栏版预览',
  description: '绝世百宝箱 UI V4 设计预览 - 顶部导航单栏版，适合主站首页',
  robots: {
    index: false,
    follow: false,
  },
};

export default function JueshiV4TopNavPreviewPage() {
  return <JueshiV4TopNavShell />;
}
