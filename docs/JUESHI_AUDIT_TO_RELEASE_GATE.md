# JUESHI_AUDIT_TO_RELEASE_GATE.md — Audit to Release Gate Flow

## Verdict → Action Mapping

| Verdict | Action |
|---------|--------|
| STAGING_AUDIT_READY_NO_P0P1 + user confirms | → Can enter OPS production release candidate |
| STAGING_AUDIT_FOUND_ISSUES | → Fix staging first, no production release |
| STAGING_AUDIT_BLOCKED | → Fix environment/credentials, re-run audit |
| FAILED | → Audit skill itself broken, cannot use as release basis |

## Hard Rules

1. **P0 fail > 0** → PROHIBIT production release. User CANNOT exempt.
2. **P1 fail > 0** → PROHIBIT production release. User CANNOT exempt.
3. **SQL injection / 500 errors** → Even if labeled P3, MUST block production until root cause is clear.
4. **Selector false positives** → Do NOT block production, but MUST fix audit script or label AUDIT_SCRIPT_BUG.
5. **P2** → User can decide to defer.
6. **P3** → Can record for later, BUT security-related P3 CANNOT be auto-deferred.
7. **No evidence path = no PASS** → A verdict without evidence in `tools/jueshi-audit/reports/latest/` is invalid.

## Evidence Requirements

- Every PASS must have at least one screenshot path in case-results.csv
- Every FAIL must have screenshot + reproduction steps
- Every BLOCKED must have reason documented
- Summary must include: total, PASS, FAIL, BLOCKED, NOT_RUN, P0 fail, P1 fail, bug count

## Release Gate Flow

```
1. Run audit on staging (i.jueshi.net)
2. Review verdict:
   - STAGING_AUDIT_READY_NO_P0P1 → User reviews → Approves → OPS production release
   - STAGING_AUDIT_FOUND_ISSUES → Fix issues → Re-run audit → Repeat
   - STAGING_AUDIT_BLOCKED → Fix environment → Re-run audit → Repeat
   - FAILED → Fix audit skill → Re-run audit → Repeat
3. After production release: run smoke test on production
4. Monitor for 24h before declaring stable
```
