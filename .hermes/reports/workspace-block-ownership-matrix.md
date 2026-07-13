# Workspace 区块归属矩阵

Generated: 2026-07-13T19:05+08:00
Base: 81ce169

## 区块总表

| BLOCK | CANONICAL_OWNER | CURRENT_ROUTES | DUPLICATED_ON_ROUTES | ACTION |
|-------|----------------|----------------|---------------------|--------|
| 通知提醒 | WORKSPACE_RIGHT_RAIL | 7 已迁移页面 | notifications | HIDE_ON_DEDICATED |
| 成长路径 | WORKSPACE_RIGHT_RAIL | 7 已迁移页面 | member | HIDE_ON_DEDICATED |
| 最近备忘录 | WORKSPACE_RIGHT_RAIL | 7 已迁移页面 | memos | HIDE_ON_DEDICATED |
| 快速统计 | WORKSPACE_RIGHT_RAIL | 7 已迁移页面 | - | KEEP |
| 会员权益摘要 | DEDICATED_PAGE | member | - | KEEP |
| 积分兑换 | DEDICATED_PAGE | member | - | KEEP |
| 通知列表 | DEDICATED_PAGE | notifications | - | KEEP |
| 备忘录列表 | DEDICATED_PAGE | memos | - | KEEP |
| 单据列表 | DEDICATED_PAGE | documents | - | KEEP |
| 任务列表 | DEDICATED_PAGE | tasks | - | KEEP |
| 收藏列表 | DEDICATED_PAGE | favorites | - | KEEP |
| 工作台首页摘要 | WORKSPACE_HOME | workspace | - | KEEP |

## 详细区块记录

### 通知提醒 (Notifications Summary)
- BLOCK=通知提醒
- CURRENT_FILES=WorkspaceRightRail.tsx (lines 20-40)
- CURRENT_ROUTES=/workspace, /workspace/notifications, /workspace/documents, /workspace/favorites, /workspace/memos, /workspace/tasks, /workspace/member
- CANONICAL_OWNER=WORKSPACE_RIGHT_RAIL
- DUPLICATED_ON_ROUTES=/workspace/notifications
- ACTION=HIDE_ON_DEDICATED
- RATIONALE=当用户在 /workspace/notifications 时，右栏不应重复显示"通知提醒"摘要，因为页面主体已是完整通知列表

### 成长路径 (Growth Path)
- BLOCK=成长路径
- CURRENT_FILES=WorkspaceRightRail.tsx (lines 43-65)
- CURRENT_ROUTES=/workspace, /workspace/notifications, /workspace/documents, /workspace/favorites, /workspace/memos, /workspace/tasks, /workspace/member
- CANONICAL_OWNER=WORKSPACE_RIGHT_RAIL
- DUPLICATED_ON_ROUTES=/workspace/member
- ACTION=HIDE_ON_DEDICATED
- RATIONALE=当用户在 /workspace/member 时，右栏不应重复显示"成长路径"摘要，因为页面主体已包含会员权益、积分兑换、成长值等完整信息

### 最近备忘录 (Recent Memos)
- BLOCK=最近备忘录
- CURRENT_FILES=WorkspaceRightRail.tsx (lines 95-120)
- CURRENT_ROUTES=/workspace, /workspace/notifications, /workspace/documents, /workspace/favorites, /workspace/memos, /workspace/tasks, /workspace/member
- CANONICAL_OWNER=WORKSPACE_RIGHT_RAIL
- DUPLICATED_ON_ROUTES=/workspace/memos
- ACTION=HIDE_ON_DEDICATED
- RATIONALE=当用户在 /workspace/memos 时，右栏不应重复显示"最近备忘录"摘要，因为页面主体已是完整备忘录列表

