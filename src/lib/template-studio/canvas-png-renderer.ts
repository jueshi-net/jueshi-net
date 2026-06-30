/**
 * Data-Driven PNG Renderer
 * 
 * Renders canvas template data directly to PNG using Canvas API.
 * No DOM screenshot (html-to-image) - pure data-driven rendering.
 * 
 * Coordinate mapping: mm → px at 96 DPI (1mm = 3.7795275591px)
 */

import type { CanvasTemplate, CanvasElement, CanvasPaperConfig } from './canvas-schema';

// mm to px conversion at 96 DPI
const MM_TO_PX = 3.7795275591;

export interface RenderOptions {
  /** Pixel ratio (default: 2 for retina) */
  pixelRatio?: number;
  /** Background color (default: white) */
  backgroundColor?: string;
  /** Page index for repeat mode (default: 0) */
  pageIndex?: number;
}

export interface RenderResult {
  /** PNG data URL */
  dataUrl: string;
  /** Canvas width in pixels */
  width: number;
  /** Canvas height in pixels */
  height: number;
  /** Paper size in mm */
  paperSize: { widthMm: number; heightMm: number };
  /** Rendering metadata */
  metadata: {
    elementCount: number;
    renderedTypes: string[];
    renderTime: number;
  };
}

/**
 * Render canvas template to PNG using Canvas API (data-driven)
 */
export async function renderCanvasToPng(
  canvas: CanvasTemplate,
  options: RenderOptions = {}
): Promise<RenderResult> {
  const startTime = performance.now();
  
  const {
    pixelRatio = 2,
    backgroundColor = '#ffffff',
    pageIndex = 0,
  } = options;

  // Calculate canvas dimensions
  const widthPx = Math.ceil(canvas.paper.widthMm * MM_TO_PX * pixelRatio);
  const heightPx = Math.ceil(canvas.paper.heightMm * MM_TO_PX * pixelRatio);

  // Create offscreen canvas
  const canvasEl = document.createElement('canvas');
  canvasEl.width = widthPx;
  canvasEl.height = heightPx;
  const ctx = canvasEl.getContext('2d');
  
  if (!ctx) {
    throw new Error('Failed to get canvas 2d context');
  }

  // Fill background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, widthPx, heightPx);

  // Scale for pixel ratio
  ctx.scale(pixelRatio, pixelRatio);

  // Render elements (sorted by zIndex)
  const sortedElements = [...canvas.elements].sort((a, b) => a.zIndex - b.zIndex);
  const renderedTypes = new Set<string>();

  for (const element of sortedElements) {
    renderElement(ctx, element, canvas, pageIndex);
    renderedTypes.add(element.type);
  }

  // Export to PNG
  const dataUrl = canvasEl.toDataURL('image/png');
  
  const renderTime = performance.now() - startTime;

  return {
    dataUrl,
    width: widthPx,
    height: heightPx,
    paperSize: {
      widthMm: canvas.paper.widthMm,
      heightMm: canvas.paper.heightMm,
    },
    metadata: {
      elementCount: sortedElements.length,
      renderedTypes: Array.from(renderedTypes),
      renderTime,
    },
  };
}

/**
 * Render a single canvas element
 */
function renderElement(
  ctx: CanvasRenderingContext2D,
  element: CanvasElement,
  canvas: CanvasTemplate,
  pageIndex: number
): void {
  // Convert mm to px
  const x = element.x * MM_TO_PX;
  const y = element.y * MM_TO_PX;
  const width = element.width * MM_TO_PX;
  const height = element.height * MM_TO_PX;

  // Save context state
  ctx.save();

  // Apply rotation if needed
  if (element.rotation !== 0) {
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    ctx.translate(centerX, centerY);
    ctx.rotate((element.rotation * Math.PI) / 180);
    ctx.translate(-centerX, -centerY);
  }

  // Render based on element type
  switch (element.type) {
    case 'text':
      renderText(ctx, element, x, y, width, height);
      break;
    case 'field':
      renderField(ctx, element, x, y, width, height);
      break;
    case 'company-info':
      renderCompanyInfo(ctx, element, x, y, width, height);
      break;
    case 'sequence':
      renderSequence(ctx, element, x, y, width, height, canvas, pageIndex);
      break;
    case 'table':
      renderTable(ctx, element, x, y, width, height);
      break;
    case 'rect':
      renderRect(ctx, element, x, y, width, height);
      break;
    case 'line':
      renderLine(ctx, element, x, y, width, height);
      break;
    default:
      // Unsupported types: image, logo, seal, qrcode, barcode
      // Render placeholder
      renderPlaceholder(ctx, element, x, y, width, height);
      break;
  }

  // Restore context state
  ctx.restore();
}

