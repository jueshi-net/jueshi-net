# Stage 1 — 规划文档复核 + 真实功能审计

**版本**: v1.20.42.6.38
**执行时间**: 2026-06-10
**状态**: ✅ 完成

---

## 一、项目文档复核

### ROADMAP.md 相关条目
- 三期待办：UX 精修、板块联动、工具库丰富、移动端适配
- 内容架构：专题 → 清单 → 工具 → 用户资产 转化路径已规划

### CONTENT_IA_LONG_TERM.md 相关条目
- 内链路径模型：专题 → 清单 → 工具 → 用户资产
- 工具页内链规则：顶部链接所属专题，结果下方推荐相关工具
- 每个页面至少 3 个出站内链

### PROJECT_MEMORY.md 相关条目
- HS Code 数据库：51,838 条真实海关数据
- 邮编工具：已挂载当地实时时钟、大使馆链接、汇率快捷跳转
- 主品牌：绝世百宝箱

---

## 二、三个核心工具真实功能审计

### 2.1 邮编查询 `/tools/postal-code`

| 项目 | 状态 | 说明 |
|---|---|---|
| 真实功能 | ✅ 可用 | 使用 DB (`/api/postal-codes`) + 内置国家数据 |
| 支持国家 | ✅ 8+ | CA, US, GB, AU, NZ, SG, JP, MY |
| 示例输入 | ❌ 缺失 | 无示例按钮 |
| 复制按钮 | ✅ 部分 | 有复制邮编、复制地址功能 |
| 最近查询 | ❌ 缺失 | 无 localStorage 记录 |
| 官方入口 | ❌ 缺失 | 无 Canada Post / USPS / Royal Mail 链接 |
| 结果解释 | ✅ 部分 | 显示城市/省份/格式验证 |
| 相关工具 | ❌ 缺失 | 无相关工具推荐模块 |
| 相关清单 | ❌ 缺失 | 无 RelatedChecklistSection |
| EventLog | ⚠️ 部分 | 有 postalQuery，缺 Tool_View/Copy/Related |
| 免责声明 | ✅ 有 | "本站提供的邮编信息仅供参考" |
| 移动端 | ✅ 可用 | 响应式布局 |

### 2.2 HS编码查询 `/tools/hs-code`

| 项目 | 状态 | 说明 |
|---|---|---|
| 真实功能 | ✅ 可用 | 使用 DB 51,838 条真实海关数据 |
| 数据源 | ✅ 真实 | PostgreSQL HSCode 表，Prisma 查询 |
| 示例商品 | ❌ 缺失 | 无示例按钮（保温杯/手机壳等） |
| 复制按钮 | ❌ 缺失 | 无复制 HS 编码/描述功能 |
| 最近查询 | ❌ 缺失 | 无 localStorage 记录 |
| 官方入口 | ⚠️ 部分 | 有海关总署链接，但缺 WCO/各国海关 |
| 结果解释 | ⚠️ 部分 | 有英文申报名/类别，缺"为什么匹配"说明 |
| 相关工具 | ❌ 缺失 | 无相关工具推荐模块 |
| 相关清单 | ❌ 缺失 | 无 RelatedChecklistSection |
| EventLog | ⚠️ 未调用 | 定义了 hsCopyName/hsClickVerify 但代码中未调用 |
| 免责声明 | ✅ 有 | "HS 编码结果仅供参考" |
| FAQ | ⚠️ 不足 | 仅 2 条，建议增至 5+ |
| 移动端 | ✅ 可用 | 响应式布局 |

### 2.3 汇率换算 `/tools/exchange-rate`

| 项目 | 状态 | 说明 |
|---|---|---|
| 真实功能 | ✅ 可用 | 使用 ExchangeRate-API v4/v6 |
| 数据源 | ✅ 真实 | ExchangeRate-API，30 分钟缓存 |
| 常用币种快捷按钮 | ❌ 缺失 | 无 USD/CAD/CNY/EUR/GBP 快捷按钮 |
| 复制按钮 | ❌ 缺失 | 无复制结果/报价参考功能 |
| 最近换算 | ❌ 缺失 | 无 localStorage 记录 |
| 场景快捷入口 | ❌ 缺失 | 无 USD→CAD/CAD→CNY 等快捷入口 |
| 更新时间 | ✅ 有 | 显示数据来源/日期/本站更新时间 |
| 相关工具 | ❌ 缺失 | 无相关工具推荐模块 |
| 相关清单 | ❌ 缺失 | 无 RelatedChecklistSection |
| EventLog | ⚠️ 部分 | 有 exchangeConvert/view_history，缺 Copy/Related |
| 免责声明 | ✅ 有 | "汇率仅供参考，实际结算以银行为准" |
| 30天走势图 | ✅ 有 | 使用 recharts + ECB 历史数据 |
| 移动端 | ✅ 可用 | 响应式布局 |

