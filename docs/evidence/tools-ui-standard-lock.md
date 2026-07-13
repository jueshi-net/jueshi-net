# Tools UI Standard Lock Report

> Generated: 2026-07-12 04:18 CST
> Worktree: /Users/chq/xixiong-saas-tools-standard-lock-20260712-0418
> Branch: fix/tools-ui-standard-lock-20260712-0418
> Base commit: f4866dfaa87e08926fc3527ad309c34d20ca9937

---

## UI Source of Truth

**UI_STANDARD_SOURCE_FILES=**
1. `src/components/design-system/PageHero.tsx` — 公共 Hero 组件
2. `src/components/design-system/PageContainer.tsx` — 公共容器组件
3. `src/components/design-system/SectionHeader.tsx` — 公共 Section 标题组件
4. `src/components/design-system/BreadcrumbBar.tsx` — 公共面包屑组件
5. `src/components/design-system/ContentSection.tsx` — 公共内容区块组件
6. `src/components/design-system/PageCTA.tsx` — 公共 CTA 组件
7. `src/components/layout/JueshiV4PublicShell.tsx` — 公共外壳
8. `src/app/(public)/guides/page.tsx` — 已批准参考页面（/guides）
9. `docs/ui-v4-design-system.md` — UI V4 设计规范

**APPROVED_REFERENCE_PAGE=** `/guides` — `src/app/(public)/guides/page.tsx`

**PUBLIC_SHELL_COMPONENT=** `src/components/layout/JueshiV4PublicShell.tsx`
- 使用 `JueshiV4Header` (from `src/components/ui-lab/jueshi-v4-home-candidate-v4/JueshiV4Header`)
- 使用 `JueshiV4Footer` (from `src/components/ui-lab/jueshi-v4-home-candidate-v4/JueshiV4Footer`)

**HEADER_COMPONENT=** `src/components/ui-lab/jueshi-v4-home-candidate-v4/JueshiV4Header.tsx`
**FOOTER_COMPONENT=** `src/components/ui-lab/jueshi-v4-home-candidate-v4/JueshiV4Footer.tsx`
**CONTAINER_COMPONENT_OR_CLASSES=** `PageContainer` — `max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8`
**HERO_COMPONENT_OR_CLASSES=** `PageHero` — `mb-8 sm:mb-12`, H1: `text-3xl sm:text-4xl font-bold`, subtitle: `text-lg`
**SECTION_HEADING_CLASSES=** `SectionHeader` — `mb-6 sm:mb-8`, H2: `text-2xl sm:text-3xl font-bold`, desc: `text-gray-600 mt-2`
**CARD_CLASSES=** 参考 /guides: `bg-white border rounded-xl p-5 hover:shadow-md transition-all`
**LIST_ITEM_CLASSES=** 参考 /guides: Link 包裹, 左图标, 中标题+描述, 右箭头

---

## Real Values (extracted from source)

| Property | Value | Source |
|---|---|---|
| Desktop max container width | `max-w-[1400px]` | PageContainer.tsx |
| Mobile horizontal padding | `px-4` (16px) | PageContainer.tsx |
| Tablet horizontal padding | `px-6` (24px) | PageContainer.tsx |
| Desktop horizontal padding | `px-8` (32px) | PageContainer.tsx |
| PageContainer paddingTop | `pt-6 sm:pt-8 lg:pt-12` | PageContainer.tsx |
| PageContainer paddingBottom | `pb-6 sm:pb-8 lg:pb-12` | PageContainer.tsx |
| H1 font size | `text-3xl sm:text-4xl` (30px/36px) | PageHero.tsx |
| H1 line-height | default Tailwind | PageHero.tsx |
| H1 font-weight | `font-bold` | PageHero.tsx |
| Subtitle font size | `text-lg` (18px) | PageHero.tsx |
| Subtitle color | `text-gray-600 dark:text-gray-300` | PageHero.tsx |
| Section margin bottom | `mb-6 sm:mb-8` | SectionHeader.tsx |
| H2 font size | `text-2xl sm:text-3xl` (24px/30px) | SectionHeader.tsx |
| Section desc font size | default (~16px) | SectionHeader.tsx |
| Section desc color | `text-gray-600 dark:text-gray-400` | SectionHeader.tsx |
| Card border radius | `rounded-xl` (12px) | /guides page.tsx |
| Card border | `border` (1px) | /guides page.tsx |
| Card shadow | `hover:shadow-md` | /guides page.tsx |
| Card padding | `p-5` (20px) | /guides page.tsx |
| Card background | `bg-white` | /guides page.tsx |
| Page background | `bg-gray-50` | /guides page.tsx |
| Primary color | `text-teal-600 / bg-teal-600` | /guides page.tsx |
| Chip active | `bg-teal-600 text-white` | /guides page.tsx |
| Chip inactive | `bg-gray-100 text-gray-600 hover:bg-gray-200` | /guides page.tsx |
| Chip padding | `px-4 py-2 min-h-[44px]` | /guides page.tsx |
| Chip border radius | `rounded-lg` | /guides page.tsx |
| Breadcrumb padding | `pt-6` | /guides page.tsx |
| Page background | `min-h-screen bg-gray-50` | /guides page.tsx |

**Note**: /guides uses `max-w-6xl mx-auto px-4` for individual content areas within PageContainer. This is a pattern to follow.

---

## Current /tools page issues (vs standard)

1. **Background**: uses `bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20` instead of `bg-gray-50`
2. **Hero**: uses PageHero but with gradient background override — should be plain
3. **Filter bar**: ToolFilterBar is custom — needs to match /guides category filter style
4. **Quick links**: uses colored gradient cards instead of standard `bg-white border rounded-xl`
5. **CTA**: uses custom gradient purple/indigo/pink banner — should use PageCTA
6. **Empty states**: use emoji instead of Lucide icons
7. **Tool cards**: rendered by ToolGrid — need to verify against /guides card style

---

## V4 Static Prototype Status

**TOOLS_V4_STATIC_PROTOTYPE_REJECTED**

Directory `/Users/chq/xixiong-saas/docs/ui-prototypes/tools-v4/` must NOT be used as design or implementation reference.
