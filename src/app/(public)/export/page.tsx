'use client';

import { useState } from 'react';
import { 
  Download, FileText, FileSpreadsheet, FileImage, 
  Settings, Check, Loader2, Database
} from 'lucide-react';

export default function ExportPage() {
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState<string[]>([]);
  const [options, setOptions] = useState({
    links: true,
    categories: true,
    favorites: true,
    memos: true,
    articles: false,
    ads: false,
    users: false,
    analytics: false,
    format: 'excel' as 'excel' | 'pdf' | 'csv' | 'json'
  });

  const handleExport = async () => {
    setExporting(true);
    setProgress(0);
    setCompleted([]);

    const steps: string[] = [];
    if (options.links) steps.push('links');
    if (options.categories) steps.push('categories');
    if (options.favorites) steps.push('favorites');
    if (options.memos) steps.push('memos');
    if (options.articles) steps.push('articles');

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setProgress(((i + 1) / steps.length) * 100);
      setCompleted(prev => [...prev, steps[i]]);
    }

    // Trigger download
    const res = await fetch(`/api/export?format=${options.format}&tables=${steps.join(',')}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kjbxb-export-${Date.now()}.${options.format === 'excel' ? 'xlsx' : options.format}`;
    a.click();
    URL.revokeObjectURL(url);

    setExporting(false);
  };

  const formatOptions = [
    { value: 'excel', label: 'Excel (.xlsx)', icon: FileSpreadsheet, color: 'text-green-600' },
    { value: 'pdf', label: 'PDF 报告', icon: FileText, color: 'text-red-600' },
    { value: 'csv', label: 'CSV 文件', icon: FileSpreadsheet, color: 'text-blue-600' },
    { value: 'json', label: 'JSON 数据', icon: Database, color: 'text-purple-600' },
  ];

  const dataOptions = [
    { key: 'links', label: '链接数据', desc: '所有链接及其分类、标签' },
    { key: 'categories', label: '分类数据', desc: '分类层级结构' },
    { key: 'favorites', label: '收藏数据', desc: '用户收藏记录' },
    { key: 'memos', label: '备忘录', desc: '用户备忘录内容' },
    { key: 'articles', label: '文章数据', desc: '已发布文章 (需管理员)' },
    { key: 'ads', label: '广告数据', desc: '广告位配置 (需管理员)' },
    { key: 'users', label: '用户数据', desc: '用户列表 (需管理员)' },
    { key: 'analytics', label: '分析数据', desc: '点击统计和趋势 (需管理员)' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">数据导出中心</h1>
          <p className="text-gray-500 mt-2">选择数据范围和导出格式，生成您的专属数据报告</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Options */}
          <div className="lg:col-span-2 space-y-6">
            {/* Format Selection */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-500" />
                导出格式
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {formatOptions.map((fmt) => (
                  <button
                    key={fmt.value}
                    onClick={() => setOptions(prev => ({ ...prev, format: fmt.value as any }))}
                    className={`p-4 rounded-lg border-2 transition-all text-center ${
                      options.format === fmt.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <fmt.icon className={`w-8 h-8 mx-auto mb-2 ${fmt.color}`} />
                    <div className="text-sm font-medium text-gray-700">{fmt.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Data Selection */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">选择数据范围</h2>
              <div className="space-y-3">
                {dataOptions.map((opt) => (
                  <label
                    key={opt.key}
                    className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all ${
                      options[opt.key as keyof typeof options]
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={options[opt.key as keyof typeof options] as boolean}
                        onChange={(e) => setOptions(prev => ({ ...prev, [opt.key]: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{opt.label}</div>
                        <div className="text-sm text-gray-500">{opt.desc}</div>
                      </div>
                    </div>
                    {options[opt.key as keyof typeof options] && (
                      <Check className="w-5 h-5 text-blue-500" />
                    )}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Summary & Export */}
          <div className="space-y-6">
            {/* Summary Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">导出摘要</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">数据表</span>
                  <span className="font-medium">
                    {Object.entries(options).filter(([k, v]) => k !== 'format' && v).length} 个
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">格式</span>
                  <span className="font-medium capitalize">{options.format}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">预估大小</span>
                  <span className="font-medium">~2.4 MB</span>
                </div>
              </div>

              {/* Progress */}
              {exporting && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">导出中...</span>
                    <span className="font-medium">{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <div className="mt-2 space-y-1">
                    {completed.map((step, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-green-600">
                        <Check className="w-4 h-4" />
                        <span>{step} 已完成</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleExport}
                disabled={exporting || Object.entries(options).filter(([k, v]) => k !== 'format' && v).length === 0}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {exporting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    导出中...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    开始导出
                  </>
                )}
              </button>

              <p className="text-xs text-gray-400 mt-3 text-center">
                导出文件将自动下载到您的设备
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
