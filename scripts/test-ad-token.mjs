#!/usr/bin/env node
/**
 * Local Ad Render Token Generator
 * 
 * Usage:
 *   node scripts/test-ad-token.mjs <campaignId> <placementKey> [creativeId]
 * 
 * This script reads AUTH_SECRET from .env.local and generates valid
 * adRenderTokens for testing the AdEvent API.
 * 
 * NEVER deploy this script to production.
 */

import { createHmac } from "crypto";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Parse .env.local
const envPath = resolve(__dirname, "../.env.local");
let authSecret = process.env.AUTH_SECRET;
if (!authSecret) {
  try {
    const envContent = readFileSync(envPath, "utf8");
    for (const line of envContent.split("\n")) {
      const [key, ...rest] = line.split("=");
      if (key?.trim() === "AUTH_SECRET") {
        authSecret = rest.join("=").trim().replace(/^["']|["']$/g, "");
        break;
      }
    }
  } catch {
    console.error("Error: AUTH_SECRET not found in environment or .env.local");
    process.exit(1);
  }
}

if (!authSecret) {
  console.error("Error: AUTH_SECRET is not set");
  process.exit(1);
}

const [campaignId, placementKey, creativeId] = process.argv.slice(2);

if (!campaignId || !placementKey) {
  console.error("Usage: node scripts/test-ad-token.mjs <campaignId> <placementKey> [creativeId]");
  process.exit(1);
}

const TOKEN_TTL_MS = 10 * 60 * 1000; // 10 minutes

const payload = JSON.stringify({
  campaignId,
  placementKey,
  creativeId: creativeId || null,
  exp: Date.now() + TOKEN_TTL_MS,
});

const encodedPayload = Buffer.from(payload).toString("base64url");
const signature = createHmac("sha256", authSecret).update(encodedPayload).digest("base64url");
const token = `${encodedPayload}.${signature}`;

console.log(`=== Ad Render Token ===`);
console.log(`Campaign:    ${campaignId}`);
console.log(`Placement:   ${placementKey}`);
console.log(`Creative:    ${creativeId || "(none)"}`);
console.log(`Expires:     ${new Date(Date.now() + TOKEN_TTL_MS).toISOString()}`);
console.log(`Token:\n${token}`);
console.log(`========================`);
console.log(`\nUse with: curl -X POST http://127.0.0.1:3000/api/ads/events \\`);
console.log(`  -H 'Content-Type: application/json' \\`);
console.log(`  -d '{\"adRenderToken\":\"${token}\",\"eventType\":\"impression\",\"pageType\":\"test\",\"pagePath\":\"/test\"}'`);