/**
 * Render text element
 */
function renderText(
  ctx: CanvasRenderingContext2D,
  element: CanvasElement,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  const text = element.text || '';
  const fontSize = element.style.fontSize || 12;
  const fontFamily = element.style.fontFamily || 'sans-serif';
  const color = element.style.color || '#000000';

  ctx.fillStyle = color;
  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.textBaseline = 'top';

  // Handle multi-line text
  const lines = text.split('\n');
  const lineHeight = fontSize * 1.2;

  lines.forEach((line, index) => {
    ctx.fillText(line, x, y + index * lineHeight, width);
  });
}

/**
 * Render field element (data binding placeholder)
 */
function renderField(
  ctx: CanvasRenderingContext2D,
  element: CanvasElement,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  const binding = element.binding || element.type;
  const fontSize = element.style.fontSize || 12;
  const color = element.style.color || '#000000';

  ctx.fillStyle = color;
  ctx.font = `${fontSize}px sans-serif`;
  ctx.textBaseline = 'top';
  ctx.fillText(`[${binding}]`, x, y, width);
}

/**
 * Render company info block
 */
function renderCompanyInfo(
  ctx: CanvasRenderingContext2D,
  element: CanvasElement,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  const fields = element.companyFields || [];
  const fontSize = element.style.fontSize || 10;
  const lineHeight = fontSize * 1.4;

  ctx.fillStyle = element.style.color || '#000000';
  ctx.font = `${fontSize}px sans-serif`;
  ctx.textBaseline = 'top';

  let currentY = y;
  fields.forEach((field) => {
    if (field.visible) {
      const label = field.label;
      const value = `[${field.binding}]`;
      ctx.fillText(`${label}: ${value}`, x, currentY, width);
      currentY += lineHeight;
    }
  });
}

/**
 * Render sequence element (1/N, 2/N, etc.)
 */
function renderSequence(
  ctx: CanvasRenderingContext2D,
  element: CanvasElement,
  x: number,
  y: number,
  width: number,
  height: number,
  canvas: CanvasTemplate,
  pageIndex: number
): void {
  const total = canvas.batch?.packageCount || 1;
  const current = pageIndex + 1;
  const format = canvas.batch?.sequenceFormat || 'fraction';
  
  const seqText = format === 'of' 
    ? `${current} of ${total}`
    : `${current}/${total}`;

  const fontSize = element.style.fontSize || 12;
  const color = element.style.color || '#000000';

  ctx.fillStyle = color;
  ctx.font = `${fontSize}px sans-serif`;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.fillText(seqText, x + width / 2, y + height / 2, width);
}

/**
 * Render table element (placeholder)
 */
function renderTable(
  ctx: CanvasRenderingContext2D,
  element: CanvasElement,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  // Draw table border
  ctx.strokeStyle = element.style.borderColor || '#000000';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, width, height);

  // Draw table label
  const fontSize = element.style.fontSize || 10;
  ctx.fillStyle = element.style.color || '#000000';
  ctx.font = `${fontSize}px sans-serif`;
  ctx.textBaseline = 'top';
  ctx.fillText('[商品表格]', x + 2, y + 2, width - 4);
}

/**
 * Render rectangle element
 */
function renderRect(
  ctx: CanvasRenderingContext2D,
  element: CanvasElement,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  ctx.fillStyle = element.style.backgroundColor || 'transparent';
  if (element.style.backgroundColor && element.style.backgroundColor !== 'transparent') {
    ctx.fillRect(x, y, width, height);
  }

  ctx.strokeStyle = element.style.borderColor || '#000000';
  ctx.lineWidth = element.style.borderWidth || 1;
  ctx.strokeRect(x, y, width, height);
}

/**
 * Render line element
 */
function renderLine(
  ctx: CanvasRenderingContext2D,
  element: CanvasElement,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  ctx.strokeStyle = element.style.borderColor || '#000000';
  ctx.lineWidth = element.style.borderWidth || 1;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + width, y + height);
  ctx.stroke();
}

/**
 * Render placeholder for unsupported elements
 */
function renderPlaceholder(
  ctx: CanvasRenderingContext2D,
  element: CanvasElement,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  ctx.strokeStyle = '#cccccc';
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 5]);
  ctx.strokeRect(x, y, width, height);
  ctx.setLineDash([]);

  const fontSize = 10;
  ctx.fillStyle = '#999999';
  ctx.font = `${fontSize}px sans-serif`;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.fillText(`[${element.type}]`, x + width / 2, y + height / 2);
}
