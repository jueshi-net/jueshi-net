# 生产环境手动测试清单 (PRODUCTION_MANUAL_TEST_CHECKLIST)

> **项目**: jueshi.net / xixiong-saas
> **环境**: 生产环境 (Production) — https://jueshi.net (104.250.109.99)
> **PM2**: xixiong-saas | **数据库**: bxb_prod
> **模式**: AUDIT / 只读 (READ-ONLY) — 严禁任何写入、删除、修改操作
> **管理员账号**: 9833416@qq.com (受保护，禁止修改/重置/删除)
> **测试账号**: test@jueshi.net / Test123456!

---

## 重要说明

1. **本清单仅用于生产环境只读验证**，不涉及任何写操作。
2. 所有需要写操作的测试项请在 Staging 环境执行（参见 `STAGING_MANUAL_TEST_CHECKLIST.md`）。
3. 测试人员需使用浏览器开发者工具 (F12) 辅助验证 Network、Console、Lighthouse 等。
4. 每个测试项执行后，请在「通过/失败」列填写结果，失败时在「备注」列详细说明。
5. 证据要求中的截图请保存至 `docs/QA/evidence/production/<测试编号>/` 目录。

---

## 测试项格式

| 测试编号 | 模块 | 环境 | 前置条件 | 操作步骤 | 预期结果 | 证据要求 | Production可执行 | Staging需执行 | 严重级别 | 通过/失败 | 备注 |
|---|---|---|---|---|---|---|---|---|---|---|---|

---

## 一、首页与全局导航 (Homepage & Navigation)

| 测试编号 | 模块 | 环境 | 前置条件 | 操作步骤 | 预期结果 | 证据要求 | Production可执行 | Staging需执行 | 严重级别 | 通过/失败 | 备注 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PROD-001 | 首页 / | Production | 浏览器访问 https://jueshi.net | 1. 打开 https://jueshi.net 2. 观察页面整体布局 | 页面正常加载，Hero区域、导航栏、内容区块、Footer均正确渲染，无布局错乱 | 首页完整截图 | ✅ | ✅ | P0 | | |
| PROD-002 | 首页 Hero 区域 | Production | 已打开首页 | 1. 查看 Hero 区域内容 2. 检查标题、副标题、CTA按钮 | Hero 区域文案正确，CTA按钮可点击并跳转至正确页面 | Hero区域截图 + 点击跳转后URL | ✅ | ✅ | P0 | | |
| PROD-003 | 全局导航栏 | Production | 已打开首页 | 1. 查看顶部导航栏 2. 依次悬停/点击各导航项 | 导航栏项目完整（首页、目的地、工具、社区等），链接指向正确路由 | 导航栏截图 + 各链接URL列表 | ✅ | ✅ | P0 | | |
| PROD-004 | Footer 页脚 | Production | 已打开首页 | 1. 滚动至页面底部 2. 检查 Footer 链接和版权信息 | Footer 内容完整，链接可正常跳转，版权信息正确 | Footer截图 | ✅ | ✅ | P1 | | |
| PROD-005 | 语言切换 | Production | 已打开首页 | 1. 查找语言切换入口 2. 切换语言（如中/英） | 页面语言切换正常，文案对应变化，无遗漏 | 切换前后截图对比 | ✅ | ✅ | P1 | | |

---

## 二、目的地页面 (Destinations)

