/**
 * Company Profile Picker — lets users select from their saved company profiles.
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { Building2, Plus, Loader2 } from "lucide-react";

export interface CompanyProfile {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  bankUsdInfo: string;
  bankCnyInfo: string;
  logoDataUrl: string;
}

interface CompanyProfilePickerProps {
  onSelect: (profile: CompanyProfile) => void;
  selectedId?: string;
}

export default function CompanyProfilePicker({ onSelect, selectedId }: CompanyProfilePickerProps) {
  const [profiles, setProfiles] = useState<CompanyProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/me/company-profiles")
      .then(async (res) => {
        if (!res.ok) {
          // 401 = not logged in, show empty state (no redirect)
          return [];
        }
        const json = await res.json();
        return json.data || [];
      })
      .then((data) => {
        setProfiles(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSelect = useCallback((profile: CompanyProfile) => {
    onSelect(profile);
  }, [onSelect]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
        <Loader2 className="w-4 h-4 animate-spin" /> 加载公司资料...
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
        <Building2 className="w-4 h-4" />
        <span>暂无公司资料，请先到</span>
        <a href="/workspace/company-profiles" className="text-teal-600 hover:underline">公司资料</a>
        <span>添加</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {profiles.map((p) => (
          <button
            key={p.id}
            onClick={() => handleSelect(p)}
            className={`text-left px-3 py-2 border rounded-lg text-sm min-h-[44px] transition-colors ${
              selectedId === p.id
                ? "border-teal-500 bg-teal-50 text-teal-700"
                : "border-gray-200 hover:border-teal-300 hover:bg-gray-50"
            }`}
          >
            <div className="font-medium truncate">{p.companyName}</div>
            <div className="text-xs text-gray-500 truncate">{p.email}{p.phone ? ` · ${p.phone}` : ""}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
