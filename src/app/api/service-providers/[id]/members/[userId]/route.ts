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

import { removeProviderMember, updateProviderMemberRole } from "@/modules/service-provider/public";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string; userId: string }> }) {
  const disabled = await checkFeature();
  if (disabled) return disabled;
  const guard = await requireAuth();
  if (guard instanceof NextResponse) return guard;
  const currentUserId = (guard as any).session.user.id;
  const role = (guard as any).session.user.role || "user";
  const { id, userId } = await params;
  try {
    await removeProviderMember(currentUserId, role, id, userId);
    return NextResponse.json({ success: true });
  } catch (err) { return handleError(err); }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string; userId: string }> }) {
  const disabled = await checkFeature();
  if (disabled) return disabled;
  const guard = await requireAuth();
  if (guard instanceof NextResponse) return guard;
  const currentUserId = (guard as any).session.user.id;
  const role = (guard as any).session.user.role || "user";
  const { id, userId } = await params;
  try {
    const { memberRole } = await req.json();
    const updated = await updateProviderMemberRole(currentUserId, role, id, userId, memberRole);
    return NextResponse.json({ success: true, data: updated });
  } catch (err) { return handleError(err); }
}