| 测试编号 | 模块 | 环境 | 前置条件 | 操作步骤 | 预期结果 | 证据要求 | Production可执行 | Staging需执行 | 严重级别 | 通过/失败 | 备注 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PROD-006 | /destinations 列表页 | Production | 浏览器访问 | 1. 访问 https://jueshi.net/destinations 2. 查看国家卡片列表 | 页面正常加载，国家卡片排列整齐，每张卡片含国家名、旗帜、简介、链接 | 列表页截图 | ✅ | ✅ | P0 | | |
| PROD-007 | /destinations 卡片链接 | Production | 已打开 /destinations | 1. 点击加拿大国家卡片 2. 检查跳转 URL | 跳转至 /destinations/canada，页面正常加载 | 跳转后URL + 页面截图 | ✅ | ✅ | P0 | | |
| PROD-008 | /destinations 布局 | Production | 已打开 /destinations | 1. 检查页面整体布局 2. 检查响应式表现 | 卡片网格对齐，间距一致，无溢出 | 桌面端 + 移动端截图 | ✅ | ✅ | P1 | | |
| PROD-009 | /destinations/canada Hero | Production | 访问 /destinations/canada | 1. 查看 Hero 区域 2. 检查标题、背景图、描述 | Hero 正确显示加拿大相关信息，无图片破损 | Hero截图 | ✅ | ✅ | P0 | | |
| PROD-010 | /destinations/canada 当地时间 | Production | 已打开加拿大页 | 1. 查看当地时间组件 2. 等待30秒观察是否更新 | 显示加拿大时区当前时间，时间实时更新 | 时间显示截图 | ✅ | ✅ | P1 | | |
| PROD-011 | /destinations/canada 信息卡片 | Production | 已打开加拿大页 | 1. 查看信息卡片区域 2. 检查各项数据（时区、货币、语言等） | 信息卡片数据准确，排版整齐 | 信息卡片截图 | ✅ | ✅ | P1 | | |
| PROD-012 | /destinations/canada 快捷入口 | Production | 已打开加拿大页 | 1. 查看快捷入口区域 2. 逐一点击入口链接 | 快捷入口链接有效，跳转目标正确 | 各入口跳转URL截图 | ✅ | ✅ | P1 | | |
| PROD-013 | /destinations/canada 指南区域 | Production | 已打开加拿大页 | 1. 查看指南(Guides)区域 2. 点击指南链接 | 指南列表正常展示，链接可跳转 | 指南区域截图 | ✅ | ✅ | P1 | | |
| PROD-014 | /destinations/canada 主题区域 | Production | 已打开加拿大页 | 1. 查看主题(Topics)区域 | 主题列表正常展示，内容与加拿大相关 | 主题区域截图 | ✅ | ✅ | P2 | | |
| PROD-015 | /destinations/canada 清单区域 | Production | 已打开加拿大页 | 1. 查看清单(Checklists)区域 | 清单列表正常展示 | 清单区域截图 | ✅ | ✅ | P2 | | |
| PROD-016 | /destinations/canada 工具区域 | Production | 已打开加拿大页 | 1. 查看工具(Tools)区域 2. 点击工具链接 | 工具入口正常展示，链接跳转正确 | 工具区域截图 | ✅ | ✅ | P2 | | |
| PROD-017 | /destinations/canada 官方链接 | Production | 已打开加拿大页 | 1. 查看官方链接(Official Links)区域 2. 点击链接 | 官方链接有效，跳转至外部官方网站（新标签页） | 链接列表 + 跳转截图 | ✅ | ✅ | P1 | | |
| PROD-018 | /destinations/canada 任务链 | Production | 已打开加拿大页 | 1. 查看任务链(Task Chain)区域 | 任务链组件正常展示，无明显报错 | 任务链区域截图 | ✅ | ✅ | P2 | | |
| PROD-019 | /destinations/canada 社区 | Production | 已打开加拿大页 | 1. 查看社区(Community)区域 2. 点击社区链接 | 社区区域展示相关帖子，链接跳转至 /bbs | 社区区域截图 + 跳转URL | ✅ | ✅ | P1 | | |
| PROD-020 | /destinations/canada FAQ | Production | 已打开加拿大页 | 1. 查看FAQ区域 2. 展开一个FAQ项 | FAQ列表正常展示，展开/收起动画正常 | FAQ截图 | ✅ | ✅ | P2 | | |
| PROD-021 | /destinations/canada SmartRelatedLinks | Production | 已打开加拿大页 | 1. 查看SmartRelatedLinks区域 | 相关链接组件正常展示，无空状态报错 | 相关链接截图 | ✅ | ✅ | P2 | | |
| PROD-022 | /destinations/canada 广告位 | Production | 已打开加拿大页 | 1. 查看广告(Ads)区域 2. 检查广告渲染 | 广告位正常渲染（有广告展示占位或空白占位），无JS报错 | 广告区域截图 | ✅ | ✅ | P2 | | |
| PROD-023 | /destinations/canada 移动端 | Production | Chrome DevTools 375px | 1. 切换至 375px 视口 2. 检查各模块移动端布局 | 各模块响应式正常，无水平溢出，触摸操作友好 | 移动端截图 | ✅ | ✅ | P1 | | |
| PROD-024 | /destinations/united-states Hero | Production | 访问 /destinations/united-states | 1. 查看 Hero 区域 2. 检查标题、背景图、描述 | Hero 正确显示美国相关信息，无图片破损 | Hero截图 | ✅ | ✅ | P0 | | |
| PROD-025 | /destinations/united-states 当地时间 | Production | 已打开美国页 | 1. 查看当地时间组件 | 显示美国时区当前时间，实时更新 | 时间显示截图 | ✅ | ✅ | P1 | | |
| PROD-026 | /destinations/united-states 信息卡片 | Production | 已打开美国页 | 1. 查看信息卡片区域 | 信息卡片数据准确，排版整齐 | 信息卡片截图 | ✅ | ✅ | P1 | | |
| PROD-027 | /destinations/united-states 快捷入口 | Production | 已打开美国页 | 1. 查看快捷入口 2. 逐一点击 | 快捷入口链接有效，跳转正确 | 跳转URL截图 | ✅ | ✅ | P1 | | |
| PROD-028 | /destinations/united-states 指南区域 | Production | 已打开美国页 | 1. 查看指南区域 | 指南列表正常展示 | 指南区域截图 | ✅ | ✅ | P1 | | |
| PROD-029 | /destinations/united-states 主题/清单/工具 | Production | 已打开美国页 | 1. 查看主题、清单、工具区域 | 各区域正常展示，无报错 | 各区域截图 | ✅ | ✅ | P2 | | |
| PROD-030 | /destinations/united-states 官方链接 | Production | 已打开美国页 | 1. 查看官方链接 2. 点击链接 | 链接有效，跳转至官方网站 | 链接截图 | ✅ | ✅ | P1 | | |
| PROD-031 | /destinations/united-states 社区/FAQ | Production | 已打开美国页 | 1. 查看社区和FAQ区域 | 社区区域展示帖子，FAQ正常展开 | 社区+FAQ截图 | ✅ | ✅ | P2 | | |
| PROD-032 | /destinations/united-states SmartRelatedLinks/广告/移动端 | Production | Chrome DevTools 375px | 1. 查看SmartRelatedLinks和广告 2. 切换375px检查 | 相关链接和广告正常，移动端无溢出 | 移动端截图 | ✅ | ✅ | P1 | | |
| PROD-033 | /destinations/usa → 308 重定向 | Production | 浏览器或 curl | 1. 访问 https://jueshi.net/destinations/usa 2. 检查响应状态码 | 返回 308 永久重定向，Location 指向 /destinations/united-states | curl -I 输出截图 | ✅ | ✅ | P0 | | |
| PROD-034 | /countries → 308 重定向 | Production | 浏览器或 curl | 1. 访问 https://jueshi.net/countries 2. 检查响应状态码 | 返回 308 永久重定向，Location 指向 /destinations | curl -I 输出截图 | ✅ | ✅ | P0 | | |

