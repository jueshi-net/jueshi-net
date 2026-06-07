// GET /api/me/company-profiles — list all company profiles (auth required)
// POST /api/me/company-profiles — create new company profile (auth required)
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isActiveMember } from "@/lib/membership";

/** GET — list all company profiles for current user */
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const userId = session.user.id;

  const profiles = await prisma.userCompanyProfile.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ success: true, data: profiles });
}

/** POST — create new company profile */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const userId = session.user.id;
  const member = await isActiveMember();
  const body = await req.json();

  const {
    profileName, companyName, companyNameEn, contactName, phone,
    email, website, address, cityPostal, taxId, bankCnyInfo,
    bankUsdInfo, defaultCurrency, logoDataUrl, logoText, isDefault,
  } = body;

  // Validation
  if (!companyName || companyName.length < 2) return NextResponse.json({ error: "公司名称至少 2 字" }, { status: 400 });
  if (companyName.length > 100) return NextResponse.json({ error: "公司名称最多 100 字" }, { status: 400 });
  if (profileName && profileName.length > 50) return NextResponse.json({ error: "资料名称最多 50 字" }, { status: 400 });

  // Logo restriction: only members can upload
  if (logoDataUrl && !member) {
    return NextResponse.json(
      { error: "会员可上传 Logo，普通用户可使用文字 Logo" },
      { status: 403 }
    );
  }

  // Logo size limit: 500KB
  if (logoDataUrl && logoDataUrl.length > 500 * 1024) {
    return NextResponse.json({ error: "Logo 图片不能超过 500KB" }, { status: 400 });
  }

  // No SVG allowed
  if (logoDataUrl && logoDataUrl.includes("svg")) {
    return NextResponse.json({ error: "不允许上传 SVG 格式 Logo" }, { status: 400 });
  }

  // No external URLs allowed — must be data URL
  if (logoDataUrl && !logoDataUrl.startsWith("data:")) {
    return NextResponse.json({ error: "Logo 必须是上传的图片数据，不允许外链 URL" }, { status: 400 });
  }

  // If first profile, make it default
  const existingCount = await prisma.userCompanyProfile.count({ where: { userId } });
  const finalIsDefault = isDefault || existingCount === 0;

  // If setting as default, unset other defaults
  if (finalIsDefault) {
    await prisma.userCompanyProfile.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });
  }

  const profile = await prisma.userCompanyProfile.create({
    data: {
      userId,
      profileName: profileName || companyName,
      companyName,
      companyNameEn: companyNameEn || null,
      contactName: contactName || null,
      phone: phone || null,
      email: email || null,
      website: website || null,
      address: address || null,
      cityPostal: cityPostal || null,
      taxId: taxId || null,
      bankCnyInfo: bankCnyInfo || null,
      bankUsdInfo: bankUsdInfo || null,
      defaultCurrency: defaultCurrency || "USD",
      logoDataUrl: logoDataUrl || null,
      logoText: logoText || null,
      isDefault: finalIsDefault,
    },
  });

  // Write history
  await prisma.userCompanyProfileHistory.create({
    data: {
      userId,
      profileId: profile.id,
      snapshotJson: JSON.stringify(profile),
      action: "create",
    },
  });

  return NextResponse.json({ success: true, data: profile }, { status: 201 });
}
