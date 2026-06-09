import { NextRequest, NextResponse } from "next/server";
import { generateAdRenderToken } from "@/lib/ad-token";

/**
 * POST /api/ads/test-generate-token
 * 
 * TEST-ONLY endpoint for generating ad render tokens.
 * Should be removed or protected in production.
 * 
 * Body:
 * {
 *   campaignId: string,
 *   placementKey: string,
 *   creativeId?: string | null
 * }
 */
export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { campaignId, placementKey, creativeId } = body;

  if (!campaignId || !placementKey) {
    return NextResponse.json(
      { error: "Missing required fields: campaignId, placementKey" },
      { status: 400 }
    );
  }

  try {
    const token = generateAdRenderToken(campaignId, placementKey, creativeId || null);
    return NextResponse.json({
      success: true,
      token,
      note: "This is a test endpoint. Remove or protect in production.",
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Failed to generate token: " + e.message },
      { status: 500 }
    );
  }
}
