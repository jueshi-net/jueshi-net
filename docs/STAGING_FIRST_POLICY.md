# Staging-First Policy — v1.20.42.18.6.6.5.1

> **READ FIRST:** `docs/HERMES_ALWAYS_READ.md` — this is the mandatory entry point for all Hermes tasks.

## 强制规则

1. **所有新功能先进入 i.jueshi.net (staging)**
2. **所有 UI 改版先进入 i.jueshi.net**
3. **所有内容模板改动先进入 i.jueshi.net**
4. **所有 migration 先在 staging 验证**
5. **用户确认后才能进入 production**
6. **production 发布必须由 OPS MODE 执行**
7. **production 发布必须备份**
8. **production 发布必须 smoke test**
9. **production 发布必须有 rollback note**
10. **production 发布必须观察 PM2/Nginx/error log**
11. **没有 staging 验收，不准上线**
12. **没有用户确认，不准上线**
13. **production 发布前必须运行 `tools/jueshi-audit` 审计工具**
14. **没有 evidence 路径的审计结果不能作为通过依据**
15. **P0/P1 未清零不能进入 OPS production 发布（用户不可豁免 P0/P1）**
16. **用户可以豁免 P2/P3，但不能豁免 P0/P1**

## 审计门 (Audit Gate)

详见 `docs/JUESHI_AUDIT_TO_RELEASE_GATE.md`。

- 审计判定为 `STAGING_AUDIT_READY_NO_P0P1` → 可进入 OPS 发布（需用户确认）
- 审计判定为 `STAGING_AUDIT_FOUND_ISSUES` → 用户可豁免 P2/P3 后进入 OPS 发布
- 审计判定为 `STAGING_AUDIT_BLOCKED` → 禁止发布，修复后重新审计
- 审计判定为 `FAILED` → 审计未完成，不可作为发布依据，重新运行

## 违规后果

- 未经 staging 验收直接上生产 = 事故
- 未经用户确认直接上生产 = 事故
- 绕过备份直接发布 = 事故

## 例外

- P0 紧急修复 (hotfix) 仍需 staging 快速验证 + 备份 + smoke test
- 无代码改动的纯数据操作 (如 admin 后台内容发布) 不需要 staging 验证
