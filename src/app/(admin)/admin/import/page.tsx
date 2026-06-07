'use client';

import { useState } from 'react';
import { Upload, FileText, CheckCircle, XCircle, Loader2, Download } from 'lucide-react';

export default function AdminImportPage() {
  const [csv, setCsv] = useState('');
  const [mode, setMode] = useState('skip');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: number; skipped: number; errors: string[] } | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setCsv(e.target?.result as string);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) {
      handleFile(file);
    }
  };

  const handleImport = async () => {
    if (!csv.trim()) return;
    setLoading(true);
    setResult(null);

    const res = await fetch('/api/admin/import/csv', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ csv, mode }),
    });

    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  const downloadTemplate = () => {
    const template = 'name,url,description,category\nGoogle,https://google.com,搜索引擎,常用工具\nGitHub,https://github.com,代码托管,开发者工具\n';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'import-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Upload className="w-6 h-6" />
          批量导入链接
        </h1>
        <p className="text-gray-500 mt-1">通过 CSV 文件批量导入导航链接</p>
      </div>

      {/* 模板下载 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-blue-600" />
          <div>
            <p className="font-medium text-blue-900">下载导入模板</p>
            <p className="text-sm text-blue-600">CSV格式，包含name、url、description、category列</p>
          </div>
        </div>
        <button
          onClick={downloadTemplate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Download className="w-4 h-4" />
          下载模板
        </button>
      </div>

      {/* 上传区域 */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
      >
        <input
          type="file"
          accept=".csv"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          className="hidden"
          id="csv-upload"
        />
        <label
          htmlFor="csv-upload"
          className="cursor-pointer inline-flex flex-col items-center"
        >
          <Upload className="w-12 h-12 text-gray-400 mb-3" />
          <p className="text-lg font-medium text-gray-700">点击或拖拽上传 CSV 文件</p>
          <p className="text-sm text-gray-500 mt-1">支持 .csv 格式</p>
        </label>
      </div>

      {/* CSV 预览 */}
      {csv && (
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">CSV 预览</h3>
            <span className="text-sm text-gray-500">
              {csv.trim().split('\n').length - 1} 行数据
            </span>
          </div>
          <pre className="bg-gray-50 rounded p-3 text-xs overflow-auto max-h-48 font-mono">
            {csv.split('\n').slice(0, 10).join('\n')}
            {csv.split('\n').length > 10 && '\n...'}
          </pre>
        </div>
      )}

      {/* 导入选项 */}
      {csv && (
        <div className="flex items-center gap-4">
          <label className="text-sm text-gray-600">重复处理：</label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="skip">跳过重复</option>
            <option value="overwrite">覆盖更新</option>
          </select>
          <button
            onClick={handleImport}
            disabled={loading}
            className="ml-auto inline-flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            开始导入
          </button>
        </div>
      )}

      {/* 导入结果 */}
      {result && (
        <div className="bg-white rounded-lg border p-5 space-y-4">
          <h3 className="font-medium text-lg">导入结果</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-lg p-4 flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-green-700">{result.success}</p>
                <p className="text-sm text-green-600">成功导入</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-3">
              <FileText className="w-8 h-8 text-gray-400" />
              <div>
                <p className="text-2xl font-bold text-gray-700">{result.skipped}</p>
                <p className="text-sm text-gray-500">跳过</p>
              </div>
            </div>
          </div>
          {result.errors.length > 0 && (
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-sm font-medium text-red-700 mb-2">错误详情：</p>
              <ul className="text-xs text-red-600 space-y-1 max-h-32 overflow-auto">
                {result.errors.slice(0, 20).map((err, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <XCircle className="w-3 h-3 mt-0.5 shrink-0" />
                    {err}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
