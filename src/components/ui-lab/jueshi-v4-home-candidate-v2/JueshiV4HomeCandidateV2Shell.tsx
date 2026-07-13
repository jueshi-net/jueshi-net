'use client';

import React, { useState } from 'react';
import JueshiV4HomeCandidateHeader from '../jueshi-v4-home-candidate/JueshiV4HomeCandidateHeader';
import JueshiV4HomeCandidateV2Hero from './JueshiV4HomeCandidateV2Hero';
import JueshiV4HomeCandidateV2ToolGrid from './JueshiV4HomeCandidateV2ToolGrid';
import JueshiV4HomeCandidateV2Workspace from './JueshiV4HomeCandidateV2Workspace';
import JueshiV4HomeCandidateV2TaskChains from './JueshiV4HomeCandidateV2TaskChains';
import JueshiV4HomeCandidateV2ResourceNav from './JueshiV4HomeCandidateV2ResourceNav';
import JueshiV4HomeCandidateV2BottomTab from './JueshiV4HomeCandidateV2BottomTab';
import JueshiV4HomeCandidateFooter from '../jueshi-v4-home-candidate/JueshiV4HomeCandidateFooter';

// 复用现有组件
import JueshiV4ScenarioSection from '../jueshi-v4/JueshiV4ScenarioSection';
import JueshiV4RecommendedContent from '../jueshi-v4-topnav/JueshiV4RecommendedContent';

export default function JueshiV4HomeCandidateV2Shell() {
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
          {/* Hero - Enhanced */}
          <JueshiV4HomeCandidateV2Hero />

          {/* Scenario shortcuts */}
          <JueshiV4ScenarioSection />

          {/* Tool grid - Enhanced */}
          <JueshiV4HomeCandidateV2ToolGrid />

          {/* Workspace - Enhanced */}
          <JueshiV4HomeCandidateV2Workspace />

          {/* Task chains - Enhanced */}
          <JueshiV4HomeCandidateV2TaskChains />

          {/* Recommended content */}
          <JueshiV4RecommendedContent />

          {/* Resource navigation - Enhanced */}
          <JueshiV4HomeCandidateV2ResourceNav />
        </div>
      </main>

      {/* Footer */}
      <JueshiV4HomeCandidateFooter />

      {/* Bottom navigation - mobile only with brand logo */}
      <JueshiV4HomeCandidateV2BottomTab activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