---

## 三、工具页面 (Tools)

| 测试编号 | 模块 | 环境 | 前置条件 | 操作步骤 | 预期结果 | 证据要求 | Production可执行 | Staging需执行 | 严重级别 | 通过/失败 | 备注 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PROD-035 | /tools/postal-code 页面加载 | Production | 浏览器访问 | 1. 访问 https://jueshi.net/tools/postal-code 2. 检查页面布局 | 邮编查询工具页面正常加载，搜索框、国家选择器可见 | 页面截图 | ✅ | ✅ | P0 | | |
| PROD-036 | /tools/postal-code 加拿大查询 | Production | 已打开邮编工具页 | 1. 选择国家=加拿大 2. 输入邮编 M5V3L9 3. 点击查询 | 返回精确匹配结果，显示对应地址信息，地图链接可点击 | 查询结果截图 + 地图链接URL | ✅ | ✅ | P0 | | |
| PROD-037 | /tools/postal-code UI 与地图链接 | Production | 已获得查询结果 | 1. 检查结果展示UI 2. 点击地图链接 | 结果展示清晰，地图链接打开对应地图页面 | 结果UI截图 + 地图页面截图 | ✅ | ✅ | P1 | | |

---

## 四、BBS 社区页面 (BBS / Community)

| 测试编号 | 模块 | 环境 | 前置条件 | 操作步骤 | 预期结果 | 证据要求 | Production可执行 | Staging需执行 | 严重级别 | 通过/失败 | 备注 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PROD-038 | /bbs 列表页布局 | Production | 浏览器访问 | 1. 访问 https://jueshi.net/bbs 2. 检查页面整体布局 | BBS 列表页正常加载，分类导航、帖子列表、排序选项可见 | 列表页截图 | ✅ | ✅ | P0 | | |
| PROD-039 | /bbs 分类与排序 | Production | 已打开 /bbs | 1. 检查分类列表 2. 点击不同分类 3. 切换排序方式 | 分类筛选有效，帖子列表按选中排序方式更新 | 筛选+排序后截图 | ✅ | ✅ | P1 | | |
| PROD-040 | /bbs/[slug] 帖子详情 | Production | 已打开 /bbs | 1. 点击任意帖子标题 2. 查看帖子详情页 | 帖子详情页正常加载，标题、正文、作者信息、评论区可见 | 详情页截图 | ✅ | ✅ | P1 | | |
| PROD-041 | /bbs/[slug] 评论与作者信息 | Production | 已打开帖子详情 | 1. 查看评论区 2. 查看作者信息 | 评论正常展示，作者头像、昵称、角色标识正确（member角色=0） | 评论区+作者信息截图 | ✅ | ✅ | P2 | | |
| PROD-042 | /bbs/new 登录保护重定向 | Production | 未登录状态 | 1. 访问 https://jueshi.net/bbs/new 2. 检查跳转行为 | 未登录用户被重定向至登录页 (/login)，携带 callbackUrl | 跳转后URL截图 | ✅ | ✅ | P0 | | |

