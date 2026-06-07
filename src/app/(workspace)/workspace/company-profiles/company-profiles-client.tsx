"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Building2, Plus, ArrowRight } from "lucide-react";

export default function CompanyProfilesClient() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/me/company-profiles")
      .then(r => r.ok ? r.json() : null)
      .then(d => setProfiles(d?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-teal-200 border-t-teal-600 rounded-full" /></div>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Building2 className="w-5 h-5 text-blue-600" /> 公司资料</h1>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" /> 新建公司资料
        </button>
      </div>

      {profiles.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <Building2 className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 font-medium mb-2">还没有公司资料</p>
          <p className="text-sm text-gray-400 mb-6">添加公司资料后，可快速填充单据中的公司信息</p>
          <button className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" /> 创建公司资料
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {profiles.map(p => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between hover:border-blue-200 transition-colors shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center"><Building2 className="w-5 h-5 text-blue-600" /></div>
                <div>
                  <p className="font-semibold text-gray-900">{p.companyName}</p>
                  <p className="text-xs text-gray-400">{p.address || "未填写地址"}</p>
                </div>
              </div>
              <Link href={`/workspace/company-profiles/${p.id}`} className="text-sm text-blue-600 hover:underline flex items-center gap-1">编辑 <ArrowRight className="w-3 h-3" /></Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
