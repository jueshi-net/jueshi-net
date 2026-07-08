# 02 - 页面注册表

**审计日期**: 2026-07-08  
**总页面数**: 221

---

## 页面统计

| 分类 | 数量 |
|------|------|
| 公共页面 (public) | 130 |
| 管理后台 (admin) | 58 |
| 工作区 (workspace) | 24 |
| 根路由 | 9 |
| **总计** | **221** |

---

## V4 Shell 覆盖页面 (8/221 = 3.6%)

| 路由 | 文件 | Layout | Server | Client | Async | V4 Shell | 状态 |
|------|------|--------|--------|--------|-------|----------|------|
| `/` | `(public)/page.tsx` | Root | ✅ | ❌ | ❌ | ✅ V4HomeCandidateV4Shell | Production |
| `/tools` | `(public)/tools/page.tsx` | Public | ✅ | ❌ | ❌ | ✅ V4PublicShell | Production |
| `/resources` | `(public)/resources/page.tsx` | Public | ✅ | ❌ | ❌ | ✅ V4PublicShell | Production |
| `/resources/site/[id]` | `(public)/resources/site/[id]/page.tsx` | Public | ✅ | ❌ | ❌ | ✅ V4PublicShell | Production |
| `/destinations` | `(public)/destinations/page.tsx` | Public | ✅ | ❌ | ❌ | ✅ V4PublicShell | Production |
| `/guides` | `(public)/guides/page.tsx` | Public | ✅ | ❌ | ❌ | ✅ V4PublicShell | Staging |
| `/checklists` | `(public)/checklists/page.tsx` | Public | ✅ | ❌ | ❌ | ✅ V4PublicShell | Staging |
| `/ui-lab/jueshi-v4-home-candidate-v4` | `(public)/ui-lab/jueshi-v4-home-candidate-v4/page.tsx` | Public | ✅ | ❌ | ❌ | ✅ V4HomeCandidateV4Shell | Draft |

---

## 未使用 V4 Shell 的公共页面 (122/130)

### 高优先级 (P0) - 核心功能页面

| 路由 | 文件 | 风险 | 备注 |
|------|------|------|------|
| `/topics` | `(public)/topics/page.tsx` | 🟢 低 | 待统一 |
| `/search` | `(public)/search/page.tsx` | 🟢 低 | 待统一 |
| `/countries` | `(public)/countries/page.tsx` | 🟢 低 | 待统一 |
| `/cities/[city]` | `(public)/cities/[city]/page.tsx` | 🟢 低 | 待统一 |

### 中优先级 (P1) - 内容页面

| 路由 | 文件 | 风险 | 备注 |
|------|------|------|------|
| `/blog` | `(public)/blog/page.tsx` | 🟡 中 | 待统一 |
| `/blog/[slug]` | `(public)/blog/[slug]/page.tsx` | 🟡 中 | 待统一 |
| `/bbs` | `(public)/bbs/page.tsx` | 🟡 中 | 待统一 |
| `/community` | `(public)/community/page.tsx` | 🟡 中 | 待统一 |

### 低优先级 (P2) - 工具页面

| 路由 | 文件 | 风险 | 备注 |
|------|------|------|------|
| `/tools/[tool-name]` | 20+ 工具页面 | 🟡 中 | 待统一 |
| `/starter` | `(public)/starter/page.tsx` | 🟢 低 | 待统一 |
| `/pricing` | `(public)/pricing/page.tsx` | 🟢 低 | 待统一 |

---

## 管理后台页面 (58)

所有 `/admin/*` 页面使用独立的 Admin Layout，不使用 V4 Shell。

**状态**: Production  
**风险**: 🟢 低（内部使用）

---

## 工作区页面 (24)

所有 `/workspace/*` 页面使用 Workspace Layout，不使用 V4 Shell。

**状态**: Production  
**风险**: 🟡 中（用户核心功能）

---

## 页面类型统计

| 类型 | 数量 | 百分比 |
|------|------|--------|
| Server Component | 139 | 62.9% |
| Client Component | 39 | 17.6% |
| Async (数据获取) | 82 | 37.1% |

---

## Layout 分布

| Layout | 页面数 | 说明 |
|--------|--------|------|
| Root Layout | 9 | 根路由页面 |
| Public Layout | 130 | 公共页面（部分使用 V4 Shell） |
| Admin Layout | 58 | 管理后台 |
| Workspace Layout | 24 | 用户工作区 |

---

**文档状态**: PAGE_REGISTRY_COMPLETED  
**生成时间**: 2026-07-08 23:20 CST
