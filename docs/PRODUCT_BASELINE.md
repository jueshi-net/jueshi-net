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

## Homepage V4 Baseline

**状态**: 🔒 **FROZEN**  
**基线版本**: UI V4 Home Candidate V2

### 冻结范围

| 模块 | 说明 | 状态 |
|------|------|------|
| **Header 结构** | 顶部导航栏、Logo、搜索框、用户入口 | 🔒 FROZEN |
| **Hero 区域** | 首页主视觉、标题、副标题、CTA 按钮 | 🔒 FROZEN |
| **首页工具入口布局** | 工具分类、卡片布局、图标样式 | 🔒 FROZEN |
| **品牌视觉** | 颜色方案、字体、图标风格、品牌元素 | 🔒 FROZEN |
| **BottomTab** | 移动端底部导航栏 | 🔒 FROZEN |
| **Footer 结构** | 页脚布局、链接分类、版权信息 | 🔒 FROZEN |
| **首页核心信息架构** | 内容层级、信息流、用户路径 | 🔒 FROZEN |

### 禁止操作

❌ **禁止修改整体布局**
- 禁止改变页面整体结构
- 禁止调整模块顺序
- 禁止修改响应式断点

❌ **禁止修改导航结构**
- 禁止修改 Header 导航项
- 禁止修改 BottomTab 导航项
- 禁止修改导航交互逻辑

❌ **禁止删除已有入口**
- 禁止删除任何工具入口
- 禁止删除任何内容分类
- 禁止删除任何 CTA 按钮

❌ **禁止改变品牌视觉**
- 禁止修改品牌颜色
- 禁止修改 Logo 样式
- 禁止修改图标风格

### 允许操作

✅ **新增运营模块**
- 允许添加新的运营活动区域
- 允许添加限时活动入口
- 允许添加推荐位

✅ **新增内容入口**
- 允许添加新的内容分类
- 允许添加新的文章入口
- 允许添加新的资源导航

✅ **新增活动位**
- 允许添加 Banner 广告位
- 允许添加推广区域
- 允许添加合作品牌展示

### 核心文件

| 文件 | 作用 | 状态 |
|------|------|------|
| `src/app/(public)/page.tsx` | 首页主页面 | 🔒 FROZEN |
| `src/components/public/Header.tsx` | 顶部导航 | 🔒 FROZEN |
| `src/components/public/Footer.tsx` | 页脚 | 🔒 FROZEN |
| `src/components/public/BottomTab.tsx` | 移动端底部导航 | 🔒 FROZEN |
| `src/components/public/Hero.tsx` | Hero 区域 | 🔒 FROZEN |

---

## Public Shell Baseline

**状态**: 🔒 **FROZEN**  
**变更流程**: 必须提交 `SHARED_CHANGE_REQUESTS`

### 包含组件

| 组件 | 说明 | 状态 |
|------|------|------|
| **JueshiV4PublicShell** | 公共布局外壳 | 🔒 FROZEN |
| **Header** | 顶部导航栏 | 🔒 FROZEN |
| **Footer** | 页脚 | 🔒 FROZEN |
| **BottomTab** | 移动端底部导航 | 🔒 FROZEN |
| **BreadcrumbBar** | 面包屑导航 | 🔒 FROZEN |
| **公共 Container 规范** | 内容容器、间距、最大宽度 | 🔒 FROZEN |

### 变更规则

❌ **禁止任何业务 Agent 直接修改**
- 禁止业务开发直接修改 Public Shell 组件
- 禁止绕过变更流程修改公共组件
- 禁止在业务代码中覆盖公共样式

✅ **变更流程**
1. 提交 `SHARED_CHANGE_REQUESTS` 文档
2. 说明修改原因和影响范围
3. 经过产品和技术评审
4. 在 staging 环境验证
5. 获得用户批准后才能合并

### 核心文件

