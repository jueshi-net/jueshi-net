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

  // Both rails: three-column layout
  if (leftRail && rightRail) {
    return (
      <div className="flex gap-4 pb-8">
        {/* Left rail: 240px, hidden on mobile */}
        <div className="hidden xl:block w-[240px] flex-shrink-0">
          {leftRail}
        </div>
        
        {/* Main content: flexible */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
        
        {/* Right rail: 260px, hidden on mobile */}
        <div className="hidden lg:block w-[260px] flex-shrink-0">
          {rightRail}
        </div>
      </div>
    );
  }

  // Only right rail: two-column
  if (rightRail) {
    return (
      <div className="flex gap-4 pb-8">
        <main className="flex-1 min-w-0">
          {children}
        </main>
        <div className="hidden lg:block w-[260px] flex-shrink-0">
          {rightRail}
        </div>
      </div>
    );
  }

  // Only left rail
  return (
    <div className="flex gap-4 pb-8">
      <div className="hidden xl:block w-[240px] flex-shrink-0">
        {leftRail}
      </div>
      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  );
}
