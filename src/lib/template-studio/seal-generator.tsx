/**
 * SealGenerator — Real circular seal/stamp using per-character rotation
 *
 * Instead of textPath (which clips and has weird arc behavior),
 * each character is individually positioned and rotated along the circle.
 *
 * Top arc: characters distributed from -70° to 70° (top of circle)
 * Bottom arc: characters distributed from 250° to 110° (bottom of circle, readable)
 * Center: star or custom text
 *
 * Security: All text rendered as React children. No dangerouslySetInnerHTML.
 *
 * @module template-studio/seal-generator
 */

import React from "react";

// ============================================================
// Types
// ============================================================

export interface SealConfig {
  topText: string;
  bottomText: string;
  centerText: string;
  color: string;
  size?: number;
  fontSize?: number;
  letterSpacing?: number;
  showInnerRing?: boolean;
  rotation?: number;
}

// ============================================================
// Character width estimation
// ============================================================

function isCJK(ch: string): boolean {
  const code = ch.charCodeAt(0);
  return (
    (code >= 0x4e00 && code <= 0x9fff) ||
    (code >= 0x3000 && code <= 0x303f) ||
    (code >= 0xff00 && code <= 0xffef)
  );
}

function charWidth(ch: string): number {
  return isCJK(ch) ? 1.0 : 0.55;
}

function textWidth(text: string): number {
  let w = 0;
  for (const ch of text) w += charWidth(ch);
  return w;
}

// ============================================================
// Auto-shrink font size
// ============================================================

/**
 * Calculate font size so text fits within the arc.
 * arcSpanDeg = degrees of arc available
 * radius = radius of the arc
 * Returns font size in SVG units.
 */
function calcFontSize(
  text: string,
  maxFontSize: number,
  arcSpanDeg: number,
  radius: number,
  letterSpacing: number = 0
): number {
  if (!text || text.length === 0) return maxFontSize;
  const arcLength = (arcSpanDeg * Math.PI / 180) * radius;
  const totalChars = text.length;
  const totalLetterSpacing = letterSpacing * (totalChars - 1);
  const availableForChars = arcLength - totalLetterSpacing;
  const widthUnits = textWidth(text);
  const needed = widthUnits * maxFontSize;
  if (needed <= availableForChars) return maxFontSize;
  // Shrink but not below 4
  return Math.max(4, Math.floor((availableForChars / widthUnits) * 10) / 10);
}

// ============================================================
// Sanitization
// ============================================================

function sanitizeSealText(text: string, maxLength: number = 50): string {
  if (!text || typeof text !== "string") return "";
  return text.replace(/[\x00-\x1F\x7F]/g, "").substring(0, maxLength);
}

// ============================================================
// Arc character positioning
// ============================================================

interface CharPos {
  char: string;
  x: number;
  y: number;
  rotation: number;
}

/**
 * Calculate positions for characters along an arc.
 *
 * Convention: angle in degrees, 0° = top (12 o'clock), positive = clockwise.
 * - 0° = top, 90° = right, 180° = bottom, 270° = left
 *
 * For a character at angle α:
 *   x = cx + r * sin(α * π / 180)
 *   y = cy - r * cos(α * π / 180)
 *
 * Top arc: characters from -spanDeg/2 to +spanDeg/2 (through top)
 *   rotation = α (character upright at top, tilts along curve)
 *
 * Bottom arc: characters from (180-spanDeg/2) to (180+spanDeg/2) going clockwise
 *   but reversed for left-to-right reading: from (180+spanDeg/2) to (180-spanDeg/2)
 *   rotation = α - 180 (character upright at bottom, tilts along curve)
 */
function layoutArcChars(
  text: string,
  cx: number,
  cy: number,
  radius: number,
  spanDeg: number,
  isBottom: boolean,
  fontSize: number,
  letterSpacing: number = 0
): CharPos[] {
  const chars = Array.from(text);
  if (chars.length === 0) return [];

  const positions: CharPos[] = [];
  const n = chars.length;

  // Calculate the angle step per character
  // We use the effective width of each character to determine its angular position
  const totalWidth = textWidth(text);
  const arcLength = (spanDeg * Math.PI / 180) * radius;
  const scale = arcLength / Math.max(totalWidth * fontSize + letterSpacing * (n - 1), 1);

  let accumulatedAngle = isBottom ? (180 + spanDeg / 2) : (-spanDeg / 2);
  const direction = isBottom ? -1 : 1; // bottom goes right-to-left in angle terms for left-to-right reading

  for (let i = 0; i < n; i++) {
    const ch = chars[i];
    const w = charWidth(ch) * fontSize;
    const halfW = w / 2;
    const angleForHalfW = (halfW / radius) * (180 / Math.PI);
    const angleForLetterSpacing = i > 0 ? (letterSpacing / radius) * (180 / Math.PI) / 2 : 0;

    const alpha = accumulatedAngle + direction * (angleForHalfW + angleForLetterSpacing);
    const rad = alpha * Math.PI / 180;
    const x = cx + radius * Math.sin(rad);
    const y = cy - radius * Math.cos(rad);
    const rotation = isBottom ? alpha - 180 : alpha;

    positions.push({ char: ch, x, y, rotation });

    // Advance
    const fullStepAngle = ((w + (i < n - 1 ? letterSpacing : 0)) / radius) * (180 / Math.PI);
    accumulatedAngle += direction * fullStepAngle;
  }

  return positions;
}

