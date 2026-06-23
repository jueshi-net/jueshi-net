# Hermes Task Templates — v1.20.42.18.6.6.5

## 模板一: DEV MODE

```
CURRENT_MODE=DEV
TARGET_ENV=staging
TARGET_SERVER=192.129.155.149
TARGET_DOMAIN=i.jueshi.net
FORBID_PRODUCTION=true
```

**用途:** 开发、预览、内容草稿、staging 验收

**开始前检查:**
1. 确认在 192.129.155.149
2. 确认操作 /home/deploy/xixiong-saas-staging
3. 确认 PM2 app = xixiong-staging
4. 确认 DB = xixiong_staging
5. 确认 branch = staging 或 feature/*
6. 不得 SSH 到 104.250.109.99

**完成后:**
1. staging smoke test
2. 生成上线请求报告
3. 等待用户确认后才能进入 production

---

## 模板二: OPS MODE

```
CURRENT_MODE=OPS
TARGET_ENV=production
TARGET_SERVER=104.250.109.99
TARGET_DOMAIN=jueshi.net
REQUIRES_USER_APPROVAL=true
```

**用途:** 生产发布、备份、回滚、监控、SSL/Nginx/PM2 维护

**开始前检查:**
1. 确认在 104.250.109.99
2. 确认操作 /home/deploy/xixiong-saas
3. 确认 PM2 app = xixiong-saas (production)
4. 确认 DB = production DB
5. 确认 branch = main
6. 已获得用户明确批准

**完成后:**
1. production smoke test
2. 更新 deploy-version.json
3. 记录 PM2 restart count
4. 生成发布报告
5. 观察 24h

---

## 未声明模式的处理

如果任务不包含 `CURRENT_MODE`:
- Hermes 必须只做只读审计
- 或先询问用户确认模式
- 不得执行高风险操作
