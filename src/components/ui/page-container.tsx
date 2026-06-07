import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
}

/**
 * PageContainer — 统一页面容器
 *
 * 规范：
 * - 桌面端最大宽度 1280px（xl）
 * - 两侧留白：移动端 16px，平板 24px，桌面 32px
 * - min-h-screen 确保占满视口
 */
export function PageContainer({ children, className, maxWidth = "xl" }: PageContainerProps) {
  const maxWidthStyles: Record<string, string> = {
    sm: "max-w-lg",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-7xl",
    full: "max-w-none",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className={cn(
        "mx-auto px-4 md:px-6 lg:px-8 py-8",
        maxWidthStyles[maxWidth],
        className
      )}>
        {children}
      </div>
    </div>
  );
}
