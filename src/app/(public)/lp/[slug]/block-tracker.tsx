"use client";

import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/analytics";

interface BlockTrackerProps {
  slug: string;
  visibleBlocks: string[];
}

/**
 * Client component that tracks landing page block views via IntersectionObserver.
 * Fires landing_page_block_view when a block scrolls into the viewport.
 */
export function BlockViewTracker({ slug, visibleBlocks }: BlockTrackerProps) {
  const trackedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (typeof window === "undefined" || !visibleBlocks.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const blockName = entry.target.getAttribute("data-block");
            if (blockName && !trackedRef.current.has(blockName)) {
              trackedRef.current.add(blockName);
              trackEvent.landingPageBlockView(slug, blockName);
            }
          }
        });
      },
      { threshold: 0.2 }
    );

    // Observe all elements with data-block attribute
    const elements = document.querySelectorAll("[data-block]");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [slug, visibleBlocks]);

  return null;
}

/**
 * Client wrapper for clickable blocks that tracks landing_page_block_click.
 */
export function BlockClickTracker({
  slug,
  blockName,
  children,
  target,
}: {
  slug: string;
  blockName: string;
  children: React.ReactNode;
  target?: string;
}) {
  return (
    <div
      onClick={() => trackEvent.landingPageBlockClick(slug, blockName, target)}
      style={{ display: "contents" }}
    >
      {children}
    </div>
  );
}
