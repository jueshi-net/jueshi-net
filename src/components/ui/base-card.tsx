import { cn } from "@/lib/utils";

interface BaseCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

/**
 * BaseCard — 统一卡片容器
 *
 * 规范：
 * - rounded-xl + 默认轻边框
 * - hover: shadow-md + border-teal-300（当 hover=true）
 * - selected: teal 左边框 + 浅背景
 * - disabled: opacity-50 + pointer-events-none
 */
export function BaseCard({
  children,
  className,
  hover = false,
  selected = false,
  disabled = false,
  onClick,
}: BaseCardProps) {
  return (
    <div
      className={cn(
        // 基础样式
        "bg-white rounded-xl border border-gray-200",
        // 交互
        hover && "hover:shadow-md hover:border-teal-300 transition-all duration-200",
        selected && "border-l-4 border-l-teal-500 bg-teal-50",
        disabled && "opacity-50 pointer-events-none",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
