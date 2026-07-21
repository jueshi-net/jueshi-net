"use client";

import CanvasEditorFull from "../../canvas-editor-full";
import ToolWorkspaceShell from "@/components/tools/ToolWorkspaceShell";
import "../../canvas-print.css";

export default function CanvasTemplateNewPage() {
  return (
    <ToolWorkspaceShell title="新建画布模板"
      subtitle="可视化设计自定义单据模板"
    >
      <CanvasEditorFull />
    </ToolWorkspaceShell>
  );
}
