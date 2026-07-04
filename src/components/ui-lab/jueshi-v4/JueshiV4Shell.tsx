'use client';

import React, { useState } from 'react';
import JueshiV4Sidebar from './JueshiV4Sidebar';
import JueshiV4Topbar from './JueshiV4Topbar';
import JueshiV4Hero from './JueshiV4Hero';
import JueshiV4ScenarioSection from './JueshiV4ScenarioSection';
import JueshiV4ToolGrid from './JueshiV4ToolGrid';
import JueshiV4ContentSection from './JueshiV4ContentSection';
import JueshiV4RightRail from './JueshiV4RightRail';

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

      {/* Main layout */}
      <div className="lg:pl-60 xl:pl-60">
        {/* Topbar */}
        <JueshiV4Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        {/* Content area with optional right rail */}
        <div className="flex">
          {/* Main content */}
          <main className="flex-1 min-w-0 p-4 md:p-6 lg:p-8">
            <div className="max-w-[1180px] mx-auto">
              {/* Hero */}
              <JueshiV4Hero />

              {/* Scenario shortcuts */}
              <JueshiV4ScenarioSection />

              {/* Tool grid */}
              <JueshiV4ToolGrid />

              {/* Content section */}
              <JueshiV4ContentSection />
            </div>
          </main>

          {/* Right rail - only visible on wide screens */}
          <aside className="hidden xl:block w-80 flex-shrink-0 p-6 border-l border-[#E8ECF3]">
            <div className="sticky top-20">
              <JueshiV4RightRail />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