---

## 五、登录与管理后台 (Login & Admin)

| 测试编号 | 模块 | 环境 | 前置条件 | 操作步骤 | 预期结果 | 证据要求 | Production可执行 | Staging需执行 | 严重级别 | 通过/失败 | 备注 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PROD-043 | /login 登录页 | Production | 浏览器访问 | 1. 访问 https://jueshi.net/login 2. 检查表单和布局 | 登录页正常加载，邮箱/密码输入框、登录按钮、样式正常 | 登录页截图 | ✅ | ✅ | P0 | | |
| PROD-044 | /admin 登录保护重定向 | Production | 未登录状态 | 1. 访问 https://jueshi.net/admin 2. 检查跳转行为 | 未登录用户被重定向至登录页，携带 callbackUrl | 跳转后URL截图 | ✅ | ✅ | P0 | | |

---

## 六、静态资源与资源加载 (Static Assets)

| 测试编号 | 模块 | 环境 | 前置条件 | 操作步骤 | 预期结果 | 证据要求 | Production可执行 | Staging需执行 | 严重级别 | 通过/失败 | 备注 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PROD-045 | 静态 CSS/JS 资源 | Production | F12 Network 面板 | 1. 打开首页 2. 查看 Network 面板 3. 筛选 CSS 和 JS | 所有 .css 和 .js 静态资源返回 200，无 404 或 500 | Network面板截图（CSS+JS筛选） | ✅ | ✅ | P0 | | |
| PROD-046 | 徽章图标上传资源 | Production | F12 Network 面板 | 1. 打开任意含徽章图标的页面 2. 检查图标资源加载 | 所有徽章图标资源返回 200，无破损图标 | Network面板截图 + 页面图标截图 | ✅ | ✅ | P1 | | |

---

## 七、SEO 检查 (SEO)

| 测试编号 | 模块 | 环境 | 前置条件 | 操作步骤 | 预期结果 | 证据要求 | Production可执行 | Staging需执行 | 严重级别 | 通过/失败 | 备注 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PROD-047 | SEO - title 标签 | Production | F12 Elements 面板 | 1. 打开首页 2. 检查 `<title>` 标签 | title 标签存在，内容正确，包含网站关键词 | title 标签截图 | ✅ | ✅ | P0 | | |
| PROD-048 | SEO - description | Production | F12 Elements 面板 | 1. 检查 `<meta name="description">` | description 标签存在，内容准确描述网站 | meta标签截图 | ✅ | ✅ | P1 | | |
| PROD-049 | SEO - canonical | Production | F12 Elements 面板 | 1. 检查 `<link rel="canonical">` | canonical 链接存在，指向正确的规范 URL | canonical标签截图 | ✅ | ✅ | P0 | | |
| PROD-050 | SEO - robots.txt | Production | 浏览器或 curl | 1. 访问 https://jueshi.net/robots.txt | robots.txt 可访问，内容合理（允许爬虫抓取公开页面） | robots.txt 内容截图 | ✅ | ✅ | P1 | | |
| PROD-051 | SEO - sitemap.xml | Production | 浏览器或 curl | 1. 访问 https://jueshi.net/sitemap.xml | sitemap.xml 可访问，包含主要页面 URL，格式正确 | sitemap内容截图 | ✅ | ✅ | P1 | | |

---

## 八、安全与基础设施 (Security & Infrastructure)

