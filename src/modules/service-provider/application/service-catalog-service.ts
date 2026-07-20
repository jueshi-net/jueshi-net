import { prisma } from "../infrastructure/db";
import { can } from "@/platform";

const SERVICE_TRANSITIONS: Record<string, string[]> = {
  draft: ["pending_review"],
  pending_review: ["published", "draft"],
  published: ["suspended"],
  suspended: ["published"],
};

export async function createProviderService(userId: string, userRole: string, providerId: string, data: {
  categoryId: string; title: string; slug: string; summary?: string; description?: string;
  priceMode?: string; priceFrom?: number; currency?: string; deliveryMode?: string;
  serviceCountries?: string[]; serviceCities?: string[]; languages?: string[];
}) {
  const provider = await prisma.serviceProvider.findUnique({ where: { id: providerId } });
  if (!provider) throw new Error("Provider not found");
  const isOwner = provider.ownerUserId === userId;
  if (!can("service.create", { userId, userRole, isOwner })) throw new Error("Forbidden");
  return prisma.providerService.create({
    data: { providerId, ...data, status: "draft", priceFrom: data.priceFrom ?? null },
  });
}

export async function submitProviderService(userId: string, userRole: string, serviceId: string) {
  const service = await prisma.providerService.findUnique({ where: { id: serviceId }, include: { provider: true } });
  if (!service) throw new Error("Service not found");
  const isOwner = service.provider.ownerUserId === userId;
  if (!can("provider.submit", { userId, userRole, isOwner })) throw new Error("Forbidden");
  if (!SERVICE_TRANSITIONS[service.status]?.includes("pending_review")) throw new Error(`Cannot submit from ${service.status}`);
  return prisma.providerService.update({ where: { id: serviceId }, data: { status: "pending_review", submittedAt: new Date() } });
}

export async function publishProviderService(adminId: string, serviceId: string) {
  if (!can("service.publish", { userId: adminId, userRole: "admin" })) throw new Error("Forbidden");
  const service = await prisma.providerService.findUnique({ where: { id: serviceId } });
  if (!service) throw new Error("Service not found");
  if (!SERVICE_TRANSITIONS[service.status]?.includes("published")) throw new Error(`Cannot publish from ${service.status}`);
  return prisma.providerService.update({ where: { id: serviceId }, data: { status: "published", publishedAt: new Date() } });
}

export async function updateProviderService(userId: string, userRole: string, serviceId: string, data: Record<string, unknown>) {
  const service = await prisma.providerService.findUnique({ where: { id: serviceId }, include: { provider: true } });
  if (!service) throw new Error("Service not found");
  const isOwner = service.provider.ownerUserId === userId;
  if (!can("provider.edit", { userId, userRole, isOwner })) throw new Error("Forbidden");
  return prisma.providerService.update({ where: { id: serviceId }, data });
}
