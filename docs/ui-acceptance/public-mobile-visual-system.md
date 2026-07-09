# Public Mobile Visual System Specification

**Version**: 1.0  
**Date**: 2026-07-09  
**Status**: ACTIVE  
**Mode**: DEV (Staging Only)

---

## 1. Overview

This document defines the unified visual system for all public-facing mobile pages. All 7 high-frequency public pages must follow this specification to ensure visual consistency.

### Target Pages
- /bbs (or /community)
- /topics
- /destinations
- /resources
- /guides
- /checklists
- /tools

---

## 2. Unified Page Structure

All public pages must follow this exact structure:

```
Header (unified JueshiV4Header)
  ↓
Breadcrumb (optional, but position must be consistent)
  ↓
PublicPageHero (unified component)
  ↓
Search/Filter (position unified by page type)
  ↓
Content
```

### Forbidden Structures
- ❌ Search/Filter before Hero
- ❌ Categories before Hero
- ❌ Custom Hero gradients per page
- ❌ Custom Hero padding per page
- ❌ Custom Logo/Header per page
- ❌ Double Headers
- ❌ Independent notification badges

---

## 3. Header Specification

### 3.1 Logo
- **Asset**: Unified crab logo (jueshi-logo-crab.jpg)
- **Height**: 44px (h-[44px])
- **Width**: auto (responsive)
- **Max-width**: 160px
- **Alt text**: "绝世百宝箱"

