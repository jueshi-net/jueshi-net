# Project Memory: 绝世百宝箱 / jueshi.net / xixiong-saas

> **最后更新**: 2026-06-15  
> **当前生产版本**: v1.20.42.6.89.1 (fc39903)  
> **版本链**:  
> - v1.20.42.6.89 (fc39903): Country Page Backend-Configurable Landing Template MVP  
> - v1.20.42.6.88.3 (f2cde77): HS Code Default Query Coverage & Synonym Search Fix  
> - v1.20.42.6.74.6 (16306cb): 主部署版本  
> - 6c23998: HS Code 英文查询 hotfix  
> - 9527790: Guest Local Save / Auth Boundary hotfix  
> - f300843: HS Code Loading State 竞态条件修复 (AbortController + requestSeqRef)  
> **生产状态**: 已部署，运行稳定  
> **本文档用途**: 每轮开发前必须读取的单一事实源

---

## 一、项目定位

### 核心定位

**本项目是跨境电商 / 外贸 / 物流工具 SaaS**，不是：
- ❌ 单纯网址导航站
- ❌ 论坛优先项目
- ❌ CMS 内容管理系统
- ❌ 广告展示站

### 核心目标链路

```
工具入口 → 使用工具 → 本地暂存 / 登录保存 → Workspace → 复用 / 导出 / 下一步工具 → 会员转化
```

### 目标用户

- 跨境电商 / SOHO
- 外贸新手 / 老手
- 物流从业者
- 留学生 / 数字游民（次要）

---

## 二、当前生产状态

### 服务器信息

| 项目 | 值 |
|---|---|
| 生产服务器 | `deploy@192.129.155.149` |
| 生产目录 | `/home/deploy/xixiong-saas` |
| PM2 app | `xixiong-saas` |
| 当前版本 | v1.20.42.6.74.6 (16306cb) |
| HS Code hotfix | 6c23998（已部署） |
| Guest Save hotfix | 9527790（已部署） |

### 禁止事项

- ❌ **旧服务器 142.171.184.179 禁止使用**，除非用户明确重新批准
- ❌ 不得随意切换服务器
- ❌ 不得在旧服务器上部署

---

## 三、环境要求

### Node.js / npm 版本

| 项目 | 要求 | 说明 |
|---|---|---|
| Node.js | **v22.22.2** | 必须使用此版本 |
| npm | **10.9.7** | 必须使用此版本 |
| V8 | **.39** | 与 Node v22.22.2 配套 |

### 历史问题

- ❌ **Node v22.22.3 (V8 .56) 曾导致不稳定 build**
- ❌ 不得默认使用 v22.22.3
- ❌ build 前必须确认 `node -v` / `npm -v` / V8 版本

### 依赖管理

- ❌ 不得随意升级 Next.js / React
- ❌ 不得随意删除 `package-lock.json`
- ❌ 不得随意 `npm install` 导致 lockfile 漂移

---

## 四、数据库与部署原则

### 数据库信息

| 项目 | 值 |
|---|---|
| 数据库类型 | PostgreSQL |
| 地址 | `127.0.0.1:5432` |
| 数据库名 | `bxb_prod` |
| 用户 | `bxb_user` |

### 安全红线

- ❌ **不得输出完整 DATABASE_URL**
- ❌ **不得输出数据库密码**
- ❌ **不得 prisma db push**（除非明确批准）
- ❌ **没有明确批准不得新增 migration**

### 部署原则

1. **部署前必须 build**
2. **有 DB 变更时必须备份与 rollback preflight**
3. **无 DB 变更时仍需代码备份和回滚方案**
4. **rsync 必须排除 `.env*`**
5. **PM2 restart 前必须确认 build exit 0**

---

## 四点五、后台可配置落地页架构原则

### 适用范围

以下页面都应优先采用后台可配置落地页架构（基于 LandingPage 模型）：