// ============================================================
// Seal Generator Component
// ============================================================

export function SealGenerator({
  topText,
  bottomText,
  centerText,
  color,
  size = 120,
  fontSize: overrideFontSize,
  letterSpacing = 0.5,
  showInnerRing = true,
  rotation = 0,
}: SealConfig): React.ReactElement {
  const safeTop = sanitizeSealText(topText, 50);
  const safeBottom = sanitizeSealText(bottomText, 20);
  const safeCenter = sanitizeSealText(centerText, 6);

  // SVG viewBox is 120x120, center at (60,60)
  const cx = 60;
  const cy = 60;
  const outerR = 54;
  const innerR = 50;
  const topArcR = 45;  // text sits just inside the inner ring
  const bottomArcR = 45;
  const topSpanDeg = 140;  // -70° to 70°
  const bottomSpanDeg = 120; // 120° to 240° (through bottom)

  // Auto-shrink font sizes
  const topFontSize = overrideFontSize || calcFontSize(safeTop, 10, topSpanDeg, topArcR, letterSpacing);
  const bottomFontSize = overrideFontSize
    ? Math.max(4, overrideFontSize * 0.85)
    : calcFontSize(safeBottom, 8, bottomSpanDeg, bottomArcR, letterSpacing);

  // Layout characters
  const topChars = layoutArcChars(safeTop, cx, cy, topArcR, topSpanDeg, false, topFontSize, letterSpacing);
  const bottomChars = layoutArcChars(safeBottom, cx, cy, bottomArcR, bottomSpanDeg, true, bottomFontSize, letterSpacing);

  // Group rotation
  const groupTransform = rotation ? `rotate(${rotation} ${cx} ${cy})` : undefined;

  return (
    <svg
      data-testid="seal-svg"
      width={size}
      height={size}
      viewBox="0 0 120 120"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block", overflow: "visible" }}
    >
      <g transform={groupTransform}>
        {/* Outer ring */}
        <circle cx={cx} cy={cy} r={outerR} fill="none" stroke={color} strokeWidth="2" />

        {/* Inner ring */}
        {showInnerRing && (
          <circle cx={cx} cy={cy} r={innerR} fill="none" stroke={color} strokeWidth="0.8" />
        )}

        {/* Top arc characters */}
        {topChars.map((cp, i) => (
          <text
            key={`top-${i}`}
            x={cp.x}
            y={cp.y}
            fill={color}
            fontSize={topFontSize}
            fontWeight="bold"
            fontFamily="serif"
            textAnchor="middle"
            dominantBaseline="central"
            transform={`rotate(${cp.rotation} ${cp.x} ${cp.y})`}
          >
            {cp.char}
          </text>
        ))}

        {/* Bottom arc characters */}
        {bottomChars.map((cp, i) => (
          <text
            key={`bot-${i}`}
            x={cp.x}
            y={cp.y}
            fill={color}
            fontSize={bottomFontSize}
            fontWeight="bold"
            fontFamily="serif"
            textAnchor="middle"
            dominantBaseline="central"
            transform={`rotate(${cp.rotation} ${cp.x} ${cp.y})`}
          >
            {cp.char}
          </text>
        ))}

        {/* Center text/star */}
        <text
          x={cx}
          y={cy}
          fill={color}
          fontSize="20"
          fontWeight="bold"
          textAnchor="middle"
          dominantBaseline="central"
        >
          {safeCenter || "★"}
        </text>

        {/* Decorative line under center */}
        <line
          x1={cx - 18}
          y1={cy + 12}
          x2={cx + 18}
          y2={cy + 12}
          stroke={color}
          strokeWidth="0.6"
          opacity="0.5"
        />
      </g>
    </svg>
  );
}

/**
 * Default seal config from company name.
 */
export function defaultSealConfig(companyName: string, color: string = "#dc2626"): SealConfig {
  return {
    topText: companyName || "公司印章",
    bottomText: "专用章",
    centerText: "★",
    color,
  };
}
