# PostgreSQL 备份运维手册

> 版本: v0.1  
> 日期: 2026-05-15  
> 基于: v1.12.9-stable (commit `3110be8`)

---

## 一、手动备份

```bash
bash /home/deploy/xixiong-saas/scripts/ops/backup-postgres.sh
```

备份输出到 `/var/backups/xixiong-saas/postgres/`。

---

## 二、手动恢复验证

```bash
bash /home/deploy/xixiong-saas/scripts/ops/verify-postgres-backup.sh
```

验证流程：
1. 找到最新备份文件
2. 创建临时数据库 `bxb_restore_test`
3. 恢复备份
4. 验证关键表和数据量
5. 删除临时数据库
6. 输出 PASS/FAIL

---

## 三、R2 上传

```bash
bash /home/deploy/xixiong-saas/scripts/ops/upload-backup-r2.sh
```

前提：需要配置 `/home/deploy/xixiong-saas/.env.backup`（参考 `docs/examples/backup-r2.env.example`）

---

## 四、推荐 cron 计划

```cron
# 每天凌晨 3:20 执行本地备份
20 3 * * * /home/deploy/xixiong-saas/scripts/ops/backup-postgres.sh >> /var/log/xixiong-backup.log 2>&1

# 每天凌晨 3:40 执行恢复验证（备份完成后 20 分钟）
40 3 * * * /home/deploy/xixiong-saas/scripts/ops/verify-postgres-backup.sh >> /var/log/xixiong-backup-verify.log 2>&1

# 每天凌晨 4:00 执行 R2 上传（如果已配置）
0 4 * * * /home/deploy/xixiong-saas/scripts/ops/upload-backup-r2.sh >> /var/log/xixiong-backup-r2.log 2>&1
```

### 安装 cron

```bash
# 编辑 crontab
crontab -e

# 粘贴上述 cron 行并保存
# 验证
crontab -l
```

---

## 五、查看日志

```bash
# 本地备份日志
tail -20 /var/log/xixiong-backup.log

# 恢复验证日志
tail -20 /var/log/xixiong-backup-verify.log

# R2 上传日志
tail -20 /var/log/xixiong-backup-r2.log
```

---

## 六、手动恢复到某个备份

```bash
# 1. 查看可用备份
ls -lh /var/backups/xixiong-saas/postgres/

# 2. 恢复指定备份到生产数据库
# ⚠️ 警告：这会覆盖当前生产数据！
gunzip -c /var/backups/xixiong-saas/postgres/bxb_prod_20260515_032000.sql.gz | \
  PGPASSWORD="<password>" psql -h 127.0.0.1 -U bxb_user -d bxb_prod
```

### 安全恢复流程（推荐）

```bash
# 1. 先恢复到测试数据库验证
gunzip -c /var/backups/xixiong-saas/postgres/bxb_prod_20260515_032000.sql.gz | \
  PGPASSWORD="<password>" psql -h 127.0.0.1 -U bxb_user -d bxb_restore_test

# 2. 验证数据
PGPASSWORD="<password>" psql -h 127.0.0.1 -U bxb_user -d bxb_restore_test \
  -c "SELECT count(*) FROM users;"
PGPASSWORD="<password>" psql -h 127.0.0.1 -U bxb_user -d bxb_restore_test \
  -c "SELECT count(*) FROM postal_codes;"

# 3. 确认无误后，备份当前生产数据
bash /home/deploy/xixiong-saas/scripts/ops/backup-postgres.sh

# 4. 删除生产数据库并恢复
PGPASSWORD="<password>" psql -h 127.0.0.1 -U bxb_user -d postgres \
  -c "DROP DATABASE bxb_prod;"
PGPASSWORD="<password>" psql -h 127.0.0.1 -U bxb_user -d postgres \
  -c "CREATE DATABASE bxb_prod;"
gunzip -c /var/backups/xixiong-saas/postgres/bxb_prod_20260515_032000.sql.gz | \
  PGPASSWORD="<password>" psql -h 127.0.0.1 -U bxb_user -d bxb_prod

# 5. 重启应用
pm2 restart xixiong-saas --update-env

# 6. 验证应用正常
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/
```

---

## 七、备份文件管理

```bash
# 列出所有备份
ls -lh /var/backups/xixiong-saas/postgres/

# 查看最新备份
ls -lh /var/backups/xixiong-saas/postgres/latest.sql.gz

# 查看备份内容（不解压）
gunzip -c /var/backups/xixiong-saas/postgres/bxb_prod_20260515_032000.sql.gz | head -50

# 查看备份大小
du -sh /var/backups/xixiong-saas/postgres/
```

---

> 本手册为运维指南，定期备份是数据安全的最后一道防线。
