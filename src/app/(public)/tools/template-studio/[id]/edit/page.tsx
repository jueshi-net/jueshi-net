import TemplateStudioClient from "../../template-studio-client";
import { PublicLandingPageFrame } from "@/components/templates/public/PublicLandingPageFrame";

export const dynamic = "force-dynamic";

export default async function TemplateStudioEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <PublicLandingPageFrame
      title="编辑模板"
      subtitle="修改自定义单据模板"
    >
      <TemplateStudioClient mode="edit" templateId={id} />
    </PublicLandingPageFrame>
  );
}
