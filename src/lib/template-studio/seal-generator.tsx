/**
 * SealGenerator — Real circular seal/stamp using SVG textPath
 *
 * Renders a circular company seal with:
 * - Top arc: company name (curved along the top of the circle)
 * - Bottom arc: secondary text (e.g. "专用章")
 * - Center: star or abbreviation
 *
 * Security: All text is rendered as React children inside <text>/<textPath>.
 * No dangerouslySetInnerHTML. React escapes all text content.
 * SVG namespace is handled by React's JSX, preventing XSS.
 *
 * @module template-studio/seal-generator
 */

import React from "react";

// ============================================================
// Types
// ============================================================

export interface SealConfig {
  /** Top arc text (usually company name) */
  topText: string;
  /** Bottom arc text (e.g. "专用章", "财务专用章") */
  bottomText: string;
  /** Center text or symbol (e.g. "★", company abbreviation) */
  centerText: string;
  /** Seal color (default: #dc2626 red) */
  color: string;
  /** Seal diameter in px (default: 120) */
  size?: number;
}

// ============================================================
// SVG Path Definitions
// ============================================================

/**
 * Top arc path: text reads left-to-right along the top of the circle.
 * For a 120x120 viewBox, the arc goes from (18,62) to (102,62), curving upward.
 * sweep=1 (clockwise) makes the arc curve upward — text sits on top.
 */
const TOP_ARC_PATH = "M 18,62 A 44,44 0 0,1 102,62";

/**
 * Bottom arc path: text reads left-to-right along the bottom of the circle.
 * The arc goes from (24,62) to (96,62), curving downward.
 * sweep=0 (counter-clockwise) makes the arc curve downward — text sits on bottom.
 */
const BOTTOM_ARC_PATH = "M 24,62 A 38,38 0 0,0 96,62";

// ============================================================
// Font Size Auto-Shrink
// ============================================================

/**
 * Calculate font size for top arc text so it fits along the arc without overflow.
 * The top arc length is approximately π * 44 * 0.7 ≈ 97 units (70% of semicircle).
 * We estimate each character takes about 0.55 * fontSize in width.
 *
 * @param text - The text to fit
 * @param maxFontSize - Maximum font size (default 11)
 * @param arcLength - Available arc length in SVG units (default 95)
 * @returns Font size in px that fits the text along the arc
 */
function calcTopFontSize(text: string, maxFontSize: number = 11, arcLength: number = 95): number {
  if (!text || text.length === 0) return maxFontSize;
  const charWidth = 0.55; // approximate width per character as ratio of font size
  const neededLength = text.length * charWidth * maxFontSize;
  if (neededLength <= arcLength) return maxFontSize;
  // Shrink proportionally, but not below 5px
  const shrunk = Math.max(5, Math.floor((arcLength / (text.length * charWidth)) * 10) / 10);
  return shrunk;
}

/**
 * Calculate font size for bottom arc text.
 * Bottom arc is shorter (length ≈ π * 38 * 0.6 ≈ 72 units).
 */
function calcBottomFontSize(text: string, maxFontSize: number = 9, arcLength: number = 72): number {
  if (!text || text.length === 0) return maxFontSize;
  const charWidth = 0.55;
  const neededLength = text.length * charWidth * maxFontSize;
  if (neededLength <= arcLength) return maxFontSize;
  return Math.max(4, Math.floor((arcLength / (text.length * charWidth)) * 10) / 10);
}

// ============================================================
// Sanitization
// ============================================================

/**
 * Sanitize text for SVG — removes characters that could break SVG parsing.
 * React already escapes text content, but we also strip control chars
 * and limit length to prevent overflow even with adversarial input.
 *
 * Security notes:
 * - React's JSX text rendering escapes < > & " ' automatically
 * - We strip control characters (0x00-0x1F except tab/newline)
 * - We limit text length to 50 chars for top, 20 for bottom
 * - No dangerouslySetInnerHTML is used anywhere
 */
