'use client';

import React, { useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import JueshiV4Header from '@/components/ui-lab/jueshi-v4-home-candidate-v4/JueshiV4Header';
import JueshiV4BottomTab from '@/components/ui-lab/jueshi-v4-home-candidate-v4/JueshiV4BottomTab';
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
  const [activeTab, setActiveTab] = useState('home');
  const pathname = usePathname();

  // 根据路径设置 activeTab
  React.useEffect(() => {
    if (pathname === '/') {
      setActiveTab('mobile_tab_home');
    } else if (pathname.startsWith('/tools')) {
      setActiveTab('mobile_tab_tools');
    } else if (pathname.startsWith('/checklists')) {
      setActiveTab('mobile_tab_checklist');
    } else if (pathname.startsWith('/workspace')) {
      setActiveTab('mobile_tab_profile');
    } else if (pathname.startsWith('/bbs') || pathname.startsWith('/community')) {
      setActiveTab('mobile_tab_community');
    } else {
      setActiveTab('mobile_tab_home'); // 默认
    }
  }, [pathname]);

  const handleMenuClick = useCallback(() => setMenuOpen(prev => !prev), []);

  return (
    <>
      <JueshiV4Header onMenuClick={handleMenuClick} menuOpen={menuOpen} />
      <main className="flex-1 pb-20">{children}</main>
      <JueshiV4BottomTab activeTab={activeTab} onTabChange={setActiveTab} />
      <JueshiV4Footer />
    </>
  );
}
