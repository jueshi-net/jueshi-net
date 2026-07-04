'use client';

import React, { useState } from 'react';
import JueshiV4TopNavHeader from './JueshiV4TopNavHeader';
import JueshiV4TopNavHero from './JueshiV4TopNavHero';
import JueshiV4TopNavBottomNav from './JueshiV4TopNavBottomNav';
import JueshiV4WorkspaceCard from './JueshiV4WorkspaceCard';
import JueshiV4TaskChains from './JueshiV4TaskChains';
import JueshiV4RecommendedContent from './JueshiV4RecommendedContent';
import JueshiV4ResourceNav from './JueshiV4ResourceNav';

// 复用现有组件
import JueshiV4ScenarioSection from '../jueshi-v4/JueshiV4ScenarioSection';
import JueshiV4ToolGrid from '../jueshi-v4/JueshiV4ToolGrid';

export default function JueshiV4TopNavShell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="min-h-screen bg-[#F6F8FC]">
      {/* Header */}
      <JueshiV4TopNavHeader
        onMenuClick={() => setMenuOpen(!menuOpen)}
        menuOpen={menuOpen}
      />

      {/* Main content */}
      <main className="pb-24 md:pb-8">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
          {/* Hero */}
          <JueshiV4TopNavHero />

          {/* 我的工作台 */}
          <JueshiV4WorkspaceCard />

          {/* 常用场景 */}
          <JueshiV4ScenarioSection />

          {/* 高频工具 */}
          <JueshiV4ToolGrid />

          {/* 热门任务链 */}
          <JueshiV4TaskChains />

          {/* 推荐内容 */}
          <JueshiV4RecommendedContent />

          {/* 资源导航 */}
          <JueshiV4ResourceNav />
        </div>
      </main>

      {/* Bottom navigation - mobile only */}
      <JueshiV4TopNavBottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
