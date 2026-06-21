import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import RedemptionHistoryClient from "./redemption-history-client";

export default async function RedemptionHistoryPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return <RedemptionHistoryClient />;
}
