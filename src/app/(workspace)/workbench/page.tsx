import type { Metadata } from "next";
import { buildCanonical, buildTitle } from "@/lib/seo";
import WorkbenchClient from "./workbench-client";

export const metadata: Metadata = {
  title: buildTitle("我的工作台"),
  description: "个人工作台：收藏工具、自定义导航、备忘录与快捷操作。",
  robots: { index: false, follow: false },
  alternates: { canonical: buildCanonical("/workbench") },
  openGraph: {
    title: buildTitle("我的工作台"),
    description: "个人工作台：收藏工具、自定义导航、备忘录与快捷操作。",
    url: buildCanonical("/workbench"),
  },
};

export default function WorkbenchPage() {
  return <WorkbenchClient />;
}
