'use client';

import { useState, useEffect } from 'react';
import { Settings, Save, Loader2, Globe, Users, Link, Mail, AlertTriangle, Image } from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    siteName: '',
    siteDescription: '',
    allowRegistration: true,
    maintenanceMode: false,
    maxLinksPerUser: 100,
    emailEnabled: false,
    branding: {
      logoUrl: '/brand/jueshi-logo-placeholder.svg',
      logoAlt: '绝世百宝箱 jueshi.net',
      logoWidth: 168,
      logoHeight: 42,
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        // 确保 branding 字段存在
        if (!data.branding) {
          data.branding = {
            logoUrl: '/brand/jueshi-logo-placeholder.svg',
            logoAlt: '绝世百宝箱 jueshi.net',
            logoWidth: 168,
            logoHeight: 42,
          };
        }
        setSettings(data);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    const data = await res.json();
    setMessage(data.message || '保存成功');
    setSaving(false);
    setTimeout(() => setMessage(''), 3000);
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="w-6 h-6" />
          系统设置
        </h1>
        <p className="text-gray-500 mt-1">配置平台全局参数</p>
      </div>

      {message && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
          {message}
        </div>
      )}

      {/* 品牌设置 */}
      <div className="bg-white rounded-lg shadow-sm border p-5 space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Image className="w-5 h-5" />
          品牌设置
        </h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
          <input
            type="text"
            value={settings.branding.logoUrl}
            onChange={(e) => setSettings({ 
              ...settings, 
              branding: { ...settings.branding, logoUrl: e.target.value }
            })}
            placeholder="/brand/jueshi-logo.svg 或 https://..."
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            支持站内路径（/brand/...）或 HTTPS URL。禁止 javascript: 和 data: URL。
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Logo Alt 文本</label>
          <input
            type="text"
            value={settings.branding.logoAlt}
            onChange={(e) => setSettings({ 
              ...settings, 
              branding: { ...settings.branding, logoAlt: e.target.value }
            })}
            placeholder="绝世百宝箱 jueshi.net"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            用于无障碍访问和 SEO。
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Logo 宽度 (px)</label>
            <input
              type="number"
              value={settings.branding.logoWidth}
              onChange={(e) => setSettings({ 
                ...settings, 
                branding: { ...settings.branding, logoWidth: parseInt(e.target.value) || 168 }
              })}
              min={50}
              max={500}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Logo 高度 (px)</label>
            <input
              type="number"
              value={settings.branding.logoHeight}
              onChange={(e) => setSettings({ 
                ...settings, 
                branding: { ...settings.branding, logoHeight: parseInt(e.target.value) || 42 }
              })}
              min={20}
              max={200}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Logo 预览</p>
          <div className="flex items-center justify-center bg-white border border-gray-200 rounded-lg p-4">
            <img
              src={settings.branding.logoUrl}
              alt={settings.branding.logoAlt}
              width={settings.branding.logoWidth}
              height={settings.branding.logoHeight}
              className="max-w-full h-auto"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            显示尺寸：{settings.branding.logoWidth} × {settings.branding.logoHeight} px
          </p>
        </div>
      </div>

      {/* 基本设置 */}
      <div className="bg-white rounded-lg shadow-sm border p-5 space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Globe className="w-5 h-5" />
          基本设置
        </h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">站点名称</label>
          <input
            type="text"
            value={settings.siteName}
            onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">站点描述</label>
          <textarea
            value={settings.siteDescription}
            onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
            rows={2}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* 功能开关 */}
      <div className="bg-white rounded-lg shadow-sm border p-5 space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Users className="w-5 h-5" />
          功能开关
        </h2>
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="font-medium">允许用户注册</p>
            <p className="text-sm text-gray-500">关闭后新用户无法注册</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.allowRegistration}
              onChange={(e) => setSettings({ ...settings, allowRegistration: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="font-medium flex items-center gap-2">
              维护模式
              {settings.maintenanceMode && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
            </p>
            <p className="text-sm text-gray-500">开启后前台显示维护页面</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.maintenanceMode}
              onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      {/* 限制设置 */}
      <div className="bg-white rounded-lg shadow-sm border p-5 space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Link className="w-5 h-5" />
          限制设置
        </h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">每用户最大链接数</label>
          <input
            type="number"
            value={settings.maxLinksPerUser}
            onChange={(e) => setSettings({ ...settings, maxLinksPerUser: parseInt(e.target.value) })}
            className="w-32 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* 邮件状态 */}
      <div className="bg-white rounded-lg shadow-sm border p-5 space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Mail className="w-5 h-5" />
          邮件服务
        </h2>
        <div className={`p-3 rounded-lg ${settings.emailEnabled ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>
          {settings.emailEnabled ? '✓ SMTP 已配置，邮件功能可用' : '✗ SMTP 未配置，邮件功能不可用'}
        </div>
      </div>

      {/* 保存按钮 */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          保存设置
        </button>
      </div>
    </div>
  );
}
