# 首页外网新手资源模块 + 广告位商业化规划

> 版本: v1.0 post-deploy plan
> 日期: 2026-05-10
> 状态: 待确认

---

## 第一部分：YouTube 播放列表调研（仅作为选题研究）

### 播放列表元数据

- **来源**: YouTube 公开播放列表
- **标题**: 翻墙后可以做什么系列
- **视频总数**: 14 个（12 个有效，1 个已删除，1 个私有）
- **用途**: 仅用于理解"刚能访问外网"用户的信息需求，**不作为前台内容展示**

### 视频分类统计（仅内部研究）

| 分类 | 数量 | 示例标题关键词 |
|------|------|---------------|
| 软件推荐 | 2 | "必装软件", "好用APP" |
| 能做什么 | 1 | "翻墙后可以做什么" |
| 安全隐私 | 5 | "被抓", "监控", "安全" |
| 频道推荐 | 3 | "建政频道", "YouTube频道" |
| 金融/交易 | 1 | "比特币", "国外交易" |
| 网络文化 | 1 | "黑话", "小粉红" |

### 从播放列表提炼的新手需求洞察

基于播放列表标题反映的用户搜索意图，可以识别出以下刚需（与本站定位吻合的部分）：

1. **"刚出来不知道用什么软件"** → 对应我们的"常用软件/工具整理"
2. **"担心账号安全问题"** → 对应"账号安全与隐私保护"
3. **"不知道怎么进行跨境交易"** → 对应"海外支付/金融工具"
4. **"不知道外网有什么好用的资源"** → 对应"海外生活常用网站"
5. **"想了解海外信息渠道"** → 对应"AI 工具/视频平台"

### 引用原则

- ❌ 不搬运视频内容
- ❌ 不嵌入该播放列表
- ❌ 不做频道导流
- ✅ 仅作为选题研究来源
- ✅ 后期如有价值，将用 AI 重写脚本，制作我们自己的原创内容

---

## 第二部分：首页新增模块设计

### 模块名称
**刚能访问外网？先看这个**

### 副标题
常用软件、学习资源、AI 工具、视频平台、信息渠道，一次整理清楚。

### 位置
放在 **热门导航**（Featured Links）之后、**最新指南**（Latest Articles）之前。

即：
1. Hero（场景入口）
2. Stats 统计
3. 热门工具（Quick Access）
4. 核心工具箱（Core Tools）
5. 热门导航（Featured Links）
6. ⬅️ **新增：刚能访问外网？先看这个**
7. 最新指南（Latest Articles）
8. CTA / Footer

### 首页卡片规划（6-8 个）

| # | 卡片标题 | 图标 | 一句话说明 | 跳转 | 标签 | 优先级 |
|---|---------|------|----------|------|------|--------|
| 1 | 外网新手必装软件 | 🛠️ | 浏览器、密码管理、翻译等基础工具合集 | /resources/starter | 新手必看 | 必做 |
| 2 | 常用 AI 工具 | 🤖 | ChatGPT、Claude、Midjourney 等主流 AI 平台 | /resources/ai-tools | 工具合集 | 必做 |
| 3 | 视频与学习平台 | 🎬 | YouTube、Coursera、Khan Academy 等 | /resources/video-learning | 教程 | 必做 |
| 4 | 海外华人常用网站 | 🌐 | 银行、购物、社交、生活办事一站整理 | /resources/overseas-life | 生活必备 | 必做 |
| 5 | 出海创业常用工具 | 💼 | 建站、收款、广告、物流，从0到1 | /resources/business-tools | 创业 | 重要 |
| 6 | 账号安全与隐私保护 | 🔒 | 双重验证、密码管理、隐私设置入门 | /resources/security | 新手必看 | 必做 |
| 7 | 常用浏览器插件 | 🧩 | 翻译、截图、比价、笔记等效率插件 | /resources/browser-extensions | 效率提升 | 重要 |
| 8 | 精选教程 | 📚 | 我们自己的原创指南文章精选 | /guides | 教程 | 后期 |

