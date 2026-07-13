# Project Governance

## Environment Rules

### Staging Environment
- Server: deploy@192.129.155.149
- Domain: i.jueshi.net
- PM2: xixiong-staging
- Directory: /home/deploy/xixiong-saas-staging

### Production Environment
- Server: 104.250.109.99
- Domain: jueshi.net
- PM2: xixiong-saas
- Directory: /home/deploy/xixiong-saas

## Deployment Rules

1. All changes must go through staging first
2. Production deployment requires explicit user approval
3. Never modify production database directly
4. Never touch 9833416@qq.com account

## SSH Rules

1. Use scripts/check-staging.sh before any deployment
2. If SSH fails, diagnose and fix before proceeding
3. Never ask user to check SSH - it's agent's responsibility

## Rate Limit Rules

1. When 429 encountered, write rate-limit.lock
2. Sleep 22 minutes, then resume current task
3. If still 429, sleep 30 minutes (max 3 retries)
4. Never continue with new goal/turn - resume current task

## Checkpoint Rules

1. After each task completion, write checkpoint immediately
2. Update: Proposal → Patch → Build → Deploy → Runtime
3. Never wait until night end to write checkpoint

## Report Rules

Never include these phrases in reports:
- "请用户检查 SSH"
- "请用户登录服务器"
- "请用户执行 systemctl"

These are agent responsibilities, not user responsibilities.
