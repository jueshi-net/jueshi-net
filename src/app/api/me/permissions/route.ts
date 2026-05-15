// GET /api/me/permissions
// Returns the current user's REAL permissions from the database.
// Unauthenticated users get guest permissions.
// Frontend should use this instead of localStorage.bxb_role.

import { NextResponse } from "next/server";
import { getCurrentUserRole, getUserLimits } from "@/lib/auth/permissions";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  const role = await getCurrentUserRole();
  const limits = getUserLimits(role);

  // Get points info (optional, don't break if fails)
  let pointsInfo = {};
  if (session?.user?.id) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { points: true },
      });
      if (user) {
        pointsInfo = { points: user.points };
      }
    } catch {
      // Ignore errors
    }
  }

  return NextResponse.json({
    authenticated: !!session?.user,
    role,
    limits: {
      memoMax: limits.maxMemos,
      companyProfilesMax: limits.maxCompanyProfiles,
      labelBatchMax: limits.labelBatchLimit,
      canUploadLogo: limits.canUploadLogo,
      canUseCustomStyle: limits.canUseCustomStyle,
      canRemoveBranding: limits.canRemoveBranding,
      canCloudDraft: limits.canSaveCloudDraft,
      canExportWord: limits.canExportWord,
      wordExportDailyLimit: limits.canExportWordDailyLimit,
    },
    ...pointsInfo,
  });
}
