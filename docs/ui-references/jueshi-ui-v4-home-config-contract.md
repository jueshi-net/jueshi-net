# 首页配置化对接文档

**版本：** v1.0  
**日期：** 2026-07-05  
**状态：** UI Lab 阶段配置结构预留

---

## 一、概述

本文档说明 V4 首页候选版的配置化结构，用于未来替换真实首页时对接后台配置中心或广告管理系统。

**核心原则：**
1. 所有按钮文案、链接、图标必须通过配置对象渲染，不允许硬编码在 JSX 中
2. 广告位必须通过配置控制开启/隐藏/排序
3. 默认素材（头像、底部 Tab 中心按钮）必须通过配置引用
4. UI Lab 阶段使用 mock 配置，但字段结构必须与未来后台系统可映射

**现有系统对齐：**
- `src/types/homepage.ts` - 已有 HomepageConfig 类型定义
- `src/components/ads/AdSlot.tsx` - 已有广告渲染组件，使用 `placement` 字段
- `/api/ads/dispatch` - 已有广告分发 API

---

## 二、配置文件位置

**V4 配置文件：**
```
src/components/ui-lab/jueshi-v4-home-candidate-v4/homepageConfig.ts
```

**配置结构：**
```typescript
interface V4HomepageConfig {
  buttons: HomepageButtonConfig;  // 所有按钮配置
  ads: HomepageAdConfig;          // 广告组配置
}
```

---

## 三、按钮配置说明

### 3.1 按钮字段定义

```typescript
interface ButtonConfig {
  key: string;              // 唯一标识
  label: string;            // 按钮文案
  href: string;             // 链接地址
  enabled: boolean;         // 是否启用
  variant: 'primary' | 'secondary' | 'ghost' | 'link';  // 样式变体
  icon?: string;            // 图标名称（lucide-react）
  external: boolean;        // 是否外部链接
  sortOrder: number;        // 排序权重
  trackingKey: string;      // 追踪标识
}
```

### 3.2 已配置化的按钮

| 区域 | 配置键 | 说明 |
|------|--------|------|
| Header 导航 | `headerNav` | 7 个导航项（首页/工具/清单/指南/资源/专题/社区） |
| Header 搜索 | `headerSearchPlaceholder` | 搜索框 placeholder |
| Header 签到 | `headerCheckinButton` | 签到按钮 |
| Header 登录 | `headerLoginButton` | 登录按钮 |
| Header 通知 | `headerNotificationButton` | 通知按钮 |
| Header 菜单 | `headerMenuButton` | 移动端菜单按钮 |
| Hero 主 CTA | `heroPrimaryCta` | "浏览全部工具" |
| Hero 次 CTA | `heroSecondaryCta` | "查看清单指南" |
| Hero 工具箱 | `heroToolboxButtons` | 6 个快捷工具按钮 |
| 工作台签到 | `workbenchCheckinButton` | "签到" |
| 工作台查看 | `workbenchViewButton` | "查看工作台" |
| 工具卡 CTA | `toolCardCta` | "立即使用" |
| 任务链主 CTA | `taskChainPrimaryCta` | "开始任务" |
| 任务链次 CTA | `taskChainSecondaryCta` | "查看详情" |
| 社区进入 | `communityEnterButton` | "进入社区" |
| 社区查看更多 | `communityViewMoreButton` | "查看更多" |
| Footer 登录 | `footerLoginButton` | "立即登录" |
| Footer 浏览 | `footerBrowseButton` | "浏览工具" |
| 移动端底部 Tab | `mobileTabs` | 5 个 Tab（首页/工具/百宝箱/清单/我的） |

### 3.3 导航配置示例

```typescript
{
  key: 'nav_home',
  label: '首页',
  href: '/',
  enabled: true,
  external: false,
  sortOrder: 10,
  trackingKey: 'header_nav_home',
  priority: 'core'  // core 在 lg 显示，extended 在 2xl 显示
}
```

