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

import { rejectProvider } from "@/modules/service-provider/public";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const disabled = await checkFeature();
  if (disabled) return disabled;
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;
  const adminId = (guard as any).session.user.id;
  const { id } = await params;
  try {
    const { reason } = await req.json();
    if (!reason) return NextResponse.json({ success: false, error: "reason required" }, { status: 400 });
    const provider = await rejectProvider(adminId, id, reason);
    return NextResponse.json({ success: true, data: provider });
  } catch (err) { return handleError(err); }
}
