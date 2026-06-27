"use client";

import CanvasEditor from "../../canvas-editor";

export default function CanvasTemplateNewPage() {
  const handleSave = (template: any) => {
    console.log("Save template:", template);
    alert("模板已保存（MVP 演示）");
  };

  const handleExportPng = (template: any) => {
    console.log("Export PNG:", template);
    alert("PNG 导出（MVP 演示）");
  };

  return <CanvasEditor onSave={handleSave} onExportPng={handleExportPng} />;
}