### 3.4 移动端底部 Tab 配置

```typescript
interface MobileTabConfig {
  key: string;
  label: string;
  href: string;
  icon?: string;           // lucide-react 图标名
  activeIcon?: string;     // 激活状态图标
  imageUrl?: string;       // 自定义图片（用于中心品牌按钮）
  isCenterAction: boolean; // 是否为中心品牌按钮
  enabled: boolean;
  sortOrder: number;
  trackingKey: string;
}
```

**中心品牌按钮配置：**
```typescript
{
  key: 'mobile_tab_center',
  label: '百宝箱',
  href: '/',
  imageUrl: '/images/brand/jueshi-mobile-tab-center.png',
  isCenterAction: true,
  enabled: true,
  sortOrder: 30,
  trackingKey: 'mobile_tab_center_home'
}
```

---

## 四、默认素材配置

### 4.1 素材字段定义

```typescript
interface DefaultAssetsConfig {
  defaultAvatar: string;           // 默认头像路径
  mobileTabCenterImage: string;    // 移动端底部 Tab 中心按钮图片
  brandLogo: string;               // 品牌 Logo
  brandCrabMark?: string;          // 品牌小螃蟹图标（可选）
}
```

### 4.2 默认值

```typescript
{
  defaultAvatar: '/images/brand/default-avatar-crab.jpg',
  mobileTabCenterImage: '/images/brand/jueshi-mobile-tab-center.png',
  brandLogo: '/images/brand/jueshi-logo-crab.jpg',
  brandCrabMark: '/images/brand/jueshi-crab-mark.png'
}
```

### 4.3 素材文件要求

| 素材 | 路径 | 说明 |
|------|------|------|
| 默认头像 | `/public/images/brand/default-avatar-crab.jpg` | 小螃蟹头像，用于未登录用户 |
| 底部 Tab 中心按钮 | `/public/images/brand/jueshi-mobile-tab-center.png` | 小螃蟹图标，用于移动端底部 Tab 中心 |
| 品牌 Logo | `/public/images/brand/jueshi-logo-crab.jpg` | 横版 Logo，用于 Header 和 Footer |
| 品牌小螃蟹 | `/public/images/brand/jueshi-crab-mark.png` | 方形小螃蟹图标（可选） |

**注意：** 用户需要上传素材文件到上述路径。配置中引用这些路径，组件通过配置读取。

---

## 五、广告配置说明

### 5.1 三层结构

广告系统采用三层结构，对齐现有后台广告管理系统：

1. **AdGroup（广告组）** - 一组广告位的集合
2. **AdSlot（广告位）** - 具体的广告位置
3. **AdCreative（广告内容）** - 实际展示的广告素材

### 5.2 广告组字段

```typescript
interface AdGroupConfig {
  groupKey: string;              // 广告组唯一标识
  title: string;                 // 广告组标题
  description?: string;          // 广告组描述
  position: string;              // 位置标识
  enabled: boolean;              // 是否启用
  showLabel: boolean;            // 是否显示"推广"标签
  maxTextRows: number;           // 文字广告最大行数
  textColumns: number;           // 文字广告列数
  imageColumns: number;          // 图片广告列数
  mobileMode: 'full' | 'compact' | 'hidden';  // 移动端展示模式
  sortOrder: number;             // 排序权重
  slots: AdSlotConfig[];         // 广告位列表
}
```

### 5.3 广告位字段

```typescript
interface AdSlotConfig {
  slotKey: string;               // 广告位唯一标识
  placement: string;             // 对齐现有 AdSlot 的 placement
  enabled: boolean;              // 是否启用
  fallbackMode: 'hide' | 'fallback' | 'placeholder';  // 无广告时的处理
  sortOrder: number;             // 排序权重
}
```

### 5.4 已配置的广告组

