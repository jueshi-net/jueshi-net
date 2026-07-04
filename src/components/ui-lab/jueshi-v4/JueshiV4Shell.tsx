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
    <>
      {/* Hide original site header/footer */}
      <style jsx global>{`
        body:has(.jueshi-v4-root) > header,
        body:has(.jueshi-v4-root) > main > header,
        body:has(.jueshi-v4-root) > footer,
        body:has(.jueshi-v4-root) > main > footer {
          display: none !important;
        }
        body:has(.jueshi-v4-root) {
          overflow-x: hidden;
        }
      `}</style>

      <div className="jueshi-v4-root fixed inset-0 z-[9999] bg-[#F6F8FC] overflow-hidden">
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
        <div className="lg:pl-60 h-full overflow-y-auto">
          {/* Topbar */}
          <JueshiV4Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

          {/* Content */}
          <main className="p-4 md:p-6 lg:p-8 max-w-[1200px] mx-auto">
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
    </>
  );
}
