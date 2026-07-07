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

**文档维护**: 每次组件清理后更新此文档  
**最后更新**: 2026-07-07
