import { prisma } from "@/lib/prisma";

interface AdBannerProps {
  position: string;
}

/**
 * AdBanner — 服务端组件，从 DB ad_campaigns 表读取并渲染广告。
 * 支持 DIRECT 和 NETWORK 两种广告类型。
 */
export default async function AdBanner({ position }: AdBannerProps) {
  const now = new Date();
  const ads = await prisma.adCampaign.findMany({
    where: {
      isActive: true,
      placements: { has: position },
      OR: [{ endDate: null }, { endDate: { gte: now } }],
      startDate: { lte: now },
    },
    orderBy: { priority: "desc" },
    take: 3,
  });

  if (ads.length === 0) return null;

  return (
    <div className="w-full space-y-3">
      {ads.map((ad) => {
        // NETWORK: render code snippet directly (admin-trusted content)
        if (ad.adType === "NETWORK" && ad.codeSnippet) {
          return (
            <div
              key={ad.id}
              className="my-4 relative"
              dangerouslySetInnerHTML={{ __html: ad.codeSnippet }}
            />
          );
        }

        // DIRECT: image + link
        if (ad.adType === "DIRECT") {
          if (!ad.imageUrl) return null;
          const imageAd = (
            <div key={ad.id} className="my-4 bg-white border rounded-lg overflow-hidden relative">
              <span className="absolute top-2 right-3 z-10 inline-flex items-center px-1.5 py-0.5 bg-amber-50 text-amber-600 text-xs rounded font-medium">
                推广
              </span>
              <img
                src={ad.imageUrl}
                alt={ad.title}
                className="w-full max-h-48 object-cover"
              />
              {ad.targetUrl && (
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-900">{ad.title}</p>
                </div>
              )}
            </div>
          );
          if (ad.targetUrl) {
            return (
              <a
                key={ad.id}
                href={ad.targetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                {imageAd}
              </a>
            );
          }
          return imageAd;
        }

        return null;
      })}
    </div>
  );
}
