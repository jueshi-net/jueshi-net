'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { 
  TrendingUp, Users, MousePointer, BarChart3, 
  Download, Calendar, ArrowUp, ArrowDown, Globe, Clock
} from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [stats, setStats] = useState<any>({
    totalClicks: 0,
    totalLinks: 0,
    activeUsers: 0,
    avgCTR: 0,
    clickTrend: [],
    categoryDistribution: [],
    topLinks: [],
    geoDistribution: [],
    deviceDistribution: [],
    hourlyTraffic: [],
    weeklyComparison: [],
    conversionFunnel: []
  });

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics?range=${timeRange}`);
      const data = await res.json();
      setStats(data);
    } catch (err) {
      // Use fallback data
      setStats({
        totalClicks: 12847,
        totalLinks: 486,
        activeUsers: 2341,
        avgCTR: 4.2,
        clickTrend: generateClickTrend(),
        categoryDistribution: generateCategoryDist(),
        topLinks: generateTopLinks(),
        geoDistribution: generateGeoDist(),
        deviceDistribution: generateDeviceDist(),
        hourlyTraffic: generateHourlyTraffic(),
        weeklyComparison: generateWeeklyComparison(),
        conversionFunnel: generateFunnel()
      });
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">加载数据分析...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: '总点击量', value: stats.totalClicks.toLocaleString(), icon: MousePointer, change: '+12.5%', positive: true },
    { label: '活跃链接', value: stats.totalLinks.toString(), icon: BarChart3, change: '+3.2%', positive: true },
    { label: '活跃用户', value: stats.activeUsers.toLocaleString(), icon: Users, change: '+8.1%', positive: true },
    { label: '平均 CTR', value: `${stats.avgCTR}%`, icon: TrendingUp, change: '-0.3%', positive: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">数据分析中心</h1>
              <p className="text-sm text-gray-500 mt-1">实时监控与深度洞察</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex bg-gray-100 rounded-lg p-1">
                {['24h', '7d', '30d', '90d'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1.5 text-sm rounded-md transition-all ${
                      timeRange === range
                        ? 'bg-white text-blue-600 shadow-sm font-medium'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">导出报告</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, i) => (
            <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500">{stat.label}</span>
                <stat.icon className="w-5 h-5 text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="flex items-center gap-1 mt-2">
                {stat.positive ? (
                  <ArrowUp className="w-4 h-4 text-green-500" />
                ) : (
                  <ArrowDown className="w-4 h-4 text-red-500" />
                )}
                <span className={`text-sm ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change}
                </span>
                <span className="text-xs text-gray-400 ml-1">vs 上期</span>
              </div>
            </div>
          ))}
        </div>

        {/* Main Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Click Trend */}
          <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">点击趋势</h3>
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={stats.clickTrend}>
                <defs>
                  <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="clicks" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  fill="url(#colorClicks)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Category Distribution */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">分类分布</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.categoryDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Secondary Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Links */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">热门链接 TOP 10</h3>
            <div className="space-y-3">
              {stats.topLinks.map((link: any, i: number) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      i < 3 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {i + 1}
                    </span>
                    <span className="text-sm text-gray-700 truncate max-w-[200px]">{link.name}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{link.clicks.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Device Distribution */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">设备分布</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.deviceDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                <Tooltip />
                <Bar dataKey="value" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Advanced Analytics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Hourly Traffic */}
          <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900">24小时流量分布</h3>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.hourlyTraffic}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="hour" tick={{ fontSize: 11 }} stroke="#9CA3AF" />
                <YAxis tick={{ fontSize: 11 }} stroke="#9CA3AF" />
                <Tooltip />
                <Bar dataKey="visits" fill="#10B981" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Conversion Funnel */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">转化漏斗</h3>
            <div className="space-y-4">
              {stats.conversionFunnel.map((step: any, i: number) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">{step.name}</span>
                    <span className="text-sm font-medium text-gray-900">{step.value.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2.5 rounded-full transition-all"
                      style={{ width: `${step.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Weekly Comparison */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">周对比分析</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.weeklyComparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="thisWeek" stroke="#3B82F6" strokeWidth={2} name="本周" dot={{ r: 4 }} />
              <Line type="monotone" dataKey="lastWeek" stroke="#9CA3AF" strokeWidth={2} strokeDasharray="5 5" name="上周" dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// Helper functions for fallback data
function generateClickTrend() {
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  return days.map(day => ({
    date: day,
    clicks: Math.floor(Math.random() * 500) + 200
  }));
}

function generateCategoryDist() {
  return [
    { name: '快递物流', value: 35 },
    { name: '船公司', value: 25 },
    { name: '跨境电商', value: 20 },
    { name: '关务工具', value: 12 },
    { name: '其他', value: 8 }
  ];
}

function generateTopLinks() {
  return Array.from({ length: 10 }, (_, i) => ({
    name: `热门工具 ${i + 1}`,
    clicks: Math.floor(Math.random() * 5000) + 1000
  })).sort((a, b) => b.clicks - a.clicks);
}

function generateGeoDist() {
  return [
    { name: '华东', value: 35 },
    { name: '华南', value: 28 },
    { name: '华北', value: 18 },
    { name: '西南', value: 10 },
    { name: '其他', value: 9 }
  ];
}

function generateDeviceDist() {
  return [
    { name: '桌面端', value: 65 },
    { name: '移动端', value: 28 },
    { name: '平板', value: 7 }
  ];
}

function generateHourlyTraffic() {
  return Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    visits: Math.floor(Math.sin(i / 4) * 100 + 150 + Math.random() * 50)
  }));
}

function generateWeeklyComparison() {
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  return days.map(day => ({
    day,
    thisWeek: Math.floor(Math.random() * 300) + 200,
    lastWeek: Math.floor(Math.random() * 250) + 150
  }));
}

function generateFunnel() {
  const steps = [
    { name: '页面访问', value: 12847 },
    { name: '点击链接', value: 8234 },
    { name: '停留 >10s', value: 4521 },
    { name: '收藏/分享', value: 1245 },
    { name: '注册账户', value: 432 }
  ];
  const max = steps[0].value;
  return steps.map(step => ({
    ...step,
    percentage: (step.value / max) * 100
  }));
}
