import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Video } from "lucide-react";
import VideoScriptSopClient from "./video-script-sop-client";

export const metadata: Metadata = {
  title: "短视频 SOP 脚本生成器 | 海外百宝箱",
  description: "在线生成短视频/带货视频 SOP 脚本，支持钩子设计、痛点描述、解决方案、卖点提炼、画面建议、口播文案、字幕文案、CTA 引导。",
};

export default function VideoScriptSopPage() {
  return <VideoScriptSopClient />;
}
