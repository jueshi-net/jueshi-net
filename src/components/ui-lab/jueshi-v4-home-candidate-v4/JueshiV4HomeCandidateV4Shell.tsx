'use client';

import React, { useState } from 'react';
import JueshiV4HomeCandidateHeader from '../jueshi-v4-home-candidate/JueshiV4HomeCandidateHeader';
import JueshiV4HomeCandidateV3Hero from '../jueshi-v4-home-candidate-v3/JueshiV4HomeCandidateV3Hero';
import JueshiV4HomeCandidateV2ToolGrid from '../jueshi-v4-home-candidate-v2/JueshiV4HomeCandidateV2ToolGrid';
import JueshiV4HomeCandidateV2TaskChains from '../jueshi-v4-home-candidate-v2/JueshiV4HomeCandidateV2TaskChains';
import JueshiV4HomeCandidateV2ResourceNav from '../jueshi-v4-home-candidate-v2/JueshiV4HomeCandidateV2ResourceNav';
import JueshiV4HomeCandidateV2BottomTab from '../jueshi-v4-home-candidate-v2/JueshiV4HomeCandidateV2BottomTab';
import JueshiV4HomeCandidateFooter from '../jueshi-v4-home-candidate/JueshiV4HomeCandidateFooter';
import JueshiV4ScenarioSection from '../jueshi-v4/JueshiV4ScenarioSection';
import JueshiV4RecommendedContent from '../jueshi-v4-topnav/JueshiV4RecommendedContent';
import JueshiV4CommunitySection from '../jueshi-v4-home-candidate-v3/JueshiV4CommunitySection';
import JueshiV4AdInventoryGroup from './JueshiV4AdInventoryGroup';
import { mockAdInventory } from './adInventory';

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

// Get ad group by key
function getAdGroup(groupKey: string) {
  return mockAdInventory.find((g) => g.groupKey === groupKey);
}

export default function JueshiV4HomeCandidateV4Shell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  // Get ad groups
  const afterHeroAd = getAdGroup('home_after_hero_ad_group');
  const afterToolsAd = getAdGroup('home_after_tools_ad_group');
  const afterTaskChainAd = getAdGroup('home_after_task_chain_ad_group');
  const communityAd = getAdGroup('home_community_ad_group');
  const beforeFooterAd = getAdGroup('home_before_footer_ad_group');

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
          {/* 1. Hero - 工作台嵌入左侧 */}
          <JueshiV4HomeCandidateV3Hero />

          {/* 2. 广告组：Hero 下方 */}
          {afterHeroAd && (
            <div className="mb-8">
              <JueshiV4AdInventoryGroup group={afterHeroAd} />
            </div>
          )}

          {/* 3. 常用场景 */}
          <JueshiV4ScenarioSection />

          {/* 4. 高频工具 */}
          <JueshiV4HomeCandidateV2ToolGrid />

          {/* 5. 广告组：工具区后 */}
          {afterToolsAd && (
            <div className="mb-10">
              <JueshiV4AdInventoryGroup group={afterToolsAd} />
            </div>
          )}

          {/* 6. 热门任务链 */}
          <JueshiV4HomeCandidateV2TaskChains />

          {/* 7. 广告组：任务链后 */}
          {afterTaskChainAd && (
            <div className="mb-10">
              <JueshiV4AdInventoryGroup group={afterTaskChainAd} />
            </div>
          )}

          {/* 8. 社区论坛 */}
          <JueshiV4CommunitySection />

          {/* 9. 广告组：社区旁 */}
          {communityAd && (
            <div className="mb-10">
              <JueshiV4AdInventoryGroup group={communityAd} />
            </div>
          )}

          {/* 10. 推荐内容 */}
          <JueshiV4RecommendedContent />

          {/* 11. 资源导航 */}
          <JueshiV4HomeCandidateV2ResourceNav />

          {/* 12. 轻量工作台提示条 */}
          <WorkbenchPrompt />

          {/* 13. 广告组：Footer 前 */}
          {beforeFooterAd && (
            <div className="mb-10">
              <JueshiV4AdInventoryGroup group={beforeFooterAd} />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <JueshiV4HomeCandidateFooter />

      {/* Bottom navigation */}
      <JueshiV4HomeCandidateV2BottomTab activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
