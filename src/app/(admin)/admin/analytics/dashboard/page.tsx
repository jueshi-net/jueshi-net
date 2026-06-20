"use client";

import { useEffect, useState, useCallback } from 'react';
import {
  TrendingUp, TrendingDown, Users, Eye, MousePointer, MessageSquare, AlertCircle,
  BarChart3, Gift, Link2, Package, Star, Megaphone, ArrowRight, AlertTriangle,
  RefreshCw, Calendar, Shield
} from 'lucide-react';

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
      <div className="container mx-auto p-6">
        <div className="text-center py-12">加载中...</div>
      </div>
    );
  }

  if (!overviewData) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12 text-red-500">加载失败: {error}</div>
      </div>
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
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics 总览</h1>
        <p className="text-muted-foreground mt-2">v1.20.42.13.3 Phase G — 增长漏斗分析</p>
      </div>

      {/* Tabs */}
      <div className="border-b overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

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

      {/* Legacy Tabs */}
      {activeTab === 'pages' && (
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">页面 PV 排行（近 7 天）</h3>
          <div className="space-y-2">
            {overviewData.topPages.map((page, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                <span className="text-sm">{page.path}</span>
                <span className="text-sm font-medium">{page.count}</span>
              </div>
            ))}
            {overviewData.topPages.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">暂无数据</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'referrers' && (
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">来源域名排行（近 7 天）</h3>
          <div className="space-y-2">
            {overviewData.topReferrers.map((ref, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                <span className="text-sm">{ref.domain}</span>
                <span className="text-sm font-medium">{ref.count}</span>
              </div>
            ))}
            {overviewData.topReferrers.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">暂无数据</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'tools' && (
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">工具使用排行（近 7 天）</h3>
          <div className="space-y-2">
            {overviewData.topTools.map((tool, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                <span className="text-sm">{tool.tool}</span>
                <span className="text-sm font-medium">{tool.count}</span>
              </div>
            ))}
            {overviewData.topTools.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">暂无数据</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'devices' && (
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">设备分布（近 7 天）</h3>
          <div className="space-y-2">
            {overviewData.deviceDistribution.map((device, i) => {
              const total = overviewData.deviceDistribution.reduce((sum, d) => sum + d.count, 0);
              const percentage = total > 0 ? ((device.count / total) * 100).toFixed(1) : '0';
              return (
                <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                  <span className="text-sm">{device.device}</span>
                  <span className="text-sm font-medium">
                    {device.count} ({percentage}%)
                  </span>
                </div>
              );
            })}
            {overviewData.deviceDistribution.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">暂无数据</p>
            )}
          </div>
        </div>
      )}

      {/* Error Banner */}
      {overviewData.overview.today.errors > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-red-700">今日错误</div>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-red-700 mt-2">{overviewData.overview.today.errors}</div>
          <p className="text-xs text-red-600 mt-1">工具错误事件</p>
        </div>
      )}
    </div>
  );
}

// ─── Overview Tab ────────────────────────────────────────────────────────────

