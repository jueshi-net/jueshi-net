# 广告库存系统 (Ad Inventory System) — UI v4 设计文档

> **版本:** v1.0  
> **状态:** UI-only 实现，无后端/数据库变更  
> **目的:** 为未来广告管理系统集成预留接口规范

---

## 1. 概述 (Overview)

本文档描述的是 **纯 UI 层** 的广告库存系统设计。当前阶段：

- ✅ 定义广告位 (Ad Slot) 的布局、命名、字段规范
- ✅ 定义广告组 (Ad Group) 的管理能力
- ✅ 为未来后端广告管理系统提供对接接口
- ❌ **不涉及真实广告内容**
- ❌ **不涉及后端 API 或数据库变更**
- ❌ **不涉及真实广告主或投放逻辑**

所有广告位当前以 Mock 数据展示，后续后端就绪后只需替换数据源即可无缝切换。

---

## 2. 广告组 (Ad Group) 列表

每个广告组由唯一的 `groupKey` 标识，定义了广告在页面中的位置及容量。

| groupKey | 位置 | 文字广告容量 | 图片广告容量 |
|----------|------|-------------|-------------|
| `home_after_hero_ad_group` | Hero 下方 | 2 行 × 5 列 = 10 个 | 1 行 × 4 个 = 4 个 |
| `home_after_tools_ad_group` | 工具区后 | 4 行 × 5 列 = 20 个 | 1 行 × 5 个 = 5 个 |
| `home_after_task_chain_ad_group` | 任务链后 | 4 行 × 5 列 = 20 个 | 1 行 × 5 个 = 5 个 |
| `home_community_ad_group` | 社区模块 | 2 行 × 4 列 = 8 个 | 1 行 × 4 个 = 4 个 |
| `home_before_footer_ad_group` | Footer 前 | 5 行 × 6 列 = 30 个 | 1 行 × 6 个 = 6 个 |

### 说明

- **文字广告 (Text Ad):** 以网格形式排列，每个广告占一个单元格
- **图片广告 (Image Ad):** 以横向排列形式展示，每个广告占一个位置
- 容量为最大展示数量，实际展示数量由 `enabled` 状态和 `sortOrder` 决定

---

## 3. SlotKey 命名规范 (Naming Convention)

每个广告位由唯一的 `slotKey` 标识，命名规则如下：

### 文字广告 (Text Ad)

```
{groupKey_prefix}_text_{NN}
```

- `groupKey_prefix`: 从 groupKey 中去掉 `_ad_group` 后缀
- `NN`: 两位数字序号，从 `01` 开始

**示例：**
- `home_after_hero_text_01`
- `home_after_hero_text_02`
- `home_after_tools_text_01`
- `home_before_footer_text_01`

### 图片广告 (Image Ad)

```
{groupKey_prefix}_image_{NN}
```

**示例：**
- `home_after_hero_image_01`
- `home_after_hero_image_02`
- `home_after_tools_image_01`
- `home_before_footer_image_01`

### groupKey_prefix 对照表

| groupKey | groupKey_prefix |
|----------|----------------|
| `home_after_hero_ad_group` | `home_after_hero` |
| `home_after_tools_ad_group` | `home_after_tools` |
| `home_after_task_chain_ad_group` | `home_after_task_chain` |
| `home_community_ad_group` | `home_community` |
| `home_before_footer_ad_group` | `home_before_footer` |

---

## 4. 广告项字段定义 (Ad Item Fields)

每个广告项 (Ad Item) 包含以下字段，供未来后端管理系统使用：

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `slotKey` | `string` | ✅ | 广告位唯一标识，遵循命名规范 |
| `type` | `'text' \| 'image'` | ✅ | 广告类型：文字或图片 |
| `enabled` | `boolean` | ✅ | 是否启用该广告 |
| `title` | `string` | ✅ | 广告标题 |
| `subtitle` | `string` | ❌ | 广告副标题 |
| `description` | `string` | ❌ | 广告描述文字 |
| `imageUrl` | `string` | ❌ | 图片广告的图片 URL |
| `href` | `string` | ✅ | 点击跳转链接 |
| `ctaText` | `string` | ❌ | 行动号召按钮文字 (如"立即了解"、"查看详情") |
| `tag` | `string` | ❌ | 标签 (如"热门"、"限时"、"新品") |
| `advertiserName` | `string` | ❌ | 广告主名称 |
| `startAt` | `datetime` | ❌ | 投放开始时间 |
| `endAt` | `datetime` | ❌ | 投放结束时间 |
| `sortOrder` | `number` | ✅ | 排序权重，数值越小越靠前 |
| `displayDevices` | `string[]` | ❌ | 目标设备：`['desktop', 'mobile', 'tablet']` |
| `nofollow` | `boolean` | ✅ | 是否添加 `rel="nofollow"` 属性 |
| `sponsored` | `boolean` | ✅ | 是否添加 `rel="sponsored"` 属性 |
| `trackingKey` | `string` | ❌ | 追踪标识，用于数据分析 |

---

## 5. 管理能力 (Management Capabilities)

### 5.1 单条广告控制

- **`enabled: true/false`** — 控制单个广告项的显示/隐藏
- 禁用的广告不渲染、不占位、不消耗布局空间

### 5.2 广告组级别控制

- 每个 `groupKey` 支持组级别的 `enabled` 开关
- 组级别禁用时，该组内所有广告均不显示
- 组级别禁用优先级高于单条广告的 `enabled` 状态

### 5.3 排序管理

- **`sortOrder`** — 控制广告在组内的展示顺序
- 数值越小，展示位置越靠前
- 支持动态调整，无需修改代码

### 5.4 时间调度

