# 当前视觉资产审查报告

**版本**: v1.20.42.6.55-Y-R  
**日期**: 2026-06-12  
**审查范围**: public/, src/app/, src/components/, src/styles/, tailwind.config, globals.css

---

## 1. Logo 文件

### 1.1 当前状态

| 文件 | 路径 | 状态 | 说明 |
|------|------|------|------|
| Logo 占位符 | `/public/brand/jueshi-logo-placeholder.svg` | ✅ 存在 | SVG 格式，888 字节 |
| Header Logo | `src/components/layout/header.tsx` | ✅ 引用 | 使用 `/brand/jueshi-logo-placeholder.svg` |
| Footer Logo | `src/components/layout/footer.tsx` | ❌ 无 | Footer 中未使用 logo |

### 1.2 问题

- **Logo 是占位符**: 当前使用的是 `jueshi-logo-placeholder.svg`，不是正式品牌 logo
- **Footer 无 logo**: Footer 组件中未包含 logo，品牌展示不完整
- **无正式 logo 文件**: 项目中没有正式设计的品牌 logo 文件

### 1.3 Header Logo 配置

```typescript
const [branding, setBranding] = useState({
  logoUrl: "/brand/jueshi-logo-placeholder.svg",
  logoAlt: "绝世百宝箱 jueshi.net",
  logoWidth: 168,
  logoHeight: 42,
});
```

**尺寸**: 168x42px (4:1 比例)  
**显示**: `h-10 w-auto hidden sm:block` (移动端隐藏)

---

## 2. Favicon

### 2.1 当前状态

| 文件 | 路径 | 状态 | 说明 |
|------|------|------|------|
| favicon.ico | `/public/favicon.ico` | ❌ 不存在 | layout.tsx 中引用但文件缺失 |
| layout.tsx 引用 | `src/app/layout.tsx` | ⚠️ 引用缺失文件 | `icon: "/favicon.ico"` |

### 2.2 问题

- **favicon.ico 缺失**: layout.tsx 中引用了 `/favicon.ico`，但文件不存在
- **浏览器会使用默认图标**: 导致浏览器标签页显示默认图标，品牌识别度低

### 2.3 影响

- 浏览器标签页无品牌图标
- 书签无品牌图标
- 搜索结果无品牌图标

---

## 3. App Icon / PWA Icon

### 3.1 当前状态

| 文件 | 路径 | 尺寸 | 状态 |
|------|------|------|------|
| icon-192.png | `/public/icons/icon-192.png` | 192x192 | ✅ 存在 |
| icon-512.png | `/public/icons/icon-512.png` | 512x512 | ✅ 存在 |

### 3.2 Manifest 配置

```json
{
  "name": "海外百宝箱 - 海外华人的常用工具与资源平台",
  "short_name": "海外百宝箱",
  "theme_color": "#3B82F6",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

### 3.3 问题

- **theme_color 不一致**: manifest 中使用 `#3B82F6`（蓝色），但品牌色是 `#1966f2`
- **图标内容未知**: 无法确认图标是否与品牌一致（需要视觉检查）

---

## 4. Open Graph Image

### 4.1 当前状态

| 文件 | 路径 | 状态 |
|------|------|------|
| OG Image | 未找到 | ❌ 不存在 |

### 4.2 问题

- **无 Open Graph 图片**: 分享到社交媒体时无预览图
- **影响社交分享效果**: 链接分享时无品牌视觉展示

---

## 5. 品牌色配置

### 5.1 当前状态

**文件**: `src/app/globals.css`

```css
@theme {
  --color-brand: #1966f2;
  --color-brand-dark: #1452c4;
  --color-cat-purple: #7947e8;
  --color-cat-orange: #ff7922;
  --color-cat-pink: #e82e5b;
  --color-cat-blue: #2568e2;
  --color-cat-teal: #178b86;
  --color-bg: #f8fafc;
  --color-title: #111111;
  --color-subtitle: #666666;
  --color-border: #e5e7eb;
  --color-border-light: #f0f0f0;
}
```

### 5.2 品牌色

| 变量 | 色值 | 用途 |
|------|------|------|
| `--color-brand` | `#1966f2` | 主品牌色（蓝色） |
| `--color-brand-dark` | `#1452c4` | 深色品牌色 |

### 5.3 分类色

