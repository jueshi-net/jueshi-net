# Word Export DOCX Integrity Audit — v1.20.42.18.6.11.6

**Date:** 2026-06-24T15:26:11.093Z
**URL:** https://i.jueshi.net

## Summary

- PASS: 13
- FAIL: 0
- BLOCKED: 0
- Total: 13

## Results

| Case ID | Tool | Status | Company in DOCX | Notes |
|---------|------|--------|-----------------|-------|
| P1-WORD-EXPORT-QUOTE | Quote Sheet | PASS | Yes | DOCX valid: 3207B, PK OK, unzip OK, Content_Types OK, document.xml OK, company f |
| P1-WORD-EXPORT-COMMERCIAL-INVOICE | Commercial Invoice | PASS | Yes | DOCX valid: 3946B, PK OK, unzip OK, Content_Types OK, document.xml OK, company f |
| P1-WORD-EXPORT-PACKING-LIST | Packing List | PASS | Yes | DOCX valid: 3836B, PK OK, unzip OK, Content_Types OK, document.xml OK, company f |
| P1-WORD-EXPORT-PROFORMA-INVOICE | Proforma Invoice | PASS | Yes | DOCX valid: 4200B, PK OK, unzip OK, Content_Types OK, document.xml OK, company f |
| P1-WORD-EXPORT-SALES-CONTRACT | Sales Contract | PASS | Yes | DOCX valid: 3359B, PK OK, unzip OK, Content_Types OK, document.xml OK, company f |
| P1-WORD-EXPORT-EXPRESS-DECLARATION | Express Declaration | PASS | Yes | DOCX valid: 3386B, PK OK, unzip OK, Content_Types OK, document.xml OK, company f |
| P1-WORD-EXPORT-DYNAMIC-DOCUMENTS | Customs Declaration Authorization (Dynamic Route) | PASS | Yes | DOCX valid: 3285B, PK OK, unzip OK, Content_Types OK, document.xml OK, company f |
| P1-WORD-EXPORT-COMPANY-SWITCH-A | Company Switch A → Word Export | PASS | Yes | DOCX valid: 3946B, PK OK, unzip OK, Content_Types OK, document.xml OK, company f |
| P1-WORD-EXPORT-COMPANY-SWITCH-B | Company Switch B → Word Export | PASS | Yes | DOCX valid: 3964B, PK OK, unzip OK, Content_Types OK, document.xml OK, company f |
| P1-WORD-EXPORT-NO-BROKEN-DOWNLOADS | No Broken Downloads (Scan All Types) | PASS | No | Document list page loads, no broken links detected |
| P1-WORD-EXPORT-FREE-LIMIT-MESSAGE | Free User Daily Limit Message | PASS | No | Free user: 0 succeeded, 5 blocked with message: "[alert] 免费用户每日 Word 导出次数已用完（3 次 |
| P1-WORD-EXPORT-MEMBER-BYPASS-LIMIT | Member Bypass Daily Limit | PASS | No | Member bypass: 5/5 exports succeeded, no limit hit |
| P1-WORD-EXPORT-AUTH-CONSISTENCY | Authorization Consistency (quote-sheet vs dynamic) | PASS | No | Auth consistency: quote-sheet calls /api/export/authorize=YES, dynamic route cal |

## DOCX Files

