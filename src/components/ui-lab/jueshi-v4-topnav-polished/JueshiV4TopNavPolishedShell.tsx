'use client';

import React, { useState } from 'react';
import JueshiV4TopNavPolishedHeader from './JueshiV4TopNavPolishedHeader';
import JueshiV4TopNavPolishedHero from './JueshiV4TopNavPolishedHero';
import JueshiV4TopNavPolishedWorkspaceCard from './JueshiV4TopNavPolishedWorkspaceCard';
import JueshiV4TopNavBottomNav from '../jueshi-v4-topnav/JueshiV4TopNavBottomNav';

// 复用现有组件
import JueshiV4ScenarioSection from '../jueshi-v4/JueshiV4ScenarioSection';
import JueshiV4ToolGrid from '../jueshi-v4/JueshiV4ToolGrid';
import JueshiV4TaskChains from '../jueshi-v4-topnav/JueshiV4TaskChains';
import JueshiV4RecommendedContent from '../jueshi-v4-topnav/JueshiV4RecommendedContent';
import JueshiV4ResourceNav from '../jueshi-v4-topnav/JueshiV4ResourceNav';

export default function JueshiV4TopNavPolishedShell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="min-h-screen bg-[#F6F8FC]">
      {/* Header with real logo */}
      <JueshiV4TopNavPolishedHeader
        onMenuClick={() => setMenuOpen(!menuOpen)}
        menuOpen={menuOpen}
      />

      {/* Main content */}
      <main className="pb-24 md:pb-8">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
          {/* Hero with brand visual */}
          <JueshiV4TopNavPolishedHero />

          {/* Workspace card */}
          <JueshiV4TopNavPolishedWorkspaceCard />

          {/* Scenario shortcuts */}
          <JueshiV4ScenarioSection />

          {/* Tool grid */}
          <JueshiV4ToolGrid />

          {/* Task chains */}
          <JueshiV4TaskChains />

          {/* Recommended content */}
          <JueshiV4RecommendedContent />

          {/* Resource navigation */}
          <JueshiV4ResourceNav />
        </div>
      </main>

      {/* Bottom navigation - mobile only */}
      <JueshiV4TopNavBottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
