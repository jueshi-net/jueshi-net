// Workbench recommendation logic — profile-based tool packages

export interface ToolRecommendation {
  key: string;
  title: string;
  href: string;
  icon: string;
  comingSoon?: boolean;
}

export interface RecommendedPackage {
  name: string;
  description: string;
  tools: ToolRecommendation[];
}

/**
 * System default tools shown when user has no favorites
 */
export const DEFAULT_RECOMMENDED_TOOLS: ToolRecommendation[] = [
  { key: "documents", title: "外贸单据", href: "/tools/documents", icon: "FileText" },
  { key: "label-maker", title: "唛头面单", href: "/tools/label-maker", icon: "Tag" },
  { key: "postal-code", title: "邮编查询", href: "/tools/postal-code", icon: "MapPin" },
  { key: "tracking", title: "物流查询", href: "/tracking", icon: "Truck" },
  { key: "memo", title: "Memo", href: "/tools/memo", icon: "StickyNote" },
  { key: "ai-learning", title: "AI 学习", href: "/ai-learning", icon: "Sparkles" },
  { key: "business", title: "出海做生意", href: "/business", icon: "Store" },
];

/**
 * Recommended packages by profile type
 */
export function getRecommendedPackages(profileType: string | null): RecommendedPackage[] {
  switch (profileType) {
    case "merchant":
      return [
        {
          name: "出海商家工具包",
          description: "外贸经营必备工具",
          tools: [
            { key: "documents", title: "外贸单据制作", href: "/tools/documents", icon: "FileText" },
            { key: "hs-code", title: "HS 编码查询", href: "/tools/hs-code", icon: "Hash" },
            { key: "shipping-calculator", title: "运费计算", href: "/tools/shipping-calculator", icon: "Calculator" },
            { key: "ai-copywriting", title: "AI 商品文案", href: "/ai-learning", icon: "Sparkles", comingSoon: true },
            { key: "business", title: "出海做生意", href: "/business", icon: "Store" },
          ],
        },
      ];
    case "overseas_chinese":
      return [
        {
          name: "海外华人工具包",
          description: "生活实用工具",
          tools: [
            { key: "postal-code", title: "邮编查询", href: "/tools/postal-code", icon: "MapPin" },
            { key: "tracking", title: "物流查询", href: "/tracking", icon: "Truck" },
            { key: "reverse-shopping", title: "反向海淘", href: "/business", icon: "ShoppingBag", comingSoon: true },
            { key: "memo", title: "Memo", href: "/tools/memo", icon: "StickyNote" },
            { key: "custom-links", title: "自定义网址", href: "/dashboard", icon: "Link" },
          ],
        },
      ];
    case "student":
      return [
        {
          name: "留学生工具包",
          description: "学习研究辅助工具",
          tools: [
            { key: "ai-learning", title: "AI 学习", href: "/ai-learning", icon: "Sparkles" },
            { key: "research-tools", title: "文献/论文工具", href: "/ai-learning", icon: "BookOpen", comingSoon: true },
            { key: "translation", title: "翻译润色", href: "/ai-learning", icon: "Languages", comingSoon: true },
            { key: "memo", title: "Memo", href: "/tools/memo", icon: "StickyNote" },
            { key: "custom-links", title: "自定义网址", href: "/dashboard", icon: "Link" },
          ],
        },
      ];
    case "ai_learner":
      return [
        {
          name: "AI 学习者工具包",
          description: "AI 工具与学习资源",
          tools: [
            { key: "ai-learning", title: "AI 学习", href: "/ai-learning", icon: "Sparkles" },
            { key: "ai-tools", title: "AI 工具导航", href: "/starter/apps", icon: "Cpu" },
            { key: "prompt-library", title: "提示词收藏", href: "/ai-learning", icon: "MessageSquare", comingSoon: true },
            { key: "custom-links", title: "自定义网址", href: "/dashboard", icon: "Link" },
          ],
        },
      ];
    case "logistics":
      return [
        {
          name: "物流集运工具包",
          description: "物流与集运相关工具",
          tools: [
            { key: "tracking", title: "物流查询", href: "/tracking", icon: "Truck" },
            { key: "postal-code", title: "邮编查询", href: "/tools/postal-code", icon: "MapPin" },
            { key: "shipping-calculator", title: "运费计算", href: "/tools/shipping-calculator", icon: "Calculator" },
            { key: "label-maker", title: "唛头面单", href: "/tools/label-maker", icon: "Tag" },
            { key: "memo", title: "Memo", href: "/tools/memo", icon: "StickyNote" },
          ],
        },
      ];
    default:
      return [];
  }
}

/**
 * Get profile type display info
 */
export function getProfileTypeInfo(profileType: string | null): { label: string; description: string; emoji: string } | null {
  switch (profileType) {
    case "merchant":
      return { label: "出海商家", description: "从事跨境电商、外贸经营", emoji: "🏪" };
    case "overseas_chinese":
      return { label: "海外华人", description: "在海外生活的华人同胞", emoji: "🌏" };
    case "student":
      return { label: "留学生", description: "在海外求学深造", emoji: "🎓" };
    case "ai_learner":
      return { label: "AI 学习者", description: "学习和使用 AI 工具", emoji: "🤖" };
    case "logistics":
      return { label: "物流/集运", description: "从事物流、集运行业", emoji: "📦" };
    default:
      return null;
  }
}

/**
 * All profile type options for the selector
 */
export const PROFILE_TYPE_OPTIONS = [
  { value: "merchant", label: "出海商家", emoji: "🏪", description: "跨境电商、外贸经营" },
  { value: "overseas_chinese", label: "海外华人", emoji: "🌏", description: "海外生活、工作" },
  { value: "student", label: "留学生", emoji: "🎓", description: "海外求学深造" },
  { value: "ai_learner", label: "AI 学习者", emoji: "🤖", description: "学习使用 AI" },
  { value: "logistics", label: "物流/集运", emoji: "📦", description: "物流、集运行业" },
] as const;
