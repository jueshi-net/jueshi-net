// POST /api/export/authorize
// Authorize an export request based on user's real role from DB.
// Returns allowed status, branding requirements, template style limits,
// and a short-lived signed token.

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getCurrentUserRole,
  authorizeExport,
  recordExport,
  generateExportToken,
  hashIP,
} from "@/lib/auth/permissions";

export async function POST(req: NextRequest) {
  const session = await auth();
  const role = await getCurrentUserRole();
  const userId = (session?.user as any)?.id || null;

  const body = await req.json();
  const {
    exportType = "png",
    documentType,
    removeBranding = false,
    templateStyle,
  } = body as {
    exportType?: "word" | "png" | "pdf";
    documentType?: string;
    removeBranding?: boolean;
    templateStyle?: string;
  };

  // Validate exportType
  if (!["word", "png", "pdf"].includes(exportType)) {
    return NextResponse.json(
      { error: "无效的导出类型" },
      { status: 400 }
    );
  }

  // Normal authorization flow (daily limit check)
  let result = await authorizeExport(
    role,
    exportType,
    documentType,
    removeBranding,
    templateStyle,
    userId
  );

  // If rejected due to daily limit, try using a coupon
  if (!result.allowed && userId && exportType === "word" && role === "user") {
    const { prisma } = await import("@/lib/prisma");
    const coupon = await prisma.userReward.findFirst({
      where: {
        userId,
        rewardType: "word_export_coupon",
        status: "active",
      },
      orderBy: { createdAt: "asc" },
    });

    if (coupon) {
      const couponResult = await prisma.$transaction(async (tx) => {
        const active = await tx.userReward.findUnique({ where: { id: coupon.id } });
        if (!active || active.status !== "active") return null;
        await tx.userReward.update({
          where: { id: coupon.id },
          data: { status: "used", usedAt: new Date() },
        });
        return { couponId: coupon.id };
      });

      if (couponResult) {
        const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "";
        const ua = req.headers.get("user-agent") || "";
        await recordExport(userId, exportType, documentType, ip ? hashIP(ip) : undefined, ua);

        const token = generateExportToken({
          userId, role, exportType, documentType,
          removeBranding: false, templateStyle: "standard" as const,
        });

        return NextResponse.json({
          allowed: true, role,
          mustShowBranding: true,
          allowedTemplateStyle: "standard" as const,
          remainingToday: 0,
          usedCoupon: true,
          token,
        });
      }
    }
  }

  if (!result.allowed) {
    let message = "导出被拒绝";
    if (role === "guest" && exportType === "word") {
      message = "Word 导出需要登录后使用";
    } else if (role === "user" && exportType === "word") {
      message = "免费用户每日 Word 导出次数已用完（3 次），升级会员可无限导出";
    } else if (!result.mustShowBranding && removeBranding) {
      message = "去除品牌标识为会员专属功能";
    } else if (result.allowedTemplateStyle === "standard" && templateStyle !== "standard") {
      message = "该模板风格为会员专属";
    }

    return NextResponse.json(
      { allowed: false, error: message, role, mustShowBranding: true, allowedTemplateStyle: "standard" as const },
      { status: 403 }
    );
  }

  // Record export usage (for Word daily limit tracking)
  if (userId && exportType === "word") {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "";
    const ua = req.headers.get("user-agent") || "";
    await recordExport(userId, exportType, documentType, ip ? hashIP(ip) : undefined, ua);
  }

  // Generate short-lived token
  const token = generateExportToken({
    userId,
    role,
    exportType,
    documentType,
    removeBranding: result.mustShowBranding ? false : removeBranding,
    templateStyle: result.allowedTemplateStyle,
  });

  return NextResponse.json({
    allowed: true,
    role,
    mustShowBranding: result.mustShowBranding,
    allowedTemplateStyle: result.allowedTemplateStyle,
    remainingToday: result.remainingToday,
    token,
  });
}
