/**
 * ServiceCategory repository.
 *
 * Wraps all ServiceCategory DB access. Categories are backend-configurable
 * taxonomy entries (not user-created) used to classify ProviderService rows.
 */
import { prisma } from "./db";

export interface ServiceCategoryCreateInput {
  name: string;
  slug: string;
  icon?: string | null;
  description?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

export interface ServiceCategoryUpdateInput {
  name?: string;
  slug?: string;
  icon?: string | null;
  description?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

export const serviceCategoryRepository = {
  /** List all categories, active first then by sortOrder. */
  list(includeInactive = false) {
    return prisma.serviceCategory.findMany({
      where: includeInactive ? undefined : { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
  },

  /** Find a category by id. */
  findById(id: string) {
    return prisma.serviceCategory.findUnique({ where: { id } });
  },

  /** Find a category by its unique slug. */
  findBySlug(slug: string) {
    return prisma.serviceCategory.findUnique({ where: { slug } });
  },

  /** Count services in a category (optionally filtered by status). */
  countServices(categoryId: string, status?: string) {
    return prisma.providerService.count({
      where: { categoryId, ...(status ? { status } : {}) },
    });
  },

  /** Insert a new category. Throws on unique constraint (name/slug). */
  create(input: ServiceCategoryCreateInput) {
    return prisma.serviceCategory.create({
      data: {
        name: input.name,
        slug: input.slug,
        icon: input.icon ?? null,
        description: input.description ?? null,
        sortOrder: input.sortOrder ?? 0,
        isActive: input.isActive ?? true,
      },
    });
  },

  /** Patch a category. */
  update(id: string, input: ServiceCategoryUpdateInput) {
    return prisma.serviceCategory.update({ where: { id }, data: input });
  },

  /** Hard check for slug uniqueness. */
  slugExists(slug: string) {
    return prisma.serviceCategory
      .findUnique({ where: { slug }, select: { id: true } })
      .then((row) => row !== null);
  },

  /** Total category count (admin dashboard). */
  count() {
    return prisma.serviceCategory.count();
  },
};
