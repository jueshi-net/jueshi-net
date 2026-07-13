# UI V4 设计系统规范

> **版本**: v1.0  
> **创建时间**: 2026-07-06  
> **状态**: 待用户审阅  
> **用途**: 作为全站 UI V4 优化的参考标准

---

## 一、设计原则

### 1.1 核心理念

- **简洁现代**：清晰的视觉层次，减少视觉噪音
- **一致统一**：全站使用统一的设计语言
- **响应优先**：移动端优先，渐进增强
- **可访问性**：符合 WCAG 2.1 AA 标准

### 1.2 设计价值观

- **专业**：体现跨境工具的专业性
- **友好**：降低用户学习成本
- **高效**：帮助用户快速完成任务
- **可信赖**：建立用户信任感

---

## 二、颜色系统

### 2.1 主色（Primary）

```css
/* 主色 - 品牌色系统 */
--primary-purple: #6C5DD3   /* 主紫色 - 品牌主色 */
--primary-blue: #3F8CFF     /* 主蓝色 - 辅助主色 */
--accent-orange: #FF754C    /* 强调橙色 - 用于 CTA、高亮 */

/* 主色色阶 - 基于紫色 */
--primary-50:  #f5f3ff   /* 最浅背景 */
--primary-100: #ede9fe   /* 浅背景 */
--primary-200: #ddd6fe   /* 边框、分隔线 */
--primary-300: #c4b5fd   /* 悬停状态 */
--primary-400: #a78bfa   /* 次要元素 */
--primary-500: #6C5DD3   /* 主色标准 */
--primary-600: #5b4fc4   /* 主色加深 */
--primary-700: #4c3fb3   /* 主色更深 */
--primary-800: #3d3199   /* 深色背景 */
--primary-900: #2e2473   /* 最深背景 */

/* 蓝色色阶 - 用于辅助元素 */
--blue-50:  #eff6ff
--blue-100: #dbeafe
--blue-200: #bfdbfe
--blue-300: #93c5fd
--blue-400: #60a5fa
--blue-500: #3F8CFF
--blue-600: #2563eb
--blue-700: #1d4ed8
--blue-800: #1e40af
--blue-900: #1e3a8a

/* 橙色色阶 - 用于强调 */
--orange-50:  #fff7ed
--orange-100: #ffedd5
--orange-200: #fed7aa
--orange-300: #fdba74
--orange-400: #fb923c
--orange-500: #FF754C
--orange-600: #ea580c
--orange-700: #c2410c
--orange-800: #9a3412
--orange-900: #7c2d12
```

**使用场景**：
- 主要按钮：`bg-[#6C5DD3] hover:bg-[#5b4fc4]`
- 链接文本：`text-[#6C5DD3] hover:text-[#5b4fc4]`
- 强调元素：`border-[#6C5DD3]`
- CTA 按钮：`bg-[#FF754C] hover:bg-[#ea580c]`
- 辅助蓝色：`text-[#3F8CFF]` 或 `bg-[#3F8CFF]`

### 2.2 辅色（Secondary）

```css
/* 辅色 - 用于次要按钮、标签、辅助元素 */
--secondary-50:  #f8fafc
--secondary-100: #f1f5f9
--secondary-200: #e2e8f0
--secondary-300: #cbd5e1
--secondary-400: #94a3b8
--secondary-500: #64748b
--secondary-600: #475569
--secondary-700: #334155
--secondary-800: #1e293b
--secondary-900: #0f172a
```

**使用场景**：
- 次要按钮：`bg-secondary-100 hover:bg-secondary-200 text-secondary-700`
- 标签背景：`bg-secondary-100 text-secondary-700`
- 辅助文本：`text-secondary-600`

### 2.3 中性色（Neutral）

```css
/* 中性色 - 用于文本、背景、边框 */
--neutral-50:  #fafafa   /* 页面背景 */
--neutral-100: #f5f5f5   /* 卡片背景 */
--neutral-200: #e5e5e5   /* 边框 */
--neutral-300: #d4d4d4   /* 分隔线 */
--neutral-400: #a3a3a3   /* 占位符文本 */
--neutral-500: #737373   /* 次要文本 */
--neutral-600: #525252   /* 常规文本 */
--neutral-700: #404040   /* 重要文本 */
--neutral-800: #262626   /* 标题文本 */
--neutral-900: #171717   /* 最深文本 */
```

**使用场景**：
- 页面背景：`bg-neutral-50`
- 卡片背景：`bg-white` 或 `bg-neutral-100`
- 标题文本：`text-neutral-900`
- 常规文本：`text-neutral-700`
- 次要文本：`text-neutral-500`
- 边框：`border-neutral-200`

