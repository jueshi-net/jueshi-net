# 数据库异地备份方案

> 版本: v0.1  
> 状态: 设计草案，待确认  
> 日期: 2026-05-15  
> 基于: v1.12.9-stable (commit `3110be8`)

---

## 一、当前备份现状

| 项目 | 状态 |
|------|------|
| 本地 pg_dump | 已配置（cron 每日执行） |
| 备份目录 | `/var/backups/bxb-postgres/` |
| 保留周期 | 14 天 |
| 异地备份 | ❌ 无 |
| 备份内容 | `bxb_prod` 数据库 |
| 备份验证 | 无 |

**风险：** 如果 VPS 硬件故障或数据损坏，所有数据丢失，无恢复可能。

---

## 二、备份目录结构

```
/var/backups/bxb-postgres/
├── daily/
│   ├── bxb_prod-2026-05-15.sql.gz       # 每日完整备份
│   ├── bxb_prod-2026-05-14.sql.gz
│   └── ...
├── weekly/
│   ├── bxb_prod-2026-W20.sql.gz         # 每周保留一份
│   └── ...
├── latest.sql.gz                        # 软链接到最新备份
└── backup.log                           # 备份日志
```

### 保留策略

| 类型 | 频率 | 保留数量 | 保留时长 |
|------|------|----------|----------|
| 每日 | 每天 03:00 | 14 份 | 14 天 |
| 每周 | 每周日 | 4 份 | 28 天 |
| 异地 | 每天 04:00 | 7 份 | 7 天 |

---

## 三、异地备份方案对比

### 方案 A：Cloudflare R2（推荐）

| 维度 | 详情 |
|------|------|
| 成本 | $0.015/GB/月（存储）+ 免费出口流量 |
| 可靠性 | 99.999%+，多区域冗余 |
| 配置难度 | 低（rclone / s3cmd） |
| 恢复速度 | 取决于带宽（约 5-10 分钟恢复 1GB） |
| 加密 | 服务端加密（可选客户端加密） |

**配置步骤：**
```bash
# 1. 安装 rclone
curl https://rclone.org/install.sh | sudo bash

# 2. 配置 R2（使用 Access Key + Secret Key）
rclone config
# 选择 s3 类型，provider: Cloudflare, endpoint: r2.cloudflarestorage.com

# 3. 备份脚本中增加上传步骤
rclone copy /var/backups/bxb-postgres/daily/ r2:bxb-backups/daily/ \
  --include "*.sql.gz" \
  --min-age 1h \
  --delete-after \
  --transfers 2
```

### 方案 B：Backblaze B2

| 维度 | 详情 |
|------|------|
| 成本 | $0.005/GB/月（存储）+ $0.01/GB 下载 |
| 可靠性 | 11 个 9 |
| 配置难度 | 低（rclone / b2 CLI） |
| 恢复速度 | 中等 |
| 加密 | 服务端加密 |

### 方案 C：另一台 VPS（自建）

| 维度 | 详情 |
|------|------|
| 成本 | 额外 VPS 费用（约 $5-10/月） |
| 可靠性 | 取决于第二台 VPS 的稳定性 |
| 配置难度 | 中（SSH key + rsync/scp） |
| 恢复速度 | 快（内网或同区域） |
| 加密 | SSH 传输天然加密 |

**配置步骤：**
```bash
# 使用 rsync over SSH
rsync -avz -e "ssh -i /path/to/backup-key" \
  /var/backups/bxb-postgres/daily/*.sql.gz \
  backup-user@backup-vps:/backups/bxb-postgres/daily/
```

---

## 四、一键备份脚本草案

