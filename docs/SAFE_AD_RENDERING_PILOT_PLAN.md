# 《v1.20.42.6.17 Safe Ad Rendering Pilot Planning》

**制定时间：** 2026-06-09
**核心原则：** 后台数据已就位，前台渲染暂缓。首批试点仅限文章页与工具页底部安全区域。

---

## 一、v1.20.42.6.16 后台基础复核结果

| 检查项 | 状态 | 说明 |
|---|---|---|
| AdCreative 表存在 | ✅ | `ad_creatives` 表已就绪 |
| AdEvent 表存在 | ✅ | `ad_events` 表已就绪 |
| prisma migrate status | ✅ | `Database schema is up to date!` (21 migrations) |
| /admin/ad-creatives 可访问 | ✅ | 返回 307 跳转登录（正确拦截） |
| /admin/ads 素材数量显示 | ✅ | 已实现 `关联素材：X 个` 显示 |
| /admin/ads 非法 placement 警告 | ✅ | 已实现 `警告：以下投放位置未在广告位注册表中找到` |
| POST /api/ads/events 可写入 | ✅ | API 路由存在，支持 impression/click |
| AdEvent 不保存原始 IP | ✅ | 仅存 `ipHash` (SHA-256 前 16 字符) |
| Admin 导航 24 项 | ✅ | `grep -c 'href:'` 确认 24 项 |
| 无前台广告渲染 | ✅ | 零前台组件变更 |

---

## 二、AdEvent API 安全审查

**路由：** `POST /api/ads/events`

| 审查项 | 状态 | 风险等级 | 说明 |
|---|---|---|---|
| eventType 仅允许 impression/click | ✅ | 低风险 | 严格白名单校验 |
| campaignId 必须存在 | ✅ | 低风险 | 必填校验 + DB 存在性校验 |
| placementKey 必须存在于 AdPlacement | ✅ | 低风险 | DB 存在性校验 |
| creativeId 如提供则必须存在 | ✅ | 低风险 | 可选字段 DB 校验 |
| rate limit 是否真实生效 | ⚠️ | 中风险 | 仅内存 Map 限流，多实例/PM2 重启后清零。生产建议 Redis |
| sessionId 是否可伪造 | ⚠️ | 中风险 | 客户端可控，可配合 IP hash 限流 |
| 匿名请求刷计数 | ⚠️ | 中风险 | 当前允许匿名调用。后续需 API key 或 origin 校验 |
| 同步递增计数器 | ✅ | 低风险 | 直接 `impressions/clicks: { increment: 1 }` |
| 需要服务端签名 token/nonce | 🔶 | 建议后续 | 防止爬虫批量伪造 impression |
| 前台上报需 adRenderToken | 🔶 | 强烈推荐 | 仅接受由 SafeAdSlot 渲染返回的 token，杜绝凭空上报 |

**安全审查结论：**
- **当前风险等级：中风险**。API 具备基础校验，但匿名可访问 + 内存限流在 PM2 多实例/重启场景下易被绕过。
- **建议：在前台渲染前先加固 API**。增加简易 origin 校验或短期 nonce；或在前台组件中携带 `adRenderToken`，仅接受匹配 token 的事件上报。

---

## 三、第一批安全广告位规划

### 候选广告位

| 广告位 Key | 位置描述 | 是否首批试点 | 理由 |
|---|---|---|---|
| `article.footer_recommend` | 文章底部推荐区 | ✅ 是 | 内容自然过渡区，用户预期有推荐内容 |
| `tool.footer_banner` | 工具页底部 | ✅ 是 | 工具操作完成后区域，不干扰核心功能 |
| `landing.block_between` | 落地页内容块之间 | ⏸️ 暂缓 | 公开落地页模板尚未上线，先规划不接入 |

### 排除区域（绝对禁止）

- ❌ 工具表单中间
- ❌ 工具结果核心区域上方
- ❌ 工作台核心区域 (/workspace)
- ❌ 登录/注册页
- ❌ Admin 后台
- ❌ Quote Sheet 编辑区
- ❌ Hero 区域下方（落地页慎用）

---

## 四、SafeAdSlot 组件设计规划

**组件名：** `SafeAdSlot`
**职责：** 异步获取广告配置、安全渲染、上报 impression、处理点击、失败静默。

### Props 设计

```ts
interface SafeAdSlotProps {
  placementKey: string;           // 广告位标识，如 "article.footer_recommend"
  pageType: string;               // 页面类型，如 "article" / "tool"
  pagePath: string;               // 当前路径
  className?: string;             // 容器样式
  fallbackMode?: "empty" | "self-promo"; // 无广告时：静默或展示自营推荐
  maxHeight?: number;             // 最大高度，防止 CLS
  showSponsoredLabel?: boolean;   // 是否显示"广告/推广"标识 (默认 true)
}
```

### 渲染流程

