# Production Test Account Limits — v18.6.6.8

**Date:** 2026-06-23
**CURRENT_MODE:** AUDIT

---

## 1. Production 账号限制

| 账号 | 角色 | 操作限制 |
|------|------|----------|
| 9833416@qq.com | admin | 只读，不保存任何表单，不修改任何设置 |
| test@jueshi.net | user | 不在 production 登录，仅在 staging 使用 |

**Production 禁止：**
- 不创建任何新账号
- 不修改任何已有账号
- 不删除任何账号
- 不重置任何密码
- 不执行 prisma db push

## 2. Production 临时普通账号安全边界

| # | 边界规则 | 违反后果 |
|---|----------|----------|
| 1 | production 临时普通账号不能进 admin | 如果能进 admin → **P0 权限漏洞** |
| 2 | production 临时账号不应看到其他用户敏感邮箱 | 违反 → **P0 数据泄露** |
| 3 | production 临时账号不应修改站点配置 | 违反 → **P0 权限越界** |
| 4 | production 临时账号不应访问 admin APIs | 违反 → **P0 API 权限漏洞** |
| 5 | production 临时账号不应上传可执行文件 | 违反 → **P0 安全漏洞** |
| 6 | production 临时账号不应触发真实邮件轰炸 | 违反 → **P1 邮件滥用** |
| 7 | production 临时账号如允许发帖，应先由用户确认 | 未经确认发帖 → **P1 违规操作** |
| 8 | 默认 production 不执行发帖/回复等写操作 | 违反 → **P0 生产数据污染** |
| 9 | 需要写操作时请改到 staging | production 写操作必须先获用户批准 |

## 3. Staging 临时账号

| 账号 | 角色 | ID | 创建方式 | 用途 |
|------|------|----|----------|------|
| audit-tester@jueshi.net | user | audit-tester-001 | SQL INSERT (bcrypt hash) | 普通用户流程测试 |
| audit-admin@jueshi.net | admin | audit-admin-001 | SQL INSERT (bcrypt hash) | 管理员流程测试 |

**密码：不在仓库中存储，通过 Telegram 私聊发送。**

**重要：staging admin 仅存在于 staging (i.jueshi.net)，production (jueshi.net) 无此账号。**

## 4. Staging 账号创建验证

| 检查项 | 结果 |
|--------|------|
| audit-tester@jueshi.net 创建 | ✅ (INSERT 0 1) |
| audit-admin@jueshi.net 创建 | ✅ (INSERT 0 1) |
| role=user count | 28 (原 27 + 1) |
| role=admin count | 5 (原 4 + 1) |
| role=member count | 0 ✅ |
| 9833416@qq.com 未修改 | ✅ (admin, chenran) |
| 总用户数 | 33 |

## 5. 账号回收方案

### 5.1 回收时机

- 人工测试全部完成
- 或测试结束后 7 天（以先到者为准）
- 或用户要求立即回收

### 5.2 回收 SQL

```sql
-- 在 staging DB 执行（NOT production）
-- 删除临时审计账号
DELETE FROM users WHERE email IN (
  'audit-tester@jueshi.net',
  'audit-admin@jueshi.net'
);

-- 验证删除
SELECT email, role FROM users WHERE email LIKE 'audit-%';
-- 预期：0 rows

-- 验证 role=member 仍为 0
SELECT COUNT(*) FROM users WHERE role = 'member';
-- 预期：0

-- 验证 9833416@qq.com 未受影响
SELECT email, role FROM users WHERE email = '9833416@qq.com';
-- 预期：admin
```

### 5.3 回收后检查

| 检查项 | 预期结果 |
|--------|----------|
| audit-tester@jueshi.net 不存在 | ✅ |
| audit-admin@jueshi.net 不存在 | ✅ |
| role=member 仍为 0 | ✅ |
| 9833416@qq.com 仍为 admin | ✅ |
| 总用户数恢复 31 | ✅ |
| 无残留 session | 需检查 sessions 表 |

### 5.4 回收执行人

由 Hermes 执行或由用户手动执行。执行前需确认：
- CURRENT_MODE = OPS
- TARGET_ENV = staging
- 用户已确认

## 6. 安全约束

| 约束 | 状态 |
|------|------|
| 不在仓库存储密码 | ✅ |
| 不在仓库存储 DATABASE_URL | ✅ |
| 不在仓库存储任何 token/key | ✅ |
| 不在 production 创建账号 | ✅ |
| 不修改 9833416@qq.com | ✅ |
| 不执行 prisma db push | ✅ |
| 不执行 destructive SQL | ✅ (回收时 DELETE 仅限 staging) |
| staging admin 不存在于 production | ✅ |
