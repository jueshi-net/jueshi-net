import TemplateStudioClient from "./template-studio-client";
import PublicLandingPageFrame from "@/components/templates/PublicLandingPageFrame";
import { Palette } from "lucide-react";

export const dynamic = "force-dynamic";

export default function TemplateStudioListPage() {
  return (
    <PublicLandingPageFrame
      title="模板工作室"
      description="创建和编辑结构化模板，生成商业发票、报价单等单据"
      icon={<Palette className="w-6 h-6" />}
      variant="tool"
    >
      <TemplateStudioClient mode="list" />
    </PublicLandingPageFrame>
  );
}
