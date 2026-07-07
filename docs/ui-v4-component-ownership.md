# UI V4 组件所有权与历史包袱审计

**创建时间**: 2026-07-07  
**审计范围**: workspace 页面、首页、ui-lab 目录  
**审计目的**: 明确组件所有权，识别历史包袱，为后续清理提供依据

---

## 一、现役组件（Active Components）

### 1. Workspace 页面组件

| 组件路径 | 用途 | 状态 | 备注 |
|---------|------|------|------|
| `src/components/user/UserSidebar.tsx` | workspace 左侧栏（用户资产卡 + 导航） | ✅ 现役 | 已升级为品牌 Logo + 用户资产卡 |
| `src/components/workspace/WorkspaceRightRail.tsx` | workspace 右侧栏（通知、勋章、统计） | ✅ 现役 | 已优化背景色和对齐 |
| `src/components/user/RecentTools.tsx` | 常用工具模块 | ✅ 现役 | 已修复溢出问题 |
| `src/app/(workspace)/layout.tsx` | workspace 布局容器 | ✅ 现役 | 使用 UserNavSidebar |
| `src/app/(workspace)/workspace/page.tsx` | workspace 主页面 | ✅ 现役 | 已优化底部边界 |

### 2. 首页组件

| 组件路径 | 用途 | 状态 | 备注 |
|---------|------|------|------|
| `src/app/(public)/page.tsx` | 首页入口 | ✅ 现役 | 使用 JueshiV4HomeCandidateV4Shell |
| `src/components/layout/header.tsx` | 全局顶部导航 | ✅ 现役 | 使用 `/images/brand/jueshi-logo-crab.jpg` |
| `src/components/layout/footer.tsx` | 全局底部 | ✅ 现役 | - |

### 3. 品牌资源（现役）

| 资源路径 | 用途 | 状态 | 备注 |
|---------|------|------|------|
| `/images/brand/jueshi-logo-crab.jpg` | 首页 + workspace 品牌 Logo | ✅ 现役 | 红色小螃蟹，当前主品牌标识 |
| `/images/brand/jueshi-crab-mark.png` | 螃蟹标记图标 | ✅ 现役 | 用于 favicon 等 |
| `/images/brand/default-avatar-crab.jpg` | 默认头像 | ✅ 现役 | 螃蟹风格头像 |

---

## 二、历史包袱组件（Legacy Components）

### 1. UI Lab 实验组件（废弃候选）

**目录**: `src/components/ui-lab/`

| 组件目录 | 用途 | 状态 | 废弃原因 | 清理建议 |
|---------|------|------|---------|---------|
| `jueshi-v4/` | V4 首页初版 | ⚠️ 废弃候选 | 已被 v4-home-candidate-v4 替代 | 需 grep 全仓引用后删除 |
| `jueshi-v4-home-candidate/` | V4 首页候选 v1 | ⚠️ 废弃候选 | 已被 v4 替代 | 需 grep 全仓引用后删除 |
| `jueshi-v4-home-candidate-v2/` | V4 首页候选 v2 | ⚠️ 废弃候选 | 已被 v4 替代 | 需 grep 全仓引用后删除 |
| `jueshi-v4-home-candidate-v3/` | V4 首页候选 v3 | ⚠️ 废弃候选 | 已被 v4 替代 | 需 grep 全仓引用后删除 |
| `jueshi-v4-topnav/` | V4 顶部导航实验 | ⚠️ 废弃候选 | 已被 v4-topnav-polished 替代 | 需 grep 全仓引用后删除 |
| `jueshi-v4-topnav-polished/` | V4 顶部导航精修版 | ⚠️ 废弃候选 | 仅用于 UI Lab 预览 | 需确认是否保留 |

**页面路由**:
- `/ui-lab/jueshi-v4` → `src/app/(public)/ui-lab/jueshi-v4/page.tsx`
- `/ui-lab/jueshi-v4-home-candidate` → `src/app/(public)/ui-lab/jueshi-v4-home-candidate/page.tsx`
- `/ui-lab/jueshi-v4-home-candidate-v2` → `src/app/(public)/ui-lab/jueshi-v4-home-candidate-v2/page.tsx`
- `/ui-lab/jueshi-v4-home-candidate-v3` → `src/app/(public)/ui-lab/jueshi-v4-home-candidate-v3/page.tsx`
- `/ui-lab/jueshi-v4-home-candidate-v4` → `src/app/(public)/ui-lab/jueshi-v4-home-candidate-v4/page.tsx`
- `/ui-lab/jueshi-v4-topnav` → `src/app/(public)/ui-lab/jueshi-v4-topnav/page.tsx`
- `/ui-lab/jueshi-v4-topnav-polished` → `src/app/(public)/ui-lab/jueshi-v4-topnav-polished/page.tsx`

