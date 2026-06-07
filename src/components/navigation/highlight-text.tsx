interface HighlightTextProps {
  text: string;
  keyword: string;
  className?: string;
}

export default function HighlightText({ text, keyword, className }: HighlightTextProps) {
  if (!keyword || !text) {
    return <span className={className}>{text}</span>;
  }

  // 使用拼音匹配找到匹配位置
  const matchIndex = findMatchIndex(text, keyword);
  
  if (matchIndex === -1) {
    return <span className={className}>{text}</span>;
  }

  // 找到匹配的结束位置
  const matchEnd = matchIndex + keyword.length;
  
  // 如果 keyword 比实际匹配长，使用实际匹配长度
  const actualEnd = Math.min(matchEnd, text.length);

  const before = text.slice(0, matchIndex);
  const matched = text.slice(matchIndex, actualEnd);
  const after = text.slice(actualEnd);

  return (
    <span className={className}>
      {before}
      <mark className="bg-yellow-200 text-gray-900 rounded px-0.5 font-medium">
        {matched}
      </mark>
      {after}
    </span>
  );
}

// 简单的拼音/文本匹配查找
function findMatchIndex(text: string, keyword: string): number {
  if (!text || !keyword) return -1;
  
  const lowerText = text.toLowerCase();
  const lowerKeyword = keyword.toLowerCase();
  
  // 直接匹配
  const directIndex = lowerText.indexOf(lowerKeyword);
  if (directIndex !== -1) return directIndex;
  
  // 拼音匹配（如果有 pinyin-match）
  try {
    // @ts-ignore
    const PinyinMatch = require('pinyin-match').default;
    const result = PinyinMatch.match(text, keyword);
    if (result !== false && Array.isArray(result)) {
      return result[0];
    }
  } catch {
    // 如果 pinyin-match 不可用，跳过
  }
  
  return -1;
}
