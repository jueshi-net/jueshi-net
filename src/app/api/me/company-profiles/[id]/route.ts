// GET /api/me/company-profiles/[id] — get single profile (auth + userId isolation)
// PUT /api/me/company-profiles/[id] — update profile (auth + userId isolation)
// DELETE /api/me/company-profiles/[id] — delete profile (auth + userId isolation)
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isActiveMember } from "@/lib/membership";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/** GET — get single company profile */
export async function GET(_req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const userId = session.user.id;
  const { id } = await params;

  const profile = await prisma.userCompanyProfile.findFirst({
    where: { id, userId },
  });

  if (!profile) return NextResponse.json({ error: "公司资料不存在或无权访问" }, { status: 404 });

  return NextResponse.json({ success: true, data: profile });
}

/** PUT — update company profile */
export async function PUT(req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const userId = session.user.id;
  const member = await isActiveMember();
  const { id } = await params;

  // Verify ownership
  const existing = await prisma.userCompanyProfile.findFirst({
    where: { id, userId },
  });
  if (!existing) return NextResponse.json({ error: "公司资料不存在或无权访问" }, { status: 404 });

  const body = await req.json();
  const {
    profileName, companyName, companyNameEn, contactName, phone,
    email, website, address, cityPostal, taxId, bankCnyInfo,
    bankUsdInfo, defaultCurrency, logoDataUrl, logoText, isDefault,
  } = body;

  // Validation
  if (companyName !== undefined) {
    if (companyName.length < 2) return NextResponse.json({ error: "公司名称至少 2 字" }, { status: 400 });
    if (companyName.length > 100) return NextResponse.json({ error: "公司名称最多 100 字" }, { status: 400 });
  }
  if (profileName !== undefined && profileName.length > 50) return NextResponse.json({ error: "资料名称最多 50 字" }, { status: 400 });

  // Logo restriction: only members can upload
  if (logoDataUrl !== undefined && logoDataUrl !== null && logoDataUrl !== existing.logoDataUrl) {
    if (!member) {
      return NextResponse.json(
        { error: "会员可上传 Logo，普通用户可使用文字 Logo" },
        { status: 403 }
      );
    }
    if (logoDataUrl.length > 500 * 1024) return NextResponse.json({ error: "Logo 图片不能超过 500KB" }, { status: 400 });
    if (logoDataUrl.includes("svg")) return NextResponse.json({ error: "不允许上传 SVG 格式 Logo" }, { status: 400 });
    if (logoDataUrl && !logoDataUrl.startsWith("data:")) return NextResponse.json({ error: "Logo 必须是上传的图片数据" }, { status: 400 });
  }

  // If setting as default, unset other defaults
  if (isDefault) {
    await prisma.userCompanyProfile.updateMany({
      where: { userId, isDefault: true, id: { not: id } },
      data: { isDefault: false },
    });
  }

  const updated = await prisma.userCompanyProfile.update({
    where: { id },
    data: {
      ...(profileName !== undefined && { profileName }),
      ...(companyName !== undefined && { companyName }),
      ...(companyNameEn !== undefined && { companyNameEn }),
      ...(contactName !== undefined && { contactName }),
      ...(phone !== undefined && { phone }),
      ...(email !== undefined && { email }),
      ...(website !== undefined && { website }),
      ...(address !== undefined && { address }),
      ...(cityPostal !== undefined && { cityPostal }),
      ...(taxId !== undefined && { taxId }),
      ...(bankCnyInfo !== undefined && { bankCnyInfo }),
      ...(bankUsdInfo !== undefined && { bankUsdInfo }),
      ...(defaultCurrency !== undefined && { defaultCurrency }),
      ...(logoDataUrl !== undefined && { logoDataUrl }),
      ...(logoText !== undefined && { logoText }),
      ...(isDefault !== undefined && { isDefault }),
    },
  });

  // Write history
  await prisma.userCompanyProfileHistory.create({
    data: {
      userId,
      profileId: id,
      snapshotJson: JSON.stringify(updated),
      action: logoDataUrl !== undefined ? "logo_update" : "update",
    },
  });

  return NextResponse.json({ success: true, data: updated });
}

/** DELETE — soft delete company profile */
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const userId = session.user.id;
  const { id } = await params;

  const existing = await prisma.userCompanyProfile.findFirst({
    where: { id, userId },
  });
  if (!existing) return NextResponse.json({ error: "公司资料不存在或无权访问" }, { status: 404 });

  await prisma.userCompanyProfile.delete({ where: { id } });

  return NextResponse.json({ success: true, message: "公司资料已删除" });
}
