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

import { addProviderMember } from "@/modules/service-provider/application";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const disabled = await checkFeature();
  if (disabled) return disabled;
  const guard = await requireAuth();
  if (guard instanceof NextResponse) return guard;
  const userId = (guard as any).session.user.id;
  const role = (guard as any).session.user.role || "user";
  const { id } = await params;
  try {
    const { targetUserId, memberRole } = await req.json();
    const member = await addProviderMember(userId, role, id, targetUserId, memberRole);
    return NextResponse.json({ success: true, data: member }, { status: 201 });
  } catch (err) { return handleError(err); }
}