### 2.4 语义色（Semantic）

```css
/* 成功色 - 用于成功状态、确认信息 */
--success-50:  #f0fdf4
--success-500: #22c55e
--success-600: #16a34a
--success-700: #15803d

/* 警告色 - 用于警告状态、提示信息 */
--warning-50:  #fefce8
--warning-500: #eab308
--warning-600: #ca8a04
--warning-700: #a16207

/* 错误色 - 用于错误状态、删除操作 */
--error-50:  #fef2f2
--error-500: #ef4444
--error-600: #dc2626
--error-700: #b91c1c

/* 信息色 - 用于信息提示、帮助文本 */
--info-50:  #eff6ff
--info-500: #3b82f6
--info-600: #2563eb
--info-700: #1d4ed8
```

**使用场景**：
- 成功提示：`bg-success-50 text-success-700 border-success-500`
- 警告提示：`bg-warning-50 text-warning-700 border-warning-500`
- 错误提示：`bg-error-50 text-error-700 border-error-500`
- 信息提示：`bg-info-50 text-info-700 border-info-500`

### 2.5 渐变（Gradients）

```css
/* 主色渐变 - 用于 Hero 区域、重要按钮 */
--gradient-primary: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);

/* 辅助渐变 - 用于次要区域 */
--gradient-secondary: linear-gradient(135deg, #64748b 0%, #475569 100%);

/* 成功渐变 - 用于成功状态 */
--gradient-success: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);

/* 警告渐变 - 用于警告状态 */
--gradient-warning: linear-gradient(135deg, #eab308 0%, #ca8a04 100%);
```

**使用场景**：
- Hero 背景：`bg-gradient-to-r from-primary-500 to-primary-700`
- 重要按钮：`bg-gradient-to-r from-primary-600 to-primary-700`

---

## 三、字体规范

### 3.1 字体族

```css
/* 主字体 - 用于正文、标题 */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;

/* 等宽字体 - 用于代码、数字 */
--font-mono: 'Fira Code', 'Consolas', 'Monaco', 'Andale Mono', 'Ubuntu Mono', monospace;
```

### 3.2 字号系统

```css
/* 字号 - 基于 1.25 倍缩放比例 */
--text-xs:   0.75rem    /* 12px - 辅助文本、标签 */
--text-sm:   0.875rem   /* 14px - 次要文本、表单标签 */
--text-base: 1rem       /* 16px - 正文、按钮文本 */
--text-lg:   1.125rem   /* 18px - 小标题 */
--text-xl:   1.25rem    /* 20px - 卡片标题 */
--text-2xl:  1.5rem     /* 24px - 页面标题 */
--text-3xl:  1.875rem   /* 30px - 大标题 */
--text-4xl:  2.25rem    /* 36px - Hero 标题 */
--text-5xl:  3rem       /* 48px - 超大标题 */
```

**使用场景**：
- 辅助文本：`text-xs text-neutral-500`
- 表单标签：`text-sm text-neutral-700`
- 正文：`text-base text-neutral-700`
- 卡片标题：`text-xl font-semibold text-neutral-900`
- 页面标题：`text-2xl font-bold text-neutral-900`
- Hero 标题：`text-4xl font-bold text-neutral-900`

### 3.3 字重系统

```css
--font-normal:   400  /* 正文 */
--font-medium:   500  /* 强调文本 */
--font-semibold: 600  /* 标题、按钮 */
--font-bold:     700  /* 大标题 */
```

**使用场景**：
- 正文：`font-normal`
- 链接：`font-medium`
- 按钮：`font-semibold`
- 标题：`font-semibold` 或 `font-bold`

### 3.4 行高系统

```css
--leading-tight:  1.25  /* 标题 */
--leading-normal: 1.5   /* 正文 */
--leading-relaxed: 1.75 /* 长文本 */
```

**使用场景**：
- 标题：`leading-tight`
- 正文：`leading-normal`
- 长文本：`leading-relaxed`

---

## 四、间距系统

### 4.1 基础间距

```css
/* 间距 - 基于 4px 基准网格 */
--space-0:  0        /* 0px */
--space-1:  0.25rem  /* 4px */
--space-2:  0.5rem   /* 8px */
--space-3:  0.75rem  /* 12px */
--space-4:  1rem     /* 16px */
--space-5:  1.25rem  /* 20px */
--space-6:  1.5rem   /* 24px */
--space-8:  2rem     /* 32px */
--space-10: 2.5rem   /* 40px */
--space-12: 3rem     /* 48px */
--space-16: 4rem     /* 64px */
--space-20: 5rem     /* 80px */
--space-24: 6rem     /* 96px */
```