### 卡片组件设计

```
┌─────────────────────────────────────────┐
│  [图标]  卡片标题                        │
│  一句话说明，不超过20字                  │
│                                          │
│  [标签]  [标签]                          │
│                              [前往浏览 →] │
└─────────────────────────────────────────┘
```

- 桌面端：3-4 列网格
- 移动端：1-2 列网格
- 风格：与核心工具卡片一致的圆角白色卡片，浅灰边框

---

## 第三部分：资源库分类扩展

### 新增分类（不破坏现有 life/logistics/business/templates）

| 分类 slug | 中文名 | 描述 | 对应首页卡片 |
|-----------|--------|------|-------------|
| `starter` | 外网新手 | 刚能访问外网必看的基础软件和工具 | 卡片 1 |
| `ai-tools` | AI 工具 | 主流 AI 平台汇总 | 卡片 2 |
| `browser-extensions` | 浏览器插件 | 效率提升类 Chrome 扩展 | 卡片 7 |
| `video-learning` | 视频学习 | YouTube 教程、在线课程平台 | 卡片 3 |
| `overseas-life` | 海外生活 | 银行/购物/社交/生活办事 | 卡片 4 |
| `business-tools` | 出海经营 | 建站/收款/广告/物流工具 | 卡片 5 |
| `security` | 账号安全 | 密码管理、隐私保护、双重验证 | 卡片 6 |

### 兼容策略

- 现有 `life` / `logistics` / `business` / `templates` 保持不变
- 新分类独立存在，互不影响
- 前端按分类过滤时支持多分类共存
- 如未来需要，可做二级标签（tags 字段已支持）

---

## 第四部分：Resource 数据字段建议

### 当前 Resource model（已有）

```prisma
model Resource {
  id          String   @id @default(cuid())
  name        String
  url         String
  description String?
  category    String
  tags        String[] @default([])
  sourceType  String   @default("third-party") @map("sourcetype")
  usage       String?
  disclaimer  String?
  isActive    Boolean  @default(true) @map("isactive")
  sortOrder   Int      @default(0) @map("sortorder")
  createdAt   DateTime @default(now()) @map("createdat")
  updatedAt   DateTime @updatedAt @map("updatedat")
}
```

### 建议新增字段（本轮不改 schema，仅建议）

| 字段 | 类型 | 说明 | 优先级 |
|------|------|------|--------|
| `platform` | String? | website/youtube/github/app/chrome-extension | 重要 |
| `language` | String? | zh/en/multi | 次要 |
| `difficulty` | String? | beginner/normal/advanced | 次要 |
| `isRecommended` | Boolean | 是否推荐到首页 | 重要 |
| `coverImage` | String? | 封面图片 URL | 次要 |
| `rating` | Int? | 用户评分（1-5） | 后期 |

### 当前可用度评估

- ✅ **name/title**: `name` 已有，够用
- ✅ **url**: 已有
- ✅ **category**: 已有，需新增分类值
- ✅ **tags**: 已有
- ✅ **description**: `description` 已有
- ✅ **sourceType**: 已有
- ⚠️ **platform**: 需要新增
- ⚠️ **isRecommended**: 需要新增
- ℹ️ **language/difficulty**: 可用 tags 暂代，后期再结构化

### 结论

**当前 schema 基本够用**。新增 `platform` 和 `isRecommended` 两个字段即可满足 v1.1 需求。其余可用 tags 和 description 暂代，不急于改 schema。

---

## 第五部分：广告位与商业化预留规划（重点）

### 设计原则

1. **原生化**：广告融入现有卡片风格，不突兀
2. **可信感**：明确标注"推广"/"赞助"，不欺骗用户
3. **轻量标注**：小标签，不使用刺眼红黄大字
4. **不廉价**：避免"震惊/必看/速点"类诱导文案
5. **不干扰**：不影响工具主按钮和核心功能
6. **移动端友好**：不遮挡内容，不做弹窗
7. **空状态优雅**：广告未填充时不渲染，不影响页面