- 国家页（/lp/canada, /lp/usa, /lp/uk 等）
- 城市页（/lp/toronto, /lp/new-york 等）
- 邮编页（/lp/postal-code-us, /lp/postal-code-uk 等）
- 地址格式页（/lp/address-format-us 等）
- 工具落地页（/lp/shipping-calculator, /lp/hs-code 等）
- 指南文章页（/guides/[slug]）
- 专题页（/topics/[slug]）
- 清单页（/lp/[slug] pageType=checklist）
- 任务链页（未来扩展）
- 黄页分类页（未来扩展）
- 商家详情页（未来扩展）

### 标准模块

每个落地页应支持以下标准模块（通过 LandingPage 模型字段配置）：

1. **SEO 配置**
   - seoTitle
   - seoDescription
   - canonical URL
   - index / noindex 控制（通过 status 字段：published = index, draft/hidden = noindex）

2. **Hero 区域**
   - heroSection.title
   - heroSection.subtitle
   - heroSection.ctaText
   - heroSection.ctaUrl
   - heroSection.hotCities（国家页/城市页专用，JSON 数组）

3. **主工具入口**
   - primaryTool（Tool slug）

4. **相关工具**
   - relatedTools（Tool slug 数组）

5. **相关专题**
   - relatedTopics（Topic slug 数组）

6. **相关文章**
   - relatedArticles（Article slug 数组）

7. **相关清单**
   - ctaConfig.relatedChecklists（LandingPage slug 数组，pageType=checklist）

8. **FAQ**
   - faqItems（JSON 数组：[{question, answer}]）

9. **官方链接**
   - officialLinks（JSON 数组：[{label, url, icon}]）
   - 外链必须使用 nofollow noopener noreferrer

10. **广告位**
    - adPlacements（JSON：{placementKey, enabled, campaignIds}）
    - 广告必须标注"广告"或"Sponsored"
    - 广告可关闭（enabled = false）
    - 广告不得干扰核心工具使用
    - 无广告时页面正常显示

11. **CTA（Call to Action）**
    - ctaConfig.text
    - ctaConfig.url
    - ctaConfig.relatedChecklists（临时存储相关清单）

12. **任务链入口**
    - 未来扩展，可通过 heroSection 或 ctaConfig 配置

13. **更新时间**
    - updatedAt（自动更新）
    - 页面显示"最后更新：YYYY年MM月DD日"

14. **区块可见性 / 区块排序**
    - blockVisibility / blockOrder（未来增强，当前列为 backlog）

### 核心原则

1. **后台可配置** - 所有页面内容通过 Admin 配置，不写死在代码中
2. **不写死页面内容** - 使用 JSON 字段存储灵活配置
3. **广告可关闭** - 通过 enabled 字段控制
4. **广告必须标注** - 明确标识广告内容
5. **广告不得干扰核心工具** - 广告位不得影响工具操作
6. **draft / hidden 不进 sitemap** - 只有 published 状态才允许被搜索引擎索引
7. **published 才允许 index** - 其他状态返回 404 或 noindex
8. **先做样板页，再批量扩展** - 每个新页面类型先做一个样板验证，再批量生成

### 当前实现状态

- ✅ LandingPage 模型已存在（支持 country / checklist / landing 等 pageType）
- ✅ /lp/[slug] 路由已实现（通用落地页模板）
- ✅ 支持 hotCities（从 heroSection.hotCities 读取）
- ✅ 支持 relatedChecklists（从 ctaConfig.relatedChecklists 读取）
- ✅ 支持所有标准模块（Hero、Primary Tool、Related Tools、FAQ、Official Links、CTA、Ad Placement）
- ✅ Admin 编辑入口已存在（/admin/landing-pages）
- ✅ 样板数据：Canada（slug: canada, status: hidden, pageType: country）

### 样板数据示例

**Canada 国家页**（scripts/seed-canada-country-page.sql）：
- slug: canada
- pageType: country
- status: hidden（初期不公开）
- primaryTool: postal-code
- relatedTools: [postal-code, address-formatter, exchange-rate, hs-code, shipping-calculator]
- hotCities: [Toronto, Vancouver, Montreal, Calgary, Ottawa, Edmonton]
- faqItems: 3 条加拿大相关 FAQ
- officialLinks: 加拿大邮政官网、加拿大边境服务署
- relatedChecklists: [first-shipping-checklist]

---

## 五、已实现的核心基础能力

