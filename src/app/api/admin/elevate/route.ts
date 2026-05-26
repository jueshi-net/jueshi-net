import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

/**
 * TEMPORARY admin elevation endpoint.
 * Usage: POST /api/admin/elevate?secret=<ADMIN_SECRET>
 * Promotes the currently logged-in user to ADMIN role.
 * Remove this file after bootstrapping admin access.
 */
export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");

  // Hardcoded secret for one-time elevation (match ADMIN_SECRET in .env.production)
  const expectedSecret = process.env.ADMIN_SECRET || "CHANGE_ME_IN_PRODUCTION";

  if (secret !== expectedSecret) {
    return NextResponse.json({ success: false, error: "Invalid secret" }, { status: 403 });
  }

  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Not logged in" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  if (!userId) {
    return NextResponse.json({ success: false, error: "No user ID in session" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { role: "ADMIN" },
    select: { id: true, email: true, name: true, role: true },
  });

  return NextResponse.json({
    success: true,
    message: `User ${updated.email} promoted to ADMIN`,
    user: updated,
  });
}
