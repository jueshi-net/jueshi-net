import TemplateStudioClient from "../template-studio-client";
import ToolWorkspaceShell from "@/components/tools/ToolWorkspaceShell";

export const dynamic = "force-dynamic";

export default function TemplateStudioNewPage() {
  return (
    <ToolWorkspaceShell title="新建模板"
      subtitle="创建自定义单据模板"
    >
      <TemplateStudioClient mode="new" />
    </ToolWorkspaceShell>
  );
}
