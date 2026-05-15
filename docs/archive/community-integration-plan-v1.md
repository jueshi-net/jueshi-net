# 社区/论坛整合方案 — 评估与设计

> 版本: v0.1 (调研草案)
> 日期: 2026-05-15
> 状态: 待确认
>
> 本文档为纯调研 + 方案设计，**不包含任何部署操作、数据库修改或配置变更**。

---

## 一、需求背景

海外百宝箱主站已具备工具中心、单据生成、邮编查询、出海导航等核心功能。
下一步需要社区能力，让用户能够：
- 提问求助（如物流清关问题、工具使用）
- 分享经验（如集运攻略、跨境收款心得）
- 沉淀内容（替代部分 blog 的互动属性）
- 形成用户粘性

---

## 二、候选方案对比

### 2.1 Discourse ⭐ 推荐

| 维度 | 详情 |
|------|------|
| 技术栈 | Ruby on Rails + PostgreSQL + Redis |
| 部署方式 | Docker（官方推荐） |
| 最低配置 | 2 核 / 2GB RAM（推荐 2 核 / 4GB） |
| 资源占用 | 运行时 ~1.5-2.5GB RAM，磁盘 ~10-20GB |
| SSO 支持 | 内置 DiscourseConnect（discourse_sso），成熟稳定 |
| 社区成熟度 | ⭐⭐⭐⭐⭐ 最成熟，Discourse 官方持续维护 |
| 移动端体验 | 响应式设计，PWA，体验接近原生 |
| 插件生态 | 丰富（S3 存储、SEO、反垃圾、Markdown 等） |
| 运维复杂度 | 中（Docker 部署，官方 `launcher` 管理） |

**SSO 方式：** DiscourseConnect 协议（discourse_sso）
- 用户访问论坛 → 论坛重定向到主站 `/api/forum/sso`
- 主站验证登录状态 → 返回签名 payload（包含用户 email、用户名、角色）
- 论坛验证签名 → 自动创建/更新用户 → 完成登录
- 主站是唯一的身份源头，论坛不管理密码

### 2.2 Flarum

| 维度 | 详情 |
|------|------|
| 技术栈 | PHP + MySQL/MariaDB |
| 最低配置 | 1 核 / 512MB RAM |
| 资源占用 | ~200-400MB RAM，磁盘 ~1-2GB |
| SSO 支持 | 通过扩展（fof/oauth-client），非官方内置 |
| 社区成熟度 | ⭐⭐⭐ 中等，活跃但偶有版本兼容问题 |
| 移动端体验 | 响应式，但交互不如 Discourse 流畅 |
| 运维复杂度 | 低（传统 PHP 部署） |

**不推荐原因：** SSO 依赖第三方扩展，主站会员体系整合不够稳定，且社区规模较小。

### 2.3 NodeBB

| 维度 | 详情 |
|------|------|
| 技术栈 | Node.js + MongoDB/PostgreSQL + Redis |
| 最低配置 | 1 核 / 1GB RAM |
| 资源占用 | ~400-800MB RAM，磁盘 ~2-5GB |
| SSO 支持 | 内置 OAuth2/JWT 插件 |
| 社区成熟度 | ⭐⭐⭐⭐ 良好，但近年发展放缓 |
| 移动端体验 | 响应式，实时通信体验好 |
| 运维复杂度 | 中（需要 MongoDB，与主栈不完全一致） |

**不推荐原因：** 偏好 MongoDB 而非 PostgreSQL，与主站技术栈不一致；实时通信对当前需求来说非必需。

---

## 三、推荐方案：Discourse

### 3.1 为什么推荐 Discourse

1. **SSO 最成熟**：内置 discourse_sso 协议，主站作为 SSO Provider 的实现简单可靠
2. **社区最大**：插件、主题、安全更新持续不断
3. **移动端最好**：海外华人多用手机访问，Discourse 移动端体验最优
4. **内容沉淀能力强**：分类、标签、搜索、引用、回复通知等机制完善
5. **反垃圾成熟**：Trust Level 系统自动过滤新用户垃圾内容

### 3.2 部署架构

```
用户浏览器
    │
    ├── https://jueshi.net（主站，Next.js，PM2，端口 3000）
    │
    └── https://forum.jueshi.net（论坛，Discourse，Docker，端口 2000）
              │
              ├── Discourse PostgreSQL（独立数据库，端口 5433）
              ├── Redis（独立，端口 6380）
              └── Discourse Web/Worker（容器内）
```