function OverviewTab({ data }: { data: OverviewData }) {
  const { overview } = data;
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="今日 PV"
        value={overview.today.pv}
        icon={<Eye className="h-4 w-4 text-muted-foreground" />}
        trend={overview.trends.pvChange}
        trendLabel="vs 昨日"
      />
      <StatCard
        label="今日 UV"
        value={overview.today.uv}
        icon={<Users className="h-4 w-4 text-muted-foreground" />}
        trend={overview.trends.uvChange}
        trendLabel="vs 昨日"
      />
      <StatCard
        label="工具使用"
        value={overview.today.toolUsage}
        icon={<MousePointer className="h-4 w-4 text-muted-foreground" />}
        subtitle="今日工具操作次数"
      />
      <StatCard
        label="注册 / 反馈"
        value={`${overview.today.signups} / ${overview.today.feedback}`}
        icon={<MessageSquare className="h-4 w-4 text-muted-foreground" />}
        subtitle="今日新增注册 / 反馈"
      />
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
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
        <div className="text-gray-500 text-sm">加载增长漏斗数据...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-red-500">加载失败</div>
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
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
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
          className="p-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          刷新
        </button>
      </div>

      {/* Sub Tabs */}
      <div className="border-b overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {subTabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSubTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
                  subTab === tab.id
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sample Size Warning */}
      {data.sampleSizeWarning[subTab as keyof typeof data.sampleSizeWarning] && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-800">样本不足</p>
            <p className="text-xs text-yellow-700 mt-1">
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
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Gift className="w-5 h-5 text-purple-500" />
          邀请增长漏斗
        </h3>
        <div className="flex items-center gap-2 overflow-x-auto pb-4">
          {steps.map((step, i) => (
            <div key={step.key} className="flex items-center gap-2 shrink-0">
              <div className="rounded-lg bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 p-4 min-w-[120px] text-center">
                <div className="text-2xl font-bold text-purple-900">{step.value}</div>
                <div className="text-xs text-purple-600 mt-1">{step.label}</div>
              </div>
              {i < steps.length - 1 && (
                <ArrowRight className="w-5 h-5 text-gray-400 shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h4 className="text-sm font-semibold mb-3 text-gray-700">各阶段转化率</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {conversions.map(c => (
            <div key={c.label} className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-500">{c.label}</div>
              <div className="text-lg font-bold text-blue-600 mt-1">
                {c.value === 'N/A' ? 'N/A' : `${c.value}%`}
              </div>
            </div>
          ))}
        </div>
      </div>
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
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Link2 className="w-5 h-5 text-blue-500" />
          工具链转化漏斗
        </h3>
        <div className="flex items-center gap-2 overflow-x-auto pb-4">
          {steps.map((step, i) => (
            <div key={step.key} className="flex items-center gap-2 shrink-0">
              <div className="rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 p-4 min-w-[120px] text-center">
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
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h4 className="text-sm font-semibold mb-3 text-gray-700">其他工具链事件</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500">Container → PL</div>
            <div className="text-lg font-bold text-gray-900 mt-1">{data.steps.container}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500">公司资料→文档</div>
            <div className="text-lg font-bold text-gray-900 mt-1">{data.steps.companyProfileApply}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Products Section ────────────────────────────────────────────────────────

function ProductsSection({ data }: { data: ProductsData }) {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-green-500" />
          商品库分析
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MiniStat label="商品总数" value={data.total} />
          <MiniStat label="活跃商品" value={data.active} />
          <MiniStat label="使用用户数" value={data.uniqueUsers} />
          <MiniStat label="近期新增" value={data.recentCreated} />
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h4 className="text-sm font-semibold mb-3 text-gray-700">导入/插入统计</h4>
        <div className="grid grid-cols-3 gap-4">
          <MiniStat label="导入次数" value={data.importCount} color="blue" />
          <MiniStat label="插入次数" value={data.insertCount} color="green" />
          <MiniStat label="导入失败" value={data.importFailedCount} color="red" />
        </div>
      </div>
    </div>
  );
}

// ─── Resources Section ───────────────────────────────────────────────────────

function ResourcesSection({ data }: { data: ResourcesData }) {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500" />
          推荐资源分析
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MiniStat label="推荐资源总数" value={data.featuredTotal} />
          <MiniStat label="活跃推荐" value={data.featuredActive} />
          <MiniStat label="总点击数" value={data.totalClicks} />
          <MiniStat label="推荐分组数" value={data.featuredGroups.length} />
        </div>
      </div>

      {data.topClicks.length > 0 && (
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h4 className="text-sm font-semibold mb-3 text-gray-700">Top 10 资源点击</h4>
          <div className="space-y-2">
            {data.topClicks.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                    {i + 1}
                  </span>
                  <span className="text-sm">{item.resource}</span>
                </div>
                <span className="text-sm font-medium">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.featuredGroups.length > 0 && (
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h4 className="text-sm font-semibold mb-3 text-gray-700">Featured Group 分布</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {data.featuredGroups.map((g, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500 truncate">{g.group}</div>
                <div className="text-lg font-bold text-gray-900 mt-1">{g.count}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.topClicks.length === 0 && data.featuredGroups.length === 0 && (
        <div className="rounded-lg border bg-card p-6 shadow-sm text-center py-8">
          <Star className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">暂无推荐资源数据</p>
        </div>
      )}
    </div>
  );
}

// ─── Ad Entitlements Section ─────────────────────────────────────────────────

function AdEntitlementsSection({ data }: { data: AdEntitlementsData }) {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-orange-500" />
          广告权益分析 (AD_SLOT_DAYS)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MiniStat label="已发放" value={data.granted} color="green" />
          <MiniStat label="发放天数" value={data.grantedDays} color="blue" />
          <MiniStat label="待发放" value={data.pending} color="yellow" />
          <MiniStat label="发放失败" value={data.failed} color="red" />
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h4 className="text-sm font-semibold mb-3 text-gray-700">广告申请状态</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <MiniStat label="待审核" value={data.applications.pending} />
          <MiniStat label="已通过" value={data.applications.approved} color="green" />
          <MiniStat label="已拒绝" value={data.applications.rejected} color="red" />
          <MiniStat label="投放中" value={data.applications.active} color="blue" />
          <MiniStat label="已过期" value={data.applications.expired} color="gray" />
        </div>
      </div>

      {data.revoked > 0 && (
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h4 className="text-sm font-semibold mb-3 text-gray-700">已撤销</h4>
          <div className="text-lg font-bold text-red-600">{data.revoked}</div>
        </div>
      )}
    </div>
  );
}

// ─── Shared Components ───────────────────────────────────────────────────────

function StatCard({
  label, value, icon, trend, trendLabel, subtitle,
}: {
  label: string;
  value: number | string;
  icon?: React.ReactNode;
  trend?: number;
  trendLabel?: string;
  subtitle?: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-muted-foreground">{label}</div>
        {icon}
      </div>
      <div className="text-2xl font-bold mt-2">{value}</div>
      {trend !== undefined && (
        <p className="text-xs text-muted-foreground mt-1">
          {trend >= 0 ? (
            <span className="text-green-500 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />+{trend}
            </span>
          ) : (
            <span className="text-red-500 flex items-center">
              <TrendingDown className="h-3 w-3 mr-1" />{trend}
            </span>
          )}
          {' '}{trendLabel}
        </p>
      )}
      {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
    </div>
  );
}

function MiniStat({
  label, value, color = 'default',
}: {
  label: string;
  value: number;
  color?: 'default' | 'blue' | 'green' | 'red' | 'yellow' | 'gray';
}) {
  const colorClasses = {
    default: 'text-gray-900',
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600',
    gray: 'text-gray-500',
  };

  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`text-xl font-bold mt-1 ${colorClasses[color]}`}>{value}</div>
    </div>
  );
}
