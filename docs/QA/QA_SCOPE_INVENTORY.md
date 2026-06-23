# QA 测试范围盘点 — v1.20.42.18.6.6.7

**Date:** 2026-06-23
**CURRENT_MODE:** AUDIT

---

## A. 公共前台页面

| # | URL | 用途 | 备注 |
|---|-----|------|------|
| A01 | / | 首页 | Hero、导航、快捷入口、footer |
| A02 | /destinations | 国家/目的地列表 | 国家卡片、链接、筛选 |
| A03 | /destinations/canada | 加拿大详情页 | 样板页，所有模块 |
| A04 | /destinations/united-states | 美国详情页 | 同上 |
| A05 | /destinations/usa | 别名 | 308 redirect → /destinations/united-states |
| A06 | /countries | 旧入口 | 308 redirect → /destinations |
| A07 | /tools/postal-code | 邮编工具 | 查询、国家切换、地图链接 |
| A08 | /bbs | 社区首页 | 分类、帖子列表 |
| A09 | /bbs/new | 发帖页 | 登录保护 |
| A10 | /bbs/[slug] | 帖子详情 | 楼层、作者、回复 |
| A11 | /login | 登录页 | 表单、注册链接 |
| A12 | /workspace | 工作台 | 登录保护 |
| A13 | /workspace/task-chains | 任务链 | 登录保护 |
| A14 | /u/[id] | 用户公开页 | 资料、注册时间 |
| A15 | 404 | 404页面 | 错误提示 |
| A16 | 500/error | 错误页 | 如可测试 |

## B. 工具功能

| # | 用例 | 说明 |
|---|------|------|
| B01 | CA M5V3L9 | 精确匹配 Toronto |
| B02 | CA M5V9O9 | 不应显示为完整匹配，显示 prefix reference |
| B03 | CA ZZZ999 | no_match |
| B04 | JP Tokyo | 城市查询 |
| B05 | JP 10000 | 邮编/区间查询 |
| B06 | US 90210 | Beverly Hills |
| B07 | MY 50000 | Malaysia |
| B08 | 越南/沙特 | 未接入国家提示 |
| B09 | 国家切换 | 旧结果不应残留 |
| B10 | 地图链接 | 不带邮编，只带城市/地区/国家 |
| B11 | 任务链入口 | 不 404 |
| B12 | 移动端查询 | 输入体验 |
| B13 | 空输入 | 错误提示 |
| B14 | 超长输入 | 安全处理 |
| B15 | 特殊字符 | 安全处理 |

## C. 国家页功能

| # | 模块 | 说明 |
|---|------|------|
| C01 | Hero | 标题、背景、CTA |
| C02 | 当地时间 | 实时显示 |
| C03 | 国家信息卡 | 基本信息 |
| C04 | 快捷入口 | 工具链接 |
| C05 | 指南 | 文章列表 |
| C06 | 专题 | 专题列表 |
| C07 | 核对清单 | checklist |
| C08 | 工具分组 | 只有一个工具区 |
| C09 | 官方链接 | 外链 |
| C10 | 任务链 | 降级视觉 |
| C11 | 社区入口 | BBS链接 |
| C12 | FAQ | 问答 |
| C13 | SmartRelatedLinks | 相关国家 |
| C14 | 免责声明 | 底部 |
| C15 | 广告位关闭 | 无空白 |
| C16 | moduleConfig | 后台配置联动 |
| C17 | SEO/canonical | 正确 |
| C18 | 桌面双栏 | 布局正确 |
| C19 | 移动单栏 | 布局正确 |

## D. 社区 / BBS

| # | 功能 | 说明 |
|---|------|------|
| D01 | 首页布局 | 分类、列表 |
| D02 | 分类筛选 | 点击切换 |
| D03 | 帖子列表排序 | 时间/热度 |
| D04 | 帖子详情 | 内容、楼层 |
| D05 | 楼层显示 | 楼层号 |
| D06 | 作者信息 | 头像、昵称 |
| D07 | 登录状态提示 | 未登录提示登录 |
| D08 | 发帖限制 | 未登录不能发帖 |
| D09 | 发帖页 | 标题、内容、分类 |
| D10 | 标签 | 添加标签 |
| D11 | Emoji/格式 | 富文本 |
| D12 | 图片上传 | 如存在 |
| D13 | 点赞 | 登录后可赞 |
| D14 | 收藏 | 登录后可收藏 |
| D15 | 举报 | 举报帖子 |
| D16 | 回复 | 回复帖子 |
| D17 | 锁帖 | 管理员操作 |
| D18 | 管理员操作 | 删除/隐藏/置顶 |
| D19 | 移动端 BBS | 响应式 |
| D20 | 空状态 | 无帖子时 |
| D21 | 错误状态 | 帖子不存在 |
| D22 | SEO/canonical | 正确 |

## E. 用户系统

| # | 功能 | 说明 |
|---|------|------|
| E01 | 注册 | 表单、校验 |
| E02 | 登录 | 表单、校验 |
| E03 | 登出 | 清除 session |
| E04 | 登录保护 | 未登录跳转 |
| E05 | Cookie/session | 有效期 |
| E06 | 9833416@qq.com | admin 账号 |
| E07 | 普通用户权限 | 有限访问 |
| E08 | admin 权限 | 完整访问 |
| E09 | role=member | 不应存在 |
| E10 | 未登录访问后台 | 跳转 login |
| E11 | 非 admin 访问后台 | 拒绝 |
| E12 | 用户公开资料页 | 显示信息 |
| E13 | 注册时间 | 展示 |
| E14 | 头像/昵称 | 如存在 |
| E15 | 邮箱隐私 | 不公开显示 |

## F. 成长、积分、荣誉、勋章

