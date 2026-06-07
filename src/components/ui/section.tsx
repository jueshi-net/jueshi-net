import { cn } from "@/lib/utils";

interface SectionProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  divider?: boolean;
}

/**
 * Section — 区块容器
 *
 * 规范：
 * - 可选标题 + 描述 + 右侧操作区
 * - 可选分割线（底部边框）
 * - 内容间距统一
 */
export function Section({ title, description, action, children, className, divider = false }: SectionProps) {
  return (
    <section className={cn(
      "py-6",
      divider && "border-b border-gray-200 pb-8",
      className
    )}>
      {title && (
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            {description && (
              <p className="text-sm text-gray-500 mt-1">{description}</p>
            )}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
