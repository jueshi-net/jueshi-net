import { ReactNode } from "react";

interface Props {
  title: string;
  subtitle?: string;
  breadcrumbs?: ReactNode;
  children: ReactNode;
  sidebar?: ReactNode;
  cta?: ReactNode;
  variant?: "content" | "tool" | "form";
}

export function PublicLandingPageFrame({ 
  title, 
  subtitle, 
  breadcrumbs, 
  children, 
  sidebar, 
  cta, 
  variant = "content" 
}: Props) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {breadcrumbs}
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
        {subtitle && <p className="text-lg text-gray-600">{subtitle}</p>}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className={`flex-1 ${variant === 'content' ? 'max-w-3xl mx-auto' : ''}`}>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            {children}
          </div>
          
          {cta && (
            <div className="mt-8">
              {cta}
            </div>
          )}
        </div>
        
        {sidebar && (
          <aside className="lg:w-1/3">
            {sidebar}
          </aside>
        )}
      </div>
    </div>
  );
}
