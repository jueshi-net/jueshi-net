# UI 设计系统 v1 — xixiong-saas 海外百宝箱

> 版本：1.0  
> 创建日期：2026-05-16  
> 状态：待实施  
> 适用范围：全站页面（前台 + 后台）

---

## 一、设计哲学

**关键词**：专业、清晰、信任、温暖

- 不是冷冰冰的工具站，也不是花哨的营销站
- 面向海外华人，需要专业感和亲切感的平衡
- 信息密度适中，重点突出
- 移动端优先，但桌面端体验不打折

---

## 二、色彩规范

### 主色调

| 名称 | Hex | 用途 |
|------|-----|------|
| Primary | `#0d9488` (teal-600) | 主按钮、链接、重点元素 |
| Primary Hover | `#0f766e` (teal-700) | 悬停状态 |
| Primary Light | `#ccfbf1` (teal-50) | 背景高亮、标签 |

### 辅助色

| 名称 | Hex | 用途 |
|------|-----|------|
| Accent | `#3b82f6` (blue-500) | 信息提示、二级按钮 |
| Success | `#22c55e` (green-500) | 成功状态 |
| Warning | `#f59e0b` (amber-500) | 警告、需要注意 |
| Danger | `#ef4444` (red-500) | 错误、删除、危险操作 |
| Info | `#6366f1` (indigo-500) | 信息提示 |

### 中性色

| 名称 | Hex | 用途 |
|------|-----|------|
| Text Primary | `#111827` (gray-900) | 主标题、正文 |
| Text Secondary | `#6b7280` (gray-500) | 副标题、辅助文字 |
| Text Muted | `#9ca3af` (gray-400) | 占位符、禁用文字 |
| Border | `#e5e7eb` (gray-200) | 边框、分割线 |
| Border Light | `#f3f4f6` (gray-100) | 轻边框 |
| Background | `#f9fafb` (gray-50) | 页面背景 |
| Surface | `#ffffff` (white) | 卡片、模态框背景 |

### 暗色模式（后续版本）

暂不实施，但预留支持。

---

## 三、字体层级

### 字体族

- **主字体**：系统默认无衬线字体
  - `font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif`
- **等宽字体**（代码、编号）：
  - `font-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace`

### 字号层级

| 层级 | 桌面端 | 移动端 | 用途 | Tailwind |
|------|--------|--------|------|----------|
| H1 | 36px | 28px | 页面主标题 | `text-3xl md:text-4xl` |
| H2 | 28px | 22px | 区块标题 | `text-2xl md:text-3xl` |
| H3 | 22px | 18px | 子区块标题 | `text-xl md:text-2xl` |
| H4 | 18px | 16px | 卡片标题 | `text-lg md:text-xl` |
| Body | 16px | 15px | 正文 | `text-base` |
| Small | 14px | 13px | 辅助说明、标签 | `text-sm` |
| Caption | 12px | 11px | 注释、时间戳 | `text-xs` |

### 字重

- Regular: `400` — 正文
- Medium: `500` — 小标题、按钮文字
- Semibold: `600` — 卡片标题、强调
- Bold: `700` — H1/H2、重要数字

### 行高

- 标题：`1.25`（紧凑）
- 正文：`1.6`（可读性好）
- 小字：`1.5`

---

## 四、间距规范

### 基础单位

以 `4px` 为最小单位。

| 名称 | 值 | 用途 | Tailwind |
|------|-----|------|----------|
| xs | 4px | 图标间距、内联元素间距 | `gap-1` |
| sm | 8px | 标签间距、表单元素内间距 | `gap-2` |
| md | 16px | 卡片内边距、元素组间距 | `gap-4 / p-4` |
| lg | 24px | 区块间距、卡片间距 | `gap-6 / p-6` |
| xl | 32px | 大区块间距 | `gap-8 / p-8` |
| 2xl | 48px | Hero 区内边距 | `gap-12 / p-12` |

### 页面容器

- 最大宽度：`1280px`（桌面端居中）
- 内容宽度：两侧留白 `24px`（移动端 `16px`）
- Tailwind：`max-w-7xl mx-auto px-4 md:px-6 lg:px-8`

### 卡片内边距

- 标准卡片：`p-4 md:p-6`
- 详细卡片：`p-6 md:p-8`

---

## 五、卡片规范

### 基础卡片

```
┌─────────────────────────────────┐
│ [图标] 标题                     │
│                                  │
│ 描述文字，最多 2-3 行           │
│                                  │
│ [操作按钮]        [状态标签]    │
└─────────────────────────────────┘
```

- 圆角：`rounded-xl`（12px）
- 边框：`border border-gray-200`
- 阴影：默认无，悬停 `hover:shadow-md`
- 背景：`bg-white`
- 过渡：`transition-all duration-200`

### 卡片类型

| 类型 | 用途 | 额外样式 |
|------|------|----------|
| 工具卡片 | 首页/工具列表 | 带图标、hover 效果 |
| 文章卡片 | 文章列表 | 封面图 + 标题 + 摘要 + 元信息 |
| 资源卡片 | 资源列表 | 名称 + 描述 + 标签 + 操作 |
| 数据卡片 | 仪表盘统计 | 大数字 + 标签 |
| 空状态卡片 | 无数据提示 | 居中图标 + 文字 + 操作 |
| 状态卡片 | 后台模块 | 状态标签 + 数据来源 |

