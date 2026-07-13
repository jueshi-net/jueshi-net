'use client';

import React, { useState, useCallback } from 'react';
import JueshiV4Header from '@/components/ui-lab/jueshi-v4-home-candidate-v4/JueshiV4Header';
import JueshiV4Footer from '@/components/ui-lab/jueshi-v4-home-candidate-v4/JueshiV4Footer';

interface JueshiV4PublicShellProps {
  children: React.ReactNode;
}

/**
 * JueshiV4PublicShell - 统一的 V4 公共外壳组件
 * 
 * 用于所有需要 V4 Header/Footer 的公共页面（如 /resources, /tools, /guides 等）
 * 管理移动端菜单状态，确保 Header 的 mobile menu 正常工作
 */
export default function JueshiV4PublicShell({ children }: JueshiV4PublicShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const handleMenuClick = useCallback(() => setMenuOpen(prev => !prev), []);

  return (
    <>
      <JueshiV4Header onMenuClick={handleMenuClick} menuOpen={menuOpen} />
      <main className="flex-1">{children}</main>
      <JueshiV4Footer />
    </>
  );
}
