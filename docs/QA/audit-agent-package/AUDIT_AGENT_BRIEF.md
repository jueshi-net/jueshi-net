# Audit Agent Brief — v18.6.6.8

**Date:** 2026-06-23
**CURRENT_MODE:** AUDIT

---

## 目标

本文件为人工测试执行者（Audit Agent）提供简要指引。
详细测试清单请参考 docs/QA/ 目录下的完整文档。

## 测试环境

| 环境 | URL | 用途 |
|------|-----|------|
| Production | https://jueshi.net | 只读测试 |
| Staging | https://i.jueshi.net | 可写测试 |

## 测试账号

| 账号 | 角色 | 用途 | 环境 |
|------|------|------|------|
| 9833416@qq.com | admin | 管理员测试 | Production (只读) + Staging |
| audit-tester@jueshi.net | user | 普通用户测试 | Staging |
| audit-admin@jueshi.net | admin | 管理员测试 | Staging |

**临时账号密码：通过 Telegram 私聊单独发送，不在本文件或仓库中存储。**

## 测试原则

1. Production 只读，不保存任何表单
2. Staging 可写，但数据可能被覆盖
3. 真实浏览器测试 > curl
4. 每个测试项必须有截图证据
5. 发现 P0/P1 缺陷立即停止并报告

## 测试顺序

1. Phase 0: Production 健康只读检查 (15-30 min)
2. Phase 1: 核心前台 Smoke Test (30-60 min)
3. Phase 2: Staging 可写全流程 (2-4h)
4. Phase 3: 后台管理测试 (2-4h)
5. Phase 4: 移动端测试 (2-3h)
6. Phase 5: SEO/安全测试 (2-4h)
7. Phase 6: 内容发布演练 (1-2h)
8. Phase 7: 运维/备份/回滚演练 (2-4h)

## 禁止事项

- 不得执行 prisma db push
- 不得执行 DROP / DELETE / TRUNCATE
- 不得修改 production DB
- 不得重启 PM2
- 不得修改 .env
- 不得切 DNS
- 不得修改 9833416@qq.com 账号
- 不得在仓库中存储密码/token/密钥
- 不得公开推广
- 不得扩大 Beta

## 文件清单

详见 AUDIT_AGENT_FILE_LIST.md

## 测试退出标准

详见 QA_EXIT_CRITERIA.md

## 账号回收

测试完成后，临时账号 audit-tester@jueshi.net 和 audit-admin@jueshi.net 应通过以下 SQL 回收：

```sql
-- 在 staging DB 执行
DELETE FROM users WHERE email IN ('audit-tester@jueshi.net', 'audit-admin@jueshi.net');
```

详见 PRODUCTION_TEST_ACCOUNT_LIMITS.md
