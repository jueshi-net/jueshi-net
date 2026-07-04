"use client";

import { useState } from "react";
import JueshiV4Sidebar from "./JueshiV4Sidebar";
import JueshiV4Topbar from "./JueshiV4Topbar";
import JueshiV4Hero from "./JueshiV4Hero";
import JueshiV4ToolGrid from "./JueshiV4ToolGrid";
import JueshiV4ScenarioSection from "./JueshiV4ScenarioSection";
import JueshiV4ContentSection from "./JueshiV4ContentSection";

export default function JueshiV4Shell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#1b1d21] text-white">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <JueshiV4Sidebar
        isOpen={sidebarOpen}
        isCollapsed={sidebarCollapsed}
        onClose={() => setSidebarOpen(false)}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
        }`}
      >
        {/* Topbar */}
        <JueshiV4Topbar
          onMenuClick={() => setSidebarOpen(true)}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Page Content */}
        <main className="pb-20">
          <JueshiV4Hero />
          <JueshiV4ScenarioSection />
          <JueshiV4ToolGrid />
          <JueshiV4ContentSection />
        </main>

        {/* Footer */}
        <footer className="border-t border-[#3a3e45] py-8 px-6 text-center text-sm text-gray-400">
          <p>© 2026 绝世百宝箱 - 海外华人的实用工具箱</p>
          <p className="mt-2 text-xs">UI V4 预览版 - 红色赛博小螃蟹主题</p>
        </footer>
      </div>
    </div>
  );
}
