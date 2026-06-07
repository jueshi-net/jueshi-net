import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import MemberClient from "./member-client";

export default async function MemberPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/workspace/member");
  return <MemberClient user={session.user} />;
}
