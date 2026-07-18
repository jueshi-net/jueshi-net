/**
 * SEO structured data (JSON-LD) for the forum.
 *
 * Only published content gets structured data.
 * Drafts, pending, rejected, and hidden posts are excluded.
 */

import { buildCanonical } from "@/lib/seo";

interface StructuredDataAuthor {
  id: string;
  name: string | null;
  email: string;
  role: string;
  honorScore: number | null;
}

interface StructuredDataPost {
  slug: string;
  title: string;
  content: string;
  excerpt: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  viewCount: number;
  commentCount: number;
  category: {
    id: string;
    key: string;
    name: string;
  };
  user: StructuredDataAuthor;
}

/**
 * Build DiscussionForumPosting JSON-LD for a published forum post.
 * Returns null if the post is not published.
 */
export function buildPostJsonLd(post: StructuredDataPost) {
  if (post.status !== "published") return null;

  const canonical = buildCanonical(`/bbs/${post.slug}`);
  const authorName = post.user.name || "匿名用户";
  const description = post.excerpt || post.content.slice(0, 150);

  return {
    "@context": "https://schema.org",
    "@type": "DiscussionForumPosting",
    "@id": canonical,
    url: canonical,
    headline: post.title.slice(0, 110),
    description,
    datePublished: post.createdAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      "@type": "Person",
      name: authorName,
    },
    interactionStatistic: [
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/ViewAction",
        userInteractionCount: post.viewCount,
      },
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/CommentAction",
        userInteractionCount: post.commentCount,
      },
    ],
    articleSection: post.category.name,
    publisher: {
      "@type": "Organization",
      name: "绝世百宝箱",
      url: buildCanonical(""),
    },
  };
}

/**
 * Build BreadcrumbList JSON-LD from breadcrumb items.
 */
export function buildBreadcrumbJsonLd(items: { title: string; href?: string; current?: boolean }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.title,
      ...(item.href ? { item: buildCanonical(item.href) } : {}),
    })),
  };
}

/**
 * Build ItemList JSON-LD for a list of published posts (e.g., category page).
 */
export function buildItemListJsonLd(params: {
  posts: { slug: string; title: string; createdAt: Date }[];
  categoryName: string;
  categoryKey: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${params.categoryName} - 绝世百宝箱`,
    itemListElement: params.posts.map((post, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: buildCanonical(`/bbs/${post.slug}`),
      name: post.title,
    })),
  };
}

/**
 * Build ProfilePage JSON-LD for a user's public profile.
 */
export function buildProfilePageJsonLd(params: {
  userId: string;
  name: string | null;
  email: string;
  honorScore: number;
  joinedAt: Date;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      name: params.name || "匿名用户",
      identifier: params.userId,
      description: `绝世百宝箱社区用户，荣誉值 ${params.honorScore}`,
      memberOf: {
        "@type": "Organization",
        name: "绝世百宝箱",
      },
    },
  };
}

/**
 * Build ProfilePage JSON-LD for a user profile.
 */
export function buildProfileJsonLd(opts: {
  userId: string;
  name: string | null;
  email: string;
  role: string;
  honorScore: number | null;
  postCount: number;
  commentCount: number;
}) {
  const baseUrl = buildCanonical("");
  const profileUrl = `${baseUrl}/u/${opts.userId}`;
  const displayName = opts.name || "匿名用户";

  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      "@id": profileUrl,
      name: displayName,
      url: profileUrl,
      ...(opts.role === "admin" ? { description: "管理员" } : {}),
      interactionStatistic: [
        {
          "@type": "InteractionCounter",
          interactionType: "https://schema.org/CreateAction",
          userInteractionCount: opts.postCount,
        },
        {
          "@type": "InteractionCounter",
          interactionType: "https://schema.org/ReplyAction",
          userInteractionCount: opts.commentCount,
        },
      ],
    },
  };
}

/**
 * Render JSON-LD as a <script type="application/ld+json"> tag string.
 * This is for use in Server Components.
 */
export function renderJsonLd(data: object): string {
  return JSON.stringify(data);
}
