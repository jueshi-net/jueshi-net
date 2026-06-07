export interface ToolCenterItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  route: string | null;
  icon: string | null;
  popularityTag: string | null;
  updatedAt: Date;
  sortOrder: number;
  isNew: boolean;
  score: number;
  metrics: {
    views: number;
    clicks: number;
    saves: number;
    favorites: number;
  };
  favorites: number;
  review: {
    avg: number;
    count: number;
  };
}

export const CATEGORY_MAP: Record<string, string> = {
  documents: "单据工具",
  "ai-content": "AI 内容",
  logistics: "物流工具",
  business: "经营工具",
  life: "生活工具",
  general: "通用工具",
};