---

## 六、按钮规范

### 按钮类型

| 类型 | 样式 | 用途 |
|------|------|------|
| Primary | `bg-teal-600 text-white hover:bg-teal-700` | 主操作（提交、创建） |
| Secondary | `bg-gray-100 text-gray-700 hover:bg-gray-200` | 次要操作（取消、返回） |
| Ghost | `text-teal-600 hover:bg-teal-50` | 链接式操作（编辑、详情） |
| Danger | `bg-red-600 text-white hover:bg-red-700` | 危险操作（删除） |
| Outline | `border border-gray-300 text-gray-700 hover:border-teal-500 hover:text-teal-600` | 可选操作 |

### 按钮尺寸

| 尺寸 | 高度 | 字号 | 内边距 | 用途 |
|------|------|------|--------|------|
| sm | 32px | 13px | `px-3 py-1.5` | 表格内操作、标签按钮 |
| md | 40px | 14px | `px-4 py-2` | 标准按钮 |
| lg | 48px | 16px | `px-6 py-3` | Hero 区 CTA、主操作 |

### 触控区域

- 移动端最小触控区域：`44px × 44px`
- 按钮间距至少 `8px`

---

## 七、表单规范

### 输入框

- 高度：`40px`（md）、`48px`（lg）
- 圆角：`rounded-lg`（8px）
- 边框：`border border-gray-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500`
- 背景：`bg-white`
- 占位符：`text-gray-400`
- 错误状态：`border-red-500 focus:ring-red-500`

### 表单布局

- 标签在输入框上方，`block text-sm font-medium mb-1`
- 必填标记：红色星号 `*`
- 帮助文字：输入框下方，`text-xs text-gray-400 mt-1`
- 错误提示：输入框下方，`text-xs text-red-500 mt-1`

### 表单组间距

- 垂直间距：`space-y-4`
- 水平布局（桌面端）：`grid grid-cols-1 md:grid-cols-2 gap-4`

---

## 八、空状态规范

### 标准空状态

```
┌─────────────────────────────────┐
│                                  │
│          [大图标/插画]           │
│                                  │
│        "暂无内容" 标题           │
│                                  │
│     说明文字，解释为什么为空     │
│                                  │
│         [操作按钮]               │
│                                  │
└─────────────────────────────────┘
```

### 样式

- 容器：`bg-white rounded-xl border border-gray-200 p-12 md:p-16 text-center`
- 图标：`w-16 h-16 text-gray-300 mx-auto mb-4`
- 标题：`text-lg font-medium text-gray-900 mb-2`
- 说明：`text-gray-500 mb-6`
- 按钮：主按钮或链接

### 常见空状态文案

| 模块 | 标题 | 说明 | 操作 |
|------|------|------|------|
| 工具收藏 | "还没有收藏工具" | "收藏常用工具，快速访问" | "浏览工具" |
| 自定义网址 | "还没有自定义网址" | "添加你每天会打开的网站" | "添加网址" |
| 文章列表 | "暂无文章" | "该分类下还没有发布的文章" | "返回全部" |
| 资源列表 | "暂无资源" | "该分类下还没有收录的资源" | "返回全部" |
| 积分记录 | "暂无积分记录" | "签到或完成任务可以获得积分" | "去签到" |

---

## 九、移动端规范

### 断点

| 断点 | 宽度 | 用途 |
|------|------|------|
| xs | < 375px | 小屏手机 |
| sm | ≥ 375px | 标准手机 |
| md | ≥ 768px | 平板 |
| lg | ≥ 1024px | 桌面 |

### 布局规则

1. **单列优先** — 移动端所有网格默认单列，md 及以上才多列
2. **堆叠顺序** — 重要内容先渲染，桌面端可用 flex/grid 调整视觉顺序
3. **固定导航** — 移动端底部导航栏（如有），桌面端顶部导航
4. **全宽按钮** — 移动端主操作按钮 `w-full`
5. **减少水平滚动** — 所有容器 `overflow-x-hidden`

### 触控友好

- 按钮最小尺寸 `44px × 44px`
- 链接点击区域足够大
- 表单输入时页面不缩放（`<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">`）

### iPhone Safari 特别注意

- `100vh` 问题：使用 `min-h-screen` 或 `h-[100dvh]`
- 底部安全区域：`pb-safe`（如有固定底部栏）
- 输入框聚焦时键盘弹出不遮挡：关键输入区域上方留白

---

## 十、组件优先级

### 立即实施（v1.20.0）

1. 色彩变量（CSS 变量或 Tailwind 配置）
2. 卡片组件（`<BaseCard>`）
3. 按钮组件（`<BaseButton>`）
4. 空状态组件（`<EmptyState>`）
5. 页面容器（`<PageContainer>`）

### 后续版本

1. 暗色模式
2. 动画/过渡效果库
3. 数据可视化组件
4. 高级表单组件（日期选择器、文件上传）

---

## 实施检查清单

- [ ] Tailwind 配置更新（颜色、字体、间距）
- [ ] 基础组件创建
- [ ] 全局样式变量
- [ ] 首页应用设计系统
- [ ] 工具页应用设计系统
- [ ] 后台应用设计系统
- [ ] 移动端全量测试
