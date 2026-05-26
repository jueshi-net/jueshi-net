import { Metadata } from "next";
import { buildCanonical, buildTitle } from "@/lib/seo";
import FeedbackClient from "./feedback-client";

export const metadata: Metadata = {
  title: buildTitle("反馈与联系"),
  description: "向海外百宝箱提交反馈、问题或合作咨询。",
  alternates: { canonical: buildCanonical("/feedback") },
  openGraph: {
    title: buildTitle("反馈与联系"),
    description: "向海外百宝箱提交反馈、问题或合作咨询。",
    url: buildCanonical("/feedback"),
  },
};

export default function FeedbackPage() {
  return <FeedbackClient />;
}
