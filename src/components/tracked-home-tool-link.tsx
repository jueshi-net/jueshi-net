"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/analytics";

interface TrackedHomeToolLinkProps {
  href: string;
  toolName: string;
  children: React.ReactNode;
  className?: string;
}

export function TrackedHomeToolLink({
  href,
  toolName,
  children,
  className,
}: TrackedHomeToolLinkProps) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => trackEvent.homeToolClick(toolName)}
    >
      {children}
    </Link>
  );
}