**清理步骤**（需用户确认后执行）:
1. `grep -R "JueshiV4" src/` 确认无其他引用
2. 删除组件目录
3. 删除对应页面路由
4. `npm run build` 验证
5. 提交 commit: `chore: remove deprecated ui-lab components`

### 2. 旧版 Workspace 组件（废弃候选）

| 组件路径 | 用途 | 状态 | 废弃原因 | 备注 |
|---------|------|------|---------|------|
| `src/components/workspace/WorkspaceSidebar.tsx` | 旧版 workspace 左侧栏 | ⚠️ 废弃候选 | 已被 UserNavSidebar 替代 | 需 grep 确认无引用后删除 |

**清理步骤**（需用户确认后执行）:
1. `grep -R "WorkspaceSidebar" src/` 确认无引用
2. 删除文件
3. `npm run build` 验证
4. 提交 commit: `chore: remove deprecated WorkspaceSidebar`

### 3. 旧版 Logo 资源（废弃候选）

| 资源路径 | 用途 | 状态 | 废弃原因 | 备注 |
|---------|------|------|---------|------|
| `/brand/jueshi-logo-header.png` | 旧版首页 Logo | ⚠️ 废弃候选 | 已被 `jueshi-logo-crab.jpg` 替代 | 需 grep 确认无引用后删除 |
| `/brand/jueshi-logo-header-transparent.png` | 旧版透明 Logo | ⚠️ 废弃候选 | 已被 `jueshi-logo-crab.jpg` 替代 | 需 grep 确认无引用后删除 |
| `/brand/jueshi-logo-header@2x.png` | 旧版高清 Logo | ⚠️ 废弃候选 | 已被 `jueshi-logo-crab.jpg` 替代 | 需 grep 确认无引用后删除 |
| `/brand/jueshi-logo-small.png` | 旧版小 Logo | ⚠️ 废弃候选 | 已被 `jueshi-logo-crab.jpg` 替代 | 需 grep 确认无引用后删除 |
| `/brand/jueshi-logo.png` | 旧版主 Logo | ⚠️ 废弃候选 | 已被 `jueshi-logo-crab.jpg` 替代 | 需 grep 确认无引用后删除 |
| `/brand/jueshi-logo-placeholder.svg` | Logo 占位符 | ⚠️ 废弃候选 | 仅用于 admin 设置页 | 需确认是否保留 |
| `/brand/logo.svg` | SVG Logo | ⚠️ 废弃候选 | 未被使用 | 需 grep 确认无引用后删除 |
| `/brand/logo-horizontal.svg` | 横向 Logo | ⚠️ 废弃候选 | 未被使用 | 需 grep 确认无引用后删除 |
| `/brand/logo-mark.svg` | Logo 标记 | ⚠️ 废弃候选 | 已被 `jueshi-crab-mark.png` 替代 | 需 grep 确认无引用后删除 |

**清理步骤**（需用户确认后执行）:
1. `grep -R "jueshi-logo-header\|jueshi-logo-small\|jueshi-logo.png" src/ public/` 确认无引用
2. 删除文件
3. `npm run build` 验证
4. 提交 commit: `chore: remove deprecated logo assets`

---

## 三、Logo 使用现状

### 当前品牌 Logo

**主 Logo**: `/images/brand/jueshi-logo-crab.jpg`  
**特征**: 红色小螃蟹 + "绝世百宝箱" 文字  
**使用位置**:
- 首页 Header (`src/components/layout/header.tsx`)
- workspace 左侧栏 (`src/components/user/UserSidebar.tsx`)

### 旧 Logo 引用检查

```bash
# 需要执行的检查命令
grep -R "jueshi-logo-header.png" src/
grep -R "jueshi-logo-small.png" src/
grep -R "jueshi-logo.png" src/
```

**当前已知引用**:
- `src/app/api/branding/route.ts:8` — 默认 branding 配置（需更新为 `jueshi-logo-crab.jpg`）
- `src/app/api/admin/settings/route.ts:23` — admin 设置默认值（需更新）
- `src/app/(admin)/admin/settings/page.tsx:15,32,95` — admin 设置页面（需更新）

