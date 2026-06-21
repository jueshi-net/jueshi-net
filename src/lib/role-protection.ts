// v1.20.42.18.4.2: Role and Membership Protection
// Prevents role field from being polluted by membership logic

export const VALID_ROLES = ['admin', 'user'] as const;
export type ValidRole = typeof VALID_ROLES[number];

export const VALID_MEMBERSHIP_TIERS = ['free', 'member', 'premium', 'enterprise'] as const;
export type ValidMembershipTier = typeof VALID_MEMBERSHIP_TIERS[number];

/**
 * Normalize role to valid values
 * - admin/ADMIN/管理员 -> admin
 * - user/USER/member -> user
 */
export function normalizeRole(role: string | null | undefined): ValidRole {
  if (!role) return 'user';
  
  const lowerRole = role.toLowerCase();
  if (lowerRole === 'admin' || role === '管理员') {
    return 'admin';
  }
  return 'user';
}

/**
 * Assert that role is valid
 * Throws error if role is not 'admin' or 'user'
 */
export function assertValidRole(role: string): asserts role is ValidRole {
  if (!VALID_ROLES.includes(role as ValidRole)) {
    throw new Error(`Invalid role: ${role}. Must be one of: ${VALID_ROLES.join(', ')}`);
  }
}

/**
 * Check if user has valid membership
 * Uses membershipTier and memberUntil, NOT role
 */
export function hasValidMembership(user: {
  membershipTier?: string | null;
  memberUntil?: Date | string | null;
}): boolean {
  if (!user.membershipTier || user.membershipTier === 'free') {
    return false;
  }
  
  if (!user.memberUntil) {
    return false;
  }
  
  const expiryDate = typeof user.memberUntil === 'string' 
    ? new Date(user.memberUntil) 
    : user.memberUntil;
  
  return expiryDate > new Date();
}

/**
 * Check if user is admin
 * Only checks role, NOT membershipTier or memberUntil
 */
export function isAdmin(user: { role: string }): boolean {
  return user.role === 'admin';
}

/**
 * Require admin role
 * Throws error if user is not admin
 */
export function requireAdmin(user: { role: string } | null | undefined): asserts user is { role: 'admin' } {
  if (!user || user.role !== 'admin') {
    throw new Error('无权限：需要管理员权限');
  }
}

/**
 * Protect 9833416@qq.com from being modified
 * Returns true if email is the protected admin account
 */
export function isProtectedAdmin(email: string): boolean {
  return email === '9833416@qq.com';
}

/**
 * Get membership tier from user
 * Returns 'free' if no membershipTier or expired
 */
export function getMembershipTier(user: {
  membershipTier?: string | null;
  memberUntil?: Date | string | null;
}): ValidMembershipTier {
  if (hasValidMembership(user)) {
    return (user.membershipTier as ValidMembershipTier) || 'member';
  }
  return 'free';
}

/**
 * Prevent business logic from writing role
 * This function should be called by reward/invite/membership logic
 * to ensure they don't modify role
 */
export function preventRoleMutation(context: string): void {
  console.warn(`[Role Protection] ${context} should NOT modify role field. Use membershipTier and memberUntil instead.`);
}
