"use client";

import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "cmdk";
import {
  Search,
  Wrench,
  FileText,
  Globe,
  MapPin,
  Calculator,
  Tag,
  TrendingUp,
  Shield,
  Zap,
  BookOpen,
  Library,
  Target,
  MessageSquare,
  LayoutDashboard,
  Gem,
  Briefcase,
  Sparkles,
  Package,
  Star,
} from "lucide-react";
import { scenarioPackages } from "@/data/scenario-packages";

// ===== Context for global open/close =====

interface CommandMenuContextType {
  open: boolean;
  setOpen: (updater: boolean | ((prev: boolean) => boolean)) => void;
}

const CommandMenuContext = createContext<CommandMenuContextType>({
  open: false,
  setOpen: () => {},
});

/** Hook to open/close the global CommandMenu from anywhere */
export function useCommandMenu() {
  return useContext(CommandMenuContext);
}

/** Provider wrapper — mount once at the root level */
export function CommandMenuProvider({ children }: { children: ReactNode }) {
  const [open, setOpenState] = useState(false);
  const setOpen = useCallback(
    (updater: boolean | ((prev: boolean) => boolean)) => {
      setOpenState(typeof updater === "function" ? (updater as (prev: boolean) => boolean)(open) : updater);
    },
    [open]
  );
  return (
    <CommandMenuContext.Provider value={{ open, setOpen }}>
      {children}
    </CommandMenuContext.Provider>
  );
}

// ===== Data sources =====

interface SearchItem {
  id: string;
  title: string;
  subtitle?: string;
  href: string;
  icon: React.ReactNode;
  keywords?: string[];
}

const navItems: SearchItem[] = [
  { id: "nav-home", title: "首页", href: "/", icon: <Globe className="w-4 h-4" />, keywords: ["home", "首页"] },
  { id: "nav-tools", title: "工具集合", href: "/tools", icon: <Wrench className="w-4 h-4" />, keywords: ["tools", "工具"] },
  { id: "nav-ai", title: "AI 工具", href: "/ai-tools/product-copy", icon: <Sparkles className="w-4 h-4" />, keywords: ["ai", "人工智能", "文案", "翻译"] },
  { id: "nav-ai-translate", title: "AI 翻译润色", href: "/ai-tools/translate-polish", icon: <Zap className="w-4 h-4" />, keywords: ["translate", "翻译", "润色"] },
  { id: "nav-ai-summary", title: "AI 文件摘要", href: "/ai-tools/document-summary", icon: <Zap className="w-4 h-4" />, keywords: ["summary", "摘要", "总结"] },
  { id: "nav-guides", title: "实用指南", href: "/guides", icon: <BookOpen className="w-4 h-4" />, keywords: ["guides", "指南", "攻略"] },
  { id: "nav-resources", title: "资源导航", href: "/resources", icon: <Library className="w-4 h-4" />, keywords: ["resources", "资源", "导航"] },
  { id: "nav-topics", title: "专题", href: "/topics", icon: <Target className="w-4 h-4" />, keywords: ["topics", "专题"] },
  { id: "nav-bbs", title: "论坛", href: "/bbs", icon: <MessageSquare className="w-4 h-4" />, keywords: ["bbs", "论坛", "社区"] },
  { id: "nav-pricing", title: "会员与定价", href: "/pricing", icon: <Gem className="w-4 h-4" />, keywords: ["pricing", "会员", "定价", "付费"] },
  { id: "nav-dashboard", title: "我的工作台", href: "/dashboard", icon: <LayoutDashboard className="w-4 h-4" />, keywords: ["dashboard", "工作台", "个人"] },
  { id: "nav-rankings", title: "工具排行榜", href: "/rankings", icon: <TrendingUp className="w-4 h-4" />, keywords: ["rankings", "排行", "热门"] },
  { id: "nav-tracking", title: "包裹追踪", href: "/tracking", icon: <Package className="w-4 h-4" />, keywords: ["tracking", "包裹", "物流"] },
  { id: "nav-starter", title: "场景包列表", href: "/starter", icon: <Briefcase className="w-4 h-4" />, keywords: ["starter", "场景", "新手"] },
];

