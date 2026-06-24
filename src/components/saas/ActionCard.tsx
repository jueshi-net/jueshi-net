'use client';

import { ReactNode } from 'react';
import Link from 'next/link';

interface ActionCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  href?: string;
  onClick?: () => void;
  badge?: string;
  className?: string;
}

export function ActionCard({ title, description, icon, href, onClick, badge, className = '' }: ActionCardProps) {
  const content = (
    <div className={`group bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md hover:border-teal-200 transition-all cursor-pointer ${className}`}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
            {badge && (
              <span className="flex-shrink-0 px-2 py-0.5 text-xs font-medium bg-teal-50 text-teal-700 rounded-full">
                {badge}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  if (onClick) {
    return <div onClick={onClick}>{content}</div>;
  }

  return content;
}
