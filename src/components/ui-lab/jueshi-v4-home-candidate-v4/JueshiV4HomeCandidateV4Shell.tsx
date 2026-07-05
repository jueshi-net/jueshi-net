'use client';

import React, { useState } from 'react';
import JueshiV4HomeCandidateV3Hero from '../jueshi-v4-home-candidate-v3/JueshiV4HomeCandidateV3Hero';
import JueshiV4HomeCandidateV2ToolGrid from '../jueshi-v4-home-candidate-v2/JueshiV4HomeCandidateV2ToolGrid';
import JueshiV4HomeCandidateV2TaskChains from '../jueshi-v4-home-candidate-v2/JueshiV4HomeCandidateV2TaskChains';
import JueshiV4HomeCandidateV2ResourceNav from '../jueshi-v4-home-candidate-v2/JueshiV4HomeCandidateV2ResourceNav';
import JueshiV4ScenarioSection from '../jueshi-v4/JueshiV4ScenarioSection';
import JueshiV4RecommendedContent from '../jueshi-v4-topnav/JueshiV4RecommendedContent';
import JueshiV4CommunitySection from '../jueshi-v4-home-candidate-v3/JueshiV4CommunitySection';
import JueshiV4AdPlacementGrid from './JueshiV4AdPlacementGrid';
import JueshiV4Header from './JueshiV4Header';
import JueshiV4BottomTab from './JueshiV4BottomTab';
import JueshiV4Footer from './JueshiV4Footer';

// 轻量工作台提示条
function WorkbenchPrompt() {
  return (
    <section className="mb-10">
      <div className="bg-gradient-to-r from-[#6C5DD3]/5 to-[#3F8CFF]/5 border border-[#6C5DD3]/10 rounded-xl p-4 md:p-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#6C5DD3] to-[#3F8CFF] rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-lg">🦀</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#11142D] mb-0.5">
                登录后可保存工具、清单进度和勋章成长
              </h3>
              <p className="text-xs text-[#808191]">
                个性化你的工作台，随时访问常用功能
              </p>
            </div>
          </div>
          <a
            href="/workspace"
            className="px-5 py-2.5 bg-[#6C5DD3] text-white rounded-lg text-sm font-medium hover:bg-[#5A4FBF] transition-colors whitespace-nowrap"
          >
            进入我的工作台
          </a>
        </div>
      </div>
    </section>
  );
}

export default function JueshiV4HomeCandidateV4Shell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="min-h-screen bg-[#F6F8FC]">
      {/* Header - V4 专属，消费配置 */}
      <JueshiV4Header
        onMenuClick={() => setMenuOpen(!menuOpen)}
        menuOpen={menuOpen}
      />

      {/* Main content */}
      <main className="pb-24 md:pb-8">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
          {/* 1. Hero - 工作台嵌入左侧 */}
          <JueshiV4HomeCandidateV3Hero />

          {/* 2. 广告组：Hero 下方 - 调用现有广告系统 */}
          <div className="mb-8">
            <JueshiV4AdPlacementGrid
              placements={['home-hero', 'home-after-tools']}
              columns={2}
              title="推荐服务"
              description="精选跨境服务推荐"
            />
          </div>

          {/* 3. 常用场景 */}
          <JueshiV4ScenarioSection />

          {/* 4. 高频工具 */}
          <JueshiV4HomeCandidateV2ToolGrid />

          {/* 5. 广告组：工具区后 - 调用现有广告系统 */}
          <div className="mb-10">
            <JueshiV4AdPlacementGrid
              placements={['home-after-tools', 'tool-bottom']}
              columns={2}
              title="工具服务推荐"
              description="提升工作效率的专业工具"
            />
          </div>

          {/* 6. 热门任务链 */}
          <JueshiV4HomeCandidateV2TaskChains />

          {/* 7. 广告组：任务链后 - 调用现有广告系统 */}
          <div className="mb-10">
            <JueshiV4AdPlacementGrid
              placements={['home-before-footer', 'footer']}
              columns={2}
              title="流程服务推荐"
              description="集运、留学、外贸全流程服务"
            />
          </div>

          {/* 8. 社区论坛 */}
          <JueshiV4CommunitySection />

          {/* 9. 推荐内容 */}
          <JueshiV4RecommendedContent />

          {/* 10. 资源导航 */}
          <JueshiV4HomeCandidateV2ResourceNav />

          {/* 11. 轻量工作台提示条 */}
          <WorkbenchPrompt />

          {/* 12. 广告组：Footer 前 - 调用现有广告系统 */}
          <div className="mb-10">
            <JueshiV4AdPlacementGrid
              placements={['home-before-footer', 'footer']}
              columns={2}
              title="商业合作与会员"
              description="会员特权与商业合作机会"
            />
          </div>
        </div>
      </main>

      {/* Footer - V4 专属，消费配置 */}
      <JueshiV4Footer />

      {/* Bottom navigation - V4 专属，消费配置 */}
      <JueshiV4BottomTab activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