---

### 一、首页广告位布局方案

#### 1. Hero 区右侧轻广告位

```
位置：首屏右侧或 Hero 下方
形式：小型推荐卡片（与场景卡片同宽）
适合：AI 工具、浏览器、海外软件
```

```
┌─────────────────────────┐
│  海外华人的常用工具箱     │
│                         │
│  [场景1] [场景2] [场景3] │
│  [场景4] [场景5] [场景6] │
│                         │
│              ┌────────┐ │
│  ──────────  │  [推广] │ │
│              │ 推荐AI工具│ │
│              │ 一句话   │ │
│              └────────┘ │
└─────────────────────────┘
```

- **实现优先级**: 🟡 第二期（等有具体广告主后）
- **对 SEO 影响**: 无（首屏内容已足够丰富）
- **建议**: 初期用占位，不接真实广告

#### 2. 核心工具区后广告位

```
位置：8 个核心工具卡片下面
形式：横向推荐条或 2-3 个小卡片
适合：跨境工具、学习资源、出海服务
```

```
┌──────────────────────────────────────────────┐
│  [工具1] [工具2] ... [工具8]                  │
│                                              │
│  ┌──────────────────────────────────────┐    │
│  │ [推广] 推荐出海建站工具 - 一句话说明   │    │
│  │ [前往了解 →]                          │    │
│  └──────────────────────────────────────┘    │
└──────────────────────────────────────────────┘
```

- **实现优先级**: 🟢 第一期（容易实现，不影响体验）
- **对 SEO 影响**: 低（位于核心内容下方）
- **建议**: 先用 mock 数据占位

#### 3. "刚能访问外网"模块内原生广告位

```
位置：资源卡片中混入 1 个赞助卡片
形式：与普通卡片风格一致，右上角标"推广"
```

```
┌────────┐ ┌────────┐ ┌────────┐
│ 卡片1  │ │ 卡片2  │ │ 推广    │
│ 必装   │ │ AI工具 │ │ 密码管理 │
└────────┘ └────────┘ └────────┘
```

- **实现优先级**: 🟢 第一期（与模块同时实现）
- **对 SEO 影响**: 低（内容相关广告，增强而非降低质量）
- **建议**: 每 6-8 个卡片插入 1 个赞助位

#### 4. 最新指南区中间广告位

```
位置：3 个文章卡片之间
形式：赞助教程卡片
```

```
┌──────┐ ┌──────┐
│文章1 │ │文章2 │
├──────┤ ┤──────┤
│ 赞助教程卡片                        │
├──────┤ ┤──────┤
│文章3 │
└──────┘
```

- **实现优先级**: 🟡 第二期（等有广告内容后）
- **对 SEO 影响**: 中（文章区插入广告需注意比例）

#### 5. 首页底部广告位

```
位置：Footer 上方 / CTA 区域之前
形式：低调横幅或 3 个小卡片
```

- **实现优先级**: 🟡 第二期
- **对 SEO 影响**: 无（靠近页脚）

---

### 二、工具页广告位布局方案

每个工具页至少 2 个广告位：

#### 工具页通用布局

```
┌─────────────────────────────────────────────┐
│  [工具标题]                                   │
│                                              │
│  ┌─────────────────┐  ┌──────────────┐      │
│  │                 │  │  [推广]       │      │
│  │   主功能区域     │  │  侧边栏广告   │      │
│  │   （计算器/     │  │  (桌面端)     │      │
│  │    查询结果）    │  │              │      │
│  │                 │  └──────────────┘      │
│  └─────────────────┘                        │
│                                              │
│  ┌────────────────────────────────────┐     │
│  │ [推广] 相关工具/服务推荐卡片        │     │
│  └────────────────────────────────────┘     │
│                                              │
│  FAQ / 使用说明                               │
│                                              │
│  ┌────────────────────────────────────┐     │
│  │ [推广] 底部推荐卡片                 │     │
│  └────────────────────────────────────┘     │
└─────────────────────────────────────────────┘
```

