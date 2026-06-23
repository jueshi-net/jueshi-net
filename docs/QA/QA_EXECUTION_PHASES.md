# QA 执行阶段计划 — v1.20.42.18.6.6.7

**Date:** 2026-06-23

---

## Phase 0: 生产健康只读检查 (15-30分钟)

| 项目 | 说明 |
|------|------|
| 谁测 | Hermes / 用户 |
| 在哪里 | Production (https://jueshi.net) |
| 可写 | ❌ 只读 |
| 通过标准 | 全部路由 200, PM2 online, Nginx 0 502, SSL 有效 |
| 阻塞标准 | 任何路由非 200, PM2 offline, SSL 过期 |
| 输出物 | 生产健康检查记录 |

检查项: /, /destinations, /destinations/canada, /tools/postal-code, /bbs, /admin, PM2, Nginx, SSL, deploy-version

---

## Phase 1: 核心前台 Smoke Test (30-60分钟)

| 项目 | 说明 |
|------|------|
| 谁测 | 用户 / Hermes |
| 在哪里 | Production + Staging |
| 可写 | ❌ 只读 |
| 通过标准 | 核心页面全部 200 + 关键元素可见 + 无 JS 错误 |
| 阻塞标准 | 核心页面打不开, 关键元素缺失 |
| 输出物 | Smoke test 记录 + 截图 |

检查项: 首页布局, 国家列表, Canada 页面, US 页面, 邮编工具, BBS 首页, BBS 帖子详情, 登录页, 静态资源, 移动端视口

---

## Phase 2: Staging 可写全流程测试 (2-4小时)

| 项目 | 说明 |
|------|------|
| 谁测 | 用户 |
| 在哪里 | Staging (https://i.jueshi.net) |
| 可写 | ✅ 可写 |
| 通过标准 | 核心可写流程 100% 通过 (登录, 发帖, 回复, 邮编查询, 任务链) |
| 阻塞标准 | 登录失败, 发帖失败, 邮编查询错误 |
| 输出物 | 测试执行记录 + 缺陷记录 |

检查项: 登录/登出, 邮编工具全用例, BBS 发帖/回复/点赞/收藏/举报, 后台 CRUD, 内容发布, 任务链, 文件上传, 安全测试

---

## Phase 3: 后台管理测试 (2-4小时)

| 项目 | 说明 |
|------|------|
| 谁测 | 用户 (需 admin 权限) |
| 在哪里 | Staging |
| 可写 | ✅ 可写 |
| 通过标准 | 后台关键保存 100% 通过, 权限拒绝正确 |
| 阻塞标准 | 后台无法访问, 保存失败, 权限绕过 |
| 输出物 | 后台测试记录 + 截图 |

检查项: 用户管理, 帖子管理, 评论管理, 举报管理, 勋章管理(含上传), 国家页配置, 广告位, 官方链接, FAQ, 文章/专题/清单, 模块排序, 表单校验, 删除确认

---

## Phase 4: 移动端和兼容测试 (2-3小时)

| 项目 | 说明 |
|------|------|
| 谁测 | 用户 |
| 在哪里 | Production + Staging |
| 可写 | Staging 可写 |
| 通过标准 | 375px 无横向溢出, 按钮可点, 表单可用 |
| 阻塞标准 | 横向溢出, 按钮不可点, 导航不可用 |
| 输出物 | 移动端测试记录 + 截图 |

检查项: iPhone Safari 375px, Android Chrome 360px, iPad, 桌面窄屏 768px, 首页/国家页/邮编/BBS/登录/后台

---

## Phase 5: SEO/安全/权限测试 (2-4小时)

| 项目 | 说明 |
|------|------|
| 谁测 | Hermes / 用户 |
| 在哪里 | Production + Staging |
| 可写 | Staging 可写 |
| 通过标准 | SEO 无严重错误, 权限无绕过, 无 XSS |
| 阻塞标准 | canonical 错误, 权限绕过, XSS 成功 |
| 输出物 | SEO/安全测试记录 |

检查项: title/description/canonical/robots/sitemap, staging noindex, production index, 未登录 API, 非 admin API, XSS, IDOR, 路径穿越, 敏感字段

---

## Phase 6: 内容发布演练 (1-2小时)

| 项目 | 说明 |
|------|------|
| 谁测 | 用户 |
| 在哪里 | Staging |
| 可写 | ✅ 可写 |
| 通过标准 | 草稿→预览→发布→归档 全流程通过 |
| 阻塞标准 | 发布失败, SEO 字段不保存 |
| 输出物 | 内容发布演练记录 |

检查项: 新建草稿, 编辑, SEO 字段, 预览, 发布, 归档, 关联内容, 图片, XSS 输入

---

## Phase 7: 运维/备份/回滚演练 (2-4小时)

| 项目 | 说明 |
|------|------|
| 谁测 | Hermes (OPS MODE) |
| 在哪里 | Production (只读检查) + 本地 |
| 可写 | ❌ Production 只读 |
| 通过标准 | 备份可执行, 回滚脚本存在, 监控状态已知 |
| 阻塞标准 | 备份失败, 回滚脚本缺失 |
| 输出物 | 运维检查记录 |

检查项: PM2, Nginx, PostgreSQL, SSL, certbot, UFW, Fail2ban, backup (iCloud), restore rehearsal, health check, monitoring, disk, memory, Cloudflare, DNS, rollback 脚本, smoke-test 脚本, 环境标记

---

## Phase 8: 上线前回归 (30-60分钟)

| 项目 | 说明 |
|------|------|
| 谁测 | Hermes |
| 在哪里 | Production |
| 可写 | ❌ 只读 |
| 通过标准 | Smoke test 100% 通过 |
| 阻塞标准 | 任何 smoke test 项失败 |
| 输出物 | 上线前回归记录 |

检查项: 核心路由 200, PM2 online, Nginx 0 502, SSL 有效, deploy-version 确认

---

## Phase 9: 上线后观察 (24小时)

| 项目 | 说明 |
|------|------|
| 谁测 | Hermes (自动) + 用户 |
| 在哪里 | Production |
| 可写 | ❌ 只读 |
| 通过标准 | 24h 内无 P0/P1, PM2 restart < 3, Nginx 0 502 |
| 阻塞标准 | P0 出现, PM2 频繁重启, Nginx 502 |
| 输出物 | 观察期报告 |

检查项: PM2 状态, Nginx error log, 用户反馈, 功能抽检
