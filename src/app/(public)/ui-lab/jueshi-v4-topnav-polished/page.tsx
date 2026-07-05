import type { Metadata } from 'next';
import JueshiV4TopNavPolishedShell from '@/components/ui-lab/jueshi-v4-topnav-polished/JueshiV4TopNavPolishedShell';

export const metadata: Metadata = {
  title: '绝世百宝箱 UI V4 顶部导航单栏精修版预览',
  description: '绝世百宝箱 UI V4 设计预览 - 顶部导航单栏精修版，接入真实 Logo，提升品牌感',
  robots: {
    index: false,
    follow: false,
  },
};

export default function JueshiV4TopNavPolishedPreviewPage() {
  return <JueshiV4TopNavPolishedShell />;
}
