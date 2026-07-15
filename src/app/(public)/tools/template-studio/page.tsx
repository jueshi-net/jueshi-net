import TemplateStudioClient from "./template-studio-client";
import { PublicLandingPageFrame } from "@/components/templates/public/PublicLandingPageFrame";

export const dynamic = "force-dynamic";

export default function TemplateStudioListPage() {
  return (
    <PublicLandingPageFrame
      title="模板工作室"
      subtitle="创建和编辑结构化模板，生成商业发票、报价单等单据"
      variant="tool"
    >
      <TemplateStudioClient mode="list" />
    </PublicLandingPageFrame>
  );
}
