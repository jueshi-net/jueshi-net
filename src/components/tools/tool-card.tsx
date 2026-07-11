"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, FileCheck, Sparkles, Eye } from "lucide-react";
import { trackEvent } from "@/lib/tracking";
import { ToolCenterItem } from "@/lib/tool-center";

interface ToolCardProps {
  tool: ToolCenterItem;
}

export default function ToolCard({ tool }: ToolCardProps) {
  const router = useRouter();

  const handleClick = () => {
    trackEvent("Tool_Click", {
      toolSlug: tool.slug,
      toolName: tool.name,
      source: "tool_center",
    });
    if (tool.route) {
      router.push(tool.route);
    }
  };

  const isNew = tool.isNew;
  const isHot = tool.score > 50;

  // Lucide icon component from tool.icon string
  const renderIcon = () => {
    const iconStr = tool.icon;
    if (!iconStr) {
      return <FileCheck className="w-5 h-5 text-gray-500" />;
    }
    // Dynamically import the named icon
    return <LucideIcon name={iconStr} className="w-5 h-5 text-gray-600" />;
  };

  return (
    <Link
      href={tool.route || "/tools"}
      onClick={handleClick}
      className="block bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all group"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
          {renderIcon()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 group-hover:text-teal-700 line-clamp-1">
              {tool.name}
            </h3>
            {isNew && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                <Sparkles className="w-3 h-3" />
                已上线
              </span>
            )}
            {isHot && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                热门
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 line-clamp-2">
            {tool.description || "暂无描述"}
          </p>
        </div>
        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-teal-600 flex-shrink-0 mt-1 transition-colors" />
      </div>
    </Link>
  );
}

/**
 * Dynamic Lucide icon loader — renders a Lucide component by name string.
 * Falls back to FileCheck if the icon is not found or is an emoji.
 */
function LucideIcon({ name, className }: { name: string; className?: string }) {
  // Guard against emoji or invalid icon names
  if (!name || name.length > 30 || /[^\w-]/.test(name)) {
    return <FileCheck className={className || "w-5 h-5 text-gray-500"} />;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { default: lucideIcons } = require("lucide-react");
    const IconComponent = lucideIcons[name];
    if (IconComponent && typeof IconComponent === "function") {
      return <IconComponent className={className || "w-5 h-5 text-gray-500"} />;
    }
  } catch {
    // ignore
  }

  return <FileCheck className={className || "w-5 h-5 text-gray-500"} />;
}
