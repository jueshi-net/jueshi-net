import TemplateStudioClient from "../template-studio-client";
import { PublicLandingPageFrame } from "@/components/templates/public/PublicLandingPageFrame";

export const dynamic = "force-dynamic";

export default function TemplateStudioNewPage() {
  return (
    <PublicLandingPageFrame
      title="新建模板"
      subtitle="创建自定义单据模板"
    >
      <TemplateStudioClient mode="new" />
    </PublicLandingPageFrame>
  );
}
