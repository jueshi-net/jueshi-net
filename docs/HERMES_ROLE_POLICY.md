# Hermes Role Policy — v1.20.42.18.6.6.5.1

> **READ FIRST:** `docs/HERMES_ALWAYS_READ.md` — this is the mandatory entry point for all Hermes tasks.

## 双模式制度

每次任务开头必须声明 `CURRENT_MODE`。未声明则只做只读审计或先询问用户。

See also: `docs/HERMES_ALWAYS_READ.md` (always-read policy), `docs/STAGING_FIRST_POLICY.md` (staging-first enforcement).

---

## A. HERMES DEV MODE

```
CURRENT_MODE=DEV
TARGET_ENV=staging
TARGET_SERVER=192.129.155.149
TARGET_DOMAIN=i.jueshi.net
FORBID_PRODUCTION=true
```

### 职责
- 新功能开发、页面改版、UI 调整、Bug 修复
- 后台功能开发、内容草稿生成
- 专题/文章/清单草稿整理
- 只部署到 i.jueshi.net (staging)
- 生成请求上线报告

### 允许范围
| 项目 | 值 |
|------|-----|
| Server | 192.129.155.149 |
| Domain | i.jueshi.net |
| Branch | feature/* 或 staging |
| PM2 | xixiong-staging |
| DB | xixiong_staging |
| App path | /home/deploy/xixiong-saas-staging |

### 禁止
- 不得操作 104.250.109.99 (production)
- 不得部署 jueshi.net
- 不得操作 production DB
- 不得改 production .env
- 不得切 DNS
- 不得重启 production PM2
- 不得执行 production migration
- 不得将未验收内容发布到 production

---

## B. HERMES OPS MODE

```
CURRENT_MODE=OPS
TARGET_ENV=production
TARGET_SERVER=104.250.109.99
TARGET_DOMAIN=jueshi.net
REQUIRES_USER_APPROVAL=true
```

### 职责
- 生产备份、生产发布、生产 smoke test
- migration deploy
- Nginx/PM2/SSL 维护
- 回滚、日志观察、发布报告
- 旧服务器下线/热备管理

### 允许范围
| 项目 | 值 |
|------|-----|
| Server | 104.250.109.99 |
| Domain | jueshi.net |
| Branch | main |
| PM2 | xixiong-saas (production) |
| DB | production DB |

### 禁止
- 不得开发新功能
- 不得改 UI
- 不得新增业务模块
- 不得把 staging 未验收代码发生产
- 不得绕过备份
- 不得绕过 smoke test
- 不得绕过用户确认

---

## 环境标记

每个服务器有 `/etc/jueshi-environment` 文件：

**Production (104.250.109.99):**
```
environment=production
server_role=production
domain=jueshi.net
allowed_pm2=xixiong-saas
forbid_dev=true
```

**Staging (192.129.155.149):**
```
environment=staging
server_role=staging_hotstandby
domain=i.jueshi.net
allowed_pm2=xixiong-staging
forbid_prod_deploy=true
```

所有部署脚本必须读取此文件，环境不匹配时 `exit 1`。
