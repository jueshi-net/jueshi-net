// Server-side wrapper for ToolReviewPanel
import { auth } from "@/lib/auth";
import ToolReviewPanel from "@/components/tools/tool-review-panel";

interface ToolReviewServerProps {
  toolKey: string;
}

export default async function ToolReviewServer({ toolKey }: ToolReviewServerProps) {
  const session = await auth();
  const isLoggedIn = !!session?.user?.id;

  return <ToolReviewPanel toolKey={toolKey} isLoggedIn={isLoggedIn} />;
}
