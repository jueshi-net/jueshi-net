#!/bin/bash
# v1.12.4 VPS 部署脚本
# 在 VPS 上执行：bash /tmp/deploy-v1.12.4.sh
set -e

PROJECT_DIR="/var/www/xixiong-saas"
BACKUP_DIR="/var/backups/xixiong-saas-$(date +%Y%m%d-%H%M%S)"

echo "========================================="
echo "v1.12.4 部署脚本"
echo "========================================="

# Step 1: 备份当前版本
echo ""
echo "📦 备份当前版本到 $BACKUP_DIR ..."
cp -r "$PROJECT_DIR" "$BACKUP_DIR" 2>/dev/null || echo "⚠️ 备份失败，继续部署"

cd "$PROJECT_DIR"

# Step 2: 同步新代码（从本地 scp 到 /tmp/xixiong-saas-update，然后 rsync）
# 注意：这一步需要在本地机器执行 rsync，脚本只负责后续步骤
# rsync -avz --exclude 'node_modules' --exclude '.next' --exclude '.env' --exclude '.git' ~/projects/xixiong-saas/ root@142.171.184.179:/var/www/xixiong-saas/

# Step 3: 确认 commit
echo ""
echo "🔍 当前 commit:"
git log --oneline -3

# Step 4: 确认工作区干净
echo ""
echo "🔍 Git status:"
git status --short || echo "工作区干净"

# Step 5: 安装依赖
echo ""
echo "📦 安装依赖..."
npm install

# Step 6: 生成 Prisma Client
echo ""
echo "🔧 生成 Prisma Client..."
npx prisma generate

# Step 7: 执行数据库 migration
echo ""
echo "🗄️ 执行 migration..."
npx prisma migrate deploy

# Step 8: 检查 migration 状态
echo ""
echo "🔍 Migration 状态:"
npx prisma migrate status

# Step 9: 导入邮编数据
echo ""
echo "🌍 导入邮编数据 (CA/US/GB/AU/NZ)..."
npx tsx scripts/import-postal-geonames.ts

# Step 10: 检查邮编数量
echo ""
echo "📊 邮编数量统计:"
psql -U bxb_user -d bxb_prod -c 'SELECT "countryCode", COUNT(*) FROM "postal_codes" GROUP BY "countryCode" ORDER BY "countryCode";'

# Step 11: 构建
echo ""
echo "🏗️ 构建项目..."
npm run build

# Step 12: 重启 PM2
echo ""
echo "🔄 重启 PM2..."
pm2 restart xixiong-saas
pm2 save

# Step 13: 验证
echo ""
echo "✅ 部署完成！验证中..."
sleep 5
curl -I http://127.0.0.1:3000/
echo ""
curl -I http://127.0.0.1:3000/rss.xml
echo ""
curl -s http://127.0.0.1:3000/api/postal-codes?country=CA\&q=V6B | head -c 200

echo ""
echo "========================================="
echo "✅ v1.12.4 部署完成！"
echo "========================================="