### 4.2 间距使用规范

**组件内边距**：
- 按钮：`px-4 py-2`（16px 水平，8px 垂直）
- 卡片：`p-6`（24px 四周）
- 输入框：`px-4 py-2`（16px 水平，8px 垂直）
- 模态框：`p-6`（24px 四周）

**组件间距**：
- 表单字段间距：`space-y-4`（16px 垂直）
- 卡片间距：`gap-6`（24px）
- 按钮组间距：`gap-4`（16px）
- 列表项间距：`space-y-2`（8px 垂直）

**页面间距**：
- 页面内边距：`px-4 sm:px-6 lg:px-8`
- 页面最大宽度：`max-w-7xl`（1280px）
- 区块间距：`space-y-12`（48px 垂直）

---

## 五、组件规范

### 5.1 按钮（Button）

**主要按钮**：
```jsx
<button className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-sm transition-colors">
  主要按钮
</button>
```

**次要按钮**：
```jsx
<button className="px-6 py-3 bg-white hover:bg-neutral-50 text-neutral-700 font-semibold rounded-lg border border-neutral-300 shadow-sm transition-colors">
  次要按钮
</button>
```

**文本按钮**：
```jsx
<button className="px-4 py-2 text-primary-600 hover:text-primary-700 font-medium transition-colors">
  文本按钮
</button>
```

**按钮尺寸**：
- 小按钮：`px-3 py-1.5 text-sm`
- 中按钮：`px-4 py-2 text-base`（默认）
- 大按钮：`px-6 py-3 text-lg`

**按钮状态**：
- 默认：`bg-primary-600`
- 悬停：`hover:bg-primary-700`
- 激活：`active:bg-primary-800`
- 禁用：`disabled:bg-neutral-300 disabled:cursor-not-allowed`

### 5.2 卡片（Card）

**基础卡片**：
```jsx
<div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
  卡片内容
</div>
```

**可交互卡片**：
```jsx
<div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 hover:shadow-md hover:border-primary-300 transition-all cursor-pointer">
  卡片内容
</div>
```

**卡片变体**：
- 无边框卡片：`shadow-md border-0`
- 彩色边框卡片：`border-l-4 border-l-primary-500`
- 渐变背景卡片：`bg-gradient-to-br from-primary-50 to-white`

### 5.3 表单（Form）

**输入框**：
```jsx
<input 
  type="text" 
  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
  placeholder="请输入..."
/>
```

**文本域**：
```jsx
<textarea 
  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-vertical"
  rows={4}
  placeholder="请输入..."
/>
```

**下拉框**：
```jsx
<select className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
  <option>选项 1</option>
  <option>选项 2</option>
</select>
```

**复选框**：
```jsx
<label className="flex items-center gap-2 cursor-pointer">
  <input type="checkbox" className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500" />
  <span className="text-neutral-700">选项文本</span>
</label>
```

**单选框**：
```jsx
<label className="flex items-center gap-2 cursor-pointer">
  <input type="radio" className="w-4 h-4 text-primary-600 border-neutral-300 focus:ring-primary-500" />
  <span className="text-neutral-700">选项文本</span>
</label>
```

**表单标签**：
```jsx
<label className="block text-sm font-medium text-neutral-700 mb-2">
  标签文本
</label>
```

**表单帮助文本**：
```jsx
<p className="mt-1 text-sm text-neutral-500">
  帮助文本
</p>
```

**表单错误文本**：
```jsx
<p className="mt-1 text-sm text-error-600">
  错误文本
</p>
```

### 5.4 导航（Navigation）

**顶部导航**：
```jsx
<nav className="bg-white border-b border-neutral-200">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex justify-between h-16">
      {/* Logo */}
      <div className="flex items-center">
        <a href="/" className="text-xl font-bold text-neutral-900">
          绝世百宝箱
        </a>
      </div>
      
      {/* 导航链接 */}
      <div className="hidden md:flex items-center gap-8">
        <a href="/tools" className="text-neutral-700 hover:text-primary-600 font-medium">
          工具
        </a>
        <a href="/resources" className="text-neutral-700 hover:text-primary-600 font-medium">
          资源
        </a>
      </div>
      
      {/* 用户菜单 */}
      <div className="flex items-center gap-4">
        <button className="text-neutral-700 hover:text-primary-600">
          登录
        </button>
      </div>
    </div>
  </div>
</nav>
```

