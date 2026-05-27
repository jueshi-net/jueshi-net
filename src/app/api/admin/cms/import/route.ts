import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import fs from "fs";
import path from "path";

// ─── CMS Bulk Import API ───
// POST /api/admin/cms/import
// Body: { items: [{ title, slug, content, category: "topics"|"destinations", tags?: [], excerpt?: "" }] }
// Writes Markdown files with frontmatter to src/content/{category}/

const CONTENT_ROOT = path.join(process.cwd(), "src/content");

const MAX_ITEMS = 50; // 防爆防护：单次最多 50 条
const MAX_CONTENT_LENGTH = 50000; // 单篇内容上限 50KB

// 合法分类与对应物理目录
const CATEGORY_DIRS: Record<string, string> = {
  topics: "topics",
  destinations: "countries",
};

function escapeFrontmatter(value: string): string {
  // gray-matter 安全：双引号转义，防止 frontmatter 破裂
  return value.replace(/"/g, '\\"').replace(/\n/g, " ");
}

function buildMarkdown(item: {
  title: string;
  slug: string;
  content: string;
  tags?: string[];
  excerpt?: string;
  category?: string;
}): string {
  const tags = item.tags?.length ? item.tags.join(", ") : "";
  const excerpt = item.excerpt || "";

  return `---
title: "${escapeFrontmatter(item.title)}"
slug: "${escapeFrontmatter(item.slug)}"
excerpt: "${escapeFrontmatter(excerpt)}"
tags: [${tags}]
---

${item.content.trim()}
`;
}

export async function POST(req: NextRequest) {
  const session = await auth();

  // ── 鉴权：仅 admin ──
  if (!session?.user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const role = (session.user as any).role || "";
  if (!["管理员", "ADMIN", "admin"].includes(role)) {
    return NextResponse.json({ error: "无权访问" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const items: Array<{
      title: string;
      slug: string;
      content: string;
      category: string;
      tags?: string[];
      excerpt?: string;
    }> = body.items || [];

    // ── 防爆防护 ──
    if (items.length === 0) {
      return NextResponse.json({ error: "items 数组不能为空" }, { status: 400 });
    }
    if (items.length > MAX_ITEMS) {
      return NextResponse.json(
        { error: `单次最多导入 ${MAX_ITEMS} 条，当前 ${items.length} 条`, limit: MAX_ITEMS },
        { status: 413 }
      );
    }

    const results: { success: string[]; failed: Array<{ slug: string; reason: string }> } = {
      success: [],
      failed: [],
    };

    for (const item of items) {
      try {
        // 校验必填字段
        if (!item.title?.trim()) {
          results.failed.push({ slug: item.slug || "(unknown)", reason: "缺少 title" });
          continue;
        }
        if (!item.slug?.trim()) {
          results.failed.push({ slug: "(auto-generated)", reason: "缺少 slug" });
          continue;
        }
        if (!item.content?.trim()) {
          results.failed.push({ slug: item.slug, reason: "缺少 content" });
          continue;
        }

        // 内容长度检查
        if (item.content.length > MAX_CONTENT_LENGTH) {
          results.failed.push({ slug: item.slug, reason: `内容超长 (${item.content.length} > ${MAX_CONTENT_LENGTH})` });
          continue;
        }

        // 确定目标目录
        const category = item.category || "topics";
        const targetDir = CATEGORY_DIRS[category];
        if (!targetDir) {
          results.failed.push({ slug: item.slug, reason: `非法分类: ${category}` });
          continue;
        }

        const dirPath = path.join(CONTENT_ROOT, targetDir);
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true });
        }

        const filePath = path.join(dirPath, `${item.slug}.md`);

        // 生成 Markdown 并写入
        const md = buildMarkdown(item);
        fs.writeFileSync(filePath, md, "utf-8");

        results.success.push(item.slug);
      } catch (err: any) {
        results.failed.push({ slug: item.slug || "(unknown)", reason: err.message || "写入失败" });
      }
    }

    return NextResponse.json({
      success: true,
      imported: results.success.length,
      failed: results.failed.length,
      slugs: results.success,
      errors: results.failed,
    });
  } catch (err: any) {
    console.error("[POST /api/admin/cms/import]", err);
    return NextResponse.json({ error: "导入失败", details: err.message }, { status: 500 });
  }
}
