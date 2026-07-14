# Workspace 完整路由清单

生成时间: 2026-07-14
基线提交: fc236e5
构建ID: D9Uml4fnKenlyvPB_pJiq

## 一、提交关系核验

```
FINAL_HEAD=fc236e5636b3912f69e39269c4398c7c88f3ac96
INVITES_FIX_COMMIT=1088752
REVERT_TEMPLATES_COMMIT=fc236e5
ANCESTOR_CHECK=0 (1088752 是 fc236e5 的祖先)
INVITES_FIX_INCLUDED_IN_FINAL_HEAD=true
```

### 提交链
```
fc236e5 revert(templates): rollback unauthorized API change
1088752 fix(invites): add missing useState declarations in InvitesClient
41bf6bc feat(workspace/products): migrate to WorkspacePageFrame
88f7319 fix(workspace/invites): separate server and client components
2663855 feat(workspace): migrate shipping-new to WorkspacePageFrame
8bb4a6e feat(workspace): migrate shipping-detail to WorkspacePageFrame
34445b0 feat(workspace): migrate templates to WorkspacePageFrame
faa1ec4 feat(workspace): migrate invites to WorkspacePageFrame
44b30ed fix(design-system): EmptyState support object config for actions
013c443 feat(workspace): migrate 4 pages to WorkspacePageFrame
```

## 二、完整路由扫描结果

### 扫描范围
- `src/app/(workspace)/**/page.tsx`
- `src/app/(workspace)/**/page.ts`
- `src/app/(workspace)/**/page.jsx`

### 排除项
- API 路由
- Admin 页面
- Dashboard 页面（属于 /dashboard 路由组）
- 非页面文件

### Workspace 路由清单（16 个）

| # | 路由 | 页面文件 | 页面族 | 已迁移 | 使用 WorkspacePageFrame | 视觉测试 Mobile | 视觉测试 Desktop | 功能测试 | 当前状态 |
|---|------|----------|--------|--------|------------------------|-----------------|------------------|----------|----------|
| 1 | /workspace | src/app/(workspace)/workspace/page.tsx | workspace | true | true | true | true | false | 已迁移并验收 |
| 2 | /workspace/notifications | src/app/(workspace)/workspace/notifications/page.tsx | workspace | true | true | true | true | false | 已迁移并验收 |
| 3 | /workspace/documents | src/app/(workspace)/workspace/documents/page.tsx | workspace | true | true | true | true | false | 已迁移并验收 |
| 4 | /workspace/favorites | src/app/(workspace)/workspace/favorites/page.tsx | workspace | true | true | true | true | false | 已迁移并验收 |
| 5 | /workspace/memos | src/app/(workspace)/workspace/memos/page.tsx | workspace | true | true | true | true | false | 已迁移并验收 |
| 6 | /workspace/tasks | src/app/(workspace)/workspace/tasks/page.tsx | workspace | true | true | true | true | false | 已迁移并验收 |
| 7 | /workspace/member | src/app/(workspace)/workspace/member/page.tsx | workspace | true | true | true | true | false | 已迁移并验收 |
| 8 | /workspace/company-profiles | src/app/(workspace)/workspace/company-profiles/page.tsx | workspace | true | true | true | true | false | 已迁移并验收 |
| 9 | /workspace/task-chains | src/app/(workspace)/workspace/task-chains/page.tsx | workspace | true | true | true | true | false | 已迁移并验收 |
| 10 | /workspace/ad-entitlements | src/app/(workspace)/workspace/ad-entitlements/page.tsx | workspace | true | true | true | true | false | 已迁移并验收 |
| 11 | /workspace/settings | src/app/(workspace)/workspace/settings/page.tsx | workspace | true | true | true | true | false | 已迁移并验收 |
| 12 | /workspace/invites | src/app/(workspace)/workspace/invites/page.tsx | workspace | true | true | true | true | false | 已迁移并验收 |
| 13 | /workspace/templates | src/app/(workspace)/workspace/templates/page.tsx | workspace | true | true | true | true | false | 已迁移并验收 |
| 14 | /workspace/task-chains/shipping/[id] | src/app/(workspace)/workspace/task-chains/shipping/[id]/page.tsx | workspace | true | true | false | false | false | 已迁移，待视觉验收 |
| 15 | /workspace/task-chains/shipping/new | src/app/(workspace)/workspace/task-chains/shipping/new/page.tsx | workspace | true | true | true | true | false | 已迁移并验收 |
| 16 | /workspace/products | src/app/(workspace)/workspace/products/page.tsx | workspace | true | true | true | true | false | 已迁移并验收 |

## 三、统计汇总

```
TOTAL_REAL_WORKSPACE_ROUTES=16
VISUAL_ACCEPTANCE_ROUTE_COUNT_BEFORE=15
MISSING_FROM_VISUAL_ACCEPTANCE=1
MISSING_ROUTE=/workspace/task-chains/shipping/[id]
MISSING_ROUTE_REASON=动态路由需要真实 ID，未在初始视觉验收中覆盖
```

### 迁移状态
- 已迁移: 16/16 (100%)
- 使用 WorkspacePageFrame: 16/16 (100%)
- 视觉测试 Mobile: 15/16 (93.75%)
- 视觉测试 Desktop: 15/16 (93.75%)
- 功能测试: 0/16 (0%)

### 遗漏路由说明
**/workspace/task-chains/shipping/[id]** 是动态路由，需要真实的 task-chain ID 才能访问。该页面已完成迁移并部署，但未在视觉验收中覆盖，原因：
1. 需要查询数据库获取真实 ID
2. 需要确保测试账号有权限访问该任务链
3. 需要验证动态参数渲染正确

## 四、其他路由组（非 Workspace）

### Dashboard 路由（6 个）
- /dashboard
- /dashboard/documents
- /dashboard/notifications
- /dashboard/points
- /dashboard/stats
- /dashboard/tasks

### 其他路由（2 个）
- /my-links
- /workbench

这些路由不属于本次 Workspace 迁移范围。

## 五、结论

```
WORKSPACE_MIGRATION_COMPLETE=true
VISUAL_ACCEPTANCE_ALMOST_COMPLETE=15/16 (93.75%)
PENDING_VISUAL_ACCEPTANCE=1 (动态详情页)
NEXT_ACTION=补测 /workspace/task-chains/shipping/[id]
```
