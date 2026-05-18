"use client";

import { useState, useEffect } from "react";
import { Building2, Plus, Check, Loader2, ChevronsUpDown } from "lucide-react";

export interface CompanyProfile {
  id: string;
  profileName: string;
  companyName: string;
  companyNameEn: string | null;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  cityPostal: string | null;
  taxId: string | null;
  bankCnyInfo: string | null;
  bankUsdInfo: string | null;
  defaultCurrency: string;
  logoDataUrl: string | null;
  logoText: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CompanyProfilePickerProps {
  onSelect: (profile: CompanyProfile) => void;
  selectedId?: string | null;
}

export default function CompanyProfilePicker({ onSelect, selectedId }: CompanyProfilePickerProps) {
  const [profiles, setProfiles] = useState<CompanyProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formId, setFormId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notLogin, setNotLogin] = useState(false);

  const [formName, setFormName] = useState("");
  const [formCompany, setFormCompany] = useState("");
  const [formCompanyEn, setFormCompanyEn] = useState("");
  const [formContact, setFormContact] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formCurrency, setFormCurrency] = useState("USD");

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/me/company-profiles");
      if (res.status === 401) { setNotLogin(true); setProfiles([]); return; }
      const d = await res.json();
      const data = d.data || [];
      setProfiles(data);
    } catch { setProfiles([]); }
    setLoading(false);
  };

  useEffect(() => { fetchProfiles(); }, []);

  // Auto-select default
  useEffect(() => {
    if (!selectedId && profiles.length > 0) {
      const def = profiles.find(p => p.isDefault) || profiles[0];
      onSelect(def);
    }
  }, [profiles, selectedId, onSelect]);

  const handleSelect = (profile: CompanyProfile) => {
    onSelect(profile);
    setOpen(false);
  };

  const openForm = (profile?: CompanyProfile) => {
    if (profile) {
      setFormId(profile.id);
      setFormName(profile.profileName);
      setFormCompany(profile.companyName);
      setFormCompanyEn(profile.companyNameEn || "");
      setFormContact(profile.contactName || "");
      setFormPhone(profile.phone || "");
      setFormEmail(profile.email || "");
      setFormAddress(profile.address || "");
      setFormCurrency(profile.defaultCurrency);
    } else {
      setFormId(null);
      setFormName("");
      setFormCompany("");
      setFormCompanyEn("");
      setFormContact("");
      setFormPhone("");
      setFormEmail("");
      setFormAddress("");
      setFormCurrency("USD");
    }
    setError("");
    setShowForm(true);
    setOpen(false);
  };

  const handleSaveForm = async () => {
    if (!formCompany.trim()) { setError("公司名称必填"); return; }
    setSaving(true);
    setError("");
    try {
      const url = formId ? `/api/me/company-profiles/${formId}` : "/api/me/company-profiles";
      const method = formId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileName: formName || formCompany,
          companyName: formCompany,
          companyNameEn: formCompanyEn || null,
          contactName: formContact || null,
          phone: formPhone || null,
          email: formEmail || null,
          address: formAddress || null,
          defaultCurrency: formCurrency,
        }),
      });
      if (res.status === 401) { setNotLogin(true); setShowForm(false); return; }
      if (res.ok) {
        await fetchProfiles();
        setShowForm(false);
        // If saved current, re-select it
        if (formId) {
          const updated = profiles.find(p => p.id === formId);
          if (updated) onSelect(updated);
        }
      } else {
        const d = await res.json().catch(() => ({}));
        setError(d.error || "保存失败");
      }
    } catch { setError("网络错误"); }
    setSaving(false);
  };

  if (notLogin) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-sm text-yellow-700">
        请先 <a href="/login" className="underline font-medium">登录</a> 后才能使用公司资料功能
      </div>
    );
  }

  const selected = profiles.find(p => p.id === selectedId) || profiles.find(p => p.isDefault);

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm min-h-[44px] hover:border-gray-300"
      >
        <span className="flex items-center gap-2 min-w-0">
          <Building2 className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="truncate">
            {selected ? selected.companyName : (loading ? "加载中..." : "选择公司资料")}
          </span>
          {selected?.isDefault && <span className="text-xs bg-teal-50 text-teal-600 px-1.5 py-0.5 rounded">默认</span>}
        </span>
        <ChevronsUpDown className="w-4 h-4 text-gray-400 shrink-0" />
      </button>

      {/* Dropdown */}
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
            {profiles.map(p => (
              <button
                key={p.id}
                onClick={() => handleSelect(p)}
                className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center justify-between ${p.id === selectedId ? "bg-teal-50" : ""}`}
              >
                <div className="min-w-0">
                  <div className="font-medium truncate">{p.companyName}</div>
                  <div className="text-xs text-gray-500 truncate">{p.profileName}</div>
                </div>
                {p.id === selectedId && <Check className="w-4 h-4 text-teal-600 shrink-0 ml-2" />}
              </button>
            ))}
            <div className="border-t border-gray-100 px-4 py-2 flex gap-2">
              <button
                onClick={() => openForm()}
                className="flex-1 inline-flex items-center justify-center gap-1 text-sm text-teal-600 hover:text-teal-700 min-h-[44px]"
              >
                <Plus className="w-4 h-4" /> 新建
              </button>
              {selected && (
                <button
                  onClick={() => openForm(selected)}
                  className="flex-1 inline-flex items-center justify-center gap-1 text-sm text-gray-600 hover:text-gray-700 min-h-[44px]"
                >
                  <Building2 className="w-4 h-4" /> 编辑
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-lg font-bold mb-4">{formId ? "编辑公司资料" : "新建公司资料"}</h3>
            {error && <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700 mb-3">{error}</div>}
            <div className="space-y-3">
              <div><label className="text-xs text-gray-500">资料名称</label><input value={formName} onChange={e => setFormName(e.target.value)} placeholder="如：西雄供应链默认" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" /></div>
              <div><label className="text-xs text-gray-500">公司名称 *</label><input value={formCompany} onChange={e => setFormCompany(e.target.value)} placeholder="必填" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" /></div>
              <div><label className="text-xs text-gray-500">英文名</label><input value={formCompanyEn} onChange={e => setFormCompanyEn(e.target.value)} placeholder="Company Name EN" className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-gray-500">联系人</label><input value={formContact} onChange={e => setFormContact(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" /></div>
                <div><label className="text-xs text-gray-500">电话</label><input value={formPhone} onChange={e => setFormPhone(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" /></div>
              </div>
              <div><label className="text-xs text-gray-500">邮箱</label><input type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" /></div>
              <div><label className="text-xs text-gray-500">地址</label><textarea value={formAddress} onChange={e => setFormAddress(e.target.value)} rows={2} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
              <div><label className="text-xs text-gray-500">默认货币</label><select value={formCurrency} onChange={e => setFormCurrency(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]"><option value="USD">USD</option><option value="CNY">CNY</option><option value="EUR">EUR</option><option value="GBP">GBP</option></select></div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-lg min-h-[44px]">取消</button>
              <button onClick={handleSaveForm} disabled={saving} className="flex-1 px-4 py-2 text-sm text-white bg-teal-600 rounded-lg min-h-[44px] disabled:opacity-50">{saving ? <Loader2 className="w-4 h-4 animate-spin inline mr-1" /> : null} 保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
