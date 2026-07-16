/**
 * Community/Forum shared types
 *
 * These types mirror the Prisma models (ForumCategory, ForumPost, ForumComment)
 * but are serialized for client/SSR consumption (dates as ISO strings).
 */

export interface ForumCategoryData {
  id: string;
  key: string;
  name: string;
  description: string | null;
  iconText: string | null;
  color: string | null;
  sortOrder: number;
  isActive: boolean;
  postCount?: number;
}

export interface ForumPostSummary {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string | null;
  status: string;
  isPinned: boolean;
  isLocked: boolean;
  isFeatured: boolean;
  isSolved: boolean;
  viewCount: number;
  commentCount: number;
  tags: string[] | null;
  createdAt: string;
  lastCommentAt: string | null;
  relatedTool: string | null;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  category: {
    id: string;
    key: string;
    name: string;
    iconText: string | null;
    color: string | null;
  };
}

export interface ForumPostDetail extends ForumPostSummary {
  acceptedCommentId: string | null;
  relatedGuideId: string | null;
  relatedChecklistId: string | null;
  relatedTaskChainType: string | null;
  user: {
    id: string;
    name: string | null;
    email: string;
    levelKey: string | null;
    growthValue: number | null;
    honorScore: number | null;
    role: string;
    membershipTier: string | null;
    createdAt: string;
    _count?: {
      forumPosts: number;
      forumComments: number;
    };
  };
}

export interface ForumCommentData {
  id: string;
  content: string;
  status: string;
  floorNumber: number;
  isAccepted: boolean;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    honorScore: number | null;
    role: string;
    levelKey: string | null;
  };
  likeCount: number;
  likedByMe: boolean;
}

export interface ForumStats {
  postCount: number;
  categoryCount: number;
  latestPostAt: string | null;
}

export interface ForumTopUser {
  id: string;
  name: string | null;
  honorScore: number | null;
}

export interface ForumHotTag {
  tag: string;
  count: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