---

## 四、组件依赖关系图

```
首页 (/)
├── JueshiV4HomeCandidateV4Shell (现役)
│   ├── JueshiV4Header
│   ├── JueshiV4Hero (from v3)
│   ├── JueshiV4ToolGrid (from v2)
│   └── JueshiV4Footer
└── layout/header.tsx (现役)
    └── Logo: /images/brand/jueshi-logo-crab.jpg

Workspace (/workspace)
├── layout.tsx (现役)
│   ├── UserNavSidebar (现役)
│   │   └── Logo: /images/brand/jueshi-logo-crab.jpg
│   └── TopBar (现役)
├── workspace/page.tsx (现役)
│   ├── RecentTools (现役)
│   └── WorkspaceRightRail (现役)
└── WorkspaceSidebar.tsx (废弃候选)
```

---

## 五、清理优先级建议

### 高优先级（可立即清理）

1. **旧版 Logo 资源**
   - 风险: 低
   - 影响: 无（已被替代）
   - 步骤: grep 确认 → 删除 → build 验证

2. **WorkspaceSidebar.tsx**
   - 风险: 低
   - 影响: 无（已被 UserNavSidebar 替代）
   - 步骤: grep 确认 → 删除 → build 验证

### 中优先级（需用户确认）

1. **UI Lab 实验组件**
   - 风险: 中
   - 影响: 可能影响 `/ui-lab/*` 路由
   - 步骤: 确认是否保留 UI Lab 功能 → grep 确认 → 删除 → build 验证

### 低优先级（暂不清理）

1. **admin 设置页 Logo 配置**
   - 风险: 中
   - 影响: 需要更新默认值
   - 步骤: 需单独任务处理

---

## 六、下一步行动

### 本轮任务（已完成）

- [x] workspace 视觉精修（Logo、右栏对齐、底部边界、常用工具溢出）
- [x] 历史包袱审计文档创建

### 下一轮任务（需用户确认）

- [ ] 清理旧版 Logo 资源（需用户确认）
- [ ] 清理 WorkspaceSidebar.tsx（需用户确认）
- [ ] 清理 UI Lab 实验组件（需用户确认）
- [ ] 更新 admin 设置页 Logo 默认值（需单独任务）

### 不建议进入的任务

- ❌ 广告后台流程（用户明确要求暂不进入）
- ❌ /resources 页面优化（需等待用户提供样例图）

---

## 七、审计命令参考

```bash
# 检查 JueshiV4 引用
grep -R "JueshiV4" src/

# 检查 WorkspaceSidebar 引用
grep -R "WorkspaceSidebar" src/

# 检查旧 Logo 引用
grep -R "jueshi-logo-header\|jueshi-logo-small\|jueshi-logo.png" src/ public/

# 列出所有 Logo 资源
find public -iname '*logo*' -o -iname '*jueshi*' -o -iname '*crab*'

# 检查 git 历史
git grep "HomeLivePage\|JueshiV4\|WorkspaceSidebar"
```

---

## 八、工作台相关组件归属

### 现役 Workspace 组件

| 组件 | 路径 | 状态 | 备注 |
|------|------|------|------|
| **Workspace Layout** | `src/app/(workspace)/layout.tsx` | ✅ 现役 | 提供 UserNavSidebar + TopBar |
| **UserNavSidebar** | `src/components/user/UserSidebar.tsx` | ✅ 现役 | 左侧栏（品牌 Logo + 用户资产卡 + 导航） |
| **TopBar** | `src/app/(workspace)/topbar.tsx` | ✅ 现役 | 顶部面包屑导航 |
| **WorkspaceRightRail** | `src/components/workspace/WorkspaceRightRail.tsx` | ✅ 现役 | 右侧栏（通知 + 成长路径 + 快捷统计） |
| **RecentTools** | `src/components/user/RecentTools.tsx` | ✅ 现役 | 常用工具模块（调用 /api/workbench/recent-tools） |
| **TodayTasks** | `src/components/user/TodayTasks.tsx` | ✅ 现役 | 今日任务模块 |
| **Workspace Page** | `src/app/(workspace)/workspace/page.tsx` | ✅ 现役 | 工作台主页 |

### 废弃候选 Workspace 组件

