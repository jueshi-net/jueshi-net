'use client';

import React, { useState } from 'react';
import JueshiV4Sidebar from './JueshiV4Sidebar';
import JueshiV4Topbar from './JueshiV4Topbar';
import JueshiV4Hero from './JueshiV4Hero';
import JueshiV4ScenarioSection from './JueshiV4ScenarioSection';
import JueshiV4ToolGrid from './JueshiV4ToolGrid';
import JueshiV4ContentSection from './JueshiV4ContentSection';

export default function JueshiV4Shell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('home');

  return (
    <div className="min-h-screen bg-[#F6F8FC]">
      {/* Mobile menu overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <JueshiV4Sidebar
        activeNav={activeNav}
        onNavChange={setActiveNav}
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="lg:pl-60">
        {/* Topbar */}
        <JueshiV4Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        {/* Content */}
        <main className="p-6 lg:p-8 max-w-[1400px] mx-auto">
          {/* Hero */}
          <JueshiV4Hero />

          {/* Scenario shortcuts */}
          <JueshiV4ScenarioSection />

          {/* Tool grid */}
          <JueshiV4ToolGrid />

          {/* Content section */}
          <JueshiV4ContentSection />
        </main>
      </div>
    </div>
  );
}
