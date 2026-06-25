// GET /api/auth/me — check if current user is authenticated
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ authenticated: false });
  }
  return NextResponse.json({
    authenticated: true,
    userId: session.user.id,
    email: session.user.email,
    role: session.user.role,
  });
}