| 组件 | 路径 | 状态 | 备注 |
|------|------|------|------|
| **WorkspaceSidebar** | `src/components/workspace/WorkspaceSidebar.tsx` | ⚠️ 废弃候选 | 旧版左侧栏，已被 UserNavSidebar 替代 |

### 工作台核心功能原型（已存在）

| 功能 | 页面路径 | 组件 | API | 数据模型 | 状态 |
|------|---------|------|-----|---------|------|
| **我的收藏** | `/workspace/favorites` | `favorites-client.tsx` | `/api/user/favorites` | `UserFavorite`, `Favorite`, `ToolFavorite` | ✅ 已有完整功能 |
| **待办任务** | `/workspace/tasks` | `tasks-client.tsx` | `/api/growth-tasks/summary`, `/api/tasks` | `UserTask` | ✅ 已有完整功能 |
| **备忘录/记事本** | `/workspace/memos` | `memos-client.tsx` | `/api/workspace/memos` | `Memo` | ✅ 已有完整功能 |
| **最近使用工具** | workspace 主页内嵌 | `RecentTools.tsx` | `/api/workbench/recent-tools` | 基于浏览记录 | ✅ 已有完整功能 |
| **任务链** | `/workspace/task-chains` | `task-chains-client.tsx` | `/api/task-chains` | `TaskChainDraft` | ✅ 已有完整功能 |
| **我的单据** | `/workspace/documents` | `documents-client-inner.tsx` | `/api/user/documents` | `DocumentHistory` | ✅ 已有完整功能 |
| **公司资料** | `/workspace/company-profiles` | `company-profiles-client.tsx` | `/api/me/company-profiles` | `UserCompanyProfile` | ✅ 已有完整功能 |
| **商品资料** | `/workspace/products` | - | `/api/workspace/products` | `UserProduct` | ✅ 已有完整功能 |
| **通知中心** | `/workspace/notifications` | `notifications-client.tsx` | `/api/me/notifications` | `Notification` | ✅ 已有完整功能 |
| **会员权益** | `/workspace/member` | `member-client.tsx` | `/api/me/membership` | `User` (levelKey, growthValue) | ✅ 已有完整功能 |

### 暂未实现功能（需后续开发）

| 功能 | 状态 | 备注 |
|------|------|------|
| **网址导航收藏** | 与 /resources 页面相关，等待用户提供样例图 | 见下方补审结论 |

### 补审结论：资源导航收藏链路（2026-07-07 修正）

> **上一轮错误结论**："常用网址/网址导航收藏未实现，需要新增数据模型"
> **修正后结论**：资源导航收藏链路**基础设施已完整存在**，仅 `/resources` 页面 ResourceCard 未集成 FavoriteButton 组件。

#### 完整链路审计表

| 链路节点 | 是否存在 | 文件/API/模型 | 说明 |
|---------|---------|-------------|------|
| `/resources` 页面 | ✅ 存在 | `src/app/(public)/resources/resource-directory-client.tsx` | 完整的资源导航大厅，支持分类筛选、搜索 |
| 资源卡片组件 | ✅ 存在 | `ResourceCard` 组件（同上文件内） | 显示 Logo、名称、标签、描述、分类 |
| **收藏按钮** | ✅ 组件存在 | `src/components/favorite-button.tsx` | Heart 图标，支持收藏/取消收藏，调用 `/api/user/favorites` |
| **收藏按钮是否集成到 ResourceCard** | ❌ 未集成 | — | ResourceCard 当前只有外链跳转，**未渲染 FavoriteButton** |
| 收藏 API（POST） | ✅ 存在 | `src/app/api/user/favorites/route.ts` | 创建收藏：resourceType + resourceUrl + title |
| 取消收藏 API（DELETE） | ✅ 存在 | 同上 | 按 resourceUrl 删除 |
| 获取收藏列表 API（GET） | ✅ 存在 | 同上 | 返回用户所有收藏 |
| 用户收藏模型 | ✅ 存在 | `UserFavorite` (prisma/schema.prisma:1487) | userId, resourceType (tool/topic/article), resourceUrl, title |
| 工具收藏模型 | ✅ 存在 | `ToolFavorite` (prisma/schema.prisma:1014) | userId, toolKey |
| workspace 展示页面 | ✅ 存在 | `src/app/(workspace)/workspace/favorites/favorites-client.tsx` | 完整 UI：总收藏数、工具收藏、网址收藏、搜索、筛选 |
| workspace 入口 | ✅ 存在 | 左侧栏导航 "我的收藏" → `/workspace/favorites` | 已接入 UserNavSidebar |
| 是否完整流转 | ⚠️ **前台缺最后一步** | — | 收藏基础设施完整，但 `/resources` 卡片未放收藏按钮 |

