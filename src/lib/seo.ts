// SEO constants and metadata helpers for 海外百宝箱 (jueshi.net)
// Server-safe: no window, no client-only APIs.

export const SITE_URL = "https://jueshi.net";
export const SITE_NAME = "海外百宝箱";
export const SITE_DESCRIPTION =
  "面向海外华人、留学生和出海商家的实用工具与资源平台，提供邮编查询、物流单据、唛头标签、AI 文案、翻译润色、文件摘要、资源导航和积分工作台。";

export const defaultOpenGraph = {
  type: "website" as const,
  locale: "zh_CN" as const,
  url: SITE_URL,
  siteName: SITE_NAME,
  images: [
    {
      url: `${SITE_URL}/og-image.png`,
      width: 1200,
      height: 630,
      alt: SITE_NAME,
    },
  ],
};

export function buildCanonical(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${cleanPath}`;
}

export function buildTitle(pageTitle?: string): string {
  if (!pageTitle) return `${SITE_NAME}｜海外华人、留学生、出海商家的工具与资源平台`;
  return `${pageTitle} | ${SITE_NAME}`;
}

export function buildDescription(description?: string): string {
  return description || SITE_DESCRIPTION;
}

// ─── JSON-LD Structured Data Helpers ───────────────────────────────────────

export interface SoftwareApplicationSchema {
  '@context': 'https://schema.org';
  '@type': 'SoftwareApplication';
  name: string;
  description: string;
  url: string;
  applicationCategory: string;
  operatingSystem: string;
  offers: {
    '@type': 'Offer';
    price: string;
    priceCurrency: string;
  };
  aggregateRating?: {
    '@type': 'AggregateRating';
    ratingValue: string;
    reviewCount: string;
  };
}

export function softwareApplicationJsonLd(data: {
  name: string;
  description: string;
  url: string;
  category?: string;
}): string {
  const schema: SoftwareApplicationSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: data.name,
    description: data.description,
    url: data.url,
    applicationCategory: data.category || 'UtilityApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };
  return JSON.stringify(schema);
}

export interface DiscussionForumPostingSchema {
  '@context': 'https://schema.org';
  '@type': 'DiscussionForumPosting';
  headline: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified: string;
  author: {
    '@type': 'Person';
    name: string;
  };
  interactionStatistic?: {
    '@type': 'InteractionCounter';
    interactionType: string;
    userInteractionCount: number;
  }[];
}

export function discussionForumPostingJsonLd(data: {
  headline: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified: string;
  authorName: string;
  commentCount?: number;
  viewCount?: number;
}): string {
  const schema: DiscussionForumPostingSchema = {
    '@context': 'https://schema.org',
    '@type': 'DiscussionForumPosting',
    headline: data.headline,
    description: data.description,
    url: data.url,
    datePublished: data.datePublished,
    dateModified: data.dateModified,
    author: {
      '@type': 'Person',
      name: data.authorName,
    },
  };

  const interactions: DiscussionForumPostingSchema['interactionStatistic'] = [];
  if (data.commentCount && data.commentCount > 0) {
    interactions.push({
      '@type': 'InteractionCounter',
      interactionType: 'https://schema.org/CommentAction',
      userInteractionCount: data.commentCount,
    });
  }
  if (data.viewCount && data.viewCount > 0) {
    interactions.push({
      '@type': 'InteractionCounter',
      interactionType: 'https://schema.org/ReadAction',
      userInteractionCount: data.viewCount,
    });
  }
  if (interactions.length > 0) {
    schema.interactionStatistic = interactions;
  }

  return JSON.stringify(schema);
}
