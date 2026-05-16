import { prisma } from "@/lib/prisma";

interface AdBannerProps {
  position: string;
}

/**
 * AdBanner — 服务端组件，从 DB ad_slots 表读取并渲染广告。
 *
 * ⚠️ SECURITY NOTE: code 类型广告使用 dangerouslySetInnerHTML 渲染。
 *   - code 类型广告只能由 admin 通过 /admin/ads 后台创建/编辑
 *   - POST/PUT/PATCH /api/ads 全部 requireAdmin()，普通用户无法写入
 *   - 这不是用户提交内容，仅渲染管理员信任的代码
 *   - 如果未来需要支持用户提交的 HTML，必须引入 CSP/sanitize 机制
 */
export default async function AdBanner({ position }: AdBannerProps) {
  const ads = await prisma.adSlot.findMany({
    where: { position: position as any, isActive: true },
  });

  if (ads.length === 0) return null;

  return (
    <div className="w-full">
      {ads.map((ad) => {
        // Render based on ad type
        if (ad.type === "code" && ad.code) {
          return (
            <div
              key={ad.id}
              className="my-4"
              dangerouslySetInnerHTML={{ __html: ad.code }}
            />
          );
        }

        if (ad.type === "text") {
          const content = (
            <div className="my-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
              <p className="font-medium text-gray-900">{ad.title || ad.name}</p>
              {ad.description && <p className="text-sm text-gray-600 mt-1">{ad.description}</p>}
              {ad.buttonText && <span className="text-sm text-blue-600 mt-2 inline-block">{ad.buttonText} →</span>}
            </div>
          );
          if (ad.targetUrl) {
            return (
              <a key={ad.id} href={ad.targetUrl} target="_blank" rel="noopener noreferrer">
                {content}
              </a>
            );
          }
          return <div key={ad.id}>{content}</div>;
        }

        // Image type (default)
        if (!ad.imageUrl) return null;
        const imageAd = (
          <img
            src={ad.imageUrl}
            alt={ad.altText || ad.name}
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700"
          />
        );
        if (ad.targetUrl || ad.linkUrl) {
          return (
            <a
              key={ad.id}
              href={ad.targetUrl || ad.linkUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="block my-4"
            >
              {imageAd}
            </a>
          );
        }
        return <div key={ad.id} className="my-4">{imageAd}</div>;
      })}
    </div>
  );
}
