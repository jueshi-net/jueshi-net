'use client';

import { useState, useEffect } from 'react';
import { Copy, Check, Gift, Users, Calendar, Award } from 'lucide-react';
import { WorkspacePageHeader, CompactTable, SaasEmptyState, StatusBadge, MetricCard, SectionCard } from '@/components/saas';
import { track } from '@/lib/analytics';

interface InviteCode {
  id: string;
  code: string;
  maxUses: number;
  usedCount: number;
  expiresAt: string | null;
  status: string;
  createdAt: string;
  redemptions: Array<{
    id: string;
    status: string;
    createdAt: string;
    invitee: {
      email: string;
      name: string | null;
    };
  }>;
}

export default function InvitesPage() {
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([]);
  const [invitedCount, setInvitedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInviteCodes();
  }, []);

  const fetchInviteCodes = async () => {
    try {
      const res = await fetch('/api/workspace/invites');
      const data = await res.json();
      if (data.success) {
        setInviteCodes(data.inviteCodes);
        setInvitedCount(data.invitedCount);
      }
    } catch (error) {
      console.error('Failed to fetch invite codes:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateInviteCode = async () => {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch('/api/workspace/invites', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setInviteCodes([data.inviteCode, ...inviteCodes]);
        
        track({
          eventType: 'invite_code_generate',
          toolName: 'invite-system',
          action: 'generate_code',
          path: '/workspace/invites',
          metadata: {
            codeId: data.inviteCode.id,
          },
        });
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError('生成邀请码失败');
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = async (text: string, codeId: string, isLink: boolean = false) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(codeId);
      setTimeout(() => setCopiedCode(null), 2000);
      
      track({
        eventType: isLink ? 'invite_link_copy' : 'invite_code_copy',
        toolName: 'invite-system',
        action: isLink ? 'copy_link' : 'copy_code',
        path: '/workspace/invites',
        metadata: {
          codeId,
        },
      });
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const getInviteLink = (code: string) => {
    return `${window.location.origin}/login?invite=${code}`;
  };

  // Table columns for invite code redemptions
  const redemptionColumns = [
    {
      key: 'invitee',
      header: '邀请对象',
      render: (row: any) => (
        <span className="text-gray-900 font-medium">
          {row.invitee.name || row.invitee.email}
        </span>
      ),
    },
    {
      key: 'status',
      header: '状态',
      align: 'center' as const,
      render: (row: any) => (
        <StatusBadge 
          label={row.status === 'COMPLETED' ? '已完成' : row.status} 
          variant={row.status === 'COMPLETED' ? 'success' : 'neutral'} 
          size="sm"
          dot
        />
      ),
    },
    {
      key: 'date',
      header: '日期',
      align: 'right' as const,
      render: (row: any) => (
        <span className="text-gray-500 text-xs">
          {new Date(row.createdAt).toLocaleDateString('zh-CN')}
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <WorkspacePageHeader
          title="邀请增长中心"
          subtitle="邀请好友注册，获得会员奖励"
          icon={<Gift className="w-5 h-5" />}
          breadcrumbs={[{ label: "工作台", href: "/workspace" }, { label: "邀请" }]}
        />
        <div className="p-8 text-center text-gray-400">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <WorkspacePageHeader
        title="邀请增长中心"
        subtitle="邀请好友注册，获得会员奖励"
        icon={<Gift className="w-5 h-5" />}
        breadcrumbs={[{ label: "工作台", href: "/workspace" }, { label: "邀请" }]}
        actions={
          <button
            onClick={generateInviteCode}
            disabled={generating || inviteCodes.length >= 3}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? '生成中...' : '生成邀请码'}
          </button>
        }
      />

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            label="已邀请人数"
            value={invitedCount}
            icon={<Users className="w-5 h-5" />}
          />
          <MetricCard
            label="我的邀请码"
            value={`${inviteCodes.length}/3`}
            icon={<Gift className="w-5 h-5" />}
          />
          <MetricCard
            label="当前奖励"
            value="3 天会员/人"
            icon={<Award className="w-5 h-5" />}
          />
        </div>

        {/* 奖励说明 */}
        <SectionCard title="邀请奖励说明">
          <div className="space-y-2 text-sm text-gray-700">
            <p>• 每成功邀请一位好友注册，您将获得 <span className="font-bold text-teal-600">3 天会员</span> 奖励</p>
            <p>• 好友注册后将获得 <span className="font-bold text-teal-600">500 积分</span> 新手奖励</p>
            <p>• 奖励由平台规则决定，可能随活动调整</p>
            <p className="text-xs text-gray-500 mt-2">
              广告权益以内测规则为准，具体请咨询管理员
            </p>
          </div>
        </SectionCard>

        {/* 邀请码列表 */}
        {inviteCodes.length === 0 ? (
          <SaasEmptyState
            variant="no-data"
            title="还没有邀请码"
            description="生成您的专属邀请码，邀请好友注册获得奖励"
            icon={<Gift className="w-12 h-12" />}
            primaryAction={{ label: '生成第一个邀请码', onClick: generateInviteCode }}
          />
        ) : (
          <div className="space-y-4">
            {inviteCodes.map(code => (
              <SectionCard key={code.id}>
                <div className="space-y-4">
                  {/* Code header */}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg font-mono font-bold text-gray-900">{code.code}</span>
                        <StatusBadge 
                          label={code.status === 'ACTIVE' ? '启用' : code.status === 'PAUSED' ? '暂停' : '过期'} 
                          variant={code.status === 'ACTIVE' ? 'success' : code.status === 'PAUSED' ? 'warning' : 'neutral'} 
                          size="sm"
                          dot
                          pulse={code.status === 'ACTIVE'}
                        />
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {code.usedCount}/{code.maxUses} 次使用
                        </span>
                        {code.expiresAt && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(code.expiresAt).toLocaleDateString('zh-CN')} 过期
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => copyToClipboard(code.code, code.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-100 transition-colors border border-gray-200"
                      >
                        {copiedCode === code.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-green-600" />
                            已复制
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            复制邀请码
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => copyToClipboard(getInviteLink(code.code), `${code.id}-link`, true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg text-xs font-medium hover:bg-teal-100 transition-colors border border-teal-200"
                      >
                        {copiedCode === `${code.id}-link` ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-green-600" />
                            已复制
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            复制邀请链接
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Redemption records */}
                  {code.redemptions.length > 0 && (
                    <div className="border-t border-gray-100 pt-4">
                      <h4 className="text-xs font-medium text-gray-700 mb-3">邀请记录</h4>
                      <CompactTable
                        columns={redemptionColumns}
                        data={code.redemptions}
                        rowKey={(row) => row.id}
                        density="compact"
                        striped
                      />
                    </div>
                  )}
                </div>
              </SectionCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
