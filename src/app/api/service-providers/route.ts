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

import { prisma } from "@/lib/prisma";
import { createProviderApplication } from "@/modules/service-provider/application";

export async function GET() {
  const disabled = await checkFeature();
  if (disabled) return disabled;
  try {
    const providers = await prisma.serviceProvider.findMany({
      where: { status: "approved" },
      take: 50,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: providers });
  } catch (err) { return handleError(err); }
}

export async function POST(req: Request) {
  const disabled = await checkFeature();
  if (disabled) return disabled;
  const guard = await requireAuth();
  if (guard instanceof NextResponse) return guard;
  const userId = (guard as any).session.user.id;
  try {
    const body = await req.json();
    const provider = await createProviderApplication(userId, body);
    return NextResponse.json({ success: true, data: provider }, { status: 201 });
  } catch (err) { return handleError(err); }
}
