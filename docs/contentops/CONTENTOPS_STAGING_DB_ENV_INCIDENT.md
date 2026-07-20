# ContentOps Staging Database Environment Incident

**Date:** 2026-07-20  
**Severity:** P1 (G7验收阻塞)  
**Duration:** ~4 hours (from detection to resolution)  
**Status:** RESOLVED

---

## 事件表现

G7 Guide 发布后，页面返回 HTTP 200 但内容为 soft 404（"文章未找到"）。

- Guide 记录存在于数据库（id=cmrsoiwhw000bau5pr7u36oyo, status=published）
- 数据库 `guides.metadataJson` 列存在（psql 验证通过）
- Prisma migration 已记录（20260701000000_add_contentops_metadata_json）
- 但 Web 运行时 Prisma 报错：`column guides.metadataJson does not exist`

## 根因分析

**DIAGNOSTIC_CASE=A** — PM2 进程的 DATABASE_URL 指向了错误的数据库。

### 错误配置

| 项目 | 错误值 | 正确值 |
|------|--------|--------|
| PM2 DATABASE_URL | bxb_prod | xixiong_staging |
| PM2 Process ID | 13 | 15/16 |

### 为什么 psql 与运行时结果矛盾

- `psql` 使用 `.env.staging` 中的 DATABASE_URL（正确：xixiong_staging）
- PM2 进程使用启动时缓存的环境变量（错误：bxb_prod）
- PM2 `restart --update-env` 不会完全清除旧环境变量

### 根因链

1. 早期部署时 PM2 使用了错误的 DATABASE_URL（bxb_prod）
2. 后续部署使用 `pm2 restart --update-env`，但旧环境变量未被完全清除
3. Web 进程连接到 bxb_prod 数据库，该数据库没有 metadataJson 列
4. Prisma 查询失败，页面 fallback 到 404 模板

## 修复方式

### 即时修复

```bash
# 删除旧 PM2 进程
pm2 delete xixiong-staging

# 使用正确的环境变量重新启动
set -a && source .env.staging && set +a
export NODE_ENV=production
export PORT=3001
pm2 start npm --name xixiong-staging -- start
pm2 save
```

### 防呆措施（已实施）

1. **deploy-staging.sh 数据库守卫**
   - 解析 .env.staging 中的 DATABASE_URL
   - 拒绝 bxb_prod / xixiong_prod / postgres
   - 必须为 xixiong_staging
   - 失败时 exit 非 0

2. **PM2 启动流程改进**
   - 使用 `pm2 delete` + `pm2 start` 代替 `pm2 restart`
   - 显式 source .env.staging 后启动
   - 启动后验证 PM2 环境变量

3. **prisma.ts 运行时断言**
   - 模块加载时检查 DATABASE_URL（URL 解析守卫）
   - 运行时查询验证 current_database() = xixiong_staging
   - 检查 guides.metadataJson 列存在
   - 失败时 process.exit(1)

4. **自动化测试**
   - scripts/test-database-guard.sh
   - 14 个测试用例覆盖 URL 解析、禁止列表、边界情况

## 新增部署守卫

### deploy-staging.sh

```bash
# 解析数据库名
STAGING_DB_NAME=$(grep '^DATABASE_URL=' .env.staging | \
    sed 's/^DATABASE_URL=//' | sed 's/^"//' | sed 's/"$//' | \
    sed 's/^postgresql:\/\///' | sed 's/^postgres:\/\///' | \
    sed 's/^[^@]*@//' | sed 's/^[^/]*\///' | sed 's/?.*$//')

# 禁止列表
FORBIDDEN_NAMES="bxb_prod xixiong_prod xixiong_production postgres"
for forbidden in $FORBIDDEN_NAMES; do
    if [ "$STAGING_DB_NAME" = "$forbidden" ]; then
        echo "❌ STAGING_DATABASE_GUARD_FAILED"
        exit 23
    fi
done

# 必须为 xixiong_staging
if [ "$STAGING_DB_NAME" != "xixiong_staging" ]; then
    echo "❌ STAGING_DATABASE_GUARD_FAILED"
    exit 24
fi
```

### prisma.ts

```typescript
function assertStagingDatabase(url: string): void {
  const dbMatch = url.match(/\/([^/?]+)(\?|$)/);
  const dbName = dbMatch ? dbMatch[1] : null;
  
  const forbidden = ["bxb_prod", "xixiong_prod", "xixiong_production", "postgres"];
  if (forbidden.includes(dbName)) {
    throw new Error(`STAGING_DB_TARGET_MISMATCH: ${dbName}`);
  }
}

async function runtimeSchemaAssertion(): Promise<void> {
  const result = await prisma.$queryRaw`
    SELECT current_database() as db_name,
           EXISTS(SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'guides' AND column_name = 'metadataJson') as has_metadata
  `;
  
  if (result[0].db_name !== "xixiong_staging") {
    throw new Error("STAGING_DB_TARGET_MISMATCH");
  }
  if (!result[0].has_metadata) {
    throw new Error("STAGING_MIGRATION_MISSING");
  }
}
```

## Production 影响

**Production 未被触碰。**

- 事故仅影响 staging 环境（192.129.155.149）
- Production 服务器（104.250.109.99）未受任何影响
- 无数据丢失
- 无安全泄露

## 经验教训

1. **PM2 环境变量缓存问题**
   - `pm2 restart --update-env` 不会完全清除旧环境变量
   - 必须使用 `pm2 delete` + `pm2 start` 确保环境干净

2. **数据库连接验证**
   - 部署后必须验证实际连接的数据库名
   - 不能仅依赖 .env 文件内容

3. **运行时断言**
   - 应用启动时应验证关键环境配置
   - 失败时快速失败（fail fast）优于静默降级

## 验证结果

部署后验证全部通过：

- ✅ PM2 DATABASE_URL → xixiong_staging
- ✅ Prisma runtime assertion passed
- ✅ G7 Guide 页面 HTTP 200
- ✅ G7 marker 存在（2 occurrences）
- ✅ noindex 生效
- ✅ 无 Prisma 列错误
- ✅ 无 secret 泄露

## 相关文件

- `scripts/deploy-staging.sh` — 数据库守卫
- `scripts/test-database-guard.sh` — 自动化测试
- `src/lib/prisma.ts` — 运行时断言
- `.env.staging` — staging 环境配置（DATABASE_URL=xixiong_staging）
