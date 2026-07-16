# Staging E2E Test Account

## Account Information

- **Email**: e2e-doc-user@jueshi.net
- **Environment**: xixiong_staging
- **Domain**: i.jueshi.net
- **Purpose**: Staging login state and E2E acceptance testing

## Credential Storage

Credentials are stored in:
- **Playwright Storage State**: `tools/jueshi-audit/artifacts/storage-state/user-session.json`
- **Admin Session**: `tools/jueshi-audit/artifacts/storage-state/admin-session.json`

## Usage Guidelines

### For Hermes Agent

- ✅ Staging login acceptance MUST NOT require user to repeatedly provide credentials
- ✅ Prefer reading existing Hermes/E2E secrets from storage state files
- ✅ Use `tools/jueshi-audit/artifacts/storage-state/user-session.json` for automated testing
- ✅ Refresh storage state when session expires (check `expires` timestamp)
- ✅ SSH MUST use `deploy` user, NEVER use `root`

### Security Rules

- ❌ NEVER commit actual passwords, tokens, or session secrets to git
- ❌ NEVER touch or modify `9833416@qq.com` account
- ❌ NEVER expose cookies, session tokens, or authentication secrets in logs
- ❌ NEVER reset or modify protected accounts

### Credential Rotation

When credentials are lost or expired:
1. Only rotate staging-specific test accounts (`e2e-doc-user@jueshi.net`)
2. Generate new storage state via Playwright login flow
3. Update `tools/jueshi-audit/artifacts/storage-state/user-session.json`
4. Document rotation in git commit message (without exposing secrets)

## Session Expiration Check

Storage state files contain `expires` timestamps. Check before use:

```bash
# Check if session is still valid
cat tools/jueshi-audit/artifacts/storage-state/user-session.json | jq '.cookies[] | select(.name == "__Secure-authjs.session-token") | .expires'
```

If expired, re-authenticate via Playwright or browser automation.

## Related Files

- `tools/jueshi-audit/artifacts/storage-state/user-session.json` - User session
- `tools/jueshi-audit/artifacts/storage-state/admin-session.json` - Admin session
- `AGENTS.md` - Staging login policy
- `docs/HERMES_ALWAYS_READ.md` - Security rules