const toolItems: SearchItem[] = [
  { id: "tool-invoice", title: "商业发票", href: "/tools/commercial-invoice", icon: <FileText className="w-4 h-4" />, subtitle: "国际贸易必备", keywords: ["invoice", "发票", "商业"] },
  { id: "tool-quote", title: "报价单", href: "/tools/quote-sheet", icon: <TrendingUp className="w-4 h-4" />, subtitle: "专业报价单生成", keywords: ["quote", "报价", "价格"] },
  { id: "tool-mark", title: "唛头面单", href: "/tools/documents?type=mark", icon: <Tag className="w-4 h-4" />, subtitle: "一键生成唛头标签", keywords: ["mark", "唛头", "面单", "标签"] },
  { id: "tool-hs", title: "HS 编码查询", href: "/tools/hs-code", icon: <Shield className="w-4 h-4" />, subtitle: "报关必备", keywords: ["hs", "编码", "海关", "报关"] },
  { id: "tool-postal", title: "邮编查询", href: "/tools/postal-code", icon: <MapPin className="w-4 h-4" />, subtitle: "全球邮编地址", keywords: ["postal", "邮编", "地址"] },
  { id: "tool-shipping", title: "运费计算器", href: "/tools/shipping-calculator", icon: <Calculator className="w-4 h-4" />, subtitle: "体积重计算", keywords: ["shipping", "运费", "体积", "重量"] },
  { id: "tool-exchange", title: "汇率查询", href: "/tools/exchange-rate", icon: <TrendingUp className="w-4 h-4" />, subtitle: "实时汇率", keywords: ["exchange", "汇率", "货币"] },
  { id: "tool-container", title: "集装箱计算", href: "/tools/container", icon: <Package className="w-4 h-4" />, subtitle: "装载量计算", keywords: ["container", "集装箱", "货柜"] },
  { id: "tool-address", title: "地址格式化", href: "/tools/address-formatter", icon: <MapPin className="w-4 h-4" />, subtitle: "国际地址标准化", keywords: ["address", "地址", "格式化"] },
  { id: "tool-qrcode", title: "二维码生成", href: "/tools/qrcode", icon: <Tag className="w-4 h-4" />, subtitle: "快速生成 QR Code", keywords: ["qrcode", "二维码", "QR"] },
  { id: "tool-sensitive", title: "敏感品判定", href: "/tools/sensitive-goods", icon: <Shield className="w-4 h-4" />, subtitle: "判断是否敏感货品", keywords: ["sensitive", "敏感", "危险品"] },
  { id: "tool-memo", title: "备忘录", href: "/tools/memo", icon: <FileText className="w-4 h-4" />, subtitle: "快速记录", keywords: ["memo", "备忘录", "笔记"] },
  { id: "tool-documents", title: "单据中心", href: "/tools/documents", icon: <FileText className="w-4 h-4" />, subtitle: "发票 / 装箱单 / 合同", keywords: ["documents", "单据", "发票", "装箱"] },
  { id: "tool-calculator", title: "工具箱", href: "/tools/calculator", icon: <Calculator className="w-4 h-4" />, subtitle: "各种计算器", keywords: ["calculator", "计算"] },
  { id: "tool-receipt", title: "收据生成", href: "/tools/receipt", icon: <FileText className="w-4 h-4" />, subtitle: "快速生成收据", keywords: ["receipt", "收据"] },
  { id: "tool-label", title: "唛头标签生成", href: "/tools/documents/shipping-label", icon: <Tag className="w-4 h-4" />, subtitle: "标签生成器", keywords: ["label", "标签", "唛头"] },
  { id: "tool-customs", title: "报关资料生成", href: "/tools/customs-generator", icon: <Shield className="w-4 h-4" />, subtitle: "清关资料", keywords: ["customs", "报关", "清关"] },
  { id: "tool-inbound", title: "入库单", href: "/tools/inbound", icon: <FileText className="w-4 h-4" />, subtitle: "入库单据生成", keywords: ["inbound", "入库"] },
  { id: "tool-shipping-label", title: "快递面单", href: "/tools/shipping-label", icon: <Tag className="w-4 h-4" />, subtitle: "快递面单生成", keywords: ["shipping-label", "面单", "快递"] },
  { id: "tool-video-script", title: "视频脚本 SOP", href: "/tools/video-script-sop", icon: <Sparkles className="w-4 h-4" />, subtitle: "短视频脚本生成", keywords: ["video", "脚本", "短视频"] },
  { id: "tool-debit", title: "借记通知单", href: "/tools/debit-note", icon: <FileText className="w-4 h-4" />, subtitle: "借记单生成", keywords: ["debit", "借记", "通知"] },
  { id: "tool-handover", title: "交接单", href: "/tools/handover-note", icon: <FileText className="w-4 h-4" />, subtitle: "交接单据", keywords: ["handover", "交接"] },
  { id: "tool-shipping-mark", title: "运输唛头", href: "/tools/shipping-mark", icon: <Tag className="w-4 h-4" />, subtitle: "运输标记", keywords: ["mark", "唛头", "运输"] },
  { id: "tool-quote-page", title: "报价工具", href: "/tools/quote", icon: <TrendingUp className="w-4 h-4" />, subtitle: "报价计算", keywords: ["quote", "报价"] },
  { id: "tool-inbound-receipt", title: "入库签收", href: "/tools/inbound-receipt", icon: <FileText className="w-4 h-4" />, subtitle: "入库签收单", keywords: ["inbound", "入库", "签收"] },
];

