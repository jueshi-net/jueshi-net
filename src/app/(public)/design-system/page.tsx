"use client";

import { PageContainer } from "@/components/ui/page-container";
import { Section } from "@/components/ui/section";
import { BaseCard } from "@/components/ui/base-card";
import { BaseButton } from "@/components/ui/base-button";
import { BaseBadge } from "@/components/ui/base-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Package, Lock, AlertTriangle } from "lucide-react";

export default function DesignSystemPage() {
  return (
    <PageContainer maxWidth="xl">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">设计系统 v1.0</h1>
        <p className="text-gray-500">海外百宝箱 UI 组件库 — 内部验收页面，不导航大面积展示</p>
        <div className="flex gap-2 mt-3">
          <BaseBadge variant="info">v1.20.0</BaseBadge>
          <BaseBadge variant="neutral">Teal 主题</BaseBadge>
          <BaseBadge variant="success">移动端优先</BaseBadge>
        </div>
      </div>

      {/* Page Container Demo */}
      <Section title="1. 页面容器 PageContainer" description="统一页面布局容器：max-w-7xl + 响应式两侧留白 + min-h-screen">
        <div className="bg-gray-100 rounded-lg p-4 text-sm text-gray-600 font-mono">
          &lt;PageContainer&gt; — max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8
        </div>
      </Section>

      {/* Section Demo */}
      <Section title="2. Section 区块" description="带标题、描述、可选操作和分割线的区块容器">
        <div className="border border-gray-200 rounded-lg p-4 bg-white">
          <Section title="示例区块" description="这是一个 Section 组件示例" divider>
            <p className="text-gray-600">这里是 Section 的内容区域...</p>
          </Section>
        </div>
      </Section>

      {/* BaseCard Demo */}
      <Section title="3. BaseCard 卡片" description="统一卡片容器：rounded-xl + 轻边框 + hover 阴影">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Default */}
          <BaseCard>
            <div className="p-4">
              <p className="text-sm font-medium text-gray-900">默认</p>
              <p className="text-xs text-gray-500 mt-1">基础卡片，无交互</p>
            </div>
          </BaseCard>

          {/* Hover */}
          <BaseCard hover>
            <div className="p-4">
              <p className="text-sm font-medium text-gray-900">Hover</p>
              <p className="text-xs text-gray-500 mt-1">鼠标悬停时阴影 + 边框变色</p>
            </div>
          </BaseCard>

          {/* Selected */}
          <BaseCard selected>
            <div className="p-4">
              <p className="text-sm font-medium text-gray-900">选中</p>
              <p className="text-xs text-gray-500 mt-1">左侧 teal 边框 + 浅背景</p>
            </div>
          </BaseCard>

          {/* Disabled */}
          <BaseCard disabled>
            <div className="p-4">
              <p className="text-sm font-medium text-gray-900">禁用</p>
              <p className="text-xs text-gray-500 mt-1">50% 透明度 + 不可交互</p>
            </div>
          </BaseCard>
        </div>
      </Section>

      {/* BaseButton Demo */}
      <Section title="4. BaseButton 按钮" description="5 种变体 × 3 种尺寸，移动端最小 44×44px">
        <div className="space-y-6">
          {/* Variants */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">变体</p>
            <div className="flex flex-wrap gap-3">
              <BaseButton variant="primary">Primary</BaseButton>
              <BaseButton variant="secondary">Secondary</BaseButton>
              <BaseButton variant="ghost">Ghost</BaseButton>
              <BaseButton variant="danger">Danger</BaseButton>
              <BaseButton variant="outline">Outline</BaseButton>
            </div>
          </div>

          {/* Sizes */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">尺寸</p>
            <div className="flex flex-wrap items-center gap-3">
              <BaseButton size="sm">Small (32px)</BaseButton>
              <BaseButton size="md">Medium (40px)</BaseButton>
              <BaseButton size="lg">Large (48px)</BaseButton>
            </div>
          </div>

          {/* States */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">状态</p>
            <div className="flex flex-wrap gap-3">
              <BaseButton variant="primary" loading>Loading</BaseButton>
              <BaseButton variant="primary" disabled>Disabled</BaseButton>
              <BaseButton variant="primary" fullWidth>Full Width</BaseButton>
            </div>
          </div>
        </div>
      </Section>

      {/* BaseBadge Demo */}
      <Section title="5. BaseBadge 状态标签" description="5 种变体：success、warning、danger、info、neutral">
        <div className="flex flex-wrap gap-2">
          <BaseBadge variant="success">已上线</BaseBadge>
          <BaseBadge variant="warning">待完善</BaseBadge>
          <BaseBadge variant="danger">错误</BaseBadge>
          <BaseBadge variant="info">信息</BaseBadge>
          <BaseBadge variant="neutral">草稿</BaseBadge>
          <BaseBadge variant="success">推广</BaseBadge>
          <BaseBadge variant="warning">会员</BaseBadge>
        </div>
      </Section>

      {/* EmptyState Demo */}
      <Section title="6. EmptyState 空状态" description="无数据、未登录、无权限三种示例">
        <div className="space-y-6">
          <EmptyState
            variant="no-data"
            title="暂无工具收藏"
            description="收藏常用工具，下次快速访问"
            actionLabel="浏览工具"
            onAction={() => {}}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <EmptyState
              variant="unauthorized"
              icon={<Lock className="w-16 h-16 text-gray-300" />}
              title="请先登录"
              description="登录后才能管理自定义网址"
              actionLabel="去登录"
              onAction={() => {}}
            />
            <EmptyState
              variant="default"
              icon={<AlertTriangle className="w-16 h-16 text-gray-300" />}
              title="暂无内容"
              description="该分类下还没有发布的文章"
            />
          </div>
        </div>
      </Section>

      {/* Form Styles Demo */}
      <Section title="7. 表单样式示例" description="Input、Textarea、Select、错误态、帮助文字">
        <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-lg space-y-5">
          {/* Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              输入框 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="请输入内容..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white placeholder:text-gray-400"
            />
            <p className="text-xs text-gray-400 mt-1">这是帮助文字</p>
          </div>

          {/* Input Error */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              错误状态
            </label>
            <input
              type="text"
              defaultValue="非法输入"
              className="w-full px-3 py-2 border border-red-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
            />
            <p className="text-xs text-red-500 mt-1">请输入有效的网址（http:// 或 https://）</p>
          </div>

          {/* Textarea */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              多行文本
            </label>
            <textarea
              rows={3}
              placeholder="请输入描述..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white placeholder:text-gray-400 resize-none"
            />
          </div>

          {/* Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              下拉选择
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white">
              <option value="">请选择分类</option>
              <option value="life">海外生活</option>
              <option value="logistics">跨境寄送</option>
              <option value="business">出海经营</option>
            </select>
          </div>

          {/* Checkbox & Radio */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" className="rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
              启用此功能
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="radio" name="demo" className="text-teal-600 focus:ring-teal-500" />
                选项 A
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="radio" name="demo" className="text-teal-600 focus:ring-teal-500" />
                选项 B
              </label>
            </div>
          </div>
        </div>
      </Section>

      {/* Mobile Notes */}
      <Section title="8. 移动端适配说明" description="iPhone Safari 兼容性要点">
        <BaseCard>
          <div className="p-6 space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-green-500 text-lg">✓</span>
              <div>
                <p className="text-sm font-medium text-gray-900">触控区域 ≥ 44px</p>
                <p className="text-xs text-gray-500">所有按钮、链接、表单元素最小触控区域 44×44px</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-500 text-lg">✓</span>
              <div>
                <p className="text-sm font-medium text-gray-900">禁止横向溢出</p>
                <p className="text-xs text-gray-500">所有容器 overflow-x-hidden，内容自动换行</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-500 text-lg">✓</span>
              <div>
                <p className="text-sm font-medium text-gray-900">100dvh 替代 100vh</p>
                <p className="text-xs text-gray-500">解决 Safari 底部工具栏遮挡问题</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-500 text-lg">✓</span>
              <div>
                <p className="text-sm font-medium text-gray-900">字体大小 ≥ 13px</p>
                <p className="text-xs text-gray-500">移动端正文最小 13px，确保可读性</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-500 text-lg">✓</span>
              <div>
                <p className="text-sm font-medium text-gray-900">单列布局优先</p>
                <p className="text-xs text-gray-500">移动端所有网格默认单列，≥768px 才多列</p>
              </div>
            </div>
          </div>
        </BaseCard>
      </Section>

      {/* Simulated Home Hero */}
      <Section title="9. 模拟首页 Hero（仅供设计验证）" description="此区域模拟 v1.20.1 首页 Hero 效果，非正式首页">
        <div className="bg-gradient-to-r from-teal-500 via-teal-600 to-teal-700 text-white rounded-xl p-8 md:p-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Package className="w-8 h-8" />
            <h2 className="text-2xl md:text-3xl font-bold">海外百宝箱</h2>
          </div>
          <p className="text-teal-100 text-base md:text-lg max-w-xl mx-auto mb-6">
            跨境寄送、海外生活、出海经营的实用工具一站整理
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button className="bg-white text-teal-700 font-medium px-6 py-3 rounded-lg hover:bg-teal-50 transition-colors min-h-[44px]">
              开始使用
            </button>
            <button className="border-2 border-white text-white font-medium px-6 py-3 rounded-lg hover:bg-white/10 transition-colors min-h-[44px]">
              浏览工具
            </button>
          </div>
        </div>
      </Section>

      {/* Simulated Tool Cards */}
      <Section title="10. 模拟工具卡片（仅供设计验证）" description="此区域模拟工具展示效果">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: "📦", name: "运单号整理", desc: "批量格式化运单号，自动识别承运商" },
            { icon: "📮", name: "邮编格式校验", desc: "5国邮编格式验证和参考" },
            { icon: "📄", name: "发票生成器", desc: "在线生成商业发票和装箱单" },
            { icon: "🧮", name: "运费估算", desc: "计算体积重和费用参考" },
          ].map((tool) => (
            <BaseCard key={tool.name} hover>
              <div className="p-4">
                <span className="text-2xl">{tool.icon}</span>
                <h3 className="text-sm font-semibold text-gray-900 mt-2">{tool.name}</h3>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{tool.desc}</p>
              </div>
            </BaseCard>
          ))}
        </div>
      </Section>

      {/* Footer */}
      <div className="mt-12 pt-6 border-t border-gray-200 text-center text-xs text-gray-400">
        <p>Design System v1.0 — 内部验收页面 · 不在导航栏大面积展示</p>
        <p className="mt-1">主色 #0d9488 · 背景 #f9fafb · 卡片 #ffffff · 移动端优先</p>
      </div>
    </PageContainer>
  );
}
