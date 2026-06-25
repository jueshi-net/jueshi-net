"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { SafeTemplateRenderer } from "@/lib/template-studio/safe-template-renderer";
import { sanitizeTemplateName, sanitizeCustomCss, stripUnsafeCss } from "@/lib/template-studio/template-sanitizer";
import {
  type TemplateConfig,
  type TemplateFieldConfig,
  type TemplateColumnConfig,
  type CompanyProfile,
  type ProductItem,
  type DocumentData,
  defaultFields,
  defaultColumns,
  defaultStyle,
  defaultLayout,
  defaultBindings,
  isValidHexColor,
} from "@/lib/template-studio/template-schema";
import { getAllOfficialTemplates, getOfficialTemplateById } from "@/lib/template-studio/official-templates";

// ============================================================
// Types
// ============================================================

interface CompanyApiResponse {
  profiles: CompanyProfile[];
}

interface ProductApiResponse {
  products: ProductItem[];
}

// ============================================================
// localStorage helpers
// ============================================================

const STORAGE_KEY = "template-studio-templates";

function loadUserTemplates(): TemplateConfig[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveUserTemplates(templates: TemplateConfig[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

function saveUserTemplate(template: TemplateConfig): void {
  const all = loadUserTemplates();
  const idx = all.findIndex(t => t.id === template.id);
  if (idx >= 0) {
    all[idx] = template;
  } else {
    all.push(template);
  }
  saveUserTemplates(all);
}

function getUserTemplate(id: string): TemplateConfig | undefined {
  return loadUserTemplates().find(t => t.id === id);
}

function getAllTemplates(): TemplateConfig[] {
  return [...getAllOfficialTemplates(), ...loadUserTemplates()];
}

function findTemplate(id: string): TemplateConfig | undefined {
  return getOfficialTemplateById(id) || getUserTemplate(id);
}

// ============================================================
// Main Component
// ============================================================

export interface TemplateStudioClientProps {
  mode: "list" | "new" | "edit";
  templateId?: string;
}

export default function TemplateStudioClient({ mode, templateId }: TemplateStudioClientProps) {
  // --- State ---
  const [templates, setTemplates] = useState<TemplateConfig[]>([]);
  const [config, setConfig] = useState<TemplateConfig | null>(null);
  const [companies, setCompanies] = useState<CompanyProfile[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<ProductItem[]>([]);
  const [saveStatus, setSaveStatus] = useState<string>("");
  const [sanitizationWarnings, setSanitizationWarnings] = useState<string[]>([]);
  const [jsInjectionBlocked, setJsInjectionBlocked] = useState<string>("");
  const previewRef = useRef<HTMLDivElement>(null);

  // --- Mock data for demo (when no API data available) ---
  const mockCompanies: CompanyProfile[] = [
    { id: "demo-a", name: "QS Test Company", nameEn: "QS Test Co.", address: "123 Main St, Shanghai", phone: "+86-21-12345678", email: "info@qstest.com", taxId: "91310000XXXX12345" },
    { id: "demo-b", name: "Audit Test Co B Ltd", nameEn: "Audit Co B", address: "456 Oak Ave, Shenzhen", phone: "+86-755-87654321", email: "contact@auditb.com" },
    { id: "demo-c", name: "Audit Test Co C Inc", nameEn: "Audit Co C", address: "789 Pine Rd, Guangzhou", phone: "+86-20-11223344", email: "admin@auditc.com" },
  ];

  const mockProducts: ProductItem[] = [
    { id: "p1", name: "LED灯具", nameEn: "LED Light", hsCode: "9405.42", unit: "套", quantity: 100, unitPrice: 25.50, totalPrice: 2550.00, origin: "中国" },
    { id: "p2", name: "蓝牙耳机", nameEn: "Bluetooth Earphone", hsCode: "8518.30", unit: "个", quantity: 200, unitPrice: 15.00, totalPrice: 3000.00, origin: "中国" },
  ];

  // --- Initialize ---
  useEffect(() => {
    if (mode === "list") {
      setTemplates(getAllTemplates());
    } else if (mode === "new") {
      const newConfig: TemplateConfig = {
        id: `user-${Date.now()}`,
        toolKey: "supply-chain-quote",
        name: "我的自定义模板",
        origin: "user",
        ownerId: "",
        fields: defaultFields(),
        columns: defaultColumns(),
        style: defaultStyle(),
        layout: defaultLayout(),
        bindings: defaultBindings(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setConfig(newConfig);
    } else if (mode === "edit" && templateId) {
      const found = findTemplate(templateId);
      if (found) {
        // If official, create a copy for editing
        if (found.origin === "official") {
          setConfig({
            ...found,
            id: `user-${Date.now()}`,
            origin: "user",
            name: `${found.name} (副本)`,
          });
        } else {
          setConfig(found);
        }
      }
    }
  }, [mode, templateId]);

  // --- Fetch companies ---
  useEffect(() => {
    async function fetchCompanies() {
      try {
        const res = await fetch("/api/me/company-profiles");
        if (res.ok) {
          const data: CompanyApiResponse = await res.json();
          if (data.profiles && data.profiles.length > 0) {
            setCompanies(data.profiles);
            setSelectedCompanyId(data.profiles[0].id);
            return;
          }
        }
      } catch {
        // Fallback to mock
      }
      setCompanies(mockCompanies);
      setSelectedCompanyId(mockCompanies[0].id);
    }
    fetchCompanies();
  }, []);

  // --- Fetch products ---
  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/workspace/products");
        if (res.ok) {
          const data: ProductApiResponse = await res.json();
          if (data.products && data.products.length > 0) {
            setProducts(data.products);
            setSelectedProducts(data.products.slice(0, 2));
            return;
          }
        }
      } catch {
        // Fallback to mock
      }
      setProducts(mockProducts);
      setSelectedProducts(mockProducts);
    }
    fetchProducts();
  }, []);

  // --- Computed data for preview ---
  const selectedCompany = companies.find(c => c.id === selectedCompanyId) || null;
  const documentData: DocumentData = {
    number: "DOC-2026-0001",
    date: new Date().toISOString().split("T")[0],
    type: config?.name || "单据",
    currency: "CNY",
  };

  // --- Handlers ---
  const updateConfig = useCallback((updater: (prev: TemplateConfig) => TemplateConfig) => {
    setConfig(prev => prev ? updater(prev) : prev);
  }, []);

  const handleNameChange = (name: string) => {
    const result = sanitizeTemplateName(name);
    if (!result.clean) {
      setJsInjectionBlocked(`模板名称被拒绝: ${result.errors.join(", ")}`);
      return;
    }
    setJsInjectionBlocked("");
    setSanitizationWarnings(result.warnings);
    updateConfig(prev => ({ ...prev, name, updatedAt: new Date().toISOString() }));
  };

  const handleFieldToggle = (key: string) => {
    updateConfig(prev => ({
      ...prev,
      fields: prev.fields.map(f => f.key === key ? { ...f, visible: !f.visible } : f),
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleFieldLabelChange = (key: string, label: string) => {
    const result = sanitizeTemplateName(label);
    if (!result.clean) {
      setJsInjectionBlocked(`字段标签被拒绝: ${result.errors.join(", ")}`);
      return;
    }
    setJsInjectionBlocked("");
    updateConfig(prev => ({
      ...prev,
      fields: prev.fields.map(f => f.key === key ? { ...f, label } : f),
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleColumnToggle = (key: string) => {
    updateConfig(prev => ({
      ...prev,
      columns: prev.columns.map(c => c.key === key ? { ...c, visible: !c.visible } : c),
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleColumnLabelChange = (key: string, label: string) => {
    const result = sanitizeTemplateName(label);
    if (!result.clean) {
      setJsInjectionBlocked(`列标签被拒绝: ${result.errors.join(", ")}`);
      return;
    }
    setJsInjectionBlocked("");
    updateConfig(prev => ({
      ...prev,
      columns: prev.columns.map(c => c.key === key ? { ...c, label } : c),
      updatedAt: new Date().toISOString(),
    }));
  };

  const handlePrimaryColorChange = (color: string) => {
    if (!isValidHexColor(color)) {
      setJsInjectionBlocked(`主色格式无效: ${color} (需要 #RRGGBB)`);
      return;
    }
    setJsInjectionBlocked("");
    updateConfig(prev => ({
      ...prev,
      style: { ...prev.style, primaryColor: color, tableHeaderBg: color },
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleLogoPositionChange = (pos: "left" | "right" | "center" | "none") => {
    updateConfig(prev => ({
      ...prev,
      style: { ...prev.style, logoPosition: pos },
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleSignatureToggle = () => {
    updateConfig(prev => ({
      ...prev,
      style: { ...prev.style, showSignature: !prev.style.showSignature },
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleStampToggle = () => {
    updateConfig(prev => ({
      ...prev,
      style: { ...prev.style, showStamp: !prev.style.showStamp },
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleLayoutToggle = (key: keyof TemplateConfig["layout"]) => {
    updateConfig(prev => ({
      ...prev,
      layout: { ...prev.layout, [key]: !prev.layout[key] },
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleCompanySwitch = (id: string) => {
    setSelectedCompanyId(id);
  };

  const handleProductToggle = (product: ProductItem) => {
    setSelectedProducts(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) {
        return prev.filter(p => p.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const handleSave = () => {
    if (!config) return;
    const result = sanitizeTemplateName(config.name);
    if (!result.clean) {
      setSaveStatus(`保存失败: ${result.errors.join(", ")}`);
      return;
    }
    saveUserTemplate(config);
    setSaveStatus("✅ 模板已保存");
    setTimeout(() => setSaveStatus(""), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPng = async () => {
    if (!previewRef.current) return;
    try {
      // Use canvas to capture the preview
      const canvas = document.createElement("canvas");
      const preview = previewRef.current;
      const rect = preview.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setSaveStatus("❌ 导出失败: 无法创建 canvas");
        return;
      }
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Use html2canvas if available, otherwise fallback to print
      const link = document.createElement("a");
      link.download = `${config?.name || "template"}.png`;
      canvas.toBlob(blob => {
        if (blob) {
          link.href = URL.createObjectURL(blob);
          link.click();
          setSaveStatus("✅ PNG 已导出");
          setTimeout(() => setSaveStatus(""), 3000);
        }
      });
    } catch (err) {
      setSaveStatus(`❌ 导出失败: ${err}`);
    }
  };

  // --- Test JS injection (for audit verification) ---
  const handleTestJsInjection = () => {
    const testStr = '<script>alert("xss")</script>恶意代码';
    const result = sanitizeTemplateName(testStr);
    if (!result.clean) {
      setJsInjectionBlocked(`JS 注入被拒绝: ${result.errors[0]}`);
    }
  };

  // ============================================================
  // Render: List Mode
  // ============================================================

  if (mode === "list") {
    return (
      <div className="max-w-5xl mx-auto p-6" data-testid="template-studio-list">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">模板工作室</h1>
          <a
            href="/tools/template-studio/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            data-testid="new-template-btn"
          >
            + 新建模板
          </a>
        </div>

        <div className="mb-4 text-sm text-gray-500">
          官方模板 {getAllOfficialTemplates().length} 个 · 用户模板 {loadUserTemplates().length} 个
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" data-testid="template-grid">
          {templates.map(t => (
            <div key={t.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow" data-testid={`template-card-${t.id}`}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: t.style.primaryColor }} />
                <h3 className="font-semibold text-sm">{t.name}</h3>
              </div>
              <div className="text-xs text-gray-500 mb-3">
                {t.origin === "official" ? "官方模板" : "用户模板"} · {t.toolKey}
              </div>
              <div className="flex gap-2">
                <a
                  href={`/tools/template-studio/${t.id}/edit`}
                  className="text-xs px-3 py-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                  data-testid={`edit-template-${t.id}`}
                >
                  编辑
                </a>
                <a
                  href={`/tools/template-studio/${t.id}/edit`}
                  className="text-xs px-3 py-1.5 bg-gray-50 text-gray-600 rounded hover:bg-gray-100"
                  data-testid={`use-template-${t.id}`}
                >
                  使用
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ============================================================
  // Render: New / Edit Mode
  // ============================================================

  if (!config) {
    return <div className="p-6 text-center text-gray-500">加载中...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-4 overflow-x-hidden" data-testid="template-studio-editor">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <a href="/tools/template-studio" className="text-blue-600 text-sm">← 返回列表</a>
          <h1 className="text-xl font-bold" data-testid="editor-title">{config.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          {saveStatus && <span className="text-sm" data-testid="save-status">{saveStatus}</span>}
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
            data-testid="save-template-btn"
          >
            💾 保存
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700"
            data-testid="print-btn"
          >
            🖨️ 打印
          </button>
          <button
            onClick={handleExportPng}
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
            data-testid="export-png-btn"
          >
            📷 PNG
          </button>
        </div>
      </div>

      {/* JS Injection Warning */}
      {jsInjectionBlocked && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm" data-testid="js-injection-blocked">
          ⚠️ {jsInjectionBlocked}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Editor Panel */}
        <div className="space-y-4" data-testid="editor-panel">
          {/* Template Name */}
          <div className="border rounded-lg p-4">
            <label className="block text-sm font-medium mb-2">模板名称</label>
            <input
              type="text"
              value={config.name}
              onChange={e => handleNameChange(e.target.value)}
              className="w-full px-3 py-2 border rounded text-sm"
              data-testid="template-name-input"
            />
          </div>

          {/* Primary Color */}
          <div className="border rounded-lg p-4">
            <label className="block text-sm font-medium mb-2">主色调</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={config.style.primaryColor}
                onChange={e => handlePrimaryColorChange(e.target.value)}
                className="w-12 h-10 rounded cursor-pointer"
                data-testid="primary-color-picker"
              />
              <input
                type="text"
                value={config.style.primaryColor}
                onChange={e => handlePrimaryColorChange(e.target.value)}
                className="px-3 py-2 border rounded text-sm w-32"
                data-testid="primary-color-text"
              />
            </div>
          </div>

          {/* Logo Position */}
          <div className="border rounded-lg p-4">
            <label className="block text-sm font-medium mb-2">Logo 位置</label>
            <div className="flex gap-2">
              {(["left", "right", "center", "none"] as const).map(pos => (
                <button
                  key={pos}
                  onClick={() => handleLogoPositionChange(pos)}
                  className={`px-3 py-1.5 rounded text-sm ${config.style.logoPosition === pos ? "bg-blue-600 text-white" : "bg-gray-100"}`}
                  data-testid={`logo-pos-${pos}`}
                >
                  {pos === "left" ? "左" : pos === "right" ? "右" : pos === "center" ? "中" : "无"}
                </button>
              ))}
            </div>
          </div>

          {/* Signature / Stamp */}
          <div className="border rounded-lg p-4">
            <label className="block text-sm font-medium mb-2">签名 / 印章</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={config.style.showSignature}
                  onChange={handleSignatureToggle}
                  data-testid="show-signature"
                />
                显示签名区
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={config.style.showStamp}
                  onChange={handleStampToggle}
                  data-testid="show-stamp"
                />
                显示印章区
              </label>
            </div>
          </div>

          {/* Fields */}
          <div className="border rounded-lg p-4">
            <h3 className="text-sm font-medium mb-2">字段配置</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {config.fields.map(field => (
                <div key={field.key} className="flex items-center gap-2" data-testid={`field-row-${field.key}`}>
                  <input
                    type="checkbox"
                    checked={field.visible}
                    onChange={() => handleFieldToggle(field.key)}
                    data-testid={`field-visible-${field.key}`}
                  />
                  <span className="text-xs text-gray-500 w-32">{field.key}</span>
                  <input
                    type="text"
                    value={field.label}
                    onChange={e => handleFieldLabelChange(field.key, e.target.value)}
                    className="flex-1 px-2 py-1 border rounded text-xs"
                    data-testid={`field-label-${field.key}`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Columns */}
          <div className="border rounded-lg p-4">
            <h3 className="text-sm font-medium mb-2">表格列配置</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {config.columns.map(col => (
                <div key={col.key} className="flex items-center gap-2" data-testid={`col-row-${col.key}`}>
                  <input
                    type="checkbox"
                    checked={col.visible}
                    onChange={() => handleColumnToggle(col.key)}
                    data-testid={`col-visible-${col.key}`}
                  />
                  <span className="text-xs text-gray-500 w-24">{col.key}</span>
                  <input
                    type="text"
                    value={col.label}
                    onChange={e => handleColumnLabelChange(col.key, e.target.value)}
                    className="flex-1 px-2 py-1 border rounded text-xs"
                    data-testid={`col-label-${col.key}`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Layout Toggles */}
          <div className="border rounded-lg p-4">
            <h3 className="text-sm font-medium mb-2">布局开关</h3>
            <div className="grid grid-cols-2 gap-2">
              {([
                ["showHeader", "标题"],
                ["showCompanyInfo", "公司资料"],
                ["showProductTable", "商品表格"],
                ["showAmountSummary", "金额汇总"],
                ["showRemarks", "备注"],
                ["showTerms", "条款"],
              ] as const).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={config.layout[key]}
                    onChange={() => handleLayoutToggle(key)}
                    data-testid={`layout-${key}`}
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          {/* Company Selector */}
          <div className="border rounded-lg p-4">
            <h3 className="text-sm font-medium mb-2">公司资料（数据绑定测试）</h3>
            <select
              value={selectedCompanyId}
              onChange={e => handleCompanySwitch(e.target.value)}
              className="w-full px-3 py-2 border rounded text-sm"
              data-testid="company-selector"
            >
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Product Selector */}
          <div className="border rounded-lg p-4">
            <h3 className="text-sm font-medium mb-2">商品明细（数据绑定测试）</h3>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {products.map(p => (
                <label key={p.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={!!selectedProducts.find(sp => sp.id === p.id)}
                    onChange={() => handleProductToggle(p)}
                    data-testid={`product-toggle-${p.id}`}
                  />
                  {p.name} — {p.unitPrice} × {p.quantity}
                </label>
              ))}
            </div>
          </div>

          {/* JS Injection Test (for audit) */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="text-sm font-medium mb-2">安全测试</h3>
            <button
              onClick={handleTestJsInjection}
              className="px-3 py-1.5 bg-gray-200 rounded text-xs"
              data-testid="test-js-injection"
            >
              测试 JS 注入拦截
            </button>
          </div>
        </div>

        {/* Right: Live Preview */}
        <div className="lg:sticky lg:top-4 lg:self-start">
          <h2 className="text-sm font-medium mb-2 text-gray-500">实时预览</h2>
          <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm" data-testid="preview-container">
            <SafeTemplateRenderer
              ref={previewRef}
              config={config}
              data={{
                company: selectedCompany,
                products: selectedProducts,
                document: documentData,
                customer: { name: "客户公司", address: "客户地址" },
                remarks: "备注内容示例",
                terms: "条款内容示例",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