**关键原则：**
- 论坛作为**独立服务**部署，不嵌入主站
- 子域名 `forum.jueshi.net`（或 `club.jueshi.net`）
- 论坛拥有自己的 PostgreSQL 实例，**不与主站共享数据库**
- 主站通过 SSO 协议向论坛提供用户身份，论坛不存储密码

### 3.3 部署位置评估

| 方案 | 优点 | 缺点 | 推荐度 |
|------|------|------|--------|
| **同 VPS 部署**（RackNerd 8GB） | 成本低，运维简单 | 内存紧张（主站 + Discourse 共需 ~4-5GB） | ⚠️ 可用但不推荐 |
| **单独 VPS**（2 核 / 4GB） | 互不影响，性能稳定 | 额外成本（约 $10-15/月） | ✅ **推荐** |
| **托管 Discourse**（discourse.host） | 零运维 | 较贵（$25+/月），自定义受限 | ⚠️ 适合后期 |

**建议：** 初期可同 VPS 部署（8GB 勉强够用），用户增长到日活 100+ 后迁移到独立 VPS。

**同 VPS 部署内存估算：**
- 主站 Next.js：~100-200MB
- 主站 PostgreSQL：~300-500MB
- Discourse Web：~800-1200MB
- Discourse Sidekiq：~400-800MB
- Discourse PostgreSQL：~300-500MB
- Redis (论坛)：~50MB
- 系统 + Nginx：~200MB
- **总计：~2.2-3.5GB（可用 6.9GB，有余量）**

---

## 四、SSO 整合设计

### 4.1 身份流向

```
用户访问 forum.jueshi.net
    ↓
论坛未登录 → 重定向到 jueshi.net/api/forum/sso?sso=XXX&sig=YYY
    ↓
主站验证用户登录状态
    ├── 未登录 → 跳转到 /login，登录后自动回到 SSO 流程
    └── 已登录 → 生成 DiscourseConnect payload，重定向回论坛
    ↓
论坛验证签名 → 自动创建/更新用户 → 完成登录
```

### 4.2 SSO Payload 格式

```
base64(
  nonce=xxx
  &email=user@example.com
  &external_id=cmp68yjhv0000u05ppp4aym6g
  &username=张三
  &name=张三
  &avatar_url=https://jueshi.net/avatars/xxx.jpg
  &admin=false
  &moderator=false
)
```

### 4.3 签名方式

```
HMAC-SHA256(base64_payload, DISCOURSE_SSO_SECRET)
```

主站和论坛共享同一个 `DISCOURSE_SSO_SECRET`（随机生成，不对外暴露）。

### 4.4 主站端实现

需要在主站新增一个 API 路由：

```
GET  /api/forum/sso        → DiscourseConnect SSO 入口
POST /api/forum/webhook    → 论坛同步回调（可选，用于用户信息更新）
```

---

## 五、用户角色映射

### 5.1 当前主站角色

| 主站角色 | 说明 |
|----------|------|
| `guest` | 未登录用户 |
| `user` | 注册用户（免费） |
| `member` | 付费会员 |
| `admin` | 管理员 |

### 5.2 论坛角色映射

| 主站角色 | Discourse 组 | 权限说明 |
|----------|-------------|----------|
| `guest` | 无法访问论坛 | 论坛强制登录 |
| `user` | `trust_level_0` (新用户) | 可阅读、发帖、回复，有限制（反垃圾） |
| `member` | `trust_level_1` + `会员组` | 无发帖限制，可上传附件，专属标签 |
| `admin` | `admin` + `moderators` | 论坛管理权限 |

### 5.3 信任级别（Trust Level）自动升降

Discourse 内置 Trust Level 系统（0-4），根据用户活跃度自动升级：

| TL | 条件 | 对应主站 |
|----|------|----------|
| TL0 | 新用户 | 普通 user |
| TL1 | 阅读 5 篇、发帖 1 篇、登录 1 天 | 活跃 user |
| TL2 | 持续活跃 | member |
| TL3 | 社区贡献者 | member（高活跃） |
| TL4 | 社区领袖 | admin 手动授予 |

**同步策略：**
- 首次 SSO 登录：根据主站 role 设置初始 group
- 后续 SSO 登录：仅更新 avatar_url、name 等基础信息
- 不覆盖 Discourse 自动升降的 Trust Level
- 如果主站会员过期（member → user），下次 SSO 登录时从 `会员组` 移除

---

## 六、Prisma User 模型预留字段

**建议在当前 User 模型中新增以下字段（本次仅设计，不执行迁移）：**

