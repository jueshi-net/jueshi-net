import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

interface PageHeaderProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  backHref?: string;
}

export default function PageHeader({ icon, title, description, action, backHref }: PageHeaderProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 md:p-6 mb-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {backHref && (
            <Link 
              href={backHref} 
              className="flex-shrink-0 p-1.5 rounded-lg hover:bg-gray-100 transition-colors mt-0.5"
            >
              <ChevronLeft className="w-4 h-4 text-gray-500" />
            </Link>
          )}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-600">
              {icon}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg md:text-xl font-bold text-gray-900 truncate">{title}</h1>
              {description && (
                <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{description}</p>
              )}
            </div>
          </div>
        </div>
        {action && (
          <div className="flex-shrink-0">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}
