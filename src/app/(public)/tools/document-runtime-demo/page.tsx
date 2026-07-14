import { Metadata } from "next";
import JueshiV4PublicShell from "@/components/layout/JueshiV4PublicShell";
import PublicLandingPageFrame from "@/components/templates/PublicLandingPageFrame";
import { Boxes } from "lucide-react";
import DocumentRuntimeDemoClient from "./document-runtime-demo-client";

export const metadata: Metadata = {
  title: "Document Runtime — 工具接入示范 | 绝世百宝箱",
  description: "展示 CustomFormShell 如何让个性化工具接入统一能力，同时保留各自的独立 UI。",
};

export default function DocumentRuntimeDemoPage() {
  return (
    <JueshiV4PublicShell>
      <PublicLandingPageFrame
        title="Document Runtime — 工具接入示范"
        description="统一底座 + 自由模板：个性化工具接入公共能力，保留独立 UI"
        icon={<Boxes className="w-6 h-6" />}
        variant="tool"
      >
        <DocumentRuntimeDemoClient />
      </PublicLandingPageFrame>
    </JueshiV4PublicShell>
  );
}