function sanitizeSealText(text: string, maxLength: number = 50): string {
  if (!text || typeof text !== "string") return "";
  // Strip control characters (keep tab \t and newline \n are not needed in seal)
  const cleaned = text.replace(/[\x00-\x1F\x7F]/g, "");
  // Truncate to maxLength (but we DON'T add "…" — we shrink font instead)
  return cleaned.substring(0, maxLength);
}

// ============================================================
// Seal Generator Component
// ============================================================

/**
 * SealGenerator — renders a circular company seal using SVG.
 *
 * The seal has:
 * 1. Outer circle (double ring)
 * 2. Top arc text (company name, auto-shrunk to fit)
 * 3. Bottom arc text (e.g. "专用章")
 * 4. Center text (e.g. "★" or company abbreviation)
 *
 * The SVG is self-contained and scalable. It renders correctly in:
 * - Screen display
 * - Print (no .stamp-placeholder class)
 * - PNG export (html2canvas captures SVG)
 *
 * @example
 * ```tsx
 * <SealGenerator
 *   topText="深圳市绝世百宝箱科技有限公司"
 *   bottomText="专用章"
 *   centerText="★"
 *   color="#dc2626"
 * />
 * ```
 */
export function SealGenerator({
  topText,
  bottomText,
  centerText,
  color,
  size = 120,
}: SealConfig): React.ReactElement {
  // Sanitize all text inputs
  const safeTop = sanitizeSealText(topText, 50);
  const safeBottom = sanitizeSealText(bottomText, 20);
  const safeCenter = sanitizeSealText(centerText, 6);

  // Auto-shrink font sizes based on text length
  const topFontSize = calcTopFontSize(safeTop);
  const bottomFontSize = calcBottomFontSize(safeBottom);

  return (
    <svg
      data-testid="seal-svg"
      width={size}
      height={size}
      viewBox="0 0 120 120"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block" }}
    >
      <defs>
        <path id="seal-top-arc" d={TOP_ARC_PATH} fill="none" />
        <path id="seal-bottom-arc" d={BOTTOM_ARC_PATH} fill="none" />
      </defs>

      {/* Outer ring */}
      <circle
        cx="60"
        cy="60"
        r="54"
        fill="none"
        stroke={color}
        strokeWidth="2.5"
      />

      {/* Inner ring */}
      <circle
        cx="60"
        cy="60"
        r="50"
        fill="none"
        stroke={color}
        strokeWidth="1"
      />

      {/* Top arc text — company name */}
      <text
        fill={color}
        fontSize={topFontSize}
        fontWeight="bold"
        fontFamily="serif"
        letterSpacing="0.5"
      >
        <textPath href="#seal-top-arc" startOffset="50%" textAnchor="middle">
          {safeTop}
        </textPath>
      </text>

      {/* Bottom arc text — e.g. "专用章" */}
      <text
        fill={color}
        fontSize={bottomFontSize}
        fontWeight="bold"
        fontFamily="serif"
        letterSpacing="1"
      >
        <textPath href="#seal-bottom-arc" startOffset="50%" textAnchor="middle">
          {safeBottom}
        </textPath>
      </text>

      {/* Center star/text */}
      <text
        x="60"
        y="64"
        fill={color}
        fontSize="22"
        fontWeight="bold"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {safeCenter}
      </text>

      {/* Decorative center line under star */}
      <line
        x1="38"
        y1="72"
        x2="82"
        y2="72"
        stroke={color}
        strokeWidth="0.8"
        opacity="0.6"
      />
    </svg>
  );
}

/**
 * Default seal config from company name.
 * Generates sensible defaults: company name on top, "专用章" on bottom, "★" in center.
 */
export function defaultSealConfig(companyName: string, color: string = "#dc2626"): SealConfig {
  return {
    topText: companyName || "公司印章",
    bottomText: "专用章",
    centerText: "★",
    color,
  };
}
