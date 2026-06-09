import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createHash } from "crypto";
import { validateAdRenderToken, AdRenderTokenPayload } from "@/lib/ad-token";

/**
 * POST /api/ads/events
 * Record an ad impression or click event.
 * 
 * REQUIRED: adRenderToken (server-generated, proves authorized rendering)
 * 
 * Body:
 * {
 *   adRenderToken: string,    // REQUIRED: signed token from server
 *   eventType: "impression" | "click",
 *   pageType?: string,
 *   pagePath?: string,
 *   userId?: string,
 *   sessionId?: string,
 *   country?: string,
 *   device?: string,
 *   referrer?: string,
 * }
 *
 * Security:
 * - Token must be valid, unexpired, and signed by server
 * - Token binds to specific campaign/placement/creative
 * - IP/UA are hashed, never stored raw
 * - Rate limited by token hash (not easily spoofable)
 */

// In-memory rate limit: max 100 events per token-hash per minute
const rateLimit = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(tokenHash: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(tokenHash);
  if (entry && now < entry.resetAt) {
    if (entry.count >= 100) return false;
    entry.count++;
    return true;
  }
  rateLimit.set(tokenHash, { count: 1, resetAt: now + 60_000 });
  return true;
}

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { adRenderToken, eventType, pageType, pagePath, userId, sessionId, country, device, referrer } = body;

  // 1. Token is REQUIRED
  if (!adRenderToken || typeof adRenderToken !== "string") {
    return NextResponse.json(
      { error: "Missing required field: adRenderToken" },
      { status: 401 }
    );
  }

  // 2. Validate and decode token
  const tokenPayload = validateAdRenderToken(adRenderToken);
  if (!tokenPayload) {
    return NextResponse.json(
      { error: "Invalid or expired ad render token" },
      { status: 403 }
    );
  }

  const { campaignId, placementKey, creativeId: tokenCreativeId } = tokenPayload;

  // 3. Validate eventType
  if (eventType !== "impression" && eventType !== "click") {
    return NextResponse.json(
      { error: "eventType must be 'impression' or 'click'" },
      { status: 400 }
    );
  }

  // 4. Validate campaign exists and is active
  const campaign = await prisma.adCampaign.findUnique({ where: { id: campaignId } });
  if (!campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }
  if (!campaign.isActive) {
    return NextResponse.json({ error: "Campaign is not active" }, { status: 403 });
  }

  // 5. Validate placement exists and is active
  const placement = await prisma.adPlacement.findUnique({ where: { key: placementKey } });
  if (!placement) {
    return NextResponse.json(
      { error: `Placement key '${placementKey}' not registered in AdPlacement table` },
      { status: 400 }
    );
  }
  if (!placement.isActive) {
    return NextResponse.json({ error: "Placement is not active" }, { status: 403 });
  }

  // 6. Validate campaign contains this placement key
  if (!campaign.placements.includes(placementKey)) {
    return NextResponse.json(
      { error: `Placement key '${placementKey}' is not associated with this campaign` },
      { status: 403 }
    );
  }

  // 7. Validate creative if token includes one
  const creativeId = tokenCreativeId;
  if (creativeId) {
    const creative = await prisma.adCreative.findUnique({ where: { id: creativeId } });
    if (!creative) {
      return NextResponse.json({ error: "Creative not found" }, { status: 404 });
    }
    if (!creative.isActive) {
      return NextResponse.json({ error: "Creative is not active" }, { status: 403 });
    }
    // Creative must belong to the campaign
    if (creative.campaignId !== campaignId) {
      return NextResponse.json(
        { error: "Creative does not belong to this campaign" },
        { status: 403 }
      );
    }
  }

  // 8. Click event must match token's exact campaign/placement/creative
  if (eventType === "click") {
    const bodyCreativeId = body.creativeId;
    if (bodyCreativeId && bodyCreativeId !== tokenCreativeId) {
      return NextResponse.json(
        { error: "Click creativeId does not match token" },
        { status: 403 }
      );
    }
  }

  // 9. Rate limit by token hash (harder to spoof than session ID)
  const tokenHash = createHash("sha256").update(adRenderToken).digest("hex").slice(0, 16);
  if (!checkRateLimit(tokenHash)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  // 10. Hash IP and User-Agent (never store raw)
  const rawIp = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || null;
  const rawUa = req.headers.get("user-agent") || null;
  const ipHash = rawIp ? createHash("sha256").update(rawIp).digest("hex").slice(0, 16) : null;
  const userAgentHash = rawUa ? createHash("sha256").update(rawUa).digest("hex") : null;

  // 11. Create event
  try {
    await prisma.adEvent.create({
      data: {
        campaignId,
        placementKey,
        creativeId,
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
    console.error("[AdEvent] Failed to record event:", e);
    return NextResponse.json({ error: "Failed to record event" }, { status: 500 });
  }
}
