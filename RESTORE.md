# v1.20.42.8.0 Beta 基线恢复指南

**版本**: v1.20.42.8.0-beta-baseline  
**创建时间**: 2026-06-18 02:26:30  
**备份目录**: `/home/deploy/backups/beta-baseline-v1.20.42.8.0`

---

## ⚠️ 风险提示

1. **恢复数据库会覆盖当前数据**
2. **必须先停写入**
3. **必须先备份当前状态**
4. **恢复操作不可逆**

---

## 一、恢复前准备

### 1.1 确认当前状态

```bash
# 检查 PM2 状态
pm2 list

# 检查 Nginx 状态
sudo systemctl status nginx

# 检查磁盘空间
df -h /

# 检查备份文件
ls -lh /home/deploy/backups/beta-baseline-v1.20.42.8.0/
```

### 1.2 备份当前状态（可选但推荐）

```bash
# 备份当前数据库
source /home/deploy/xixiong-saas/.env.production
pg_dump "$DATABASE_URL" > /home/deploy/backups/pre-restore-$(date '+%Y%m%d_%H%M%S').dump

# 备份当前配置
cp /etc/nginx/sites-available/jueshi.net /home/deploy/backups/nginx-pre-restore.conf
cp /home/deploy/.pm2/dump.pm2 /home/deploy/backups/pm2-pre-restore.json
```

---

## 二、恢复步骤

### 2.1 停止服务

```bash
# 停止 PM2
pm2 stop xixiong-saas

# 停止 Nginx（可选）
sudo systemctl stop nginx
```

### 2.2 恢复数据库

```bash
# 进入备份目录
cd /home/deploy/backups/beta-baseline-v1.20.42.8.0

# 恢复数据库
source /home/deploy/xixiong-saas/.env.production
pg_restore -d bxb_prod --clean --if-exists < bxb_prod_beta_baseline_20260618_022630.dump

# 验证恢复
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM users;"
```

### 2.3 恢复上传资产

```bash
# 如果存在上传资产备份
if [ -f "uploads_beta_baseline_20260618_022630.tar.gz" ]; then
    tar -xzf uploads_beta_baseline_20260618_022630.tar.gz -C /home/deploy/xixiong-saas/
    echo "✅ 上传资产恢复完成"
else
    echo "⚠️ 无上传资产备份，跳过"
fi
```

### 2.4 恢复 Nginx 配置

```bash
# 恢复 Nginx 配置
sudo cp nginx-jueshi.net_20260618_022630.conf /etc/nginx/sites-available/jueshi.net

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

### 2.5 恢复 PM2 配置

```bash
# 恢复 PM2 配置
cp pm2-dump_20260618_022630.json /home/deploy/.pm2/dump.pm2

# 重启 PM2
pm2 kill
pm2 resurrect

# 或者手动启动
pm2 start /home/deploy/xixiong-saas --name xixiong-saas --update-env
```

### 2.6 验证恢复

```bash
# 检查 PM2 状态
pm2 list

# 检查核心 URL
for url in https://jueshi.net/ https://jueshi.net/resources https://jueshi.net/tracking https://jueshi.net/forgot-password https://jueshi.net/login https://jueshi.net/feedback; do
    code=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    echo "$url → $code"
done

# 检查找回密码
curl -I https://jueshi.net/forgot-password

# 检查备份 cron
sudo crontab -l | grep backup-db

# 检查 health-check
ls -l /home/deploy/xixiong-saas/scripts/health-check.sh
```

---

## 三、恢复后验证

### 3.1 核心功能验证

| 功能 | 验证命令 | 预期结果 |
|---|---|---|
| 首页 | `curl -I https://jueshi.net/` | 200 |
| 资源页 | `curl -I https://jueshi.net/resources` | 200 |
| 追踪页 | `curl -I https://jueshi.net/tracking` | 200 |
| 找回密码 | `curl -I https://jueshi.net/forgot-password` | 200 |
| 登录页 | `curl -I https://jueshi.net/login` | 200 |
| 反馈页 | `curl -I https://jueshi.net/feedback` | 200 |

### 3.2 数据库验证

```bash
# 检查用户数
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM users;"

# 检查密码重置 token
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM password_reset_tokens;"

# 检查论坛帖子
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM forum_posts;"
```

### 3.3 备份验证

```bash
# 检查最新备份
ls -lh /home/deploy/backups/*.dump | tail -5

# 检查备份 cron
sudo crontab -l | grep backup-db
```

---

## 四、故障排查

### 4.1 数据库恢复失败

```bash
# 检查错误日志
psql "$DATABASE_URL" -c "SELECT * FROM pg_stat_activity;"

# 检查连接数
psql "$DATABASE_URL" -c "SHOW max_connections;"

# 强制断开连接
psql "$DATABASE_URL" -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'bxb_prod';"
```

### 4.2 PM2 启动失败

```bash
# 检查 PM2 日志
pm2 logs xixiong-saas --lines 100

# 检查环境变量
pm2 env xixiong-saas

# 重启 PM2
pm2 restart xixiong-saas --update-env
```

### 4.3 Nginx 配置错误

```bash
# 测试配置
sudo nginx -t

# 查看错误日志
sudo tail -f /var/log/nginx/error.log

# 恢复备份配置
sudo cp /home/deploy/backups/nginx-pre-restore.conf /etc/nginx/sites-available/jueshi.net
sudo systemctl restart nginx
```

---

## 五、恢复完成检查清单

- [ ] 数据库恢复成功
- [ ] 上传资产恢复成功（如果有）
- [ ] Nginx 配置恢复成功
- [ ] PM2 配置恢复成功
- [ ] 核心 6 URL 全部 200
- [ ] 找回密码页面可访问
- [ ] 备份 cron 正常
- [ ] health-check 脚本存在
- [ ] 用户数据完整
- [ ] 论坛数据完整

---

## 六、联系支持

如果恢复过程中遇到问题：

1. 检查 PM2 日志：`pm2 logs xixiong-saas`
2. 检查 Nginx 日志：`sudo tail -f /var/log/nginx/error.log`
3. 检查数据库连接：`psql "$DATABASE_URL" -c "SELECT 1;"`
4. 联系技术支持

---

**恢复指南版本**: v1.0  
**最后更新**: 2026-06-18
