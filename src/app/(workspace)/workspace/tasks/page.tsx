import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import TasksClient from "./tasks-client";

export default async function TasksPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/workspace/tasks");
  return <TasksClient />;
}