```prisma
model User {
  // ... 现有字段 ...

  // === 论坛整合预留字段 ===
  forumUserId      Int?       @unique  // Discourse 用户 ID
  forumUsername    String?             // 论坛用户名（可与主站 name 不同）
  forumLastSynced  DateTime?           // 最后一次论坛信息同步时间
  forumSsoNonce    String?             // 当前 SSO 会话 nonce（防重放）
  forumTrustLevel  Int?       @default(0)  // 论坛信任级别（只读，由论坛决定）
}
```

**字段说明：**

| 字段 | 类型 | 用途 |
|------|------|------|
| `forumUserId` | Int, unique | 关联 Discourse 用户 ID，用于精确匹配 |
| `forumUsername` | String? | 论坛用户名，允许用户单独设置 |
| `forumLastSynced` | DateTime? | 同步时间戳，避免重复请求 |
| `forumSsoNonce` | String? | SSO 一次性 nonce，防止重放攻击 |
| `forumTrustLevel` | Int, default 0 | 记录用户论坛信任级别（只读） |

---

## 七、Nginx 子域名反代方案（设计，不执行）

### 7.1 DNS 配置

需要在域名注册商处添加 A 记录：

```
forum.jueshi.net  →  142.171.184.179  （或独立 VPS IP）
```

### 7.2 Nginx 配置（示例）

```nginx
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name forum.jueshi.net;

    ssl_certificate /etc/letsencrypt/live/forum.jueshi.net/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/forum.jueshi.net/privkey.pem;

    # 反代到 Discourse Docker 容器
    location / {
        proxy_pass http://127.0.0.1:2000;
        proxy_set_header Host $http_host;
        proxy_http_version 1.1;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Real-IP $remote_addr;

        # WebSocket 支持（Discourse 实时通知）
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # 限制文件上传大小
    client_max_body_size 10m;

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
}

# HTTP → HTTPS 跳转
server {
    listen 80;
    server_name forum.jueshi.net;
    return 301 https://$host$request_uri;
}
```

### 7.3 SSL 证书

```bash
sudo certbot --nginx -d forum.jueshi.net
```

---

## 八、备份方案

### 8.1 论坛数据隔离

论坛数据与主站完全隔离：

| 数据类型 | 存储位置 | 备份方式 |
|----------|----------|----------|
| 论坛 PostgreSQL | Docker 卷 `/var/discourse/shared/standalone/backups` | 每日 pg_dump → /var/backups/forum-pg/ |
| 论坛上传文件 | Docker 卷 `/var/discourse/shared/standalone/uploads` | 每日 rsync → /var/backups/forum-uploads/ |
| 论坛配置文件 | `/var/discourse/containers/app.yml` | Git 版本控制 + 手动备份 |
| 主站 PostgreSQL | 已有 /var/backups/bxb-postgres/ | 不变 |
| 主站代码 | /var/www/xixiong-saas/ | Git |

### 8.2 备份脚本（设计，不创建）

```bash
#!/bin/bash
# /usr/local/bin/backup-forum.sh
BACKUP_DIR="/var/backups/forum-pg"
DATE=$(date +%F)

# 备份论坛 PostgreSQL
docker exec discourse pg_dump -U discourse discourse > "$BACKUP_DIR/forum-db-$DATE.sql"

# 压缩上传文件
tar czf "$BACKUP_DIR/forum-uploads-$DATE.tar.gz" /var/discourse/shared/standalone/uploads/

# 清理 14 天前的备份
find "$BACKUP_DIR" -mtime +14 -delete
```

### 8.3 恢复命令（设计）

```bash
# 恢复论坛数据库
docker exec discourse pg_restore -U discourse -d discourse < /var/backups/forum-pg/forum-db-2026-05-15.sql

# 恢复上传文件
tar xzf /var/backups/forum-pg/forum-uploads-2026-05-15.tar.gz -C /var/discourse/shared/standalone/
```

---

## 九、关键问题回答

### 9.1 现在整合是否比以后整合更简单？

**是。** 原因：
1. 当前用户量小，历史数据少，SSO 初始化成本低
2. 主站 User 模型尚未完全固化，预留字段不影响现有数据
3. 论坛从 0 开始建设，用户角色映射清晰
4. 等用户量增长后再整合，需要处理历史数据迁移、用户通知等额外工作

### 9.2 应该整合到什么程度？

**推荐「轻量整合」而非「深度绑定」：**
- ✅ 必须做：SSO 单点登录（主站登录 → 论坛自动登录）
- ✅ 建议做：头像/用户名同步
- ✅ 建议做：角色 → 组映射（member 有额外权限）
- ⚠️ 可以不做：帖子数据回主站显示
- ❌ 不建议做：论坛和主站共享数据库
- ❌ 不建议做：论坛独立成为会员源头