| 广告位 | 位置 | 移动端适配 | 优先级 |
|--------|------|-----------|--------|
| 侧边栏 | 主功能右侧 | 结果下方折叠 | 🟡 第二期 |
| 主功能后 | 结果/计算下方 | 正常显示 | 🟢 第一期 |
| 底部 | FAQ 之后 | 正常显示 | 🟡 第二期 |

**重点工具页**：`/tracking`, `/tools/shipping-calculator`, `/tools/hs-code`, `/tools/postal-code`, `/tools/exchange-rate`, `/tools/memo`

---

### 三、文章页广告位布局方案

```
┌─────────────────────────────────────────────┐
│  文章标题                                     │
│  ┌──────────────────────────────────┐       │
│  │ [推广] 顶部轻广告（文字推荐）      │       │
│  └──────────────────────────────────┘       │
│                                              │
│  正文第一段                                    │
│  正文第二段                                    │
│                                              │
│  ┌──────────────────────────────────┐       │
│  │ [推广] 正文中段原生推荐卡片       │       │
│  └──────────────────────────────────┘       │
│                                              │
│  正文第三段                                    │
│  ...                                         │
│                                              │
│  ┌──────────────────────────────────┐       │
│  │ [推广] 底部赞助资源卡片           │       │
│  └──────────────────────────────────┘       │
│                                              │
│  相关工具推荐                                  │
│  相关文章                                     │
└─────────────────────────────────────────────┘
```

**原则**：
- 每篇文章最多 2-3 个广告位
- 不在前两段插入广告（影响阅读体验）
- 移动端侧边栏广告隐藏

---

### 四、资源库广告位布局方案

```
┌─────────────────────────────────────────────┐
│  资源库 - 分类筛选                            │
│  ┌──────────────────────────────────┐       │
│  │ [赞助] 分类顶部推荐位             │       │
│  │ 例如：外网新手 → 推荐浏览器/安全工具│       │
│  └──────────────────────────────────┘       │
│                                              │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐               │
│  │资源│ │资源│ │资源│ │资源│               │
│  └────┘ └────┘ └────┘ └────┘               │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐               │
│  │资源│ │资源│ │资源│ │推广│ ← 每8-12个插入  │
│  └────┘ └────┘ └────┘ └────┘               │
│  ...                                        │
└─────────────────────────────────────────────┘
```

---

### 五、AdSlot 组件设计方案

#### 组件路径
`src/components/ad-slot.tsx`

#### TypeScript 定义

```typescript
type AdPlacement =
  | "home-after-tools"
  | "home-starter-native"
  | "home-before-footer"
  | "tool-sidebar"
  | "tool-after-result"
  | "tool-bottom"
  | "article-top"
  | "article-inline"
  | "article-bottom"
  | "resource-native"
  | "resource-category-top";

type AdVariant = "banner" | "card" | "text" | "native" | "sidebar";

interface AdData {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  targetUrl: string;
  sponsorName?: string;
  label?: "推广" | "赞助" | "推荐" | "Sponsored";
  enabled: boolean;
  startAt?: string;
  endAt?: string;
  tags?: string[];
  priority: number;
}

interface AdSlotProps {
  placement: AdPlacement;
  variant?: AdVariant;
  className?: string;
  /** Override ad data for testing */
  ad?: Partial<AdData>;
}
```

#### 组件行为

1. 从 `src/lib/data/ads.ts` 读取 mock 数据
2. 按 `placement` 筛选匹配的广告
3. 按 `priority` 排序，取第一个 `enabled` 且时间在 `startAt/endAt` 范围内的
4. 无广告时返回 `null`（不渲染占位）
5. 渲染时右上角显示 `label`（默认"推广"）

