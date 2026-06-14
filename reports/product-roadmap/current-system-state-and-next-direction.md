# Current System State & Next Direction

> **最后更新**: 2026-06-14  
> **当前版本**: v1.20.42.6.74.6 (16306cb) + HS Code hotfix (6c23998) + Guest Save hotfix (9527790)  
> **生产状态**: 已部署，运行稳定  
> **本文档用途**: 当前系统状态的全面审计，明确已实现/未实现功能

---

## 一、系统状态总览表

| 模块 | 当前状态 | 已实现 | 未实现 | 当前风险 | 下一步 |
|---|---|---|---|---|---|
| **Auth** | ✅ 稳定 | 登录体系、Workspace 拦截 | 无 | 低 | 无需改动 |
| **Workspace** | ✅ 稳定 | 文档保存/恢复、userId 隔离 | 无 | 低 | 无需改动 |
| **TaskChain** | ✅ 稳定 | localStorage/云端边界 | 无 | 低 | 无需改动 |
| **Commercial Invoice** | ✅ 稳定 | 保存/Workspace/恢复 | 无 | 低 | 无需改动 |
| **Quote Sheet** | ✅ 稳定 | 保存/Workspace/恢复 | 无 | 低 | 无需改动 |
| **Packing List** | ⚠️ 可用 | 基础功能 | **公司资料复用** | 中 | S7 Beta+ 收口 |
| **Proforma Invoice** | ⚠️ 可用 | 基础功能、Word 导出 | **公司资料复用** | 中 | S7 Beta+ 收口 |
| **Container / CBM** | ✅ 已修复 | 计算逻辑 | Container → PL 导入 | 低 | S1 联动 |
| **HS Code** | ✅ 已修复 | 英文查询 | 查询历史/收藏/申报指引 | 低 | S3 增强 |
| **Postal Code** | ⚠️ 基础可用 | 基础查询 | 地址格式化增强 | 中 | S2 增强 |
| **Shipping Calculator** | ⚠️ 基础可用 | 基础计算 | Container 联动 | 中 | S1 联动 |
| **Exchange Rate** | ⚠️ 基础可用 | 基础查询 | Quote/Invoice 联动 | 中 | S4 联动 |
| **URL Navigation** | ⚠️ 基础可用 | 基础导航 | 人群/国家/场景/官方标识 | 中 | S5/S6 增强 |
| **BBS** | ✅ 已恢复 | 基础功能 | 无 | 低 | 非当前优先级 |
| **Admin Analytics** | ✅ 基础能力 | 基础统计 | 无 | 低 | 非当前优先级 |
| **Deployment** | ✅ 稳定 | rsync + build + PM2 | 无 | 低 | 无需改动 |
| **Security** | ✅ 稳定 | 无敏感信息泄露 | 无 | 低 | 持续监控 |

---

## 二、主要工具增强状态

### 截至当前：主要工具的实质增强尚未正式开始

### v1.20.42.6.74 系列完成的工作

| 工作 | 状态 | 说明 |
|---|---|---|
| Git / 安全 / 部署 / build 稳定 | ✅ 完成 | 基础设施稳定 |
| Container 计算 bug 修复 | ✅ 完成 | 60×40×50cm 计算正确 |
| HS Code 英文查询回归修复 | ✅ 完成 | API 同时查询 description 与 descriptionEn |
| PL / PI 可用性验证 | ✅ 完成 | 基础功能可用 |
| Workspace 基础回归 | ✅ 完成 | 保存/恢复链路正常 |
| 游客本地保存回归修复 | ✅ 完成 | commercial-invoice/quote-sheet 支持游客本地保存 |

### 真正的工具增强从后续 S1 开始

---

## 三、已实现功能摘要

### A. 核心基础能力

| 功能 | 状态 | 验证轮次 |
|---|---|---|
| 登录体系 | ✅ 已实现 | 多轮 |
| Workspace 需要登录 | ✅ 已实现 | 多轮 |
| 工具页 public | ✅ 已实现 | 多轮 |
| 游客本地保存 | ✅ 已实现 | v1.20.42.6.74.11 |
| 文档保存/恢复 | ✅ 已实现 | 多轮 |
| userId 隔离 | ✅ 已实现 | 多轮 |
| TaskChain 边界 | ✅ 已实现 | 多轮 |

### B. 文档工具

| 工具 | 状态 | 说明 |
|---|---|---|
| Commercial Invoice | ✅ 稳定 | 保存/Workspace/恢复已验证 |
| Quote Sheet | ✅ 稳定 | 保存/Workspace/恢复已验证 |
| Packing List | ⚠️ 可用 | 公司资料复用未实现 |
| Proforma Invoice | ⚠️ 可用 | Word 已修复，公司资料复用未实现 |

### C. 计算工具

| 工具 | 状态 | 说明 |
|---|---|---|
| Container / CBM | ✅ 已修复 | 计算逻辑正确 |
| HS Code | ✅ 已修复 | 英文查询已修复 |
| Postal Code | ⚠️ 基础可用 | 增强未完成 |
| Shipping Calculator | ⚠️ 基础可用 | 联动未完成 |
| Exchange Rate | ⚠️ 基础可用 | 联动未完成 |

---

## 四、未实现功能摘要