**侧边导航**：
```jsx
<aside className="w-64 bg-white border-r border-neutral-200 min-h-screen">
  <nav className="p-4 space-y-2">
    <a href="/workspace" className="flex items-center gap-3 px-4 py-2 rounded-lg bg-primary-50 text-primary-700 font-medium">
      <span>工作台</span>
    </a>
    <a href="/tasks" className="flex items-center gap-3 px-4 py-2 rounded-lg text-neutral-700 hover:bg-neutral-100">
      <span>任务</span>
    </a>
  </nav>
</aside>
```

**底部导航**：
```jsx
<nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 md:hidden">
  <div className="flex justify-around py-2">
    <a href="/" className="flex flex-col items-center gap-1 px-4 py-2 text-primary-600">
      <HomeIcon className="w-6 h-6" />
      <span className="text-xs">首页</span>
    </a>
    <a href="/tools" className="flex flex-col items-center gap-1 px-4 py-2 text-neutral-500">
      <ToolsIcon className="w-6 h-6" />
      <span className="text-xs">工具</span>
    </a>
  </div>
</nav>
```

### 5.5 提示（Alert）

**成功提示**：
```jsx
<div className="bg-success-50 border border-success-500 text-success-700 px-4 py-3 rounded-lg">
  <div className="flex items-start gap-3">
    <CheckCircleIcon className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" />
    <div>
      <p className="font-medium">操作成功</p>
      <p className="text-sm mt-1">详细描述信息</p>
    </div>
  </div>
</div>
```

**警告提示**：
```jsx
<div className="bg-warning-50 border border-warning-500 text-warning-700 px-4 py-3 rounded-lg">
  <div className="flex items-start gap-3">
    <AlertIcon className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5" />
    <div>
      <p className="font-medium">警告信息</p>
      <p className="text-sm mt-1">详细描述信息</p>
    </div>
  </div>
</div>
```

**错误提示**：
```jsx
<div className="bg-error-50 border border-error-500 text-error-700 px-4 py-3 rounded-lg">
  <div className="flex items-start gap-3">
    <XCircleIcon className="w-5 h-5 text-error-600 flex-shrink-0 mt-0.5" />
    <div>
      <p className="font-medium">错误信息</p>
      <p className="text-sm mt-1">详细描述信息</p>
    </div>
  </div>
</div>
```

**信息提示**：
```jsx
<div className="bg-info-50 border border-info-500 text-info-700 px-4 py-3 rounded-lg">
  <div className="flex items-start gap-3">
    <InfoIcon className="w-5 h-5 text-info-600 flex-shrink-0 mt-0.5" />
    <div>
      <p className="font-medium">提示信息</p>
      <p className="text-sm mt-1">详细描述信息</p>
    </div>
  </div>
</div>
```

### 5.6 标签（Badge）

**基础标签**：
```jsx
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700">
  标签文本
</span>
```

**标签变体**：
- 成功标签：`bg-success-100 text-success-700`
- 警告标签：`bg-warning-100 text-warning-700`
- 错误标签：`bg-error-100 text-error-700`
- 中性标签：`bg-neutral-100 text-neutral-700`

### 5.7 加载（Loading）

**加载旋转器**：
```jsx
<div className="flex items-center justify-center">
  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
</div>
```

**加载文本**：
```jsx
<div className="flex items-center gap-2 text-neutral-500">
  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
  <span>加载中...</span>
</div>
```

**骨架屏**：
```jsx
<div className="animate-pulse space-y-3">
  <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
  <div className="h-4 bg-neutral-200 rounded"></div>
  <div className="h-4 bg-neutral-200 rounded w-5/6"></div>
</div>
```

---

## 六、动效规范

### 6.1 过渡时间

```css
--transition-fast: 150ms    /* 快速过渡 - 用于悬停效果 */
--transition-normal: 200ms  /* 标准过渡 - 用于大多数场景 */
--transition-slow: 300ms    /* 慢速过渡 - 用于复杂动画 */
```

### 6.2 缓动函数

```css
--ease-in: cubic-bezier(0.4, 0, 1, 1)      /* 加速 */
--ease-out: cubic-bezier(0, 0, 0.2, 1)     /* 减速 */
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1) /* 加速减速 */
```

### 6.3 常用动效

**按钮悬停**：
```jsx
className="transition-colors duration-200"
```

**卡片悬停**：
```jsx
className="transition-all duration-200 hover:shadow-md hover:-translate-y-1"
```

**淡入效果**：
```jsx
className="animate-fade-in"
```

**滑入效果**：
```jsx
className="animate-slide-in"
```

---

## 七、响应式断点

### 7.1 断点定义