### 3.2 Header Container
- **Height**: 76px (h-[76px])
- **Background**: bg-white/95 backdrop-blur-md
- **Border**: border-b border-[#E8ECF3]
- **Shadow**: shadow-sm
- **Position**: sticky top-0 z-50

### 3.3 Max Width
- **Container**: max-w-[1440px] mx-auto
- **Padding**: px-4 md:px-6 lg:px-8

### 3.4 Right Side Icons
All pages must have identical right-side structure:
- Notification icon (w-5 h-5)
- Menu button (lg:hidden, w-5 h-5)
- **NO independent number badges**
- **NO page-specific badges**

---

## 4. Breadcrumb Specification

### 4.1 Position
- **Location**: Immediately after Header, before Hero
- **Margin**: mb-4 (mobile), mb-6 (desktop)

### 4.2 Styling
```css
font-size: text-sm (14px)
color: text-gray-500
link-color: text-blue-600 hover:text-blue-800
separator: ChevronRight icon (w-4 h-4)
```

### 4.3 Structure
```
首页 > [Page Name]
```

### 4.4 Optional Pages
- If Breadcrumb is not needed, maintain consistent spacing
- All pages must either have Breadcrumb or have equivalent spacing

---

## 5. PublicPageHero Specification

### 5.1 Background
**Unified gradient for all pages:**
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
```

**Alternative (if gradient not suitable):**
```css
background: bg-gradient-to-br from-blue-50 to-purple-50
```

**Forbidden:**
- ❌ Custom gradients per page
- ❌ Solid colors per page
- ❌ Different gradient directions per page

### 5.2 Padding
```css
mobile: py-12 px-4
tablet: md:py-16 md:px-6
desktop: lg:py-20 lg:px-8
```

### 5.3 Title
```css
font-size: text-3xl sm:text-4xl lg:text-5xl
font-weight: font-bold
line-height: leading-tight
color: text-white (on gradient) or text-gray-900 (on light bg)
margin-bottom: mb-4
```

### 5.4 Subtitle/Description
```css
font-size: text-lg sm:text-xl
line-height: leading-relaxed
color: text-white/90 (on gradient) or text-gray-600 (on light bg)
max-width: max-w-2xl
margin-top: mt-2
```

### 5.5 Badge/Eyebrow (Optional)
```css
font-size: text-sm
font-weight: font-medium
padding: px-3 py-1
background: bg-white/20 backdrop-blur-sm (on gradient) or bg-blue-100 (on light bg)
color: text-white (on gradient) or text-blue-700 (on light bg)
border-radius: rounded-full
margin-bottom: mb-4
```

**Rules:**
- If no badge content, do not render badge element
- Badge must not affect layout when absent
- All pages with badges must use identical styling

### 5.6 Actions (Optional)
```css
position: below subtitle
margin-top: mt-6
display: flex gap-3
```

---

## 6. Search/Filter Specification

### 6.1 Position
**Must be after Hero, never before:**
```
Hero
  ↓
Search/Filter
  ↓
Content
```

### 6.2 Styling
```css
background: bg-white
border: border-b border-gray-200
padding: py-4 px-4
position: sticky top-[76px] z-40 (if needed)
```

### 6.3 Search Input
```css
width: w-full
height: h-10
padding: pl-10 pr-4
background: bg-gray-50
border: border border-gray-200
border-radius: rounded-lg
font-size: text-sm
focus: focus:ring-2 focus:ring-blue-500 focus:border-blue-500
```

### 6.4 Filter Buttons
```css
padding: px-4 py-2
background: bg-gray-100
border-radius: rounded-lg
font-size: text-sm
font-weight: font-medium
active: bg-blue-600 text-white
hover: bg-gray-200
```

---

## 7. Content Top Spacing

### 7.1 After Hero
```css
margin-top: mt-6 (mobile)
margin-top: md:mt-8 (tablet)
margin-top: lg:mt-10 (desktop)
```

### 7.2 After Search/Filter
```css
margin-top: mt-4 (mobile)
margin-top: md:mt-6 (tablet)
```

---

## 8. Page-Specific Rules

### 8.1 /bbs (Community)
- **Breadcrumb**: 首页 > 社区论坛
- **Hero Title**: 社区论坛
- **Hero Subtitle**: 交流出海工具、海外生活、物流经验
- **Search Position**: After Hero
- **Categories Position**: After Search
- **Logo**: Unified crab logo (NOT old colored logo)
- **Notification Badge**: Remove number 9 badge

### 8.2 /topics
- **Breadcrumb**: 首页 > 专题推荐
- **Hero Title**: 专题推荐
- **Hero Subtitle**: 围绕真实使用场景的精选内容
- **Search Position**: N/A (no search)
- **Categories Position**: N/A (no categories)

### 8.3 /destinations
- **Breadcrumb**: 首页 > 目的地
- **Hero Title**: 目的地
- **Hero Subtitle**: 全球覆盖 195 国
- **Search Position**: After Hero
- **Categories Position**: N/A

### 8.4 /resources
- **Breadcrumb**: 首页 > 资源导航
- **Hero Title**: 资源导航
- **Hero Subtitle**: 精选 916 个优质海外工具与服务
- **Search Position**: After Hero
- **Categories Position**: After Search

### 8.5 /guides
- **Breadcrumb**: 首页 > 实用指南
- **Hero Title**: 实用指南
- **Hero Subtitle**: 面向出海商家、海外华人、留学生的工具教程
- **Search Position**: N/A
- **Categories Position**: After Hero (NOT before)

### 8.6 /checklists
- **Breadcrumb**: 首页 > 清单
- **Hero Title**: 清单
- **Hero Subtitle**: 实用的出海行动核对清单
- **Search Position**: N/A
- **Categories Position**: N/A

### 8.7 /tools
- **Breadcrumb**: 首页 > 工具中心
- **Hero Title**: 工具中心
- **Hero Subtitle**: 外贸单据、跨境物流、邮编汇率、HS 编码
- **Search Position**: After Hero (NOT before)
- **Categories Position**: After Search

---

## 9. Mobile Viewport Testing

### 9.1 Viewport Size
- **Width**: 390px (iPhone 12/13/14)
- **Height**: 844px

### 9.2 Verification Checklist
For each page, verify:
- [ ] Header uses unified crab logo
- [ ] Header height is 76px
- [ ] Logo height is 44px
- [ ] Hero top Y position is consistent
- [ ] Hero height is consistent
- [ ] Hero background uses unified gradient
- [ ] Breadcrumb position is consistent
- [ ] Search/Filter is after Hero (not before)
- [ ] No custom gradient blocks
- [ ] Menu button is clickable
- [ ] Menu expands correctly
- [ ] Menu closes correctly

---

## 10. Implementation Notes

### 10.1 Component Usage
- Use `PageHero` from `@/components/design-system`
- Do NOT create duplicate Hero components
- Extend existing `PageHero` if needed

### 10.2 Styling Approach
- Use Tailwind CSS classes
- Avoid inline styles
- Use design system tokens where possible

### 10.3 Responsive Design
- Mobile-first approach
- Test at 390px, 768px, 1440px
- Ensure consistent spacing across breakpoints

---

## 11. Final Verdict

**Status**: `READY_FOR_IMPLEMENTATION`

All 7 pages must be updated to follow this specification. No page-specific customizations are allowed unless explicitly documented in Section 8.
