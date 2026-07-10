"use client";

import { useEffect, useState, useCallback } from 'react';
import {
  TrendingUp, TrendingDown, Users, Eye, MousePointer, MessageSquare, AlertCircle,
  BarChart3, Gift, Link2, Package, Star, Megaphone, ArrowRight, AlertTriangle,
  RefreshCw, Calendar, Shield
} from 'lucide-react';
import { WorkspacePageHeader } from '@/components/saas/WorkspacePageHeader';
import { SectionCard } from '@/components/saas/SectionCard';
import { MetricCard } from '@/components/design-system';
import { StatusBadge } from '@/components/design-system/StatusBadge';
import { CompactTable } from '@/components/saas/CompactTable';
import { EmptyState } from '@/components/design-system/EmptyState';

// ─── Types ───────────────────────────────────────────────────────────────────

interface OverviewData {
  overview: {
    today: {
      pv: number; uv: number; sessions: number;
      toolUsage: number; signups: number; feedback: number; errors: number;
    };
    yesterday: { pv: number; uv: number };
    trends: { pvChange: number; uvChange: number };
  };
  topPages: Array<{ path: string; count: number }>;
  topReferrers: Array<{ domain: string; count: number }>;
  topTools: Array<{ tool: string; count: number }>;
  deviceDistribution: Array<{ device: string; count: number }>;
}

interface InviteFunnelSteps {
  generate: number;
  copy: number;
  linkCopy: number;
  registerSuccess: number;
  rewardGranted: number;
}

interface InviteConversions {
  generateToCopy: string;
  copyToLinkCopy: string;
  linkCopyToRegister: string;
  registerToReward: string;
  overallConversion: string;
}

interface ToolchainSteps {
  quote: number;
  pi: number;
  ci: number;
  pl: number;
  container: number;
  companyProfileApply: number;
}

interface ToolchainConversions {
  quoteToPI: string;
  piToCI: string;
  ciToPL: string;
}

interface ProductsData {
  total: number;
  active: number;
  uniqueUsers: number;
  recentCreated: number;
  importCount: number;
  insertCount: number;
  importFailedCount: number;
}

interface ResourcesData {
  featuredTotal: number;
  featuredActive: number;
  totalClicks: number;
  topClicks: Array<{ resource: string; count: number }>;
  featuredGroups: Array<{ group: string; count: number }>;
}

interface AdEntitlementsData {
  granted: number;
  grantedDays: number;
  pending: number;
  failed: number;
  revoked: number;
  applications: {
    pending: number;
    approved: number;
    rejected: number;
    active: number;
    expired: number;
  };
}

