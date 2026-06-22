// POST /api/admin/badges/[id]/icon — upload badge icon (admin-only)
// Security:
//   - admin-only (requireAdmin)
//   - allowed types: png, jpg, jpeg, webp (NO svg, NO html, NO js, NO exe, NO php)
//   - max size: 512KB
//   - random filename (crypto.randomUUID)
//   - stored in uploads/badges/
//   - returns URL path, not absolute server path
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const ALLOWED_EXTS = new Set(["png", "jpg", "jpeg", "webp"]);
const MAX_SIZE = 512 * 1024; // 512KB

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const res = await requireAdmin();
  if ("error" in res) return res.error;

  try {
    const { id } = await params;
    const existing = await prisma.userBadge.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: "勋章不存在" }, { status: 404 });
    }

    const formData = await req.formData();
    const file = formData.get("icon") as File | null;
    if (!file) {
      return NextResponse.json({ success: false, error: "请选择图标文件" }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ success: false, error: "文件大小不能超过 512KB" }, { status: 400 });
    }

    // Validate MIME type
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { success: false, error: "仅支持 PNG、JPG、WebP 格式（不允许 SVG）" },
        { status: 400 }
      );
    }

    // Validate extension
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!ALLOWED_EXTS.has(ext)) {
      return NextResponse.json(
        { success: false, error: "文件扩展名不被允许" },
        { status: 400 }
      );
    }

    // Generate random filename
    const randomName = `${randomUUID()}.${ext}`;
    const uploadDir = join(process.cwd(), "public", "uploads", "badges");
    await mkdir(uploadDir, { recursive: true });

    const filePath = join(uploadDir, randomName);
    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    // Return relative URL path (not absolute server path)
    const iconUrl = `/uploads/badges/${randomName}`;

    // Update badge with icon URL
    await prisma.userBadge.update({
      where: { id },
      data: { iconText: iconUrl },
    });

    return NextResponse.json({ success: true, iconUrl });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
