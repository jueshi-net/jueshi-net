# Code Bridge Rate Limit Policy

**Version:** 1.0  
**Last Updated:** 2026-07-07  
**Mode:** DEV (staging only)

---

## 1. Core Principle

**claude-safe is the ONLY allowed entry point for Claude Code calls.**

- ❌ Direct `claude` command execution is FORBIDDEN for business tasks
- ✅ All Claude Code calls MUST go through `claude-safe` wrapper
- ✅ Rate limiting and 429 detection are MANDATORY

---

## 2. Claude-Safe Configuration

### Location
```
/Users/chq/bin/claude-safe
```

### Critical Requirements
1. **settings.json 必须使用 env 结构** - 不支持旧的 apiKey/baseUrl 格式
2. **claude-safe 必须调用真实 Claude 二进制绝对路径** - `/Users/chq/.hermes/node/bin/claude`
3. **shim 只能用于拦截 Code Bridge 的 claude 命令** - 不能全局替换
4. **防止递归** - shim → claude-safe → 真实 claude，不能 shim → claude-safe → shim

### Exit Codes
| Code | Meaning | Action |
|------|---------|--------|
| 0 | Success | Continue |
| 75 | Rate Limited (429) | STOP, report `CLAUDE_CODE_RATE_LIMITED_PAUSED_30_MIN` |
| 1 | General Failure | STOP, report `CODE_BRIDGE_CALL_FAILED_NO_FALLBACK` |

### Throttling Parameters
- **Minimum interval between calls:** 300 seconds (5 minutes)
- **429 pause duration:** 1800 seconds (30 minutes)
- **Rate limit exit code:** 75 (not 429, to avoid shell exit code issues)

### State Files
```
~/.claude-code-bridge/
├── claude-safe.log          # Call log
├── last-call.ts             # Last call timestamp
├── last-output.txt          # Last call output
└── rate-limit.lock          # 429 lock file (contains unlock timestamp)
```

---

## 3. Hermes Code Bridge Integration

### Current Status
- **Shim created:** `~/bin/claude-bridge-shim/claude` → calls `claude-safe`
- **PATH priority:** Shim directory should be first in PATH for Code Bridge calls
- **Skill file:** `~/.hermes/plugins/hermes-code-bridge/skills/hermes-code-bridge/SKILL.md`
  - Currently references `claude` command directly
  - Needs update to use `claude-safe` or ensure PATH includes shim

### Required PATH Configuration
```bash
export PATH="/Users/chq/bin/claude-bridge-shim:/Users/chq/bin:$PATH"
```

This ensures:
1. `claude` command resolves to shim
2. Shim calls `claude-safe`
3. `claude-safe` calls real `claude` with rate limiting

---

## 4. Rate Limit Detection

### Detection Keywords
`claude-safe` monitors output for:
- `429`
- `rate limit`
- `too many requests`
- `quota`
- `throttle`

### Detection Logic
```bash
if grep -Ei "429|rate limit|too many requests|quota|throttle" "$STATE_DIR/last-output.txt"; then
  # Create lock file with 30-minute pause
  pause_until=$(( $(date +%s) + 1800 ))
  echo "$pause_until" > "$LOCK_FILE"
  
  # Log detection
  echo "CLAUDE_CODE_RATE_LIMIT_DETECTED pause_seconds=1800" >> "$LOG_FILE"
  echo "CLAUDE_CODE_RATE_LIMITED_PAUSED_30_MIN" >> "$LOG_FILE"
  
  # Exit with code 75
  exit 75
fi
```

---

## 5. Failure Handling Rules

### Rule 1: No Fallback to Direct Code Writing
**When Claude Code fails (exit code != 0 and != 75):**
- ❌ Hermes MUST NOT fallback to writing code directly
- ✅ Hermes MUST report: `CODE_BRIDGE_CALL_FAILED_NO_FALLBACK`
- ✅ Hermes MUST stop and wait for user instruction

### Rule 2: Rate Limit Handling
**When Claude Code is rate limited (exit code = 75 or output contains `CLAUDE_CODE_RATE_LIMITED_PAUSED_30_MIN`):**
- ❌ Hermes MUST NOT retry immediately
- ✅ Hermes MUST report: `CLAUDE_CODE_RATE_LIMITED_PAUSED_30_MIN`
- ✅ Hermes MUST stop and wait for user instruction

### Rule 3: Success Handling
**When Claude Code succeeds (exit code = 0):**
- ✅ Hermes MAY continue with the task
- ✅ Hermes MUST verify the changes
- ✅ Hermes MUST wait for user confirmation before next Claude Code call

---

## 6. Development Workflow Rules

### Rule 1: One Call Per Round
- Each development round allows **maximum 1 Claude Code call**
- After the call, MUST wait for user confirmation
- No automatic retry or follow-up calls

### Rule 2: No Visual Claims Without Screenshots
- ❌ Cannot claim "视觉通过" (visual pass) without screenshots
- ✅ Must provide screenshot evidence or explicitly state "截图失败" (screenshot failed)

### Rule 3: No Completion Claims Without New Commit
- ❌ Cannot claim "完成" (complete) without new commit
- ✅ Must generate new commit with proper message
- ✅ Must verify commit is not a duplicate

