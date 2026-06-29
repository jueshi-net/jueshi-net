"use client";

import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
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

const DRAFT_KEY = "canvas-editor-draft";
const FONT_FAMILIES = [
  { label: "系统字体", value: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif' },
  { label: "微软雅黑", value: '"Microsoft YaHei", "PingFang SC", "Helvetica Neue", sans-serif' },
  { label: "苹方", value: '"PingFang SC", "Helvetica Neue", "Microsoft YaHei", sans-serif' },
  { label: "黑体", value: '"Heiti SC", "SimHei", "Microsoft YaHei", sans-serif' },
  { label: "宋体", value: '"Songti SC", "SimSun", "Noto Serif SC", serif' },
  { label: "楷体", value: '"Kaiti SC", "KaiTi", "STKaiti", serif' },
  { label: "仿宋", value: '"FangSong", "STFangsong", "Noto Serif SC", serif' },
  { label: "等宽", value: '"Courier New", "SF Mono", "Menlo", monospace' },
];

// ============================================================
// Canvas Editor Full Component
// ============================================================

export default function CanvasEditorFull({ template, templateId, companyId }: CanvasEditorFullProps) {
  // Initialize canvas and history with the same initial state
  const initialCanvas = useMemo(() => template || defaultCanvasTemplate(), [template]);
  const [canvas, setCanvas] = useState<CanvasTemplate>(initialCanvas);
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
  const [saveMessage, setSaveMessage] = useState<string>("");
  const [pngStatus, setPngStatus] = useState<"idle" | "exporting" | "done" | "error">("idle");
  const [currentTemplateId, setCurrentTemplateId] = useState<string | undefined>(templateId);
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [editingElementId, setEditingElementId] = useState<string | null>(null);
  const [hasDraft, setHasDraft] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  
  // History for undo/redo — stores snapshots at meaningful boundaries
  // Initialize with the initial canvas state so undo can go back to it
  const [history, setHistory] = useState<CanvasTemplate[]>([initialCanvas]);
  const [historyIndex, setHistoryIndex] = useState(0);
  // Track whether we're mid-action (drag/resize) to avoid pushing every frame
  const isMidAction = useRef(false);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const printRootRef = useRef<HTMLDivElement>(null);
  const textEditorRef = useRef<HTMLTextAreaElement>(null);

  // ============================================================
  // Draft auto-save / restore (localStorage)
  // ============================================================

  // Check for draft on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        setHasDraft(true);
      }
    } catch { /* ignore */ }
  }, []);

  // Debounced draft save — skip while restore banner is showing to prevent overwriting existing draft
  useEffect(() => {
    if (hasDraft) return; // Don't overwrite existing draft while restore banner is showing
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({
          canvas,
          selectedCompanyId,
          selectedProductId,
          savedAt: new Date().toISOString(),
        }));
      } catch { /* ignore */ }
    }, 1000);
    return () => clearTimeout(timer);
  }, [canvas, selectedCompanyId, selectedProductId, hasDraft]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (saveStatus !== "saved") {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [saveStatus]);

  const restoreDraft = useCallback(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const draft = JSON.parse(raw);
        if (draft.canvas) setCanvas(draft.canvas);
        if (draft.selectedCompanyId) setSelectedCompanyId(draft.selectedCompanyId);
        if (draft.selectedProductId) setSelectedProductId(draft.selectedProductId);
        setHasDraft(false);
      }
    } catch { /* ignore */ }
  }, []);

  const discardDraft = useCallback(() => {
    try {
      localStorage.removeItem(DRAFT_KEY);
      setHasDraft(false);
    } catch { /* ignore */ }
  }, []);

  // ============================================================
  // Prevent iPad page scroll during drag/resize
  // ============================================================

  // Global overscroll prevention — stops pull-to-refresh on iPad/mobile
  useEffect(() => {
    document.body.style.overscrollBehavior = "none";
    return () => { document.body.style.overscrollBehavior = ""; };
  }, []);

  useEffect(() => {
    if (!dragState && !resizeState) return;
    
    const preventScroll = (e: TouchEvent) => {
      e.preventDefault();
    };
    
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    document.addEventListener("touchmove", preventScroll, { passive: false });
    
    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
      document.removeEventListener("touchmove", preventScroll);
    };
  }, [dragState, resizeState]);

  // ============================================================
  // Side panel auto-hide on small screens
  // ============================================================

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

  // ============================================================
  // Data fetching
  // ============================================================

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
    } else {
      setCompanyData(null);
    }
  }, [selectedCompanyId]);

  useEffect(() => {
    if (selectedProductId) {
      fetch(`/api/workspace/products/${selectedProductId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.product) {
            setProductData(data.product);
          } else {
            setProductData(null);
          }
        })
        .catch(err => {
          console.error("Failed to fetch product:", err);
          setProductData(null);
        });
    } else {
      setProductData(null);
    }
  }, [selectedProductId]);

  // ============================================================
  // Load template by ID (for edit mode)
  // ============================================================

  useEffect(() => {
    if (templateId && !template) {
      fetch(`/api/template-studio/templates/${templateId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data) {
            const loadedTemplate = data.data;
            
            // Check if this is a canvas template (has paper/elements)
            // If not, it's a structured template or corrupted — use default canvas
            const hasCanvasData = loadedTemplate.paper && loadedTemplate.elements;
            
            if (hasCanvasData) {
              // Valid canvas template — load it
              setCanvas(loadedTemplate);
            } else {
              // Not a canvas template — start with default canvas
              // but preserve the name and ID
              const defaultCanvas = defaultCanvasTemplate();
              setCanvas({
                ...defaultCanvas,
                name: loadedTemplate.name || "未命名模板",
              });
              console.warn("Template is not a canvas template, starting with default canvas");
            }
            
            setCurrentTemplateId(loadedTemplate.id);
            if (loadedTemplate.selectedCompanyId) {
              setSelectedCompanyId(loadedTemplate.selectedCompanyId);
            }
          }
        })
        .catch(err => console.error("Failed to load template:", err));
    }
  }, [templateId, template]);

  // ============================================================
  // Scale
  // ============================================================

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
  // History (undo/redo) — push only at action boundaries
  // ============================================================

  const pushHistory = useCallback((newCanvas: CanvasTemplate) => {
    setHistory(prev => {
      const idx = prev.length; // always append at end
      const newHistory = [...prev.slice(0, idx), newCanvas];
      if (newHistory.length > 50) newHistory.shift();
      return newHistory;
    });
    setHistoryIndex(prev => prev + 1);
  }, []);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setCanvas(prevState);
      setHistoryIndex(prev => prev - 1);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setCanvas(nextState);
      setHistoryIndex(prev => prev + 1);
    }
  }, [history, historyIndex]);

  // ============================================================
  // Element Operations
  // ============================================================

  const addElement = useCallback((type: CanvasElementType) => {
    const newElement = defaultCanvasElement(type);
    newElement.zIndex = getNextZIndex(canvas.elements);
    const newCanvas = {
      ...canvas,
      elements: [...canvas.elements, newElement],
      updatedAt: new Date().toISOString(),
    };
    setCanvas(newCanvas);
    pushHistory(newCanvas);
    setSelectedElementId(newElement.id);
    setSaveStatus("idle");
  }, [canvas, pushHistory]);

  const insertCompanyBlock = useCallback(() => {
    const baseZ = getNextZIndex(canvas.elements);
    const el = defaultCanvasElement("company-info");
    el.id = `el-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    el.x = 5;
    el.y = 5;
    el.width = 80;
    el.height = 30;
    el.zIndex = baseZ;
    el.companyFields = [
      { binding: "company.companyName", label: "公司名称", visible: true },
      { binding: "company.contactName", label: "联系人", visible: true },
      { binding: "company.phone", label: "电话", visible: true },
      { binding: "company.address", label: "地址", visible: true },
    ];
    el.style = { ...el.style, fontSize: 10 };
    const newCanvas = {
      ...canvas,
      elements: [...canvas.elements, el],
      updatedAt: new Date().toISOString(),
    };
    setCanvas(newCanvas);
    pushHistory(newCanvas);
    setSelectedElementId(el.id);
    setSaveStatus("idle");
  }, [canvas, pushHistory]);

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
    const newCanvas = {
      ...canvas,
      elements: canvas.elements.filter(el => el.id !== id),
      updatedAt: new Date().toISOString(),
    };
    setCanvas(newCanvas);
    pushHistory(newCanvas);
    if (selectedElementId === id) {
      setSelectedElementId(null);
    }
    setSaveStatus("idle");
  }, [canvas, selectedElementId, pushHistory]);

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
    
    const newCanvas = {
      ...canvas,
      elements: [...canvas.elements, newElement],
      updatedAt: new Date().toISOString(),
    };
    setCanvas(newCanvas);
    pushHistory(newCanvas);
    setSelectedElementId(newElement.id);
    setSaveStatus("idle");
  }, [canvas, pushHistory]);

  // ============================================================
  // Text Editing Handlers
  // ============================================================

  const startEditing = useCallback((elementId: string) => {
    const element = canvas.elements.find(el => el.id === elementId);
    if (!element || element.type !== "text" || element.locked) return;
    
    setEditingElementId(elementId);
    setSelectedElementId(elementId);
  }, [canvas.elements]);

  const stopEditing = useCallback(() => {
    setEditingElementId(null);
    // Push history when text editing is confirmed
    setCanvas(current => {
      pushHistory(current);
      return current;
    });
    setSaveStatus("idle");
  }, [pushHistory]);

  const handleTextDoubleClick = useCallback((e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    startEditing(elementId);
  }, [startEditing]);

  const handleTextContentChange = useCallback((elementId: string, newText: string) => {
    updateElement(elementId, { text: newText });
  }, [updateElement]);

  const handleTextEditConfirm = useCallback(() => {
    stopEditing();
  }, [stopEditing]);

  const handleTextEditCancel = useCallback(() => {
    setEditingElementId(null);
    // Don't push history on cancel
  }, []);

  useEffect(() => {
    if (editingElementId && textEditorRef.current) {
      textEditorRef.current.focus();
      textEditorRef.current.select();
    }
  }, [editingElementId]);

  // ============================================================
  // Drag & Resize Handlers — push history only on pointer UP
  // ============================================================

  const handlePointerDown = useCallback((e: React.PointerEvent, elementId: string) => {
    e.stopPropagation();
    
    if (editingElementId === elementId) return;
    
    const isTouch = e.pointerType === "touch";
    const isLeftClick = e.button === 0;
    if (!isTouch && !isLeftClick) return;

    const element = canvas.elements.find(el => el.id === elementId);
    if (!element || element.locked) return;
    
    // Capture pointer for reliable tracking
    try { (e.target as HTMLElement).setPointerCapture?.(e.pointerId); } catch { /* synthetic event */ }
    
    setSelectedElementId(elementId);
    setDragState({
      elementId,
      startX: e.clientX,
      startY: e.clientY,
      startElementX: element.x,
      startElementY: element.y,
    });
    isMidAction.current = true;
  }, [canvas.elements, editingElementId]);

  const handleResizePointerDown = useCallback((e: React.PointerEvent, elementId: string) => {
    e.stopPropagation();
    const isTouch = e.pointerType === "touch";
    const isLeftClick = e.button === 0;
    if (!isTouch && !isLeftClick) return;

    const element = canvas.elements.find(el => el.id === elementId);
    if (!element || element.locked) return;
    
    try { (e.target as HTMLElement).setPointerCapture?.(e.pointerId); } catch { /* synthetic event */ }
    
    setResizeState({
      elementId,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: element.width,
      startHeight: element.height,
    });
    isMidAction.current = true;
  }, [canvas.elements]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
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

  const handlePointerUp = useCallback(() => {
    if (isMidAction.current) {
      // Push history ONCE at end of drag/resize
      setCanvas(current => {
        pushHistory(current);
        return current;
      });
      isMidAction.current = false;
      setSaveStatus("idle");
    }
    setDragState(null);
    setResizeState(null);
  }, [pushHistory]);

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
  // Save — with real feedback
  // ============================================================

  const handleSave = useCallback(async () => {
    setSaveStatus("saving");
    setSaveMessage("保存中...");
    try {
      const response = await fetch("/api/template-studio/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: currentTemplateId,
          name: canvas.name,
          type: "canvas",
          config: canvas,
          companyId: selectedCompanyId,
          productId: selectedProductId,
        }),
      });
      
      if (response.status === 401) {
        setSaveStatus("error");
        setSaveMessage("请先登录后再保存");
        return;
      }
      
      const data = await response.json();
      if (data.success) {
        setCurrentTemplateId(data.data.id);
        setSaveStatus("saved");
        const now = new Date().toLocaleTimeString();
        setSaveMessage(`✓ 已保存 ${now} — 在"我的模板"中查看`);
        setLastSavedAt(now);
        // Clear draft after successful save
        try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
        setTimeout(() => {
          setSaveStatus("idle");
          setSaveMessage("");
        }, 5000);
      } else {
        setSaveStatus("error");
        setSaveMessage(`保存失败: ${data.error || "未知错误"}`);
      }
    } catch (err) {
      console.error("Save failed:", err);
      setSaveStatus("error");
      setSaveMessage("保存失败: 网络错误");
    }
  }, [canvas, currentTemplateId, selectedCompanyId, selectedProductId]);

  // ============================================================
  // PNG Export — with loading feedback
  // ============================================================

  const handleExportPng = useCallback(async () => {
    if (pngStatus === "exporting") return;
    
    // Check if in multipage/repeat mode
    if (canvas.batch?.outputMode === "repeat" && canvas.batch.packageCount > 1) {
      setPngStatus("error");
      setSaveMessage("当前仅支持单页模式导出 PNG；批量 PNG 导出开发中，请切换到单页输出模式后导出。");
      setTimeout(() => { setPngStatus("idle"); setSaveMessage(""); }, 5000);
      return;
    }
    
    if (!paperRef.current) {
      setPngStatus("error");
      setSaveMessage("导出失败: 画布未就绪，请先添加内容");
      setTimeout(() => { setPngStatus("idle"); setSaveMessage(""); }, 3000);
      return;
    }
    
    setPngStatus("exporting");
    try {
      // Dynamically import html-to-image (avoids SSR issues).
      // html-to-image natively supports lab()/oklch() color functions
      // used by Tailwind CSS v4 — no onclone color-replacement hack needed.
      const { toPng } = await import("html-to-image");

      // Temporarily hide selection rings via a <style> tag
      const styleId = "png-export-ring-hide";
      const styleEl = document.createElement("style");
      styleEl.id = styleId;
      styleEl.textContent = ".ring-2{box-shadow:none!important}";
      document.head.appendChild(styleEl);

      // Filter out UI elements that should not appear in the export
      const hideTestIds = new Set([
        "canvas-grid-overlay",
        "canvas-resize-handle",
        "canvas-sequence-resize-handle",
        "canvas-edit-text-button",
        "canvas-print-page-count",
        "canvas-print-page-sequence",
      ]);
      const filter = (node: HTMLElement) => {
        const testid =
          node?.dataset?.testid ?? node?.getAttribute?.("data-testid") ?? "";
        return !hideTestIds.has(testid);
      };

      const dataUrl = await toPng(paperRef.current, {
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        filter,
      });

      // Clean up temporary style
      styleEl.remove();

      const link = document.createElement("a");
      link.download = `${canvas.name || "template"}.png`;
      link.href = dataUrl;
      link.click();
      setPngStatus("done");
      setTimeout(() => setPngStatus("idle"), 2000);
    } catch (err) {
      // Ensure temp style is removed on error too
      document.getElementById("png-export-ring-hide")?.remove();
      console.error("PNG export failed:", err);
      setPngStatus("error");
      setSaveMessage(`导出失败: ${err instanceof Error ? err.message : "未知错误"}`);
      setTimeout(() => { setPngStatus("idle"); setSaveMessage(""); }, 3000);
    }
  }, [canvas.name, pngStatus]);

  // ============================================================
  // Print — iframe-based print-only (v18.6.16.6.25 runtime fix)
  // Isolates canvas labels from site layout (header/footer/nav)
  // ============================================================

  const handlePrint = useCallback(() => {
    const printRoot = printRootRef.current;
    if (!printRoot) {
      console.error("Print root not found");
      return;
    }

    // v6.39 fix: Extract unscaled print content to avoid shrinkage
    // Each page has a wrapper with scaled dimensions, but inside is a print-only div with unscaled dimensions
    const pages = printRoot.querySelectorAll("[data-testid=\"canvas-print-page\"], [data-testid=\"canvas-paper\"]");
    if (pages.length === 0) {
      console.error("No print pages found in print root");
      return;
    }

    // v6.39 fix: Build pages HTML by extracting the unscaled print content
    let pagesHTML = "";
    pages.forEach((page) => {
      // Find the unscaled print-only div inside this page
      const unscaledDiv = page.querySelector("[data-testid=\"canvas-print-unscaled-paper\"]");
      
      if (unscaledDiv) {
        // Use the unscaled content
        const clone = unscaledDiv.cloneNode(true) as HTMLElement;
        // Remove grid overlays
        clone.querySelectorAll("[data-testid=\"canvas-grid-overlay\"]").forEach(el => el.remove());
        // Remove resize handles and edit buttons
        clone.querySelectorAll("[data-testid=\"canvas-resize-handle\"], [data-testid=\"canvas-sequence-resize-handle\"], [data-testid=\"canvas-edit-text-button\"]").forEach(el => el.remove());
        // Remove selection ring
        clone.querySelectorAll(".ring-2").forEach(el => el.classList.remove("ring-2"));
        pagesHTML += `<div class="print-page-wrapper" style="position: relative; width: ${printPaperDimensions.width}px; height: ${printPaperDimensions.height}px;">${clone.outerHTML}</div>`;
      } else {
        // Fallback: use the page itself but remove scale
        const clone = page.cloneNode(true) as HTMLElement;
        // Remove page-count and page-sequence indicators
        clone.querySelectorAll("[data-testid=\"canvas-print-page-count\"], [data-testid=\"canvas-print-page-sequence\"]").forEach(el => el.remove());
        // Remove grid overlays
        clone.querySelectorAll("[data-testid=\"canvas-grid-overlay\"]").forEach(el => el.remove());
        // Remove resize handles and edit buttons
        clone.querySelectorAll("[data-testid=\"canvas-resize-handle\"], [data-testid=\"canvas-sequence-resize-handle\"], [data-testid=\"canvas-edit-text-button\"]").forEach(el => el.remove());
        // Reset dimensions to unscaled
        clone.style.width = `${printPaperDimensions.width}px`;
        clone.style.height = `${printPaperDimensions.height}px`;
        clone.style.transform = "none";
        pagesHTML += clone.outerHTML;
      }
    });

    // v6.26 fix: Use large enough iframe to render full page content without clipping
    // Position off-screen but give it the actual paper dimensions in pixels
    const paperWidthMm = canvas.paper.widthMm;
    const paperHeightMm = canvas.paper.heightMm;
    const paperWidthPx = Math.ceil(paperWidthMm * 3.7795275591); // mm to px at 96 DPI
    const paperHeightPx = Math.ceil(paperHeightMm * 3.7795275591);
    const iframe = document.createElement("iframe");
    iframe.id = "canvas-print-iframe";
    iframe.style.position = "fixed";
    iframe.style.left = "-9999px";
    iframe.style.top = "-9999px";
    iframe.style.width = `${paperWidthPx + 20}px`;
    iframe.style.height = `${paperHeightPx * Math.max(pages.length, 1) + 20}px`;
    iframe.style.border = "0";
    iframe.style.visibility = "hidden";
    iframe.style.overflow = "visible";
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow!.document;
    iframeDoc.open();

    // Collect all stylesheets from parent document
    const styleElements = Array.from(
      document.head.querySelectorAll("style, link[rel='stylesheet']")
    )
      .map((el) => el.outerHTML)
      .join("\n");

    // v6.26: iframe CSS for print pages
    const iframeHTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<title>Canvas Print</title>
${styleElements}
<style>
  @page {
    size: ${paperWidthMm}mm ${paperHeightMm}mm;
    margin: 0;
  }
  html, body {
    margin: 0 !important;
    padding: 0 !important;
    overflow: visible !important;
    background: white !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  body {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
  }
  /* Print page wrappers: page break after each */
  .print-page-wrapper {
    position: relative !important;
    box-shadow: none !important;
    margin: 0 auto !important;
    page-break-after: always;
    break-after: page;
  }
  .print-page-wrapper:last-child {
    page-break-after: auto !important;
    break-after: auto !important;
  }
  /* Inner unscaled paper div */
  [data-testid="canvas-print-unscaled-paper"] {
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
  }
  /* Remove selection ring */
  .ring-2 {
    box-shadow: none !important;
  }
  /* Ensure colors print correctly */
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
</style>
</head>
<body>
${pagesHTML}
</body>
</html>`;

    iframeDoc.write(iframeHTML);
    iframeDoc.close();

    // v6.25 fix: Wait for iframe document to be fully ready before printing
    const triggerPrint = () => {
      // Wait for document to be complete
      const checkReady = () => {
        if (iframeDoc.readyState === "complete") {
          // Extra delay for fonts and images to render
          setTimeout(() => {
            try {
              iframe.contentWindow!.focus();
              iframe.contentWindow!.print();
            } catch (err) {
              console.error("Print failed:", err);
            }
            // v6.25 fix: Delay cleanup to 5s to ensure print dialog is dismissed
            setTimeout(() => {
              try {
                if (document.body.contains(iframe)) {
                  document.body.removeChild(iframe);
                }
              } catch { /* ignore */ }
            }, 5000);
          }, 500);
        } else {
          setTimeout(checkReady, 100);
        }
      };
      checkReady();
    };

    // Wait for external stylesheets to load, then trigger print
    const links = iframeDoc.querySelectorAll("link[rel='stylesheet']");
    if (links.length > 0) {
      let loaded = 0;
      const total = links.length;
      let triggered = false;
      const onLoad = () => {
        loaded++;
        if (loaded >= total && !triggered) {
          triggered = true;
          triggerPrint();
        }
      };
      links.forEach((link) => {
        if ((link as HTMLLinkElement).sheet) {
          onLoad();
        } else {
          link.addEventListener("load", onLoad);
          link.addEventListener("error", onLoad);
        }
      });
      // Safety timeout — trigger print even if styles haven't loaded
      setTimeout(() => {
        if (!triggered) {
          triggered = true;
          triggerPrint();
        }
      }, 5000);
    } else {
      triggerPrint();
    }
  }, [canvas.paper.widthMm, canvas.paper.heightMm]);

  // ============================================================
  // Render
  // ============================================================

  const selectedElement = canvas.elements.find(el => el.id === selectedElementId);
  const paperDimensions = getScaledPaperDimensions(canvas.paper, scale);

  // Comprehensive print styles — hide ALL UI, show only canvas
  const printStyle = `
    @media print {
      @page {
        size: ${canvas.paper.widthMm}mm ${canvas.paper.heightMm}mm;
        margin: 0;
      }
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        overflow: visible !important;
      }
      /* Hide ALL non-print UI */
      .print\\:hidden,
      [data-testid="canvas-toggle-left-panel"],
      [data-testid="canvas-toggle-right-panel"],
      [data-testid="canvas-undo-button"],
      [data-testid="canvas-redo-button"],
      [data-testid="canvas-history-state"],
      [data-testid="canvas-draft-restore-banner"],
      [data-testid="canvas-resize-handle"],
      [data-testid="canvas-edit-text-button"],
      [data-testid="canvas-text-editor"],
      [data-testid="canvas-grid-overlay"] {
        display: none !important;
      }
      /* Hide side panels */
      .w-64.print\\:hidden,
      .w-80.print\\:hidden {
        display: none !important;
      }
      /* Make canvas area fill page */
      [data-testid="canvas-editor-root"] {
        overflow: visible !important;
        padding: 0 !important;
        display: block !important;
      }
      /* Remove shadows and margins from pages */
      [data-testid="canvas-print-page"] {
        box-shadow: none !important;
        margin: 0 !important;
        page-break-after: always;
        break-after: page;
      }
      /* Last page: no page-break to avoid extra blank page */
      [data-testid="canvas-print-page"]:last-child {
        page-break-after: auto !important;
        break-after: auto !important;
      }
      [data-testid="canvas-paper"] {
        box-shadow: none !important;
      }
      /* Hide page count indicators in print */
      [data-testid="canvas-print-page-count"],
      [data-testid="canvas-print-page-sequence"] {
        display: none !important;
      }
      /* Hide ring selection indicator */
      .ring-2 {
        box-shadow: none !important;
      }
    }
  `;

  // Grid overlay component — shared between single and repeat mode
  const renderGridOverlay = () => {
    if (!canvas.grid.show) return null;
    const gridPx = mmToPx(canvas.grid.sizeMm) * scale;
    const cols = Math.ceil(paperDimensions.width / gridPx);
    const rows = Math.ceil(paperDimensions.height / gridPx);
    
    return (
      <svg
        className="absolute inset-0 pointer-events-none print:hidden"
        width={paperDimensions.width}
        height={paperDimensions.height}
        data-testid="canvas-grid-overlay"
      >
        {Array.from({ length: cols + 1 }).map((_, i) => (
          <line
            key={`v-${i}`}
            x1={i * gridPx}
            y1={0}
            x2={i * gridPx}
            y2={paperDimensions.height}
            stroke="#9ca3af"
            strokeWidth="1"
          />
        ))}
        {Array.from({ length: rows + 1 }).map((_, i) => (
          <line
            key={`h-${i}`}
            x1={0}
            y1={i * gridPx}
            x2={paperDimensions.width}
            y2={i * gridPx}
            stroke="#9ca3af"
            strokeWidth="1"
          />
        ))}
      </svg>
    );
  };

  const renderElement = (element: CanvasElement, pageIndex?: number) => {
    if (!element.visible) return null;
    
    // Sequence element: hide entirely when showSequence is off, but leave a hidden marker for audit
    if (element.type === "sequence" && !canvas.batch?.showSequence) {
      return (
        <div
          key={element.id}
          data-testid="canvas-sequence-hidden"
          data-element-id={element.id}
          style={{ display: "none" }}
        />
      );
    }
    
    const pos = getElementPositionPx(element, scale);
    // In repeat mode, allow selection/drag on first page (pageIndex === 0) so the sequence element is editable
    const isInteractivePage = pageIndex === undefined || pageIndex === 0;
    const isSelected = element.id === selectedElementId && isInteractivePage;
    const isEditing = element.id === editingElementId && isInteractivePage;
    const style = canvasStyleToCSS(sanitizeCanvasStyle(element.style));
    
    let content = null;
    
    if (element.type === "text") {
      if (isEditing) {
        content = (
          <div className="w-full h-full relative" data-testid="canvas-text-editor">
            <textarea
              ref={textEditorRef}
              value={element.text || ""}
              onChange={e => handleTextContentChange(element.id, e.target.value)}
              onBlur={handleTextEditConfirm}
              onKeyDown={e => {
                if (e.key === "Escape") {
                  handleTextEditCancel();
                } else if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                  handleTextEditConfirm();
                }
              }}
              className="w-full h-full p-1 border-2 border-blue-500 resize-none focus:outline-none bg-white"
              style={{
                fontSize: `${element.style.fontSize || 12}px`,
                color: element.style.color || "#000000",
                fontFamily: element.style.fontFamily || undefined,
                fontWeight: element.style.fontWeight || "normal",
                whiteSpace: "pre-wrap",
                wordWrap: "break-word",
              }}
              placeholder="输入文本..."
              data-testid="canvas-text-content-input"
            />
            <div className="absolute bottom-0 right-0 flex gap-1 bg-white border border-gray-300 rounded shadow-sm">
              <button
                onClick={handleTextEditConfirm}
                className="px-2 py-1 text-xs text-green-600 hover:bg-green-50"
                data-testid="canvas-text-edit-confirm"
              >
                ✓
              </button>
              <button
                onClick={handleTextEditCancel}
                className="px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                data-testid="canvas-text-edit-cancel"
              >
                ✗
              </button>
            </div>
          </div>
        );
      } else {
        const textContent = element.text || "";
        content = (
          <div 
            className="w-full h-full overflow-hidden"
            style={{ 
              whiteSpace: "pre-wrap", 
              wordWrap: "break-word",
              fontFamily: element.style.fontFamily || undefined,
              fontSize: `${element.style.fontSize || 12}px`,
              fontWeight: element.style.fontWeight || "normal",
              color: element.style.color || "#000000",
            }}
            data-testid="canvas-text-element"
          >
            {textContent || <span className="text-gray-400" data-testid="canvas-text-placeholder">双击编辑文本</span>}
          </div>
        );
      }
    } else if (element.type === "field") {
      const resolved = resolveBinding(element.binding);
      content = (
        <div 
          className="w-full h-full overflow-hidden"
          style={{ 
            whiteSpace: "pre-wrap", 
            wordWrap: "break-word",
            fontFamily: element.style.fontFamily || undefined,
            fontSize: `${element.style.fontSize || 12}px`,
            color: element.style.color || "#000000",
          }}
        >
          {resolved || `[${element.binding || "未绑定"}]`}
        </div>
      );
    } else if (element.type === "company-info") {
      const fields = element.companyFields || [];
      content = (
        <div 
          className="w-full h-full overflow-hidden"
          style={{ 
            fontFamily: element.style.fontFamily || undefined,
            fontSize: `${element.style.fontSize || 10}px`,
            color: element.style.color || "#000000",
          }}
          data-testid="canvas-company-info-block"
        >
          {fields.filter(f => f.visible).map((field, idx) => {
            const resolved = resolveBinding(field.binding);
            return (
              <div key={idx} className="mb-1" data-testid={`canvas-company-field-${field.binding}`}>
                <span className="font-semibold">{field.label}：</span>
                <span>{resolved || `[${field.binding}]`}</span>
              </div>
            );
          })}
        </div>
      );
    } else if (element.type === "table") {
      // SAFE product table — handle null/undefined gracefully
      const safeProduct = productData;
      const hasProduct = safeProduct != null && selectedProductId;
      
      if (!hasProduct) {
        content = (
          <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 p-2" data-testid="canvas-product-table-empty">
            暂无商品，请先选择商品
          </div>
        );
      } else {
        const pName = safeProduct?.name ?? "—";
        const pSku = safeProduct?.sku ?? "—";
        const tableQty = (element as any).tableOverrides?.quantity ?? 1;
        const tablePrice = (element as any).tableOverrides?.unitPrice ?? (typeof safeProduct?.unitPrice === "number" ? safeProduct.unitPrice.toFixed(2) : "0.00");
        
        content = (
          <div className="w-full h-full overflow-auto" data-testid="canvas-product-table">
            <table className="w-full text-xs border-collapse">
              <thead data-testid="canvas-product-table-header">
                <tr className="bg-gray-100 border-b">
                  <th className="border px-1 py-0.5 text-left font-semibold">商品名</th>
                  <th className="border px-1 py-0.5 text-left font-semibold">SKU</th>
                  <th className="border px-1 py-0.5 text-right font-semibold">数量</th>
                  <th className="border px-1 py-0.5 text-right font-semibold">单价</th>
                </tr>
              </thead>
              <tbody>
                <tr data-testid="canvas-product-table-row">
                  <td className="border px-1 py-0.5" data-testid="canvas-product-table-cell-name">{pName}</td>
                  <td className="border px-1 py-0.5" data-testid="canvas-product-table-cell-sku">{pSku}</td>
                  <td className="border px-1 py-0.5 text-right" data-testid="canvas-product-table-cell-qty">
                    <input
                      type="number"
                      min="1"
                      value={tableQty}
                      onChange={e => {
                        const val = parseInt(e.target.value) || 1;
                        updateElement(element.id, { tableOverrides: { ...(element as any).tableOverrides, quantity: val } } as any);
                      }}
                      className="w-12 text-right border-0 bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-400 px-0 py-0"
                      data-testid="canvas-table-quantity-input"
                    />
                  </td>
                  <td className="border px-1 py-0.5 text-right" data-testid="canvas-product-table-cell-price">
                    <input
                      type="number"
                      step="0.01"
                      value={tablePrice}
                      onChange={e => {
                        const val = parseFloat(e.target.value) || 0;
                        updateElement(element.id, { tableOverrides: { ...(element as any).tableOverrides, unitPrice: val.toFixed(2) } } as any);
                      }}
                      className="w-16 text-right border-0 bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-400 px-0 py-0"
                      data-testid="canvas-table-unit-price-input"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      }
    } else if (element.type === "seal") {
      // Seal is hidden from toolbar (option B), but if it exists in old data, show a visual indicator
      content = (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-2 border-red-500 flex items-center justify-center text-red-500 text-xs font-bold">
            印章
          </div>
        </div>
      );
    } else if (element.type === "sequence") {
      const total = canvas.batch?.packageCount || 1;
      const idx = (pageIndex ?? 0) + 1;
      const seqText = canvas.batch?.sequenceFormat === "of"
        ? `${idx} of ${total}`
        : `${idx}/${total}`;
      content = (
        <div
          className="w-full h-full flex items-center justify-center"
          style={{
            fontFamily: element.style.fontFamily || undefined,
            fontSize: `${element.style.fontSize || 14}px`,
            fontWeight: element.style.fontWeight || "normal",
            color: element.style.color || "#000000",
          }}
        >
          {seqText}
        </div>
      );
    }
    
    return (
      <div
        key={element.id}
        className={`absolute ${isInteractivePage && !isEditing ? "cursor-move" : ""} ${isSelected ? "ring-2 ring-blue-500" : ""}`}
        style={{
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          width: `${pos.width}px`,
          height: `${pos.height}px`,
          ...style,
          zIndex: element.zIndex,
        }}
        onPointerDown={isInteractivePage && !isEditing ? e => handlePointerDown(e, element.id) : undefined}
        onDoubleClick={element.type === "text" && isInteractivePage && !isEditing ? e => handleTextDoubleClick(e, element.id) : undefined}
        data-testid={
          element.type === "sequence"
            ? isSelected
              ? "canvas-sequence-selected"
              : pageIndex === 0
                ? "canvas-page-1-sequence"
                : pageIndex === 9
                  ? "canvas-page-10-sequence"
                  : "canvas-sequence-element"
            : "canvas-element"
        }
        data-element-id={element.id}
      >
        {content}

        {/* Edit Button for text elements (mobile/tablet friendly) */}
        {element.type === "text" && isSelected && !isEditing && !element.locked && isInteractivePage && (
          <button
            onClick={e => {
              e.stopPropagation();
              startEditing(element.id);
            }}
            className="absolute top-0 right-0 px-2 py-1 text-xs bg-blue-500 text-white rounded shadow-sm hover:bg-blue-600 print:hidden"
            data-testid="canvas-edit-text-button"
          >
            编辑
          </button>
        )}

        {/* Resize Handle */}
        {isSelected && !element.locked && isInteractivePage && !isEditing && (
          <div
            className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 cursor-se-resize print:hidden"
            onPointerDown={e => handleResizePointerDown(e, element.id)}
            data-testid={element.type === "sequence" ? "canvas-sequence-resize-handle" : "canvas-resize-handle"}
          />
        )}
      </div>
    );
  };

  // v6.39: Use unscaled paper dimensions for print to avoid shrinkage
  const printPaperDimensions = {
    width: mmToPx(canvas.paper.widthMm),
    height: mmToPx(canvas.paper.heightMm),
  };
  
  // Page component — used for both single and repeat mode
  const renderPage = (pageIndex?: number) => {
    const isRepeat = canvas.batch?.outputMode === "repeat";
    const showPageIndicator = isRepeat && canvas.batch?.showSequence;
    
    return (
      <div
        key={pageIndex ?? "single"}
        ref={pageIndex === 0 || pageIndex === undefined ? paperRef : undefined}
        className={`bg-white shadow-lg relative mx-auto ${isRepeat ? "mb-8" : ""} print:mb-0 print:shadow-none`}
        style={{
          width: `${paperDimensions.width}px`,
          height: `${paperDimensions.height}px`,
        }}
        data-testid={isRepeat ? "canvas-print-page" : "canvas-paper"}
      >
        {/* Print-only version with correct unscaled dimensions */}
        <div 
          className="hidden print:block absolute inset-0"
          style={{
            width: `${printPaperDimensions.width}px`,
            height: `${printPaperDimensions.height}px`,
          }}
          data-testid="canvas-print-unscaled-paper"
        >
          {/* Grid overlay — on every page */}
          {renderGridOverlay()}

          {/* Elements */}
          {canvas.elements.map(element => renderElement(element, pageIndex))}
        </div>
        
        {/* Screen-only version with scaled dimensions */}
        <div className="print:hidden w-full h-full relative">
          {/* Grid overlay — on every page */}
          {renderGridOverlay()}

          {/* Elements */}
          {canvas.elements.map(element => renderElement(element, pageIndex))}
        </div>

        {/* Page count indicator — only when showSequence is ON */}
        {showPageIndicator && (
          <div
            className="absolute bottom-2 right-2 text-xs text-gray-400 print:hidden"
            data-testid="canvas-print-page-count"
          >
            {(pageIndex ?? 0) + 1}/{canvas.batch?.packageCount || 1}
          </div>
        )}

        {/* Package count indicator (single mode) */}
        {!isRepeat && canvas.batch && canvas.batch.packageCount > 1 && (
          <div
            className="absolute bottom-2 right-2 text-xs text-gray-400 print:hidden"
            data-testid="canvas-print-page-sequence"
          >
            件数: {canvas.batch.packageCount}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden overflow-x-hidden" style={{ overscrollBehavior: "none", WebkitOverflowScrolling: "touch" }}>
      {/* Dynamic print styles */}
      <style dangerouslySetInnerHTML={{ __html: printStyle }} />
      
      {/* Draft restore banner */}
      {hasDraft && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-yellow-100 border-b border-yellow-300 px-4 py-2 flex items-center justify-between print:hidden" data-testid="canvas-draft-restore-banner">
          <span className="text-sm text-yellow-800">检测到未保存的草稿，是否恢复？</span>
          <div className="flex gap-2">
            <button
              onClick={restoreDraft}
              className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
              data-testid="canvas-restore-draft-button"
            >
              恢复
            </button>
            <button
              onClick={discardDraft}
              className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
              data-testid="canvas-discard-draft-button"
            >
              丢弃
            </button>
          </div>
        </div>
      )}
      
      {/* Mobile/Tablet Toggle Buttons */}
      <div className="fixed top-4 left-4 z-50 flex gap-2 lg:hidden print:hidden">
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
        
        {/* Undo/Redo Buttons */}
        <div className="flex gap-2 mb-2">
          <button
            onClick={undo}
            disabled={historyIndex <= 0}
            className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="canvas-undo-button"
          >
            ↶ 撤销
          </button>
          <button
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="canvas-redo-button"
          >
            ↷ 重做
          </button>
        </div>
        <div className="text-xs text-gray-500 mb-4" data-testid="canvas-history-state">
          历史: {historyIndex + 1}/{history.length}
        </div>
        
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
            onClick={insertCompanyBlock}
            className="w-full px-3 py-2 bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100 text-sm"
            data-testid="canvas-insert-company-block"
          >
            + 公司信息块
          </button>
          {/* Seal button hidden (option B) — real stamp generation is NEXT */}
        </div>

        <div className="mt-6 space-y-2">
          <button
            onClick={handleSave}
            className={`w-full px-3 py-2 rounded text-sm text-white ${
              saveStatus === "saving" ? "bg-teal-400 cursor-wait" :
              saveStatus === "saved" ? "bg-green-600" :
              saveStatus === "error" ? "bg-red-600" :
              "bg-teal-600 hover:bg-teal-700"
            }`}
            data-testid="canvas-save-button"
            disabled={saveStatus === "saving"}
          >
            {saveStatus === "saving" ? "保存中..." : saveStatus === "saved" ? saveMessage || "✓ 已保存" : saveStatus === "error" ? saveMessage || "保存失败" : "保存"}
          </button>
          {saveStatus === "error" && saveMessage && (
            <p className="text-xs text-red-600" data-testid="canvas-save-error">{saveMessage}</p>
          )}
          {saveStatus === "saved" && (
            <div className="flex flex-col gap-1 mt-2">
              <a href="/workspace/templates" className="text-xs text-blue-600 hover:underline" data-testid="canvas-view-my-templates-link">
                📋 查看我的模板
              </a>
              {currentTemplateId && (
                <a href={`/tools/template-studio/canvas/${currentTemplateId}/edit`} className="text-xs text-blue-600 hover:underline" data-testid="canvas-open-saved-template-link">
                  🔗 打开已保存模板
                </a>
              )}
            </div>
          )}
          {lastSavedAt && (
            <p className="text-xs text-gray-500" data-testid="canvas-last-saved-at">上次保存: {lastSavedAt}</p>
          )}
          <button
            onClick={handleExportPng}
            className={`w-full px-3 py-2 rounded text-sm text-white ${
              pngStatus === "exporting" ? "bg-indigo-400 cursor-wait" :
              pngStatus === "done" ? "bg-green-600" :
              pngStatus === "error" ? "bg-red-600" :
              "bg-indigo-600 hover:bg-indigo-700"
            }`}
            data-testid="canvas-png-export-button"
            disabled={pngStatus === "exporting"}
          >
            {pngStatus === "exporting" ? "正在生成..." : pngStatus === "done" ? "✓ 已导出" : pngStatus === "error" ? "导出失败" : "导出 PNG"}
          </button>
          {canvas.batch?.outputMode === "repeat" && canvas.batch.packageCount > 1 && (
            <p className="text-xs text-amber-600 mt-1" data-testid="canvas-multipage-png-notice">
              ⚠️ 批量 PNG 导出开发中，当前仅导出第 1 页
            </p>
          )}
          <button
            onClick={handlePrint}
            className="w-full px-3 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 text-sm"
            data-testid="canvas-print-button"
          >
            打印
          </button>
          <p className="text-xs text-gray-500 mt-2" data-testid="canvas-print-margin-tip">
            💡 打印提示：如果打印预览仍有白边，请在浏览器打印设置中选择：边距=无，缩放=100% 或实际大小。
          </p>
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
                onChange={e => {
                  const checked = e.target.checked;
                  setCanvas(prev => {
                    let newElements = prev.elements;
                    // When toggled on and no sequence element exists, create one
                    if (checked && !prev.elements.some(el => el.type === "sequence")) {
                      const seqElement = defaultCanvasElement("sequence");
                      seqElement.zIndex = getNextZIndex(prev.elements);
                      newElements = [...prev.elements, seqElement];
                    }
                    const newCanvas = {
                      ...prev,
                      elements: newElements,
                      batch: {
                        ...prev.batch!,
                        showSequence: checked,
                      },
                      updatedAt: new Date().toISOString(),
                    };
                    pushHistory(newCanvas);
                    return newCanvas;
                  });
                  setSaveStatus("idle");
                }}
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
              data-testid="canvas-show-grid-toggle"
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
              data-testid="canvas-snap-grid-toggle"
            />
            吸附网格
          </label>
          <label className="block text-sm mt-2">
            <span className="text-gray-700">网格大小 (mm)</span>
            <input
              type="number"
              min="1"
              max="50"
              value={canvas.grid.sizeMm}
              onChange={e => setCanvas(prev => ({
                ...prev,
                grid: { ...prev.grid, sizeMm: parseInt(e.target.value) || 5 },
              }))}
              className="mt-1 w-full px-2 py-1 border rounded text-sm"
              data-testid="canvas-grid-size-input"
            />
          </label>
        </div>
      </div>
      )}

      {/* Center - Canvas */}
      <div
        ref={canvasRef}
        className="flex-1 overflow-auto overflow-x-hidden p-10 pt-16 lg:pt-10 print:p-0 print:overflow-visible overscroll-contain"
        style={{ touchAction: dragState || resizeState ? "none" : "auto", overscrollBehavior: "contain" }}
        onClick={handleCanvasClick}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        data-testid="canvas-editor-root"
      >
        <div ref={printRootRef} data-testid="canvas-print-root">
          {canvas.batch?.outputMode === "repeat" ? (
            // Repeat mode: render N pages
            Array.from({ length: canvas.batch.packageCount }).map((_, pageIndex) => (
              <React.Fragment key={pageIndex}>
                {renderPage(pageIndex)}
              </React.Fragment>
            ))
          ) : (
            // Single mode: render one page
            renderPage()
          )}
        </div>
      </div>

      {/* Right Panel - Properties */}
      {showRightPanel && (
      <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto print:hidden absolute right-0 lg:relative z-40 h-full shadow-lg lg:shadow-none">
        <h2 className="text-lg font-bold mb-4">属性</h2>
        
        {selectedElement ? (
          <div className="space-y-4" data-testid="canvas-properties-panel">
            {/* Text Content Editor (for text elements) */}
            {selectedElement.type === "text" && (
              <div>
                <label className="block text-sm font-medium mb-1">文本内容</label>
                <textarea
                  value={selectedElement.text || ""}
                  onChange={e => handleTextContentChange(selectedElement.id, e.target.value)}
                  className="w-full px-2 py-1 border rounded text-sm resize-y min-h-[80px]"
                  placeholder="输入文本内容..."
                  rows={4}
                  data-testid="canvas-text-content-input"
                />
                <p className="text-xs text-gray-500 mt-1">支持多行文本，换行将保留</p>
              </div>
            )}
            
            {/* Company Info Field Visibility (for company-info elements) */}
            {selectedElement.type === "company-info" && (
              <div>
                <label className="block text-sm font-medium mb-2">显示字段</label>
                <div className="space-y-2">
                  {(selectedElement.companyFields || []).map((field, idx) => (
                    <label key={idx} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={field.visible}
                        onChange={e => {
                          const newFields = [...(selectedElement.companyFields || [])];
                          newFields[idx] = { ...newFields[idx], visible: e.target.checked };
                          updateElement(selectedElement.id, { companyFields: newFields });
                        }}
                        className="rounded"
                        data-testid={`canvas-company-field-toggle-${field.binding}`}
                      />
                      <span>{field.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            
            {/* Font Family */}
            {(selectedElement.type === "text" || selectedElement.type === "field" || selectedElement.type === "sequence") && (
              <div>
                <label className="block text-sm font-medium mb-1">字体</label>
                <select
                  value={selectedElement.style.fontFamily || FONT_FAMILIES[0].value}
                  onChange={e => updateElement(selectedElement.id, {
                    style: { ...selectedElement.style, fontFamily: e.target.value },
                  })}
                  className="w-full px-2 py-1 border rounded text-sm"
                  data-testid="canvas-font-family-select"
                >
                  {FONT_FAMILIES.map(f => (
                    <option key={f.value} value={f.value} data-testid="canvas-font-family-option" data-font-label={f.label}>{f.label}</option>
                  ))}
                </select>
                <div
                  className="mt-1 px-2 py-1 border rounded text-sm bg-gray-50"
                  data-testid="canvas-font-preview"
                  style={{ fontFamily: selectedElement.style.fontFamily || FONT_FAMILIES[0].value }}
                >
                  字体预览 ABC abc 123
                </div>
              </div>
            )}
            
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
                  <option value="company.companyName">公司名称</option>
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
