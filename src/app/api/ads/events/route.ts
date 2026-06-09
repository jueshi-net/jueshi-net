import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createHash } from "crypto";

/**
 * POST /api/ads/events
 * Record an ad impression or click event.
 * 
 * Body:
 * {
 *   campaignId: string,
 *   placementKey: string,
 *   eventType: "impression" | "click",
 *   creativeId?: string,
 *   pageType?: string,
 *   pagePath?: string,
 *   userId?: string,
 *   sessionId?: string,
 *   country?: string,
 *   device?: string,
 *   referrer?: string,
 *   ip?: string,         // Will be hashed, not stored raw
 *   userAgent?: string,  // Will be hashed, not stored raw
 * }
 *
 * Rate limiting: Simple per-session counter (in-memory, resets on restart).
 * For production, use Redis or similar.
 */

// Simple in-memory rate limit: max 100 events per session per minute
const rateLimit = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(sessionId: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(sessionId);
  if (entry && now < entry.resetAt) {
    if (entry.count >= 100) return false;
    entry.count++;
    return true;
  }
  rateLimit.set(sessionId, { count: 1, resetAt: now + 60_000 });
  return true;
}

export async function POST(req: NextRequest) {
  // For now, allow anonymous calls (will be gated by placement config later)
  // In production, add API key validation or origin checks
  
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { campaignId, placementKey, eventType, creativeId, pageType, pagePath, userId, sessionId, country, device, referrer, ip, userAgent } = body;

  // Validate required fields
  if (!campaignId || !placementKey || !eventType) {
    return NextResponse.json({ error: "Missing required fields: campaignId, placementKey, eventType" }, { status: 400 });
  }

  // Validate eventType
  if (!["impression", "click"].includes(eventType)) {
    return NextResponse.json({ error: "eventType must be 'impression' or 'click'" }, { status: 400 });
  }

  // Validate campaign exists
  const campaign = await prisma.adCampaign.findUnique({ where: { id: campaignId } });
  if (!campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  // Validate placement exists
  const placement = await prisma.adPlacement.findUnique({ where: { key: placementKey } });
  if (!placement) {
    return NextResponse.json({ error: `Placement key '${placementKey}' not registered in AdPlacement table` }, { status: 400 });
  }

  // Validate creative if provided
  if (creativeId) {
    const creative = await prisma.adCreative.findUnique({ where: { id: creativeId } });
    if (!creative) {
      return NextResponse.json({ error: "Creative not found" }, { status: 404 });
    }
  }

  // Rate limit check
  const sid = sessionId || `anon_${req.headers.get("x-forwarded-for") || "unknown"}`;
  if (!checkRateLimit(sid)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  // Hash IP and User-Agent (never store raw)
  const ipHash = ip ? createHash("sha256").update(ip).digest("hex").slice(0, 16) : null;
  const userAgentHash = userAgent ? createHash("sha256").update(userAgent).digest("hex") : null;

  // Create event
  try {
    await prisma.adEvent.create({
      data: {
        campaignId,
        placementKey,
        creativeId: creativeId || null,
        eventType,
        pageType: pageType || null,
        pagePath: pagePath || null,
        userId: userId || null,
        sessionId: sessionId || null,
        country: country || null,
        device: device || null,
        referrer: referrer || null,
        ipHash,
        userAgentHash,
      },
    });

    // Increment campaign counter (sync)
    const incrementField = eventType === "impression" ? "impressions" : "clicks";
    await prisma.adCampaign.update({
      where: { id: campaignId },
      data: { [incrementField]: { increment: 1 } },
    });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: "Failed to record event" }, { status: 500 });
  }
}
