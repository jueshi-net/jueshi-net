# Mobile Public Shell Visual Specification

**Version**: 1.0  
**Date**: 2026-07-09  
**Status**: ACTIVE  
**Mode**: DEV (Staging Only)

---

## 1. Mobile Header Specification

### 1.1 Header Container
```css
height: 76px
background: bg-white/95 backdrop-blur-md
border-bottom: border-b border-[#E8ECF3]
shadow: shadow-sm
position: sticky top-0 z-50
```

### 1.2 Logo
```css
height: 44px
width: auto (responsive)
max-width: 160px
object-fit: contain
```

### 1.3 Horizontal Padding
```css
mobile (< 768px): px-4 (16px)
tablet (768px - 1024px): md:px-6 (24px)
desktop (> 1024px): lg:px-8 (32px)
```

### 1.4 Icon Size
```css
notification: w-5 h-5 (20px)
checkin: w-4 h-4 (16px)
menu: w-5 h-5 (20px)
```

### 1.5 Header Border & Shadow
```css
border-bottom: 1px solid #E8ECF3
box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
```

---

## 2. Hero Section Specification

### 2.1 Hero Top Offset
```css
margin-top: 0 (直接紧跟 Header，无额外间距)
padding-top: 24px (mobile)
padding-top: 32px (desktop)
```

### 2.2 Hero Vertical Padding
```css
mobile: py-6 (24px top + 24px bottom)
desktop: py-8 (32px top + 32px bottom)
```

### 2.3 Hero Min Height
```css
mobile: min-h-[120px]
desktop: min-h-[160px]
```

### 2.4 Hero Content Structure
```
BreadcrumbBar (optional, margin-bottom: 16px)
↓
PageHero
  - title: text-3xl font-bold (mobile) / text-4xl font-bold (desktop)
  - subtitle: text-base text-gray-600 (mobile) / text-lg text-gray-600 (desktop)
  - margin-bottom: 24px
```

---

## 3. Breadcrumb Position

### 3.1 Breadcrumb Placement
```
Header
↓
BreadcrumbBar (margin-bottom: 16px)
↓
PageHero
↓
Content
```

### 3.2 Breadcrumb Styling
```css
padding: py-2 (8px top + 8px bottom)
font-size: text-sm (14px)
color: text-gray-500
background: transparent
```

---

## 4. Search/Filter Position

### 4.1 Search/Filter Placement (CRITICAL)
```
Header
↓
BreadcrumbBar (optional)
↓
PageHero (title + subtitle)
↓
Search/Filter Bar
↓
Content
```

**禁止**: Search/Filter 出现在 PageHero 之前

### 4.2 Search/Filter Styling
```css
padding: py-3 (12px top + 12px bottom)
background: bg-white
border-bottom: border-b border-gray-200
position: sticky top-[76px] (紧跟 Header)
```

---

## 5. Page Content Top Spacing

### 5.1 Content Container
```css
padding-top: 24px (mobile)
padding-top: 32px (desktop)
padding-bottom: 48px (mobile)
padding-bottom: 64px (desktop)
```

### 5.2 Content Max Width
```css
max-width: max-w-[1440px]
margin: mx-auto (居中)
```

---

## 6. Page-Specific Requirements

### 6.1 /community (redirects to /bbs)
- **必须**: 使用 JueshiV4PublicShell
- **必须**: 使用统一 Logo (brandLogo from config)
- **必须**: Hero 结构: Header → Hero → Search → Posts
- **禁止**: 使用旧彩色 Logo
- **禁止**: 双 Header

### 6.2 /tools
- **必须**: Hero 在 ToolFilterBar 之前
- **必须**: 结构: Header → Hero → ToolFilterBar → ToolGrid
- **禁止**: ToolFilterBar 在 Hero 之前

### 6.3 /resources
- **必须**: 结构: Header → Hero → Content
- **必须**: Hero 起点与其他页面一致

### 6.4 /guides
- **必须**: 结构: Header → Hero → Content
- **必须**: Hero 起点与其他页面一致

### 6.5 /checklists
- **必须**: 结构: Header → Hero → Content
- **必须**: Hero 起点与其他页面一致

### 6.6 /topics
- **必须**: 结构: Header → Hero → Content
- **必须**: Hero 起点与其他页面一致

### 6.7 /destinations
- **必须**: 结构: Header → Hero → Content
- **必须**: Hero 起点与其他页面一致

### 6.8 /search
- **必须**: 结构: Header → Hero → SearchInput → Results
- **必须**: Hero 起点与其他页面一致

---

## 7. Mobile Menu Specification

### 7.1 Menu Button
```css
position: right side of header
size: w-5 h-5 (20px)
padding: p-2 (8px)
color: text-[#808191]
hover: hover:bg-[#F3F5FA]
border-radius: rounded-lg
```

### 7.2 Menu Panel
```css
position: absolute top-[76px] right-0
width: w-64 (256px)
background: bg-white
shadow: shadow-lg
border-radius: rounded-lg
padding: p-4 (16px)
```

### 7.3 Menu Items
```css
font-size: text-sm (14px)
padding: py-2 (8px top + 8px bottom)
color: text-[#11142D]
hover: hover:bg-[#F3F5FA]
```

---

## 8. Verification Checklist

### 8.1 Header Verification
- [ ] Header height: 76px
- [ ] Logo height: 44px
- [ ] Logo uses unified asset (brandLogo)
- [ ] Horizontal padding: 16px (mobile)
- [ ] Border: 1px solid #E8ECF3
- [ ] Shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05)

### 8.2 Hero Verification
- [ ] Hero top offset: 0 (no extra spacing)
- [ ] Hero padding: 24px (mobile)
- [ ] Hero min-height: 120px (mobile)
- [ ] Breadcrumb position: above Hero
- [ ] Search/Filter position: below Hero

### 8.3 Mobile Menu Verification
- [ ] Menu button visible on mobile
- [ ] Menu button clickable
- [ ] Menu panel expands on click
- [ ] Menu items visible
- [ ] Menu closes on outside click

### 8.4 Page Structure Verification
- [ ] No double Header
- [ ] Unified Logo across all pages
- [ ] Consistent Hero starting position
- [ ] Search/Filter below Hero (not above)

---

## 9. Implementation Notes

### 9.1 /bbs Page Fix
**Problem**: /bbs uses old Header from public-layout-client.tsx  
**Solution**: Wrap /bbs content with JueshiV4PublicShell

### 9.2 /tools Page Fix
**Problem**: ToolFilterBar appears before PageHero  
**Solution**: Reorder to: PageHero → ToolFilterBar → ToolGrid

### 9.3 Other Pages
**Action**: Verify Hero starting position consistency across:
- /resources
- /guides
- /checklists
- /topics
- /destinations
- /search

---

## 10. Testing Procedure

### 10.1 Mobile Testing (390px viewport)
1. Open each page in mobile viewport
2. Measure Header height (should be 76px)
3. Measure Logo height (should be 44px)
4. Verify Hero starts immediately after Header
5. Verify Search/Filter is below Hero
6. Test mobile menu click and expand

### 10.2 Desktop Testing (1440px viewport)
1. Verify Header height remains 76px
2. Verify Logo height remains 44px
3. Verify Hero padding increases to 32px
4. Verify desktop navigation visible

---

**Final Verdict**: `READY_FOR_IMPLEMENTATION`
