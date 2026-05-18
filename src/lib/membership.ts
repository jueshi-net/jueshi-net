// Membership helper — server-side member check
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Check if the current user is an active member.
 * Admin users are always considered active members for testing convenience.
 * Member check: role === 'member' OR memberUntil > now
 */
export async function isActiveMember(): Promise<boolean> {
  try {
    const session = await auth();
    if (!session?.user?.id) return false;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, memberUntil: true },
    });

    if (!user) return false;

    // Admin always has member privileges
    if (user.role === "admin") return true;

    // Check explicit member role
    if (user.role === "member") return true;

    // Check memberUntil expiration
    if (user.memberUntil && user.memberUntil > new Date()) return true;

    return false;
  } catch {
    return false;
  }
}

/**
 * Get current user's role from DB
 */
export async function getUserRole(): Promise<"guest" | "user" | "member" | "admin"> {
  try {
    const session = await auth();
    if (!session?.user?.id) return "guest";

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    return (user?.role as "guest" | "user" | "member" | "admin") || "user";
  } catch {
    return "guest";
  }
}
