# EventLog Persistence Verification — v1.20.42.6.32.2

**Date:** 2026-06-10

## 根因分析

**问题：** 前端正确发送 `eventType` 字段，但后端 `/api/events` route.ts 第 27 行解构了错误的键名：

```ts
// 修复前（错误）
const { event, toolName, path, sessionId, ...rest } = body;
// 结果：eventType → 进入 ...rest → 被 JSON.stringify 存入 action 字段
//       eventType 列 → 设为 "unknown"

// 修复后（正确）
const { eventType, action, toolName, path, sessionId, ...rest } = body;
// 结果：eventType → 正确映射到 EventLog.eventType 列
//       action → 正确映射到 EventLog.action 列
//       其余字段（checklistSlug, toolSlug, sourcePath）→ metadata JSON 追加
```

## 修改文件

- `src/app/api/events/route.ts` — 修复解构键名 + 字段映射

## 字段映射

| 前端 payload 字段 | EventLog 列 | 说明 |
|---|---|---|
| `eventType` | `eventType` | ✅ 直接映射 |
| `action` | `action` | ✅ 直接映射 |
| `toolName` | `toolName` | ✅ 直接映射 |
| `path` | `path` | ✅ 直接映射 |
| `sessionId` | `sessionId` | ✅ 直接映射 |
| `checklistSlug` | `action` (追加 metadata) | JSON 元数据 |
| `toolSlug` | `action` (追加 metadata) | JSON 元数据 |
| `sourcePath` | `action` (追加 metadata) | JSON 元数据 |

## 测试前 EventLog 状态

- 总事件数：352
- checklist 相关事件：0

## 测试后 EventLog 状态

- 总事件数：356（+4）
- checklist 相关事件：4

### checklist_view（2 条）

```
id: cmq82b4jg00008y5pb6bogto1
eventType: checklist_view
action: view_student-first-abroad-packing-checklist
path: /checklists/student-first-abroad-packing-checklist
toolName: checklist
sessionId: 1ad50c95-e68a-4f8f-ab39-50ef1eb7d1aa
createdAt: 2026-06-10T12:45:58.588Z
```

### checklist_tool_click（1 条）

```
id: cmq82b76j00018y5pny10nc68
eventType: checklist_tool_click
action: click_tool_address-formatter
path: /checklists/student-first-abroad-packing-checklist
toolName: checklist
sessionId: 1ad50c95-e68a-4f8f-ab39-50ef1eb7d1aa
createdAt: 2026-06-10T12:46:02.011Z
```

### checklist_internal_link_click（1 条）

```
id: cmq82baql00028y5p8b9ynpm2
eventType: checklist_internal_link_click
action: click_from_address-formatter
path: /tools/address-formatter
toolName: checklist
sessionId: 1ad50c95-e68a-4f8f-ab39-50ef1eb7d1aa
createdAt: 2026-06-10T12:46:06.621Z
```

## 旧事件兼容性

| 事件类型 | 数量 | 状态 |
|---|---|---|
| Tool_View | 200 | ✅ 正常 |
| Tool_Click | 24 | ✅ 正常 |
| Document_Save | 19 | ✅ 正常 |
| Favorite_Tool | 1 | ✅ 正常 |
| article_click | 1 | ✅ 正常 |
| Search_Submit | 1 | ✅ 正常 |
| tool_query | 56 | ✅ 正常 |
| tool_click | 15 | ✅ 正常 |
| tool_calculate | 6 | ✅ 正常 |
| tool_copy | 6 | ✅ 正常 |

所有旧事件类型均未被破坏。
