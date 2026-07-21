import { ReactNode } from 'react';

interface ResourcePortalSectionProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
  bodyClassName?: string;
}

/**
 * Section wrapper with a titled header bar — used for sidebar panels and
 * featured/ad blocks in the resource portal.
 */
export function ResourcePortalSection({
  title,
  icon,
  children,
  action,
  className = '',
  bodyClassName = 'p-5',
}: ResourcePortalSectionProps) {
  return (
    <section className={`bg-white rounded-xl border border-border shadow-card ${className}`}>
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border-light">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-sm font-bold text-title">{title}</h3>
        </div>
        {action}
      </div>
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

export default ResourcePortalSection;
