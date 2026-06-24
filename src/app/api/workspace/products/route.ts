import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET - list user's products
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const products = await prisma.productItem.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ products });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST - create a product
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, sku, description, hsCode, unit, unitPrice, currency } = body;

    if (!name) {
      return NextResponse.json({ error: "Product name is required" }, { status: 400 });
    }

    const product = await prisma.productItem.create({
      data: {
        userId: session.user.id,
        name,
        sku: sku || null,
        description: description || null,
        hsCode: hsCode || null,
        unit: unit || "PCS",
        unitPrice: unitPrice ? parseFloat(unitPrice) : null,
        currency: currency || "CNY",
      },
    });

    return NextResponse.json({ product });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
