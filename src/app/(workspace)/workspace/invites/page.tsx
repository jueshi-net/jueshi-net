'use client';

import { useState, useEffect } from 'react';
import { Copy, Check, ExternalLink, Gift, Users, Calendar, Award } from 'lucide-react';
import Link from 'next/link';
import PageHeader from '@/components/workspace/PageHeader';
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
        
        // Track invite code generation
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
      
      // Track copy action
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

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <PageHeader
          icon={<Gift className="w-5 h-5" />}
          title="邀请好友"
          description="邀请好友注册，获得奖励"
        />
        <div className="p-8 text-center text-gray-400">加载中...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        icon={<Gift className="w-5 h-5" />}
        title="邀请好友"
        description="邀请好友注册，获得奖励"
        action={
          <button
            onClick={generateInviteCode}
            disabled={generating || inviteCodes.length >= 3}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? '生成中...' : '生成邀请码'}
          </button>
        }
      />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-gray-500">已邀请人数</div>
              <div className="text-2xl font-bold text-gray-900">{invitedCount}</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-gray-500">我的邀请码</div>
              <div className="text-2xl font-bold text-gray-900">{inviteCodes.length}/3</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-gray-500">当前奖励</div>
              <div className="text-sm font-bold text-gray-900">3 天会员/人</div>
            </div>
          </div>
        </div>
      </div>

      {/* 奖励说明 */}
      <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl border border-teal-100 p-6 mb-6">
        <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Gift className="w-4 h-4 text-teal-600" />
          邀请奖励说明
        </h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p>• 每成功邀请一位好友注册，您将获得 <span className="font-bold text-teal-600">3 天会员</span> 奖励</p>
          <p>• 好友注册后将获得 <span className="font-bold text-teal-600">500 积分</span> 新手奖励</p>
          <p>• 奖励由平台规则决定，可能随活动调整</p>
          <p className="text-xs text-gray-500 mt-2">
            广告权益以内测规则为准，具体请咨询管理员
          </p>
        </div>
      </div>

      {/* 邀请码列表 */}
      {inviteCodes.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Gift className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-base font-semibold text-gray-900 mb-2">还没有邀请码</h3>
          <p className="text-sm text-gray-500 mb-6">
            生成您的专属邀请码，邀请好友注册获得奖励
          </p>
          <button
            onClick={generateInviteCode}
            disabled={generating}
            className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg text-sm font-bold hover:bg-teal-700 transition-colors"
          >
            生成第一个邀请码
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {inviteCodes.map(code => (
            <div key={code.id} className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg font-mono font-bold text-gray-900">{code.code}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      code.status === 'ACTIVE' ? 'bg-green-50 text-green-700' :
                      code.status === 'PAUSED' ? 'bg-amber-50 text-amber-700' :
                      'bg-gray-50 text-gray-700'
                    }`}>
                      {code.status === 'ACTIVE' ? '启用' : code.status === 'PAUSED' ? '暂停' : '过期'}
                    </span>
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
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(code.code, code.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-100 transition-colors"
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
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg text-xs font-medium hover:bg-teal-100 transition-colors"
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

              {/* 邀请记录 */}
              {code.redemptions.length > 0 && (
                <div className="border-t border-gray-100 pt-4">
                  <h4 className="text-xs font-medium text-gray-700 mb-2">邀请记录</h4>
                  <div className="space-y-2">
                    {code.redemptions.map(redemption => (
                      <div key={redemption.id} className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">
                          {redemption.invitee.name || redemption.invitee.email}
                        </span>
                        <span className="text-gray-400">
                          {new Date(redemption.createdAt).toLocaleDateString('zh-CN')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
