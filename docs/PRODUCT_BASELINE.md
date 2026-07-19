# Product UI Baseline — jueshi.net

> **Last Updated**: 2026-07-19  
> **Status**: ✅ Verified  
> **Version**: v1.20.42.18.6.6.5.2

---

## Workspace Desktop Layout — 四区域 SaaS Layout

**CORRECTION**: Workspace Desktop Layout 是 **四区域布局**，不是三栏。

### 布局结构

```
┌─────────────────────────────────────────────────────────────┐
│                    Global Header (公共)                      │
├──────────┬──────────┬──────────────────────┬────────────────┤
│          │          │                      │                │
│  Global  │  User    │   Main Workspace     │   Right        │
│ Sidebar  │  Asset   │   (flex-1)           │   Assistant    │
│ (导航)   │  Rail    │                      │   Rail         │
│          │ (240px)  │   - 指标卡片         │   (260px)      │
│          │          │   - 快速操作         │                │
│          │          │   - 最近单据         │   - 通知       │
│          │          │   - 任务链           │   - 今日待办   │
│          │          │   - 常用工具         │   - 公司资料   │
│          │          │                      │   - 备忘录     │
│          │          │                      │                │
├──────────┴──────────┴──────────────────────┴────────────────┤
│                    Global Footer (公共)                      │
└─────────────────────────────────────────────────────────────┘
```

### 四个区域定义

#### 1. Global Sidebar（全局导航）
- **位置**: 最左侧
- **宽度**: 固定（由公共布局控制）
- **内容**: 主导航菜单、品牌 Logo、用户入口
- **状态**: 🔒 **FROZEN** — 禁止修改
- **文件**: `src/app/(workspace)/layout.tsx`, `src/components/public/`

#### 2. User Asset Rail（用户资产栏）
- **位置**: Global Sidebar 右侧
- **宽度**: 240px
- **显示条件**: `xl` 断点（>= 1280px）
- **内容**: 
  - 用户身份卡片（头像、姓名、邮箱）
  - 等级进度条
  - 签到组件
  - 勋章展示
- **状态**: 🔒 **FROZEN** — 核心用户信息展示
- **文件**: `src/components/workspace/WorkspaceLeftRail.tsx`
- **验收版本**: commit `4cdb6ff`

#### 3. Main Workspace（主工作区）
- **位置**: 中间区域
- **宽度**: `flex-1`（自适应）
- **内容**:
  - 移动端用户横幅（xl 以下显示）
  - 指标卡片（单据、公司、任务链、收藏、邀请）
  - 快速操作（新建单据、公司资料、任务链、会员中心）
  - 最近单据列表
  - 任务链列表
  - 常用工具
- **状态**: ✅ **EXTENDABLE** — 允许添加新的功能模块
- **文件**: `src/app/(workspace)/workspace/page.tsx`
- **验收版本**: commit `4cdb6ff`

#### 4. Right Assistant Rail（右助手栏）
- **位置**: 最右侧
- **宽度**: 260px
- **显示条件**: `lg` 断点（>= 1024px）
- **内容**:
  - 通知卡片
  - 今日待办
  - 公司资料
  - 备忘录
- **状态**: ✅ **EXTENDABLE** — 允许添加新的辅助信息模块
- **文件**: `src/components/workspace/WorkspaceRightRail.tsx`
- **验收版本**: commit `4cdb6ff`

---

## 响应式规则

| 屏幕宽度 | 显示区域 | 布局 |
|---------|---------|------|
| **>= 1280px (xl+)** | Global Sidebar + User Asset Rail + Main Workspace + Right Assistant Rail | 四区域完整布局 |
| **1024-1279px (lg-xl)** | Global Sidebar + Main Workspace + Right Assistant Rail | 三区域（隐藏 User Asset Rail） |
| **< 1024px (mobile)** | Global Sidebar + Main Workspace | 两区域（隐藏左右 Rail） |

---

## 冻结规则

### 🔒 FROZEN（禁止修改）

以下区域和文件已验收，**禁止修改**：

1. **Global Sidebar**
   - 禁止删除、合并、重新设计
   - 禁止修改导航结构
   - 文件: `src/app/(workspace)/layout.tsx`

2. **User Asset Rail**
   - 禁止删除或隐藏
   - 禁止修改用户信息展示逻辑
   - 禁止修改等级、签到、勋章组件
   - 文件: `src/components/workspace/WorkspaceLeftRail.tsx`
   - 验收版本: `4cdb6ff`

