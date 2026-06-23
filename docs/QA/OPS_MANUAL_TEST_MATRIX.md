# 运维测试矩阵 — v1.20.42.18.6.6.7

---

## PM2

| # | 检查项 | 环境 | 操作 | 预期结果 | 严重级别 |
|---|--------|------|------|----------|----------|
| O-01 | PM2 状态 | production | pm2 status | online | P0 |
| O-02 | PM2 restart count | production | pm2 status | <=3 | P1 |
| O-03 | PM2 内存 | production | pm2 status | <500MB | P2 |
| O-04 | PM2 staging | staging | pm2 status | xixiong-staging online | P1 |
| O-05 | PM2 热备 | staging | pm2 status | xixiong-saas online (热备) | P2 |

## Nginx

| # | 检查项 | 环境 | 操作 | 预期结果 | 严重级别 |
|---|--------|------|------|----------|----------|
| O-10 | Nginx 状态 | production | systemctl status | active | P0 |
| O-11 | 502/500 | production | grep error.log | 0 | P1 |
| O-12 | Nginx staging | staging | systemctl status | active | P1 |

## PostgreSQL

| # | 检查项 | 环境 | 操作 | 预期结果 | 严重级别 |
|---|--------|------|------|----------|----------|
| O-20 | PG 状态 | production | systemctl status | active | P0 |
| O-21 | PG 连接 | production | pg_stat_activity | 连接数正常 | P2 |

## SSL

| # | 检查项 | 环境 | 操作 | 预期结果 | 严重级别 |
|---|--------|------|------|----------|----------|
| O-30 | 证书有效 | production | certbot certificates | VALID | P0 |
| O-31 | 证书有效 | staging | certbot certificates | VALID | P1 |
| O-32 | 自动续期 | production | certbot renew --dry-run | success | P1 |
| O-33 | 到期时间 | production | certbot certificates | >14 days | P1 |

## UFW / Fail2ban

| # | 检查项 | 环境 | 操作 | 预期结果 | 严重级别 |
|---|--------|------|------|----------|----------|
| O-40 | UFW | production | ufw status | active | P1 |
| O-41 | UFW | staging | ufw status | active | P2 |
| O-42 | Fail2ban | production | fail2ban status | 1 jail (sshd) | P1 |
| O-43 | Fail2ban | staging | fail2ban status | 3 jails | P2 |

## Backup

| # | 检查项 | 环境 | 操作 | 预期结果 | 严重级别 |
|---|--------|------|------|----------|----------|
| O-50 | iCloud 备份 | local | ls iCloud/Backups | 存在且非空 | P0 |
| O-51 | 备份 cron | local | cronjob list | 0 3 * * * | P1 |
| O-52 | 30天清理 | local | 检查脚本 | find -mtime +30 -delete | P2 |
| O-53 | 恢复演练 | staging | 恢复备份到 staging DB | 成功 | P2 |

## Health Check / Monitoring

| # | 检查项 | 环境 | 操作 | 预期结果 | 严重级别 |
|---|--------|------|------|----------|----------|
| O-60 | health check | staging | crontab -l | */5 * * * * | P1 |
| O-61 | health check | production | crontab -l | MISSING (P0 gap) | P0 |
| O-62 | 报警链路 | both | 检查通知配置 | MISSING (P0 gap) | P0 |
| O-63 | 磁盘 | production | df -h | <80% (当前 13%) | P2 |
| O-64 | 内存 | production | free -m | 充足 (1G/8G) | P2 |
| O-65 | Cloudflare | production | curl -I | 正常代理 | P2 |

## DNS

| # | 检查项 | 环境 | 操作 | 预期结果 | 严重级别 |
|---|--------|------|------|----------|----------|
| O-70 | jueshi.net | production | dig | Cloudflare IP | P1 |
| O-71 | i.jueshi.net | staging | dig | Cloudflare IP | P1 |

## Scripts

| # | 检查项 | 环境 | 操作 | 预期结果 | 严重级别 |
|---|--------|------|------|----------|----------|
| O-80 | smoke-test.sh | local | test -f | 存在 | P2 |
| O-81 | deploy-staging.sh | local | test -f | 存在 | P2 |
| O-82 | deploy-production-safe.sh | local | test -f | 存在 | P2 |
| O-83 | rollback-production.sh | local | test -f | 存在 | P2 |
| O-84 | backup-prod-to-icloud.sh | local | test -f | 存在 | P1 |
| O-85 | 环境标记 | production | cat /etc/jueshi-environment | environment=production | P2 |
| O-86 | 环境标记 | staging | cat /etc/jueshi-environment | environment=staging | P2 |

## Rollback / Deploy

| # | 检查项 | 环境 | 操作 | 预期结果 | 严重级别 |
|---|--------|------|------|----------|----------|
| O-90 | 回滚脚本 | local | 检查 rollback-production.sh | 存在，需人工确认 | P1 |
| O-91 | 旧服务器热备 | staging | PM2 xixiong-saas | online (热备) | P2 |
| O-92 | 7天后下线 | staging | 7天后检查 | 需用户确认 | P2 |
| O-93 | no db push guard | both | 检查脚本 | 无 prisma db push | P0 |