1. **挂载：** 发起 `GET /api/ads/resolve?placementKey=...`（待建）获取活跃广告配置
2. **选择：** 服务端按规则匹配 campaign + creative
3. **渲染：**
   - `image/text/native`：直接渲染 HTML/CSS
   - `html/codeSnippet`：使用 `<iframe sandbox>` 隔离渲染（防 XSS/样式污染）
4. **上报：**
   - impression：图片加载完成 / iframe 渲染完成后调用 `POST /api/ads/events` (type=impression)
   - click：用户点击后调用 `POST /api/ads/events` (type=click)，再 `window.open(targetUrl)`
5. **失败处理：** 网络错误/无广告 → 静默不渲染（不占位）

### 关键约束

- ✅ 不阻塞 SSR 水合（客户端获取）
- ✅ 预留 `maxHeight` 防 CLS
- ✅ 移动端独立样式（`max-w-full` / 触摸友好）
- ✅ 会员减少广告策略预留（检查用户订阅状态）
- ✅ 必须携带 `adRenderToken` 上报（防刷）

---

## 五、广告选择规则规划 (MVP)

```
输入: placementKey
输出: 1 个 active creative（或 null）

规则链（按顺序过滤）：
1. placementKey 完全匹配 AdPlacement.key
2. campaign.isActive === true
3. campaign 在 startDate/endDate 有效期内（endDate 为空则长期有效）
4. campaign priority 降序排列
5. creative.isActive === true
6. placement.isActive === true（软关联校验）

暂不实现：
- 国家/设备/用户类型定向（后续 AdRule 模型）
- 复杂竞价、预算消耗、频控
- A/B 测试轮询

软关联策略：
- 继续使用 AdCampaign.placements[] 字符串数组
- SafeAdSlot 请求时校验 placementKey 是否在数组中
- 未来可渐进迁移到中间表 AdCampaignPlacement
```

---

## 六、页面广告体验规则

### 文章页 (`/blog/[slug]`)
- ✅ 可在底部推荐区放广告 (`article.footer_recommend`)
- ⏸️ 正文中广告暂缓（影响阅读体验，需单独评估）

### 工具页 (`/tools/[tool]`)
- ✅ 只允许底部广告 (`tool.footer_banner`)
- ❌ 不允许表单中间广告
- ❌ 不允许结果核心区上方广告
- ❌ Quote Sheet 编辑页禁止广告

### 落地页 (`/lp/[slug]`)
- ⏸️ 公共模板上线后，可考虑内容块之间 (`landing.block_between`)
- ⏸️ Hero 下方慎用（首屏体验敏感）

### 工作台 (`/workbench`)
- ✅ 仅允许自营轻推荐（不进入本轮广告系统）
- ❌ 不接入第三方广告

### 黄页页 (未来)
- 🔶 适合直客广告和置顶推广（本轮不做）

### 移动端规则
- ❌ 不允许大面积遮挡
- ❌ 不允许弹窗广告
- ❌ 不允许误导点击（如伪装成系统按钮）
- ✅ 必须标注"广告"或"推广"

---

## 七、暂不允许广告的页面/区域清单

| 页面/区域 | 原因 |
|---|---|
| `/auth/*` (登录/注册/重置密码) | 转化漏斗敏感区，广告会干扰 |
| `/workspace` (工作台核心) | 用户核心生产力区，破坏信任 |
| `/quote` (Quote Sheet 编辑) | 表单密集区，广告易导致误触 |
| `/admin/*` (后台管理) | 内部工具，不应有广告 |
| 工具表单内部 (`<form>` 中间) | 严重干扰操作流程 |
| Hero 区域正下方 | 首屏体验红线 |
| 弹窗/模态框内 | 误导点击风险高 |

---

## 八、下一轮是否可以进入 Safe Ad Rendering Pilot Implementation

**结论：✅ 可以。**

**前置条件检查：**
- ✅ AdCreative 后台素材库已就绪
- ✅ AdEvent 事件日志 API 已就绪
- ✅ AdPlacement 注册表已就绪
- ✅ Admin 导航完整 (24 项)
- ✅ 首批试点广告位已明确 (`article.footer_recommend`, `tool.footer_banner`)
- ✅ 页面体验红线已定义
- ✅ SafeAdSlot 组件设计已规划
- ✅ 广告选择规则已定义

**实施前必须完成：**
1. `GET /api/ads/resolve` API 开发（广告匹配逻辑）
2. `SafeAdSlot` 客户端组件开发
3. AdEvent API 加固（adRenderToken 或简易鉴权）
4. 在文章页/工具页底部安全区域插入组件
5. 严格验收：无 CLS、无表单干扰、移动端正常、会员策略预留

**严禁：**
- ❌ 前台广告渲染未经单独版本确认
- ❌ 在 Quote Sheet 编辑区插入广告
- ❌ 在工具表单区插入广告
- ❌ 在工作台核心区插入广告

---

**文档版本：** v1.20.42.6.17
**状态：** Planning Complete, Ready for Implementation
