# Domain Source of Truth — v1.20.5.1

## 正式生产域名

**https://jueshi.net**

## 关键配置

| 配置项 | 值 | 说明 |
|---|---|---|
| NEXTAUTH_URL | `https://jueshi.net` | Auth 回调域名，必须与此一致 |
| AUTH_TRUST_HOST | `true` | 保留热修复，避免 UntrustedHost 错误 |
| metadataBase | `https://jueshi.net` | SEO canonical 基础 URL |
| NEXT_PUBLIC_URL | `https://jueshi.net` | robots.txt / sitemap 基础 URL |
| NEXT_PUBLIC_SITE_URL | `https://jueshi.net` | sitemap.xml 基础 URL |

## 关于 kjbxb.com

- **kjbxb.com 不是当前生产主域名**
- 它可能是历史域名、备用域名或测试域名
- 后续任何文档、报告、部署记录中，**不得把 kjbxb.com 写成生产主域名**
- 所有人工验收链接必须写 `https://jueshi.net`

## v1.20.5.1 修复内容

1. `src/app/(public)/page.tsx` — canonical / OpenGraph URL → jueshi.net
2. `src/components/layout/footer.tsx` — 联系邮箱 → contact@jueshi.net
3. `src/app/(public)/help/page.tsx` — 联系邮箱 → contact@jueshi.net
4. `src/app/(public)/terms/page.tsx` — 联系邮箱 → contact@jueshi.net
5. `src/app/(public)/privacy/page.tsx` — 联系邮箱 → contact@jueshi.net
6. `src/app/(workspace)/settings/page.tsx` — Cookie 域名 → .jueshi.net
7. `src/lib/documents/a4-export-renderer.ts` — 底部品牌 → jueshi.net
8. `src/lib/labels/a4-export-renderer.ts` — 底部品牌 → jueshi.net
9. `src/app/(public)/tools/label-maker/page.tsx` — 底部品牌 → jueshi.net
10. `src/app/(public)/tools/documents/[type]/page.tsx` — 底部品牌 → jueshi.net
11. `src/lib/auth.ts` — 注释更新
12. `src/app/api/auth/[...nextauth]/route.ts` — 注释更新

## 部署后检查清单

- [ ] `curl -I https://jueshi.net/` → 200
- [ ] `curl -I https://jueshi.net/login` → 200
- [ ] `curl -I https://jueshi.net/admin` → 307 (未登录)
- [ ] `curl https://jueshi.net/api/auth/session` → 正确 session
- [ ] `curl 'https://jueshi.net/api/postal-codes?country=CA&q=V6B0A1'` → Vancouver
- [ ] 源码中无 `kjbxb.com`（除旧文档/历史记录外）

## 记录时间

2026-05-17
