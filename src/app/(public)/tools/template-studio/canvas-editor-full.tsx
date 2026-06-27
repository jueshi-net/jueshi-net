"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import html2canvas from "html2canvas";
import {
  type CanvasTemplate,
  type CanvasElement,
  type CanvasElementType,
  type CanvasBatchConfig,
  defaultCanvasTemplate,
  defaultCanvasElement,
  defaultCanvasPaper,
} from "@/lib/template-studio/canvas-schema";
import {
  mmToPx,
  pxToMm,
  calculatePaperScale,
  getScaledPaperDimensions,
  getElementPositionPx,
  snapToGrid,
  getNextZIndex,
} from "@/lib/template-studio/canvas-layout";
import {
  sanitizeCanvasStyle,
  canvasStyleToCSS,
  sanitizeText,
} from "@/lib/template-studio/canvas-safe-style";

// ============================================================
// Types
// ============================================================

interface CanvasEditorFullProps {
  template?: CanvasTemplate;
  templateId?: string;
  companyId?: string;
}

interface DragState {
  elementId: string;
  startX: number;
  startY: number;
  startElementX: number;
  startElementY: number;
}

interface ResizeState {
  elementId: string;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
}

interface CompanyData {
  id: string;
  companyName: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
}

interface ProductData {
  id: string;
  name: string;
  sku?: string;
  unitPrice?: number;
  currency?: string;
  unit?: string;
}

interface CompanyList {
  id: string;
  companyName: string;
}

interface ProductList {
  id: string;
  name: string;
  sku?: string;
}

// ============================================================
// Canvas Editor Full Component
// ============================================================

