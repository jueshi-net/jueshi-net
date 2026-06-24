"use client";

import { useState, useRef, useCallback } from "react";
import { Building2, Plus, Edit3, Crown, ExternalLink, Mail, Phone, MapPin, Check, BarChart3, AlertCircle, AlertTriangle, CheckCircle2, XCircle, Upload, Image as ImageIcon, Loader2 } from "lucide-react";
import Link from "next/link";
import { MetricCard } from "@/components/saas/MetricCard";
import { SectionCard } from "@/components/saas/SectionCard";
import { WorkspacePageHeader } from "@/components/saas/WorkspacePageHeader";
import { StatusBadge } from "@/components/saas/StatusBadge";
import { SaasEmptyState } from "@/components/saas/SaasEmptyState";

function getCompleteness(profile: any): { score: number; missing: string[]; filled: string[] } {
  const fields = [
    { key: "companyName", label: "公司名称" },
    { key: "contactPerson", label: "联系人" },
    { key: "email", label: "邮箱" },
    { key: "phone", label: "电话" },
    { key: "address", label: "地址" },
  ];
  const filled = fields.filter(f => profile[f.key]);
  const missing = fields.filter(f => !profile[f.key]).map(f => f.label);
  return {
    score: Math.round((filled.length / fields.length) * 100),
    missing,
    filled: filled.map(f => f.label),
  };
}

function getCompletenessVariant(score: number): 'success' | 'warning' | 'danger' {
  if (score === 100) return 'success';
  if (score >= 60) return 'warning';
  return 'danger';
}

function getCompletenessIcon(score: number) {
  if (score === 100) return <CheckCircle2 className="w-3.5 h-3.5" />;
  if (score >= 60) return <AlertTriangle className="w-3.5 h-3.5" />;
  return <XCircle className="w-3.5 h-3.5" />;
}

interface CompanyProfileData {
  id?: string;
  companyName: string;
  companyNameEn?: string;
  contactPerson?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  cityPostal?: string;
  taxId?: string;
  logoDataUrl?: string;
  logoText?: string;
  isDefault?: boolean;
}

