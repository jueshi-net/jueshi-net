import TemplateStudioClient from "../../template-studio-client";

export const dynamic = "force-dynamic";

export default async function TemplateStudioEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TemplateStudioClient mode="edit" templateId={id} />;
}
