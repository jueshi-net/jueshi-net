import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  return { session };
}

export async function requireAdmin() {
  const result = await requireAuth();
  if (result instanceof NextResponse) return result;

  const { session } = result;
  if ((session.user as any).role?.toUpperCase() !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }
  return { session };
}
