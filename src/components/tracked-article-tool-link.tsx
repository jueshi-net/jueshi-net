"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/analytics";

interface TrackedArticleToolLinkProps {
  href: string;
  toolName: string;
  children: React.ReactNode;
}

export function TrackedArticleToolLink({
  href,
  toolName,
  children,
}: TrackedArticleToolLinkProps) {
  return (
    <Link href={href} onClick={() => trackEvent.articleToolClick(toolName)}>
      {children}
    </Link>
  );
}