### 快速统计 (Quick Stats)
- BLOCK=快速统计
- CURRENT_FILES=WorkspaceRightRail.tsx (lines 68-93)
- CURRENT_ROUTES=/workspace, /workspace/notifications, /workspace/documents, /workspace/favorites, /workspace/memos, /workspace/tasks, /workspace/member
- CANONICAL_OWNER=WORKSPACE_RIGHT_RAIL
- DUPLICATED_ON_ROUTES=-
- ACTION=KEEP
- RATIONALE=快速统计提供跨页面的快捷入口（单据、任务链、邀请），不与任何专门页面重复

### 会员权益摘要 (Member Benefits Summary)
- BLOCK=会员权益摘要
- CURRENT_FILES=member-client.tsx
- CURRENT_ROUTES=/workspace/member
- CANONICAL_OWNER=DEDICATED_PAGE
- DUPLICATED_ON_ROUTES=-
- ACTION=KEEP
- RATIONALE=会员权益是 /workspace/member 的核心业务内容，不应被右栏摘要替代

### 积分兑换 (Points Exchange)
- BLOCK=积分兑换
- CURRENT_FILES=member-client.tsx
- CURRENT_ROUTES=/workspace/member
- CANONICAL_OWNER=DEDICATED_PAGE
- DUPLICATED_ON_ROUTES=-
- ACTION=KEEP
- RATIONALE=积分兑换是 /workspace/member 的核心业务内容

### 通知列表 (Notifications List)
- BLOCK=通知列表
- CURRENT_FILES=notifications/page.tsx
- CURRENT_ROUTES=/workspace/notifications
- CANONICAL_OWNER=DEDICATED_PAGE
- DUPLICATED_ON_ROUTES=-
- ACTION=KEEP
- RATIONALE=通知列表是 /workspace/notifications 的核心业务内容

### 备忘录列表 (Memos List)
- BLOCK=备忘录列表
- CURRENT_FILES=memos-client.tsx
- CURRENT_ROUTES=/workspace/memos
- CANONICAL_OWNER=DEDICATED_PAGE
- DUPLICATED_ON_ROUTES=-
- ACTION=KEEP
- RATIONALE=备忘录列表是 /workspace/memos 的核心业务内容

### 单据列表 (Documents List)
- BLOCK=单据列表
- CURRENT_FILES=documents/page.tsx
- CURRENT_ROUTES=/workspace/documents
- CANONICAL_OWNER=DEDICATED_PAGE
- DUPLICATED_ON_ROUTES=-
- ACTION=KEEP
- RATIONALE=单据列表是 /workspace/documents 的核心业务内容

### 任务列表 (Tasks List)
- BLOCK=任务列表
- CURRENT_FILES=tasks-client.tsx
- CURRENT_ROUTES=/workspace/tasks
- CANONICAL_OWNER=DEDICATED_PAGE
- DUPLICATED_ON_ROUTES=-
- ACTION=KEEP
- RATIONALE=任务列表是 /workspace/tasks 的核心业务内容

### 收藏列表 (Favorites List)
- BLOCK=收藏列表
- CURRENT_FILES=favorites-client.tsx
- CURRENT_ROUTES=/workspace/favorites
- CANONICAL_OWNER=DEDICATED_PAGE
- DUPLICATED_ON_ROUTES=-
- ACTION=KEEP
- RATIONALE=收藏列表是 /workspace/favorites 的核心业务内容

### 工作台首页摘要 (Workspace Home Summary)
- BLOCK=工作台首页摘要
- CURRENT_FILES=workspace/page.tsx
- CURRENT_ROUTES=/workspace
- CANONICAL_OWNER=WORKSPACE_HOME
- DUPLICATED_ON_ROUTES=-
- ACTION=KEEP
- RATIONALE=工作台首页提供全局摘要和快捷入口，是独立的 DASHBOARD 类型页面

## 清理计划

### 清理页面 A: /workspace/notifications
- CLEANUP_PAGE_A=/workspace/notifications
- A_DUPLICATED_BLOCKS=通知提醒
- A_CLEANUP_ACTION=hiddenRightRailSections=['notifications']
- EXPECTED_RESULT=右栏不再显示"通知提醒"摘要，保留"成长路径"、"快速统计"、"最近备忘录"

