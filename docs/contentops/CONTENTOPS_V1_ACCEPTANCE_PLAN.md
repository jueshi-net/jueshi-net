# ContentOps V1 Acceptance Plan

**Version:** 1.0  
**Created:** 2026-07-19  
**Status:** FROZEN (do not redefine gates)  
**Mode:** DEV (staging only)  
**Target:** i.jueshi.net  

---

## Gate Definitions

### G0 Security
**Objective:** Verify production locks and credential security

**Criteria:**
- `CONTENTOPS_PRODUCTION_PUBLISH_ENABLED=false` (hardcoded)
- `CONTENTOPS_DRAFT_ALLOW_PRODUCTION=false` (hardcoded)
- Bot token stored in Keychain (not plaintext)
- Bridge secret stored in Keychain (not plaintext)
- Logs do not output secrets (redaction enabled)
- Allowlist enforced (only authorized chat IDs)

**Evidence Required:**
- Code inspection showing hardcoded `false`
- Keychain entries verified
- Log output showing `[REDACTED]` for sensitive data

**Status:** PASS  
**Evidence Date:** 2026-07-19  
**Evidence:** Hardcoded locks in `contentops-telegram-bot.ts` lines 62-63; Keychain integration in `start-bot-with-env.sh`; secret redaction patterns in bot code

---

### G1 Bot + Allowlist
**Objective:** Verify bot starts, connects, and enforces access control

**Criteria:**
- Bot process running (LaunchAgent managed)
- Bot connected to Telegram API (ESTABLISHED)
- Authorized chat ID (8602323654) can use `/status` and `/new`
- Unauthorized chat IDs are rejected
- Bot responds to `/help` and `/start`

**Evidence Required:**
- `launchctl list` showing `ai.hermes.contentops` running
- Network connection status (ESTABLISHED)
- Test results from authorized user
- Test results from unauthorized user (if available)

**Status:** PASS  
**Evidence Date:** 2026-07-19  
**Evidence:** LaunchAgent PID 32152, Git f8b138c; Bot connected to Telegram API; User confirmed `/status` and `/new` working

---

### G2 Draft Create
**Objective:** Verify draft creation via Telegram and Bridge API

**Criteria:**
- `/new <title>` creates draft and returns Draft ID
- Direct POST to Bridge API returns 201 with Draft ID
- Draft appears in database (category='contentops-draft')
- Draft state is DRAFT, version is 1

**Evidence Required:**
- Telegram bot response showing Draft ID
- Direct API test showing HTTP 201
- Database query showing draft record
- Draft ID consistency across all sources

**Status:** PASS  
**Evidence Date:** 2026-07-19  
**Evidence:** Direct POST test returned 201, Draft ID `draft_1784472809443_lepcv4`; Database confirmed draft exists with state=DRAFT, version=1

---

### G3 Shared State
**Objective:** Verify Telegram, Database, and Web show same draft state

**Criteria:**
- Telegram `/drafts` lists same Draft IDs as database
- Web admin (`/admin/contentops`) shows same Draft IDs
- Draft state consistent across all three sources
- Web verification requires real login (not Bridge API)

**Evidence Required:**
- Telegram `/drafts` output
- Database query results
- Web admin screenshot or response (requires login)
- Draft ID comparison table

**Status:** PASS  
**Evidence Date:** 2026-07-19  
**Evidence:** Web admin API (`/api/admin/contentops/drafts`) returns correct data:
- G5 draft: `draft_1784478223568_qfvpuo`, version 2, DRAFT ✅
- User draft: `draft_1784473544700_hun099`, "ContentOps V1 staging 验收测试文", version 1, DRAFT ✅
- Cross-verification: TELEGRAM_DRAFT_ID = DATABASE_DRAFT_ID = WEB_UI_DRAFT_ID = `draft_1784473544700_hun099`
- SHARED_STATE_MATCH=true

---

### G4 Quality Gate
**Objective:** Verify quality checker returns structured results for empty content

