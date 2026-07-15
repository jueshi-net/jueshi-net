"use client";

import CanvasEditorFull from "../../canvas-editor-full";
import { PublicLandingPageFrame } from "@/components/templates/public/PublicLandingPageFrame";
import "../../canvas-print.css";

export default function CanvasTemplateNewPage() {
  return (
    <PublicLandingPageFrame
      title="新建画布模板"
      subtitle="可视化设计自定义单据模板"
    >
      <CanvasEditorFull />
    </PublicLandingPageFrame>
  );
}
