import { Metadata } from "next";
import MemosClient from "./memos-client";

export const metadata: Metadata = {
  title: "备忘录 — 海外百宝箱",
  description: "你的私人备忘录",
};

export default function MemosPage() {
  return <MemosClient />;
}
