# Development Guardrails: 绝世百宝箱开发护栏

> **最后更新**: 2026-06-14  
> **本文档用途**: 每轮开发前必须读取的开发检查清单  
> **配套文档**: `docs/PROJECT_MEMORY.md`

---

## 每轮开发前必须回答的问题

在开始任何开发工作前，必须明确回答以下问题：

1. **本轮目标是什么？**
   - 必须明确、具体、可验证
   - 不得模糊、不得发散

2. **本轮禁止做什么？**
   - 必须列出明确的禁止事项
   - 必须与用户确认

3. **是否涉及 DB？**
   - 是 → 需要 migration preflight
   - 否 → 继续

4. **是否涉及 migration？**
   - 是 → 需要用户明确批准
   - 否 → 继续

5. **是否涉及 Auth？**
   - 是 → 需要谨慎测试游客/登录边界
   - 否 → 继续

6. **是否涉及 Workspace？**
   - 是 → 需要验证 userId 隔离
   - 否 → 继续

7. **是否涉及游客体验？**
   - 是 → 必须验证 localStorage 边界
   - 否 → 继续

8. **是否影响已有核心工具？**
   - 是 → 必须回归测试受影响工具
   - 否 → 继续

9. **是否需要生产部署？**
   - 是 → 需要 Deploy Gate
   - 否 → 继续

10. **如何回滚？**
    - 必须有明确的回滚方案
    - 必须有备份

11. **如何验证？**
    - 必须列出验证步骤
    - 必须区分 smoke test 和业务 E2E

12. **如何证明没有修门坏窗？**
    - 必须验证未修改的功能仍正常
    - 必须回归测试相关工具

---

## Gate A: Pre-Code Gate

### 必须执行

- [ ] 读取 `docs/PROJECT_MEMORY.md`
- [ ] 确认本轮目标
- [ ] 确认本轮边界
- [ ] 确认禁止事项
- [ ] 确认不碰 DB / Auth / Workspace（除非用户批准）

### 检查清单

```bash
# 确认当前分支
git branch --show-current

# 确认 working tree 状态
git status --short

# 确认与 origin/main 的差异
git log origin/main..HEAD --oneline
```

---

## Gate B: Build Gate

### 环境检查

```bash
# 必须确认 Node 版本
node -v  # 必须是 v22.22.2

# 必须确认 npm 版本
npm -v  # 必须是 10.9.7

# 必须确认 V8 版本
node -e "console.log(process.versions.v8)"  # 必须是 .39
```

### Build 验证

```bash
# 必须 exit 0
npm run build
```

### 禁止事项

- ❌ 不得在 Node v22.22.3 下 build
- ❌ 不得删除 package-lock.json
- ❌ 不得随意 npm install

---

## Gate C: Functional Gate

### 必须验证

- [ ] 至少覆盖受影响工具
- [ ] 必须验证游客与登录态边界（如涉及）
- [ ] 必须验证 localStorage（如涉及）
- [ ] 必须验证 Workspace（如涉及）
- [ ] 必须验证生产 API（如部署）

### 验证方法

| 场景 | 验证方法 |
|---|---|
| 游客访问工具页 | 无登录状态浏览器上下文 |
| 游客本地保存 | 填写表单 → 点击保存 → 检查 localStorage |
| 游客刷新恢复 | 刷新页面 → 检查表单是否恢复 |
| 登录用户保存 | 登录后保存 → 检查 Workspace |
| 打印功能 | mock window.print → 验证 printCalled=true |
| 375px 响应式 | Playwright viewport 375x812 → 验证无横向溢出 |

### 禁止混淆

- ❌ 页面 200 ≠ 功能通过
- ❌ 代码存在 ≠ 功能通过
- ❌ build 成功 ≠ 功能通过
- ❌ 字段存在 ≠ 公司资料复用

---

## Gate D: Security Gate

### 必须检查

- [ ] 不输出密码
- [ ] 不输出完整 DATABASE_URL
- [ ] 不输出 token
- [ ] 不硬编码测试密码
- [ ] 检查 origin/main..HEAD 无敏感信息

### 检查命令

```bash
# 检查是否有敏感信息
git diff origin/main..HEAD | grep -iE "(password|secret|token|DATABASE_URL)" | grep -v "\*\*\*"

# 检查是否有硬编码密码
grep -r "Test123456" src/ --exclude-dir=node_modules

# 检查是否有 .env 文件
git status | grep ".env"
```

### 禁止事项

- ❌ 不得在报告中输出完整 DATABASE_URL
- ❌ 不得在代码中硬编码测试密码
- ❌ 不得提交 .env 文件

---

## Gate E: Deploy Gate

