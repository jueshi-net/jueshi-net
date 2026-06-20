// Membership helper — server-side member check
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Check if the current user is an active member.
 * Membership is determined by memberUntil > now, NOT by role.
 * Admin users are always considered active members.
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
    const role = user.role?.toLowerCase();
    if (role === "admin" || role === "管理员" || role === "administrator") return true;

    // Check memberUntil expiration — this is the canonical membership check
    if (user.memberUntil && user.memberUntil > new Date()) return true;

    return false;
  } catch {
    return false;
  }
}

/**
 * Get current user's role from DB.
 * Returns "admin" for admin roles, "member" if memberUntil is active, "user" otherwise.
 */
export async function getUserRole(): Promise<"guest" | "user" | "member" | "admin"> {
  try {
    const session = await auth();
    if (!session?.user?.id) return "guest";

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, memberUntil: true },
    });

    if (!user) return "guest";

    const role = user.role?.toLowerCase();
    if (role === "admin" || role === "管理员" || role === "administrator") return "admin";

    // Membership from memberUntil, not from role field
    if (user.memberUntil && user.memberUntil > new Date()) return "member";

    return "user";
  } catch {
    return "guest";
  }
}
