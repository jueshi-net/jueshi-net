import { cn } from "@/lib/utils";

interface PostContentProps {
  content: string;
  className?: string;
}

/**
 * PostContent — 帖子内容展示（纯文本渲染，禁止 HTML）
 */
export function PostContent({ content, className }: PostContentProps) {
  return (
    <div
      className={cn(
        "whitespace-pre-wrap break-words text-gray-800 dark:text-gray-200 leading-relaxed text-base",
        className
      )}
    >
      {content}
    </div>
  );
}