| groupKey | 位置 | 文字广告 | 图片广告 | placement 前缀 |
|----------|------|----------|----------|----------------|
| home_after_hero_ad_group | Hero 下方 | 10 | 4 | AD_HOME_AFTER_HERO_* |
| home_after_tools_ad_group | 工具区后 | 15 | 5 | AD_HOME_AFTER_TOOLS_* |
| home_after_task_chain_ad_group | 任务链后 | 15 | 5 | AD_HOME_AFTER_TASK_CHAIN_* |
| home_community_ad_group | 社区模块 | 8 | 4 | AD_HOME_COMMUNITY_* |
| home_before_footer_ad_group | Footer 前 | 24 | 6 | AD_HOME_BEFORE_FOOTER_* |

### 5.5 Placement 命名规范

对齐现有 `AdSlot` 组件的 `placement` 字段：

```
AD_HOME_AFTER_HERO_TEXT
AD_HOME_AFTER_HERO_IMAGE
AD_HOME_AFTER_TOOLS_TEXT
AD_HOME_AFTER_TOOLS_IMAGE
AD_HOME_AFTER_TASK_CHAIN_TEXT
AD_HOME_AFTER_TASK_CHAIN_IMAGE
AD_HOME_COMMUNITY_TEXT
AD_HOME_COMMUNITY_IMAGE
AD_HOME_BEFORE_FOOTER_TEXT
AD_HOME_BEFORE_FOOTER_IMAGE
```

### 5.6 与现有系统对接

**现有广告系统：**
- 组件：`src/components/ads/AdSlot.tsx`
- API：`/api/ads/dispatch?placement=XXX`
- 点击追踪：`/api/ads/[id]/click`

**对接方案：**
1. UI Lab 阶段使用 mock 数据模拟广告内容
2. 未来替换真实首页时，将 `placement` 字段传给现有 `AdSlot` 组件
3. 后台广告管理系统通过 `placement` 管理广告内容
4. 组件不直接渲染广告内容，而是通过 `placement` 从 API 获取

**示例代码（未来真实首页）：**
```typescript
import { AdSlot } from '@/components/ads/AdSlot';

// 从配置读取 placement
const placement = adConfig.slots[0].placement; // 'AD_HOME_AFTER_HERO_TEXT'

// 使用现有 AdSlot 组件渲染
<AdSlot placement={placement} />
```

---

## 六、开启/隐藏机制

### 6.1 按钮级别

```typescript
// 配置中设置 enabled: false
{
  key: 'hero_primary_cta',
  label: '浏览全部工具',
  href: '/tools',
  enabled: false,  // 隐藏此按钮
  ...
}
```

**组件处理：**
```typescript
if (!config.heroPrimaryCta.enabled) return null;
```

### 6.2 广告组级别

```typescript
// 配置中设置 enabled: false
{
  groupKey: 'home_after_hero_ad_group',
  enabled: false,  // 隐藏整个广告组
  ...
}
```

**组件处理：**
```typescript
if (!adGroup.enabled) return null;
```

### 6.3 广告位级别

```typescript
// 配置中设置 enabled: false
{
  slotKey: 'home_after_hero_text',
  enabled: false,  // 隐藏此广告位
  ...
}
```

**组件处理：**
```typescript
const enabledSlots = adGroup.slots.filter(slot => slot.enabled);
```

### 6.4 空广告组折叠

如果广告组内所有广告位都 disabled，或 API 返回无广告，则整个广告组不渲染，不留空白。

---

## 七、替换 Production 首页前的检查清单

### 7.1 配置来源确认

- [ ] 确认后台配置中心已部署
- [ ] 确认 API 端点可用（`/api/ads/dispatch`）
- [ ] 确认广告素材已上传到后台
- [ ] 确认默认素材已上传到 `/public/images/brand/`

### 7.2 按钮配置确认

