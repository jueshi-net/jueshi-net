# JUESHI_AUDIT_TO_RELEASE_GATE.md — Audit to Release Gate Flow

## v18.6.14 深度审计命令

| 命令 | 覆盖范围 |
|------|----------|
| `npm run jueshi-audit:document-chain-deep` | 单据链路深度（Quote→PI→CI→PL→Container） |
| `npm run jueshi-audit:document-drafts-deep` | 草稿保存/恢复/复制/删除 |
| `npm run jueshi-audit:product-catalog-deep` | 商品资料库 CRUD + 单据选择器 |
| `npm run jueshi-audit:resources-v2-deep` | 资源导航 V2 搜索/筛选/场景页 |
| `npm run jueshi-audit:tool-content-deep` | 工具内容系统（指南/FAQ/错误） |
| `npm run jueshi-audit:bbs-tool-linkage-deep` | 社区联动（发帖上下文/回链） |
| `npm run jueshi-audit:entitlements-deep` | 会员权益一致性 |
| `npm run jueshi-audit:webkit-deep` | WebKit 全链路回归 |
| `npm run jueshi-audit:mobile-deep` | 移动端全链路回归 |
| `npm run jueshi-audit:deep-staging` | 聚合全量深度审计 |

## Audit Commands (v18.6.12)

| Command | Suite | Description |
|---------|-------|-------------|
| `npm run jueshi-audit:p0` | P0 | Core URL accessibility, 200 checks |
| `npm run jueshi-audit:p1` | P1 | Functional tests (login, forms, export) |
| `npm run jueshi-audit:company` | Company | Company profile linkage audit |
| `npm run jueshi-audit:company-switch` | Company Switch | Multi-company switching audit |
| `npm run jueshi-audit:word-export` | Word Export | DOCX integrity + authorization audit |
| `npm run jueshi-audit:documents` | Documents | Document tools company linkage |
| `npm run jueshi-audit:documents-company-switch` | Documents Company Switch | Document tools multi-company |
| `npm run jueshi-audit:full` | All | Full audit suite (all of above) |

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
3. **Word export fail > 0** → PROHIBIT production release.
4. **公司资料联动 fail > 0** → PROHIBIT production release.
5. **多公司切换 fail > 0** → PROHIBIT production release.
6. **SQL injection / 500 errors** → Even if labeled P3, MUST block production until root cause is clear.
7. **Selector false positives** → Do NOT block production, but MUST fix audit script or label AUDIT_SCRIPT_BUG.
8. **P2** → User can decide to defer.
9. **P3** → Can record for later, BUT security-related P3 CANNOT be auto-deferred.
10. **No evidence path = no PASS** → A verdict without evidence in `tools/jueshi-audit/reports/latest/` is invalid.
11. **P1 blocked > 0** → DEFAULT PROHIBIT production release, unless user explicitly exempts.
12. **Production release must be separate OPS task** — staging overnight development MUST NOT auto-deploy production.

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

## Staging Overnight Development Rules

- Staging development MUST NOT trigger production deployment
- Staging development MUST NOT merge to main (unless explicit OPS task)
- Staging development MUST NOT touch production DB
- Each phase of staging development MUST have phase report + commit + audit result
- PARTIAL is acceptable for non-core features; P0/P1 must be 0 for READY

