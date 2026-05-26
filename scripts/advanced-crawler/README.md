# 高级网址导航采编流水线

自动化采集 → AI 评估 → 质量过滤 → 数据库入库 的全链路工具。

## 快速开始

### 1. 准备种子 URL

编辑 `scripts/advanced-crawler/seeds.json`:

```json
[
  { "url": "https://www.usps.com", "suggestedCategory": "logistics" },
  { "url": "https://www.irs.gov", "suggestedCategory": "business" },
  { "url": "https://www.canadapost.ca", "suggestedTags": ["加拿大", "邮政"] }
]
```

### 2. 运行采编流水线

```bash
# 完整流水线（抓取 + AI 评估 + 输出 JSON）
npx tsx scripts/advanced-crawler/index.ts

# 仅抓取（跳过 AI 评估）
npx tsx scripts/advanced-crawler/index.ts --skipAI

# 自定义参数
npx tsx scripts/advanced-crawler/index.ts \
  --seeds=my-seeds.json \
  --concurrency=3 \
  --min-age=90 \
  --min-score=50
```

### 3. 注入数据库

```bash
# 写入本地 Neon 开发库
npx tsx scripts/advanced-crawler/seed-to-db.ts

# 写入 VPS 生产库
npx tsx scripts/advanced-crawler/seed-to-db.ts --prod
```

### 4. 死链巡检

```bash
# 本地预览（不写库）
npx tsx scripts/cron/check-dead-links.ts --dry-run

# 生产库执行（自动下架连续失败的链接）
npx tsx scripts/cron/check-dead-links.ts --prod

# Crontab 定时（每周日凌晨3点）
# 0 3 * * 0 cd /home/deploy/xixiong-saas && npx tsx scripts/cron/check-dead-links.ts --prod >> logs/dead-link-cron.log 2>&1
```

## 架构

```
seeds.json
    ↓
┌─────────────────┐
│   Crawler       │ axios + cheerio 并发抓取
│   (engine.ts)   │ 提取 TDK + favicon + 域名年龄
└────────┬────────┘
         ↓
┌─────────────────┐
│ Quality Filter  │ 域名年龄 < 180天 → 丢弃
│                 │ HTTP 4xx/5xx → 丢弃
│                 │ 描述过短 → 丢弃
└────────┬────────┘
         ↓
┌─────────────────┐
│ AI Rewriter     │ DeepSeek API 风控 + 洗稿 + 打标
│ (ai-rewriter.ts)│ 灰产/博彩/色情 → REJECT
│                 │ 优质内容 → ACCEPT + 原创描述
└────────┬────────┘
         ↓
┌─────────────────┐
│ Seed to DB      │ Prisma upsert 批量写入
│ (seed-to-db.ts) │ 存在则更新，不存在则创建
└─────────────────┘

独立模块:
┌─────────────────┐
│ Dead Link Check │ HEAD 请求巡检死链
│ (check-dead-    │ 连续失败 3 次 → 自动下架
│  links.ts)      │ 生成 JSON 报告
└─────────────────┘
```

## 环境变量

| 变量 | 说明 |
|------|------|
| `AI_API_BASE_URL` | AI API 地址（默认 DeepSeek） |
| `AI_API_KEY` | AI API Key |
| `AI_MODEL` | 模型名称（默认 deepseek-chat） |
| `DATABASE_URL` | 数据库连接串 |