- [ ] Header 导航按钮已从配置读取
- [ ] Hero CTA 按钮已从配置读取
- [ ] 工具卡 CTA 已从配置读取
- [ ] 任务链 CTA 已从配置读取
- [ ] 社区 CTA 已从配置读取
- [ ] Footer CTA 已从配置读取
- [ ] 移动端底部 Tab 已从配置读取

### 7.3 广告配置确认

- [ ] 广告组可通过 `enabled` 开关隐藏
- [ ] 广告位可通过 `enabled` 开关隐藏
- [ ] 空广告组自动折叠，不留空白
- [ ] 所有广告显示"推广"或"广告"标识
- [ ] 广告链接添加 `rel="nofollow sponsored"`

### 7.4 素材配置确认

- [ ] 默认头像已从配置读取
- [ ] 移动端底部 Tab 中心按钮图片已从配置读取
- [ ] 品牌 Logo 已从配置读取

### 7.5 硬编码检查

- [ ] 确认没有散落的硬编码按钮文案
- [ ] 确认没有散落的硬编码链接
- [ ] 确认没有散落的硬编码图片路径
- [ ] 所有可配置项都从 `homepageConfig.ts` 读取

---

## 八、未来后台广告管理系统对接

### 8.1 对接方式

**方案 A：直接使用现有 AdSlot 组件**
- 优点：无需修改后端，直接对接
- 缺点：需要后台配置 `placement` 对应的广告内容

**方案 B：扩展后台配置中心**
- 优点：更灵活的配置能力
- 缺点：需要开发后台配置界面

**推荐方案 A**，因为项目已有完整的广告管理系统。

### 8.2 后台管理字段映射

| 前端配置字段 | 后台管理字段 | 说明 |
|-------------|-------------|------|
| `groupKey` | `ad_group.key` | 广告组标识 |
| `groupKey.enabled` | `ad_group.status` | 广告组状态 |
| `slotKey` | `ad_slot.key` | 广告位标识 |
| `placement` | `ad_slot.placement` | 广告位位置 |
| `slotKey.enabled` | `ad_slot.status` | 广告位状态 |
| - | `ad_creative.*` | 广告内容（标题/图片/链接等） |

### 8.3 后台操作流程

1. 后台创建广告组（对应 `groupKey`）
2. 后台创建广告位（对应 `placement`）
3. 后台上传广告素材（对应 `AdCreative`）
4. 后台设置广告位状态（enabled/disabled）
5. 前端通过 `placement` 从 API 获取广告
6. 前端渲染广告

---

## 九、当前状态

**UI Lab 阶段：**
- ✅ 配置文件已创建（`homepageConfig.ts`）
- ✅ 所有按钮配置化
- ✅ 广告组配置化
- ✅ 默认素材路径已配置
- ⏳ 用户需要上传素材文件
- ⏳ 组件需要重构为消费配置

**未来替换真实首页时：**
- ⏳ 对接后台配置中心或广告管理系统
- ⏳ 替换 mock 数据为 API 数据
- ⏳ 验证所有配置项生效

---

## 十、总结

**已完成的配置化工作：**
1. ✅ 所有按钮文案、链接、图标通过配置对象渲染
2. ✅ 广告位通过配置控制开启/隐藏/排序
3. ✅ 默认素材通过配置引用
4. ✅ 对齐现有广告管理系统（AdSlot + placement）
5. ✅ 提供完整的对接文档

**待完成的工作：**
1. ⏳ 用户上传默认素材文件
2. ⏳ 组件重构为消费配置
3. ⏳ 未来对接后台配置中心

**严禁事项：**
- ❌ 不允许把按钮文案硬编码在 JSX 中
- ❌ 不允许把广告内容硬编码在组件中
- ❌ 不允许把默认素材路径散落在多个组件中
- ❌ 不允许广告位只能通过改代码上下架

**允许事项：**
- ✅ UI Lab 阶段使用 mock 配置
- ✅ 配置字段与未来后台系统可映射
- ✅ 所有可配置项从配置文件读取
