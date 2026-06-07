/**
 * Shared role utilities — NO prisma/db imports.
 * Safe to use in both server and client components.
 */

/**
 * Robust admin role check — handles all historical variants.
 * Accepted values: 'admin', 'ADMIN', '管理员', 'Admin', 'administrator'
 */
export function isAdminRole(role: string | null | undefined): boolean {
  if (!role) return false;
  const normalized = role.trim().toLowerCase();
  return normalized === "admin" || normalized === "administrator" || normalized === "管理员";
}

/**
 * Robust member-or-admin check.
 */
export function isElevatedRole(role: string | null | undefined): boolean {
  if (!role) return false;
  const normalized = role.trim().toLowerCase();
  return normalized === "admin" || normalized === "administrator" || normalized === "管理员" || normalized === "member";
}
