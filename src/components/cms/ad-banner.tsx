import { prisma } from "@/lib/prisma";

interface AdBannerProps {
  position: string;
}

export default async function AdBanner({ position }: AdBannerProps) {
  const ads = await prisma.adSlot.findMany({
    where: { position: position as any, isActive: true },
  });

  if (ads.length === 0) return null;

  return (
    <div className="w-full">
      {ads.map((ad) => (
        <a
          key={ad.id}
          href={ad.linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block my-4"
        >
          <img
            src={ad.imageUrl}
            alt={ad.altText || ad.name}
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700"
          />
        </a>
      ))}
    </div>
  );
}
