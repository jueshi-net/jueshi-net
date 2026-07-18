import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, Pin, MessageCircle, Lightbulb } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { buildTitle, buildCanonical } from "@/lib/seo";
import PostForm from "@/components/bbs/post-form";
import { redirect } from "next/navigation";
import JueshiV4PublicShell from "@/components/layout/JueshiV4PublicShell";
import BreadcrumbBar from "@/components/design-system/BreadcrumbBar";
import { ForumEmptyState } from "@/components/community/forum-empty-state";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: buildTitle("发布新帖"),
  description: "在绝世百宝箱社区发布新帖子",
  alternates: { canonical: buildCanonical("/bbs/new") },
  robots: {
    index: false,
    follow: false,
  },
};

async function getActiveCategories() {
  try {
    const cats = await prisma.forumCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        key: true,
        name: true,
        iconText: true,
      },
    });
    return cats;
  } catch {
    return [];
  }
}

export default async function NewPostPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/bbs/new");
  }

  const params = await searchParams;
  const initialTitle = typeof params.title === "string" ? params.title : "";
  const initialContent = typeof params.body === "string" ? params.body : "";
  const initialCategoryKey = typeof params.category === "string" ? params.category : "";
  const toolContext = typeof params.toolContext === "string" ? params.toolContext : "";

  const categories = await getActiveCategories();

  if (categories.length === 0) {
    return (
      <JueshiV4PublicShell>
        <ForumEmptyState variant="no-categories" />
      </JueshiV4PublicShell>
    );
  }

  return (
    <JueshiV4PublicShell>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-[1000px] mx-auto px-4 py-4">
            <div className="mb-3">
              <BreadcrumbBar
                items={[
                  { title: "首页", href: "/" },
                  { title: "社区论坛", href: "/bbs" },
                  { title: "发布新帖", current: true },
                ]}
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand/5 rounded-full text-xs text-brand border border-brand/10">
                <Sparkles className="w-3.5 h-3.5" />
                <span>发布新帖</span>
              </div>
              <h1 className="text-xl md:text-2xl font-extrabold text-gray-900">
                发布新帖
              </h1>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              选择分类 · 填写标题和内容 · 提交后等待审核
            </p>
          </div>
        </div>

        <div className="max-w-[1000px] mx-auto px-4 py-6 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
            {/* Main form area */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 md:p-7 shadow-sm">
              <PostForm
                categories={categories}
                initialTitle={initialTitle}
                initialContent={initialContent}
                initialCategoryKey={initialCategoryKey}
                toolContext={toolContext}
              />
            </div>

            {/* Sidebar: posting rules */}
            <aside className="hidden lg:block">
              <div className="sticky top-20 space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <h3 className="text-sm font-bold text-amber-800 mb-2 inline-flex items-center gap-1.5">
                    <Pin className="w-4 h-4" />
                    发帖须知
                  </h3>
                  <ul className="text-xs text-amber-700 space-y-1.5">
                    <li>• 标题 5-80 字</li>
                    <li>• 内容 10-3000 字（纯文本）</li>
                    <li>• 普通用户发帖需<strong>审核</strong>后展示</li>
                    <li>• 管理员帖子直接发布</li>
                    <li>• 每日最多发布 5 条</li>
                  </ul>
                </div>

                {/* Community Rules Link */}
                <div className="bg-blue-50 rounded-xl border border-blue-100 p-3">
                  <p className="text-xs font-medium text-blue-700 mb-1">
                    社区规则
                  </p>
                  <p className="text-xs text-blue-600 mb-2">
                    发帖前请阅读社区规则，了解发帖规范、禁止内容和外链政策。
                  </p>
                  <Link
                    href="/bbs/rules"
                    className="text-xs text-brand font-medium hover:underline inline-flex items-center gap-1"
                  >
                    查看完整社区规则 →
                  </Link>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <h3 className="text-sm font-bold text-gray-900 mb-2 inline-flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4 text-brand" />
                    社区规则
                  </h3>
                  <ul className="text-xs text-gray-500 space-y-1.5">
                    <li>• 禁止广告、灰产、引战</li>
                    <li>• 禁止人身攻击</li>
                    <li>• 转载请注明出处</li>
                    <li>• 违规帖子将被删除</li>
                  </ul>
                  <Link href="/bbs" className="text-xs text-brand hover:underline mt-2 inline-block">
                    查看完整规则 →
                  </Link>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <h3 className="text-sm font-bold text-gray-900 mb-2 inline-flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-brand" />
                    发帖小贴士
                  </h3>
                  <ul className="text-xs text-gray-500 space-y-1.5">
                    <li>• 选择合适的分类能让更多人看到</li>
                    <li>• 标题简洁明了，概括内容</li>
                    <li>• 内容详细，方便他人回复</li>
                    <li>• 发布后可在帖子页编辑</li>
                  </ul>
                </div>
              </div>
            </aside>

            {/* Mobile rules (below form) */}
            <div className="lg:hidden">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <h3 className="text-sm font-bold text-amber-800 mb-2 inline-flex items-center gap-1.5">
                  <Pin className="w-4 h-4" />
                  发帖须知
                </h3>
                <ul className="text-xs text-amber-700 space-y-1">
                  <li>• 标题 5-80 字，内容 10-3000 字</li>
                  <li>• 普通用户发帖需审核后展示</li>
                  <li>• 禁止广告、灰产、引战内容</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </JueshiV4PublicShell>
  );
}
