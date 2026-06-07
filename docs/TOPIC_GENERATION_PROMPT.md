# Topic Generation / Import Prompt

Standard JSON format for importing topics into the database via Prisma.

## Overview

Topics support multiple `templateType` values. The `rating_list` template renders a full DB-driven page with APP cards, ratings, and sections. Other template types fall back to CMS-rendered content when available.

## Topic JSON Structure

```json
{
  "slug": "essential-apps-overseas",
  "title": "出海必备 APP 清单",
  "subtitle": "刚出海不知道装什么？照着这份清单就行",
  "summary": "精选 20+ 个海外生活必备 APP，按 S/A/B/C/D 五级评级，帮你快速上手。",
  "status": "published",
  "templateType": "rating_list",
  "seoTitle": "2026 出海必备 APP 清单 — 海外百宝箱",
  "seoDescription": "精选海外生活必备 APP，按实用程度分级评级。",
  "youtubeVideoId": "dQw4w9WgXcQ",
  "youtubeUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "youtubeTitle": "出海必备 APP 推荐",
  "youtubeDescription": "本期视频介绍...",
  "suitableFor": ["留学生", "新移民", "海外工作者"],
  "tags": ["出海", "APP推荐", "必备工具"],
  "heroBadges": [
    { "label": "📱 20+ APP", "color": "blue" },
    { "label": "🏆 S-D 评级", "color": "amber" }
  ],
  "sections": [
    { "title": "为什么需要这份清单", "content": "...", "type": "intro", "sortOrder": 1 },
    { "title": "避坑提醒", "content": "...", "type": "notice", "sortOrder": 2 }
  ],
  "items": [
    {
      "name": "WhatsApp",
      "alias": "What's App",
      "rating": "S",
      "category": "social",
      "iconText": "W",
      "iconBg": "#25D366",
      "iconFg": "#ffffff",
      "installPriority": "先装",
      "description": "海外最常用的即时通讯工具...",
      "analogy": "类似微信",
      "suitableFor": "所有人",
      "beginnerAdvice": "注册需要海外手机号，建议落地后第一时间注册。",
      "riskTip": "不要点击不明链接，WhatsApp 诈骗链接非常普遍。",
      "officialUrl": "https://www.whatsapp.com/",
      "isBeginnerFriendly": true,
      "sortOrder": 1
    }
  ]
}
```

## Field Reference

### Topic Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `slug` | string | Yes | URL-friendly identifier, e.g. `essential-apps-overseas` |
| `title` | string | Yes | Display title |
| `subtitle` | string | No | Subtitle shown below title in hero |
| `summary` | string | No | Short description for meta/hero |
| `status` | string | Yes | `published` or `draft` |
| `templateType` | string | Yes | `rating_list` (full DB page) or other (CMS fallback) |
| `seoTitle` | string | No | Custom page title for SEO |
| `seoDescription` | string | No | Custom meta description |
| `youtubeVideoId` | string | No | YouTube video ID for embed |
| `youtubeUrl` | string | No | Full YouTube URL |
| `youtubeTitle` | string | No | Custom title for video section |
| `youtubeDescription` | string | No | Description shown under video |
| `suitableFor` | string[] | No | Target audience tags |
| `tags` | string[] | No | General topic tags |
| `heroBadges` | object[] | No | Badges in hero: `{ label, color }` |

### Sections Structure

