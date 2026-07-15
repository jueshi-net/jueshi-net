import { ReactNode } from "react";

interface Props {
  title: string;
  children: ReactNode;
  toolbar?: ReactNode;
  actions?: ReactNode;
  variant?: "table" | "form" | "detail";
  showSidebar?: boolean;  // 控制是否显示侧边栏
  showHeader?: boolean;   // 控制是否显示头部
}

export default function AdminPageFrame({ 
  title, 
  children, 
  toolbar, 
  actions,
  variant = "table",
  showSidebar = false,  // 默认不显示侧边栏
  showHeader = true    // 默认显示头部
}: Props) {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className={`flex-1 overflow-x-hidden ${showHeader ? 'pt-4' : 'pt-4'} pb-8 px-4 md:px-8`}>
        <div className="mb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
            </div>
            {actions && <div className="flex-shrink-0">{actions}</div>}
          </div>
        </div>
        
        {toolbar && (
          <div className="mb-6">
            {toolbar}
          </div>
        )}
        
        <div className={`bg-white rounded-lg shadow-sm border p-6 ${variant === 'table' ? 'overflow-x-auto' : ''}`}>
          {children}
        </div>
      </main>
    </div>
  );
}