### A. 公司资料复用（Beta 缺口）

| 工具 | 状态 | 说明 |
|---|---|---|
| Packing List | ❌ 未实现 | 无公司资料选择器 UI |
| Proforma Invoice | ❌ 未实现 | 无公司资料选择器 UI |

### B. 工具间联动

| 联动 | 状态 | 说明 |
|---|---|---|
| Container → Packing List | ❌ 未实现 | S1 |
| Quote Sheet → Proforma Invoice | ❌ 未实现 | S1 |
| Exchange Rate → Quote/Invoice | ❌ 未实现 | S4 |
| Shipping Calculator → Container | ❌ 未实现 | S1 |

### C. 工具增强

| 工具 | 增强内容 | 状态 | Sprint |
|---|---|---|---|
| Postal Code | 地址格式化增强 | ❌ 未开始 | S2 |
| HS Code | 查询历史/收藏/申报指引 | ❌ 未开始 | S3 |
| Exchange Rate | 报价联动 | ❌ 未开始 | S4 |
| URL Navigation | 人群/国家/场景/官方标识 | ❌ 未开始 | S5/S6 |

---

## 五、已知 Beta 缺口

### 阻塞 Beta 恢复的缺口

| 缺口 | 状态 | 阻塞原因 |
|---|---|---|
| Packing List 公司资料复用 | ❌ 未实现 | 用户体验不完整 |
| Proforma Invoice 公司资料复用 | ❌ 未实现 | 用户体验不完整 |
| 工具间联动 | ❌ 未实现 | 核心价值未体现 |
| URL Navigation polish | ❌ 未开始 | 产品定位未明确 |

### 不阻塞 Beta 但影响体验的缺口

| 缺口 | 状态 | 影响 |
|---|---|---|
| Postal Code 增强 | ❌ 未开始 | 功能不完整 |
| HS Code 查询历史 | ❌ 未开始 | 用户体验不完整 |
| Exchange Rate 联动 | ❌ 未开始 | 工具价值未最大化 |

---

## 六、游客 / 登录用户权限边界

### 游客可以

- ✅ 打开工具页
- ✅ 填写表单
- ✅ 本机暂存 / localStorage 保存
- ✅ 刷新后恢复本地草稿
- ✅ 打印
- ✅ 导出 Word / PNG / PDF

### 游客不可以

- ❌ 保存到 Workspace
- ❌ 查看 Workspace
- ❌ 云端同步
- ❌ 多设备恢复

### 登录用户可以

- ✅ 本机暂存
- ✅ 保存到 Workspace
- ✅ Workspace 查看历史
- ✅ Workspace 恢复
- ✅ 云端同步

---

## 七、后续 Sprint 顺序

### S1: Container + Shipping no-migration 联动

**目标**: 实现 Container → Packing List 导入，Shipping Calculator → Container 联动

**范围**:
- Container 计算结果可导入 Packing List
- Shipping Calculator 可调用 Container 计算
- Quote Sheet → Proforma Invoice 导入

**禁止**:
- ❌ 不得新增 migration
- ❌ 不得修改 Prisma schema
- ❌ 不得改动 Workspace

### S2: Postal Code / Address Helper

**目标**: 地址格式化增强

**范围**:
- 地址自动格式化
- 国家/城市自动补全
- 地址验证

### S3: HS Code 查询历史 / 收藏 / 申报指引

**目标**: HS Code 工具增强

**范围**:
- 查询历史（localStorage）
- 收藏功能
- 申报指引

### S4: Exchange Rate 报价 / Invoice 辅助

**目标**: 汇率联动

**范围**:
- Quote/Invoice 自动汇率填充
- 历史汇率查询

### S5: URL Navigation no-migration polish

**目标**: URL 导航增强（无 migration）

**范围**:
- 人群标识
- 国家标识
- 场景标识

### S6: URL Navigation migration preflight

**目标**: URL 导航增强（需要 migration）

**范围**:
- 官方标识
- 数据库表扩展

### S7: Packing List / Proforma Beta+ 收口

**目标**: 解决 Beta 缺口

**范围**:
- Packing List 公司资料复用 UI
- Proforma Invoice 公司资料复用 UI

---

## 八、每轮开发前必须读取的文件

1. **项目长期记忆**: `docs/PROJECT_MEMORY.md`
2. **开发护栏**: `docs/DEVELOPMENT_GUARDRAILS.md`
3. **本文档**: `reports/product-roadmap/current-system-state-and-next-direction.md`

---

## 九、下一步建议

### 当前建议

1. **人工验证核心功能**（需用户手动执行）
   - 游客本地保存
   - 登录用户 Workspace 保存
   - Container 计算
   - HS Code 查询

2. **解决 Beta 缺口**（S7）
   - Packing List 公司资料复用 UI
   - Proforma Invoice 公司资料复用 UI

3. **进入 S1**（用户批准后）
   - Container + Shipping 联动
   - Quote → Proforma 导入

### 不建议

- ❌ 恢复 Beta（Beta 缺口未解决）
- ❌ 进入 S1（需先解决 Beta 缺口）
- ❌ 公开推广（核心功能未稳）

---

**本文档是当前系统状态的全面审计，每轮开发前必须读取。**