### A. 账户 / Auth

| 功能 | 状态 | 说明 |
|---|---|---|
| 登录体系 | ✅ 已实现 | NextAuth.js |
| Workspace 需要登录 | ✅ 已实现 | 正确拦截 |
| 工具页应为 public | ✅ 已实现 | 游客可访问 |
| 游客不应被工具页整体拦截 | ✅ 已实现 | 仅 Workspace 需要登录 |

### B. Workspace

| 功能 | 状态 | 说明 |
|---|---|---|
| 登录用户可保存部分工具文档 | ✅ 已实现 | DocumentHistory / ToolDocument |
| 保存恢复链路 | ✅ 已验证 | 多轮验证 |
| documentType 兼容 | ✅ 已修复 | hyphen / underscore |
| userId 隔离 | ⚠️ 必须长期守护 | 核心安全项 |

### C. TaskChain

| 功能 | 状态 | 说明 |
|---|---|---|
| localStorage key | `jueshi.taskChain.shippingMvp` | 本地任务链 |
| TaskChainDraft DB MVP | ✅ 已存在 | 云端保存 |
| 本地继续 / 保存到 Workspace 边界 | ✅ 已修复 | 多轮修复 |
| 未登录用户默认继续 localStorage | ✅ 已实现 | 正确边界 |
| 登录后才云端保存 | ✅ 已实现 | 正确边界 |

### D. 文档工具

| 工具 | 状态 | 说明 |
|---|---|---|
| Commercial Invoice | ✅ 较稳定 | 基础保存 / Workspace / 恢复已验证 |
| Quote Sheet | ✅ 较稳定 | 基础保存 / Workspace / 恢复已验证 |
| Packing List | ⚠️ 可用 | **公司资料复用未实现**（Beta 缺口） |
| Proforma Invoice | ⚠️ 可用 | Word 已修复，**公司资料复用未实现**（Beta 缺口） |

### E. 工具

| 工具 | 状态 | 说明 |
|---|---|---|
| Container / CBM | ✅ 已修复 | 计算逻辑正确 |
| HS Code | ✅ 已修复 | 英文查询 hotfix 已部署，API 同时查询 description 与 descriptionEn |
| Postal Code | ⚠️ 基础可用 | 地址格式化增强未完成 |
| Shipping Calculator | ⚠️ 基础可用 | Container 联动未完成 |
| Exchange Rate | ⚠️ 基础可用 | Quote / Invoice 联动未完成 |
| URL Navigation | ⚠️ 基础可用 | 人群 / 国家 / 场景 / 官方标识增强未完成 |

### F. BBS / Admin / Analytics

| 模块 | 状态 | 说明 |
|---|---|---|
| BBS | ✅ 已恢复 | 多轮修复 |
| Admin Analytics | ✅ 基础能力 | 已有基础 |
| 论坛优先级 | ❌ 不是当前优先级 | 核心工具未稳前不得扩大 |

---

## 六、已知 Beta 缺口

### 必须明确列出

| 缺口 | 状态 | 阻塞 Beta |
|---|---|---|
| Packing List 公司资料复用未实现 | ❌ 未实现 | ✅ 是 |
| Proforma Invoice 公司资料复用未实现 | ❌ 未实现 | ✅ 是 |
| 游客本地保存 / localStorage 草稿边界 | ✅ 已修复 | ❌ 否 |
| 工具间联动尚未实现 | ❌ 未实现 | ✅ 是 |
| URL Navigation no-migration polish 未开始 | ❌ 未开始 | ✅ 是 |
| S1 Container + Shipping 未开始 | ❌ 未开始 | ✅ 是 |
| Postal Code 增强未开始 | ❌ 未开始 | ✅ 是 |
| HS Code 查询历史 / 收藏 / 申报指引未开始 | ❌ 未开始 | ✅ 是 |
| Exchange Rate 报价联动未开始 | ❌ 未开始 | ✅ 是 |
| Packing List 从 Container 导入未开始 | ❌ 未开始 | ✅ 是 |
| Proforma 从 Quote Sheet 导入未开始 | ❌ 未开始 | ✅ 是 |

---

## 七、游客与登录用户权限边界