### 2.4 地址格式化 `/tools/address-formatter`

| 项目 | 状态 | 说明 |
|---|---|---|
| 真实功能 | ✅ 可用 | 模板式地址格式化，5 国支持 |
| 示例输入 | ❌ 缺失 | 无示例按钮 |
| 复制按钮 | ✅ 有 | 复制英文格式结果 |
| 最近查询 | ❌ 缺失 | 无 localStorage 记录 |
| 官方入口 | ❌ 缺失 | 无邮政官方链接 |
| 相关工具 | ❌ 缺失 | 无相关工具推荐模块 |
| 相关清单 | ✅ 有 | RelatedChecklistSection |
| EventLog | ❌ 缺失 | 完全没有 trackEvent 调用 |
| 免责声明 | ✅ 有 | "地址格式仅供整理参考" |
| 移动端 | ✅ 可用 | 响应式布局 |

---

## 三、P0/P1/P2 问题清单

### P0 — 必须修复
1. **HS编码无复制按钮** — 用户无法复制编码或描述
2. **HS编码 EventLog 未调用** — 定义了方法但代码中未使用
3. **地址格式化无 EventLog** — 完全没有埋点
4. **汇率无复制按钮** — 用户无法复制换算结果
5. **所有工具无最近查询** — localStorage 功能全部缺失

### P1 — 应该修复
6. **所有工具无示例输入按钮** — 用户不知道输入什么
7. **HS编码 FAQ 不足** — 仅 2 条，建议 5+
8. **汇率无常用币种快捷按钮** — 需要搜索才能找到
9. **汇率无场景快捷入口** — USD→CAD 等常用对无快捷方式
10. **邮编无官方入口** — 缺 Canada Post / USPS 等链接

### P2 — 可以修复
11. **HS编码无相关工具/清单** — 缺 RelatedGuidesSection/RelatedChecklistSection
12. **汇率无相关工具/清单** — 缺相关推荐
13. **邮编无相关清单** — 缺 RelatedChecklistSection
14. **HS编码结果缺解释** — 无"为什么匹配"说明

---

## 四、阶段 2/3/4 可安全修改范围

### 阶段 2（邮编/地址）可修改
- `src/app/(public)/tools/postal-code/postal-code-client.tsx`
- `src/app/(public)/tools/address-formatter/page.tsx`
- 新增示例按钮、最近查询、官方入口、相关工具、EventLog

### 阶段 3（HS编码）可修改
- `src/app/(public)/tools/hs-code/page.tsx`
- 新增示例按钮、复制按钮、最近查询、相关工具、FAQ、EventLog

### 阶段 4（汇率）可修改
- `src/app/(public)/tools/exchange-rate/page.tsx`
- 新增常用币种按钮、复制按钮、最近换算、场景入口、相关工具、EventLog

### 禁止修改
- Prisma schema / migration
- Auth / Session / middleware
- Quote Sheet 核心逻辑
- Workspace / Dashboard
- API 路由（除审计脚本外）

---

## 五、数据源确认

| 工具 | 数据源 | 真实性 | 说明 |
|---|---|---|---|
| 邮编 | PostgreSQL PostalCode 表 + 内置国家数据 | ✅ 真实 | DB 查询 + 格式验证 |
| HS编码 | PostgreSQL HSCode 表 (51,838条) | ✅ 真实 | 中国海关数据 |
| 汇率 | ExchangeRate-API v4/v6 | ✅ 真实 | 国际市场汇率，30分钟缓存 |
| 地址格式化 | 内置模板 | ✅ 规则型 | 基于国家地址格式模板 |

---

*阶段 1 审计完成，可进入阶段 2。*
