'use client';

import React from 'react';
import JueshiV4Header from '@/components/ui-lab/jueshi-v4-home-candidate-v4/JueshiV4Header';
import JueshiV4Footer from '@/components/ui-lab/jueshi-v4-home-candidate-v4/JueshiV4Footer';

interface JueshiV4PublicShellProps {
  children: React.ReactNode;
}

/**
 * JueshiV4PublicShell - 统一的 V4 公共外壳组件
 * 
 * 用于所有需要 V4 Header/Footer 的公共页面（如 /resources）
 * 确保与首页使用相同的视觉上下文
 */
export default function JueshiV4PublicShell({ children }: JueshiV4PublicShellProps) {
  return (
    <>
      <JueshiV4Header />
      <main className="flex-1">{children}</main>
      <JueshiV4Footer />
    </>
  );
}
