import TemplateStudioClient from "./template-studio-client";
import ToolWorkspaceShell from "@/components/tools/ToolWorkspaceShell";

export const dynamic = "force-dynamic";

export default function TemplateStudioListPage() {
  return (
    <ToolWorkspaceShell title="模板工作室"
      subtitle="创建和编辑结构化模板，生成商业发票、报价单等单据"
    >
      <TemplateStudioClient mode="list" />
    </ToolWorkspaceShell>
  );
}