---

## 7. Smoke Test Requirements

### Pre-Flight Check
Before any Claude Code call:
1. Verify `claude-safe` exists and is executable
2. Verify PATH includes shim directory
3. Verify Claude Code is authenticated (`claude --version` should work)
4. Check `rate-limit.lock` - if exists and not expired, STOP

### Smoke Test Procedure
1. Call `claude-safe` with simple prompt: "只回答：CLAUDE_SAFE_BRIDGE_OK"
2. Check exit code:
   - 0: Success, check output contains `CLAUDE_SAFE_BRIDGE_OK`
   - 75: Rate limited, STOP
   - Other: Failure, STOP
3. **Verify `claude-safe.log` has new entry** - 必须确认日志有新增记录
4. Verify `last-output.txt` contains expected output
5. Verify no business files were modified

### Smoke Test Validation
```bash
# 1. 执行 smoke test
cd /tmp && PATH="/Users/chq/bin/claude-bridge-shim:$PATH" claude -p "只回答 CLAUDE_SAFE_BRIDGE_OK"

# 2. 检查日志新增记录
tail -1 ~/.claude-code-bridge/claude-safe.log
# 必须看到新的 CLAUDE_SAFE_EXIT status=0 记录

# 3. 检查输出
cat ~/.claude-code-bridge/last-output.txt
# 必须包含 CLAUDE_SAFE_BRIDGE_OK

# 4. 检查无业务改动
cd /Users/chq/xixiong-saas && git status --short
# 必须为空
```

### Smoke Test Gate
**未通过 smoke test 前禁止真实开发。**

必须满足以下条件才能开始真实开发：
- ✅ claude-safe.log 有新增记录
- ✅ last-output.txt 包含 CLAUDE_SAFE_BRIDGE_OK
- ✅ git status --short 为空
- ✅ 退出码为 0

如果任一条件不满足，必须停止并报告：
- `CODE_BRIDGE_STILL_CALLS_RAW_CLAUDE` - 如果 Code Bridge 绕过 claude-safe
- `CLAUDE_CODE_AUTH_STILL_NOT_READY` - 如果认证失败
- `CLAUDE_SAFE_RECURSION_FOUND` - 如果出现递归

---

## 8. Troubleshooting

### Issue: Claude Code Not Authenticated
**Symptom:** `claude --version` returns error or requires login  
**Solution:**

**百炼模式（推荐）：**
```bash
# 1. 设置 ~/.claude.json 跳过 onboarding
cat > ~/.claude.json <<EOF
{
  "hasCompletedOnboarding": true
}
EOF

# 2. 设置 ~/.claude/settings.json 使用 env 结构
cat > ~/.claude/settings.json <<EOF
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "YOUR_API_KEY",
    "ANTHROPIC_BASE_URL": "https://coding.dashscope.aliyuncs.com/apps/anthropic",
    "ANTHROPIC_MODEL": "qwen3-coder-plus"
  }
}
EOF

# 3. 验证
claude --version
```

**Anthropic 官方模式（不推荐）：**
```bash
claude login
# Follow authentication flow
```

**注意：** 百炼模式下不要执行 `claude login`，会覆盖配置。

### Issue: Rate Limit Lock Stuck
**Symptom:** All calls return exit code 75  
**Solution:**
```bash
# Check lock file
cat ~/.claude-code-bridge/rate-limit.lock

# If timestamp is in the past, remove lock
rm ~/.claude-code-bridge/rate-limit.lock
```

### Issue: Shim Not Being Used
**Symptom:** Calls bypass rate limiting  
**Solution:**
```bash
# Verify PATH
echo $PATH | tr ':' '\n' | grep claude-bridge-shim

# Verify shim
which claude
# Should return: /Users/chq/bin/claude-bridge-shim/claude

# If not, update PATH
export PATH="/Users/chq/bin/claude-bridge-shim:$PATH"
```

---

## 9. Rollback Plan

### Disable claude-safe
```bash
# Remove shim from PATH
export PATH=$(echo $PATH | sed 's|/Users/chq/bin/claude-bridge-shim:||g')

# Verify direct claude works
which claude
# Should return: /Users/chq/.hermes/node/bin/claude
```

### Remove Rate Limiting
```bash
# Remove lock file
rm ~/.claude-code-bridge/rate-limit.lock

# Reset last call timestamp
rm ~/.claude-code-bridge/last-call.ts
```

---

## 10. Compliance Checklist

Before each Claude Code call, verify:
- [ ] Using `claude-safe` (not direct `claude`)
- [ ] PATH includes shim directory
- [ ] No rate limit lock active
- [ ] Minimum 5 minutes since last call
- [ ] User confirmation received for this round
- [ ] No fallback to direct code writing on failure

After each Claude Code call, verify:
- [ ] Exit code is 0 (success) or 75 (rate limited)
- [ ] Output logged to `claude-safe.log`
- [ ] No business files modified unexpectedly
- [ ] User informed of result
- [ ] Waiting for user confirmation before next call

---

## 11. Contact & Support

**Policy Owner:** Hermes Agent System  
**Last Review:** 2026-07-07  
**Next Review:** After first production use

---

**END OF POLICY**
