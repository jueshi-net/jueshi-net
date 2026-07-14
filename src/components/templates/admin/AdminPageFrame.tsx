import { ReactNode } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

interface Props {
  title: string;
  children: ReactNode;
  toolbar?: ReactNode;
  variant?: "table" | "form" | "detail";
}

export default function AdminPageFrame({ 
  title, 
  children, 
  toolbar, 
  variant = "table" 
}: Props) {
  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      
      <main className="flex-1 overflow-x-hidden pt-16 pb-8 px-4 md:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        </div>
        
        {toolbar && (
          <div className="mb-6">
            {toolbar}
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
