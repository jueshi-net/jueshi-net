'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Shield, AlertCircle, CheckCircle, Clock, Users, FileText, Bug, Activity } from 'lucide-react';

interface BetaStatus {
  version: string;
  commit: string;
  buildId: string;
  builtAt: string;
  deployedAt: string;
}

interface UserStats {
  admin: number;
  user: number;
  member: number;
}

interface RewardStats {
  active: string[];
  inactive: string[];
}

export default function BetaAdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [betaStatus, setBetaStatus] = useState<BetaStatus | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [rewardStats, setRewardStats] = useState<RewardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/workspace');
      return;
    }

    if (status === 'authenticated' && session?.user?.role === 'admin') {
      loadData();
    }
  }, [status, session, router]);

  const loadData = async () => {
    try {
      // Load deploy version
      const versionRes = await fetch('/deploy-version.json');
      const versionData = await versionRes.json();
      setBetaStatus(versionData);

      // Load user stats
      const userStatsRes = await fetch('/api/admin/beta/stats');
      const userStatsData = await userStatsRes.json();
      setUserStats(userStatsData.userStats);
      setRewardStats(userStatsData.rewardStats);
    } catch (error) {
      console.error('Failed to load beta data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-teal-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Beta 管理后台</h1>
                <p className="text-sm text-gray-500">5-10 人内部测试管理</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Beta 进行中</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Beta Status */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-teal-600" />
            当前状态
          </h2>
          {betaStatus && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">版本</p>
                <p className="text-lg font-medium text-gray-900">{betaStatus.version}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Commit</p>
                <p className="text-lg font-medium text-gray-900 font-mono">{betaStatus.commit}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">构建时间</p>
                <p className="text-lg font-medium text-gray-900">{new Date(betaStatus.builtAt).toLocaleString('zh-CN')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">部署时间</p>
                <p className="text-lg font-medium text-gray-900">{new Date(betaStatus.deployedAt).toLocaleString('zh-CN')}</p>
              </div>
            </div>
          )}
        </div>

        {/* User Stats */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-600" />
            用户统计
          </h2>
          {userStats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-600">管理员</p>
                <p className="text-2xl font-bold text-blue-900">{userStats.admin}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-600">普通用户</p>
                <p className="text-2xl font-bold text-green-900">{userStats.user}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <p className="text-sm text-red-600">会员</p>
                <p className="text-2xl font-bold text-red-900">{userStats.member}</p>
                {userStats.member === 0 && (
                  <p className="text-xs text-green-600 mt-1">✅ 符合要求</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Reward Stats */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-teal-600" />
            奖励状态
          </h2>
          {rewardStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Active 奖励</p>
                <div className="space-y-2">
                  {rewardStats.active.map((reward) => (
                    <div key={reward} className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded">
                      <CheckCircle className="w-4 h-4" />
                      {reward}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Inactive 奖励</p>
                <div className="space-y-2">
                  {rewardStats.inactive.map((reward) => (
                    <div key={reward} className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded">
                      <AlertCircle className="w-4 h-4" />
                      {reward}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Test Scope */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600" />
            测试范围
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-green-700 mb-2">✅ 可测功能</p>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• 用户认证（注册/登录/登出）</li>
                <li>• 工作台和工具导航</li>
                <li>• 跨境发货任务链</li>
                <li>• 工具互通（HS/CBM/地址）</li>
                <li>• 地址邮编助手</li>
                <li>• 奖励兑换（member_1day/3day/7day, growth_50）</li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-medium text-red-700 mb-2">❌ 不可测功能</p>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• ad_slot_7day（未完整闭环）</li>
                <li>• no_branding_1x/5x（未完整闭环）</li>
                <li>• word_export_1x/3x/10x（未完整闭环）</li>
                <li>• 公开注册</li>
                <li>• 公开推广</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bug Stats */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Bug className="w-5 h-5 text-teal-600" />
            Bug 统计
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-sm text-red-600">P0 Bug</p>
              <p className="text-2xl font-bold text-red-900">0</p>
              <p className="text-xs text-green-600 mt-1">✅ 无 P0</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <p className="text-sm text-orange-600">P1 Bug</p>
              <p className="text-2xl font-bold text-orange-900">0</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <p className="text-sm text-yellow-600">P2 Bug</p>
              <p className="text-2xl font-bold text-yellow-900">0</p>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600" />
            快速链接
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="/reports/project-audit/v1.20.42.18.4.5-beta-user-test-checklist.md"
              className="flex items-center gap-3 p-4 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors"
            >
              <CheckCircle className="w-5 h-5 text-teal-600" />
              <div>
                <p className="font-medium text-teal-900">用户测试清单</p>
                <p className="text-sm text-teal-700">Beta 用户测试任务清单</p>
              </div>
            </a>
            <a
              href="/reports/project-audit/v1.20.42.18.4.5-beta-feedback-form-template.md"
              className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <FileText className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">反馈表模板</p>
                <p className="text-sm text-blue-700">Beta 用户反馈表模板</p>
              </div>
            </a>
            <a
              href="/reports/project-audit/v1.20.42.18.4.5-bug-triage-flow.md"
              className="flex items-center gap-3 p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
            >
              <Bug className="w-5 h-5 text-orange-600" />
              <div>
                <p className="font-medium text-orange-900">Bug 分级流程</p>
                <p className="text-sm text-orange-700">Bug 分级和处理流程</p>
              </div>
            </a>
            <a
              href="/reports/project-audit/v1.20.42.18.4.5-rollback-and-pause-playbook.md"
              className="flex items-center gap-3 p-4 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
            >
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <p className="font-medium text-red-900">回滚手册</p>
                <p className="text-sm text-red-700">回滚和停测手册</p>
              </div>
            </a>
            <a
              href="/reports/project-audit/v1.20.42.18.4.5-admin-daily-checklist.md"
              className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
            >
              <Clock className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">每日检查清单</p>
                <p className="text-sm text-green-700">管理员每日检查清单</p>
              </div>
            </a>
            <a
              href="/reports/project-audit/v1.20.42.18.4.5-beta-user-list-template.md"
              className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
            >
              <Users className="w-5 h-5 text-purple-600" />
              <div>
                <p className="font-medium text-purple-900">用户名单模板</p>
                <p className="text-sm text-purple-700">Beta 用户名单模板</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
