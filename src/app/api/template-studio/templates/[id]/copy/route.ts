// POST /api/template-studio/templates/[id]/copy — copy a template (auth required)
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { promises as fs } from "fs";
import path from "path";
import type { TemplateConfig } from "@/lib/template-studio/template-schema";
import { sanitizeTemplateName } from "@/lib/template-studio/template-sanitizer";

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

/** POST — copy a template (official or user's own) */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const userId = session.user.id;
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const newName = body.name as string | undefined;

  const all = await readAllTemplates();

  // Find source template — could be in JSON storage or official templates
  let source: TemplateConfig | undefined = all.find(t => t.id === id);

  // If not in JSON storage, try official templates
  if (!source) {
    try {
      const { getOfficialTemplateById } = await import("@/lib/template-studio/official-templates");
      source = getOfficialTemplateById(id);
    } catch {
      // ignore
    }
  }

  if (!source) {
    return NextResponse.json({ error: "源模板不存在" }, { status: 404 });
  }

  // If source is a user template, verify ownership
  if (source.origin === "user" && source.ownerId && source.ownerId !== userId) {
    return NextResponse.json({ error: "无权复制此模板" }, { status: 403 });
  }

  // Sanitize new name
  const nameToUse = newName || `${source.name} (副本)`;
  const nameResult = sanitizeTemplateName(nameToUse);
  if (!nameResult.clean) {
    return NextResponse.json(
      { error: `模板名称被拒绝: ${nameResult.errors.join(", ")}` },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();
  const copy: TemplateConfig = {
    ...source,
    id: `user-${Date.now()}`,
    name: nameToUse,
    origin: "user",
    ownerId: userId,
    createdAt: now,
    updatedAt: now,
  };

  all.push(copy);
  await writeAllTemplates(all);

  return NextResponse.json({ success: true, data: copy }, { status: 201 });
}
