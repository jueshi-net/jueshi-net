import {
  ShoppingBag,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  Store,
} from "lucide-react";

// ===== New SaaS-style scenario packages (for homepage) =====

export interface ScenarioPackage {
  id: string;
  title: string;
  description: string;
  icon: string; // lucide icon name
  href: string;
  tags: string[];
  toolCount: number;
}

export const scenarioPackages: ScenarioPackage[] = [
  {
    id: "shopify-starter",
    title: "Shopify 独立站破冰包",
    description: "建站、算运费、发货单据一站式解决，新手卖家快速起步",
    icon: "ShoppingBag",
    href: "/packages/shopify-starter",
    tags: ["独立站", "运费计算", "单据生成"],
    toolCount: 6,
  },
  {
    id: "student-shipping",
    title: "留学生回国包裹管家",
    description: "体积重计算、免税额度、回国路线规划，省钱避坑指南",
    icon: "GraduationCap",
    href: "/packages/student-shipping",
    tags: ["留学生", "集运", "免税"],
    toolCount: 5,
  },
  {
    id: "ai-copy-suite",
    title: "AI 多语言文案套件",
    description: "商品描述、翻译润色、多语言客服，AI 赋能日常经营",
    icon: "Sparkles",
    href: "/packages/ai-copy-suite",
    tags: ["AI", "翻译", "文案"],
    toolCount: 4,
  },
  {
    id: "customs-clearance",
    title: "进出口清关资料包",
    description: "HS 编码查询、商业发票、装箱单、报关单，清关不迷路",
    icon: "ShieldCheck",
    href: "/packages/customs-clearance",
    tags: ["清关", "HS编码", "发票"],
    toolCount: 7,
  },
  {
    id: "amazon-seller",
    title: "亚马逊新手卖家工具包",
    description: "定价计算、唛头面单、敏感品判定、物流选型，开店即用",
    icon: "Store",
    href: "/packages/amazon-seller",
    tags: ["亚马逊", "定价", "面单"],
    toolCount: 6,
  },
];

// ===== Backward-compatible exports (for /starter, rankings, sitemap, etc.) =====

interface OldScenarioTool {
  name: string;
  url: string;
  category: string;
  scenario: string;
  targetUsers: string[];
  painPoint: string;
  description: string;
  freePlan: string;
  paidPlan: string;
  accessCN: "fast" | "slow" | "blocked" | "unknown";
  accessOverseas: "fast" | "slow" | "unknown";
  beginnerFriendly: boolean;
  recommended: boolean;
  tags: string[];
  sourceNote: string;
  toolKey?: string;
}

interface OldToolGroup {
  groupName: string;
  tools: OldScenarioTool[];
}

interface OldScenarioPackage {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  emoji: string;
  targetUsers: string;
  problemStatement: string;
  quickStart: { step: number; title: string; description: string }[];
  toolGroups: OldToolGroup[];
  disclaimer?: string;
}

