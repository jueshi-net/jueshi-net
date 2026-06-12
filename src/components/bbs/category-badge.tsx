import { cn } from "@/lib/utils";
import type { ForumCategory } from "@prisma/client";

interface CategoryBadgeProps {
  category: Pick<ForumCategory, "name" | "color" | "iconText">;
  className?: string;
  size?: "sm" | "md";
}

/**
 * CategoryBadge — 论坛分类标签
 */
export function CategoryBadge({ category, className, size = "sm" }: CategoryBadgeProps) {
  const sizeStyles = {
    sm: "text-[11px] px-2 py-0.5",
    md: "text-xs px-2.5 py-1",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium border",
        "bg-gray-100 text-gray-600 border-gray-200",
        sizeStyles[size],
        className
      )}
    >
      {category.iconText && <span>{category.iconText}</span>}
      <span>{category.name}</span>
    </span>
  );
}
