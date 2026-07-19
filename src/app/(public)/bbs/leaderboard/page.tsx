import type { Metadata } from "next";
import JueshiV4PublicShell from "@/components/layout/JueshiV4PublicShell";
import { BreadcrumbBar } from "@/components/design-system/BreadcrumbBar";
import { LeaderboardClient } from "@/components/bbs/leaderboard-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "社区排行榜 - 绝世百宝箱",
  description: "查看社区最活跃、最有贡献的成员排行",
  robots: { index: true, follow: true },
};

export default function LeaderboardPage() {
  return (
    <JueshiV4PublicShell>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-[1200px] mx-auto px-4 py-2.5">
            <BreadcrumbBar
              items={[
                { title: "论坛", href: "/bbs" },
                { title: "排行榜" },
              ]}
            />
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto px-4 py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">社区排行榜</h1>
            <p className="text-sm text-slate-500">
              展示社区中最活跃、最有贡献的成员。排行榜每小时更新一次。
            </p>
          </div>

          <LeaderboardClient />
        </div>
      </div>
    </JueshiV4PublicShell>
  );
}
