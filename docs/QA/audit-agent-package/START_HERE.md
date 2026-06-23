# START HERE — 审计测试智能体快速指南

**Version:** v1.20.42.18.6.6.8
**Date:** 2026-06-23

---

## 第一步：读取必读文档

1. **先读 `AUDIT_AGENT_BRIEF.md`** — 了解环境、账号、规则
2. **再读 `AGENTS.md`** — 项目规则
3. **再读 `HERMES.md`** — 工作流程
4. **再读 `HERMES_ALWAYS_READ.md`** — 强制规则
5. **再读 `STAGING_FIRST_POLICY.md`** — Staging 优先策略

## 第二步：理解测试边界

### Production (https://jueshi.net) — 只读测试
- ✅ 可以做：浏览页面、查看源码、curl 检查、移动端视口检查
- ❌ 禁止做：发帖、回复、上传、删除、修改后台、admin 操作
- ❌ 禁止做：prisma db push、destructive SQL、重启服务、切 DNS
- 如需写操作，**改到 staging 执行**

### Staging (https://i.jueshi.net) — 可写测试
- ✅ 可以做：登录、发帖、回复、点赞、收藏、举报
- ✅ 可以做：admin 后台操作、勋章上传、内容发布
- ✅ 可以做：文件上传安全测试、权限边界测试
- ⚠️ 注意：staging 数据可被覆盖，不代表 production

## 第三步：测试顺序

1. **P0 先测** (production 只读 P0 → staging 可写 P0)
2. **P1 次之** (同上)
3. **P2 再次** (同上)
4. **P3 最后** (同上)

### 如果发现 P0：
- **立即停止所有高风险测试**
- **只输出报告**，不再执行后续测试
- 报告 P0 详情：URL、步骤、实际结果、预期结果、截图/日志

## 第四步：测试账号

| 账号 | 密码 | 角色 | 环境 | 用途 |
|------|------|------|------|------|
| audit-tester@jueshi.net | (通过聊天发送) | user | staging only | 普通用户流程 |
| audit-admin@jueshi.net | (通过聊天发送) | admin | staging only | 管理员流程 |

**⚠️ 密码不在本包中。请向用户索取。**

**⚠️ 这两个账号仅在 staging (i.jueshi.net) 可用。**

## 第五步：Bug 输出格式

每个 Bug 必须包含：

```
## BUG-XXX: [标题]

- **严重级别:** P0/P1/P2/P3
- **环境:** production / staging
- **URL:** https://...
- **账号:** audit-tester / audit-admin / 未登录
- **前置条件:** xxx
- **操作步骤:**
  1. xxx
  2. xxx
- **实际结果:** xxx
- **预期结果:** xxx
- **截图:** [截图文件名]
- **Console Error:** (如有)
- **Network Error:** (如有)
- **是否可复现:** YES/NO
```

## 第六步：速率限制

- 每秒请求不超过 1-2 个
- **禁止压力测试**
- 禁止 DDoS
- 禁止批量爬取

## 第七步：测试结束后

- **提醒用户回收临时账号**
- 回收命令：`DELETE FROM users WHERE email IN ('audit-tester@jueshi.net', 'audit-admin@jueshi.net');`
- 验证：role=member 仍为 0，9833416@qq.com 仍为 admin

## 禁止事项清单

| # | 禁止项 |
|---|--------|
| 1 | 不得执行 prisma db push |
| 2 | 不得执行 destructive SQL (DROP/DELETE/TRUNCATE) |
| 3 | 不得修改 production DB |
| 4 | 不得修改 9833416@qq.com 账号 |
| 5 | 不得重置 9833416@qq.com 密码 |
| 6 | 不得重启 PM2 |
| 7 | 不得 reload/restart Nginx |
| 8 | 不得修改 .env |
| 9 | 不得切 DNS |
| 10 | 不得安装监控 |
| 11 | 不得输出 secret (DATABASE_URL, password, token, key) |
| 12 | 不得扩大 Beta |
| 13 | 不得公开推广 |
| 14 | 不得用 staging 通过代替 production 验证 |
| 15 | 不得把 curl 结果当成人肉测试通过 |
