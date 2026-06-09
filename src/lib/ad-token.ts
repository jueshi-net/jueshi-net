import { createHmac, timingSafeEqual } from "crypto";

/**
 * Ad Render Token System
 * 
 * Tokens are HMAC-SHA256 signed payloads that prove:
 * 1. The server authorized this specific ad rendering
 * 2. The token is short-lived (default 10 minutes)
 * 3. The token is bound to a specific campaign/placement/creative combination
 * 
 * Format: base64url(payload) + "." + base64url(signature)
 * Where payload = JSON.stringify({ campaignId, placementKey, creativeId, exp })
 * 
 * The signing key is derived from AUTH_SECRET (or a dedicated AD_TOKEN_SECRET).
 */

const TOKEN_TTL_MS = 10 * 60 * 1000; // 10 minutes

function getSigningKey(): string {
  const key = process.env.AUTH_SECRET || process.env.AD_TOKEN_SECRET;
  if (!key) {
    throw new Error("AUTH_SECRET or AD_TOKEN_SECRET must be set for ad render tokens");
  }
  return key;
}

function base64urlEncode(data: string): string {
  return Buffer.from(data).toString("base64url");
}

function base64urlDecode(encoded: string): string {
  return Buffer.from(encoded, "base64url").toString("utf8");
}

export interface AdRenderTokenPayload {
  campaignId: string;
  placementKey: string;
  creativeId: string | null;
  exp: number; // expiry timestamp in ms
}

/**
 * Generate a signed ad render token.
 * Only callable from trusted server-side code (e.g., ad resolve API).
 */
export function generateAdRenderToken(
  campaignId: string,
  placementKey: string,
  creativeId: string | null
): string {
  const payload: AdRenderTokenPayload = {
    campaignId,
    placementKey,
    creativeId,
    exp: Date.now() + TOKEN_TTL_MS,
  };

  const payloadStr = JSON.stringify(payload);
  const encodedPayload = base64urlEncode(payloadStr);

  const signature = createHmac("sha256", getSigningKey())
    .update(encodedPayload)
    .digest("base64url");

  return `${encodedPayload}.${signature}`;
}

/**
 * Validate an ad render token.
 * Returns the decoded payload if valid, or null if invalid/expired/tampered.
 */
export function validateAdRenderToken(token: string): AdRenderTokenPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;

    const [encodedPayload, providedSignature] = parts;

    // Verify signature using timing-safe comparison
    const expectedSignature = createHmac("sha256", getSigningKey())
      .update(encodedPayload)
      .digest("base64url");

    const expectedBuf = Buffer.from(expectedSignature);
    const providedBuf = Buffer.from(providedSignature);

    if (expectedBuf.length !== providedBuf.length) return null;
    if (!timingSafeEqual(expectedBuf, providedBuf)) return null;

    // Decode payload
    const payloadStr = base64urlDecode(encodedPayload);
    const payload: AdRenderTokenPayload = JSON.parse(payloadStr);

    // Check expiry
    if (Date.now() > payload.exp) return null;

    return payload;
  } catch {
    return null;
  }
}
