# Staging-First Policy — v1.20.42.18.6.6.5

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

## 违规后果

- 未经 staging 验收直接上生产 = 事故
- 未经用户确认直接上生产 = 事故
- 绕过备份直接发布 = 事故

## 例外

- P0 紧急修复 (hotfix) 仍需 staging 快速验证 + 备份 + smoke test
- 无代码改动的纯数据操作 (如 admin 后台内容发布) 不需要 staging 验证
