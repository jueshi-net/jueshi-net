'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Package, ArrowRight, Loader2, Globe, Truck,
  FileText, Shield, MapPin,
} from 'lucide-react';
import { WorkspacePageHeader } from '@/components/saas/WorkspacePageHeader';

export default function ShippingNewClient() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [productName, setProductName] = useState('');
  const [destinationCountry, setDestinationCountry] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('请输入任务名称');
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/task-chains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          type: 'shipping',
          sourceTool: 'task-chain-workbench',
          context: {
            productName: productName.trim() || undefined,
            destinationCountry: destinationCountry.trim() || undefined,
          },
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || '创建失败');
      }

      const data = await res.json();
      router.push(`/workspace/task-chains/shipping/${data.data.id}`);
    } catch (err: any) {
      setError(err.message || '创建失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const quickTemplates = [
    { label: '发往美国', country: 'US', icon: '🇺🇸' },
    { label: '发往英国', country: 'UK', icon: '🇬🇧' },
    { label: '发往日本', country: 'JP', icon: '🇯🇵' },
    { label: '发往澳大利亚', country: 'AU', icon: '🇦🇺' },
    { label: '发往加拿大', country: 'CA', icon: '🇨🇦' },
    { label: '发往德国', country: 'DE', icon: '🇩🇪' },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <WorkspacePageHeader
        title="新建发货任务"
        subtitle="创建跨境发货任务链，10 步完成全流程"
        icon={<Package className="w-5 h-5" />}
        breadcrumbs={[
          { label: '工作台', href: '/workspace' },
          { label: '任务链', href: '/workspace/task-chains' },
          { label: '新建发货任务' },
        ]}
      />

      <div className="px-4 py-6 space-y-6">
        {/* Process Overview */}
        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl border border-teal-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Truck className="w-5 h-5 text-teal-600" />
            发货任务流程
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { step: 1, label: '商品信息', icon: Package },
              { step: 2, label: 'HS编码', icon: FileText },
              { step: 3, label: '合规检查', icon: Shield },
              { step: 4, label: 'CBM计算', icon: FileText },
              { step: 5, label: '目的地址', icon: MapPin },
              { step: 6, label: '商业发票', icon: FileText },
              { step: 7, label: '装箱单', icon: FileText },
              { step: 8, label: '汇率成本', icon: Globe },
              { step: 9, label: '报价模板', icon: FileText },
              { step: 10, label: '完成', icon: Package },
            ].map(({ step, label, icon: Icon }) => (
              <div key={step} className="flex items-center gap-1.5 text-xs text-gray-600">
                <div className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-[10px] font-bold">
                  {step}
                </div>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                任务名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例如：发往美国的电子产品订单"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                maxLength={100}
              />
              <p className="text-xs text-gray-400 mt-1">给这个发货任务起个名字，方便后续查找</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                商品名称（可选）
              </label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="例如：蓝牙耳机、手机壳、LED灯"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                目的国家/地区（可选）
              </label>
              <input
                type="text"
                value={destinationCountry}
                onChange={(e) => setDestinationCountry(e.target.value)}
                placeholder="例如：美国、英国、日本"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
              {/* Quick select */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {quickTemplates.map((t) => (
                  <button
                    key={t.country}
                    type="button"
                    onClick={() => setDestinationCountry(t.label.replace('发往', ''))}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg border transition-colors ${
                      destinationCountry === t.label.replace('发往', '')
                        ? 'bg-teal-50 border-teal-300 text-teal-700'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span>{t.icon}</span>
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Submit */}
          <div className="flex items-center justify-between">
            <Link
              href="/workspace/task-chains"
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              返回任务链列表
            </Link>
            <button
              type="submit"
              disabled={submitting || !title.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  创建中...
                </>
              ) : (
                <>
                  创建任务并进入工作台
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