### 9.3 是否推荐 Discourse？

**✅ 强烈推荐。** 对比 Flarum 和 NodeBB：
- SSO 协议最成熟（discourse_sso）
- 社区最大，长期维护有保障
- 移动端体验最佳（海外用户主要使用手机）
- 反垃圾和内容质量管理最完善

### 9.4 是否需要马上部署？

**取决于当前优先级：**
- 如果用户已有社区需求（如工具使用求助、经验交流），建议部署
- 如果核心工具功能仍在迭代中，建议等到 v1.13.x 后再部署
- **最小可行方案：** 先搭建 Discourse + SSO，再逐步丰富内容

### 9.5 哪些改动必须等会员系统稳定后再做？

以下改动**必须**等会员系统（Stripe 订阅、角色管理、权限校验）稳定后：
1. **member → 论坛专属组** 的自动同步逻辑
2. **会员过期 → 论坛权限降级** 的回调机制
3. **论坛付费板块**（如果未来要做付费内容）
4. **主站会员页面展示论坛成就**（双向打通）

当前可以先做：
- 基础 SSO（user / admin 映射）
- 论坛搭建和内容框架
- 信任级别自动升降

### 9.6 如何避免影响 jueshi.net 正常运行？

1. **独立 PostgreSQL**：论坛使用独立 PG 实例，不影响主站数据库
2. **独立进程**：Discourse 运行在 Docker 容器中，与 PM2 主站隔离
3. **资源限制**：Docker 可设置内存/CPU 上限（`--memory=2g --cpus=2`）
4. **Nginx 独立 server block**：论坛和主站 Nginx 配置完全独立
5. **回滚方案**：如果论坛影响主站性能，可停止 Docker 容器，主站不受影响
6. **监控告警**：设置内存使用 > 80% 告警，及时干预

---

## 十、实施路线图（建议）

### 阶段 0：准备（1-2 周）
- [ ] 购买/配置子域名 `forum.jueshi.net` 的 DNS
- [ ] 评估是否同 VPS 部署还是单独 VPS
- [ ] 生成 `DISCOURSE_SSO_SECRET`
- [ ] 在主站 Prisma 中预留 forum 相关字段（仅添加列，不影响现有逻辑）

### 阶段 1：论坛搭建（1-2 天）
- [ ] 安装 Discourse（Docker）
- [ ] 配置 Nginx 反代 + SSL
- [ ] 配置论坛基础设置（分类、标签、主题）
- [ ] 测试论坛独立运行

### 阶段 2：SSO 整合（2-3 天）
- [ ] 主站实现 `/api/forum/sso` 路由
- [ ] 配置 Discourse 的 SSO 设置
- [ ] 测试登录流程：主站登录 → 论坛自动登录
- [ ] 测试角色映射

### 阶段 3：内容建设（持续）
- [ ] 创建初始分类（物流交流、工具使用、出海经验、生活互助等）
- [ ] 发布置顶引导帖
- [ ] 设置 Trust Level 规则
- [ ] 配置反垃圾策略

---

## 十一、风险清单

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| Discourse 内存占用过高 | 主站性能下降 | Docker 限制内存上限 + 监控告警 |
| SSO 同步失败 | 用户无法登录论坛 | 保留论坛管理员独立登录入口 |
| 论坛垃圾内容 | 社区体验差 | Discourse Trust Level + 反垃圾插件 + 人工审核 |
| 论坛数据库损坏 | 论坛数据丢失 | 每日备份 + 异地备份（R2/B2） |
| 主站和论坛用户信息不同步 | 用户体验差 | SSO 每次登录自动更新基础信息 |
| SEO 分散 | 主站权重稀释 | 论坛设置 noindex 初期，后期逐步开放 |

---

## 十二、成本估算

| 项目 | 同 VPS 部署 | 独立 VPS 部署 |
|------|-------------|---------------|
| 服务器 | 已有（RackNerd 8GB） | ~$10-15/月（2C4G） |
| 域名 | 已有子域名 | 已有子域名 |
| SSL | Certbot 免费 | Certbot 免费 |
| 备份存储 | 本地（已有 124GB 可用） | 本地 + 异地 R2（$0.015/GB） |
| 运维时间 | 初期 2-3 天搭建 | 初期 2-3 天搭建 + 独立运维 |

**建议初期同 VPS 部署，控制成本，用户增长后迁移。**

---

> 本文档为设计草案，等待确认后进入实施阶段。
