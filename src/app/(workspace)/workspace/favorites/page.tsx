import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import FavoritesClient from "./favorites-client";

export default async function FavoritesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/workspace/favorites");

  const favorites = await prisma.userFavorite.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  }).catch(() => []);

  return <FavoritesClient favorites={favorites} />;
}
