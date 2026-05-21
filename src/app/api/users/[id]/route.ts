import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import * as bcrypt from "bcryptjs";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    if (session.user.id !== id && (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, name: true, email: true, image: true, role: true, createdAt: true,
      },
    });

    return NextResponse.json({ success: true, data: user });
  } catch {
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const isAdmin = (session.user as any).role === "ADMIN";

    // Admin can modify any user, regular users can only modify themselves
    if (!isAdmin && session.user.id !== id) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const updateData: Record<string, unknown> = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.subdomain !== undefined) updateData.subdomain = body.subdomain || null;
    if (body.image !== undefined) updateData.image = body.image;
    // Only admin can change role
    if (body.role !== undefined && isAdmin) updateData.role = body.role;
    if (body.password && body.password.length >= 6) {
      updateData.password = await bcrypt.hash(body.password, 10);
    }

    const user = await prisma.user.update({ where: { id }, data: updateData });
    return NextResponse.json({ success: true, data: user });
  } catch {
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    // Prevent self-deletion
    if (session.user.id === id) {
      return NextResponse.json({ success: false, error: "Cannot delete yourself" }, { status: 400 });
    }

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "User deleted" });
  } catch {
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}
