"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { SafeTemplateRenderer } from "@/lib/template-studio/safe-template-renderer";
import { sanitizeTemplateName } from "@/lib/template-studio/template-sanitizer";
import {
  type TemplateConfig,
  type TemplateFieldConfig,
  type TemplateColumnConfig,
  type ContentBlock,
  type CompanyProfile,
  type ProductItem,
  type DocumentData,
  defaultFields,
  defaultColumns,
  defaultStyle,
  defaultLayout,
  defaultBindings,
  defaultContentBlocks,
  isValidHexColor,
  isValidFontSize,
} from "@/lib/template-studio/template-schema";
import { getAllOfficialTemplates, getOfficialTemplateById } from "@/lib/template-studio/official-templates";

// ============================================================
// Types
// ============================================================

interface CompanyApiResponse {
  success: boolean;
  data: CompanyProfile[];
}

interface ProductApiResponse {
  success: boolean;
  data: ProductItem[];
}

interface TemplateListResponse {
  success: boolean;
  data: TemplateConfig[];
}

interface AuthCheckResponse {
  authenticated: boolean;
  userId?: string;
}

// ============================================================
// Print CSS — only print the template canvas
// ============================================================

const PRINT_CSS = `
@media print {
  body * { visibility: hidden !important; }
  .template-print-area, .template-print-area * { visibility: visible !important; }
  .template-print-area {
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    width: 100% !important;
    max-width: none !important;
    margin: 0 !important;
    padding: 32px !important;
    border-radius: 0 !important;
  }
  /* Hide stamp placeholders in print — only generated stamps should appear */
  .stamp-placeholder { display: none !important; }
}
`;

// ============================================================
// Main Component
// ============================================================

export interface TemplateStudioClientProps {
  mode: "list" | "new" | "edit";
  templateId?: string;
}

