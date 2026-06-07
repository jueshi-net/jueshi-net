"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/analytics";

interface TrackedResourceLinkProps {
  href: string;
  isExternal: boolean;
  isTemplate: boolean;
  category: string;
  children: React.ReactNode;
  className?: string;
}

export function TrackedResourceLink({
  href,
  isExternal,
  isTemplate,
  category,
  children,
  className,
}: TrackedResourceLinkProps) {
  return (
    <Link
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      onClick={() => trackEvent.resourceClick(category)}
      className={className}
    >
      {children}
    </Link>
  );
}