| 文件 | 作用 | 状态 |
|------|------|------|
| `src/app/(public)/public-layout-client.tsx` | 公共布局客户端 | 🔒 FROZEN |
| `src/components/public/JueshiV4PublicShell.tsx` | 公共外壳组件 | 🔒 FROZEN |
| `src/components/public/Header.tsx` | 顶部导航 | 🔒 FROZEN |
| `src/components/public/Footer.tsx` | 页脚 | 🔒 FROZEN |
| `src/components/public/BottomTab.tsx` | 移动端底部导航 | 🔒 FROZEN |
| `src/components/public/BreadcrumbBar.tsx` | 面包屑导航 | 🔒 FROZEN |

### 变更请求模板

如需修改 Public Shell，必须在 `SHARED_CHANGE_REQUESTS.md` 中提交：

```markdown
## 变更请求

**组件**: [组件名称]
**修改内容**: [具体修改]
**修改原因**: [为什么需要修改]
**影响范围**: [影响哪些页面]
**替代方案**: [是否有其他方案]
**风险评估**: [可能的风险]
```

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
| 2026-07-19 | 新增 Homepage V4 Baseline | 明确首页冻结范围，基线版本 UI V4 Home Candidate V2 |
| 2026-07-19 | 新增 Public Shell Baseline | 明确公共外壳冻结范围，建立变更请求流程 |
| 2026-07-19 | 修正文档 | 明确 Workspace Desktop Layout 是四区域，不是三栏 |
| 2026-07-19 | 验收版本 | commit `4cdb6ff` 作为基线 |

---

## 相关文档

- `docs/HERMES_ALWAYS_READ.md` — 项目总规则
- `docs/STAGING_FIRST_POLICY.md` — Staging 优先策略
- `docs/JUESHI_AUDIT_TO_RELEASE_GATE.md` — 审计发布流程

---

## 审计检查清单

### Workspace 检查

在修改 Workspace 相关代码前，必须确认：

- [ ] 是否修改了 Global Sidebar？→ ❌ 禁止
- [ ] 是否修改了 User Asset Rail？→ ❌ 禁止
- [ ] 是否修改了 WorkspacePageFrame 布局结构？→ ❌ 禁止
- [ ] 是否修改了响应式断点？→ ❌ 禁止
- [ ] 是否修改了 Rail 宽度？→ ❌ 禁止
- [ ] 是否删除了现有功能模块？→ ❌ 禁止
- [ ] 是否在 Main Workspace 添加新功能？→ ✅ 允许
- [ ] 是否在 Right Assistant Rail 添加新功能？→ ✅ 允许

### Homepage V4 检查

在修改首页相关代码前，必须确认：

- [ ] 是否修改了 Header 结构？→ ❌ 禁止
- [ ] 是否修改了 Hero 区域？→ ❌ 禁止
- [ ] 是否修改了首页工具入口布局？→ ❌ 禁止
- [ ] 是否修改了品牌视觉？→ ❌ 禁止
- [ ] 是否修改了 BottomTab？→ ❌ 禁止
- [ ] 是否修改了 Footer 结构？→ ❌ 禁止
- [ ] 是否修改了首页核心信息架构？→ ❌ 禁止
- [ ] 是否新增了运营模块？→ ✅ 允许
- [ ] 是否新增了内容入口？→ ✅ 允许
- [ ] 是否新增了活动位？→ ✅ 允许

### Public Shell 检查

在修改公共外壳组件前，必须确认：

- [ ] 是否修改了 JueshiV4PublicShell？→ ❌ 禁止（需提交变更请求）
- [ ] 是否修改了 Header？→ ❌ 禁止（需提交变更请求）
- [ ] 是否修改了 Footer？→ ❌ 禁止（需提交变更请求）
- [ ] 是否修改了 BottomTab？→ ❌ 禁止（需提交变更请求）
- [ ] 是否修改了 BreadcrumbBar？→ ❌ 禁止（需提交变更请求）
- [ ] 是否修改了公共 Container 规范？→ ❌ 禁止（需提交变更请求）
- [ ] 是否提交了 SHARED_CHANGE_REQUESTS？→ ✅ 必须
- [ ] 是否经过产品和技术评审？→ ✅ 必须
- [ ] 是否在 staging 环境验证？→ ✅ 必须
- [ ] 是否获得用户批准？→ ✅ 必须

---

**Status**: ✅ **BASELINE ESTABLISHED**  
**Next Action**: 所有 Workspace 修改必须遵循此基线文档
