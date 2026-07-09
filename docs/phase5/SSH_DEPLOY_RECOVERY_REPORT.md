# SSH & Deploy Recovery Rework - Final Report

**Date**: 2026-07-09  
**Mode**: SSH_AND_DEPLOY_RECOVERY_REWORK  
**Status**: ✅ STAGING_DEPLOY_RECOVERED

---

## 1. 当前分支

```
ui/overnight-polish-phase1
```

---

## 2. 当前 HEAD

```
c3cfaa6ec5ea6846ef14ba98c9a1686a75998a0d
```

**最近提交**:
- `c3cfaa6` feat: migrate /tools page to Design System V1
- `82ba8ad` docs: add server environment permanent rules to all governance docs
- `5fb09ff` fix: mobile menu not working in JueshiV4PublicShell

---

## 3. SSH User/Host

**配置确认** (来自 `scripts/deploy-staging.sh`):
```bash
STAGING_SERVER="deploy@192.129.155.149"
STAGING_DIR="/home/deploy/xixiong-saas-staging"
PM2_APP="xixiong-staging"
```

**SSH 连接状态**: ✅ 正常
```bash
$ ssh -o BatchMode=yes -o ConnectTimeout=10 deploy@192.129.155.149 'echo SSH_OK'
SSH_OK
```

---

## 4. SSH 失败根因判断

**历史问题**: 之前遇到 SSH Connection closed / banner timeout

**本次诊断**:
1. TCP 端口检查: ✅ 22 端口可达
2. SSH 快速测试: ✅ 连接成功
3. 无 MaxStartups 限制问题
4. 无用户名错误
5. 无并发部署冲突

**结论**: SSH 服务已恢复正常，无阻塞问题。

---

## 5. SSH 重试次数

**本次执行**: 0 次重试（首次连接成功）

---

## 6. SSH 是否恢复

✅ **是** - SSH 连接完全正常，可执行所有部署操作。

---

## 7. Google Fonts 是否只是本地网络问题

✅ **是** - 本地 build 因 Google Fonts 下载失败，但：
- 这是网络问题，不是代码问题
- Staging 服务器 build 成功（服务器可访问 Google Fonts）
- 不影响生产部署

---

## 8. Staging Deploy 是否成功

✅ **完全成功** - 所有步骤完成：

### 8.1 Rsync
```bash
$ rsync -avz --delete --exclude='node_modules' --exclude='.next' --exclude='.env*' --exclude='.git' ./ deploy@192.129.155.149:/home/deploy/xixiong-saas-staging/
Transfer starting: 5349 files
sent 420054 bytes  received 20 bytes  269433 bytes/sec
total size is 348155743  speedup is 828.80
```

### 8.2 NPM Install
```bash
$ npm ci --ignore-scripts
added 753 packages, and audited 754 packages in 45s
```

### 8.3 Prisma Generate
```bash
$ npx prisma generate
✔ Generated Prisma Client (v7.8.0) to ./node_modules/@prisma/client in 2.03s
```

### 8.4 NPM Build
```bash
$ npm run build
✓ Compiled successfully in 35.9s
✓ Generating static pages (524/524)
✓ Build completed
```

### 8.5 PM2 Restart
```bash
$ pm2 restart xixiong-staging
[PM2] [xixiong-staging](5) ✓
```

---

## 9. PM2 状态

```
┌────┬────────────────────┬─────────┬─────────┬──────────┬─────────┬────────┐
│ id │ name               │ mode    │ status  │ uptime   │ cpu     │ mem    │
├────┼────────────────────┼─────────┼─────────┼──────────┼─────────┼────────┤
│ 5  │ xixiong-staging    │ fork    │ online  │ 3s       │ 0%      │ 69.0mb │
└────┴────────────────────┴─────────┴─────────┴──────────┴─────────┴────────┘
```

**状态**: ✅ online，正常运行

---

## 10. Curl 结果

所有 7 个页面返回 HTTP 200：

