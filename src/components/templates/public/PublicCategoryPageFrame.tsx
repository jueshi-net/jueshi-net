import { ReactNode } from "react";

interface Props {
  title: string;
  subtitle?: string;
  children: ReactNode;
  filters?: ReactNode;
  sidebar?: ReactNode;
}

export function PublicCategoryPageFrame({ 
  title, 
  subtitle, 
  children, 
  filters, 
  sidebar 
}: Props) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
        {subtitle && <p className="text-lg text-gray-600">{subtitle}</p>}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {sidebar && (
          <aside className="lg:w-1/4">
            {sidebar}
          </aside>
        )}
        
        <div className="flex-1">
          {filters && (
            <div className="mb-6">
              {filters}
            </div>
          )}
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
