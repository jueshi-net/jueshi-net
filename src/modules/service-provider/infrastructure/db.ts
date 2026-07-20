/**
 * service-provider infrastructure - Prisma client re-export.
 *
 * All service-provider repositories import the shared PrismaClient from here
 * so there is exactly one DB boundary to maintain. Equivalent to importing
 * from "@/lib/prisma" but keeps the module self-contained.
 */
export { prisma } from "@/lib/prisma";
export type { PrismaClient } from "@prisma/client";
