# 人工测试总方案 — v1.20.42.18.6.6.7

**Date:** 2026-06-23
**CURRENT_MODE:** AUDIT

---

## 1. 测试目标

验证 jueshi.net / xixiong-saas 全站功能的正确性、安全性、可用性和兼容性，确保生产环境稳定运行，staging 环境可用于开发验收。

## 2. 测试环境

| 环境 | 域名 | 服务器 | 测试类型 |
|------|------|--------|----------|
| Production | https://jueshi.net | 104.250.109.99 | 只读测试 |
| Staging | https://i.jueshi.net | 192.129.155.149 | 可写测试 |

## 3. 测试账号

| 账号 | 角色 | 用途 | 保护级别 |
|------|------|------|----------|
| 9833416@qq.com | admin | 后台管理测试 | 🔒 永久保护，不得修改/删除/重置 |
| test@jueshi.net | user | 普通用户测试 | 可重置 |

## 4. 测试原则

1. **真实浏览器测试 > curl/API 结果** — 真实浏览器测试结果优先于 curl/API/服务端脚本结果
2. **Production 只读** — 不得在 production 上发帖、上传、删除、改后台内容
3. **Staging-first** — 可写测试优先在 staging 执行
4. **证据必须** — 每个测试项必须有截图或记录
5. **不得用 curl 代替人肉测试** — curl 200 ≠ 用户能看到页面
6. **不得用 staging 通过代替 production 验证** — 两者独立验证

## 5. 测试范围

见 `QA_SCOPE_INVENTORY.md` — 覆盖 A-L 共 12 大类。

## 6. 不测试范围

- 不测试真实密码泄露
- 不测试支付系统（当前无）
- 不测试真实邮件发送
- 不进行压力测试/DDoS

## 7. 缺陷等级定义

### P0 — 严重 (必须立即修复)
- 生产打不开
- 登录/后台不可用
- 数据丢失
- 权限绕过
- 生产 DB 风险
- 支付/邮件/严重安全

### P1 — 高 (必须在上线前修复)
- 核心功能不可用
- 邮编查询错误
- BBS 发帖/回复核心失败
- 后台保存失败
- 国家页关键模块错误
- SEO 严重错误

### P2 — 中 (可记录后修复)
- UI 错位
- 文案错误
- 移动端体验问题
- 次要功能异常

### P3 — 低 (后续优化)
- 小文案
- 间距
- 非关键视觉细节

## 8. 测试证据规范

- 截图格式: PNG
- 截图命名: `QA-<phase>-<module>-<case_id>-<step>.png`
  - 例: `QA-P1-homepage-A01-01.png`
- 存储路径: `reports/qa-screenshots/<batch-date>/`
- 每个测试项至少 1 张截图
- P0/P1 缺陷必须附截图 + URL + 时间戳

## 9. 测试顺序

1. Phase 0: 生产健康只读检查
2. Phase 1: 核心前台 smoke test
3. Phase 2: Staging 可写全流程测试
4. Phase 3: 后台管理测试
5. Phase 4: 移动端和兼容测试
6. Phase 5: SEO/安全/权限测试
7. Phase 6: 内容发布演练
8. Phase 7: 运维/备份/回滚演练
9. Phase 8: 上线前回归
10. Phase 9: 上线后观察

详见 `QA_EXECUTION_PHASES.md`

## 10. Production 只读测试规则

- ✅ 浏览页面
- ✅ 查看源代码
- ✅ 检查 SEO 标签
- ✅ 检查控制台错误
- ✅ 检查网络请求
- ✅ 移动端视口模拟
- ✅ 检查 PM2/Nginx 状态
- ❌ 不得登录后保存任何更改
- ❌ 不得发帖/回复/上传
- ❌ 不得删除任何内容
- ❌ 不得修改后台配置
- ❌ 不得执行写操作 API

## 11. Staging 可写测试规则

- ✅ 登录/登出
- ✅ 发帖/回复/点赞
- ✅ 上传文件
- ✅ 后台 CRUD 操作
- ✅ 内容发布演练
- ✅ 创建任务链
- ⚠️ Staging 数据可被覆盖，不代表 production 数据
- ⚠️ 测试后通知清理

## 12. Production 禁止事项

- ❌ prisma db push
- ❌ destructive SQL (DROP/DELETE/TRUNCATE)
- ❌ 修改 production DB
- ❌ 重启 PM2
- ❌ reload/restart Nginx
- ❌ 修改 .env
- ❌ 切 DNS
- ❌ 安装监控
- ❌ 修改 9833416@qq.com
- ❌ 扩大 Beta
- ❌ 公开推广

## 13. 回归测试策略

- 每次修复后，重跑受影响模块的所有用例
- 每次部署后，跑 production smoke test
- 每次发布前，跑核心页面回归
- 回归范围 = 受影响模块 + 直接关联模块 + 核心页面

## 14. 冒烟测试策略

- 覆盖核心路径: / → /destinations → /destinations/canada → /tools/postal-code → /bbs → /admin
- 每条路径验证: 页面加载 200 + 关键元素可见 + 无 JS 错误
- 时间: 15-30 分钟

## 15. 发布前测试策略

1. Staging 全量测试通过
2. 用户在 i.jueshi.net 验收
3. 用户确认发布
4. Production smoke test (发布后)
5. 观察 24h

## 16. 发布后测试策略

1. Production smoke test 全部 200
2. PM2 online, restart count 正常
3. Nginx 0 个 502
4. SSL 有效
5. Deploy-version 确认
6. 观察 24h

## 17. 发现问题后的处理流程

1. 记录缺陷 (使用 BUG_REPORT_TEMPLATE.md)
2. 标记严重级别 (P0/P1/P2/P3)
3. P0: 立即停止测试，通知用户
4. P1: 记录后继续测试其他项
5. P2/P3: 记录后续处理
6. 所有缺陷汇总到测试执行记录
7. 修复后回归测试