interface FunnelsData {
  success: boolean;
  range: string;
  daysBack: number;
  funnels: {
    invite: { steps: InviteFunnelSteps; conversions: InviteConversions };
    toolchain: { steps: ToolchainSteps; conversions: ToolchainConversions };
    products: ProductsData;
    resources: ResourcesData;
    adEntitlements: AdEntitlementsData;
    rewardSummary: Array<{ type: string; status: string; count: number; totalValue: number }>;
  };
  sampleSizeWarning: {
    invite: boolean;
    toolchain: boolean;
    products: boolean;
    resources: boolean;
    adEntitlements: boolean;
  };
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AnalyticsDashboard() {
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [funnelsData, setFunnelsData] = useState<FunnelsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [funnelRange, setFunnelRange] = useState('30d');
  const [funnelLoading, setFunnelLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchOverview = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/analytics/dashboard');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setOverviewData(data);
    } catch (err: any) {
      console.error('Failed to load overview:', err);
      setError(err.message);
    }
  }, []);

  const fetchFunnels = useCallback(async () => {
    setFunnelLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics/growth-funnels?range=${funnelRange}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setFunnelsData(data);
    } catch (err: any) {
      console.error('Failed to load funnels:', err);
      setError(err.message);
    } finally {
      setFunnelLoading(false);
    }
  }, [funnelRange]);

  useEffect(() => {
    fetchOverview().finally(() => setLoading(false));
  }, [fetchOverview]);

  useEffect(() => {
    if (activeTab === 'funnels') {
      fetchFunnels();
    }
  }, [activeTab, fetchFunnels]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <RefreshCw className="w-8 h-8 text-teal-600 animate-spin" />
        <span className="text-sm text-gray-400">加载中...</span>
      </div>
    );
  }

  if (!overviewData) {
    return (
      <EmptyState
        variant="error"
        title="加载失败"
        description={error || '无法加载 Analytics 数据'}
        primaryAction={{ label: '重试', onClick: () => { setLoading(true); fetchOverview().finally(() => setLoading(false)); } }}
      />
    );
  }

  const tabs = [
    { id: 'overview', label: '总览', icon: BarChart3 },
    { id: 'funnels', label: '增长漏斗', icon: TrendingUp },
    { id: 'pages', label: '页面排行', icon: Eye },
    { id: 'referrers', label: '来源分析', icon: Link2 },
    { id: 'tools', label: '工具排行', icon: MousePointer },
    { id: 'devices', label: '设备分布', icon: Users },
  ];

  return (
    <div className="space-y-6">
      <WorkspacePageHeader
        title="Analytics 总览"
        subtitle="流量分析、增长漏斗与运营数据看板"
        icon={<BarChart3 className="w-5 h-5" />}
        tabs={tabs.map(tab => ({
          label: tab.label,
          active: activeTab === tab.id,
          onClick: () => setActiveTab(tab.id),
        }))}
      />

      {/* Overview Tab */}
      {activeTab === 'overview' && <OverviewTab data={overviewData} />}

      {/* Growth Funnels Tab */}
      {activeTab === 'funnels' && (
        <FunnelsTab
          data={funnelsData}
          loading={funnelLoading}
          range={funnelRange}
          onRangeChange={setFunnelRange}
          onRefresh={fetchFunnels}
        />
      )}

      {/* Pages Tab */}
      {activeTab === 'pages' && (
        <SectionCard title="页面 PV 排行（近 7 天）" action={<Eye className="w-5 h-5 text-blue-500" />}>
          {overviewData.topPages.length === 0 ? (
            <EmptyState variant="no-data" title="暂无数据" description="页面访问数据将在用户使用后显示" compact />
          ) : (
            <CompactTable
              columns={[
                { key: "path", header: "页面路径", render: (row: any) => <span className="font-mono text-sm">{row.path}</span> },
                { key: "count", header: "访问量", align: "right", render: (row: any) => <span className="font-bold text-gray-900">{row.count}</span> },
              ]}
              data={overviewData.topPages}
              rowKey={(row: any, i: number) => `${row.path}-${i}`}
              density="compact"
            />
          )}
        </SectionCard>
      )}

      {/* Referrers Tab */}
      {activeTab === 'referrers' && (
        <SectionCard title="来源域名排行（近 7 天）" action={<Link2 className="w-5 h-5 text-blue-500" />}>
          {overviewData.topReferrers.length === 0 ? (
            <EmptyState variant="no-data" title="暂无数据" description="来源数据将在有外部流量后显示" compact />
          ) : (
            <CompactTable
              columns={[
                { key: "domain", header: "来源域名", render: (row: any) => <span className="font-medium text-gray-700">{row.domain}</span> },
                { key: "count", header: "访问量", align: "right", render: (row: any) => <span className="font-bold text-gray-900">{row.count}</span> },
              ]}
              data={overviewData.topReferrers}
              rowKey={(row: any, i: number) => `${row.domain}-${i}`}
              density="compact"
            />
          )}
        </SectionCard>
      )}

      {/* Tools Tab */}
      {activeTab === 'tools' && (
        <SectionCard title="工具使用排行（近 7 天）" action={<MousePointer className="w-5 h-5 text-blue-500" />}>
          {overviewData.topTools.length === 0 ? (
            <EmptyState variant="no-data" title="暂无数据" description="工具使用数据将在用户使用后显示" compact />
          ) : (
            <CompactTable
              columns={[
                { key: "tool", header: "工具名称", render: (row: any) => <span className="font-medium text-gray-700">{row.tool}</span> },
                { key: "count", header: "使用次数", align: "right", render: (row: any) => <span className="font-bold text-gray-900">{row.count}</span> },
              ]}
              data={overviewData.topTools}
              rowKey={(row: any, i: number) => `${row.tool}-${i}`}
              density="compact"
            />
          )}
        </SectionCard>
      )}

      {/* Devices Tab */}
      {activeTab === 'devices' && (
        <SectionCard title="设备分布（近 7 天）" action={<Users className="w-5 h-5 text-blue-500" />}>
          {overviewData.deviceDistribution.length === 0 ? (
            <EmptyState variant="no-data" title="暂无数据" description="设备数据将在用户访问后显示" compact />
          ) : (
            <CompactTable
              columns={[
                { key: "device", header: "设备类型", render: (row: any) => <span className="font-medium text-gray-700">{row.device}</span> },
                {
                  key: "count",
                  header: "访问量",
                  align: "right",
                  render: (row: any) => {
                    const total = overviewData.deviceDistribution.reduce((sum, d) => sum + d.count, 0);
                    const percentage = total > 0 ? ((row.count / total) * 100).toFixed(1) : '0';
                    return <span className="font-bold text-gray-900">{row.count} <span className="text-gray-400 font-normal text-xs">({percentage}%)</span></span>;
                  }
                },
              ]}
              data={overviewData.deviceDistribution}
              rowKey={(row: any, i: number) => `${row.device}-${i}`}
              density="compact"
            />
          )}
        </SectionCard>
      )}

      {/* Error Banner */}
      {overviewData.overview.today.errors > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-700">今日错误: {overviewData.overview.today.errors} 次</p>
            <p className="text-xs text-red-600 mt-0.5">工具错误事件</p>
          </div>
          <StatusBadge label={`${overviewData.overview.today.errors} 次`} variant="danger" dot pulse className="ml-auto" />
        </div>
      )}
    </div>
  );
}

