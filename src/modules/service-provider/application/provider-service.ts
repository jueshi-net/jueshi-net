/**
 * Provider Application Service.
 *
 * All provider lifecycle operations. Each method checks capabilities
 * via `can()` before proceeding. State machine transitions are validated.
 */
import { prisma } from "../infrastructure/db";
import { can, type CapabilityContext } from "@/platform";

// ─── State Machine ───
const VALID_TRANSITIONS: Record<string, string[]> = {
  draft: ["pending_review"],
  pending_review: ["approved", "rejected"],
  approved: ["suspended"],
  suspended: ["approved"],
  rejected: ["draft"],
};

function validateTransition(from: string, to: string): void {
  const allowed = VALID_TRANSITIONS[from];
  if (!allowed || !allowed.includes(to)) {
    throw new Error(`Invalid status transition: ${from} -> ${to}`);
  }
}

function ctx(userId: string, role: string, isOwner = false): CapabilityContext {
  return { userId, userRole: role, isOwner, moduleFlagEnabled: true };
}

// ─── Create ───
export async function createProviderApplication(
  userId: string,
  data: {
    providerType: string;
    displayName: string;
    slug: string;
    description?: string;
    languages?: string[];
    countries?: string[];
    cities?: string[];
  }
) {
  if (!can("provider.create", ctx(userId, "user"))) {
    throw new Error("Forbidden: provider.create");
  }
  // Check slug uniqueness
  const existing = await prisma.serviceProvider.findUnique({ where: { slug: data.slug } });
  if (existing) throw new Error("Slug already taken");

  const provider = await prisma.serviceProvider.create({
    data: {
      ownerUserId: userId,
      providerType: data.providerType,
      displayName: data.displayName,
      slug: data.slug,
      description: data.description,
      languages: data.languages ?? [],
      countries: data.countries ?? [],
      cities: data.cities ?? [],
      status: "draft",
      claimedAt: new Date(),
    },
  });

  // Add owner as OWNER member
  await prisma.providerMember.create({
    data: {
      providerId: provider.id,
      userId,
      role: "OWNER",
      status: "active",
      acceptedAt: new Date(),
    },
  });

  return provider;
}

// ─── Update ───
export async function updateProviderProfile(
  userId: string,
  userRole: string,
  providerId: string,
  data: Partial<{
    displayName: string;
    description: string;
    avatarUrl: string;
    coverUrl: string;
    languages: string[];
    countries: string[];
    cities: string[];
    serviceAreas: string[];
    contactPreference: string;
  }>
) {
  const provider = await prisma.serviceProvider.findUnique({ where: { id: providerId } });
  if (!provider) throw new Error("Provider not found");

  const isOwner = provider.ownerUserId === userId;
  if (!can("provider.edit", ctx(userId, userRole, isOwner))) {
    // Also check provider membership (ADMIN/EDITOR members can edit)
    const member = await prisma.providerMember.findUnique({
      where: { providerId_userId: { providerId, userId } },
    });
    if (!member || member.status !== "active" || (member.role !== "ADMIN" && member.role !== "EDITOR")) {
      throw new Error("Forbidden: provider.edit");
    }
  }

  return prisma.serviceProvider.update({
    where: { id: providerId },
    data,
  });
}

// ─── Submit for Review ───
export async function submitProviderForReview(userId: string, userRole: string, providerId: string) {
  const provider = await prisma.serviceProvider.findUnique({ where: { id: providerId } });
  if (!provider) throw new Error("Provider not found");

  const isOwner = provider.ownerUserId === userId;
  if (!can("provider.submit", ctx(userId, userRole, isOwner))) {
    throw new Error("Forbidden: provider.submit");
  }

  validateTransition(provider.status, "pending_review");

  return prisma.serviceProvider.update({
    where: { id: providerId },
    data: { status: "pending_review", submittedAt: new Date() },
  });
}

// ─── Approve (admin) ───
export async function approveProvider(adminId: string, providerId: string) {
  if (!can("provider.verify", ctx(adminId, "admin"))) {
    throw new Error("Forbidden: provider.verify");
  }
  const provider = await prisma.serviceProvider.findUnique({ where: { id: providerId } });
  if (!provider) throw new Error("Provider not found");

  validateTransition(provider.status, "approved");

  const updated = await prisma.serviceProvider.update({
    where: { id: providerId },
    data: { status: "approved", approvedAt: new Date() },
  });

  await prisma.auditLog.create({
    data: { userId: adminId, action: "provider.approve", entity: "ServiceProvider", entityId: providerId },
  });

  return updated;
}

// ─── Reject (admin) ───
export async function rejectProvider(adminId: string, providerId: string, reason: string) {
  if (!can("provider.verify", ctx(adminId, "admin"))) {
    throw new Error("Forbidden: provider.verify");
  }
  const provider = await prisma.serviceProvider.findUnique({ where: { id: providerId } });
  if (!provider) throw new Error("Provider not found");

  validateTransition(provider.status, "rejected");

  const updated = await prisma.serviceProvider.update({
    where: { id: providerId },
    data: { status: "rejected", rejectedAt: new Date(), rejectionReason: reason },
  });

  await prisma.auditLog.create({
    data: { userId: adminId, action: "provider.reject", entity: "ServiceProvider", entityId: providerId, details: reason },
  });

  return updated;
}

// ─── Suspend (admin) ───
export async function suspendProvider(adminId: string, providerId: string) {
  if (!can("provider.manage", ctx(adminId, "admin"))) {
    throw new Error("Forbidden: provider.manage");
  }
  const provider = await prisma.serviceProvider.findUnique({ where: { id: providerId } });
  if (!provider) throw new Error("Provider not found");

  validateTransition(provider.status, "suspended");

  const updated = await prisma.serviceProvider.update({
    where: { id: providerId },
    data: { status: "suspended" },
  });

  await prisma.auditLog.create({
    data: { userId: adminId, action: "provider.suspend", entity: "ServiceProvider", entityId: providerId },
  });

  return updated;
}

// ─── Prefill from CompanyProfile (one-way, no sync) ───
export async function prefillProviderApplicationFromCompanyProfile(
  userId: string,
  companyProfileId: string
) {
  const profile = await prisma.userCompanyProfile.findFirst({
    where: { id: companyProfileId, userId },
  });
  if (!profile) throw new Error("Company profile not found");

  // Return prefill data — caller still calls createProviderApplication explicitly
  return {
    displayName: profile.companyName,
    description: profile.companyNameEn ? `EN: ${profile.companyNameEn}` : undefined,
    avatarUrl: profile.logoDataUrl ?? undefined,
  };
}