#### 初期实现

```
src/lib/data/ads.ts
├── mock 广告数据（本地文件）
├── getAdsByPlacement(placement) 函数
└── 空数组 = 无广告 = 不渲染
```

后期再迁移到数据库 + 后台管理。

---

### 六、ads.ts Mock 数据结构

```typescript
// src/lib/data/ads.ts

export interface AdData {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  targetUrl: string;
  placement: string[];
  variant: "banner" | "card" | "text" | "native" | "sidebar";
  sponsorName?: string;
  label?: "推广" | "赞助" | "推荐";
  enabled: boolean;
  startAt?: string;
  endAt?: string;
  tags?: string[];
  priority: number;
}

export const ads: AdData[] = [
  // 示例：核心工具区后广告
  {
    id: "ad-home-tools-1",
    title: "推荐出海建站工具",
    description: "从零搭建独立站，支持多语言、多币种",
    targetUrl: "/resources/business-tools",
    placement: ["home-after-tools"],
    variant: "card",
    label: "推荐",
    enabled: false, // 初期关闭，有广告主时打开
    priority: 1,
  },
  // 示例：新手模块内原生广告
  {
    id: "ad-starter-1",
    title: "密码管理器推荐",
    description: "一个密码管理器，保护你的所有账号安全",
    targetUrl: "/resources/security",
    placement: ["home-starter-native", "resource-native"],
    variant: "native",
    label: "推荐",
    enabled: false,
    priority: 2,
  },
];

export function getAdsByPlacement(
  placement: string,
  options?: { max?: number }
): AdData[] {
  const now = new Date();
  return ads
    .filter(
      (ad) =>
        ad.enabled &&
        ad.placement.includes(placement) &&
        (!ad.startAt || new Date(ad.startAt) <= now) &&
        (!ad.endAt || new Date(ad.endAt) >= now)
    )
    .sort((a, b) => a.priority - b.priority)
    .slice(0, options?.max ?? 1);
}
```

---

### 七、哪些位置适合现在实现（第一期）

| 位置 | 原因 |
|------|------|
| 核心工具区后广告位 | 结构简单，不影响核心内容，mock 数据占位即可 |
| "外网新手"模块内原生广告位 | 与模块同时开发，共享卡片组件 |
| AdSlot 组件 + ads.ts | 基础设施，先搭好框架 |

### 八、哪些位置等有流量后再实现（第二期）

| 位置 | 原因 |
|------|------|
| Hero 右侧广告位 | 首屏需要精心设计，初期可能影响视觉 |
| 指南区中间广告位 | 文章流量起来后再考虑 |
| 工具页侧边栏广告 | 需要桌面端布局调整 |
| 文章页中段广告 | 需要文章内容足够多 |
| 底部广告位 | 流量大了才有广告价值 |
| 资源库混合广告 | 资源数据丰富了再考虑 |

### 九、对 SEO 和用户体验的影响评估

| 维度 | 影响 | 缓解措施 |
|------|------|---------|
| 页面加载速度 | 极低（本地数据，无外部请求） | 组件无广告时不渲染 |
| Core Web Vitals | 几乎无影响 | 广告位尺寸固定，无 CLS |
| SEO 排名 | 无负面影响 | 广告内容与页面相关 |
| 用户体验 | 正面（如果广告相关） | 明确标注，不欺骗用户 |
| 移动端体验 | 需特别关注 | 侧边栏广告移动端隐藏 |

### 十、最小可执行开发计划

#### Phase A：基础设施（v1.1 第一批）
1. 创建 `src/components/ad-slot.tsx` 组件
2. 创建 `src/lib/data/ads.ts` mock 数据
3. 实现基础渲染逻辑（有广告显示，无广告不渲染）

