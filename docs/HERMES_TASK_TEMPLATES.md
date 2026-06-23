# Hermes Task Templates — v1.20.42.18.6.6.5.1

> **READ_FIRST:** Every task template below requires reading these files before execution:
> 1. `docs/HERMES_ALWAYS_READ.md`
> 2. `docs/HERMES_ROLE_POLICY.md`
> 3. `docs/STAGING_FIRST_POLICY.md`

---

## READ_FIRST (all templates)

```
READ_FIRST:
  - docs/HERMES_ALWAYS_READ.md
  - docs/HERMES_ROLE_POLICY.md
  - docs/STAGING_FIRST_POLICY.md
```

---

## 模板一: DEV MODE

```
READ_FIRST:
  - docs/HERMES_ALWAYS_READ.md
  - docs/HERMES_ROLE_POLICY.md
  - docs/STAGING_FIRST_POLICY.md
CURRENT_MODE=DEV
TARGET_ENV=staging
TARGET_SERVER=192.129.155.149
TARGET_DOMAIN=i.jueshi.net
FORBID_PRODUCTION=true
```

**用途:** 开发、预览、内容草稿、staging 验收

**开始前检查:**
1. 读取 READ_FIRST 文件
2. 确认在 192.129.155.149
3. 确认操作 /home/deploy/xixiong-saas-staging
4. 确认 PM2 app = xixiong-staging
5. 确认 DB = xixiong_staging
6. 确认 branch = staging 或 feature/*
7. 不得 SSH 到 104.250.109.99

**完成后:**
1. staging smoke test
2. 生成上线请求报告
3. 等待用户确认后才能进入 production

---

## 模板二: OPS MODE

```
READ_FIRST:
  - docs/HERMES_ALWAYS_READ.md
  - docs/HERMES_ROLE_POLICY.md
  - docs/STAGING_FIRST_POLICY.md
CURRENT_MODE=OPS
TARGET_ENV=production
TARGET_SERVER=104.250.109.99
TARGET_DOMAIN=jueshi.net
REQUIRES_USER_APPROVAL=true
```

**用途:** 生产发布、备份、回滚、监控、SSL/Nginx/PM2 维护

**开始前检查:**
1. 读取 READ_FIRST 文件
2. 确认已获得用户明确批准
3. 确认在 104.250.109.99
4. 确认操作 /home/deploy/xixiong-saas
5. 确认 PM2 app = xixiong-saas (production)
6. 确认 DB = production DB
7. 确认 branch = main

**完成后:**
1. production smoke test
2. 更新 deploy-version.json
3. 记录 PM2 restart count
4. 生成发布报告
5. 观察 24h

---

## 模板三: AUDIT MODE

```
READ_FIRST:
  - docs/HERMES_ALWAYS_READ.md
  - docs/HERMES_ROLE_POLICY.md
  - docs/STAGING_FIRST_POLICY.md
CURRENT_MODE=AUDIT
READ_ONLY=true
NO_DEPLOY=true
NO_DB_WRITE=true
NO_DNS_CHANGE=true
```

**用途:** 只读审计、状态检查、风险评估、计划生成

**开始前检查:**
1. 读取 READ_FIRST 文件
2. 确认只读模式
3. 不部署、不重启、不修改 DB、不切 DNS

**完成后:**
1. 生成审计报告
2. 列出建议和风险
3. 等待用户确认下一步

---

## 未声明模式的处理

如果任务不包含 `CURRENT_MODE`:
- Hermes MUST default to AUDIT mode (read-only)
- Hermes MUST ask user to confirm mode before doing anything beyond read-only
- Hermes MUST NOT execute any high-risk operations