### 游客必须可以

- ✅ 打开工具页
- ✅ 填写表单
- ✅ 本机暂存 / localStorage 保存
- ✅ 刷新后恢复本地草稿
- ✅ 打印
- ✅ 导出 Word / PNG / PDF，如该工具支持

### 游客不可以

- ❌ 保存到 Workspace
- ❌ 查看 Workspace
- ❌ 云端同步
- ❌ 多设备恢复
- ❌ 写入用户级 DocumentHistory

### 登录用户可以

- ✅ 本机暂存
- ✅ 保存到 Workspace
- ✅ Workspace 查看历史
- ✅ Workspace 恢复
- ✅ 后续云端同步

### 核心概念区分

**"保存到本机"** 和 **"保存到工作台"** 必须是两个不同概念，不得混淆：

- **保存到本机** = localStorage，游客可用
- **保存到工作台** = 云端保存，需要登录

---

## 八、验收规则

### 必须明确的验收标准

| 检查项 | 说明 |
|---|---|
| 页面 200 ≠ 功能通过 | 必须真实验证功能 |
| 代码存在 ≠ 功能通过 | 必须测试实际行为 |
| build 成功 ≠ 功能通过 | 必须功能验证 |
| smoke test ≠ 业务 E2E | 必须完整业务流程 |
| print 函数存在 ≠ 点击触发 | 必须真实点击验证 |
| 字段存在 ≠ 公司资料复用 | 必须有选择器 UI |
| 响应式 class 存在 ≠ 375px 验证通过 | 必须真实 viewport 验证 |
| API 200 ≠ 返回正确数据 | 必须验证返回数据 |
| 本地通过 ≠ 生产通过 | 必须生产验证 |
| push 成功 ≠ 部署成功 | 必须部署验证 |
| 部署成功 ≠ 可以恢复 Beta | 必须解决 Beta 缺口 |

---

## 九、当前开发方向

### 短期优先

| Sprint | 内容 | 状态 |
|---|---|---|
| S1 | Container + Shipping no-migration 联动 | ❌ 未开始 |
| S2 | Postal Code / Address Helper | ❌ 未开始 |
| S3 | HS Code 查询历史 / 收藏 / 申报指引（优先 localStorage） | ❌ 未开始 |
| S4 | Exchange Rate 报价 / Invoice 辅助 | ❌ 未开始 |
| S5 | URL Navigation no-migration polish | ❌ 未开始 |
| S6 | URL Navigation migration preflight | ❌ 未开始 |
| S7 | Packing List / Proforma Beta+ 收口 | ❌ 未开始 |

### 长期方向

- Shipment Case / Export Order 工作流
- Product Library
- Document Tool Engine
- Tool-to-Tool data handoff
- Company Profile reusable selection
- Member conversion after tool value is stable

---

## 十、当前禁止事项

### 未经批准不得

- ❌ migration
- ❌ prisma db push
- ❌ 恢复 Beta
- ❌ 进入 S1

### 不得优先做

- ❌ 论坛扩展
- ❌ 自动采集
- ❌ 把 URL Navigation 作为主产品

### 不得混淆

- ❌ 把代码行数当完成度
- ❌ 把"字段存在"当功能完成
- ❌ 把"用户手动填写公司信息"当"公司资料复用"

---

## 十一、主要工具增强状态

### 截至当前

**主要工具的实质增强尚未正式开始。**

### v1.20.42.6.74 系列完成的工作

- ✅ Git / 安全 / 部署 / build 稳定
- ✅ Container 计算 bug 修复
- ✅ HS Code 英文查询回归修复
- ✅ PL / PI 可用性验证
- ✅ Workspace 基础回归
- ✅ 游客本地保存回归修复

### 真正的工具增强从后续 S1 开始

---

## 十二、每轮开发前必须读取的文件

1. **本文档**: `docs/PROJECT_MEMORY.md`
2. **开发护栏**: `docs/DEVELOPMENT_GUARDRAILS.md`
3. **当前系统状态**: `reports/product-roadmap/current-system-state-and-next-direction.md`

---

**本文档是项目长期记忆，每轮开发前必须读取。**
