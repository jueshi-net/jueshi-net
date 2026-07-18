/**
 * Social sharing utilities for forum posts.
 *
 * Supports: copy link, Web Share API, Telegram, WhatsApp, Facebook, X.
 * Uses canonical URLs. Only for published content.
 */

import { SITE_URL, SITE_NAME } from "@/lib/seo";

// ─── Types ───

export interface ShareData {
  url: string;
  title: string;
  description: string;
  category?: string;
}

// ─── URL Builders ───

/**
 * Build the canonical share URL for a post.
 * Includes URL encoding for safety.
 */
export function buildShareUrl(slug: string): string {
  return `${SITE_URL}/bbs/${encodeURIComponent(slug)}`;
}

/**
 * Build a Telegram share URL.
 */
export function buildTelegramShareUrl(data: ShareData): string {
  const text = `${data.title} - ${SITE_NAME}`;
  const params = new URLSearchParams({
    url: data.url,
    text,
  });
  return `https://t.me/share/url?${params.toString()}`;
}

/**
 * Build a WhatsApp share URL.
 */
export function buildWhatsAppShareUrl(data: ShareData): string {
  const text = `${data.title}\n${data.url}`;
  const params = new URLSearchParams({ text });
  return `https://wa.me/?${params.toString()}`;
}

/**
 * Build a Facebook share URL.
 */
export function buildFacebookShareUrl(data: ShareData): string {
  const params = new URLSearchParams({
    u: data.url,
    quote: `${data.title} - ${SITE_NAME}`,
  });
  return `https://www.facebook.com/sharer/sharer.php?${params.toString()}`;
}

/**
 * Build an X (Twitter) share URL.
 */
export function buildXShareUrl(data: ShareData): string {
  const text = truncateForSocial(`${data.title} | ${SITE_NAME}`, 200);
  const params = new URLSearchParams({
    text,
    url: data.url,
  });
  return `https://twitter.com/intent/tweet?${params.toString()}`;
}

/**
 * Build a WeChat share URL (just the URL, WeChat doesn't have a share endpoint).
 */
export function buildWeChatShareUrl(data: ShareData): string {
  return data.url;
}

// ─── QR Code (lightweight, no dependency) ───

/**
 * Generate a QR code URL using a public API.
 * This is a lightweight approach that doesn't require a npm dependency.
 * Uses Google Charts API (widely available, no API key needed).
 *
 * Alternative: use api.qrserver.com as fallback.
 */
export function buildQrCodeUrl(url: string, size = 200): string {
  const encoded = encodeURIComponent(url);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&margin=10`;
}

// ─── Social Media Metadata ───

export interface OpenGraphData {
  title: string;
  description: string;
  url: string;
  type: "article" | "website";
  image?: string;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
  siteName?: string;
}

/**
 * Build Open Graph metadata object for Next.js.
 */
export function buildOpenGraph(data: OpenGraphData) {
  return {
    title: data.title,
    description: data.description,
    url: data.url,
    type: data.type,
    siteName: data.siteName || SITE_NAME,
    locale: "zh_CN",
    images: data.image
      ? [{ url: data.image, width: 1200, height: 630, alt: data.title }]
      : [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: SITE_NAME }],
    ...(data.type === "article" && {
      articles: {
        publishedTime: data.publishedTime,
        modifiedTime: data.modifiedTime,
        authors: data.author ? [data.author] : undefined,
        section: data.section,
        tags: data.tags,
      },
    }),
  };
}

export interface TwitterCardData {
  title: string;
  description: string;
  url: string;
  image?: string;
  card?: "summary" | "summary_large_image";
}

/**
 * Build Twitter Card metadata object for Next.js.
 */
export function buildTwitterCard(data: TwitterCardData) {
  return {
    card: data.card || "summary_large_image",
    title: truncateForSocial(data.title, 70),
    description: truncateForSocial(data.description, 200),
    images: data.image
      ? [data.image]
      : [`${SITE_URL}/og-image.png`],
  };
}

// ─── Security ───

/**
 * Truncate text for social media (prevents overly long URLs and text).
 */
function truncateForSocial(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 1) + "…";
}

/**
 * Sanitize a share URL to prevent open redirect.
 * Only allows URLs starting with the SITE_URL.
 */
export function sanitizeShareUrl(url: string): string {
  // Only allow URLs from our domain
  if (url.startsWith(SITE_URL)) return url;
  if (url.startsWith("/")) return `${SITE_URL}${url}`;
  // Reject external URLs
  return SITE_URL;
}

/**
 * Check if Web Share API is available.
 * This is a client-side check.
 */
export function isWebShareAvailable(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.share === "function";
}

/**
 * Build a share text that includes title and URL.
 */
export function buildShareText(title: string, url: string): string {
  return truncateForSocial(`${title} - ${SITE_NAME}`, 100) + " " + url;
}