export default function CanvasEditorFull({ template, templateId, companyId }: CanvasEditorFullProps) {
  const [canvas, setCanvas] = useState<CanvasTemplate>(
    template || defaultCanvasTemplate()
  );
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [resizeState, setResizeState] = useState<ResizeState | null>(null);
  const [scale, setScale] = useState(1);
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [productData, setProductData] = useState<ProductData | null>(null);
  const [companyList, setCompanyList] = useState<CompanyList[]>([]);
  const [productList, setProductList] = useState<ProductList[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | undefined>(companyId);
  const [selectedProductId, setSelectedProductId] = useState<string | undefined>();
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [currentTemplateId, setCurrentTemplateId] = useState<string | undefined>(templateId);
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const printRootRef = useRef<HTMLDivElement>(null);

  // Auto-hide side panels on small screens
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setShowLeftPanel(false);
        setShowRightPanel(false);
      } else if (width < 1024) {
        setShowLeftPanel(true);
        setShowRightPanel(false);
      } else {
        setShowLeftPanel(true);
        setShowRightPanel(true);
      }
    };
    
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch company list
  useEffect(() => {
    fetch("/api/me/company-profiles")
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          setCompanyList(data.data.map((c: any) => ({ id: c.id, companyName: c.companyName })));
        }
      })
      .catch(err => console.error("Failed to fetch company list:", err));
  }, []);

  // Fetch product list
  useEffect(() => {
    fetch("/api/workspace/products")
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.products)) {
          setProductList(data.products.map((p: any) => ({ id: p.id, name: p.name, sku: p.sku })));
        }
      })
      .catch(err => console.error("Failed to fetch product list:", err));
  }, []);

  // Fetch company data
  useEffect(() => {
    if (selectedCompanyId) {
      fetch(`/api/me/company-profiles/${selectedCompanyId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setCompanyData(data.data);
          }
        })
        .catch(err => console.error("Failed to fetch company:", err));
    }
  }, [selectedCompanyId]);

  // Fetch product data
  useEffect(() => {
    if (selectedProductId) {
      fetch(`/api/workspace/products/${selectedProductId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setProductData(data.product);
          }
        })
        .catch(err => console.error("Failed to fetch product:", err));
    }
  }, [selectedProductId]);

  // Calculate scale on mount and resize
  useEffect(() => {
    const updateScale = () => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const newScale = calculatePaperScale(canvas.paper, rect.width, rect.height);
        setScale(newScale);
      }
    };
    
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [canvas.paper]);

  // ============================================================
  // Element Operations
  // ============================================================

  const addElement = useCallback((type: CanvasElementType) => {
    const newElement = defaultCanvasElement(type);
    newElement.zIndex = getNextZIndex(canvas.elements);
    setCanvas(prev => ({
      ...prev,
      elements: [...prev.elements, newElement],
      updatedAt: new Date().toISOString(),
    }));
    setSelectedElementId(newElement.id);
  }, [canvas.elements]);

  const updateElement = useCallback((id: string, updates: Partial<CanvasElement>) => {
    setCanvas(prev => ({
      ...prev,
      elements: prev.elements.map(el => 
        el.id === id ? { ...el, ...updates } : el
      ),
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const deleteElement = useCallback((id: string) => {
    setCanvas(prev => ({
      ...prev,
      elements: prev.elements.filter(el => el.id !== id),
      updatedAt: new Date().toISOString(),
    }));
    if (selectedElementId === id) {
      setSelectedElementId(null);
    }
  }, [selectedElementId]);

  const duplicateElement = useCallback((id: string) => {
    const element = canvas.elements.find(el => el.id === id);
    if (!element) return;
    
    const newElement = {
      ...element,
      id: `el-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      x: element.x + 5,
      y: element.y + 5,
      zIndex: getNextZIndex(canvas.elements),
    };
    
    setCanvas(prev => ({
      ...prev,
      elements: [...prev.elements, newElement],
      updatedAt: new Date().toISOString(),
    }));
    setSelectedElementId(newElement.id);
  }, [canvas.elements]);

  // ============================================================
  // Drag & Resize Handlers
  // ============================================================

  const handleMouseDown = useCallback((e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    const element = canvas.elements.find(el => el.id === elementId);
    if (!element || element.locked) return;
    
    setSelectedElementId(elementId);
    setDragState({
      elementId,
      startX: e.clientX,
      startY: e.clientY,
      startElementX: element.x,
      startElementY: element.y,
    });
  }, [canvas.elements]);

  const handleResizeMouseDown = useCallback((e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    const element = canvas.elements.find(el => el.id === elementId);
    if (!element || element.locked) return;
    
    setResizeState({
      elementId,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: element.width,
      startHeight: element.height,
    });
  }, [canvas.elements]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (dragState) {
      const dx = pxToMm((e.clientX - dragState.startX) / scale);
      const dy = pxToMm((e.clientY - dragState.startY) / scale);
      
      let newX = dragState.startElementX + dx;
      let newY = dragState.startElementY + dy;
      
      if (canvas.grid.snap) {
        newX = snapToGrid(newX, canvas.grid.sizeMm, true);
        newY = snapToGrid(newY, canvas.grid.sizeMm, true);
      }
      
      updateElement(dragState.elementId, { x: newX, y: newY });
    }
    
    if (resizeState) {
      const dw = pxToMm((e.clientX - resizeState.startX) / scale);
      const dh = pxToMm((e.clientY - resizeState.startY) / scale);
      
      let newWidth = Math.max(10, resizeState.startWidth + dw);
      let newHeight = Math.max(10, resizeState.startHeight + dh);
      
      if (canvas.grid.snap) {
        newWidth = snapToGrid(newWidth, canvas.grid.sizeMm, true);
        newHeight = snapToGrid(newHeight, canvas.grid.sizeMm, true);
      }
      
      updateElement(resizeState.elementId, { width: newWidth, height: newHeight });
    }
  }, [dragState, resizeState, scale, canvas.grid, updateElement]);

  const handleMouseUp = useCallback(() => {
    setDragState(null);
    setResizeState(null);
  }, []);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current || e.target === paperRef.current) {
      setSelectedElementId(null);
    }
  }, []);

  // ============================================================
  // Data Binding Resolution
  // ============================================================

  const resolveBinding = useCallback((binding: string | undefined): string => {
    if (!binding) return "";
    
    const parts = binding.split(".");
    if (parts.length !== 2) return "";
    
    const [category, field] = parts;
    
    if (category === "company" && companyData) {
      return (companyData as any)[field] || "";
    }
    if (category === "product" && productData) {
      // Map product.price to productData.unitPrice
      if (field === "price") return String(productData.unitPrice || "");
      return (productData as any)[field] || "";
    }
    if (category === "batch" && canvas.batch) {
      if (field === "packageCount") return String(canvas.batch.packageCount);
      if (field === "currentIndex") return "1";
      if (field === "totalCount") return String(canvas.batch.packageCount);
      if (field === "sequence") {
        if (canvas.batch.sequenceFormat === "fraction") {
          return `1/${canvas.batch.packageCount}`;
        }
        return `1 of ${canvas.batch.packageCount}`;
      }
    }
    
    return "";
  }, [companyData, productData, canvas.batch]);

  // ============================================================
  // Save & Load
  // ============================================================

  const handleSave = useCallback(async () => {
    setSaveStatus("saving");
    try {
      const response = await fetch("/api/template-studio/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: currentTemplateId,
          name: canvas.name,
          type: "canvas",
          config: canvas,
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        setCurrentTemplateId(data.data.id);
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } else {
        setSaveStatus("error");
      }
    } catch (err) {
      console.error("Save failed:", err);
      setSaveStatus("error");
    }
  }, [canvas, currentTemplateId]);

  // ============================================================
  // PNG Export
  // ============================================================

  const handleExportPng = useCallback(async () => {
    if (!paperRef.current) return;
    
    try {
      const canvasElement = await html2canvas(paperRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        logging: false,
      });
      
      const link = document.createElement("a");
      link.download = `${canvas.name || "template"}.png`;
      link.href = canvasElement.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("PNG export failed:", err);
    }
  }, [canvas.name]);

  // ============================================================
  // Print
  // ============================================================

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // ============================================================
  // Render
  // ============================================================

  const selectedElement = canvas.elements.find(el => el.id === selectedElementId);
  const paperDimensions = getScaledPaperDimensions(canvas.paper, scale);

  // Generate dynamic print styles based on paper size
  const printStyle = `
    @media print {
      @page {
        size: ${canvas.paper.widthMm}mm ${canvas.paper.heightMm}mm;
      }
    }
  `;

  const renderElement = (element: CanvasElement, pageIndex?: number) => {
    if (!element.visible) return null;
    
    const pos = getElementPositionPx(element, scale);
    const isSelected = element.id === selectedElementId && pageIndex === undefined;
    const style = canvasStyleToCSS(sanitizeCanvasStyle(element.style));
    
    let content = null;
    
    if (element.type === "text") {
      content = sanitizeText(element.text || "");
    } else if (element.type === "field") {
      const resolved = resolveBinding(element.binding);
      content = resolved || `[${element.binding || "未绑定"}]`;
    } else if (element.type === "table") {
      content = <span className="text-xs text-gray-500">商品表格</span>;
    } else if (element.type === "seal") {
      content = <span className="text-xs">印章</span>;
    } else if (element.type === "sequence") {
      if (canvas.batch && canvas.batch.showSequence && pageIndex !== undefined) {
        const idx = pageIndex + 1;
        const total = canvas.batch.packageCount;
        if (canvas.batch.sequenceFormat === "fraction") {
          content = `${idx}/${total}`;
        } else {
          content = `${idx} of ${total}`;
        }
      } else {
        content = "1/1";
      }
    }
    
    return (
      <div
        key={element.id}
        className={`absolute ${pageIndex === undefined ? "cursor-move" : ""} ${isSelected ? "ring-2 ring-blue-500" : ""}`}
        style={{
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          width: `${pos.width}px`,
          height: `${pos.height}px`,
          ...style,
          zIndex: element.zIndex,
        }}
        onMouseDown={pageIndex === undefined ? e => handleMouseDown(e, element.id) : undefined}
        data-testid="canvas-element"
        data-element-id={element.id}
      >
        <div className="w-full h-full overflow-hidden">
          {content}
        </div>

        {/* Resize Handle */}
        {isSelected && !element.locked && pageIndex === undefined && (
          <div
            className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 cursor-se-resize"
            onMouseDown={e => handleResizeMouseDown(e, element.id)}
            data-testid="canvas-resize-handle"
          />
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Dynamic print styles */}
      <style dangerouslySetInnerHTML={{ __html: printStyle }} />
      
      {/* Mobile/Tablet Toggle Buttons */}
      <div className="fixed top-4 left-4 z-50 flex gap-2 lg:hidden">
        <button
          onClick={() => setShowLeftPanel(!showLeftPanel)}
          className="px-3 py-2 bg-white border border-gray-300 rounded shadow-sm text-sm hover:bg-gray-50"
          data-testid="canvas-toggle-left-panel"
        >
          {showLeftPanel ? "← 隐藏工具" : "工具 →"}
        </button>
        {selectedElement && (
          <button
            onClick={() => setShowRightPanel(!showRightPanel)}
            className="px-3 py-2 bg-white border border-gray-300 rounded shadow-sm text-sm hover:bg-gray-50"
            data-testid="canvas-toggle-right-panel"
          >
            {showRightPanel ? "隐藏属性 →" : "← 属性"}
          </button>
        )}
      </div>
      
      {/* Left Panel - Tools */}
      {showLeftPanel && (
        <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto print:hidden absolute lg:relative z-40 h-full shadow-lg lg:shadow-none">
        <h2 className="text-lg font-bold mb-4">工具</h2>
        
        {/* Company Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">公司</label>
          <select
            value={selectedCompanyId || ""}
            onChange={e => setSelectedCompanyId(e.target.value || undefined)}
            className="w-full px-2 py-1 border rounded text-sm"
            data-testid="canvas-company-selector"
          >
            <option value="">选择公司</option>
            {companyList.map(c => (
              <option key={c.id} value={c.id}>{c.companyName}</option>
            ))}
          </select>
        </div>

        {/* Product Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">商品</label>
          <select
            value={selectedProductId || ""}
            onChange={e => setSelectedProductId(e.target.value || undefined)}
            className="w-full px-2 py-1 border rounded text-sm"
            data-testid="canvas-product-selector"
          >
            <option value="">选择商品</option>
            {productList.map(p => (
              <option key={p.id} value={p.id}>{p.name}{p.sku ? ` (${p.sku})` : ""}</option>
            ))}
          </select>
        </div>
        
        <div className="space-y-2">
          <button
            onClick={() => addElement("text")}
            className="w-full px-3 py-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 text-sm"
            data-testid="canvas-add-text"
          >
            + 文本
          </button>
          <button
            onClick={() => addElement("field")}
            className="w-full px-3 py-2 bg-green-50 text-green-700 rounded hover:bg-green-100 text-sm"
            data-testid="canvas-add-field"
          >
            + 字段
          </button>
          <button
            onClick={() => addElement("sequence")}
            className="w-full px-3 py-2 bg-yellow-50 text-yellow-700 rounded hover:bg-yellow-100 text-sm"
            data-testid="canvas-add-sequence"
          >
            + 序号
          </button>
          <button
            onClick={() => addElement("table")}
            className="w-full px-3 py-2 bg-purple-50 text-purple-700 rounded hover:bg-purple-100 text-sm"
            data-testid="canvas-add-table"
          >
            + 表格
          </button>
          <button
            onClick={() => addElement("seal")}
            className="w-full px-3 py-2 bg-red-50 text-red-700 rounded hover:bg-red-100 text-sm"
            data-testid="canvas-add-seal"
          >
            + 印章
          </button>
        </div>

        <div className="mt-6 space-y-2">
          <button
            onClick={handleSave}
            className="w-full px-3 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 text-sm"
            data-testid="canvas-save-button"
            disabled={saveStatus === "saving"}
          >
            {saveStatus === "saving" ? "保存中..." : saveStatus === "saved" ? "✓ 已保存" : "保存"}
          </button>
          <button
            onClick={handleExportPng}
            className="w-full px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
            data-testid="canvas-png-export-button"
          >
            导出 PNG
          </button>
          <button
            onClick={handlePrint}
            className="w-full px-3 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 text-sm"
            data-testid="canvas-print-button"
          >
            打印
          </button>
        </div>

        {/* Paper Size Selector */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold mb-2">纸张尺寸</h3>
          <select
            value={canvas.paper.preset}
            onChange={e => {
              const preset = e.target.value as "A4" | "10x10" | "10x15" | "custom";
              const newPaper = defaultCanvasPaper(preset);
              setCanvas(prev => ({
                ...prev,
                paper: newPaper,
              }));
            }}
            className="w-full px-2 py-1 border rounded text-sm"
            data-testid="canvas-paper-size"
          >
            <option value="A4">A4 (210×297mm)</option>
            <option value="10x10">10×10 (100×100mm)</option>
            <option value="10x15">10×15 (100×150mm)</option>
          </select>
        </div>

        {/* Batch Config */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold mb-2">批量标签</h3>
          <div className="space-y-2">
            <label className="block text-sm">
              <span className="text-gray-700">输出模式</span>
              <select
                value={canvas.batch?.outputMode || "single"}
                onChange={e => setCanvas(prev => ({
                  ...prev,
                  batch: {
                    ...prev.batch!,
                    outputMode: e.target.value as "single" | "repeat",
                  },
                }))}
                className="mt-1 w-full px-2 py-1 border rounded text-sm"
                data-testid="canvas-batch-mode"
              >
                <option value="single">单页（显示件数）</option>
                <option value="repeat">多页（每页一个标签）</option>
              </select>
            </label>
            <label className="block text-sm">
              <span className="text-gray-700">件数</span>
              <input
                type="number"
                min="1"
                max="100"
                value={canvas.batch?.packageCount || 1}
                onChange={e => setCanvas(prev => ({
                  ...prev,
                  batch: {
                    ...prev.batch!,
                    packageCount: parseInt(e.target.value) || 1,
                  },
                }))}
                className="mt-1 w-full px-2 py-1 border rounded text-sm"
                data-testid="canvas-package-count"
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={canvas.batch?.showSequence || false}
                onChange={e => setCanvas(prev => ({
                  ...prev,
                  batch: {
                    ...prev.batch!,
                    showSequence: e.target.checked,
                  },
                }))}
                data-testid="canvas-show-sequence"
              />
              显示序号
            </label>
          </div>
        </div>

        {/* Grid Settings */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold mb-2">网格</h3>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={canvas.grid.show}
              onChange={e => setCanvas(prev => ({
                ...prev,
                grid: { ...prev.grid, show: e.target.checked },
              }))}
              data-testid="canvas-grid-toggle"
            />
            显示网格
          </label>
          <label className="flex items-center gap-2 text-sm mt-2">
            <input
              type="checkbox"
              checked={canvas.grid.snap}
              onChange={e => setCanvas(prev => ({
                ...prev,
                grid: { ...prev.grid, snap: e.target.checked },
              }))}
            />
            吸附网格
          </label>
        </div>
      </div>
      )}

      {/* Center - Canvas */}
      <div
        ref={canvasRef}
        className="flex-1 overflow-auto p-10 pt-16 lg:pt-10 print:p-0"
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        data-testid="canvas-editor-root"
      >
        <div ref={printRootRef} data-testid="canvas-print-root">
          {canvas.batch?.outputMode === "repeat" ? (
            // Repeat mode: render N pages
            Array.from({ length: canvas.batch.packageCount }).map((_, pageIndex) => (
              <div
                key={pageIndex}
                ref={pageIndex === 0 ? paperRef : undefined}
                className="bg-white shadow-lg relative mx-auto mb-8 print:mb-0 print:shadow-none"
                style={{
                  width: `${paperDimensions.width}px`,
                  height: `${paperDimensions.height}px`,
                }}
                data-testid="canvas-print-page"
              >
                {/* Grid (only on first page in editor) */}
                {canvas.grid.show && pageIndex === 0 && (
                  <svg
                    className="absolute inset-0 pointer-events-none"
                    width={paperDimensions.width}
                    height={paperDimensions.height}
                  >
                    {Array.from({ length: Math.ceil(canvas.paper.widthMm / canvas.grid.sizeMm) }).map((_, i) => (
                      <line
                        key={`v-${i}`}
                        x1={mmToPx(i * canvas.grid.sizeMm) * scale}
                        y1={0}
                        x2={mmToPx(i * canvas.grid.sizeMm) * scale}
                        y2={paperDimensions.height}
                        stroke="#e5e7eb"
                        strokeWidth="0.5"
                      />
                    ))}
                    {Array.from({ length: Math.ceil(canvas.paper.heightMm / canvas.grid.sizeMm) }).map((_, i) => (
                      <line
                        key={`h-${i}`}
                        x1={0}
                        y1={mmToPx(i * canvas.grid.sizeMm) * scale}
                        x2={paperDimensions.width}
                        y2={mmToPx(i * canvas.grid.sizeMm) * scale}
                        stroke="#e5e7eb"
                        strokeWidth="0.5"
                      />
                    ))}
                  </svg>
                )}

                {/* Elements */}
                {canvas.elements.map(element => renderElement(element, pageIndex))}

                {/* Page count indicator */}
                <div
                  className="absolute bottom-2 right-2 text-xs text-gray-400 print:text-black"
                  data-testid="canvas-print-page-count"
                >
                  {pageIndex + 1}/{canvas.batch?.packageCount || 1}
                </div>
              </div>
            ))
          ) : (
            // Single mode: render one page
            <div
              ref={paperRef}
              className="bg-white shadow-lg relative mx-auto"
              style={{
                width: `${paperDimensions.width}px`,
                height: `${paperDimensions.height}px`,
              }}
              data-testid="canvas-paper"
            >
              {/* Grid */}
              {canvas.grid.show && (
                <svg
                  className="absolute inset-0 pointer-events-none"
                  width={paperDimensions.width}
                  height={paperDimensions.height}
                >
                  {Array.from({ length: Math.ceil(canvas.paper.widthMm / canvas.grid.sizeMm) }).map((_, i) => (
                    <line
                      key={`v-${i}`}
                      x1={mmToPx(i * canvas.grid.sizeMm) * scale}
                      y1={0}
                      x2={mmToPx(i * canvas.grid.sizeMm) * scale}
                      y2={paperDimensions.height}
                      stroke="#e5e7eb"
                      strokeWidth="0.5"
                    />
                  ))}
                  {Array.from({ length: Math.ceil(canvas.paper.heightMm / canvas.grid.sizeMm) }).map((_, i) => (
                    <line
                      key={`h-${i}`}
                      x1={0}
                      y1={mmToPx(i * canvas.grid.sizeMm) * scale}
                      x2={paperDimensions.width}
                      y2={mmToPx(i * canvas.grid.sizeMm) * scale}
                      stroke="#e5e7eb"
                      strokeWidth="0.5"
                    />
                  ))}
                </svg>
              )}

              {/* Elements */}
              {canvas.elements.map(element => renderElement(element))}

              {/* Package count indicator (single mode) */}
              {canvas.batch && canvas.batch.packageCount > 1 && (
                <div
                  className="absolute bottom-2 right-2 text-xs text-gray-400"
                  data-testid="canvas-print-page-sequence"
                >
                  件数: {canvas.batch.packageCount}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Properties */}
      {showRightPanel && (
      <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto print:hidden absolute right-0 lg:relative z-40 h-full shadow-lg lg:shadow-none">
        <h2 className="text-lg font-bold mb-4">属性</h2>
        
        {selectedElement ? (
          <div className="space-y-4" data-testid="canvas-properties-panel">
            <div>
              <label className="block text-sm font-medium mb-1">X (mm)</label>
              <input
                type="number"
                value={selectedElement.x.toFixed(1)}
                onChange={e => updateElement(selectedElement.id, { x: parseFloat(e.target.value) })}
                className="w-full px-2 py-1 border rounded text-sm"
                data-testid="canvas-x-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Y (mm)</label>
              <input
                type="number"
                value={selectedElement.y.toFixed(1)}
                onChange={e => updateElement(selectedElement.id, { y: parseFloat(e.target.value) })}
                className="w-full px-2 py-1 border rounded text-sm"
                data-testid="canvas-y-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">宽度 (mm)</label>
              <input
                type="number"
                value={selectedElement.width.toFixed(1)}
                onChange={e => updateElement(selectedElement.id, { width: parseFloat(e.target.value) })}
                className="w-full px-2 py-1 border rounded text-sm"
                data-testid="canvas-width-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">高度 (mm)</label>
              <input
                type="number"
                value={selectedElement.height.toFixed(1)}
                onChange={e => updateElement(selectedElement.id, { height: parseFloat(e.target.value) })}
                className="w-full px-2 py-1 border rounded text-sm"
                data-testid="canvas-height-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">字号 (pt)</label>
              <input
                type="number"
                value={selectedElement.style.fontSize || 12}
                onChange={e => updateElement(selectedElement.id, {
                  style: { ...selectedElement.style, fontSize: parseInt(e.target.value) },
                })}
                className="w-full px-2 py-1 border rounded text-sm"
                data-testid="canvas-font-size-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">颜色</label>
              <input
                type="color"
                value={selectedElement.style.color || "#000000"}
                onChange={e => updateElement(selectedElement.id, {
                  style: { ...selectedElement.style, color: e.target.value },
                })}
                className="w-full h-8 border rounded"
                data-testid="canvas-color-input"
              />
            </div>
            {selectedElement.type === "field" && (
              <div>
                <label className="block text-sm font-medium mb-1">绑定字段</label>
                <select
                  value={selectedElement.binding || ""}
                  onChange={e => updateElement(selectedElement.id, { binding: e.target.value })}
                  className="w-full px-2 py-1 border rounded text-sm"
                  data-testid="canvas-binding-select"
                >
                  <option value="">选择字段</option>
                  <option value="company.name">公司名称</option>
                  <option value="company.contactName">联系人</option>
                  <option value="company.email">邮箱</option>
                  <option value="company.phone">电话</option>
                  <option value="document.number">单据编号</option>
                  <option value="document.date">日期</option>
                  <option value="customer.name">客户名称</option>
                  <option value="product.name">商品名称</option>
                  <option value="product.sku">SKU</option>
                  <option value="product.price">价格</option>
                  <option value="batch.packageCount">件数</option>
                  <option value="batch.sequence">序号</option>
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">层级</label>
              <input
                type="number"
                value={selectedElement.zIndex}
                onChange={e => updateElement(selectedElement.id, { zIndex: parseInt(e.target.value) })}
                className="w-full px-2 py-1 border rounded text-sm"
                data-testid="canvas-zindex-input"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => duplicateElement(selectedElement.id)}
                className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm"
                data-testid="canvas-duplicate-element"
              >
                复制
              </button>
              <button
                onClick={() => deleteElement(selectedElement.id)}
                className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
                data-testid="canvas-delete-element"
              >
                删除
              </button>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selectedElement.locked}
                onChange={e => updateElement(selectedElement.id, { locked: e.target.checked })}
                data-testid="canvas-lock-element"
              />
              锁定
            </label>
          </div>
        ) : (
          <p className="text-sm text-gray-500">选择一个元素以查看属性</p>
        )}
      </div>
      )}
    </div>
  );
}
