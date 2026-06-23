# SEO 与安全测试矩阵 — v1.20.42.18.6.6.7

---

## SEO 测试

| # | 检查项 | 环境 | 操作 | 预期结果 | 严重级别 |
|---|--------|------|------|----------|----------|
| S-01 | title | production | view-source | 每页有 title | P1 |
| S-02 | description | production | view-source | 每页有 description | P1 |
| S-03 | canonical | production | view-source | 正确 | P1 |
| S-04 | robots.txt | production | curl /robots.txt | 允许索引 | P1 |
| S-05 | robots.txt | staging | curl /robots.txt | Disallow: / | P1 |
| S-06 | sitemap | production | curl /sitemap.xml | 存在有效 | P1 |
| S-07 | X-Robots-Tag | staging | curl -I | noindex, nofollow | P2 |
| S-08 | production index | production | curl -I | 无 noindex | P1 |
| S-09 | 301/308 redirect | production | curl -I /destinations/usa | 308 | P1 |
| S-10 | 404 状态码 | production | curl /nonexistent | 404 | P1 |
| S-11 | OpenGraph | production | view-source | og:title, og:description | P2 |
| S-12 | 图片 alt | production | DOM 检查 | 有 alt | P2 |
| S-13 | 内链 | production | 检查链接 | 无死链 | P2 |
| S-14 | alias 去重 | production | 检查 canonical | alias → canonical | P1 |
| S-15 | staging noindex | staging | curl -I | X-Robots-Tag | P2 |

## 安全测试

| # | 检查项 | 环境 | 操作 | 预期结果 | 严重级别 |
|---|--------|------|------|----------|----------|
| S-20 | 未登录访问后台 | staging | 访问 /admin | redirect /login | P0 |
| S-21 | 非 admin 访问后台 | staging | test@jueshi.net → /admin | 拒绝 | P0 |
| S-22 | 未登录 API | staging | curl POST /api/admin/* | 401/403 | P0 |
| S-23 | 非 admin API | staging | test@jueshi.net → admin API | 403 | P0 |
| S-24 | XSS 输入 | staging | 帖子标题输入 <script> | 被过滤 | P1 |
| S-25 | SQL injection | staging | 输入 ' OR 1=1 | 被过滤 | P0 |
| S-26 | 文件上传 .php | staging | 上传 .php | 拒绝 | P0 |
| S-27 | 路径穿越 | staging | 输入 ../../../etc/passwd | 拒绝 | P0 |
| S-28 | 敏感字段 | staging | API 返回检查 | 无 password/hash | P0 |
| S-29 | session | staging | 检查 cookie | httpOnly, secure | P1 |
| S-30 | CSRF | staging | 检查 POST 请求 | 有 CSRF token | P1 |
| S-31 | Fail2ban | production | SSH 检查 | active | P2 |
| S-32 | UFW | production | SSH 检查 | active (22/80/443) | P2 |
| S-33 | robots 不等于安全 | staging | 验证 /admin 有独立保护 | 是 | P1 |
| S-34 | staging 不公开推广 | staging | 检查无公开链接 | 无 | P2 |