### 部署前检查

- [ ] 备份生产目录
- [ ] rsync 排除 `.env*`
- [ ] prisma migrate status（只读检查）
- [ ] 不执行 db push
- [ ] build exit 0
- [ ] PM2 restart
- [ ] smoke test
- [ ] logs 检查
- [ ] rollback plan

### 备份命令

```bash
# 生产备份
ssh deploy@192.129.155.149
cd /home/deploy
tar -czf backups/xixiong-saas-pre-$(date +%Y%m%d-%H%M%S).tar.gz \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='logs' \
  xixiong-saas/
```

### rsync 命令

```bash
# 必须排除 .env*
rsync -avz \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='.git' \
  --exclude='.env' \
  --exclude='.env.*' \
  --exclude='logs' \
  --exclude='backups' \
  ./ deploy@192.129.155.149:/home/deploy/xixiong-saas/
```

### 构建命令

```bash
# 加载环境变量
set -a && source .env.production && set +a

# Prisma generate
NODE_ENV=production npx prisma generate

# 检查 migration 状态（只读）
npx prisma migrate status

# Build
npm run build

# PM2 restart
pm2 restart xixiong-saas
```

### 禁止事项

- ❌ 不得执行 prisma db push（除非明确批准）
- ❌ 不得覆盖 .env.production
- ❌ 不得在 build 失败时 PM2 restart

---

## Gate F: Post-Deploy Gate

### 必须验证

- [ ] 首页 200
- [ ] /tools 200
- [ ] 受影响工具 200
- [ ] /workspace 307（重定向到登录）
- [ ] Runtime DB 检查（脱敏）
- [ ] logs 无严重错误
- [ ] known gaps 更新

### Smoke Test 命令

```bash
# 首页
curl -s -o /dev/null -w "HTTP %{http_code}" https://jueshi.net

# 工具页
curl -s -o /dev/null -w "HTTP %{http_code}" https://jueshi.net/tools

# 受影响工具
curl -s -o /dev/null -w "HTTP %{http_code}" https://jueshi.net/tools/[affected-tool]

# Workspace（应重定向）
curl -s -o /dev/null -w "HTTP %{http_code}" https://jueshi.net/workspace
```

### Runtime DB 检查

```bash
# 脱敏检查
ssh deploy@192.129.155.149
cd /home/deploy/xixiong-saas
set -a && source .env.production && set +a
node -e "
const url = process.env.DATABASE_URL || '未设置';
const masked = url.replace(/:\/\/([^:]+):([^@]+)@/, '://\$1:***@');
console.log('DATABASE_URL:', masked);
"
```

### Logs 检查

```bash
# 检查严重错误
pm2 logs xixiong-saas --lines 100 --nostream | grep -iE "error|500" | grep -v "MissingCSRF" | grep -v "CredentialsSignin" | grep -v "Failed to find Server Action"
```

### 禁止事项

- ❌ 不得输出完整 DATABASE_URL
- ❌ 不得忽略严重错误
- ❌ 不得在未验证的情况下宣布部署成功

---

## 回滚方案

### 回滚条件

如出现以下任一情况，必须回滚：

- npm run build 失败
- pm2 restart 后 app 不 online
- 首页 500
- /tools 500
- 受影响工具 500
- Workspace 登录态出现严重 500
- Runtime DB 检查失败
- 日志出现 DATABASE_URL 泄露
- 日志出现数据库密码泄露
- 出现无法解释的大量 500

### 回滚步骤

```bash
# 1. 停止当前版本
pm2 stop xixiong-saas

# 2. 恢复备份
cd /home/deploy
rm -rf xixiong-saas
tar -xzf backups/xixiong-saas-pre-YYYYMMDD-HHMMSS.tar.gz

# 3. 重新构建
cd xixiong-saas
npm ci
set -a && source .env.production && set +a
NODE_ENV=production npx prisma generate
npm run build

# 4. 重启
pm2 restart xixiong-saas

# 5. 验证
curl -s -o /dev/null -w "HTTP %{http_code}" https://jueshi.net
```

---

## 每轮开发后的检查清单

### 必须更新

- [ ] `docs/PROJECT_MEMORY.md`（如有新信息）
- [ ] `reports/product-roadmap/current-system-state-and-next-direction.md`（如有状态变化）
- [ ] 已知 Beta 缺口清单（如有变化）

### 必须输出

- [ ] 本轮报告（包含所有 Gate 检查结果）
- [ ] 下一步建议
- [ ] 是否建议恢复 Beta（默认否）
- [ ] 是否建议进入下一 Sprint（默认否）

---

**本文档是开发护栏，每轮开发前必须读取。**