### 清理页面 B: /workspace/memos
- CLEANUP_PAGE_B=/workspace/memos
- B_DUPLICATED_BLOCKS=最近备忘录
- B_CLEANUP_ACTION=hiddenRightRailSections=['memos']
- EXPECTED_RESULT=右栏不再显示"最近备忘录"摘要，保留"通知提醒"、"成长路径"、"快速统计"

### 可选清理页面 C: /workspace/member
- CLEANUP_PAGE_C=/workspace/member
- C_DUPLICATED_BLOCKS=成长路径
- C_CLEANUP_ACTION=hiddenRightRailSections=['growth']
- EXPECTED_RESULT=右栏不再显示"成长路径"摘要，保留"通知提醒"、"快速统计"、"最近备忘录"
- PRIORITY=LOW (重复程度不如 A 和 B 严重)

## 技术实现方案

### WorkspacePageFrame 增强
当前 WorkspacePageFrame 不支持隐藏右栏特定区块。需要增加 `hiddenRightRailSections` prop。

```typescript
interface WorkspacePageFrameProps {
  children: React.ReactNode;
  rightRail: React.ReactNode;
  hiddenRightRailSections?: string[]; // 新增
}
```

### WorkspaceRightRail 增强
当前 WorkspaceRightRail 不支持隐藏特定区块。需要增加 `hiddenSections` prop。

```typescript
interface WorkspaceRightRailProps {
  unreadNotifs: number;
  badgeCount: number;
  recentMemos: any[];
  userId: string;
  hiddenSections?: string[]; // 新增
}
```

### 迁移页面使用方式

#### /workspace/notifications
```typescript
<WorkspacePageFrame
  rightRail={
    <WorkspaceRightRail
      unreadNotifs={unreadNotifs}
      badgeCount={badgeCount}
      recentMemos={recentMemos}
      userId={userId}
      hiddenSections={['notifications']}
    />
  }
>
  <NotificationsClient ... />
</WorkspacePageFrame>
```

#### /workspace/memos
```typescript
<WorkspacePageFrame
  rightRail={
    <WorkspaceRightRail
      unreadNotifs={unreadNotifs}
      badgeCount={badgeCount}
      recentMemos={recentMemos}
      userId={userId}
      hiddenSections={['memos']}
    />
  }
>
  <MemosClient ... />
</WorkspacePageFrame>
```

#### /workspace/settings (表单页)
```typescript
<WorkspacePageFrame
  rightRail={null} // 表单页不需要右栏
>
  <SettingsClient ... />
</WorkspacePageFrame>
```

或者使用 variant="form"（如果后续需要限制宽度）。

## 迁移计划

### WAVE_02 目标 (4 页面)

1. /workspace/company-profiles
   - 类型: thin server wrapper
   - 迁移方式: 包装 WorkspacePageFrame + WorkspaceRightRail
   - 复杂度: LOW

2. /workspace/task-chains
   - 类型: thin server wrapper
   - 迁移方式: 包装 WorkspacePageFrame + WorkspaceRightRail
   - 复杂度: LOW

3. /workspace/ad-entitlements
   - 类型: server component (只读)
   - 迁移方式: 包装 WorkspacePageFrame + WorkspaceRightRail
   - 复杂度: LOW

4. /workspace/settings
   - 类型: thin server wrapper (表单页)
   - 迁移方式: 包装 WorkspacePageFrame + rightRail={null}
   - 复杂度: LOW

### 执行顺序

1. 增强 WorkspacePageFrame 和 WorkspaceRightRail (支持 hiddenRightRailSections)
2. 清理 /workspace/notifications (隐藏重复区块)
3. 清理 /workspace/memos (隐藏重复区块)
4. 迁移 /workspace/company-profiles
5. 迁移 /workspace/task-chains
6. 迁移 /workspace/ad-entitlements
7. 迁移 /workspace/settings
8. Build 验证
9. Playwright 验证
10. 部署到 staging
