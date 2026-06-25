// GET  /api/template-studio/templates — list current user's templates (auth required)
// POST /api/template-studio/templates — create or update a template (auth required)
//
// STORAGE: JSON file (PARTIAL_STORAGE) — no Prisma model yet.
// File: process.cwd()/data/template-studio-templates.json
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { promises as fs } from "fs";
import path from "path";
import { validateTemplateConfig, type TemplateConfig } from "@/lib/template-studio/template-schema";
import { sanitizeTemplateName } from "@/lib/template-studio/template-sanitizer";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "template-studio-templates.json");

/** Read all templates from JSON file */
async function readAllTemplates(): Promise<TemplateConfig[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw) as TemplateConfig[];
  } catch {
    return [];
  }
}

/** Write all templates to JSON file */
async function writeAllTemplates(templates: TemplateConfig[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(templates, null, 2), "utf-8");
}

/** GET — list current user's templates */
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const userId = session.user.id;
  const all = await readAllTemplates();
  const userTemplates = all.filter(t => t.ownerId === userId);

  return NextResponse.json({ success: true, data: userTemplates });
}

/** POST — create or update a template */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const userId = session.user.id;
  const body = await req.json();
  const config = body.config as Partial<TemplateConfig>;

  if (!config) {
    return NextResponse.json({ error: "缺少 config 字段" }, { status: 400 });
  }

  // Sanitize template name
  if (config.name) {
    const nameResult = sanitizeTemplateName(config.name);
    if (!nameResult.clean) {
      return NextResponse.json(
        { error: `模板名称被拒绝: ${nameResult.errors.join(", ")}` },
        { status: 400 }
      );
    }
  }

  // Validate config
  const validation = validateTemplateConfig(config);
  if (!validation.valid) {
    return NextResponse.json(
      { error: `配置无效: ${validation.errors.join(", ")}` },
      { status: 400 }
    );
  }

  const all = await readAllTemplates();
  const now = new Date().toISOString();

  // Ensure ownerId is set to current user
  const template: TemplateConfig = {
    ...config,
    id: config.id || `user-${Date.now()}`,
    ownerId: userId,
    origin: "user",
    updatedAt: now,
    createdAt: config.createdAt || now,
  } as TemplateConfig;

  // Find existing template
  const idx = all.findIndex(t => t.id === template.id);

  if (idx >= 0) {
    // Update: verify ownership
    if (all[idx].ownerId !== userId) {
      return NextResponse.json({ error: "无权修改此模板" }, { status: 403 });
    }
    all[idx] = template;
  } else {
    // Create new
    all.push(template);
  }

  await writeAllTemplates(all);

  return NextResponse.json({ success: true, data: template });
}