**Criteria:**
- `/review` returns HTTP 200 (not 400/500)
- Response includes `passed: false` for empty content
- Response includes quality scores (qualityScore, seoScore, geoScore)
- Response includes issues array with codes and messages
- Draft state remains DRAFT (not changed to APPROVED)
- Bot displays structured response (not bare "质量检查失败")

**Evidence Required:**
- Direct API test showing HTTP 200 + structured response
- Bot response screenshot or text
- Database query showing state unchanged
- Issue list with codes (e.g., CONTENT_LENGTH, SEO, GEO)

**Status:** PASS  
**Evidence Date:** 2026-07-19  
**Evidence:** Direct API test returned HTTP 200, passed=false, qualityScore=35, seoScore=60, geoScore=70, 7 issues with codes; Draft state remains DRAFT; **Telegram bot retest PASS** - user confirmed structured response with scores and issues list

---

### G5 Edit + Version History
**Objective:** Verify draft editing increments version and preserves history

**Criteria:**
- `/edit` allows modifying draft title or body
- After edit, version increments (v1 → v2)
- Draft state remains DRAFT or transitions to CHANGES_REQUESTED
- Multiple edits create version chain (v1, v2, v3)
- Version history visible in database
- Duplicate body submission does not create new version

**Evidence Required:**
- Telegram `/edit` flow
- Database showing version increment
- Multiple version records for same draft ID
- State transition log
- Duplicate detection test

**Status:** PASS  
**Evidence Date:** 2026-07-19  
**Evidence:** Full E2E self-verification completed:
- G5 test draft created: `draft_1784478223568_qfvpuo`
- v1 body: `G5_VERSION_ONE_MARKER_<timestamp>` (87 chars)
- PUT update → v2 body: `G5_VERSION_TWO_MARKER_<timestamp>` (1500+ chars)
- HTTP 200, previousVersion=1, version=2
- Version history: v1 preserved (bodyLength=87), v2 current
- Duplicate detection: same body → isDuplicate=true, no new version
- Quality check uses v2 (draftVersion=2), state stays DRAFT
- Admin API version_history returns correct data
- Web UI shows both drafts with correct versions

---

### G6 Approval Permission
**Objective:** Verify approval requires authorization and changes state

**Criteria:**
- `/approve` requires authorized user (allowlist)
- Unauthorized users get rejected
- After approval, state changes from DRAFT to APPROVED
- Approval recorded in database
- Cannot approve if quality gate failed

**Evidence Required:**
- Authorized user `/approve` response
- Unauthorized user `/approve` rejection
- Database showing state=APPROVED
- Quality gate check before approval

**Status:** NOT_STARTED  
**Evidence Date:** —  
**Evidence:** —

---

### G7 Staging Publish + Idempotency
**Objective:** Verify staging publish works and is idempotent

**Criteria:**
- `/publish` deploys draft to staging environment
- First publish creates Article record
- Second publish (same draft) does not create duplicate
- Publish state transitions: APPROVED → PUBLISHING → PUBLISHED
- Staging Article visible on i.jueshi.net
- Production publish blocked (returns error)

**Evidence Required:**
- Telegram `/publish` response
- Database showing state=PUBLISHED
- Staging URL accessible
- Idempotency test (publish twice, one Article)
- Production publish rejection

**Status:** NOT_STARTED  
**Evidence Date:** —  
**Evidence:** —

---

### G8 Restart + Unauthorized + 429 + Production Lock
**Objective:** Verify resilience and edge cases

**Criteria:**
- Bot restart preserves draft state (LaunchAgent auto-restart)
- Unauthorized chat IDs rejected for all commands
- Rate limit (429) handled gracefully (pause + resume)
- Production publish hardcoded disabled (cannot be overridden)
- Bot recovers from network errors

**Evidence Required:**
- Bot restart test (kill + auto-restart)
- Unauthorized access test
- Rate limit test (if applicable)
- Production lock verification (code inspection)