#### 结论

- **不需要新增模型**：`UserFavorite` 已支持 `resourceUrl` + `resourceType`，完全可以存储资源导航的网址收藏
- **不需要新增 API**：`/api/user/favorites` 已支持 POST/DELETE/GET
- **不需要新增组件**：`FavoriteButton` 已完整实现
- **唯一缺失**：`/resources` 页面的 `ResourceCard` 组件需要集成 `<FavoriteButton resourceUrl={resource.url} title={resource.name} resourceType="url" />`
- **workspace 已可展示**：`/workspace/favorites` 已有完整 UI，收藏后自动显示

#### 接入方案（仅记录，本轮不执行）

在 `resource-directory-client.tsx` 的 `ResourceCard` 组件中添加：
```tsx
import FavoriteButton from '@/components/favorite-button';

// 在卡片右上角或底部添加
<FavoriteButton 
  resourceUrl={resource.url} 
  title={resource.name} 
  resourceType="url" 
/>
```

---

## 九、工作台新信息架构建议（个人效率门户定位）

### 设计原则

> 工作台 = 用户每天上班第一个打开的网站 = 个人效率门户

### 建议左侧栏结构

1. 品牌 Logo（`/images/brand/jueshi-logo-crab.jpg`）
2. 用户资产卡（头像 + 姓名 + 等级 + 积分 + 成长值 + 连续签到）
3. **工作台总览**（/workspace）
4. **我的常用**（高频工具 + 常用网址 — 待开发）
5. **我的网址**（收藏网址 — 已有 /workspace/favorites）
6. **待办任务**（已有 /workspace/tasks）
7. **记事本**（已有 /workspace/memos）
8. 我的清单（已有 /workspace/task-chains）
9. 我的工具（已有 /tools + RecentTools）
10. 我的收藏（已有 /workspace/favorites）
11. 我的单据（已有 /workspace/documents）
12. 公司资料（已有 /workspace/company-profiles）
13. 商品资料（已有 /workspace/products）
14. 账号设置（已有 /workspace/settings）

### 建议中间主区结构

1. **今日工作台欢迎区**（压缩高度，显示日期 + 天气 + 签到状态）
2. **今日待办任务**（从 /workspace/tasks 聚合，显示 top 3-5）
3. **我的常用网址 / 收藏网址**（从 /workspace/favorites 聚合，resourceType="url"，显示 top 5）
4. **最近使用工具**（已有 RecentTools 组件）
5. **我的清单进度**（从 /workspace/task-chains 聚合）
6. **最近单据 / 公司资料**（已有数据）
7. **记事本快捷区**（从 /workspace/memos 聚合 top 3）
8. **常用工具入口**（grid 布局，6-8 个高频工具）

### 建议右侧栏结构

1. **今日签到**（已有 CheckinButton）
2. **通知提醒**（已有，显示未读数）
3. **成长路径**（已有，显示等级进度）
4. **快捷统计**（已有，单据/任务链/邀请数）
5. **最近备忘录**（已有，显示 top 3）
6. **推荐工具**（可基于用户行为推荐）

---

## 十、功能接入优先级

### 可直接接入工作台（已有完整功能）

| 功能 | 接入方式 | 工作量 |
|------|---------|--------|
| 待办任务 | 主页聚合 top 3-5 任务 | 低 |
| 备忘录 | 主页聚合 top 3 备忘 | 低 |
| 最近使用工具 | 已有 RecentTools 组件 | 无 |
| 我的收藏 | 主页显示 top 5 收藏 | 低 |
| 我的清单进度 | 主页显示进行中清单 | 低 |
| 最近单据 | 已有数据 | 无 |

### 需要后续开发

| 功能 | 说明 | 工作量 |
|------|------|--------|
| 常用网址/高频网址 | 需新增数据模型或复用 UserFavorite | 中 |
| 网址导航收藏 | 与 /resources 相关，等待样例图 | 高 |
| 工作台小挂件配置 | schema 中已有字段但未实现 UI | 中 |

---

**文档维护**: 每次组件清理后更新此文档  
**最后更新**: 2026-07-07
