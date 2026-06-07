import { prisma } from "@/lib/prisma";
import { DEFAULT_CONFIG, type HomepageConfig } from "@/types/homepage";

export async function getHomepageConfig(): Promise<HomepageConfig> {
  try {
    const configs = await prisma.homepageConfig.findMany({
      select: { key: true, valueJson: true },
    });

    const partial: Partial<HomepageConfig> = {};
    for (const c of configs) {
      if (c.key in DEFAULT_CONFIG) {
        (partial as any)[c.key] = c.valueJson;
      }
    }

    return { ...DEFAULT_CONFIG, ...partial } as HomepageConfig;
  } catch {
    return DEFAULT_CONFIG;
  }
}

export async function updateHomepageConfig(key: string, value: unknown, updatedBy?: string) {
  return prisma.homepageConfig.upsert({
    where: { key },
    create: { key, valueJson: value as any, updatedBy },
    update: { valueJson: value as any, updatedBy },
  });
}