export const SCENARIO_PACKAGES: OldScenarioPackage[] = [
  {
    id: "shopify-starter",
    slug: "shopify-starter",
    title: "Shopify 独立站破冰包",
    subtitle: "从建站到发货，一站式解决",
    description: "面向 Shopify 新手卖家，涵盖建站工具、运费计算、发票面单生成、物流追踪等核心场景",
    emoji: "🛒",
    targetUsers: "独立站新手卖家、个人创业者",
    problemStatement: "刚开 Shopify 店铺，不知道用哪些工具做发票、算运费、查物流？这里一站式解决。",
    quickStart: [
      { step: 1, title: "注册店铺", description: "完成 Shopify 注册和基础设置" },
      { step: 2, title: "配置运费", description: "使用运费计算工具估算成本" },
      { step: 3, title: "生成单据", description: "用商业发票/装箱单工具准备发货资料" },
    ],
    toolGroups: [
      {
        groupName: "运费与物流",
        tools: [
          { name: "运费计算器", url: "/tools/shipping-calculator", category: "shipping", scenario: "shipping", targetUsers: [], painPoint: "不知道运费多少", description: "体积重计算 / 集运估算", freePlan: "免费", paidPlan: "N/A", accessCN: "fast", accessOverseas: "fast", beginnerFriendly: true, recommended: true, tags: ["运费"], sourceNote: "", toolKey: "shipping-calculator" },
          { name: "邮编查询", url: "/tools/postal-code", category: "postal", scenario: "postal", targetUsers: [], painPoint: "不知道邮编", description: "全球邮编地址查询", freePlan: "免费", paidPlan: "N/A", accessCN: "fast", accessOverseas: "fast", beginnerFriendly: true, recommended: true, tags: ["邮编"], sourceNote: "", toolKey: "postal-code" },
        ],
      },
      {
        groupName: "单据生成",
        tools: [
          { name: "商业发票", url: "/tools/commercial-invoice", category: "invoice", scenario: "invoice", targetUsers: [], painPoint: "不会做发票", description: "自动生成商业发票", freePlan: "免费", paidPlan: "N/A", accessCN: "fast", accessOverseas: "fast", beginnerFriendly: true, recommended: true, tags: ["发票"], sourceNote: "", toolKey: "commercial-invoice" },
          { name: "报价单", url: "/tools/quote-sheet", category: "quote", scenario: "quote", targetUsers: [], painPoint: "不会做报价单", description: "专业报价单生成", freePlan: "免费", paidPlan: "N/A", accessCN: "fast", accessOverseas: "fast", beginnerFriendly: true, recommended: true, tags: ["报价"], sourceNote: "", toolKey: "quote-sheet" },
        ],
      },
    ],
  },
  {
    id: "student-shipping",
    slug: "student-shipping",
    title: "留学生回国包裹管家",
    subtitle: "体积重计算、免税额度、回国路线规划",
    description: "留学生回国寄包裹必备工具集，帮你省钱避坑",
    emoji: "🎓",
    targetUsers: "留学生、海外华人",
    problemStatement: "回国寄包裹不知道选哪家快递、怎么算最划算？这里有全套工具。",
    quickStart: [
      { step: 1, title: "计算体积重", description: "用体积重计算器估算运费" },
      { step: 2, title: "查询邮编", description: "确认收件地址邮编" },
      { step: 3, title: "比较汇率", description: "用汇率查询对比成本" },
    ],
    toolGroups: [
      {
        groupName: "运费计算",
        tools: [
          { name: "运费计算器", url: "/tools/shipping-calculator", category: "shipping", scenario: "shipping", targetUsers: [], painPoint: "不知道运费多少", description: "体积重计算 / 集运估算", freePlan: "免费", paidPlan: "N/A", accessCN: "fast", accessOverseas: "fast", beginnerFriendly: true, recommended: true, tags: ["运费"], sourceNote: "", toolKey: "shipping-calculator" },
          { name: "集装箱计算", url: "/tools/container", category: "container", scenario: "container", targetUsers: [], painPoint: "不会算集装箱", description: "集装箱装载量计算", freePlan: "免费", paidPlan: "N/A", accessCN: "fast", accessOverseas: "fast", beginnerFriendly: false, recommended: false, tags: ["集装箱"], sourceNote: "", toolKey: "container" },
        ],
      },
    ],
  },
  {
    id: "ai-copy-suite",
    slug: "ai-copy-suite",
    title: "AI 多语言文案套件",
    subtitle: "AI 赋能日常经营",
    description: "商品描述、翻译润色、多语言客服，AI 工具一站搞定",
    emoji: "🤖",
    targetUsers: "电商卖家、跨境从业者",
    problemStatement: "不会写多语言商品文案？AI 帮你一键生成。",
    quickStart: [
      { step: 1, title: "输入产品信息", description: "填写产品基本信息" },
      { step: 2, title: "选择目标语言", description: "选择需要翻译的语言" },
      { step: 3, title: "生成文案", description: "AI 自动生成多语言文案" },
    ],
    toolGroups: [
      {
        groupName: "AI 文案",
        tools: [
          { name: "AI 商品文案", url: "/ai-tools/product-copy", category: "ai", scenario: "ai", targetUsers: [], painPoint: "不会写文案", description: "AI 撰写产品描述", freePlan: "免费额度", paidPlan: "付费升级", accessCN: "fast", accessOverseas: "fast", beginnerFriendly: true, recommended: true, tags: ["AI"], sourceNote: "", toolKey: "product-copy" },
          { name: "AI 翻译润色", url: "/ai-tools/translate-polish", category: "ai", scenario: "ai", targetUsers: [], painPoint: "翻译不专业", description: "多语言翻译优化", freePlan: "免费额度", paidPlan: "付费升级", accessCN: "fast", accessOverseas: "fast", beginnerFriendly: true, recommended: true, tags: ["AI", "翻译"], sourceNote: "", toolKey: "translate-polish" },
        ],
      },
    ],
  },
  {
    id: "customs-clearance",
    slug: "customs-clearance",
    title: "进出口清关资料包",
    subtitle: "清关不迷路",
    description: "HS 编码查询、商业发票、装箱单、报关单，清关必备工具集",
    emoji: "📋",
    targetUsers: "进出口贸易从业者、跨境电商",
    problemStatement: "清关资料不会准备？HS 编码不会查？这里有全套工具。",
    quickStart: [
      { step: 1, title: "查询 HS 编码", description: "输入商品名查询编码" },
      { step: 2, title: "生成发票", description: "自动生成商业发票" },
      { step: 3, title: "准备装箱单", description: "生成装箱单资料" },
    ],
    toolGroups: [
      {
        groupName: "清关工具",
        tools: [
          { name: "HS 编码查询", url: "/tools/hs-code", category: "hs", scenario: "hs", targetUsers: [], painPoint: "不知道 HS 编码", description: "商品 HS 编码查询", freePlan: "免费", paidPlan: "N/A", accessCN: "fast", accessOverseas: "fast", beginnerFriendly: true, recommended: true, tags: ["HS编码"], sourceNote: "", toolKey: "hs-code" },
          { name: "商业发票", url: "/tools/commercial-invoice", category: "invoice", scenario: "invoice", targetUsers: [], painPoint: "不会做发票", description: "自动生成商业发票", freePlan: "免费", paidPlan: "N/A", accessCN: "fast", accessOverseas: "fast", beginnerFriendly: true, recommended: true, tags: ["发票"], sourceNote: "", toolKey: "commercial-invoice" },
        ],
      },
    ],
  },
  {
    id: "amazon-seller",
    slug: "amazon-seller",
    title: "亚马逊新手卖家工具包",
    subtitle: "开店即用",
    description: "定价计算、唛头面单、敏感品判定、物流选型，亚马逊开店必备",
    emoji: "📦",
    targetUsers: "亚马逊新手卖家",
    problemStatement: "刚开亚马逊店铺，不知道用什么工具？这里有全套解决方案。",
    quickStart: [
      { step: 1, title: "产品定价", description: "使用定价工具计算利润" },
      { step: 2, title: "生成面单", description: "用唛头面单工具准备标签" },
      { step: 3, title: "选择物流", description: "比较不同物流方案" },
    ],
    toolGroups: [
      {
        groupName: "定价与物流",
        tools: [
          { name: "运费计算器", url: "/tools/shipping-calculator", category: "shipping", scenario: "shipping", targetUsers: [], painPoint: "不知道运费多少", description: "体积重计算 / 集运估算", freePlan: "免费", paidPlan: "N/A", accessCN: "fast", accessOverseas: "fast", beginnerFriendly: true, recommended: true, tags: ["运费"], sourceNote: "", toolKey: "shipping-calculator" },
          { name: "唛头生成器", url: "/tools/documents?type=mark", category: "mark", scenario: "mark", targetUsers: [], painPoint: "不会做唛头", description: "一键生成唛头标签", freePlan: "免费", paidPlan: "N/A", accessCN: "fast", accessOverseas: "fast", beginnerFriendly: true, recommended: true, tags: ["唛头"], sourceNote: "", toolKey: "label-maker" },
        ],
      },
    ],
  },
];

export function getScenarioBySlug(slug: string): OldScenarioPackage | undefined {
  return SCENARIO_PACKAGES.find((p) => p.slug === slug);
}

export function getAllScenarioSlugs(): string[] {
  return SCENARIO_PACKAGES.map((p) => p.slug);
}
