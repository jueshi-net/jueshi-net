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

  // Both rails: three-column on xl+, two-column on lg (left rail hidden), single on mobile
  if (leftRail && rightRail) {
    return (
      <div className="pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)_280px] xl:grid-cols-[260px_minmax(0,1fr)_280px] gap-4">
          {/* Left rail: hidden on mobile, visible on lg+ */}
          <div className="hidden lg:block">
            {leftRail}
          </div>
          
          {/* Main content */}
          <main className="min-w-0">
            {children}
          </main>
          
          {/* Right rail: hidden on mobile, visible on lg+ */}
          <div className="hidden lg:block">
            {rightRail}
          </div>
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
        <div className="hidden lg:block">
          {rightRail}
        </div>
      </div>
    );
  }

  // Only left rail
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-4 pb-8">
      <div className="hidden lg:block">
        {leftRail}
      </div>
      <main className="min-w-0">
        {children}
      </main>
    </div>
  );
}
