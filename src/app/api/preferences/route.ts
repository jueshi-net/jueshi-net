import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { preferences: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ preferences: user.preferences || {} });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch preferences" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { theme, language, emailNotif, compactMode, itemsPerPage, defaultCategory } = body;

    const preferences = await prisma.userPreference.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        theme: theme || "system",
        language: language || "zh-CN",
        emailNotif: emailNotif !== undefined ? emailNotif : true,
        compactMode: compactMode || false,
        itemsPerPage: itemsPerPage || 20,
        defaultCategory: defaultCategory || null,
      },
      update: {
        ...(theme !== undefined && { theme }),
        ...(language !== undefined && { language }),
        ...(emailNotif !== undefined && { emailNotif }),
        ...(compactMode !== undefined && { compactMode }),
        ...(itemsPerPage !== undefined && { itemsPerPage }),
        ...(defaultCategory !== undefined && { defaultCategory }),
      },
    });

    return NextResponse.json({ preferences });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update preferences" },
      { status: 500 }
    );
  }
}