| 测试编号 | 模块 | 环境 | 前置条件 | 操作步骤 | 预期结果 | 证据要求 | Production可执行 | Staging需执行 | 严重级别 | 通过/失败 | 备注 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PROD-052 | SSL 证书有效性 | Production | 浏览器或 openssl | 1. 检查 https://jueshi.net SSL证书 2. 使用 `openssl s_client -connect jueshi.net:443` 检查 | SSL证书有效，未过期，域名匹配 | 浏览器证书截图 或 openssl输出 | ✅ | ✅ | P0 | | |
| PROD-053 | Cloudflare 代理头 | Production | curl -I | 1. 执行 `curl -I https://jueshi.net` 2. 检查响应头 | 响应头包含 `cf-*` 标识，确认经过 Cloudflare 代理 | curl -I 输出截图 | ✅ | ✅ | P1 | | |
| PROD-054 | 404 页面 | Production | 浏览器访问 | 1. 访问 https://jueshi.net/this-page-does-not-exist-404test | 显示自定义404页面，包含返回首页链接 | 404页面截图 | ✅ | ✅ | P1 | | |
| PROD-055 | JS Console 错误 | Production | F12 Console 面板 | 1. 打开首页 2. 查看 Console 面板 3. 逐一检查关键页面 | Console 无红色错误（Error级别），黄色警告可接受 | Console面板截图 | ✅ | ✅ | P0 | | |

---

## 九、移动端与响应式 (Mobile & Responsive)

| 测试编号 | 模块 | 环境 | 前置条件 | 操作步骤 | 预期结果 | 证据要求 | Production可执行 | Staging需执行 | 严重级别 | 通过/失败 | 备注 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PROD-056 | 移动端视口 375px | Production | Chrome DevTools | 1. 设置视口为 375px (iPhone) 2. 浏览首页、目的地页、BBS页 | 页面在375px宽度下无水平滚动条溢出，布局自适应 | 375px截图（首页+目的地+BBS） | ✅ | ✅ | P0 | | |

---

## 十、服务器与运维监控 (Server & Ops)

| 测试编号 | 模块 | 环境 | 前置条件 | 操作步骤 | 预期结果 | 证据要求 | Production可执行 | Staging需执行 | 严重级别 | 通过/失败 | 备注 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PROD-057 | PM2 进程状态 | Production | SSH 至生产服务器 | 1. 执行 `pm2 status` 2. 检查 xixiong-saas 进程 | xixiong-saas 进程状态为 online，restart 次数合理（<10） | pm2 status 输出截图 | ✅ | ✅ | P0 | | |
| PROD-058 | PM2 日志检查 | Production | SSH 至生产服务器 | 1. 执行 `pm2 logs xixiong-saas --lines 50` 2. 检查最近日志 | 最近日志无频繁 Error/Exception，无内存泄漏警告 | pm2 logs 截图 | ✅ | ✅ | P1 | | |
| PROD-059 | Nginx 状态 | Production | SSH 至生产服务器 | 1. 执行 `systemctl status nginx` 2. 检查 `tail /var/log/nginx/error.log` | Nginx 服务 active (running)，错误日志无近期 502/503 | systemctl status + error.log 截图 | ✅ | ✅ | P0 | | |
| PROD-060 | Nginx 502 检查 | Production | SSH 至生产服务器 | 1. 检查 Nginx access log 中 502 状态码 2. `grep " 502 " /var/log/nginx/access.log \| tail -20` | 近期无 502 错误或数量极少 | grep 输出截图 | ✅ | ✅ | P0 | | |
| PROD-061 | 数据库备份验证 | Production | SSH 至生产服务器 | 1. 检查 iCloud/本地备份目录 2. 确认最新备份文件存在且大小合理 | 最近的备份文件存在，文件大小>0，日期为近期 | 备份目录ls截图 | ✅ | ✅ | P0 | | |
| PROD-062 | 监控状态检查 | Production | 访问监控面板或脚本 | 1. 检查监控服务状态 2. 确认关键指标告警正常 | 监控服务运行中，无未处理的P0级别告警 | 监控面板截图 | ✅ | ✅ | P1 | | |

---

## 测试汇总

| 严重级别 | 总数 | 通过 | 失败 | 阻塞 | 未执行 |
|---|---|---|---|---|---|
| P0 | | | | | |
| P1 | | | | | |
| P2 | | | | | |
| P3 | | | | | |
| **合计** | | | | | |

---

## 测试人员签字

| 角色 | 姓名 | 日期 | 签字 |
|---|---|---|---|
| 测试执行人 | | | |
| 测试审核人 | | | |
| 项目负责人 | | | |

---

> **注意**: 本清单共计 62 个测试项。生产环境为只读验证，所有写操作测试请转至 Staging 环境执行。
> 任何 P0 测试项失败即视为测试阻塞，需立即通知运维团队并暂停相关发布流程。
