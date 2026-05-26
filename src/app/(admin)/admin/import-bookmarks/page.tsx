'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, FolderOpen, Link2, CheckCircle, XCircle, Loader2, Download, AlertTriangle } from 'lucide-react';

export default function ImportBookmarksPage() {
  const [file, setFile] = useState<File | null>(null);
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [preview, setPreview] = useState<any>(null);
  const [importResult, setImportResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [skipExisting, setSkipExisting] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError('');
    setPreview(null);
    setImportResult(null);

    // Read file content
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setHtmlContent(content);
    };
    reader.readAsText(selectedFile);
  };

  const handlePreview = async () => {
    if (!htmlContent) {
      setError('请先选择书签文件');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/import/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html: htmlContent, mode: 'preview' }),
      });

      const data = await res.json();
      if (data.success) {
        setPreview(data.data);
      } else {
        setError(data.error || '解析失败');
      }
    } catch {
      setError('请求失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!htmlContent) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/import/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html: htmlContent, skipExisting }),
      });

      const data = await res.json();
      if (data.success) {
        setImportResult(data.data);
      } else {
        setError(data.error || '导入失败');
      }
    } catch {
      setError('请求失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setHtmlContent('');
    setPreview(null);
    setImportResult(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Upload className="w-6 h-6" />
          书签导入
        </h1>
        <p className="text-gray-500 mt-1">从 Chrome / Firefox / Edge 导出书签 HTML 文件，批量导入为分类和链接</p>
      </div>

      {/* File Upload */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          选择书签文件
        </h2>

        <div
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile) {
              setFile(droppedFile);
              const reader = new FileReader();
              reader.onload = (event) => {
                setHtmlContent(event.target?.result as string);
              };
              reader.readAsText(droppedFile);
            }
          }}
        >
          <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          {file ? (
            <div>
              <p className="text-lg font-medium text-gray-900">{file.name}</p>
              <p className="text-sm text-gray-500 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          ) : (
            <div>
              <p className="text-lg font-medium text-gray-700">点击或拖拽书签文件到此处</p>
              <p className="text-sm text-gray-400 mt-1">支持 Chrome / Firefox / Edge 导出的 HTML 书签文件</p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".html,.htm"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={handlePreview}
            disabled={!htmlContent || loading}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> : null}
            预览解析结果
          </button>
          <button
            onClick={handleReset}
            className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
          >
            重置
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
            <XCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}
      </div>

      {/* Preview */}
      {preview && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FolderOpen className="w-5 h-5" />
            解析预览
          </h2>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-blue-600">{preview.categories}</p>
              <p className="text-sm text-gray-500 mt-1">分类</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-green-600">{preview.links}</p>
              <p className="text-sm text-gray-500 mt-1">链接</p>
            </div>
          </div>

          {/* Import Options */}
          <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={skipExisting}
                onChange={(e) => setSkipExisting(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">跳过已存在的链接</span>
            </label>
          </div>

          {/* Preview Tables */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Categories */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">分类预览（前20个）</h3>
              <div className="bg-gray-50 rounded-lg p-3 max-h-48 overflow-y-auto space-y-1">
                {preview.preview?.categories?.map((cat: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-sm py-1">
                    <FolderOpen className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-gray-700">{cat.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Links */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">链接预览（前30个）</h3>
              <div className="bg-gray-50 rounded-lg p-3 max-h-48 overflow-y-auto space-y-1">
                {preview.preview?.links?.map((link: any, i: number) => (
                  <div key={i} className="text-sm py-1">
                    <span className="font-medium text-gray-700">{link.title}</span>
                    <span className="text-gray-400 mx-1">→</span>
                    <span className="text-gray-500 truncate block">{link.url}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Import Button */}
          <button
            onClick={handleImport}
            disabled={loading}
            className="mt-6 w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            确认导入
          </button>
        </div>
      )}

      {/* Import Result */}
      {importResult && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            导入结果
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{importResult.categoriesCreated}</p>
              <p className="text-xs text-gray-500 mt-1">新建分类</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-gray-500">{importResult.categoriesSkipped}</p>
              <p className="text-xs text-gray-500 mt-1">跳过分类</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{importResult.linksCreated}</p>
              <p className="text-xs text-gray-500 mt-1">新建链接</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-gray-500">{importResult.linksSkipped}</p>
              <p className="text-xs text-gray-500 mt-1">跳过链接</p>
            </div>
          </div>

          {/* Errors */}
          {importResult.errors && importResult.errors.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-red-600 flex items-center gap-1 mb-2">
                <AlertTriangle className="w-4 h-4" />
                错误（{importResult.errors.length}）
              </h3>
              <div className="bg-red-50 rounded-lg p-3 max-h-32 overflow-y-auto">
                {importResult.errors.slice(0, 10).map((err: string, i: number) => (
                  <p key={i} className="text-sm text-red-700 py-0.5">{err}</p>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleReset}
            className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
          >
            继续导入
          </button>
        </div>
      )}
    </div>
  );
}
