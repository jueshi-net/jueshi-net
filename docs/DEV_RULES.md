# 开发铁律 — DEV RULES

> 适用于 xixiong-saas (jueshi.net) 的所有后续开发

---

## 1. 零破坏原则

- **任何版本不得破坏现有页面和 API**
- 上线前必须验证所有核心路径返回 200
- 不得修改 `.env.production` 除非明确指定
- 不得修改 `NEXTAUTH_URL`

## 2. 改动声明

每次改动必须明确说明是否涉及以下内容：

| 领域 | 说明 |
|---|---|
| **DB** | 是否新增/修改表或字段？是否新增 migration？ |
| **env** | 是否修改 `.env.*` 文件？ |
| **Auth** | 是否修改登录/session/权限逻辑？ |
| **AI** | 是否修改 AI 工具逻辑或模型？ |
| **积分** | 是否修改积分计算/流水？ |
| **会员** | 是否修改会员逻辑/到期时间？ |
| **邮编** | 是否修改邮编查询/数据？ |
| **单据** | 是否修改单据模板/生成逻辑？ |

**不涉及以上领域的改动也需明确标注"未修改"。**

## 3. DB 改动三件套

任何数据库结构变更必须：

1. **先备份**：`pg_dump | gzip > backups/xixiong-saas-pre-<date>.sql.gz`
2. **有 migration**：使用 `npx prisma migrate dev` 生成，不得手动 ALTER TABLE
3. **有 rollback 说明**：记录如何回退 migration（`prisma migrate reset` 或反向 SQL）

## 4. 后台数据加载原则

**后台受保护数据优先使用 Server Component 直查 DB**

原因：Client Component 的 `fetch()` 调用 API 路由时，NextAuth session 的 `user.id` 可能丢失，导致权限检查失败（v1.20.18.1 已知问题）。

```tsx
// ✅ 正确：Server Component 直查 DB
export default async function AdminPage() {
  const data = await prisma.someModel.findMany();
  return <AdminClient data={data} />;
}

// ❌ 避免：Client Component fetch API
"use client";
useEffect(() => {
  fetch("/api/admin/something").then(...);
}, []);
```

**例外**：写操作（POST/PUT/DELETE）仍需通过 API 路由，但 API 路由的权限检查应优先使用 JWT token 中的 role（`session.user.role`），DB 查询作为备用。

## 5. 公开页面动态策略

**依赖 DB 的公开页面必须明确 dynamic 策略，避免 SSG 构建期 DB 失败缓存空页面**

```tsx
// 如果页面依赖 DB 数据，必须添加：
export const dynamic = "force-dynamic";
```

**已加此标记的页面**：
- `/topics`（专题列表）
- `/sitemap.xml`（站点地图）

**未加但依赖 DB 的页面**：需逐个审查并添加。

## 6. Mock 透明度

- 所有 AI 工具返回的结果必须标注"体验版/结果仅供参考"
- 所有未开放功能必须标注"待开放"或"未开放"，不得使用"已上线/立即购买"等误导性文案
- API Mock 响应必须包含 `mock: true` 元数据

## 7. 禁止项

- ❌ **禁止出现 `kjbxb.com`**：代码、注释、配置中不得出现历史域名
- ❌ **禁止出现 `href="/register"`**：本站无注册页
- ❌ **禁止出现 `/nav` 主入口**
- ❌ **禁止 `dangerouslySetInnerHTML`** 渲染用户输入内容（VideoObject JSON-LD 除外，因其内容是 DB 字段序列化）
- ❌ **禁止横向溢出**：移动端 375px 下 `scrollWidth === clientWidth`

## 8. 上线前检查清单

每次上线必须执行：

```bash
# 1. TypeScript 检查
npx tsc --noEmit

# 2. 构建
npm run build

# 3. 核心页面 curl
curl -s -o /dev/null -w "%{http_code}" https://jueshi.net/
curl -s -o /dev/null -w "%{http_code}" https://jueshi.net/tools
curl -s -o /dev/null -w "%{http_code}" https://jueshi.net/topics
curl -s -o /dev/null -w "%{http_code}" https://jueshi.net/topics/overseas-essential-apps
curl -s -o /dev/null -w "%{http_code}" https://jueshi.net/admin/topics

# 4. 邮编 API
curl -s 'https://jueshi.net/api/postal-codes?country=CA&q=V6B0A1'

# 5. Auth Gate（未登录应 307 或 401）
curl -s -o /dev/null -w "%{http_code}" https://jueshi.net/admin/topics

# 6. Sitemap
curl -s https://jueshi.net/sitemap.xml | grep "/topics/"

# 7. 禁止项 grep
rg -n "kjbxb\.com|href=\"/register\"" src/app src/components src/lib

# 8. 移动端 375px 检查
# 使用 Playwright 或 Safari DevTools 验证 scrollWidth === clientWidth
```

## 9. 人工验收清单

每个新功能上线前必须有：

- [ ] 功能描述和预期行为
- [ ] 测试步骤（含正面/负面用例）
- [ ] 前台验证截图或 curl 结果
- [ ] 后台验证（如有 admin 页面）
- [ ] 移动端 375px 验证
- [ ] 性能影响评估（是否新增 N+1 查询？是否影响 TTFB？）

## 10. 版本冻结原则

- 稳定 tag 一旦设定，该版本不再接受新功能
- Bug 修复使用 `vX.X.X.N-description` 子版本号
- 版本号由主版本.次版本.修订号.修复号组成

## 11. 沟通与交付

- 用户中文沟通
- 最终报告必须包含：修改文件列表、是否新增 migration、是否修改 env、是否改动核心逻辑、build 结果、健康检查、PM2 状态、commit/tag、SHA256
- 部署后等待用户再次测试确认，不主动继续下一版本
