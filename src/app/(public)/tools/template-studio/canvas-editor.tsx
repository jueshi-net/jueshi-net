"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  type CanvasTemplate,
  type CanvasElement,
  type CanvasElementType,
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

interface CanvasEditorProps {
  template?: CanvasTemplate;
  onSave?: (template: CanvasTemplate) => void;
  onExportPng?: (template: CanvasTemplate) => void;
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

// ============================================================
// Canvas Editor Component
// ============================================================

export default function CanvasEditor({ template, onSave, onExportPng }: CanvasEditorProps) {
  const [canvas, setCanvas] = useState<CanvasTemplate>(
    template || defaultCanvasTemplate()
  );
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [resizeState, setResizeState] = useState<ResizeState | null>(null);
  const [scale, setScale] = useState(1);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);

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
  // Save & Export
  // ============================================================

  const handleSave = useCallback(() => {
    if (onSave) {
      onSave(canvas);
    }
  }, [canvas, onSave]);

  const handleExportPng = useCallback(() => {
    if (onExportPng) {
      onExportPng(canvas);
    }
  }, [canvas, onExportPng]);

  // ============================================================
  // Render
  // ============================================================

  const selectedElement = canvas.elements.find(el => el.id === selectedElementId);
  const paperDimensions = getScaledPaperDimensions(canvas.paper, scale);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Panel - Tools */}
      <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">工具</h2>
        
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
          >
            保存
          </button>
          <button
            onClick={handleExportPng}
            className="w-full px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
            data-testid="canvas-png-export-button"
          >
            导出 PNG
          </button>
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

      {/* Center - Canvas */}
      <div
        ref={canvasRef}
        className="flex-1 overflow-auto p-10"
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        data-testid="canvas-editor-root"
      >
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
          {canvas.elements.map(element => {
            if (!element.visible) return null;
            
            const pos = getElementPositionPx(element, scale);
            const isSelected = element.id === selectedElementId;
            const style = canvasStyleToCSS(sanitizeCanvasStyle(element.style));
            
            return (
              <div
                key={element.id}
                className={`absolute cursor-move ${isSelected ? "ring-2 ring-blue-500" : ""}`}
                style={{
                  left: `${pos.x}px`,
                  top: `${pos.y}px`,
                  width: `${pos.width}px`,
                  height: `${pos.height}px`,
                  ...style,
                  zIndex: element.zIndex,
                }}
                onMouseDown={e => handleMouseDown(e, element.id)}
                data-testid="canvas-element"
                data-element-id={element.id}
              >
                {element.type === "text" && (
                  <div className="w-full h-full overflow-hidden">
                    {sanitizeText(element.text || "")}
                  </div>
                )}
                {element.type === "field" && (
                  <div className="w-full h-full overflow-hidden text-blue-600">
                    [{element.binding || "未绑定"}]
                  </div>
                )}
                {element.type === "table" && (
                  <div className="w-full h-full border border-gray-300 flex items-center justify-center text-xs text-gray-500">
                    商品表格
                  </div>
                )}
                {element.type === "seal" && (
                  <div className="w-full h-full rounded-full border-2 border-red-600 flex items-center justify-center text-red-600 text-xs">
                    印章
                  </div>
                )}

                {/* Resize Handle */}
                {isSelected && !element.locked && (
                  <div
                    className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 cursor-se-resize"
                    onMouseDown={e => handleResizeMouseDown(e, element.id)}
                    data-testid="canvas-resize-handle"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Panel - Properties */}
      <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
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
                  <option value="document.number">单据编号</option>
                  <option value="document.date">日期</option>
                  <option value="customer.name">客户名称</option>
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
    </div>
  );
}
