import { Metadata } from "next";
import { buildCanonical, buildTitle } from "@/lib/seo";
import FeedbackClient from "./feedback-client";
import JueshiV4PublicShell from "@/components/layout/JueshiV4PublicShell";
import { PublicLandingPageFrame } from "@/components/templates/public/PublicLandingPageFrame";

export const metadata: Metadata = {
  title: buildTitle("反馈与联系"),
  description: "向绝世百宝箱提交反馈、问题或合作咨询。",
  alternates: { canonical: buildCanonical("/feedback") },
  openGraph: {
    title: buildTitle("反馈与联系"),
    description: "向绝世百宝箱提交反馈、问题或合作咨询。",
    url: buildCanonical("/feedback"),
  },
};

export default function FeedbackPage() {
  return (
    <JueshiV4PublicShell>
      <PublicLandingPageFrame
        title="反馈与联系"
        subtitle="向绝世百宝箱提交反馈、问题或合作咨询"
        variant="form"
      >
        <FeedbackClient />
      </PublicLandingPageFrame>
    </JueshiV4PublicShell>
  );
}
