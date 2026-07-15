import { Metadata } from "next";
import { Video } from "lucide-react";
import VideoScriptSopClient from "./video-script-sop-client";
import PublicLandingPageFrame from "@/components/templates/PublicLandingPageFrame";

export const metadata: Metadata = {
  title: "短视频 SOP 脚本生成器 | 绝世百宝箱",
  description: "AI 驱动的短视频引流 SOP 生成器，一键生成爆款钩子、口播文案、画面建议与标签策略。",
};

export default async function VideoScriptSopPage() {
  return (
    <PublicLandingPageFrame
      title="短视频 SOP 脚本生成器"
      description="AI 驱动的短视频引流 SOP 生成器，一键生成爆款钩子、口播文案、画面建议与标签策略。"
      icon={<Video className="w-6 h-6" />}
      variant="tool"
    >
      <VideoScriptSopClient />
    </PublicLandingPageFrame>
  );
}
