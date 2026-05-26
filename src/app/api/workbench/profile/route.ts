// PATCH /api/workbench/profile — update user profile type

import { NextResponse } from "next/server";
import { requireLogin } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";
import { validateProfileType } from "@/lib/workbench/validation";

export async function PATCH(req: Request) {
  const res = await requireLogin();
  if ("error" in res) return res.error;

  const { session } = res;
  const userId = session.user.id;

  try {
    const body = await req.json();
    const { profileType } = body;

    if (profileType === undefined || profileType === null) {
      return NextResponse.json({ error: "profileType 不能为空" }, { status: 400 });
    }

    const validation = validateProfileType(profileType);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Use "none" or null for unselected
    const value = profileType === "none" ? null : profileType;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { profileType: value },
      select: { profileType: true },
    });

    return NextResponse.json({ profileType: user.profileType });
  } catch (error) {
    console.error("[Workbench Profile PATCH Error]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
