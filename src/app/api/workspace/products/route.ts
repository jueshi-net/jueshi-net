import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

// GET - list user's products (supports search & isActive filtering)
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const isActiveParam = searchParams.get("isActive");

    // Build where clause — field names match the Prisma ProductItem model
    // (model uses `name`, not nameZh/nameEn)
    const where: Prisma.ProductItemWhereInput = { userId: session.user.id };
    if (isActiveParam === "true") where.isActive = true;
    if (isActiveParam === "false") where.isActive = false;

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
        { hsCode: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const products = await prisma.productItem.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ success: true, products });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

// POST - create a product (persists all ProductItem fields)
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      sku,
      description,
      hsCode,
      unit,
      unitPrice,
      currency,
      netWeight,
      grossWeight,
      length,
      width,
      height,
      originCountry,
      material,
      usage,
      isActive,
    } = body;

    if (!name || !String(name).trim()) {
      return NextResponse.json({ success: false, error: "Product name is required" }, { status: 400 });
    }

    const product = await prisma.productItem.create({
      data: {
        userId: session.user.id,
        name: String(name).trim(),
        sku: sku ? String(sku).trim() : null,
        description: description ? String(description).trim() : null,
        hsCode: hsCode ? String(hsCode).trim() : null,
        unit: unit || "PCS",
        unitPrice: unitPrice ? parseFloat(unitPrice) : null,
        currency: currency || "USD",
        netWeight: netWeight ? parseFloat(netWeight) : null,
        grossWeight: grossWeight ? parseFloat(grossWeight) : null,
        length: length ? parseFloat(length) : null,
        width: width ? parseFloat(width) : null,
        height: height ? parseFloat(height) : null,
        originCountry: originCountry ? String(originCountry).trim() : null,
        material: material ? String(material).trim() : null,
        usage: usage ? String(usage).trim() : null,
        isActive: typeof isActive === "boolean" ? isActive : true,
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
