# v1.20.42.8.0 Beta 基线本地下载指南

**版本**: v1.20.42.8.0-beta-baseline  
**创建时间**: 2026-06-18 02:26:30  
**备份目录**: `/home/deploy/backups/beta-baseline-v1.20.42.8.0`

---

## 一、备份文件清单

| 文件 | 大小 | 说明 |
|---|---|---|
| `bxb_prod_beta_baseline_20260618_022630.dump` | 941M | 数据库完整备份 |
| `env-keys_20260618_022630.txt` | 391B | 环境变量 key 清单（不含 secret） |
| `MANIFEST.txt` | 955B | 备份清单 |
| `SHA256.txt` | 284B | SHA256 校验文件 |

---

## 二、下载命令

### 2.1 下载整个备份目录

```bash
# 创建本地备份目录
mkdir -p ~/Downloads/beta-baseline-v1.20.42.8.0

# 使用 rsync 下载整个目录
rsync -avz deploy@192.129.155.149:/home/deploy/backups/beta-baseline-v1.20.42.8.0/ ~/Downloads/beta-baseline-v1.20.42.8.0/
```

### 2.2 下载单个文件

```bash
# 下载数据库备份
scp deploy@192.129.155.149:/home/deploy/backups/beta-baseline-v1.20.42.8.0/bxb_prod_beta_baseline_20260618_022630.dump ~/Downloads/

# 下载环境变量 key 清单
scp deploy@192.129.155.149:/home/deploy/backups/beta-baseline-v1.20.42.8.0/env-keys_20260618_022630.txt ~/Downloads/

# 下载 MANIFEST
scp deploy@192.129.155.149:/home/deploy/backups/beta-baseline-v1.20.42.8.0/MANIFEST.txt ~/Downloads/

# 下载 SHA256 校验文件
scp deploy@192.129.155.149:/home/deploy/backups/beta-baseline-v1.20.42.8.0/SHA256.txt ~/Downloads/
```

### 2.3 使用 tar 打包下载

```bash
# 在 VPS 上打包
ssh deploy@192.129.155.149 'cd /home/deploy/backups && tar -czf beta-baseline-v1.20.42.8.0.tar.gz beta-baseline-v1.20.42.8.0/'

# 下载到本地
scp deploy@192.129.155.149:/home/deploy/backups/beta-baseline-v1.20.42.8.0.tar.gz ~/Downloads/

# 解压
cd ~/Downloads
tar -xzf beta-baseline-v1.20.42.8.0.tar.gz
```

---

## 三、校验文件

### 3.1 校验 SHA256

```bash
# 进入备份目录
cd ~/Downloads/beta-baseline-v1.20.42.8.0

# 校验所有文件
sha256sum -c SHA256.txt

# 或者手动校验单个文件
sha256sum bxb_prod_beta_baseline_20260618_022630.dump
```

### 3.2 预期校验结果

```
871478941f4cb053895f13b9476247dd9e3b9a2b7ffb7c25f6e59d3983de8dee  bxb_prod_beta_baseline_20260618_022630.dump
96c1b04d09f4309626d859de4b55291a450c7b704c92564d124c5a4d1bf68852  env-keys_20260618_022630.txt
510db6a976f84d0af775bd3ca2da8725094fa1b8bdef16961b0c56b38844f55a  MANIFEST.txt
```

---

## 四、本地恢复测试

### 4.1 创建本地测试数据库

```bash
# 创建本地数据库
createdb bxb_prod_test

# 恢复数据库
psql bxb_prod_test < bxb_prod_beta_baseline_20260618_022630.dump

# 验证
psql bxb_prod_test -c "SELECT COUNT(*) FROM users;"
```

### 4.2 检查数据完整性

```bash
# 检查用户数
psql bxb_prod_test -c "SELECT COUNT(*) FROM users;"

# 检查密码重置 token
psql bxb_prod_test -c "SELECT COUNT(*) FROM password_reset_tokens;"

# 检查论坛帖子
psql bxb_prod_test -c "SELECT COUNT(*) FROM forum_posts;"

# 检查论坛评论
psql bxb_prod_test -c "SELECT COUNT(*) FROM forum_comments;"
```

---

## 五、注意事项

1. **数据库备份文件较大（941M）**，确保有足够的磁盘空间
2. **环境变量 key 清单不包含 secret**，仅包含 key 名称
3. **恢复操作需要在本地 PostgreSQL 环境**
4. **恢复前请确保本地 PostgreSQL 版本兼容**（建议 PostgreSQL 14+）

---

## 六、故障排查

### 6.1 下载失败

```bash
# 检查 SSH 连接
ssh deploy@192.129.155.149 'echo "Connection OK"'

# 检查备份目录
ssh deploy@192.129.155.149 'ls -lh /home/deploy/backups/beta-baseline-v1.20.42.8.0/'
```

### 6.2 校验失败

```bash
# 重新下载 SHA256.txt
scp deploy@192.129.155.149:/home/deploy/backups/beta-baseline-v1.20.42.8.0/SHA256.txt ~/Downloads/

# 重新校验
cd ~/Downloads/beta-baseline-v1.20.42.8.0
sha256sum -c SHA256.txt
```

### 6.3 恢复失败

```bash
# 检查 PostgreSQL 版本
psql --version

# 检查数据库连接
psql -l

# 检查错误日志
tail -f /var/log/postgresql/postgresql-*.log
```

---

## 七、联系支持

如果下载或恢复过程中遇到问题：

1. 检查 SSH 连接
2. 检查磁盘空间
3. 检查 PostgreSQL 版本
4. 联系技术支持

---

**下载指南版本**: v1.0  
**最后更新**: 2026-06-18
