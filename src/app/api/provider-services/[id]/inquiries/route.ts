import { NextResponse } from "next/server";
import { requireAuth, requireAdmin } from "@/lib/auth-guard";
import { isFeatureEnabled } from "@/platform";

async function checkFeature() {
  if (!isFeatureEnabled("FEATURE_SERVICE_PROVIDER")) {
    return NextResponse.json({ success: false, error: "Feature disabled" }, { status: 503 });
  }
  return null;
}

function handleError(err: unknown) {
  const msg = err instanceof Error ? err.message : "Internal error";
  if (msg.startsWith("Forbidden")) return NextResponse.json({ success: false, error: msg }, { status: 403 });
  if (msg.includes("not found")) return NextResponse.json({ success: false, error: msg }, { status: 404 });
  if (msg.includes("Invalid") || msg.includes("Cannot")) return NextResponse.json({ success: false, error: msg }, { status: 409 });
  return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
}

import { createServiceInquiry } from "@/modules/service-provider/public";
import { processServiceProviderOutbox } from "@/modules/service-provider/public";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const disabled = await checkFeature();
  if (disabled) return disabled;
  const guard = await requireAuth();
  if (guard instanceof NextResponse) return guard;
  const userId = (guard as any).session.user.id;
  const { id } = await params;
  try {
    const body = await req.json();
    const result = await createServiceInquiry(userId, {
      providerId: body.providerId || id,
      serviceId: id,
      sourceType: body.sourceType || "direct",
      sourceId: body.sourceId,
      message: body.message,
      requestId: body.requestId,
    });
    // Outbox is processed by the standalone worker (scripts/outbox-worker-preview.mjs)
    // which writes EventLog + calls notification adapter before marking PROCESSED
    return NextResponse.json(
      { success: true, data: result },
      { status: result.idempotentReplay ? 200 : 201 }
    );
  } catch (err) { return handleError(err); }
}
