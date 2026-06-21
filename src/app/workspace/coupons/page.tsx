import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import CouponsClient from "./coupons-client";

export default async function CouponsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return <CouponsClient />;
}
