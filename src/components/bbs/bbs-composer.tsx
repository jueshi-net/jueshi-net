"use client";

import { useState, useRef, useCallback } from "react";
import { Bold, Italic, Heading, List, ListOrdered, Quote, Code, Link2, Smile, Eye, EyeOff } from "lucide-react";

interface BbsComposerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
}

const EMOJI_LIST = [
  "😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "🙃",
  "😉", "😊", "😇", "🥰", "😍", "🤩", "😘", "😗", "😚", "😙",
  "👍", "👎", "👌", "✌️", "🤞", "🤟", "🤙", "👋", "🤚", "✋",
  "🎉", "🎊", "🎈", "🎁", "🏆", "🥇", "🥈", "🥉", "🎯", "⭐",
  "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "💔", "❣️",
  "📦", "🚢", "✈️", "🚚", "📮", "📋", "✏️", "💡", "🔍", "⚙️",
  "✅", "❌", "⚠️", "🔴", "🟡", "🟢", "📍", "🗺️", "💰", "📝",
];

export function BbsComposer({ value, onChange, placeholder, maxLength = 3000 }: BbsComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const insertText = useCallback((before: string, after: string = "", placeholderText: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end) || placeholderText;
    const newValue = value.slice(0, start) + before + selected + after + value.slice(end);

    onChange(newValue);

    // Restore cursor position after React re-render
    requestAnimationFrame(() => {
      textarea.focus();
      const newPos = start + before.length + selected.length;
      textarea.setSelectionRange(newPos, newPos);
    });
  }, [value, onChange]);

  const insertLine = useCallback((prefix: string, placeholderText: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end) || placeholderText;
    const newValue = value.slice(0, start) + prefix + selected + value.slice(end);

    onChange(newValue);

    requestAnimationFrame(() => {
      textarea.focus();
      const newPos = start + prefix.length + selected.length;
      textarea.setSelectionRange(newPos, newPos);
    });
  }, [value, onChange]);

  const insertEmoji = useCallback((emoji: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newValue = value.slice(0, start) + emoji + value.slice(end);

    onChange(newValue);

    requestAnimationFrame(() => {
      textarea.focus();
      const newPos = start + emoji.length;
      textarea.setSelectionRange(newPos, newPos);
    });
  }, [value, onChange]);

  const toolbarBtn = "p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors";

  return (
    <div className="border border-slate-300 rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-slate-200 bg-slate-50">
        <button type="button" className={toolbarBtn} title="加粗" onClick={() => insertText("**", "**", "加粗文字")}>
          <Bold className="w-4 h-4" />
        </button>
        <button type="button" className={toolbarBtn} title="斜体" onClick={() => insertText("*", "*", "斜体文字")}>
          <Italic className="w-4 h-4" />
        </button>
        <button type="button" className={toolbarBtn} title="标题" onClick={() => insertLine("## ", "标题文字")}>
          <Heading className="w-4 h-4" />
        </button>
        <div className="w-px h-5 bg-slate-200 mx-1" />
        <button type="button" className={toolbarBtn} title="无序列表" onClick={() => insertLine("- ", "列表项")}>
          <List className="w-4 h-4" />
        </button>
        <button type="button" className={toolbarBtn} title="编号列表" onClick={() => insertLine("1. ", "列表项")}>
          <ListOrdered className="w-4 h-4" />
        </button>
        <button type="button" className={toolbarBtn} title="引用" onClick={() => insertLine("> ", "引用内容")}>
          <Quote className="w-4 h-4" />
        </button>
        <button type="button" className={toolbarBtn} title="代码" onClick={() => insertText("`", "`", "code")}>
          <Code className="w-4 h-4" />
        </button>
        <button type="button" className={toolbarBtn} title="链接" onClick={() => insertText("[", "](https://)", "链接文字")}>
          <Link2 className="w-4 h-4" />
        </button>
        <div className="w-px h-5 bg-slate-200 mx-1" />
        <button
          type="button"
          className={`${toolbarBtn} ${showEmoji ? "bg-slate-200 text-slate-900" : ""}`}
          title="表情"
          onClick={() => setShowEmoji(!showEmoji)}
        >
          <Smile className="w-4 h-4" />
        </button>
        <button
          type="button"
          className={`${toolbarBtn} ml-auto ${showPreview ? "bg-slate-200 text-slate-900" : ""}`}
          title="预览"
          onClick={() => setShowPreview(!showPreview)}
        >
          {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {/* Emoji picker */}
      {showEmoji && (
        <div className="border-b border-slate-200 p-2 bg-white max-h-32 overflow-y-auto">
          <div className="grid grid-cols-10 gap-1">
            {EMOJI_LIST.map((emoji, i) => (
              <button
                key={i}
                type="button"
                className="text-lg p-1 rounded hover:bg-slate-100 transition-colors"
                onClick={() => {
                  insertEmoji(emoji);
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Preview or textarea */}
      {showPreview ? (
        <div className="p-4 min-h-[280px] text-slate-800 text-[15px] leading-relaxed whitespace-pre-wrap break-words">
          {renderMarkdownPreview(value)}
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "请输入帖子内容（支持 Markdown 排版）"}
          maxLength={maxLength}
          rows={12}
          className="w-full px-4 py-3 text-slate-800 text-[15px] leading-relaxed border-0 focus:outline-none focus:ring-0 resize-y min-h-[280px] placeholder:text-slate-400"
        />
      )}

      {/* Bottom bar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-t border-slate-200 bg-slate-50">
        <span className="text-xs text-slate-500">支持 Markdown: **加粗** *斜体* ## 标题 - 列表</span>
        <span className="text-xs text-slate-500">{value.length}/{maxLength}</span>
      </div>
    </div>
  );
}

/** Simple markdown preview renderer */
function renderMarkdownPreview(text: string): React.ReactNode {
  if (!text.trim()) {
    return <span className="text-slate-400">暂无内容预览</span>;
  }

  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];

  lines.forEach((line, i) => {
    if (!line.trim()) {
      elements.push(<div key={i} className="h-3" />);
      return;
    }

    // Heading
    if (line.startsWith("## ")) {
      elements.push(<h2 key={i} className="text-lg font-bold text-slate-900 mt-3 mb-1">{line.slice(3)}</h2>);
    } else if (line.startsWith("# ")) {
      elements.push(<h1 key={i} className="text-xl font-bold text-slate-900 mt-3 mb-1">{line.slice(2)}</h1>);
    } else if (line.startsWith("### ")) {
      elements.push(<h3 key={i} className="text-base font-bold text-slate-900 mt-2 mb-1">{line.slice(4)}</h3>);
    } else if (line.startsWith("> ")) {
      elements.push(
        <blockquote key={i} className="border-l-4 border-brand/40 bg-slate-50 pl-3 py-1 text-slate-700 text-sm">
          {line.slice(2)}
        </blockquote>
      );
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      elements.push(
        <div key={i} className="pl-4 text-slate-700">• {line.slice(2)}</div>
      );
    } else if (/^\d+\.\s/.test(line)) {
      const match = line.match(/^(\d+)\.\s(.+)/);
      elements.push(
        <div key={i} className="pl-4 text-slate-700">{match?.[1]}. {match?.[2]}</div>
      );
    } else if (line.startsWith("```")) {
      elements.push(<div key={i} className="bg-slate-800 text-slate-100 p-2 rounded text-sm font-mono">代码块</div>);
    } else {
      // Inline formatting
      elements.push(<p key={i} className="text-slate-700">{renderInlinePreview(line)}</p>);
    }
  });

  return <>{elements}</>;
}

function renderInlinePreview(text: string): React.ReactNode {
  // Simple inline preview
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    const bold = remaining.match(/\*\*(.+?)\*\*/);
    const code = remaining.match(/`(.+?)`/);

    const matches = [
      bold ? { match: bold, index: bold.index! } : null,
      code ? { match: code, index: code.index! } : null,
    ].filter(Boolean) as { match: RegExpMatchArray; index: number }[];

    if (matches.length === 0) {
      parts.push(remaining);
      break;
    }

    matches.sort((a, b) => a.index - b.index);
    const earliest = matches[0];

    if (earliest.index > 0) {
      parts.push(remaining.slice(0, earliest.index));
    }

    if (earliest.match[0].startsWith("**")) {
      parts.push(<strong key={key++} className="font-bold text-slate-900">{earliest.match[1]}</strong>);
    } else {
      parts.push(<code key={key++} className="px-1 bg-slate-100 text-slate-800 rounded text-sm font-mono">{earliest.match[1]}</code>);
    }

    remaining = remaining.slice(earliest.index + earliest.match[0].length);
  }

  return parts.length > 0 ? parts : text;
}
