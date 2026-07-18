"use client";

import { useMemo } from "react";
import { AlertCircle, CheckCircle, Info, Link2, Tag, Type, FileText, Clock, BookOpen } from "lucide-react";

interface PostQualityAssistantProps {
  title: string;
  content: string;
  tagCount: number;
  categoryId: string;
}

interface QualityCheck {
  level: "ok" | "warning" | "info";
  message: string;
  icon: typeof CheckCircle;
}

const URL_REGEX = /https?:\/\/[^\s]+/gi;
const MIN_TITLE_LENGTH = 5;
const MAX_TITLE_LENGTH = 100;
const MIN_CONTENT_LENGTH = 20;
const MAX_LINKS = 5;
const MAX_TAGS = 5;
const DUPLICATE_THRESHOLD = 0.8;

export function PostQualityAssistant({
  title,
  content,
  tagCount,
}: PostQualityAssistantProps) {
  const checks = useMemo<QualityCheck[]>(() => {
    const results: QualityCheck[] = [];

    // Title length check
    const titleLen = title.trim().length;
    if (titleLen === 0) {
      results.push({
        level: "info",
        message: "标题至少 5 个字符",
        icon: Type,
      });
    } else if (titleLen < MIN_TITLE_LENGTH) {
      results.push({
        level: "warning",
        message: `标题较短（${titleLen} 字），建议补充更多描述`,
        icon: AlertCircle,
      });
    } else if (titleLen > MAX_TITLE_LENGTH) {
      results.push({
        level: "warning",
        message: `标题过长（${titleLen} 字），建议精简到 ${MAX_TITLE_LENGTH} 字以内`,
        icon: AlertCircle,
      });
    } else {
      results.push({
        level: "ok",
        message: `标题长度合适（${titleLen} 字）`,
        icon: CheckCircle,
      });
    }

    // Content length check
    const contentLen = content.trim().length;
    if (contentLen === 0) {
      results.push({
        level: "info",
        message: "正文至少 20 个字符",
        icon: FileText,
      });
    } else if (contentLen < MIN_CONTENT_LENGTH) {
      results.push({
        level: "warning",
        message: `正文较短（${contentLen} 字），详细的内容更容易获得回复`,
        icon: AlertCircle,
      });
    } else {
      results.push({
        level: "ok",
        message: `正文长度合适（${contentLen} 字）`,
        icon: CheckCircle,
      });
    }

    // External link count
    const urls = content.match(URL_REGEX) || [];
    if (urls.length === 0) {
      // No links is fine
    } else if (urls.length > MAX_LINKS) {
      results.push({
        level: "warning",
        message: `外链数量较多（${urls.length} 个），超过 ${MAX_LINKS} 个可能触发反垃圾检测`,
        icon: Link2,
      });
    } else {
      results.push({
        level: "ok",
        message: `外链数量正常（${urls.length} 个）`,
        icon: Link2,
      });
    }

    // Tag count
    if (tagCount > MAX_TAGS) {
      results.push({
        level: "warning",
        message: `标签过多（${tagCount} 个），最多 ${MAX_TAGS} 个`,
        icon: Tag,
      });
    } else if (tagCount > 0) {
      results.push({
        level: "ok",
        message: `标签数量正常（${tagCount} 个）`,
        icon: Tag,
      });
    }

    // Duplicate content check (simple: repeated paragraphs)
    const paragraphs = content.split("\n").filter((p) => p.trim().length > 10);
    if (paragraphs.length > 2) {
      const seen = new Set<string>();
      let duplicateCount = 0;
      for (const p of paragraphs) {
        const normalized = p.trim().toLowerCase();
        if (seen.has(normalized)) {
          duplicateCount++;
        }
        seen.add(normalized);
      }
      if (duplicateCount > 0) {
        results.push({
          level: "warning",
          message: `检测到 ${duplicateCount} 段重复内容，建议修改`,
          icon: AlertCircle,
        });
      }
    }

    // Consecutive character check
    const consecutiveMatch = content.match(/(.)\1{20,}/);
    if (consecutiveMatch) {
      results.push({
        level: "warning",
        message: "检测到超长连续重复字符，可能被判定为无意义内容",
        icon: AlertCircle,
      });
    }

    // Whitespace check
    const stripped = content.replace(/\s/g, "");
    if (content.length > 50 && stripped.length < content.length * 0.3) {
      results.push({
        level: "warning",
        message: "内容中空白字符占比过高，建议补充实质内容",
        icon: AlertCircle,
      });
    }

    // Pending review time estimate
    if (titleLen > 0 && contentLen > 0) {
      results.push({
        level: "info",
        message: "提交后预计 1-24 小时内完成审核",
        icon: Clock,
      });
    }

    // Rules reminder
    results.push({
      level: "info",
      message: "发帖即表示同意社区规则，违规内容将被驳回或隐藏",
      icon: BookOpen,
    });

    // Draft vs submit distinction
    if (titleLen > 0 || contentLen > 0) {
      results.push({
        level: "info",
        message: "「保存草稿」不进入审核，「提交审核」后才会被管理员处理",
        icon: Info,
      });
    }

    return results;
  }, [title, content, tagCount]);

  const warnings = checks.filter((c) => c.level === "warning");
  const hasContent = title.trim().length > 0 || content.trim().length > 0;

  if (!hasContent) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4 mt-3">
      <div className="flex items-center gap-1.5 mb-2">
        <Info className="w-4 h-4 text-brand" />
        <h4 className="text-xs font-semibold text-gray-700">发帖质量助手</h4>
        {warnings.length > 0 && (
          <span className="text-xs px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded-full">
            {warnings.length} 项注意
          </span>
        )}
      </div>
      <div className="space-y-1.5">
        {checks.map((check, idx) => {
          const Icon = check.icon;
          const colorClass =
            check.level === "ok"
              ? "text-green-500"
              : check.level === "warning"
              ? "text-amber-500"
              : "text-gray-400";
          return (
            <div key={idx} className="flex items-start gap-1.5">
              <Icon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${colorClass}`} />
              <span className={`text-xs leading-relaxed ${colorClass}`}>
                {check.message}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