- **P1-WORD-EXPORT-QUOTE**: /Users/chq/xixiong-saas/tools/jueshi-audit/artifacts/word/P1-WORD-EXPORT-QUOTE-quote-sheet-2026-06-24.docx
- **P1-WORD-EXPORT-COMMERCIAL-INVOICE**: /Users/chq/xixiong-saas/tools/jueshi-audit/artifacts/word/P1-WORD-EXPORT-COMMERCIAL-INVOICE-CI-CI-2024-001-2026-06-24.docx
- **P1-WORD-EXPORT-PACKING-LIST**: /Users/chq/xixiong-saas/tools/jueshi-audit/artifacts/word/P1-WORD-EXPORT-PACKING-LIST-PL-PL-2024-001-2026-06-24.docx
- **P1-WORD-EXPORT-PROFORMA-INVOICE**: /Users/chq/xixiong-saas/tools/jueshi-audit/artifacts/word/P1-WORD-EXPORT-PROFORMA-INVOICE-PI-PI-2024-001-2026-06-24.docx
- **P1-WORD-EXPORT-SALES-CONTRACT**: /Users/chq/xixiong-saas/tools/jueshi-audit/artifacts/word/P1-WORD-EXPORT-SALES-CONTRACT-SC-draft-2026-06-24.docx
- **P1-WORD-EXPORT-EXPRESS-DECLARATION**: /Users/chq/xixiong-saas/tools/jueshi-audit/artifacts/word/P1-WORD-EXPORT-EXPRESS-DECLARATION-IED-draft-2026-06-24.docx
- **P1-WORD-EXPORT-DYNAMIC-DOCUMENTS**: /Users/chq/xixiong-saas/tools/jueshi-audit/artifacts/word/P1-WORD-EXPORT-DYNAMIC-DOCUMENTS-CDA-draft-2026-06-24.docx
- **P1-WORD-EXPORT-COMPANY-SWITCH-A**: /Users/chq/xixiong-saas/tools/jueshi-audit/artifacts/word/P1-WORD-EXPORT-COMPANY-SWITCH-A-CI-CI-2024-001-2026-06-24.docx
- **P1-WORD-EXPORT-COMPANY-SWITCH-B**: /Users/chq/xixiong-saas/tools/jueshi-audit/artifacts/word/P1-WORD-EXPORT-COMPANY-SWITCH-B-CI-CI-2024-001-2026-06-24.docx

## Validation JSON

- **P1-WORD-EXPORT-QUOTE**: /Users/chq/xixiong-saas/tools/jueshi-audit/artifacts/word-validations/P1-WORD-EXPORT-QUOTE-validation.json
- **P1-WORD-EXPORT-COMMERCIAL-INVOICE**: /Users/chq/xixiong-saas/tools/jueshi-audit/artifacts/word-validations/P1-WORD-EXPORT-COMMERCIAL-INVOICE-validation.json
- **P1-WORD-EXPORT-PACKING-LIST**: /Users/chq/xixiong-saas/tools/jueshi-audit/artifacts/word-validations/P1-WORD-EXPORT-PACKING-LIST-validation.json
- **P1-WORD-EXPORT-PROFORMA-INVOICE**: /Users/chq/xixiong-saas/tools/jueshi-audit/artifacts/word-validations/P1-WORD-EXPORT-PROFORMA-INVOICE-validation.json
- **P1-WORD-EXPORT-SALES-CONTRACT**: /Users/chq/xixiong-saas/tools/jueshi-audit/artifacts/word-validations/P1-WORD-EXPORT-SALES-CONTRACT-validation.json
- **P1-WORD-EXPORT-EXPRESS-DECLARATION**: /Users/chq/xixiong-saas/tools/jueshi-audit/artifacts/word-validations/P1-WORD-EXPORT-EXPRESS-DECLARATION-validation.json
- **P1-WORD-EXPORT-DYNAMIC-DOCUMENTS**: /Users/chq/xixiong-saas/tools/jueshi-audit/artifacts/word-validations/P1-WORD-EXPORT-DYNAMIC-DOCUMENTS-validation.json
- **P1-WORD-EXPORT-COMPANY-SWITCH-A**: /Users/chq/xixiong-saas/tools/jueshi-audit/artifacts/word-validations/P1-WORD-EXPORT-COMPANY-SWITCH-A-validation.json
- **P1-WORD-EXPORT-COMPANY-SWITCH-B**: /Users/chq/xixiong-saas/tools/jueshi-audit/artifacts/word-validations/P1-WORD-EXPORT-COMPANY-SWITCH-B-validation.json
