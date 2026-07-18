import React from 'react';

interface WorkspacePageFrameProps {
  children: React.ReactNode;
  leftRail?: React.ReactNode;
  rightRail?: React.ReactNode;
}

export default function WorkspacePageFrame({ 
  children, 
  leftRail,
  rightRail 
}: WorkspacePageFrameProps) {
  // No rails: single column
  if (!leftRail && !rightRail) {
    return (
      <div className="pb-8">
        <main className="min-w-0">
          {children}
        </main>
      </div>
    );
  }

  // Both rails: three-column on xl, two-column on lg (left rail collapses into top), single on mobile
  if (leftRail && rightRail) {
    return (
      <div className="pb-8">
        {/* Left rail: visible on xl+, hidden on smaller screens (info merges into top banner) */}
        <div className="hidden xl:block float-left w-[260px] mr-4">
          {leftRail}
        </div>
        
        {/* Main + Right rail grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-4">
          <main className="min-w-0">
            {children}
          </main>
          {rightRail}
        </div>
      </div>
    );
  }

  // Only right rail: two-column
  if (rightRail) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-4 pb-8">
        <main className="min-w-0">
          {children}
        </main>
        {rightRail}
      </div>
    );
  }

  // Only left rail
  return (
    <div className="pb-8">
      <div className="hidden xl:block float-left w-[260px] mr-4">
        {leftRail}
      </div>
      <main className="min-w-0">
        {children}
      </main>
    </div>
  );
}
