import type { Metadata } from "next";
import Link from "next/link";
import { Flag, ChevronRight, FileText, MessageSquare, AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { buildTitle, buildCanonical } from "@/lib/seo";
import { formatDateTime } from "@/lib/utils";
import JueshiV4PublicShell from "@/components/layout/JueshiV4PublicShell";
import BreadcrumbBar from "@/components/design-system/BreadcrumbBar";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: buildTitle("我的举报"),
  description: "查看您提交的举报记录和处理状态",
  alternates: { canonical: buildCanonical("/bbs/my-reports") },
  robots: { index: false, follow: false },
};

const REASON_LABELS: Record<string, string> = {
  spam: "垃圾广告",
  abuse: "辱骂攻击",
  harassment: "骚扰",
  illegal: "违法违规",
  other: "其他",
};

const STATUS_CONFIG: Record<string, { label: string; icon: typeof Clock; color: string }> = {
  pending: { label: "待处理", icon: Clock, color: "text-amber-600" },
  investigating: { label: "处理中", icon: AlertCircle, color: "text-blue-600" },
  resolved: { label: "已处理", icon: CheckCircle, color: "text-green-600" },
  dismissed: { label: "已驳回", icon: XCircle, color: "text-gray-500" },
};

export default async function MyReportsPage() {
  const session = await auth();

  if (!session?.user) {
    return (
      <JueshiV4PublicShell>
        <div className="min-h-screen bg-gray-50">
          <div className="bg-white border-b border-slate-200">
            <div className="max-w-[800px] mx-auto px-4 py-2.5">
              <BreadcrumbBar
                items={[
                  { title: "首页", href: "/" },
                  { title: "社区论坛", href: "/bbs" },
                  { title: "我的举报", current: true },
                ]}
              />
            </div>
          </div>
          <div className="max-w-[800px] mx-auto px-4 py-12">
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
              <h1 className="text-xl font-bold text-gray-900 mb-2">需要登录</h1>
              <p className="text-sm text-gray-500 mb-6">请登录后查看您的举报记录</p>
              <Link href="/login" className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-dark">
                登录
              </Link>
            </div>
          </div>
        </div>
      </JueshiV4PublicShell>
    );
  }

  let reports: Array<{
    id: string;
    reason: string;
    description: string | null;
    status: string;
    createdAt: Date;
    resolvedAt: Date | null;
    resolution: string | null;
    postId: string | null;
    postSlug: string | null;
    postTitle: string | null;
    postStatus: string | null;
    commentContent: string | null;
    commentStatus: string | null;
  }> = [];

  try {
    reports = await prisma.forumReport.findMany({
      where: { reporterId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        post: {
          select: { id: true, slug: true, title: true, status: true },
        },
        comment: {
          select: { id: true, content: true, status: true },
        },
      },
    }).then((r) => r.map((rep) => ({
      id: rep.id,
      reason: rep.reason,
      description: rep.description,
      status: rep.status,
      createdAt: rep.createdAt,
      resolvedAt: rep.resolvedAt,
      resolution: rep.resolution,
      postId: rep.post?.id || null,
      postSlug: rep.post?.slug || null,
      postTitle: rep.post?.title || null,
      postStatus: rep.post?.status || null,
      commentContent: rep.comment?.content || null,
      commentStatus: rep.comment?.status || null,
    })));
  } catch {
    reports = [];
  }

  return (
    <JueshiV4PublicShell>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-[800px] mx-auto px-4 py-2.5">
            <BreadcrumbBar
              items={[
                { title: "首页", href: "/" },
                { title: "社区论坛", href: "/bbs" },
                { title: "我的举报", current: true },
              ]}
            />
          </div>
        </div>

        <div className="max-w-[800px] mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center gap-2 mb-6">
            <Flag className="w-6 h-6 text-brand" />
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">我的举报</h1>
          </div>

          {reports.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <Flag className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500 mb-4">您还没有提交过举报</p>
              <Link href="/bbs" className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-dark">
                浏览论坛
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => {
                const statusConfig = STATUS_CONFIG[report.status] || STATUS_CONFIG.pending;
                const StatusIcon = statusConfig.icon;
                const postAccessible = report.postStatus !== "deleted" && report.postStatus !== null;

                return (
                  <div key={report.id} className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                            {REASON_LABELS[report.reason] || report.reason}
                          </span>
                          <span className={`inline-flex items-center gap-1 text-xs font-medium ${statusConfig.color}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {statusConfig.label}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">
                          提交时间：{formatDateTime(report.createdAt)}
                        </p>
                        {report.resolvedAt && (
                          <p className="text-xs text-gray-400">
                            处理时间：{formatDateTime(report.resolvedAt)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Report description */}
                    {report.description && (
                      <div className="mb-3 p-2.5 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">{report.description}</p>
                      </div>
                    )}

                    {/* Resolution */}
                    {report.resolution && (
                      <div className="mb-3 p-2.5 bg-green-50 rounded-lg border border-green-100">
                        <p className="text-xs font-medium text-green-700 mb-0.5">处理结果</p>
                        <p className="text-sm text-green-800">{report.resolution}</p>
                      </div>
                    )}

                    {/* Reported content */}
                    {report.postTitle ? (
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                        {postAccessible && report.postSlug ? (
                          <Link
                            href={`/bbs/${report.postSlug}`}
                            className="text-sm text-brand hover:underline truncate flex-1"
                          >
                            {report.postTitle}
                          </Link>
                        ) : (
                          <span className="text-sm text-gray-400 truncate flex-1">
                            {report.postTitle}（内容已不可访问）
                          </span>
                        )}
                        <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                      </div>
                    ) : report.commentContent ? (
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <MessageSquare className="w-4 h-4 text-gray-400 shrink-0" />
                        <span className="text-sm text-gray-500 truncate flex-1">
                          {report.commentContent.slice(0, 80)}
                          {report.commentContent.length > 80 ? "..." : ""}
                        </span>
                        {report.commentStatus === "deleted" && (
                          <span className="text-xs text-gray-400 shrink-0">已不可访问</span>
                        )}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}

          {/* Rules link */}
          <div className="mt-6 text-center">
            <Link
              href="/bbs/rules"
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand"
            >
              查看社区规则与举报说明
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </JueshiV4PublicShell>
  );
}