```json
{
  "sections": [
    {
      "title": "Section Title",
      "content": "Section body text. Supports \\n for paragraphs.",
      "type": "intro",
      "sortOrder": 1
    }
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Section heading (optional) |
| `content` | string | Section body text |
| `type` | string | `intro` (introductory text) or `notice` (warning/alert) |
| `sortOrder` | number | Display order (ascending) |

### Items Structure (rating_list template)

```json
{
  "items": [
    {
      "name": "APP Name",
      "alias": "Alias / Alternate Name",
      "rating": "S",
      "category": "social",
      "iconText": "W",
      "iconBg": "#25D366",
      "iconFg": "#ffffff",
      "installPriority": "先装",
      "description": "Description of the app...",
      "analogy": "Similar to 微信",
      "suitableFor": "留学生、新移民",
      "beginnerAdvice": "Beginner tips...",
      "riskTip": "Warning or risk tip...",
      "officialUrl": "https://...",
      "isBeginnerFriendly": true,
      "sortOrder": 1
    }
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | App/tool name |
| `alias` | string | Alternate name or abbreviation |
| `rating` | string | One of: `S`, `A`, `B`, `C`, `D` |
| `category` | string | Category ID matching the topic's category set |
| `iconText` | string | 1-2 char text shown in icon circle |
| `iconBg` | string | Background color hex (e.g. `#25D366`) |
| `iconFg` | string | Foreground/text color hex |
| `installPriority` | string | One of: `先装`, `高频`, `按需`, `了解即可` |
| `description` | string | App description |
| `analogy` | string | "类似 XX" — analogy to a familiar tool |
| `suitableFor` | string | Who this app is suitable for |
| `beginnerAdvice` | string | Tips for first-time users |
| `riskTip` | string | Warning or pitfall to avoid |
| `officialUrl` | string | Link to official website |
| `isBeginnerFriendly` | boolean | Whether this is beginner-friendly |
| `sortOrder` | number | Display order within category/rating |

## Rating Values

- **S** — 必装，不可替代
- **A** — 高频使用，强烈推荐
- **B** — 按需安装，有用
- **C** — 了解即可，偶尔用
- **D** — 不太推荐，有更好替代

## Install Priority Values

- `先装` — Install first when arriving overseas
- `高频` — High frequency daily use
- `按需` — As needed
- `了解即可` — Just be aware

## Example: Complete Topic with 3 Items

```json
{
  "slug": "communication-apps-overseas",
  "title": "海外通讯工具大全",
  "subtitle": "WhatsApp / Telegram / Signal / 短信，到底用哪个？",
  "summary": "全面对比海外主流通讯工具，帮你选对不踩坑。",
  "status": "published",
  "templateType": "rating_list",
  "suitableFor": ["留学生", "新移民"],
  "tags": ["通讯", "社交", "出海必备"],
  "sections": [
    {
      "title": "为什么国外不用微信？",
      "content": "在国外你会发现，身边的人几乎不用微信。不是因为微信不好，而是因为大家的社交圈都在 WhatsApp、Telegram 和 iMessage 上。如果你不注册这些工具，就等于和当地社交网络断联了。",
      "type": "intro",
      "sortOrder": 1
    }
  ],
  "items": [
    {
      "name": "WhatsApp",
      "alias": "",
      "rating": "S",
      "category": "social",
      "iconText": "W",
      "iconBg": "#25D366",
      "iconFg": "#ffffff",
      "installPriority": "先装",
      "description": "全球 20 亿人使用的即时通讯工具。国外就像国内用微信一样普遍——联系朋友、加入社群、甚至商家客服都用 WhatsApp。",
      "analogy": "类似微信",
      "suitableFor": "所有人",
      "beginnerAdvice": "注册需要海外手机号，落地后第一时间注册。记得备份聊天记录。",
      "riskTip": "不要点击不明链接。冒充客服和朋友的诈骗非常普遍。",
      "officialUrl": "https://www.whatsapp.com/",
      "isBeginnerFriendly": true,
      "sortOrder": 1
    },
    {
      "name": "Telegram",
      "alias": "电报 / TG",
      "rating": "A",
      "category": "social",
      "iconText": "TG",
      "iconBg": "#0088cc",
      "iconFg": "#ffffff",
      "installPriority": "先装",
      "description": "加密通讯 + 群组 + 频道。海外华人社区非常活跃，各种互助群、二手群、租房群都在 Telegram 上。",
      "analogy": "类似 QQ 频道 + 微信的混合体",
      "suitableFor": "需要加入海外社群的人",
      "beginnerAdvice": "注册后先搜索当地的华人互助群组，信息量非常大。",
      "riskTip": "群内二手交易要格外小心。先转账后发货 99% 是诈骗，务必面交。",
      "officialUrl": "https://telegram.org/",
      "isBeginnerFriendly": true,
      "sortOrder": 2
    },
    {
      "name": "Google Maps",
      "alias": "谷歌地图",
      "rating": "S",
      "category": "navigation",
      "iconText": "G",
      "iconBg": "#4285F4",
      "iconFg": "#ffffff",
      "installPriority": "先装",
      "description": "出国后没有它几乎寸步难行。导航、公交路线、商家信息、营业时间、评价全部靠它。",
      "analogy": "类似高德地图 + 大众点评",
      "suitableFor": "所有人",
      "beginnerAdvice": "提前下载离线地图，防止没有网络时迷路。",
      "riskTip": "不要完全依赖导航走路，注意看路牌和交通信号，国外有些地方导航会导到危险区域。",
      "officialUrl": "https://maps.google.com/",
      "isBeginnerFriendly": true,
      "sortOrder": 3
    }
  ]
}
```

## CMS Fallback (Non-rating_list Templates)

For topics with `templateType` other than `rating_list`, the page falls back to CMS-rendered content. Ensure a corresponding Markdown topic exists in the CMS with the same slug. The CMS topic frontmatter should include:

- `title` — Display title
- `subtitle` — Optional subtitle
- `slug` — Must match the DB topic slug
- `tags` — Tags for related links
- `related_tools` — Optional list of tool slugs

CMS content body supports:
- `## Heading` — Section headings
- `### Heading` — Sub-headings
- `**[Link Text](url)** — Description` — Link items
- `- bullet` — Bullet points
