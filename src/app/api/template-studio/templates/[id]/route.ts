// GET    /api/template-studio/templates/[id] — get a single template (auth required)
// DELETE /api/template-studio/templates/[id] — delete a template (auth required, owner only)
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { promises as fs } from "fs";
import path from "path";
import type { TemplateConfig } from "@/lib/template-studio/template-schema";

const DATA_FILE = path.join(process.cwd(), "data", "template-studio-templates.json");

async function readAllTemplates(): Promise<TemplateConfig[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw) as TemplateConfig[];
  } catch {
    return [];
  }
}

async function writeAllTemplates(templates: TemplateConfig[]): Promise<void> {
  const dir = path.dirname(DATA_FILE);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(templates, null, 2), "utf-8");
}

/** GET — get a single template by ID */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { id } = await params;
  const all = await readAllTemplates();
  const template = all.find(t => t.id === id);

  if (!template) {
    return NextResponse.json({ error: "模板不存在" }, { status: 404 });
  }

  // Only owner can access user templates
  if (template.ownerId && template.ownerId !== session.user.id) {
    return NextResponse.json({ error: "无权访问此模板" }, { status: 403 });
  }

  return NextResponse.json({ success: true, data: template });
}

/** DELETE — delete a template (owner only) */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { id } = await params;
  const all = await readAllTemplates();
  const idx = all.findIndex(t => t.id === id);

  if (idx < 0) {
    return NextResponse.json({ error: "模板不存在" }, { status: 404 });
  }

  // Only owner can delete
  if (all[idx].ownerId !== session.user.id) {
    return NextResponse.json({ error: "无权删除此模板" }, { status: 403 });
  }

  // Cannot delete official templates
  if (all[idx].origin === "official") {
    return NextResponse.json({ error: "官方模板不可删除" }, { status: 403 });
  }

  all.splice(idx, 1);
  await writeAllTemplates(all);

  return NextResponse.json({ success: true, message: "模板已删除" });
}
