import { prisma } from "../infrastructure/db";
import { can } from "@/platform";

export async function addProviderMember(userId: string, userRole: string, providerId: string, targetUserId: string, role: string) {
  const provider = await prisma.serviceProvider.findUnique({ where: { id: providerId } });
  if (!provider) throw new Error("Provider not found");
  const isOwner = provider.ownerUserId === userId;
  if (!can("provider.manage", { userId, userRole, isOwner })) throw new Error("Forbidden");
  if (!["ADMIN", "EDITOR", "VIEWER"].includes(role)) throw new Error("Invalid role");
  return prisma.providerMember.upsert({
    where: { providerId_userId: { providerId, userId: targetUserId } },
    create: { providerId, userId: targetUserId, role, status: "invited", invitedBy: userId, invitedAt: new Date() },
    update: { role, status: "active" },
  });
}

export async function removeProviderMember(userId: string, userRole: string, providerId: string, targetUserId: string) {
  const provider = await prisma.serviceProvider.findUnique({ where: { id: providerId } });
  if (!provider) throw new Error("Provider not found");
  const isOwner = provider.ownerUserId === userId;
  if (!can("provider.manage", { userId, userRole, isOwner })) throw new Error("Forbidden");
  const member = await prisma.providerMember.findUnique({ where: { providerId_userId: { providerId, userId: targetUserId } } });
  if (member?.role === "OWNER") throw new Error("Cannot remove owner");
  return prisma.providerMember.delete({ where: { providerId_userId: { providerId, userId: targetUserId } } });
}
