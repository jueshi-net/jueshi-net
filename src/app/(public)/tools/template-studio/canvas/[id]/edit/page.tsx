"use client";

import CanvasEditorFull from "../../../canvas-editor-full";
import ToolWorkspaceShell from "@/components/tools/ToolWorkspaceShell";
import "../../../canvas-print.css";

export default function CanvasTemplateEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Use client-side rendering to get params
  return (
    <ToolWorkspaceShell title="编辑画布模板"
      subtitle="修改可视化单据模板"
    >
      <CanvasEditClient params={params} />
    </ToolWorkspaceShell>
  );
}

function CanvasEditClient({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  return <CanvasEditorFull templateId={id} />;
}

import React from "react";