- **`startAt`** — 广告投放开始时间
- **`endAt`** — 广告投放结束时间
- 未到 `startAt` 或已过 `endAt` 的广告自动隐藏
- 支持定时上下线，无需人工干预

### 5.5 设备定向

- **`displayDevices`** — 指定广告在哪些设备上展示
- 可选值：`'desktop'`、`'mobile'`、`'tablet'`
- 未设置时默认在所有设备上展示
- 支持按设备类型差异化投放

### 5.6 SEO 合规

- **`nofollow: true`** — 为链接添加 `rel="nofollow"`，防止权重传递
- **`sponsored: true`** — 为链接添加 `rel="sponsored"`，标识付费链接
- 建议所有广告链接同时设置 `nofollow` 和 `sponsored`
- 符合 Google、Bing 等搜索引擎的付费链接规范

---

## 6. 视觉规范 (Visual Rules)

### 6.1 广告标识

- **必须** 在广告项上显示 **"广告"** 或 **"推广"** 标签
- 标签样式：小字号、浅色背景、与广告内容有明显视觉区分
- 标签位置：广告卡片右上角或左上角

### 6.2 内容区分

- ❌ 广告 **不得** 伪装为常规内容
- ❌ 广告 **不得** 与正常功能入口在视觉上无法区分
- ✅ 广告必须有明确的视觉边界或标识

### 6.3 交互限制

- ❌ **禁止弹窗广告 (Popup Ads)**
- ❌ **禁止浮动覆盖广告 (Floating Overlay Ads)**
- ❌ **禁止首屏干扰性广告 (First-screen Disruptive Ads)**
- ✅ 广告必须以内嵌方式融入页面布局
- ✅ 用户滚动页面时广告自然跟随，不遮挡内容

---

## 7. 空广告处理 (Empty Ad Handling)

### 7.1 组级折叠

- 当某个广告组内 **所有广告均被禁用** 时，整个广告组自动折叠
- 折叠后 **不保留任何空白空间**
- 页面布局自动填充，无视觉断裂

### 7.2 实现原则

- 广告组容器使用条件渲染：有启用的广告时才渲染容器
- 不使用 `visibility: hidden` 或 `opacity: 0` 隐藏空组
- 使用 `display: none` 或直接不渲染 DOM 节点

### 7.3 布局影响

- 广告组折叠后，上下相邻模块直接衔接
- 不产生额外的 margin/padding 空白
- 移动端和桌面端行为一致

---

## 8. 移动端适配规则 (Mobile Rules)

### 8.1 文字广告 (Text Ads)

- 列数：**1-2 列**（根据屏幕宽度自适应）
- 小屏手机 (≤375px)：1 列
- 标准手机 (376px-428px)：2 列
- 每个广告卡片宽度自适应，保持可读性

### 8.2 图片广告 (Image Ads)

- 展示方式：**横向滚动 (Horizontal Scroll)** 或 **单列展示**
- 横向滚动：固定卡片宽度，超出屏幕宽度时可左右滑动
- 单列展示：每张图占满一行宽度，垂直排列
- 图片保持原始宽高比，不变形

### 8.3 默认展示数量

- 移动端默认展示数量 **少于桌面端**
- 文字广告：默认展示前 4-6 个（桌面端为全部）
- 图片广告：默认展示前 2-3 个（桌面端为全部）
- 可通过"查看更多"展开剩余广告

### 8.4 底部 Tab 保护

- ❌ 广告 **不得** 遮挡底部导航 Tab
- ❌ 广告 **不得** 与底部 Tab 产生视觉重叠
- ✅ 页面底部必须保留足够的 padding，确保 Tab 始终可见
- ✅ 最后一条广告与底部 Tab 之间至少保持 16px 间距

---

## 9. 后端集成指南 (Backend Integration Guide)

### 9.1 数据源切换

当前阶段使用前端 Mock 数据，后端就绪后：

1. 创建广告管理 API（CRUD 接口）
2. 前端替换 Mock 数据源为 API 调用
3. 保持 `slotKey`、`groupKey` 命名规范不变
4. 保持字段结构一致

### 9.2 建议 API 端点

```
GET    /api/ads/groups              — 获取所有广告组
GET    /api/ads/groups/:groupKey    — 获取指定广告组及其广告项
GET    /api/ads/slots/:slotKey      — 获取指定广告位
POST   /api/ads                     — 创建广告项
PUT    /api/ads/:id                 — 更新广告项
DELETE /api/ads/:id                 — 删除广告项
PATCH  /api/ads/:id/toggle          — 切换广告启用状态
```

### 9.3 缓存策略

- 广告数据建议设置 5-15 分钟缓存
- 支持手动刷新缓存（管理后台操作后触发）
- 客户端可使用 `stale-while-revalidate` 策略

---

## 10. 附录：SlotKey 完整列表 (示例)

### home_after_hero_ad_group

| slotKey | type |
|---------|------|
| `home_after_hero_text_01` | text |
| `home_after_hero_text_02` | text |
| ... | ... |
| `home_after_hero_text_10` | text |
| `home_after_hero_image_01` | image |
| `home_after_hero_image_02` | image |
| `home_after_hero_image_03` | image |
| `home_after_hero_image_04` | image |

### home_after_tools_ad_group

| slotKey | type |
|---------|------|
| `home_after_tools_text_01` | text |
| ... | ... |
| `home_after_tools_text_20` | text |
| `home_after_tools_image_01` | image |
| ... | ... |
| `home_after_tools_image_05` | image |

> 其他广告组以此类推，完整列表可根据容量表推算。

---

## 变更记录

| 日期 | 版本 | 变更内容 |
|------|------|---------|
| 2026-07-05 | v1.0 | 初始版本，定义广告库存系统 UI 规范 |
