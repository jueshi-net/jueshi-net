# ADR-005: Production 保护规则

## Status

✅ **Accepted** — 永久生效

## Context

jueshi.net 是一个面向海外华人用户的在线平台，包含：

- 用户数据（账户、收藏、文档）
- 支付信息（订阅、订单）
- 业务数据（工具使用记录、社区内容）
- 管理后台（内容管理、用户管理）

任何 Production 环境的错误都可能导致：
- 用户数据丢失
- 服务中断
- 安全漏洞
- 品牌损害

需要建立严格的 Production 保护机制，确保：
1. 所有变更经过充分测试
2. 变更可追溯、可回滚
3. 关键账号和数据受到保护
4. 紧急情况下可快速恢复

## Decision

建立 **Production 保护规则体系**，包括：

### 1. Staging-First 流程

所有变更必须遵循以下流程：

```
feature/* → staging branch → i.jueshi.net → 用户验收 → audit → main → jueshi.net → smoke test → 观察
```

**规则**：
- ❌ 禁止直接修改 Production
- ✅ 所有变更先在 Staging 验证
- ✅ 用户验收后才能进入 Production
- ✅ 必须通过 Audit Gate

### 2. Audit Gate（强制）

Production 发布前必须运行 `tools/jueshi-audit`：

**规则**：
- ✅ 没有证据路径的 audit 结果无效
- ✅ P0/P1 问题未清除不能进入 Production
- ✅ 用户不能豁免 P0/P1
- ✅ 用户可以豁免 P2/P3

### 3. 环境标记

所有部署脚本必须读取环境标记：

**标记位置**：
- `/etc/jueshi-environment` (优先)
- `/home/deploy/.jueshi-environment` (备选)

**规则**：
- ✅ 脚本必须读取环境标记
- ✅ 环境不匹配则 `exit 1`
- ✅ 防止误操作（如在 Production 运行 Staging 脚本）

### 4. 永久禁止事项

**代码层面**：
- ❌ `prisma db push` — 永远禁止
- ❌ 破坏性 SQL (DROP/DELETE/TRUNCATE) — 永远禁止
- ❌ 输出密钥 (DATABASE_URL, SSH key, password) — 永远禁止

**运维层面**：
- ❌ Production 直接修改 — 必须 staging-first
- ❌ 未经确认切换 DNS — 永远禁止
- ❌ 声称用户满意 — 永远禁止
- ❌ 扩展 Beta — 永远禁止
- ❌ 公开推广 — 永远禁止

### 5. 账号保护

**永久保护账号**：
- `9833416@qq.com` — 禁止修改/删除/重置/repurpose

**规则**：
- ❌ 禁止修改账号信息
- ❌ 禁止删除账号
- ❌ 禁止重置密码
- ❌ 禁止 repurpose（改作他用）

### 6. 回滚机制

**规则**：
- ✅ Production 必须可回滚
- ✅ 回滚前必须备份
- ✅ 回滚后必须验证
- ✅ 回滚脚本需要人工确认

### 7. 硬禁止文件

以下文件在任何情况下都不能被自动化工具修改：

```
package.json
package-lock.json
prisma/schema.prisma
src/middleware.ts
src/app/api/**
src/lib/task-chain.ts
src/lib/destinations-db.ts
.env / .env.*
**/SKILL.md
```

## Alternatives Considered

### Alternative 1: 无保护规则

**Approach**: 允许直接修改 Production

**Pros**:
- 快速响应
- 灵活性高

**Cons**:
- 高风险
- 无法回滚
- 用户数据可能丢失

**Why Rejected**: 风险过高，不可接受

### Alternative 2: 仅依赖 Code Review

**Approach**: 通过 Code Review 保证质量

**Pros**:
- 人工把关
- 灵活判断

**Cons**:
- 无法防止所有错误
- 依赖人工，可能遗漏
- 无法自动回滚

**Why Rejected**: 不足以保证 Production 安全

### Alternative 3: 仅依赖自动化测试

**Approach**: 通过自动化测试保证质量

**Pros**:
- 自动化验证
- 可重复执行

**Cons**:
- 测试覆盖率有限
- 无法覆盖所有场景
- 无法防止配置错误

**Why Rejected**: 测试不能替代流程保护

## Consequences

### Positive

1. **降低风险** — 所有变更经过充分验证
2. **可追溯** — 所有变更有审计记录
3. **可回滚** — 错误可快速恢复
4. **保护用户** — 用户数据和账号安全
5. **保护品牌** — 减少生产事故

### Negative

1. **流程复杂** — 变更需要经过多个步骤
2. **发布周期长** — 从开发到上线需要时间
3. **灵活性受限** — 紧急情况也需要走流程
4. **学习成本** — 新成员需要学习规则

### Mitigations

- **流程复杂**: 文档化在 `PROJECT_GOVERNANCE.md`，提供清晰指南
- **发布周期长**: 通过 Night Pipeline 自动化加速
- **灵活性受限**: 建立紧急响应流程（但仍需基本验证）
- **学习成本**: 提供培训和文档

## Implementation Details

### 环境标记检查

```bash
#!/bin/bash
# deploy-staging.sh

ENV_FILE="/etc/jueshi-environment"
if [ -f "$ENV_FILE" ]; then
  ENV=$(cat "$ENV_FILE")
else
  ENV=$(cat "/home/deploy/.jueshi-environment" 2>/dev/null)
fi

if [ "$ENV" != "staging" ]; then
  echo "ERROR: This script can only run on staging environment"
  echo "Current environment: $ENV"
  exit 1
fi
```

### Audit Gate 流程

```bash
# 1. 运行 audit
tools/jueshi-audit

# 2. 检查结果
# - 查看 evidence/<run-id>/
# - 确认 P0/P1 问题已清除

# 3. 通过后部署
deploy-production-safe.sh
```

### 回滚流程

```bash
# 1. 确认问题
# 2. 备份当前状态
# 3. 执行回滚（需要人工确认）
rollback-production.sh

# 4. 验证回滚
smoke-test.sh --base-url https://jueshi.net
```

### 账号保护检查

```bash
# 在所有涉及用户操作的脚本中
if [ "$USER_EMAIL" = "9833416@qq.com" ]; then
  echo "ERROR: This account is permanently protected"
  exit 1
fi
```

## Related Decisions

- **ADR-001**: Night Pipeline V3
- **ADR-002**: V4 Shell 统一架构
- **ADR-004**: Public Layout 架构

## References

- `tools/jueshi-audit` — Audit 工具
- `scripts/deploy-staging.sh` — Staging 部署脚本
- `scripts/deploy-production-safe.sh` — Production 部署脚本
- `scripts/rollback-production.sh` — 回滚脚本
- `PROJECT_BIBLE.md` — 永久规则
- `PROJECT_GOVERNANCE.md` — 治理规则

---

**Decision Date**: 2026-07-08  
**Decision Makers**: Development Team  
**Review Date**: 永久生效（不定期审查）
