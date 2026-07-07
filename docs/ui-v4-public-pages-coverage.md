# UI V4 Public Pages Coverage

**Version:** 1.0
**Last Updated:** 2026-07-07
**Mode:** DEV (staging only)

---

## Overview

Documents which public-facing pages use the V4 shell (JueshiV4Header + JueshiV4Footer) and which use the legacy shell (Header + FooterNew).

---

## Shell Components

| Component | Location | Used By |
|-----------|----------|---------|
| `JueshiV4Header` | `src/components/ui-lab/jueshi-v4-home-candidate-v4/JueshiV4Header.tsx` | Homepage, /resources, /resources/site/[id] |
| `JueshiV4Footer` | `src/components/ui-lab/jueshi-v4-home-candidate-v4/JueshiV4Footer.tsx` | Homepage, /resources, /resources/site/[id] |
| `JueshiV4PublicShell` | `src/components/layout/JueshiV4PublicShell.tsx` | Wrapper combining V4 Header + Footer |
| `Header` (legacy) | `src/components/layout/header.tsx` | All other public pages |
| `FooterNew` (legacy) | `src/components/layout/footer-new.tsx` | All other public pages |

---

## Page Coverage Matrix

| Route | Shell | Header | Footer | Notes |
|-------|-------|--------|--------|-------|
| `/` | V4 | JueshiV4Header | JueshiV4Footer | Homepage, own layout |
| `/resources` | V4 | JueshiV4Header | JueshiV4Footer | Via JueshiV4PublicShell |
| `/resources/site/[id]` | V4 | JueshiV4Header | JueshiV4Footer | Via JueshiV4PublicShell |
| `/tools` | Legacy | Header | FooterNew | Via public-layout-client |
| `/checklists` | Legacy | Header | FooterNew | Via public-layout-client |
| `/guides` | Legacy | Header | FooterNew | Via public-layout-client |
| `/destinations` | Legacy | Header | FooterNew | Via public-layout-client |
| `/community` | Legacy | Header | FooterNew | Via public-layout-client |
| `/topics` | Legacy | Header | FooterNew | Via public-layout-client |
| `/workspace/*` | Workspace | WorkspaceSidebar | — | Separate workspace layout |
| `/login` | None | — | — | Standalone auth page |

---

## Navigation Entries

All V4 shell pages share the same nav from `homepageConfig.ts`:

| Key | Label | Href | Priority |
|-----|-------|------|----------|
| nav_home | 首页 | / | core |
| nav_tools | 工具 | /tools | core |
| nav_checklist | 清单 | /checklists | core |
| nav_guides | 指南 | /guides | core |
| nav_resources | 资源 | /resources | core |
| nav_country | 国家 | /destinations | core |
| nav_topics | 专题 | /topics | extended |
| nav_community | 社区 | /community | extended |

---

## Layout Bypass Rules

`public-layout-client.tsx` skips the legacy Header/Footer for:
- `/` (homepage uses its own V4 shell)
- `/ui-lab/*` (UI lab pages)
- `/resources` (uses JueshiV4PublicShell)
- `/resources/site/*` (uses JueshiV4PublicShell)

All other routes get the legacy Header + FooterNew from the public layout.

---

## Known Issues

- Legacy pages (`/tools`, `/checklists`, etc.) use a different header style than V4 pages
- Mobile nav on V4 header shows hamburger menu but extended nav items are hidden on < 2xl
- No visual regression tests yet — manual verification required after each deploy

---

## Verification Checklist

After each deploy, verify:
- [ ] `/` — V4 header with 国家 nav entry
- [ ] `/resources` — V4 header, load more button, 3-button cards
- [ ] `/resources/site/[id]` — V4 header, no double header/footer
- [ ] `/destinations` — Legacy header (different style, expected)
- [ ] `/tools` — Legacy header (different style, expected)

---

**END OF DOCUMENT**
