#!/usr/bin/env node
/**
 * Generate ad render token on VPS using production AUTH_SECRET.
 * Usage: NODE_ENV=production node scripts/vps-ad-token.mjs <campId> <placementKey> [creativeId]
 */
import dotenv from 'dotenv';
dotenv.config({ path: '.env.production' });
import { createHmac } from 'crypto';

const [campaignId, placementKey, creativeId] = process.argv.slice(2);
if (!campaignId || !placementKey) {
  console.error('Usage: node scripts/vps-ad-token.mjs <campaignId> <placementKey> [creativeId]');
  process.exit(1);
}

const TOKEN_TTL_MS = 10 * 60 * 1000;
const key = process.env.AUTH_SECRET || process.env.AD_TOKEN_SECRET;
if (!key) { console.error('AUTH_SECRET not set'); process.exit(1); }

const payload = JSON.stringify({ campaignId, placementKey, creativeId: creativeId || null, exp: Date.now() + TOKEN_TTL_MS });
const encodedPayload = Buffer.from(payload).toString('base64url');
const signature = createHmac('sha256', key).update(encodedPayload).digest('base64url');
const token = `${encodedPayload}.${signature}`;

console.log(`Campaign:    ${campaignId.slice(0, 8)}...${campaignId.slice(-6)}`);
console.log(`Placement:   ${placementKey}`);
console.log(`Creative:    ${creativeId ? creativeId.slice(0, 8) + '...' + creativeId.slice(-6) : '(none)'}`);
console.log(`Expires:     ${new Date(Date.now() + TOKEN_TTL_MS).toISOString()}`);
console.log(`Token:\n${token}`);
