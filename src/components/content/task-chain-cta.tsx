import Link from "next/link";
import { Zap, ArrowRight } from "lucide-react";

interface TaskChainCtaProps {
  /** Title text for the CTA */
  title?: string;
  /** Description text */
  description?: string;
  /** Button text */
  buttonText?: string;
  /** Task chain URL */
  href?: string;
  /** Optional CSS class */
  className?: string;
}

/**
 * Reusable Task Chain CTA banner.
 * Renders a prominent call-to-action linking to the shipping task chain.
 * - Unauthenticated users will be redirected to login by the workspace route.
 * - Authenticated users go directly to the task chain.
 * - Visible on mobile, does not block content.
 */
export default function TaskChainCta({
  title = "开始跨境发货任务链",
  description = "把本页步骤加入发货任务链，使用工具生成发票/装箱单草稿，一步步完成跨境发货。",
  buttonText = "开始跨境发货任务链",
  href = "/workspace/task-chains/shipping/new",
  className = "",
}: TaskChainCtaProps) {
  return (
    <section
      className={`mt-8 rounded-xl border border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50 p-6 ${className}`}
      aria-label="任务链入口"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center flex-shrink-0">
          <Zap className="w-6 h-6 text-teal-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-lg mb-1">{title}</h3>
          <p className="text-gray-600 text-sm">{description}</p>
        </div>
        <Link
          href={href}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors shadow-sm min-h-[44px] whitespace-nowrap"
        >
          {buttonText}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
