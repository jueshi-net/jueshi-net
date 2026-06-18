# Changelog v1.20.42.8.0 — Beta 基线冻结

**发布日期**: 2026-06-18  
**版本**: v1.20.42.8.0-beta-baseline  
**Tag**: `v1.20.42.8.0-beta-baseline`

---

## 📋 版本概述

本版本为 Beta 基线冻结版本，标记小范围 Beta 测试的起始点。所有核心功能已完成并验证，进入稳定观察期。

---

## ✨ 新增功能

### 密码重置功能（v1.20.42.7.09.2.1）

- ✅ 实现完整的密码重置流程
- ✅ 支持邮箱发送重置链接
- ✅ 支持 token 验证和过期检查
- ✅ 支持二次使用检测
- ✅ 支持 used_at 字段记录使用时间
- ✅ 通过真实邮箱 E2E 测试

### 品牌改名（v1.20.42.6.55-Y-R）

- ✅ 全站品牌名从"海外百宝箱"改为"绝世百宝箱"
- ✅ 更新所有页面标题和描述
- ✅ 更新邮件模板
- ✅ 更新 OG/Twitter 元数据

### Forum 反垃圾（v1.20.42.6.51-U ~ 6.55-Y）

- ✅ 新增发帖频率限制（1 分钟）
- ✅ 新增评论频率限制（3 分钟）
- ✅ 新增重复内容检测（24 小时）
- ✅ 新增每日发帖/评论上限

### 主题色更新（v1.20.42.6.55-Y-R）

- ✅ 主题色从 teal 改为 navy
- ✅ 更新 favicon 和 apple-touch-icon
- ✅ 更新 OG 图片

---

## 🔧 改进优化

### metadataBase 修复（v1.20.42.7.14）

- ✅ 添加 metadataBase 到 layout.tsx
- ✅ 解决社交图片 URL 解析 warning

### Build 脚本改进（v1.20.42.7.12）

- ✅ 添加 check-build-env.mjs 前置检查
- ✅ 防止开发环境配置泄漏到生产

### API 改进（多个版本）

- ✅ Forum API 扩展（反垃圾）
- ✅ 工具文档 API 改进
- ✅ 资源 API 改进
- ✅ HS Code API 微调

### Workspace 设置扩展（多个版本）

- ✅ 设置页扩展
- ✅ 文档页微调
- ✅ 品牌改名

---

## 🐛 Bug 修复

### 密码重置 E2E 验证（v1.20.42.7.09.2.1）

- ✅ 修复新密码登录成功验证
- ✅ 修复旧密码失效验证
- ✅ 修复二次使用链接失效验证
- ✅ 修复 token/API 验证

### 邮箱投递验证（v1.20.42.7.09.2.1）

- ✅ 修复 Resend API 调用
- ✅ 修复邮件模板渲染
- ✅ 修复邮件投递状态检查

---

## 📊 数据库变更

### 新增表

- `password_reset_tokens` — 密码重置 token 表
  - `id` (cuid)
  - `userId` (关联 User)
  - `tokenHash` (unique)
  - `expiresAt`
  - `usedAt` (nullable)
  - `createdAt`
  - `requestIp` (nullable)
  - `userAgent` (nullable)
  - 3 个 index：userId, expiresAt, usedAt

### 新增 Migration

- `20260612020000_restore_builtin_forum` — 恢复 Forum 内置表
- `20260617_add_password_reset_token` — 添加密码重置 token 表

---

## 🚀 部署说明

### 部署步骤

1. **拉取最新代码**
   ```bash
   git pull origin main
   git checkout v1.20.42.8.0-beta-baseline
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **执行数据库迁移**
   ```bash
   npx prisma migrate deploy
   ```

4. **构建项目**
   ```bash
   npm run build
   ```

5. **重启服务**
   ```bash
   pm2 restart xixiong-saas
   ```

### 环境变量

新增环境变量（已在 .env.production 中配置）：

- `RESEND_API_KEY` — Resend 邮件服务 API key
- `MAIL_FROM` — 发件人邮箱
- `MAIL_FROM_NAME` — 发件人名称

---

## 📝 已知问题

### P2 低风险（观察）

1. **validate-sso warning**
   - Auth.js 默认行为，不影响核心功能
   - 状态：观察

2. **Server Action warning**
   - 用户使用旧版本页面，刷新即可解决
   - 状态：观察

3. **MissingCSRF warning**
   - 浏览器缓存或跨域问题
   - 状态：观察

4. **VPS Git 状态**
   - VPS 是 rsync 部署目录，git 状态不影响生产
   - 状态：观察

---

## 📈 性能指标

### 系统资源

- **CPU**: 0%（空闲）
- **内存**: 73.3mb（PM2）
- **磁盘**: 83%（< 85%）
- **负载**: 1.17-1.26

### 核心 URL 状态

| URL | 状态 |
|---|---|
| https://jueshi.net/ | ✅ 200 |
| https://jueshi.net/resources | ✅ 200 |
| https://jueshi.net/tracking | ✅ 200 |
| https://jueshi.net/forgot-password | ✅ 200 |
| https://jueshi.net/login | ✅ 200 |
| https://jueshi.net/feedback | ✅ 200 |

---

## 🔒 安全更新

- ✅ 密码重置 token 使用 SHA256 哈希存储
- ✅ 密码重置 token 1 小时过期
- ✅ 密码重置 token 只能使用一次
- ✅ 密码重置请求记录 IP 和 User-Agent

---

## 📚 文档更新

- ✅ 更新 RESTORE.md — Beta 基线恢复指南
- ✅ 更新 LOCAL_DOWNLOAD.md — Beta 基线本地下载指南
- ✅ 更新 CHANGELOG.md — 本文件

---

## 🎯 Beta 测试计划

### 测试范围

- **用户数**: 5-10 人
- **观察期**: 3-7 天
- **邀请方式**: 私下邀请，不公开推广

### 测试重点

1. 注册/登录/找回密码
2. 邮件投递
3. 页面性能
4. 系统监控
5. 磁盘增长
6. 数据库备份

### Beta 暂停条件

- 注册/登录失败率 > 5%
- 找回密码失败率 > 10%
- 邮件投递失败率 > 5%
- PM2 频繁重启（> 10 次/天）
- UptimeRobot 告警
- 数据库连接失败
- 页面 5xx 错误率 > 1%

---

## 📄 备份信息

### Beta 基线备份

- **备份目录**: `/home/deploy/backups/beta-baseline-v1.20.42.8.0`
- **数据库备份**: `bxb_prod_beta_baseline_20260618_022630.dump` (941M)
- **环境变量 key 清单**: `env-keys_20260618_022630.txt`
- **MANIFEST**: `MANIFEST.txt`
- **SHA256**: `SHA256.txt`

### 恢复指南

- **RESTORE.md**: Beta 基线恢复指南
- **LOCAL_DOWNLOAD.md**: Beta 基线本地下载指南

---

## 🔄 版本对比

| 版本 | 日期 | 说明 |
|---|---|---|
| v1.20.42.6.61-beta-ready | 2026-06-12 | 首次 Beta 就绪 |
| v1.20.42.7.09.2.1 | 2026-06-17 | 密码重置最终验收 |
| v1.20.42.7.14 | 2026-06-18 | P2 治理 |
| **v1.20.42.8.0-beta-baseline** | **2026-06-18** | **Beta 基线冻结** |

---

## 📞 联系方式

如有问题或反馈：

- **邮箱**: contact@jueshi.net
- **反馈页面**: https://jueshi.net/feedback

---

**Changelog 版本**: v1.0  
**最后更新**: 2026-06-18