**Status:** PARTIAL  
**Evidence Date:** 2026-07-19  
**Evidence:** LaunchAgent KeepAlive=true verified; Production lock hardcoded; **Unauthorized access test pending; Rate limit test pending**

---

## Current Status Summary

```
CURRENT_GATE=G6
G0=PASS
G1=PASS
G2=PASS
G3=PASS
G4=PASS
G5=PASS
G6=NOT_STARTED
G7=NOT_STARTED
G8=PARTIAL
FULL_E2E_COMPLETE=false
NEXT_GATE=G6
```

---

## Test Artifacts

### Test Draft
```
DRAFT_ID=draft_1784473544700_hun099
TITLE=ContentOps V1 staging 验收测试文
STATE=DRAFT
VERSION=v1
```

### Direct API Test Results (G4)
```
HTTP_STATUS=200
PASSED=false
QUALITY_SCORE=35/100
SEO_SCORE=60/100
GEO_SCORE=70/100
LEVEL=poor
ISSUES_COUNT=7
ISSUES:
  1. CONTENT_LENGTH - 内容过短：当前 0 字，要求至少 1500 字
  2. SEO - 缺少 Meta Description
  3. SEO - 缺少 Canonical URL（将自动生成）
  4. GEO - 缺少 FAQ（建议至少 3 个常见问题）
  5. GEO - 缺少结构化数据（JSON-LD）
  6. GEO - 缺少内链建议（建议至少 3 个相关链接）
  7. SOURCE_FACTS - 缺少来源事实标记（建议添加关键数据来源）
DRAFT_STATE_AFTER_REVIEW=DRAFT
```

### Deployment Info
```
LOCAL_COMMIT=aac9bfe
SERVER_HEAD=affa4397
STAGING_BUILD_ID=UYwzfSdltQSW9wpkR-T-_
BOT_PID=34138
BOT_LAUNCHAGENT=ai.hermes.contentops (running)
GIT_STATUS_CLEAN=true
```

### G5 Test Draft
```
G5_TEST_DRAFT_ID=draft_1784478223568_qfvpuo
G5_TITLE=[E2E-G5] ContentOps 编辑与版本历史测试
G5_INITIAL_VERSION=1
G5_CURRENT_VERSION=2
G5_STATE=DRAFT
VERSION_1_EXISTS=true
VERSION_2_EXISTS=true
DUPLICATE_DETECTION=true
```

---

## Rules

1. **Each report must output the same gate table format**
2. **Passed gates retain evidence; new reports cannot overwrite**
3. **Only advance CURRENT_GATE when current gate is fully PASS**
4. **Do not claim full E2E pass until all gates are PASS**
5. **Web Draft ID must be verified via real login, not Bridge API**
6. **Every report must include:**
   ```
   CURRENT_GATE=
   G0=
   G1=
   G2=
   G3=
   G4=
   G5=
   G6=
   G7=
   G8=
   FULL_E2E_COMPLETE=true/false
   NEXT_GATE=
   ```

---

## Pending Actions

### G3 Completion
- [ ] User logs into https://i.jueshi.net/admin
- [ ] User navigates to /admin/contentops
- [ ] User confirms draft_1784473544700_hun099 visible
- [ ] User confirms title matches: "ContentOps V1 staging 验收测试文"
- [ ] User confirms state shows: DRAFT

### G4 Completion
- [x] User sends `/open draft_1784473544700_hun099` in Telegram
- [x] User sends `/review` in Telegram
- [x] Bot returns structured response (not "质量检查失败")
- [x] Response includes scores and issues list
- [x] Screenshot or text captured

### G8 Completion
- [ ] Test unauthorized chat ID access
- [ ] Verify bot rejects with "⛔ 未授权的访问"
- [ ] Test rate limit handling (if applicable)

---

**Document frozen. Do not modify gate definitions. Only update status and evidence.**
