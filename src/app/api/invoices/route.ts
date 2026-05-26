import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/invoices - List user's saved invoices
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const invoices = await prisma.linkItem.findMany({
      where: {
        userId: session.user.id as string,
        status: "saved_invoice",
      },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, description: true, createdAt: true },
    });

    const data = invoices.map(inv => ({
      id: inv.id,
      name: inv.title,
      createdAt: inv.createdAt.toISOString(),
      // Parse stored data from description field
      data: inv.description ? JSON.parse(inv.description) : null,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("List invoices error:", error);
    return NextResponse.json({ success: false, error: "查询失败" }, { status: 500 });
  }
}

// POST /api/invoices - Save an invoice
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, data } = body;

    if (!name || !data) {
      return NextResponse.json({ success: false, error: "名称和数据为必填" }, { status: 400 });
    }

    const invoice = await prisma.linkItem.create({
      data: {
        title: name,
        url: "#invoice-template",
        description: JSON.stringify(data),
        userId: session.user.id as string,
        status: "saved_invoice",
        categoryName: "发票模板",
      },
    });

    return NextResponse.json({ success: true, data: { id: invoice.id, name: invoice.title } });
  } catch (error) {
    console.error("Save invoice error:", error);
    return NextResponse.json({ success: false, error: "保存失败" }, { status: 500 });
  }
}

// DELETE /api/invoices?id=xxx - Delete saved invoice
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "缺少ID" }, { status: 400 });
    }

    await prisma.linkItem.delete({
      where: { id, userId: session.user.id as string },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete invoice error:", error);
    return NextResponse.json({ success: false, error: "删除失败" }, { status: 500 });
  }
}