// ─── Overview Tab ────────────────────────────────────────────────────────────

function OverviewTab({ data }: { data: OverviewData }) {
  const { overview } = data;
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="今日 PV"
          value={overview.today.pv}
          icon={<Eye className="w-5 h-5" />}
          trend={overview.trends.pvChange !== 0 ? { value: `${overview.trends.pvChange >= 0 ? '+' : ''}${overview.trends.pvChange} vs 昨日`, positive: overview.trends.pvChange >= 0 } : undefined}
        />
        <MetricCard
          label="今日 UV"
          value={overview.today.uv}
          icon={<Users className="w-5 h-5" />}
          trend={overview.trends.uvChange !== 0 ? { value: `${overview.trends.uvChange >= 0 ? '+' : ''}${overview.trends.uvChange} vs 昨日`, positive: overview.trends.uvChange >= 0 } : undefined}
        />
        <MetricCard
          label="工具使用"
          value={overview.today.toolUsage}
          icon={<MousePointer className="w-5 h-5" />}
        />
        <MetricCard
          label="注册 / 反馈"
          value={`${overview.today.signups} / ${overview.today.feedback}`}
          icon={<MessageSquare className="w-5 h-5" />}
        />
      </div>

      {/* Additional overview metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="今日 Sessions" value={overview.today.sessions} icon={<BarChart3 className="w-5 h-5" />} />
        <MetricCard label="今日错误" value={overview.today.errors} icon={<AlertCircle className="w-5 h-5" />} />
        <MetricCard label="昨日 PV / UV" value={`${overview.yesterday.pv} / ${overview.yesterday.uv}`} icon={<TrendingUp className="w-5 h-5" />} />
      </div>
    </div>
  );
}

// ─── Funnels Tab ─────────────────────────────────────────────────────────────

function FunnelsTab({
  data, loading, range, onRangeChange, onRefresh,
}: {
  data: FunnelsData | null;
  loading: boolean;
  range: string;
  onRangeChange: (r: string) => void;
  onRefresh: () => void;
}) {
  const [subTab, setSubTab] = useState('invite');

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <RefreshCw className="w-8 h-8 text-teal-600 animate-spin" />
        <div className="text-sm text-gray-400">加载增长漏斗数据...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <EmptyState
        variant="error"
        title="加载失败"
        description="无法加载增长漏斗数据"
        primaryAction={{ label: '重试', onClick: onRefresh }}
      />
    );
  }

  const subTabs = [
    { id: 'invite', label: '邀请增长', icon: Gift },
    { id: 'toolchain', label: '工具链', icon: Link2 },
    { id: 'products', label: '商品库', icon: Package },
    { id: 'resources', label: '资源推荐', icon: Star },
    { id: 'adEntitlements', label: '广告权益', icon: Megaphone },
  ];

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-400" />
          <select
            value={range}
            onChange={(e) => onRangeChange(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="7d">最近 7 天</option>
            <option value="14d">最近 14 天</option>
            <option value="30d">最近 30 天</option>
            <option value="all">全部</option>
          </select>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          刷新
        </button>
      </div>

      {/* Sub Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-gray-200">
        {subTabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap border-b-2 ${
                subTab === tab.id
                  ? 'border-teal-600 text-teal-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Sample Size Warning */}
      {data.sampleSizeWarning[subTab as keyof typeof data.sampleSizeWarning] && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">样本不足</p>
            <p className="text-xs text-amber-700 mt-1">
              当前数据量较少（&lt; 5 条），仅用于验证埋点链路，不用于产品结论。
            </p>
          </div>
        </div>
      )}

      {/* Sub Tab Content */}
      {subTab === 'invite' && <InviteFunnelSection data={data.funnels.invite} />}
      {subTab === 'toolchain' && <ToolchainFunnelSection data={data.funnels.toolchain} />}
      {subTab === 'products' && <ProductsSection data={data.funnels.products} />}
      {subTab === 'resources' && <ResourcesSection data={data.funnels.resources} />}
      {subTab === 'adEntitlements' && <AdEntitlementsSection data={data.funnels.adEntitlements} />}
    </div>
  );
}

