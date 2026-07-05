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

// V4 广告矩阵 placement 定义
const AD_PLACEMENTS = {
  // Hero 后：6 个文字广告 + 4 个图片广告
  afterHeroText: [
    'home_v4_after_hero_text_1',
    'home_v4_after_hero_text_2',
    'home_v4_after_hero_text_3',
    'home_v4_after_hero_text_4',
    'home_v4_after_hero_text_5',
    'home_v4_after_hero_text_6',
  ],
  afterHeroImage: [
    'home_v4_after_hero_image_1',
    'home_v4_after_hero_image_2',
    'home_v4_after_hero_image_3',
    'home_v4_after_hero_image_4',
  ],
  
  // 工具区后：12 个文字广告 + 4 个图片广告
  afterToolsText: [
    'home_v4_after_tools_text_1',
    'home_v4_after_tools_text_2',
    'home_v4_after_tools_text_3',
    'home_v4_after_tools_text_4',
    'home_v4_after_tools_text_5',
    'home_v4_after_tools_text_6',
    'home_v4_after_tools_text_7',
    'home_v4_after_tools_text_8',
    'home_v4_after_tools_text_9',
    'home_v4_after_tools_text_10',
    'home_v4_after_tools_text_11',
    'home_v4_after_tools_text_12',
  ],
  afterToolsImage: [
    'home_v4_after_tools_image_1',
    'home_v4_after_tools_image_2',
    'home_v4_after_tools_image_3',
    'home_v4_after_tools_image_4',
  ],
  
  // 任务链后：12 个文字广告 + 4 个图片广告
  afterTasksText: [
    'home_v4_after_tasks_text_1',
    'home_v4_after_tasks_text_2',
    'home_v4_after_tasks_text_3',
    'home_v4_after_tasks_text_4',
    'home_v4_after_tasks_text_5',
    'home_v4_after_tasks_text_6',
    'home_v4_after_tasks_text_7',
    'home_v4_after_tasks_text_8',
    'home_v4_after_tasks_text_9',
    'home_v4_after_tasks_text_10',
    'home_v4_after_tasks_text_11',
    'home_v4_after_tasks_text_12',
  ],
  afterTasksImage: [
    'home_v4_after_tasks_image_1',
    'home_v4_after_tasks_image_2',
    'home_v4_after_tasks_image_3',
    'home_v4_after_tasks_image_4',
  ],
  
  // Footer 前：12 个文字广告 + 4 个图片广告
  beforeFooterText: [
    'home_v4_before_footer_text_1',
    'home_v4_before_footer_text_2',
    'home_v4_before_footer_text_3',
    'home_v4_before_footer_text_4',
    'home_v4_before_footer_text_5',
    'home_v4_before_footer_text_6',
    'home_v4_before_footer_text_7',
    'home_v4_before_footer_text_8',
    'home_v4_before_footer_text_9',
    'home_v4_before_footer_text_10',
    'home_v4_before_footer_text_11',
    'home_v4_before_footer_text_12',
  ],
  beforeFooterImage: [
    'home_v4_before_footer_image_1',
    'home_v4_before_footer_image_2',
    'home_v4_before_footer_image_3',
    'home_v4_before_footer_image_4',
  ],
};

export default function JueshiV4HomeCandidateV4Shell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="min-h-screen bg-[#F6F8FC]">
      {/* Dev marker - only in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-400 text-black text-center py-1 text-xs font-bold">
          DEV MODE · restored-original-v4 · c84ec6b
        </div>
      )}
      
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

          {/* 2. Hero 后广告矩阵：文字广告（6 个，2 行 x 3 列） */}
          <div className="mb-6">
            <JueshiV4AdPlacementGrid
              placements={AD_PLACEMENTS.afterHeroText}
              columns={6}
              rows={1}
              variant="text"
              title="推荐服务"
              description="精选跨境服务推荐"
            />
          </div>

          {/* 3. Hero 后广告矩阵：图片广告（4 个，1 行 x 4 列） */}
          <div className="mb-8">
            <JueshiV4AdPlacementGrid
              placements={AD_PLACEMENTS.afterHeroImage}
              columns={4}
              rows={1}
              variant="image"
              title="精选商家"
              description="优质服务商推荐"
            />
          </div>

          {/* 4. 常用场景 */}
          <JueshiV4ScenarioSection />

          {/* 5. 高频工具 */}
          <JueshiV4HomeCandidateV2ToolGrid />

          {/* 6. 工具区后广告矩阵：文字广告（12 个，2 行 x 6 列） */}
          <div className="mt-10 mb-6">
            <JueshiV4AdPlacementGrid
              placements={AD_PLACEMENTS.afterToolsText}
              columns={6}
              rows={2}
              variant="text"
              title="工具服务推荐"
              description="提升工作效率的专业工具"
            />
          </div>

          {/* 7. 工具区后广告矩阵：图片广告（4 个，1 行 x 4 列） */}
          <div className="mb-10">
            <JueshiV4AdPlacementGrid
              placements={AD_PLACEMENTS.afterToolsImage}
              columns={4}
              rows={1}
              variant="image"
              title="合作伙伴"
              description="优质合作伙伴推荐"
            />
          </div>

          {/* 8. 热门任务链 */}
          <JueshiV4HomeCandidateV2TaskChains />

          {/* 9. 任务链后广告矩阵：文字广告（12 个，2 行 x 6 列） */}
          <div className="mt-10 mb-6">
            <JueshiV4AdPlacementGrid
              placements={AD_PLACEMENTS.afterTasksText}
              columns={6}
              rows={2}
              variant="text"
              title="流程服务推荐"
              description="集运、留学、外贸全流程服务"
            />
          </div>

          {/* 10. 任务链后广告矩阵：图片广告（4 个，1 行 x 4 列） */}
          <div className="mb-10">
            <JueshiV4AdPlacementGrid
              placements={AD_PLACEMENTS.afterTasksImage}
              columns={4}
              rows={1}
              variant="image"
              title="服务商推荐"
              description="专业服务提供商"
            />
          </div>

          {/* 11. 社区论坛 */}
          <JueshiV4CommunitySection />

          {/* 12. 推荐内容 */}
          <JueshiV4RecommendedContent />

          {/* 13. 资源导航 */}
          <JueshiV4HomeCandidateV2ResourceNav />

          {/* 14. 轻量工作台提示条 */}
          <WorkbenchPrompt />

          {/* 15. Footer 前广告矩阵：文字广告（12 个，2 行 x 6 列） */}
          <div className="mt-10 mb-6">
            <JueshiV4AdPlacementGrid
              placements={AD_PLACEMENTS.beforeFooterText}
              columns={6}
              rows={2}
              variant="text"
              title="商业合作与会员"
              description="会员特权与商业合作机会"
            />
          </div>

          {/* 16. Footer 前广告矩阵：图片广告（4 个，1 行 x 4 列） */}
          <div className="mb-10">
            <JueshiV4AdPlacementGrid
              placements={AD_PLACEMENTS.beforeFooterImage}
              columns={4}
              rows={1}
              variant="image"
              title="精选推荐"
              description="优质资源推荐"
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
