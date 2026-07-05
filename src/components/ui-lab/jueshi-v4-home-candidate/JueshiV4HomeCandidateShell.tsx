'use client';

import React, { useState } from 'react';
import JueshiV4HomeCandidateHeader from './JueshiV4HomeCandidateHeader';
import JueshiV4HomeCandidateHero from './JueshiV4HomeCandidateHero';
import JueshiV4HomeCandidateWorkspace from './JueshiV4HomeCandidateWorkspace';
import JueshiV4HomeCandidateFooter from './JueshiV4HomeCandidateFooter';
import JueshiV4HomeCandidateBottomTab from './JueshiV4HomeCandidateBottomTab';

// 复用现有组件
import JueshiV4ScenarioSection from '../jueshi-v4/JueshiV4ScenarioSection';
import JueshiV4ToolGrid from '../jueshi-v4/JueshiV4ToolGrid';
import JueshiV4TaskChains from '../jueshi-v4-topnav/JueshiV4TaskChains';
import JueshiV4RecommendedContent from '../jueshi-v4-topnav/JueshiV4RecommendedContent';
import JueshiV4ResourceNav from '../jueshi-v4-topnav/JueshiV4ResourceNav';

export default function JueshiV4HomeCandidateShell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="min-h-screen bg-[#F6F8FC]">
      {/* Header */}
      <JueshiV4HomeCandidateHeader
        onMenuClick={() => setMenuOpen(!menuOpen)}
        menuOpen={menuOpen}
      />

      {/* Main content */}
      <main className="pb-24 md:pb-8">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
          {/* Hero */}
          <JueshiV4HomeCandidateHero />

          {/* Scenario shortcuts */}
          <JueshiV4ScenarioSection />

          {/* Tool grid */}
          <JueshiV4ToolGrid />

          {/* Workspace card */}
          <JueshiV4HomeCandidateWorkspace />

          {/* Task chains */}
          <JueshiV4TaskChains />

          {/* Recommended content */}
          <JueshiV4RecommendedContent />

          {/* Resource navigation */}
          <JueshiV4ResourceNav />
        </div>
      </main>

      {/* Footer */}
      <JueshiV4HomeCandidateFooter />

      {/* Bottom navigation - mobile only */}
      <JueshiV4HomeCandidateBottomTab activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