// ─── Invite Funnel ───────────────────────────────────────────────────────────

function InviteFunnelSection({ data }: { data: FunnelsData['funnels']['invite'] }) {
  const steps = [
    { key: 'generate', label: '邀请码生成', value: data.steps.generate },
    { key: 'copy', label: '邀请码复制', value: data.steps.copy },
    { key: 'linkCopy', label: '链接复制', value: data.steps.linkCopy },
    { key: 'registerSuccess', label: '注册成功', value: data.steps.registerSuccess },
    { key: 'rewardGranted', label: '奖励发放', value: data.steps.rewardGranted },
  ];

  const conversions = [
    { label: '生成→复制', value: data.conversions.generateToCopy },
    { label: '复制→链接复制', value: data.conversions.copyToLinkCopy },
    { label: '链接→注册', value: data.conversions.linkCopyToRegister },
    { label: '注册→奖励', value: data.conversions.registerToReward },
    { label: '整体转化率', value: data.conversions.overallConversion },
  ];

  return (
    <div className="space-y-6">
      <SectionCard title="邀请增长漏斗" action={<Gift className="w-5 h-5 text-purple-500" />}>
        <div className="flex items-center gap-2 overflow-x-auto pb-4">
          {steps.map((step, i) => (
            <div key={step.key} className="flex items-center gap-2 shrink-0">
              <div className="rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 p-4 min-w-[120px] text-center">
                <div className="text-2xl font-bold text-purple-900">{step.value}</div>
                <div className="text-xs text-purple-600 mt-1">{step.label}</div>
              </div>
              {i < steps.length - 1 && (
                <ArrowRight className="w-5 h-5 text-gray-400 shrink-0" />
              )}
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="各阶段转化率">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {conversions.map(c => (
            <div key={c.label} className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-500">{c.label}</div>
              <div className="text-lg font-bold text-teal-600 mt-1">
                {c.value === 'N/A' ? 'N/A' : `${c.value}%`}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

// ─── Toolchain Funnel ────────────────────────────────────────────────────────

function ToolchainFunnelSection({ data }: { data: FunnelsData['funnels']['toolchain'] }) {
  const steps = [
    { key: 'quote', label: 'Quote', value: data.steps.quote },
    { key: 'pi', label: 'PI (形式发票)', value: data.steps.pi },
    { key: 'ci', label: 'CI (商业发票)', value: data.steps.ci },
    { key: 'pl', label: 'PL (装箱单)', value: data.steps.pl },
  ];

  const conversions = [
    { label: 'Quote → PI', value: data.conversions.quoteToPI },
    { label: 'PI → CI', value: data.conversions.piToCI },
    { label: 'CI → PL', value: data.conversions.ciToPL },
  ];

  return (
    <div className="space-y-6">
      <SectionCard title="工具链转化漏斗" action={<Link2 className="w-5 h-5 text-blue-500" />}>
        <div className="flex items-center gap-2 overflow-x-auto pb-4">
          {steps.map((step, i) => (
            <div key={step.key} className="flex items-center gap-2 shrink-0">
              <div className="rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 p-4 min-w-[120px] text-center">
                <div className="text-2xl font-bold text-blue-900">{step.value}</div>
                <div className="text-xs text-blue-600 mt-1">{step.label}</div>
              </div>
              {i < steps.length - 1 && (
                <ArrowRight className="w-5 h-5 text-gray-400 shrink-0" />
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {conversions.map(c => (
            <div key={c.label} className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-500">{c.label}</div>
              <div className="text-lg font-bold text-green-600 mt-1">
                {c.value === 'N/A' ? 'N/A' : `${c.value}%`}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="其他工具链事件">
        <div className="grid grid-cols-2 gap-3">
          <MetricCard label="Container → PL" value={data.steps.container} />
          <MetricCard label="公司资料→文档" value={data.steps.companyProfileApply} />
        </div>
      </SectionCard>
    </div>
  );
}

// ─── Products Section ────────────────────────────────────────────────────────

function ProductsSection({ data }: { data: ProductsData }) {
  return (
    <div className="space-y-6">
      <SectionCard title="商品库分析" action={<Package className="w-5 h-5 text-green-500" />}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard label="商品总数" value={data.total} icon={<Package className="w-5 h-5" />} />
          <MetricCard label="活跃商品" value={data.active} />
          <MetricCard label="使用用户数" value={data.uniqueUsers} icon={<Users className="w-5 h-5" />} />
          <MetricCard label="近期新增" value={data.recentCreated} />
        </div>
      </SectionCard>

      <SectionCard title="导入/插入统计">
        <div className="grid grid-cols-3 gap-4">
          <MetricCard label="导入次数" value={data.importCount} />
          <MetricCard label="插入次数" value={data.insertCount} />
          <MetricCard label="导入失败" value={data.importFailedCount} />
        </div>
      </SectionCard>
    </div>
  );
}

// ─── Resources Section ───────────────────────────────────────────────────────

function ResourcesSection({ data }: { data: ResourcesData }) {
  return (
    <div className="space-y-6">
      <SectionCard title="推荐资源分析" action={<Star className="w-5 h-5 text-yellow-500" />}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard label="推荐资源总数" value={data.featuredTotal} icon={<Star className="w-5 h-5" />} />
          <MetricCard label="活跃推荐" value={data.featuredActive} />
          <MetricCard label="总点击数" value={data.totalClicks} />
          <MetricCard label="推荐分组数" value={data.featuredGroups.length} />
        </div>
      </SectionCard>

      {data.topClicks.length > 0 && (
        <SectionCard title="Top 10 资源点击">
          <CompactTable
            columns={[
              {
                key: "rank",
                header: "#",
                width: "40px",
                render: (_row: any, i: number) => (
                  <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                    {i + 1}
                  </span>
                ),
              },
              { key: "resource", header: "资源名称", render: (row: any) => <span className="font-medium text-gray-700">{row.resource}</span> },
              { key: "count", header: "点击数", align: "right", render: (row: any) => <span className="font-bold text-gray-900">{row.count}</span> },
            ]}
            data={data.topClicks}
            rowKey={(row: any, i: number) => `${row.resource}-${i}`}
            density="compact"
          />
        </SectionCard>
      )}

      {data.featuredGroups.length > 0 && (
        <SectionCard title="Featured Group 分布">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {data.featuredGroups.map((g, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500 truncate">{g.group}</div>
                <div className="text-lg font-bold text-gray-900 mt-1">{g.count}</div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {data.topClicks.length === 0 && data.featuredGroups.length === 0 && (
        <EmptyState
          variant="no-data"
          title="暂无推荐资源数据"
          description="推荐资源数据将在用户点击后显示"
          icon={<Star className="w-12 h-12" />}
          compact
        />
      )}
    </div>
  );
}

// ─── Ad Entitlements Section ─────────────────────────────────────────────────

function AdEntitlementsSection({ data }: { data: AdEntitlementsData }) {
  return (
    <div className="space-y-6">
      <SectionCard title="广告权益分析 (AD_SLOT_DAYS)" action={<Megaphone className="w-5 h-5 text-orange-500" />}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard label="已发放" value={data.granted} icon={<Shield className="w-5 h-5" />} />
          <MetricCard label="发放天数" value={data.grantedDays} />
          <MetricCard label="待发放" value={data.pending} />
          <MetricCard label="发放失败" value={data.failed} />
        </div>
      </SectionCard>

      <SectionCard title="广告申请状态">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-500">待审核</div>
            <div className="text-xl font-bold text-gray-900 mt-1">{data.applications.pending}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center border border-green-200">
            <div className="text-xs text-green-600">已通过</div>
            <div className="text-xl font-bold text-green-700 mt-1">{data.applications.approved}</div>
          </div>
          <div className="bg-red-50 rounded-lg p-3 text-center border border-red-200">
            <div className="text-xs text-red-600">已拒绝</div>
            <div className="text-xl font-bold text-red-700 mt-1">{data.applications.rejected}</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-200">
            <div className="text-xs text-blue-600">投放中</div>
            <div className="text-xl font-bold text-blue-700 mt-1">{data.applications.active}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-200">
            <div className="text-xs text-gray-500">已过期</div>
            <div className="text-xl font-bold text-gray-500 mt-1">{data.applications.expired}</div>
          </div>
        </div>
      </SectionCard>

      {data.revoked > 0 && (
        <SectionCard title="已撤销">
          <div className="flex items-center gap-3">
            <StatusBadge label={`${data.revoked} 次`} variant="danger" dot />
            <span className="text-sm text-gray-500">广告权益已被撤销</span>
          </div>
        </SectionCard>
      )}
    </div>
  );
}