| 变量 | 色值 | 用途 |
|------|------|------|
| `--color-cat-purple` | `#7947e8` | 分类紫色 |
| `--color-cat-orange` | `#ff7922` | 分类橙色 |
| `--color-cat-pink` | `#e82e5b` | 分类粉色 |
| `--color-cat-blue` | `#2568e2` | 分类蓝色 |
| `--color-cat-teal` | `#178b86` | 分类青色 |

### 5.4 问题

- **品牌色未统一使用**: 论坛页面使用 `teal-600` 而非品牌色 `#1966f2`
- **分类色未与论坛关联**: 论坛分类未使用定义的分类色变量

---

## 6. 视觉不一致性

### 6.1 颜色不一致

| 位置 | 使用颜色 | 品牌色 | 问题 |
|------|----------|--------|------|
| Header Logo | 占位符 SVG | - | 非正式 logo |
| 论坛页面 | `teal-600` (#0d9488) | `#1966f2` | ❌ 不一致 |
| Manifest theme_color | `#3B82F6` | `#1966f2` | ❌ 不一致 |
| 品牌色变量 | `#1966f2` | `#1966f2` | ✅ 正确 |

### 6.2 具体不一致示例

**论坛页面** (`src/app/(public)/bbs/page.tsx`):
```tsx
className="bg-teal-600 text-white"  // ❌ 应使用品牌色
```

**Manifest** (`public/manifest.json`):
```json
"theme_color": "#3B82F6"  // ❌ 应为 #1966f2
```

---

## 7. Flarum 视觉残留

### 7.1 检查结果

| 检查项 | 状态 | 说明 |
|--------|------|------|
| bbs.jueshi.net 引用 | ✅ 无残留 | 已全部清理 |
| Flarum logo | ✅ 无残留 | 未发现 |
| Flarum 色彩 | ✅ 无残留 | 未发现 |
| Flarum 样式 | ✅ 无残留 | 未发现 |

### 7.2 结论

**Flarum 视觉残留**: ✅ 无

---

## 8. 多个不一致 Logo

### 8.1 检查结果

| 位置 | Logo | 状态 |
|------|------|------|
| Header | `/brand/jueshi-logo-placeholder.svg` | ✅ 占位符 |
| Footer | 无 | ⚠️ 缺失 |
| Favicon | 缺失 | ❌ 缺失 |
| PWA Icon | `/icons/icon-192.png`, `/icons/icon-512.png` | ✅ 存在 |

### 8.2 结论

**多个不一致 Logo**: ⚠️ 部分问题
- Header 使用占位符
- Footer 无 logo
- Favicon 缺失
- PWA Icon 存在但内容未知

---

## 9. 总结

### 9.1 关键问题

| 优先级 | 问题 | 影响 |
|--------|------|------|
| 🔴 高 | Favicon 缺失 | 浏览器标签页无品牌图标 |
| 🔴 高 | Logo 是占位符 | 品牌识别度低 |
| 🟡 中 | 论坛颜色不一致 | 视觉不统一 |
| 🟡 中 | Manifest theme_color 不一致 | PWA 主题色不统一 |
| 🟡 中 | Footer 无 logo | 品牌展示不完整 |
| 🟢 低 | 无 Open Graph 图片 | 社交分享无预览图 |

### 9.2 需要改进的视觉资产

1. **Logo**: 需要设计正式品牌 logo（替换占位符）
2. **Favicon**: 需要创建 favicon.ico
3. **论坛颜色**: 需要统一使用品牌色 `#1966f2`
4. **Manifest**: 需要更新 theme_color 为 `#1966f2`
5. **Footer**: 需要添加 logo
6. **Open Graph**: 需要创建 OG 图片

### 9.3 当前视觉资产清单

| 资产类型 | 状态 | 路径 |
|----------|------|------|
| Logo (占位符) | ✅ 存在 | `/public/brand/jueshi-logo-placeholder.svg` |
| Logo (正式) | ❌ 缺失 | - |
| Favicon | ❌ 缺失 | - |
| PWA Icon 192 | ✅ 存在 | `/public/icons/icon-192.png` |
| PWA Icon 512 | ✅ 存在 | `/public/icons/icon-512.png` |
| Open Graph | ❌ 缺失 | - |
| 品牌色定义 | ✅ 存在 | `src/app/globals.css` |
| Manifest | ✅ 存在 | `/public/manifest.json` |

---

**报告生成时间**: 2026-06-12  
**审查状态**: ✅ 完成
