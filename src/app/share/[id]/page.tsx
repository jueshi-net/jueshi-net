import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Share2, ExternalLink, Clock, Tag } from "lucide-react";

interface SharePageProps {
  params: Promise<{ id: string }>;
}

export default async function SharePage({ params }: SharePageProps) {
  const { id } = await params;

  const link = await prisma.linkItem.findUnique({
    where: { id },
  });

  if (!link) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  const shareUrl = `${baseUrl}/share/${id}`;
  const encodedUrl = encodeURIComponent(link.url);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* 分享卡片 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          {/* 顶部渐变 */}
          <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
            <Share2 className="h-12 w-12 text-white" />
          </div>

          {/* 内容 */}
          <div className="p-6">
            <h1 className="text-xl font-bold mb-2">{link.title}</h1>
            {link.description && (
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                {link.description}
              </p>
            )}

            {/* 链接信息 */}
            <div className="space-y-2 mb-6 text-sm">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <ExternalLink className="h-4 w-4" />
                <span className="truncate">{link.url}</span>
              </div>
              {link.categoryName && (
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <Tag className="h-4 w-4" />
                  <span>{link.categoryName}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <Clock className="h-4 w-4" />
                <span>{new Date(link.createdAt).toLocaleDateString("zh-CN")}</span>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="space-y-3">
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-3 px-4 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors"
              >
                访问链接
              </a>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl);
                }}
                className="block w-full py-3 px-4 bg-gray-100 dark:bg-gray-700 text-center rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                复制分享链接
              </button>
            </div>
          </div>
        </div>

        {/* 底部品牌 */}
        <p className="text-center text-xs text-gray-500 mt-4">
          来自 喜熊链接导航
        </p>
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';