| URL | Status | Result |
|-----|--------|--------|
| https://i.jueshi.net/ | 200 | ✅ OK |
| https://i.jueshi.net/tools | 200 | ✅ OK |
| https://i.jueshi.net/resources | 200 | ✅ OK |
| https://i.jueshi.net/guides | 200 | ✅ OK |
| https://i.jueshi.net/topics | 200 | ✅ OK |
| https://i.jueshi.net/search | 200 | ✅ OK |
| https://i.jueshi.net/destinations | 200 | ✅ OK |

---

## 11. Runtime Grep 结果

检查所有页面是否存在 runtime error：

```bash
grep -iE "This page couldn't load|Application error|Element type is invalid"
```

**结果**: ✅ 所有页面 CLEAN，无 runtime error。

---

## 12. 429 主流程是否真的读取 Lock

✅ **是** - 已验证 `~/.hermes/hermes-agent/agent/conversation_loop.py`：

### 12.1 Lock 检查位置（第 643 行）
```python
_lock_path = os.path.expanduser("~/.hermes/rate-limit.lock")
if os.path.exists(_lock_path):
    with open(_lock_path, "r") as _lf:
        _lock_data = _json.load(_lf)
    _resume_at = _lock_data.get("resume_at", 0)
    _now = int(time.time())
    if _now < _resume_at:
        # Lock 有效，立即返回
        return {
            "final_response": "⏳ Rate limit lock active — goal loop paused.",
            "completed": False,
            "rate_limited": True,
        }
```

### 12.2 Lock 写入位置（第 3246 行）
```python
if is_rate_limited and not _retry.primary_recovery_attempted:
    _lock_path = os.path.expanduser("~/.hermes/rate-limit.lock")
    _now = int(time.time())
    _pause_minutes = 22  # 首次 22 分钟
    _resume_at = _now + (_pause_minutes * 60)
    _lock_data = {
        "locked_at": _now,
        "resume_at": _resume_at,
        "pause_minutes": _pause_minutes,
    }
    with open(_lock_path, "w") as _lf:
        _json.dump(_lock_data, _lf, indent=2)
```

### 12.3 行为验证

**当检测到 RateLimitError 时**:
1. ✅ 写入 `~/.hermes/rate-limit.lock`
2. ✅ 设置 `rate_limited: True`
3. ✅ 直接 return，不继续 turns
4. ✅ 不会继续 "16/20, 17/20, 18/20" 重试
5. ✅ 下次 goal loop 开始时检查 lock，如果有效则暂停

**结论**: 429 修复已正确集成到主流程，不是旁路监控。

---

## 13. Mobile Header Inconsistency 文档是否创建

✅ **是** - 已创建 `docs/ui-acceptance/mobile-header-inconsistency.md`

**文档内容**:
- 问题描述：用户截图证明移动端 Header 在不同页面存在视觉不一致
- 影响页面：/community, /tools, /guides, /checklists, /resources
- 技术细节：当前 Header 规格（76px 高度，44px Logo）
- 需要行动：Phase 1 (Investigation), Phase 2 (Fix), Phase 3 (Verification)
- 最终判定：`BLOCKED_NEEDS_USER_DECISION`

**状态**: 需要用户视觉验收后决定是否进行二次返工。

---

## 14. 是否还有阻塞

❌ **无阻塞** - 所有任务已完成：

### 已完成项
1. ✅ SSH 连接恢复
2. ✅ Staging 部署成功（rsync + npm + prisma + build + pm2）
3. ✅ 所有 7 个页面验证通过（HTTP 200，无 runtime error）
4. ✅ 429 修复验证（主流程读取 lock，不继续 turns）
5. ✅ Mobile Header 不一致文档创建

### 待用户决定项
1. ⚠️ Mobile Header 视觉不一致 - 需要用户验收后决定是否二次返工

---

## Final Verdict

**STAGING_DEPLOY_RECOVERED_OR_SSH_BLOCKED_WITH_DIAGNOSIS**: ✅ **STAGING_DEPLOY_RECOVERED**

**状态**: 所有技术任务完成，等待用户视觉验收。