export default function CompanyProfilesClient({ profiles, isMember }: { profiles: any[]; isMember: boolean }) {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState<CompanyProfileData>({
    companyName: "",
    companyNameEn: "",
    contactPerson: "",
    email: "",
    phone: "",
    website: "",
    address: "",
    cityPostal: "",
    taxId: "",
    logoDataUrl: "",
    logoText: "",
  });

  const maxProfiles = isMember ? 10 : 1;
  const canCreate = profiles.length < maxProfiles;

  const avgCompleteness = profiles.length > 0
    ? Math.round(profiles.reduce((sum, p) => sum + getCompleteness(p).score, 0) / profiles.length)
    : 0;
  const completeCount = profiles.filter(p => getCompleteness(p).score === 100).length;

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      companyName: "",
      companyNameEn: "",
      contactPerson: "",
      email: "",
      phone: "",
      website: "",
      address: "",
      cityPostal: "",
      taxId: "",
      logoDataUrl: "",
      logoText: "",
    });
    setLogoPreview(null);
    setError(null);
    setSuccess(null);
    setLogoError(null);
    setShowModal(true);
  };

  const openEditModal = (profile: any) => {
    setEditingId(profile.id);
    setFormData({
      id: profile.id,
      companyName: profile.companyName || "",
      companyNameEn: profile.companyNameEn || "",
      contactPerson: profile.contactPerson || profile.contactName || "",
      email: profile.email || "",
      phone: profile.phone || "",
      website: profile.website || "",
      address: profile.address || "",
      cityPostal: profile.cityPostal || "",
      taxId: profile.taxId || "",
      logoDataUrl: profile.logoDataUrl || "",
      logoText: profile.logoText || "",
      isDefault: profile.isDefault,
    });
    setLogoPreview(profile.logoDataUrl || null);
    setError(null);
    setSuccess(null);
    setLogoError(null);
    setShowModal(true);
  };

  // Logo upload with security validation
  const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoError(null);

    // 1. File type check — only images allowed
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setLogoError("只支持 PNG、JPG、GIF、WebP 格式图片");
      return;
    }

    // 2. Reject dangerous extensions
    const dangerousExts = [".php", ".sh", ".py", ".js", ".html", ".svg", ".htm"];
    const fileName = file.name.toLowerCase();
    if (dangerousExts.some(ext => fileName.endsWith(ext))) {
      setLogoError(`不允许上传 ${fileName.split(".").pop()?.toUpperCase()} 文件`);
      return;
    }

    // 3. Size limit — 500KB
    if (file.size > 500 * 1024) {
      setLogoError("Logo 图片不能超过 500KB");
      return;
    }

    // 4. Read as data URL (no server path exposure)
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (!result.startsWith("data:image/")) {
        setLogoError("文件格式异常，请重新选择");
        return;
      }
      setLogoPreview(result);
      setFormData(prev => ({ ...prev, logoDataUrl: result }));
    };
    reader.onerror = () => {
      setLogoError("读取文件失败，请重试");
    };
    reader.readAsDataURL(file);
  }, []);

  const removeLogo = () => {
    setLogoPreview(null);
    setFormData(prev => ({ ...prev, logoDataUrl: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(null);

    if (!formData.companyName || formData.companyName.length < 2) {
      setError("公司名称至少 2 字");
      return;
    }

    setSaving(true);
    try {
      const url = editingId
        ? `/api/me/company-profiles/${editingId}`
        : "/api/me/company-profiles";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          contactName: formData.contactPerson,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "保存失败，请重试");
        setSaving(false);
        return;
      }

      setSuccess(editingId ? "公司资料已更新" : "公司资料已创建");
      setSaving(false);

      // Reload page after short delay to show updated data
      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (err) {
      setError("网络错误，请检查连接后重试");
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto" data-testid="company-profiles-page">
      <WorkspacePageHeader
        title="公司资料管理"
        subtitle="管理你的公司信息，用于单据自动填充"
        icon={<Building2 className="w-5 h-5" />}
        breadcrumbs={[
          { label: '工作台', href: '/workspace' },
          { label: '公司资料' },
        ]}
        actions={
          canCreate ? (
            <button
              onClick={openCreateModal}
              data-testid="company-profile-create-btn"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" /> 新建资料
            </button>
          ) : (
            <Link
              href="/workspace/member"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-sm font-medium hover:bg-amber-100 transition-colors"
            >
              <Crown className="w-4 h-4" /> 升级会员
            </Link>
          )
        }
      />

      <div className="px-6 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MetricCard
            label="已创建"
            value={`${profiles.length}/${maxProfiles}`}
            icon={<Building2 className="w-5 h-5" />}
          />
          <MetricCard
            label="平均完整度"
            value={`${avgCompleteness}%`}
            icon={<BarChart3 className="w-5 h-5" />}
            trend={{ value: avgCompleteness >= 80 ? '良好' : '待完善', positive: avgCompleteness >= 80 }}
          />
          <MetricCard
            label="资料完整"
            value={completeCount}
            icon={<Check className="w-5 h-5" />}
          />
          <MetricCard
            label="账户类型"
            value={isMember ? "会员" : "免费"}
            icon={<Crown className="w-5 h-5" />}
          />
        </div>

        {/* Profile Cards */}
        {profiles.length === 0 ? (
          <SaasEmptyState
            variant="no-data"
            title="还没有公司资料"
            description="创建公司资料后，填写单据时可以自动填充公司信息"
            primaryAction={{
              label: '创建第一套公司资料',
              onClick: openCreateModal,
            }}
          />
        ) : (
          <SectionCard title={`公司资料 (${profiles.length})`} subtitle="点击编辑按钮修改资料">
            <div className="grid sm:grid-cols-2 gap-3">
              {profiles.map(profile => {
                const completeness = getCompleteness(profile);
                const variant = getCompletenessVariant(completeness.score);
                return (
                  <div
                    key={profile.id}
                    data-testid={`company-profile-card-${profile.id}`}
                    className="border border-gray-100 rounded-xl p-4 hover:border-teal-200 hover:shadow-sm transition-all"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {profile.logoDataUrl ? (
                          <img src={profile.logoDataUrl} alt="logo" className="w-9 h-9 rounded-lg object-cover shrink-0" />
                        ) : (
                          <div className="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center shrink-0">
                            <Building2 className="w-4.5 h-4.5 text-purple-600" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <h3 className="font-semibold text-sm text-gray-900 truncate flex items-center gap-1.5">
                            <span className="truncate">{profile.companyName || "未命名"}</span>
                            {profile.isDefault && (
                              <StatusBadge label="默认" variant="success" size="sm" />
                            )}
                          </h3>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            更新于 {new Date(profile.updatedAt).toLocaleDateString("zh-CN")}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => openEditModal(profile)}
                        data-testid={`company-profile-edit-btn-${profile.id}`}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors shrink-0"
                        title="编辑"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Completeness indicator */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          {getCompletenessIcon(completeness.score)}
                          <span className="text-xs text-gray-600 font-medium">资料完整度</span>
                        </div>
                        <StatusBadge
                          label={`${completeness.score}%`}
                          variant={variant}
                          size="sm"
                          dot
                        />
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            completeness.score === 100 ? 'bg-green-500' : completeness.score >= 60 ? 'bg-amber-400' : 'bg-red-400'
                          }`}
                          style={{ width: `${completeness.score}%` }}
                        />
                      </div>
                    </div>

                    {/* Info rows */}
                    <div className="space-y-1 text-xs text-gray-500">
                      {profile.contactPerson && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-400 w-10 shrink-0">联系人</span>
                          <span className="truncate">{profile.contactPerson}</span>
                        </div>
                      )}
                      {profile.email && (
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3 h-3 text-gray-400 shrink-0" />
                          <span className="truncate">{profile.email}</span>
                        </div>
                      )}
                      {profile.phone && (
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-gray-400 shrink-0" />
                          <span>{profile.phone}</span>
                        </div>
                      )}
                      {profile.address && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-gray-400 shrink-0 mt-0.5" />
                          <span className="truncate">{profile.address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        )}

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" data-testid="company-profile-modal">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
                <h2 className="font-bold text-gray-900">
                  {editingId ? "编辑公司资料" : "新建公司资料"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="text-gray-400 text-lg">✕</span>
                </button>
              </div>

              {/* Form */}
              <div className="p-6 space-y-4">
                {/* Error/Success messages */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 flex items-center gap-2" data-testid="company-profile-error">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                {success && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700 flex items-center gap-2" data-testid="company-profile-success">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{success}</span>
                  </div>
                )}

                {/* Company Name */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    公司名称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={e => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-200"
                    placeholder="请输入公司全称"
                    data-testid="company-profile-input-companyName"
                  />
                </div>

                {/* Company Name EN */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">公司英文名</label>
                  <input
                    type="text"
                    value={formData.companyNameEn}
                    onChange={e => setFormData(prev => ({ ...prev, companyNameEn: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-200"
                    placeholder="Company Name (English)"
                    data-testid="company-profile-input-companyNameEn"
                  />
                </div>

                {/* Contact Person */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">联系人</label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={e => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-200"
                    placeholder="联系人姓名"
                    data-testid="company-profile-input-contactPerson"
                  />
                </div>

                {/* Email + Phone */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">邮箱</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-200"
                      placeholder="company@example.com"
                      data-testid="company-profile-input-email"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">电话</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-200"
                      placeholder="+86"
                      data-testid="company-profile-input-phone"
                    />
                  </div>
                </div>

                {/* Website */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">网站</label>
                  <input
                    type="text"
                    value={formData.website}
                    onChange={e => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-200"
                    placeholder="https://"
                    data-testid="company-profile-input-website"
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">地址</label>
                  <textarea
                    value={formData.address}
                    onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-200 resize-none"
                    rows={2}
                    placeholder="公司详细地址"
                    data-testid="company-profile-input-address"
                  />
                </div>

                {/* Logo Upload (members only) */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    公司 Logo {isMember ? "" : "(会员功能)"}
                  </label>
                  {logoError && (
                    <div className="mb-2 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {logoError}
                    </div>
                  )}
                  {logoPreview ? (
                    <div className="flex items-center gap-3">
                      <img src={logoPreview} alt="Logo preview" className="w-16 h-16 rounded-lg object-cover border border-gray-200" data-testid="company-profile-logo-preview" />
                      <button
                        onClick={removeLogo}
                        className="text-xs text-red-600 hover:text-red-700"
                        data-testid="company-profile-logo-remove"
                      >
                        移除
                      </button>
                    </div>
                  ) : isMember ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:border-teal-300 transition-colors"
                      data-testid="company-profile-logo-upload"
                    >
                      <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">点击上传 Logo</p>
                      <p className="text-[10px] text-gray-400 mt-1">PNG/JPG/GIF/WebP, 最大 500KB</p>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-100 rounded-lg p-4 text-center">
                      <ImageIcon className="w-6 h-6 text-gray-300 mx-auto mb-1" />
                      <p className="text-xs text-gray-400">升级会员后可上传 Logo</p>
                      <Link href="/workspace/member" className="text-xs text-teal-600 hover:underline mt-1 inline-block">
                        了解会员权益 →
                      </Link>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                    onChange={handleLogoUpload}
                    className="hidden"
                    data-testid="company-profile-logo-input"
                  />
                </div>

                {/* Free user notice */}
                {!isMember && (
                  <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-xs text-amber-700">
                    <div className="flex items-start gap-2">
                      <Crown className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium mb-1">免费版限制</p>
                        <p>免费版支持 1 套公司资料。升级会员可创建最多 10 套公司模板，并支持上传公司 Logo。</p>
                        <Link href="/workspace/member" className="text-teal-600 hover:underline inline-flex items-center gap-1 mt-2">
                          了解会员权益 <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-100 px-6 py-4 flex items-center justify-end gap-3 rounded-b-2xl">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  data-testid="company-profile-cancel-btn"
                >
                  取消
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  data-testid="company-profile-save-btn"
                  className="px-5 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      保存中...
                    </>
                  ) : (
                    "保存"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