export default function TemplateStudioClient({ mode, templateId }: TemplateStudioClientProps) {
  // --- Auth state ---
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authUserId, setAuthUserId] = useState<string>("");

  // --- State ---
  const [templates, setTemplates] = useState<TemplateConfig[]>([]);
  const [userTemplates, setUserTemplates] = useState<TemplateConfig[]>([]);
  const [config, setConfig] = useState<TemplateConfig | null>(null);
  const [companies, setCompanies] = useState<CompanyProfile[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<ProductItem[]>([]);
  const [saveStatus, setSaveStatus] = useState<string>("");
  const [sanitizationWarnings, setSanitizationWarnings] = useState<string[]>([]);
  const [jsInjectionBlocked, setJsInjectionBlocked] = useState<string>("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const previewRef = useRef<HTMLDivElement>(null);

  // --- Auth check ---
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data: AuthCheckResponse = await res.json();
          if (data.authenticated && data.userId) {
            setIsAuthenticated(true);
            setAuthUserId(data.userId);
          }
        }
      } catch {
        // Not authenticated
      }
      setAuthChecked(true);
    }
    checkAuth();
  }, []);

  // --- Fetch user templates from API ---
  const fetchUserTemplates = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await fetch("/api/template-studio/templates");
      if (res.ok) {
        const data: TemplateListResponse = await res.json();
        setUserTemplates(data.data || []);
      }
    } catch {
      // API error — keep empty
    }
  }, [isAuthenticated]);

  // --- Fetch companies (real API, not mock) ---
  useEffect(() => {
    if (!isAuthenticated) return;
    async function fetchCompanies() {
      try {
        const res = await fetch("/api/me/company-profiles");
        if (res.ok) {
          const data: CompanyApiResponse = await res.json();
          if (data.success && data.data && data.data.length > 0) {
            setCompanies(data.data);
            // Only set default if no company is currently selected or the
            // current selection doesn't exist in the new list (e.g. after
            // restoring a saved template's selectedCompanyId).
            setSelectedCompanyId(prev => {
              if (prev && data.data.find(c => c.id === prev)) return prev;
              // Prefer the default company if one exists
              const defaultCo = data.data.find(c => c.isDefault);
              return defaultCo?.id || data.data[0].id;
            });
            return;
          }
        }
      } catch {
        // API error
      }
      // No mock fallback when authenticated — real data only
      setCompanies([]);
    }
    fetchCompanies();
  }, [isAuthenticated]);

  // --- Fetch products (real API, not mock) ---
  useEffect(() => {
    if (!isAuthenticated) return;
    async function fetchProducts() {
      try {
        const res = await fetch("/api/workspace/products");
        if (res.ok) {
          const data: ProductApiResponse = await res.json();
          if (data.success && data.data && data.data.length > 0) {
            setProducts(data.data);
            setSelectedProducts(data.data.slice(0, 2));
            return;
          }
        }
      } catch {
        // API error
      }
      // No mock fallback when authenticated — real data only
      setProducts([]);
    }
    fetchProducts();
  }, [isAuthenticated]);

  // --- Initialize based on mode ---
  useEffect(() => {
    if (!authChecked) return;

    if (mode === "list") {
      fetchUserTemplates().then(() => {
        setTemplates([...getAllOfficialTemplates(), ...userTemplates]);
        setLoading(false);
      });
    } else if (mode === "new") {
      const newConfig: TemplateConfig = {
        id: `user-${Date.now()}`,
        toolKey: "supply-chain-quote",
        name: "我的自定义模板",
        origin: "user",
        ownerId: authUserId,
        fields: defaultFields(),
        columns: defaultColumns(),
        contentBlocks: defaultContentBlocks(),
        style: defaultStyle(),
        layout: defaultLayout(),
        bindings: defaultBindings(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setConfig(newConfig);
      setLoading(false);
    } else if (mode === "edit" && templateId) {
      // Try official template first
      const official = getOfficialTemplateById(templateId);
      if (official) {
        // Create a copy for editing
        setConfig({
          ...official,
          id: `user-${Date.now()}`,
          origin: "user",
          ownerId: authUserId,
          name: `${official.name} (副本)`,
          contentBlocks: official.contentBlocks || [],
        });
        setLoading(false);
      } else {
        // Fetch from API
        fetch(`/api/template-studio/templates/${templateId}`)
          .then(res => res.json())
          .then(data => {
            if (data.success && data.data) {
              const loadedConfig = {
                ...data.data,
                contentBlocks: data.data.contentBlocks || [],
              };
              setConfig(loadedConfig);
              // Restore selectedCompanyId if it exists in the saved template
              if (loadedConfig.selectedCompanyId) {
                setSelectedCompanyId(loadedConfig.selectedCompanyId);
              }
            }
            setLoading(false);
          })
          .catch(() => setLoading(false));
      }
    } else {
      setLoading(false);
    }
  }, [mode, templateId, authChecked, authUserId, fetchUserTemplates]);

  // Update templates list when userTemplates changes
  useEffect(() => {
    if (mode === "list") {
      setTemplates([...getAllOfficialTemplates(), ...userTemplates]);
    }
  }, [userTemplates, mode]);

  // --- Computed data for preview ---
  const selectedCompany = companies.find(c => c.id === selectedCompanyId) || null;
  const documentData: DocumentData = {
    number: "DOC-2026-0001",
    date: new Date().toISOString().split("T")[0],
    type: config?.name || "单据",
    currency: "CNY",
  };

  // --- Config update helper ---
  const updateConfig = useCallback((updater: (prev: TemplateConfig) => TemplateConfig) => {
    setConfig(prev => (prev ? updater(prev) : prev));
  }, []);

  // --- Handlers: Template Name ---
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

  // --- Handlers: Fields ---
  const handleFieldToggle = (key: string) => {
    updateConfig(prev => ({
      ...prev,
      fields: prev.fields.map(f => (f.key === key ? { ...f, visible: !f.visible } : f)),
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
      fields: prev.fields.map(f => (f.key === key ? { ...f, label } : f)),
      updatedAt: new Date().toISOString(),
    }));
  };

  // --- Handlers: Columns ---
  const handleColumnToggle = (key: string) => {
    updateConfig(prev => ({
      ...prev,
      columns: prev.columns.map(c => (c.key === key ? { ...c, visible: !c.visible } : c)),
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
      columns: prev.columns.map(c => (c.key === key ? { ...c, label } : c)),
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleAddColumn = () => {
    const newKey = `custom_${Date.now()}`;
    const newCol: TemplateColumnConfig = {
      key: newKey,
      label: "自定义列",
      visible: true,
      width: "100px",
    };
    updateConfig(prev => ({
      ...prev,
      columns: [...prev.columns, newCol],
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleDeleteColumn = (key: string) => {
    updateConfig(prev => ({
      ...prev,
      columns: prev.columns.filter(c => c.key !== key),
      updatedAt: new Date().toISOString(),
    }));
  };

  // --- Handlers: Content Blocks ---
  const handleAddContentBlock = (type: "text" | "spacer" | "divider") => {
    const newBlock: ContentBlock = {
      id: `block-${Date.now()}`,
      type,
      title: type === "text" ? "自定义文本" : type === "spacer" ? "间隔" : "分隔线",
      content: type === "text" ? "在此输入文本内容..." : "",
      order: (config?.contentBlocks?.length || 0),
      visible: true,
    };
    updateConfig(prev => ({
      ...prev,
      contentBlocks: [...(prev.contentBlocks || []), newBlock],
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleDeleteContentBlock = (id: string) => {
    updateConfig(prev => ({
      ...prev,
      contentBlocks: (prev.contentBlocks || []).filter(b => b.id !== id),
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleContentBlockContentChange = (id: string, content: string) => {
    const result = sanitizeTemplateName(content);
    if (!result.clean) {
      setJsInjectionBlocked(`内容块被拒绝: ${result.errors.join(", ")}`);
      return;
    }
    setJsInjectionBlocked("");
    updateConfig(prev => ({
      ...prev,
      contentBlocks: (prev.contentBlocks || []).map(b =>
        b.id === id ? { ...b, content } : b
      ),
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleContentBlockTitleChange = (id: string, title: string) => {
    const result = sanitizeTemplateName(title);
    if (!result.clean) {
      setJsInjectionBlocked(`块标题被拒绝: ${result.errors.join(", ")}`);
      return;
    }
    setJsInjectionBlocked("");
    updateConfig(prev => ({
      ...prev,
      contentBlocks: (prev.contentBlocks || []).map(b =>
        b.id === id ? { ...b, title } : b
      ),
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleMoveBlock = (id: string, direction: "up" | "down") => {
    updateConfig(prev => {
      const blocks = [...(prev.contentBlocks || [])];
      const idx = blocks.findIndex(b => b.id === id);
      if (idx < 0) return prev;
      const targetIdx = direction === "up" ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= blocks.length) return prev;
      // Swap
      [blocks[idx], blocks[targetIdx]] = [blocks[targetIdx], blocks[idx]];
      // Reorder
      blocks.forEach((b, i) => (b.order = i));
      return { ...prev, contentBlocks: blocks, updatedAt: new Date().toISOString() };
    });
  };

  const handleToggleBlockVisible = (id: string) => {
    updateConfig(prev => ({
      ...prev,
      contentBlocks: (prev.contentBlocks || []).map(b =>
        b.id === id ? { ...b, visible: !b.visible } : b
      ),
      updatedAt: new Date().toISOString(),
    }));
  };

  // --- Handlers: Style ---
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

  const handleFontSizeChange = (size: string) => {
    if (!isValidFontSize(size)) {
      setJsInjectionBlocked(`字号格式无效: ${size} (需要如 14px)`);
      return;
    }
    setJsInjectionBlocked("");
    updateConfig(prev => ({
      ...prev,
      style: { ...prev.style, fontSize: size },
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleTitleFontSizeChange = (size: string) => {
    if (!isValidFontSize(size)) {
      setJsInjectionBlocked(`标题字号格式无效: ${size} (需要如 22px)`);
      return;
    }
    setJsInjectionBlocked("");
    updateConfig(prev => ({
      ...prev,
      style: { ...prev.style, titleFontSize: size },
      updatedAt: new Date().toISOString(),
    }));
  };

  const handlePageMarginChange = (margin: string) => {
    if (!/^\d+px$/.test(margin)) {
      setJsInjectionBlocked(`边距格式无效: ${margin} (需要如 32px)`);
      return;
    }
    setJsInjectionBlocked("");
    updateConfig(prev => ({
      ...prev,
      style: { ...prev.style, pageMargin: margin },
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

  // --- Handlers: Company/Product ---
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

  // --- Handlers: Save (API) ---
  const handleSave = async () => {
    if (!config) return;
    const result = sanitizeTemplateName(config.name);
    if (!result.clean) {
      setSaveStatus(`保存失败: ${result.errors.join(", ")}`);
      return;
    }
    // Persist selectedCompanyId with the template
    const configToSave = { ...config, selectedCompanyId };
    try {
      const res = await fetch("/api/template-studio/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: configToSave }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setSaveStatus("✅ 模板已保存到服务器");
          setTimeout(() => setSaveStatus(""), 3000);
          // Refresh user templates
          fetchUserTemplates();
        } else {
          setSaveStatus(`❌ 保存失败: ${data.error}`);
        }
      } else {
        setSaveStatus("❌ 保存失败: 服务器错误");
      }
    } catch (err) {
      setSaveStatus(`❌ 保存失败: ${err}`);
    }
  };

  // --- Handlers: Copy ---
  const handleCopyTemplate = async (id: string, name: string) => {
    try {
      const res = await fetch(`/api/template-studio/templates/${id}/copy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: `${name} (副本)` }),
      });
      if (res.ok) {
        await fetchUserTemplates();
      }
    } catch {
      // ignore
    }
  };

  // --- Handlers: Delete ---
  const handleDeleteTemplate = async (id: string) => {
    try {
      const res = await fetch(`/api/template-studio/templates/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeleteConfirmId("");
        await fetchUserTemplates();
      }
    } catch {
      // ignore
    }
  };

  // --- Handlers: Print ---
  const handlePrint = () => {
    // Inject print CSS dynamically
    const styleId = "template-print-css";
    let styleEl = document.getElementById(styleId);
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = PRINT_CSS;
    // Trigger print
    setTimeout(() => window.print(), 100);
  };

  // --- Handlers: PNG Export (html2canvas) ---
  const handleExportPng = async () => {
    if (!previewRef.current) return;
    try {
      setSaveStatus("正在生成 PNG...");
      // Dynamically import html2canvas
      const html2canvas = (await import("html2canvas")).default;

      // Hide stamp placeholders before capture — only generated stamps should appear
      const placeholders = previewRef.current.querySelectorAll(".stamp-placeholder");
      placeholders.forEach(el => { (el as HTMLElement).style.display = "none"; });

      const canvas = await html2canvas(previewRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        logging: false,
      });

      // Restore placeholder visibility
      placeholders.forEach(el => { (el as HTMLElement).style.display = ""; });

      const link = document.createElement("a");
      link.download = `${config?.name || "template"}-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      setSaveStatus("✅ PNG 已导出");
      setTimeout(() => setSaveStatus(""), 3000);
    } catch (err) {
      setSaveStatus(`❌ PNG 导出失败: ${err}`);
      setTimeout(() => setSaveStatus(""), 5000);
    }
  };

  // --- JS Injection Test (for audit) ---
  const handleTestJsInjection = () => {
    const testStr = '<script>alert("xss")</script>恶意代码';
    const result = sanitizeTemplateName(testStr);
    if (!result.clean) {
      setJsInjectionBlocked(`JS 注入被拒绝: ${result.errors[0]}`);
    }
  };

  // ============================================================
  // Render: Not Authenticated
  // ============================================================

  if (authChecked && !isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center" data-testid="login-required">
        <div className="mb-4 text-6xl">🔒</div>
        <h2 className="text-xl font-bold mb-2">请先登录</h2>
        <p className="text-gray-500 mb-6">模板工作室需要登录后才能使用</p>
        <a
          href="/login?callbackUrl=/tools/template-studio"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          data-testid="login-link"
        >
          前往登录
        </a>
      </div>
    );
  }

  if (!authChecked || loading) {
    return (
      <div className="p-6 text-center text-gray-500" data-testid="loading">
        加载中...
      </div>
    );
  }

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
          官方模板 {getAllOfficialTemplates().length} 个 · 用户模板 {userTemplates.length} 个
          <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
            PARTIAL_STORAGE
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" data-testid="template-grid">
          {templates.map(t => (
            <div
              key={t.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              data-testid={`template-card-${t.id}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: t.style.primaryColor }} />
                <h3 className="font-semibold text-sm">{t.name}</h3>
              </div>
              <div className="text-xs text-gray-500 mb-3">
                {t.origin === "official" ? "官方模板" : "用户模板"} · {t.toolKey}
              </div>
              <div className="flex gap-2 flex-wrap">
                <a
                  href={`/tools/template-studio/${t.id}/edit`}
                  className="text-xs px-3 py-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                  data-testid={`edit-template-${t.id}`}
                >
                  编辑
                </a>
                {t.origin === "user" && (
                  <>
                    <button
                      onClick={() => handleCopyTemplate(t.id, t.name)}
                      className="text-xs px-3 py-1.5 bg-gray-50 text-gray-600 rounded hover:bg-gray-100"
                      data-testid={`copy-template-${t.id}`}
                    >
                      复制
                    </button>
                    {deleteConfirmId === t.id ? (
                      <span className="flex items-center gap-1" data-testid={`delete-confirm-${t.id}`}>
                        <button
                          onClick={() => handleDeleteTemplate(t.id)}
                          className="text-xs px-2 py-1.5 bg-red-600 text-white rounded hover:bg-red-700"
                          data-testid={`confirm-delete-${t.id}`}
                        >
                          确认删除
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId("")}
                          className="text-xs px-2 py-1.5 bg-gray-200 rounded"
                        >
                          取消
                        </button>
                      </span>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(t.id)}
                        className="text-xs px-3 py-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100"
                        data-testid={`delete-template-${t.id}`}
                      >
                        删除
                      </button>
                    )}
                  </>
                )}
                {t.origin === "official" && (
                  <button
                    onClick={() => handleCopyTemplate(t.id, t.name)}
                    className="text-xs px-3 py-1.5 bg-gray-50 text-gray-600 rounded hover:bg-gray-100"
                    data-testid={`copy-template-${t.id}`}
                  >
                    复制
                  </button>
                )}
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

  const sortedBlocks = [...(config.contentBlocks || [])].sort((a, b) => a.order - b.order);

  return (
    <div className="max-w-7xl mx-auto p-4 overflow-x-hidden" data-testid="template-studio-editor">
      {/* Print CSS */}
      <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <a href="/tools/template-studio" className="text-blue-600 text-sm">← 返回列表</a>
          <h1 className="text-xl font-bold" data-testid="editor-title">{config.name}</h1>
          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
            PARTIAL_STORAGE
          </span>
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

          {/* Style: Primary Color */}
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

          {/* Style: Font Sizes + Page Margin */}
          <div className="border rounded-lg p-4">
            <h3 className="text-sm font-medium mb-2">样式设置</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">正文字号</label>
                <input
                  type="text"
                  value={config.style.fontSize}
                  onChange={e => handleFontSizeChange(e.target.value)}
                  className="w-full px-2 py-1 border rounded text-xs"
                  data-testid="font-size-input"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">标题字号</label>
                <input
                  type="text"
                  value={config.style.titleFontSize}
                  onChange={e => handleTitleFontSizeChange(e.target.value)}
                  className="w-full px-2 py-1 border rounded text-xs"
                  data-testid="title-font-size-input"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">页面边距</label>
                <input
                  type="text"
                  value={config.style.pageMargin}
                  onChange={e => handlePageMarginChange(e.target.value)}
                  className="w-full px-2 py-1 border rounded text-xs"
                  data-testid="page-margin-input"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Logo 位置</label>
                <select
                  value={config.style.logoPosition}
                  onChange={e => handleLogoPositionChange(e.target.value as "left" | "right" | "center" | "none")}
                  className="w-full px-2 py-1 border rounded text-xs"
                  data-testid="logo-position-select"
                >
                  <option value="left">左</option>
                  <option value="right">右</option>
                  <option value="center">中</option>
                  <option value="none">无</option>
                </select>
              </div>
            </div>
            <div className="flex gap-4 mt-3">
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
            {/* Stamp Mode */}
            <div className="mt-3">
              <label className="block text-xs text-gray-500 mb-1">印章模式</label>
              <select
                value={config.style.stampMode || "placeholder"}
                onChange={e => updateConfig(prev => ({ ...prev, style: { ...prev.style, stampMode: e.target.value as "placeholder" | "none" | "generated" }, updatedAt: new Date().toISOString() }))}
                className="px-2 py-1 border rounded text-xs w-48"
                data-testid="stamp-mode-select"
              >
                <option value="placeholder">占位 (仅屏幕显示，不进入打印/PNG)</option>
                <option value="generated">生成 (真实印章，进入打印/PNG)</option>
                <option value="none">无 (不显示印章)</option>
              </select>
            </div>
            {/* Seal Customization (only visible in generated mode) */}
            {(config.style.stampMode === "generated") && (
              <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200" data-testid="seal-config-panel">
                <h4 className="text-xs font-medium text-gray-600 mb-2">印章文字配置</h4>
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-0.5">顶部文字 (公司名，留空使用公司名)</label>
                    <input
                      type="text"
                      value={config.style.sealTopText || ""}
                      onChange={e => updateConfig(prev => ({ ...prev, style: { ...prev.style, sealTopText: e.target.value }, updatedAt: new Date().toISOString() }))}
                      className="w-full px-2 py-1 border rounded text-xs"
                      placeholder="留空 = 公司名"
                      data-testid="seal-top-text-input"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-0.5">底部文字</label>
                      <input
                        type="text"
                        value={config.style.sealBottomText || "专用章"}
                        onChange={e => updateConfig(prev => ({ ...prev, style: { ...prev.style, sealBottomText: e.target.value }, updatedAt: new Date().toISOString() }))}
                        className="w-full px-2 py-1 border rounded text-xs"
                        data-testid="seal-bottom-text-input"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-0.5">中心文字</label>
                      <input
                        type="text"
                        value={config.style.sealCenterText || "★"}
                        onChange={e => updateConfig(prev => ({ ...prev, style: { ...prev.style, sealCenterText: e.target.value }, updatedAt: new Date().toISOString() }))}
                        className="w-full px-2 py-1 border rounded text-xs"
                        data-testid="seal-center-text-input"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-0.5">印章颜色</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={config.style.sealColor || "#dc2626"}
                        onChange={e => updateConfig(prev => ({ ...prev, style: { ...prev.style, sealColor: e.target.value }, updatedAt: new Date().toISOString() }))}
                        className="h-7 w-12 border rounded cursor-pointer"
                        data-testid="seal-color-input"
                      />
                      <input
                        type="text"
                        value={config.style.sealColor || "#dc2626"}
                        onChange={e => updateConfig(prev => ({ ...prev, style: { ...prev.style, sealColor: e.target.value }, updatedAt: new Date().toISOString() }))}
                        className="flex-1 px-2 py-1 border rounded text-xs font-mono"
                        data-testid="seal-color-text-input"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Border Radius + Cell Padding */}
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">圆角</label>
                <input
                  type="text"
                  value={config.style.borderRadius || "8px"}
                  onChange={e => updateConfig(prev => ({ ...prev, style: { ...prev.style, borderRadius: e.target.value }, updatedAt: new Date().toISOString() }))}
                  className="w-full px-2 py-1 border rounded text-xs"
                  data-testid="border-radius-input"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">单元格内边距</label>
                <input
                  type="text"
                  value={config.style.cellPadding || "8px"}
                  onChange={e => updateConfig(prev => ({ ...prev, style: { ...prev.style, cellPadding: e.target.value }, updatedAt: new Date().toISOString() }))}
                  className="w-full px-2 py-1 border rounded text-xs"
                  data-testid="cell-padding-input"
                />
              </div>
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
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">表格列配置</h3>
              <button
                onClick={handleAddColumn}
                className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                data-testid="add-column-btn"
              >
                + 新增列
              </button>
            </div>
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
                  {col.key.startsWith("custom_") && (
                    <button
                      onClick={() => handleDeleteColumn(col.key)}
                      className="text-xs text-red-500 hover:text-red-700"
                      data-testid={`col-delete-${col.key}`}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Content Blocks */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">自定义内容块</h3>
              <div className="flex gap-1">
                <button
                  onClick={() => handleAddContentBlock("text")}
                  className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                  data-testid="add-text-block-btn"
                >
                  + 文本
                </button>
                <button
                  onClick={() => handleAddContentBlock("spacer")}
                  className="text-xs px-2 py-1 bg-gray-50 text-gray-600 rounded hover:bg-gray-100"
                  data-testid="add-spacer-block-btn"
                >
                  + 间隔
                </button>
                <button
                  onClick={() => handleAddContentBlock("divider")}
                  className="text-xs px-2 py-1 bg-gray-50 text-gray-600 rounded hover:bg-gray-100"
                  data-testid="add-divider-block-btn"
                >
                  + 分隔线
                </button>
              </div>
            </div>
            <div className="space-y-2" data-testid="content-blocks-list">
              {sortedBlocks.length === 0 && (
                <div className="text-xs text-gray-400 py-2">暂无内容块，点击上方按钮添加</div>
              )}
              {sortedBlocks.map((block, idx) => (
                <div key={block.id} className="border rounded p-2" data-testid={`content-block-${block.id}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <input
                      type="checkbox"
                      checked={block.visible}
                      onChange={() => handleToggleBlockVisible(block.id)}
                      data-testid={`block-visible-${block.id}`}
                    />
                    <span className="text-xs font-medium">{block.title}</span>
                    <span className="text-xs text-gray-400">[{block.type}]</span>
                    <div className="ml-auto flex gap-1">
                      <button
                        onClick={() => handleMoveBlock(block.id, "up")}
                        disabled={idx === 0}
                        className="text-xs px-1.5 py-0.5 bg-gray-100 rounded disabled:opacity-30"
                        data-testid={`block-up-${block.id}`}
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => handleMoveBlock(block.id, "down")}
                        disabled={idx === sortedBlocks.length - 1}
                        className="text-xs px-1.5 py-0.5 bg-gray-100 rounded disabled:opacity-30"
                        data-testid={`block-down-${block.id}`}
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => handleDeleteContentBlock(block.id)}
                        className="text-xs px-1.5 py-0.5 bg-red-50 text-red-600 rounded"
                        data-testid={`block-delete-${block.id}`}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  {block.type === "text" && (
                    <>
                      <input
                        type="text"
                        value={block.title}
                        onChange={e => handleContentBlockTitleChange(block.id, e.target.value)}
                        className="w-full px-2 py-1 border rounded text-xs mb-1"
                        placeholder="块标题"
                        data-testid={`block-title-${block.id}`}
                      />
                      <textarea
                        value={block.content}
                        onChange={e => handleContentBlockContentChange(block.id, e.target.value)}
                        className="w-full px-2 py-1 border rounded text-xs"
                        rows={2}
                        placeholder="块内容"
                        data-testid={`block-content-${block.id}`}
                      />
                    </>
                  )}
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
            <h3 className="text-sm font-medium mb-2">公司资料（数据绑定）</h3>
            {companies.length === 0 ? (
              <div className="text-xs text-gray-400 py-2" data-testid="template-company-empty-state">
                暂无公司资料，请先添加公司
              </div>
            ) : (
              <>
                <select
                  value={selectedCompanyId}
                  onChange={e => handleCompanySwitch(e.target.value)}
                  className="w-full px-3 py-2 border rounded text-sm"
                  data-testid="template-company-selector"
                >
                  {companies.map((c, idx) => {
                    const displayName = c.companyName || c.name || c.profileName || c.contactName || c.email || `未命名公司 #${idx + 1}`;
                    const meta = [c.contactName, c.email].filter(Boolean).join(" · ");
                    const defaultFlag = c.isDefault ? " (默认)" : "";
                    return (
                      <option key={c.id} value={c.id} data-testid="template-company-option">
                        {displayName}{defaultFlag}{meta ? ` — ${meta}` : ""}
                      </option>
                    );
                  })}
                </select>
                {selectedCompany && (
                  <div className="mt-2 text-xs text-gray-600" data-testid="template-selected-company-name">
                    当前: {selectedCompany.companyName || selectedCompany.name || selectedCompany.profileName || selectedCompany.contactName || selectedCompany.email || "未命名公司"}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Product Selector */}
          <div className="border rounded-lg p-4">
            <h3 className="text-sm font-medium mb-2">商品明细（数据绑定）</h3>
            {products.length === 0 ? (
              <div className="text-xs text-gray-400 py-2" data-testid="no-products">
                暂无商品，请先在"商品管理"中添加
              </div>
            ) : (
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
            )}
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
