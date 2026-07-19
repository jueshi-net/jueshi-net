import type { Metadata } from "next";
import JueshiV4PublicShell from "@/components/layout/JueshiV4PublicShell";
import { BreadcrumbBar } from "@/components/design-system/BreadcrumbBar";
import { MyBadgesClient } from "@/components/bbs/my-badges-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "我的勋章 - 社区",
  robots: { index: false, follow: false },
};

export default function MyBadgesPage() {
  return (
    <JueshiV4PublicShell>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-[1200px] mx-auto px-4 py-2.5">
            <BreadcrumbBar
              items={[
                { title: "论坛", href: "/bbs" },
                { title: "我的勋章" },
              ]}
            />
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto px-4 py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">我的勋章</h1>
            <p className="text-sm text-slate-500">
              通过参与社区活动获得勋章。每个勋章代表你在社区中的一次成就。
            </p>
          </div>

          <MyBadgesClient />
        </div>
      </div>
    </JueshiV4PublicShell>
  );
}