```css
--breakpoint-sm: 640px   /* 小屏幕 - 平板竖屏 */
--breakpoint-md: 768px   /* 中等屏幕 - 平板横屏 */
--breakpoint-lg: 1024px  /* 大屏幕 - 笔记本 */
--breakpoint-xl: 1280px  /* 超大屏幕 - 桌面 */
--breakpoint-2xl: 1536px /* 超超大屏幕 - 大桌面 */
```

### 7.2 响应式使用

**移动端优先**：
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* 内容 */}
</div>
```

**隐藏/显示**：
```jsx
{/* 移动端显示，桌面端隐藏 */}
<div className="md:hidden">移动端内容</div>

{/* 移动端隐藏，桌面端显示 */}
<div className="hidden md:block">桌面端内容</div>
```

---

## 八、图标规范

### 8.1 图标库

使用 **lucide-react** 图标库

### 8.2 图标尺寸

```jsx
{/* 小图标 - 用于按钮、标签 */}
<Icon className="w-4 h-4" />

{/* 中图标 - 用于导航、列表 */}
<Icon className="w-5 h-5" />

{/* 大图标 - 用于 Hero、空状态 */}
<Icon className="w-6 h-6" />

{/* 超大图标 - 用于特殊场景 */}
<Icon className="w-8 h-8" />
```

### 8.3 图标颜色

```jsx
{/* 主色图标 */}
<Icon className="w-5 h-5 text-primary-600" />

{/* 中性图标 */}
<Icon className="w-5 h-5 text-neutral-500" />

{/* 成功图标 */}
<Icon className="w-5 h-5 text-success-600" />

{/* 警告图标 */}
<Icon className="w-5 h-5 text-warning-600" />

{/* 错误图标 */}
<Icon className="w-5 h-5 text-error-600" />
```

---

## 九、阴影规范

### 9.1 阴影层级

```css
/* 无阴影 - 用于平面元素 */
--shadow-none: none;

/* 小阴影 - 用于卡片、按钮 */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);

/* 中阴影 - 用于悬停状态 */
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);

/* 大阴影 - 用于模态框、下拉菜单 */
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);

/* 超大阴影 - 用于特殊场景 */
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
```

### 9.2 阴影使用

**卡片默认**：`shadow-sm`
**卡片悬停**：`hover:shadow-md`
**模态框**：`shadow-lg`
**下拉菜单**：`shadow-lg`

---

## 十、圆角规范

### 10.1 圆角尺寸

```css
--radius-none: 0         /* 无圆角 */
--radius-sm: 0.125rem    /* 2px - 小元素 */
--radius: 0.25rem        /* 4px - 按钮、输入框 */
--radius-md: 0.375rem    /* 6px - 卡片 */
--radius-lg: 0.5rem      /* 8px - 大卡片 */
--radius-xl: 0.75rem     /* 12px - 超大卡片 */
--radius-2xl: 1rem       /* 16px - 特殊场景 */
--radius-full: 9999px    /* 全圆 - 徽章、头像 */
```

### 10.2 圆角使用

**按钮**：`rounded-lg`（8px）
**输入框**：`rounded-lg`（8px）
**卡片**：`rounded-lg`（8px）或 `rounded-xl`（12px）
**徽章**：`rounded-full`（全圆）
**头像**：`rounded-full`（全圆）

---

## 十一、最佳实践

### 11.1 可访问性

- 所有交互元素必须有清晰的焦点状态
- 文本与背景对比度至少 4.5:1
- 所有图片必须有 alt 文本
- 表单必须有 label 关联
- 使用语义化 HTML 标签

### 11.2 性能优化

- 图片使用 WebP 格式
- 使用懒加载（lazy loading）
- 避免不必要的重渲染
- 使用 CSS 过渡而非 JavaScript 动画
- 优化字体加载

### 11.3 代码规范

- 使用 Tailwind CSS 类名
- 遵循组件化开发
- 保持代码简洁
- 添加必要的注释
- 使用 TypeScript 类型检查

---

## 十二、参考资源

### 12.1 设计参考

- [Tailwind CSS](https://tailwindcss.com/)
- [Ant Design](https://ant.design/)
- [Material Design](https://material.io/)
- [Shadcn/ui](https://ui.shadcn.com/)

### 12.2 工具

- [Tailwind Play](https://play.tailwindcss.com/) - 在线测试 Tailwind
- [Figma](https://www.figma.com/) - 设计工具
- [Lucide Icons](https://lucide.dev/) - 图标库

---

## 十三、更新日志

### v1.0 (2026-07-06)
- 初始版本
- 定义颜色系统
- 定义字体规范
- 定义间距系统
- 定义组件规范
- 定义动效规范
- 定义响应式断点

---

**文档版本**: v1.0  
**最后更新**: 2026-07-06  
**状态**: 待用户审阅
