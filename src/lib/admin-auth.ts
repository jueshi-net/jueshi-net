import { auth } from "@/lib/auth";

/**
 * Check if the current user is an admin
 * Unified admin auth helper for consistent permission checks
 * 
 * @returns true if user is admin, false otherwise
 */
export async function isAdmin(): Promise<boolean> {
  const session = await auth();
  if (!session?.user) return false;
  
  const role = (session.user as any).role || "";
  
  // Support multiple role formats for backward compatibility
  return ["管理员", "ADMIN", "admin"].includes(role);
}

/**
 * Check if the current user is an admin, throw error if not
 * Use this in pages that require admin access
 * 
 * @throws Error if user is not admin
 */
export async function requireAdmin(): Promise<void> {
  const isAdminUser = await isAdmin();
  if (!isAdminUser) {
    throw new Error("Unauthorized: Admin access required");
  }
}