#### Phase B：首页模块 + 广告位
4. 新建首页"刚能访问外网？先看这个"模块
5. 6-8 个资源卡片 + 1 个原生赞助位
6. 核心工具区后广告位

#### Phase C：资源库分类扩展
7. 新增 7 个资源分类（starter/ai-tools 等）
8. 资源库页面支持新分类筛选
9. 填充 30 个基础资源数据

#### Phase D：工具页广告位
10. 6 个重点工具页各加 1-2 个广告位

---

## 第六部分：合规口径与免责声明

### Footer 预留声明

```
部分链接可能为推广或赞助内容，海外百宝箱不对第三方服务结果作出承诺，请用户自行判断。
```

### 广告页面标注

- 所有广告卡片右上角标注："推广" / "赞助" / "推荐"
- 不使用"官方"、"权威"等误导词
- 广告内容与免责声明一起出现

### 不承诺的范围

- 不对广告商服务效果背书
- 广告内容由广告主负责
- 广告链接跳转第三方网站
- 用户自行判断和选择

---

## 第七部分：第一批可上线的 30 个资源建议

### 外网新手必装（starter）
1. Google Chrome 浏览器 → https://www.google.com/chrome/
2. 1Password / Bitwarden → https://bitwarden.com/
3. Google 翻译 → https://translate.google.com/
4. DeepL → https://www.deepl.com/
5. Google Drive → https://drive.google.com/

### AI 工具（ai-tools）
6. ChatGPT → https://chatgpt.com/
7. Claude → https://claude.ai/
8. Gemini → https://gemini.google.com/
9. Perplexity → https://www.perplexity.ai/
10. Midjourney → https://www.midjourney.com/

### 视频与学习（video-learning）
11. YouTube → https://www.youtube.com/
12. Coursera → https://www.coursera.org/
13. Khan Academy → https://www.khanacademy.org/
14. Bilibili → https://www.bilibili.com/
15. edX → https://www.edx.org/

### 海外生活（overseas-life）
16. Amazon → https://www.amazon.com/
17. eBay → https://www.ebay.com/
18. PayPal → https://www.paypal.com/
19. Wise → https://wise.com/
20. XHS/小红书 → https://www.xiaohongshu.com/

### 出海经营（business-tools）
21. Shopify → https://www.shopify.com/
22. Stripe → https://stripe.com/
23. Google Analytics → https://analytics.google.com/
24. WordPress → https://wordpress.org/
25. Cloudflare → https://www.cloudflare.com/

### 浏览器插件（browser-extensions）
26. uBlock Origin → Chrome Web Store
27. Honey（比价）→ Chrome Web Store
28. Notion Web Clipper → Chrome Web Store
29. Grammarly → https://www.grammarly.com/
30. Immersive Translate（沉浸式翻译）→ Chrome Web Store

### 安全隐私（security）
- Bitwarden（已在 1Password 位置）
- Google 双重验证 → https://myaccount.google.com/security
- Have I Been Pwned → https://haveibeenpwned.com/
- ProtonMail → https://proton.me/mail

> 注：以上仅为建议，实际数据需二次确认链接有效性和分类归属。

---

## 总结

### 本轮不做的
- ❌ 不改 Prisma schema
- ❌ 不做数据库迁移
- ❌ 不接 Google AdSense
- ❌ 不做后台广告管理
- ❌ 不搬运 YouTube 视频内容

### 本轮要做的
- ✅ 首页新增"外网新手"模块
- ✅ AdSlot 组件 + mock 数据
- ✅ 资源库新增 7 个分类
- ✅ 填充 30 个基础资源
- ✅ 核心工具区后广告位
- ✅ 模块内原生赞助位

### 后期迭代
- 🔄 工具页广告位（v1.2）
- 🔄 文章页广告位（v1.2）
- 🔄 Resource schema 扩展（platform, isRecommended）
- 🔄 后台广告管理
- 🔄 Google AdSense 集成
- 🔄 原创教程内容

---

*等确认后进入代码实现。*