| # | 功能 | 说明 |
|---|------|------|
| F01 | 成长值 | 展示 |
| F02 | 积分 | 展示 |
| F03 | 等级 | 展示 |
| F04 | honorScore | 展示 |
| F05 | Badge 列表 | 展示 |
| F06 | UserBadgeAward | 颁发记录 |
| F07 | 勋章展示 | 用户页 |
| F08 | 后台勋章管理 | CRUD |
| F09 | 勋章图标上传 | 格式/大小限制 |
| F10 | 非 admin 上传限制 | 拒绝 |
| F11 | 勋章颁发 | 选择用户 |
| F12 | 勋章撤销 | 如存在 |
| F13 | 用户信任卡 | 展示 |

## G. 后台管理

| # | 模块 | URL |
|---|------|-----|
| G01 | 后台首页 | /admin |
| G02 | 用户管理 | /admin/users |
| G03 | 社区管理 | /admin/community |
| G04 | 帖子管理 | /admin/community/posts |
| G05 | 评论管理 | /admin/community/comments |
| G06 | 举报管理 | /admin/community/flagged |
| G07 | 勋章管理 | /admin/community/badges |
| G08 | 等级/成长 | /admin/levels |
| G09 | 国家内容管理 | /admin/destinations |
| G10 | LandingPage | /admin/landing-pages |
| G11 | 专题管理 | /admin/topics |
| G12 | 文章/指南 | /admin/articles |
| G13 | 清单管理 | /admin/checklists |
| G14 | 官方资源 | /admin/resources |
| G15 | 广告位 | /admin/ad-slots |
| G16 | 模块排序/显隐 | moduleConfig |
| G17 | 文件上传 | 通用 |
| G18 | 权限保护 | 非 admin 拒绝 |
| G19 | 表单校验 | 所有表单 |
| G20 | 保存提示 | 成功/失败 |
| G21 | 删除确认 | 确认弹窗 |
| G22 | 预览链接 | 新窗口 |

## H. 内容发布流程

| # | 步骤 | 说明 |
|---|------|------|
| H01 | 草稿 | 新建 |
| H02 | 预览 | staging 预览 |
| H03 | 审核 | 审核流程 |
| H04 | 发布 | 正式发布 |
| H05 | 归档 | 下架 |
| H06 | SEO 标题 | meta title |
| H07 | SEO 描述 | meta description |
| H08 | canonical | 正确 |
| H09 | index/noindex | 正确 |
| H10 | 关联专题 | 链接 |
| H11 | 关联文章 | 链接 |
| H12 | 关联清单 | 链接 |
| H13 | 关联工具 | 链接 |
| H14 | 关联社区 | 链接 |
| H15 | 广告位 | 配置 |
| H16 | 图片 | 上传 |
| H17 | Markdown/富文本 | 格式 |
| H18 | XSS 风险 | 输入过滤 |

## I. 任务链 / Workspace

| # | 功能 | 说明 |
|---|------|------|
| I01 | 任务链入口 | /workspace/task-chains |
| I02 | 创建任务链 | 表单 |
| I03 | shipping task chain | 物流任务链 |
| I04 | 生成流程 | 生成步骤 |
| I05 | 保存 | 持久化 |
| I06 | 未登录跳转 | redirect login |
| I07 | 登录后进入 | 正常显示 |
| I08 | 工作台列表 | 已有任务链 |
| I09 | 任务状态 | 进行中/完成 |
| I10 | 错误状态 | 异常处理 |
| I11 | 移动端 | 响应式 |

## J. SEO / 技术基础

| # | 检查项 | 说明 |
|---|--------|------|
| J01 | title | 每页有 title |
| J02 | description | 每页有 description |
| J03 | canonical | 正确 |
| J04 | robots | production index |
| J05 | sitemap | 存在且有效 |
| J06 | staging noindex | i.jueshi.net noindex |
| J07 | production index | jueshi.net index |
| J08 | 301/308 redirect | 别名重定向 |
| J09 | 404 | 自定义 404 |
| J10 | OpenGraph | OG 标签 |
| J11 | 图片 alt | 有 alt |
| J12 | 中文文案 | 无乱码 |
| J13 | 结构化数据 | 如有 |

## K. 性能与兼容

| # | 环境 | 说明 |
|---|------|------|
| K01 | Chrome 桌面 | 主流浏览器 |
| K02 | Safari 桌面 | macOS |
| K03 | Edge 桌面 | Windows |
| K04 | iPhone Safari | iOS |
| K05 | Android Chrome | Android |
| K06 | 375px 窄屏 | iPhone SE |
| K07 | 平板 | iPad |
| K08 | 首屏 | 加载速度 |
| K09 | 图片加载 | 懒加载 |
| K10 | JS 错误 | console 无错误 |
| K11 | CSS 断裂 | 样式完整 |
| K12 | 表单响应 | 移动端可用 |
| K13 | 慢网 | 3G 模拟 |
| K14 | 刷新 | 状态保持 |
| K15 | 返回上一页 | 浏览器后退 |

## L. 监控与运维

| # | 检查项 | 说明 |
|---|--------|------|
| L01 | PM2 状态 | online |
| L02 | PM2 restart count | 不异常 |
| L03 | Nginx 502/500 | 0 个 |
| L04 | SSL 证书 | 有效 |
| L05 | UFW | active |
| L06 | Fail2ban | active |
| L07 | DB 备份 | iCloud 每日 |
| L08 | health check | staging 有, prod 缺 |
| L09 | alarm channel | 缺失 |
| L10 | 磁盘空间 | <80% |
| L11 | 内存 | 充足 |
| L12 | PostgreSQL | active |
| L13 | Cloudflare | 代理正常 |
| L14 | smoke script | 存在 |
| L15 | rollback 脚本 | 存在 |
