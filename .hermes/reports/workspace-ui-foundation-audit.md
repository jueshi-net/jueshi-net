# Workspace UI Foundation Audit Report

**Audit Date:** 2026-07-13
**Base Commit:** 74cdd03

## Repeated Layout Rules

### Common Grid Pattern
All three pages use identical grid structure:
```tsx
<div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-6 pb-8">
  <main className="min-w-0">
    {/* Page Content */}
  </main>
  <WorkspaceRightRail ... />
</div>
```

### Page-Specific Frame Classes

**WORKSPACE_HOME_FRAME_CLASSES:**
- File: `src/app/(workspace)/workspace/page.tsx`
- Grid: `grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-6 pb-8`
- Main: `min-w-0`
- RightRail: Direct instance with props

**NOTIFICATIONS_FRAME_CLASSES:**
- File: `src/app/(workspace)/workspace/notifications/page.tsx`
- Grid: `grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-6 pb-8`
- Main: `min-w-0`
- RightRail: Direct instance with props

**DOCUMENTS_FRAME_CLASSES:**
- File: `src/app/(workspace)/workspace/documents/page.tsx`
- Grid: `grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-6 pb-8`
- Main: `min-w-0`
- RightRail: Direct instance with props

## Extraction Analysis

**REPEATED_LAYOUT_RULES:**
1. Grid container: `grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-6 pb-8`
2. Main column: `min-w-0`
3. RightRail positioning: Second grid child
4. Bottom padding: `pb-8` on grid container

**PAGE_SPECIFIC_RULES:**
- All three pages pass different props to WorkspaceRightRail
- Props include: `unreadNotifs`, `badgeCount`, `recentMemos`, `userId`
- Props are computed from page-specific data fetching

**EXTRACTION_SAFE:** true

### Justification
1. Grid structure is 100% identical across all three pages
2. Main column constraints are identical
3. RightRail component is the same, only props differ
4. No page-specific layout variations detected
5. All pages use same spacing (gap-6, pb-8)

## Recommended Component Interface

```tsx
interface WorkspacePageFrameProps {
  children: React.ReactNode;
  rightRail: React.ReactNode;
}

export default function WorkspacePageFrame({ 
  children, 
  rightRail 
}: WorkspacePageFrameProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-6 pb-8">
      <main className="min-w-0">
        {children}
      </main>
      {rightRail}
    </div>
  );
}
```

## Migration Plan

### Files to Modify
1. **NEW:** `src/components/workspace/WorkspacePageFrame.tsx`
2. **MODIFY:** `src/app/(workspace)/workspace/page.tsx`
3. **MODIFY:** `src/app/(workspace)/workspace/notifications/page.tsx`
4. **MODIFY:** `src/app/(workspace)/workspace/documents/page.tsx`

### Expected Changes
- Remove duplicate grid wrapper from each page
- Replace with `<WorkspacePageFrame rightRail={<WorkspaceRightRail ... />}>`
- Preserve all business logic and data fetching
- Maintain identical visual appearance