3. **WorkspacePageFrame**
   - 禁止修改三栏/四栏布局结构
   - 禁止修改响应式断点规则
   - 禁止修改宽度定义（240px / 260px）
   - 文件: `src/components/workspace/WorkspacePageFrame.tsx`
   - 验收版本: `4cdb6ff`

### ✅ EXTENDABLE（允许扩展）

以下区域允许添加新功能，但**禁止删除现有功能**：

1. **Main Workspace**
   - ✅ 允许添加新的功能模块（如新的指标卡片、新的快速操作）
   - ✅ 允许调整内部布局（grid、flex）
   - ❌ 禁止删除现有模块（指标、快速操作、最近单据、任务链、常用工具）
   - 文件: `src/app/(workspace)/workspace/page.tsx`

2. **Right Assistant Rail**
   - ✅ 允许添加新的辅助信息模块（如日历、快捷链接）
   - ❌ 禁止删除现有模块（通知、今日待办、公司资料、备忘录）
   - 文件: `src/components/workspace/WorkspaceRightRail.tsx`

---

## 禁止操作

### ❌ NEVER DO

1. **禁止将四区域合并为三栏**
   - Workspace Desktop Layout 是四区域，不是三栏
   - 不要在任何文档或代码注释中称其为"三栏布局"

2. **禁止删除 Global Sidebar**
   - Global Sidebar 是全局导航，禁止删除或隐藏
   - 禁止将其与 User Asset Rail 合并

3. **禁止修改响应式断点**
   - xl (1280px): 显示 User Asset Rail
   - lg (1024px): 显示 Right Assistant Rail
   - 禁止修改这些断点值

4. **禁止修改 Rail 宽度**
   - User Asset Rail: 240px（固定）
   - Right Assistant Rail: 260px（固定）
   - 禁止修改这些宽度值

5. **禁止删除现有功能模块**
   - Main Workspace: 指标卡片、快速操作、最近单据、任务链、常用工具
   - Right Assistant Rail: 通知、今日待办、公司资料、备忘录
   - 禁止删除任何一个模块

---

## 代码位置

### 核心文件

| 文件 | 作用 | 状态 |
|------|------|------|
| `src/components/workspace/WorkspacePageFrame.tsx` | 四区域布局框架 | 🔒 FROZEN |
| `src/components/workspace/WorkspaceLeftRail.tsx` | User Asset Rail | 🔒 FROZEN |
| `src/components/workspace/WorkspaceRightRail.tsx` | Right Assistant Rail | ✅ EXTENDABLE |
| `src/app/(workspace)/workspace/page.tsx` | Main Workspace 内容 | ✅ EXTENDABLE |
| `src/app/(workspace)/layout.tsx` | Workspace 布局（包含 Global Sidebar） | 🔒 FROZEN |

### 验收版本

- **Commit**: `4cdb6ff`
- **Message**: `fix(workspace): fix left rail container tag`
- **Date**: 2026-07-19

---

## 变更历史

| 日期 | 变更 | 说明 |
|------|------|------|
| 2026-07-19 | 修正文档 | 明确 Workspace Desktop Layout 是四区域，不是三栏 |
| 2026-07-19 | 验收版本 | commit `4cdb6ff` 作为基线 |

---

## 相关文档

- `docs/HERMES_ALWAYS_READ.md` — 项目总规则
- `docs/STAGING_FIRST_POLICY.md` — Staging 优先策略
- `docs/JUESHI_AUDIT_TO_RELEASE_GATE.md` — 审计发布流程

---

## 审计检查清单

在修改 Workspace 相关代码前，必须确认：

- [ ] 是否修改了 Global Sidebar？→ ❌ 禁止
- [ ] 是否修改了 User Asset Rail？→ ❌ 禁止
- [ ] 是否修改了 WorkspacePageFrame 布局结构？→ ❌ 禁止
- [ ] 是否修改了响应式断点？→ ❌ 禁止
- [ ] 是否修改了 Rail 宽度？→ ❌ 禁止
- [ ] 是否删除了现有功能模块？→ ❌ 禁止
- [ ] 是否在 Main Workspace 添加新功能？→ ✅ 允许
- [ ] 是否在 Right Assistant Rail 添加新功能？→ ✅ 允许

---

**Status**: ✅ **BASELINE ESTABLISHED**  
**Next Action**: 所有 Workspace 修改必须遵循此基线文档
