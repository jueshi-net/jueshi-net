"use client";

import { highlightSearchMatch, type HighlightSegment } from "@/lib/community/search";

interface SearchHighlightProps {
  text: string;
  query: string;
  maxLength?: number;
}

/**
 * Renders text with highlighted search query matches.
 */
export function SearchHighlight({ text, query, maxLength = 200 }: SearchHighlightProps) {
  const segments: HighlightSegment[] = highlightSearchMatch(text, query, maxLength);

  return (
    <>
      {segments.map((seg, i) => (
        <span
          key={i}
          className={
            seg.highlighted
              ? "bg-yellow-100 font-medium text-yellow-900"
              : ""
          }
        >
          {seg.text}
        </span>
      ))}
    </>
  );
}
