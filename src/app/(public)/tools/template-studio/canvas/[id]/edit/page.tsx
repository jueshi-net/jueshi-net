"use client";

import CanvasEditorFull from "../../../canvas-editor-full";
import "../../../canvas-print.css";

export default function CanvasTemplateEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Use client-side rendering to get params
  return <CanvasEditClient params={params} />;
}

function CanvasEditClient({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  return <CanvasEditorFull templateId={id} />;
}

import React from "react";