```bash
#!/bin/bash
# /usr/local/bin/backup-bxb-postgres.sh
#
# 本地 pg_dump + 压缩 + 异地同步
# 用法: sudo /usr/local/bin/backup-bxb-postgres.sh

set -euo pipefail

# ===== 配置 =====
DB_NAME="bxb_prod"
DB_USER="bxb_user"
DB_HOST="127.0.0.1"
DB_PORT="5432"
BACKUP_DIR="/var/backups/bxb-postgres"
DAILY_DIR="${BACKUP_DIR}/daily"
WEEKLY_DIR="${BACKUP_DIR}/weekly"
LOG_FILE="${BACKUP_DIR}/backup.log"
RETENTION_DAYS=14
WEEKLY_RETENTION=4
DATE=$(date +%F)
DAY_OF_WEEK=$(date +%u)  # 1=Monday, 7=Sunday
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# ===== 确保目录存在 =====
mkdir -p "$DAILY_DIR" "$WEEKLY_DIR"

# ===== 日志函数 =====
log() {
  echo "[$TIMESTAMP] $1" | tee -a "$LOG_FILE"
}

# ===== 开始备份 =====
log "开始备份 ${DB_NAME}..."

# 1. pg_dump
DUMP_FILE="${DAILY_DIR}/${DB_NAME}-${DATE}.sql"
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
  --format=plain \
  --no-owner \
  --no-privileges \
  --verbose \
  > "$DUMP_FILE" 2>> "$LOG_FILE"

# 2. 压缩
gzip -9 "$DUMP_FILE"
COMPRESSED_FILE="${DUMP_FILE}.gz"
SIZE=$(du -h "$COMPRESSED_FILE" | cut -f1)
log "备份完成: ${COMPRESSED_FILE} (${SIZE})"

# 3. 更新 latest 软链接
ln -sf "$COMPRESSED_FILE" "${BACKUP_DIR}/latest.sql.gz"

# 4. 每周日额外保存一份到 weekly 目录
if [ "$DAY_OF_WEEK" -eq 7 ]; then
  WEEKLY_FILE="${WEEKLY_DIR}/${DB_NAME}-$(date +%G-W%V).sql.gz"
  cp "$COMPRESSED_FILE" "$WEEKLY_FILE"
  log "周备份已保存: ${WEEKLY_FILE}"
fi

# 5. 清理过期文件
find "$DAILY_DIR" -name "*.sql.gz" -mtime +${RETENTION_DAYS} -delete 2>/dev/null
find "$WEEKLY_DIR" -name "*.sql.gz" -mtime +$((WEEKLY_RETENTION * 7)) -delete 2>/dev/null
log "已清理 ${RETENTION_DAYS} 天前的备份"

# 6. 异地同步（如果配置了 R2）
if command -v rclone &>/dev/null && rclone config file | grep -q rclone; then
  log "开始异地同步到 R2..."
  rclone copy "$DAILY_DIR/" r2:bxb-backups/daily/ \
    --include "${DB_NAME}-${DATE}.sql.gz" \
    --transfers 2 \
    --retries 3 \
    >> "$LOG_FILE" 2>&1
  
  # 同步 weekly
  if [ "$DAY_OF_WEEK" -eq 7 ]; then
    rclone copy "$WEEKLY_DIR/" r2:bxb-backups/weekly/ \
      --include "*.sql.gz" \
      --transfers 2 \
      >> "$LOG_FILE" 2>&1
  fi
  log "异地同步完成"
else
  log "rclone 未配置，跳过异地同步"
fi

# 7. 验证备份文件完整性
if gzip -t "$COMPRESSED_FILE" 2>/dev/null; then
  log "备份文件完整性验证: ✅ 通过"
else
  log "备份文件完整性验证: ❌ 失败！"
  exit 1
fi

log "备份流程结束"
```

### Cron 配置

```cron
# 每天凌晨 3 点执行备份
0 3 * * * /usr/local/bin/backup-bxb-postgres.sh >> /var/log/bxb-backup.log 2>&1
```

---

## 五、恢复命令

### 5.1 从本地备份恢复

```bash
# 列出可用备份
ls -la /var/backups/bxb-postgres/daily/

# 解压并恢复
gunzip -c /var/backups/bxb-postgres/daily/bxb_prod-2026-05-15.sql.gz | \
  psql -h 127.0.0.1 -U bxb_user -d bxb_prod
```

### 5.2 从 R2 恢复

```bash
# 从 R2 下载
rclone copy r2:bxb-backups/daily/bxb_prod-2026-05-15.sql.gz /tmp/

# 恢复
gunzip -c /tmp/bxb_prod-2026-05-15.sql.gz | \
  psql -h 127.0.0.1 -U bxb_user -d bxb_prod
```

### 5.3 验证恢复

```bash
# 检查表数量
psql -h 127.0.0.1 -U bxb_user -d bxb_prod -c "\dt" | wc -l

# 检查用户数量
psql -h 127.0.0.1 -U bxb_user -d bxb_prod -c "SELECT count(*) FROM users;"

# 检查关键表数据
psql -h 127.0.0.1 -U bxb_user -d bxb_prod -c "SELECT count(*) FROM link_items;"
```

---

## 六、推荐方案

| 方案 | 推荐度 | 成本 | 复杂度 |
|------|--------|------|--------|
| **本地 + R2** | ⭐⭐⭐⭐⭐ | ~$0.02/月 | 低 |
| 本地 + Backblaze B2 | ⭐⭐⭐⭐ | ~$0.01/月 | 低 |
| 本地 + 另一台 VPS | ⭐⭐⭐ | ~$5-10/月 | 中 |

**推荐：本地 + Cloudflare R2**，成本极低，可靠性高，配置简单。

---

## 七、风险清单

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 备份期间数据库锁定 | 短暂写入阻塞 | pg_dump 使用默认一致性快照，不阻塞写入 |
| 备份文件过大 | 占用磁盘空间 | 压缩 + 自动清理 + 监控磁盘 |
| 异地同步失败 | 无异地备份 | 备份脚本记录失败日志 + 告警 |
| 备份恢复失败 | 数据丢失 | 定期演练恢复流程 |
| R2 服务中断 | 异地备份不可用 | 保留本地备份作为兜底 |

---

> 本文档为设计草案，等待确认后执行。首次执行建议在测试环境验证完整备份-恢复流程。
