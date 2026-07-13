# Workspace Page Migration: /workspace/memos

## Context
You are migrating /workspace/memos to use the shared WorkspacePageFrame component.

## Current State
- Page file: src/app/(workspace)/workspace/memos/page.tsx
- Client file: src/app/(workspace)/workspace/memos/memos-client.tsx
- Current structure: Uses max-w-7xl mx-auto wrapper
- No RightRail currently

## Target State
1. Import and wrap content with WorkspacePageFrame
2. Pass WorkspaceRightRail as rightRail prop
3. Remove max-w-7xl mx-auto from client component
4. Keep all business logic intact
5. Optimize mobile layout and touch targets

## Required Changes

### page.tsx
```typescript
import WorkspacePageFrame from "@/components/workspace/WorkspacePageFrame";
import WorkspaceRightRail from "@/components/workspace/WorkspaceRightRail";

// In the component, wrap MemosClient with WorkspacePageFrame
// Pass WorkspaceRightRail with required props (fetch data if needed)
```

### memos-client.tsx
```typescript
// Remove: <div className="max-w-7xl mx-auto">
// Keep all content inside, just remove the wrapper
```

## Constraints
- Do NOT modify business logic
- Do NOT modify API calls
- Do NOT modify data fetching
- Do NOT add new dependencies
- Preserve all existing functionality
- Optimize for mobile (390px width)
- Ensure touch targets are at least 44px

## Success Criteria
- Page renders without errors
- Mobile layout works (390px)
- Desktop layout shows 3-column structure
- RightRail appears on desktop
- All existing features work
- No horizontal scroll on mobile

## Output
After completing changes, output:
```
WORKSPACE_PAGE_MIGRATION_COMPLETE
ACTUAL_CHANGED_FILES=src/app/(workspace)/workspace/memos/page.tsx,src/app/(workspace)/workspace/memos/memos-client.tsx
COMPLETED_UI_IMPROVEMENTS=Removed max-width wrapper, Added WorkspacePageFrame, Added RightRail, Optimized mobile layout
```
