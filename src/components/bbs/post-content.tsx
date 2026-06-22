import { cn } from "@/lib/utils";
import Link from "next/link";

interface PostContentProps {
  content: string;
  className?: string;
}

/**
 * PostContent — 帖子内容渲染（安全 Markdown 子集，禁止 HTML）
 *
 * 支持: #/##/### 标题, **bold**, *italic*, `code`, > quote,
 *      -/* 列表, 1. 编号列表, [link](url), --- 分隔线
 */
export function PostContent({ content, className }: PostContentProps) {
  const blocks = parseMarkdown(content);

  return (
    <div
      className={cn(
        "text-slate-800 leading-relaxed text-[15px] space-y-3 break-words",
        className
      )}
    >
      {blocks.map((block, i) => {
        switch (block.type) {
          case "h1":
            return (
              <h1 key={i} className="text-xl font-bold text-slate-900 mt-4 mb-2">
                {renderInline(block.content)}
              </h1>
            );
          case "h2":
            return (
              <h2 key={i} className="text-lg font-bold text-slate-900 mt-4 mb-2 pb-1 border-b border-slate-200">
                {renderInline(block.content)}
              </h2>
            );
          case "h3":
            return (
              <h3 key={i} className="text-base font-bold text-slate-900 mt-3 mb-1.5">
                {renderInline(block.content)}
              </h3>
            );
          case "quote":
            return (
              <blockquote key={i} className="border-l-4 border-brand/40 bg-slate-50 pl-4 pr-3 py-2.5 rounded-r-lg text-slate-700 text-sm">
                {block.content.split("\n").map((line, j) => (
                  <p key={j} className={j > 0 ? "mt-1" : ""}>{renderInline(line)}</p>
                ))}
              </blockquote>
            );
          case "ul":
            return (
              <ul key={i} className="list-disc list-outside pl-5 space-y-1 text-slate-700">
                {block.items?.map((item, j) => (
                  <li key={j} className="leading-relaxed">{renderInline(item)}</li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={i} className="list-decimal list-outside pl-5 space-y-1 text-slate-700">
                {block.items?.map((item, j) => (
                  <li key={j} className="leading-relaxed">{renderInline(item)}</li>
                ))}
              </ol>
            );
          case "code":
            return (
              <pre key={i} className="bg-slate-800 text-slate-100 rounded-lg p-3 overflow-x-auto text-sm font-mono">
                <code>{block.content}</code>
              </pre>
            );
          case "hr":
            return <hr key={i} className="border-slate-200 my-3" />;
          case "p":
          default:
            return (
              <p key={i} className="text-slate-700 leading-relaxed">
                {renderInline(block.content)}
              </p>
            );
        }
      })}
    </div>
  );
}

/** Parse markdown text into blocks */
function parseMarkdown(text: string): Block[] {
  const lines = text.split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Skip empty lines
    if (!line.trim()) {
      i++;
      continue;
    }

    // Code block ```
    if (line.trim().startsWith("```")) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      blocks.push({ type: "code", content: codeLines.join("\n") });
      continue;
    }

    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      blocks.push({ type: "hr", content: "" });
      i++;
      continue;
    }

    // Headings
    const h1 = line.match(/^#\s+(.+)/);
    if (h1) {
      blocks.push({ type: "h1", content: h1[1] });
      i++;
      continue;
    }
    const h2 = line.match(/^##\s+(.+)/);
    if (h2) {
      blocks.push({ type: "h2", content: h2[1] });
      i++;
      continue;
    }
    const h3 = line.match(/^###\s+(.+)/);
    if (h3) {
      blocks.push({ type: "h3", content: h3[1] });
      i++;
      continue;
    }

    // Quote
    if (line.trim().startsWith(">")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      blocks.push({ type: "quote", content: quoteLines.join("\n") });
      continue;
    }

    // Unordered list
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ""));
        i++;
      }
      blocks.push({ type: "ul", content: "", items });
      continue;
    }

    // Ordered list
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ""));
        i++;
      }
      blocks.push({ type: "ol", content: "", items });
      continue;
    }

    // Paragraph (collect consecutive non-empty, non-special lines)
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith("#") &&
      !lines[i].trim().startsWith(">") &&
      !/^\s*[-*]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i]) &&
      !lines[i].trim().startsWith("```") &&
      !/^---+$/.test(lines[i].trim())
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      blocks.push({ type: "p", content: paraLines.join("\n") });
    }
  }

  return blocks;
}

/** Render inline formatting: **bold**, *italic*, `code`, [link](url) */
function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Bold **text**
    const bold = remaining.match(/\*\*(.+?)\*\*/);
    // Italic *text*
    const italic = remaining.match(/\*(.+?)\*/);
    // Code `text`
    const code = remaining.match(/`(.+?)`/);
    // Link [text](url)
    const link = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/);

    // Find the earliest match
    const matches = [
      bold ? { type: "bold", match: bold, index: bold.index! } : null,
      italic ? { type: "italic", match: italic, index: italic.index! } : null,
      code ? { type: "code", match: code, index: code.index! } : null,
      link ? { type: "link", match: link, index: link.index! } : null,
    ].filter(Boolean) as { type: string; match: RegExpMatchArray; index: number }[];

    if (matches.length === 0) {
      parts.push(remaining);
      break;
    }

    matches.sort((a, b) => a.index - b.index);
    const earliest = matches[0];

    // Push text before the match
    if (earliest.index > 0) {
      parts.push(remaining.slice(0, earliest.index));
    }

    switch (earliest.type) {
      case "bold":
        parts.push(
          <strong key={key++} className="font-bold text-slate-900">
            {earliest.match[1]}
          </strong>
        );
        break;
      case "italic":
        parts.push(
          <em key={key++} className="italic">
            {earliest.match[1]}
          </em>
        );
        break;
      case "code":
        parts.push(
          <code key={key++} className="px-1.5 py-0.5 bg-slate-100 text-slate-800 rounded text-sm font-mono">
            {earliest.match[1]}
          </code>
        );
        break;
      case "link":
        parts.push(
          <Link
            key={key++}
            href={earliest.match[2]}
            className="text-brand underline hover:text-brand-dark"
            target={earliest.match[2].startsWith("http") ? "_blank" : undefined}
            rel={earliest.match[2].startsWith("http") ? "noopener noreferrer" : undefined}
          >
            {earliest.match[1]}
          </Link>
        );
        break;
    }

    remaining = remaining.slice(earliest.index + earliest.match[0].length);
  }

  return parts;
}

type Block = {
  type: "h1" | "h2" | "h3" | "p" | "quote" | "ul" | "ol" | "code" | "hr";
  content: string;
  items?: string[];
};
