"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function CommunityAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    // 社区列表页浏览
    if (pathname === "/community") {
      fetch("/api/analytics/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: "community_list_view",
          toolName: "community",
          action: "view",
          path: "/community",
        }),
      }).catch(() => {
        // 静默失败，不影响页面浏览
      });
    }

    // 社区文章页浏览
    if (pathname.startsWith("/community/") && pathname !== "/community") {
      const slug = pathname.split("/community/")[1];
      fetch("/api/analytics/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: "community_article_view",
          toolName: "community",
          action: "view",
          path: pathname,
          metadata: { slug },
        }),
      }).catch(() => {
        // 静默失败，不影响页面浏览
      });
    }
  }, [pathname]);

  return null;
}

export function trackCTAClick(slug: string, toolSlug: string) {
  fetch("/api/analytics/event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      eventType: "community_cta_click",
      toolName: "community",
      action: "click",
      path: `/community/${slug}`,
      metadata: { slug, toolSlug },
    }),
  }).catch(() => {
    // 静默失败，不影响页面浏览
  });
}

export function trackToolContinue(slug: string, toolSlug: string) {
  fetch("/api/analytics/event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      eventType: "community_tool_continue",
      toolName: "community",
      action: "click",
      path: `/community/${slug}`,
      metadata: { slug, toolSlug },
    }),
  }).catch(() => {
    // 静默失败，不影响页面浏览
  });
}
