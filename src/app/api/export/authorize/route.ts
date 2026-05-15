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

  const result = await authorizeExport(
    role,
    exportType,
    documentType,
    removeBranding,
    templateStyle,
    userId
  );

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
