import React from 'react';

interface WorkspacePageFrameProps {
  children: React.ReactNode;
  rightRail?: React.ReactNode;
}

export default function WorkspacePageFrame({ 
  children, 
  rightRail 
}: WorkspacePageFrameProps) {
  if (!rightRail) {
    return (
      <div className="pb-8">
        <main className="min-w-0">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-6 pb-8">
      <main className="min-w-0">
        {children}
      </main>
      {rightRail}
    </div>
  );
}