const scenarioItems: SearchItem[] = scenarioPackages.map((pkg) => ({
  id: `scenario-${pkg.id}`,
  title: pkg.title,
  href: pkg.href,
  icon: <Briefcase className="w-4 h-4" />,
  subtitle: `${pkg.toolCount} 个内置工具`,
  keywords: pkg.tags,
}));

// ===== Main Component =====

export default function CommandPalette() {
  const { open, setOpen } = useCommandMenu();
  const router = useRouter();

  // Global keyboard shortcut (already handled by cmdk, but we add Cmd+K toggle)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [setOpen]);

  const runCommand = useCallback(
    (command: () => void) => {
      setOpen(false);
      command();
    },
    [setOpen]
  );

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="搜索工具、场景包、页面…" className="border-none focus:ring-0 text-base" />
        <CommandList>
          <CommandEmpty>
            <div className="py-6 text-center text-sm text-gray-400">
              未找到匹配结果
            </div>
          </CommandEmpty>

          {/* Navigation */}
          <CommandGroup heading="导航" className="[&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-gray-400 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5">
            {navItems.map((item) => (
              <CommandItem
                key={item.id}
                value={`${item.title} ${item.keywords?.join(" ") || ""}`}
                onSelect={() => runCommand(() => router.push(item.href))}
                className="data-[selected=true]:bg-gray-100"
              >
                <span className="mr-2 text-gray-400">{item.icon}</span>
                <span>{item.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          {/* Core Tools */}
          <CommandGroup heading="工具" className="[&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-gray-400 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5">
            {toolItems.map((item) => (
              <CommandItem
                key={item.id}
                value={`${item.title} ${item.subtitle || ""} ${item.keywords?.join(" ") || ""}`}
                onSelect={() => runCommand(() => router.push(item.href))}
                className="data-[selected=true]:bg-gray-100"
              >
                <span className="mr-2 text-gray-400">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <span>{item.title}</span>
                  {item.subtitle && (
                    <span className="ml-2 text-xs text-gray-400">{item.subtitle}</span>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          {/* Scenario Packages */}
          <CommandGroup heading="场景包" className="[&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-gray-400 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5">
            {scenarioItems.map((item) => (
              <CommandItem
                key={item.id}
                value={`${item.title} ${item.subtitle || ""} ${item.keywords?.join(" ") || ""}`}
                onSelect={() => runCommand(() => router.push(item.href))}
                className="data-[selected=true]:bg-gray-100"
              >
                <span className="mr-2 text-blue-500">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <span>{item.title}</span>
                  {item.subtitle && (
                    <span className="ml-2 text-xs text-gray-400">{item.subtitle}</span>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>

        {/* Footer */}
        <div className="border-t border-gray-100 px-4 py-2.5 flex items-center gap-3 text-xs text-gray-400">
          <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-mono">
            <span>⌘</span>K
          </kbd>
          <span>打开</span>
          <kbd className="inline-flex items-center px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-mono ml-2">
            ESC
          </kbd>
          <span>关闭</span>
          <span className="ml-auto">海外百宝箱 Command Palette</span>
        </div>
      </CommandDialog>
  );
}
