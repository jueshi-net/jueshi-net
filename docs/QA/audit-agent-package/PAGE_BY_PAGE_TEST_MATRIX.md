# 页面级测试矩阵 — v1.20.42.18.6.6.7

---

## / 首页

| 维度 | 测试点 |
|------|--------|
| URL | https://jueshi.net/ (prod) / https://i.jueshi.net/ (staging) |
| 用途 | 网站首页，展示核心功能入口 |
| 桌面 | Hero 区域完整、导航栏正确、footer 链接正确、快捷入口可点击 |
| 移动 | 375px 无横向溢出、汉堡菜单可用、Hero 文字可读 |
| 登录态 | 显示用户头像/昵称、工作台入口可见 |
| 未登录态 | 显示登录/注册按钮 |
| 空状态 | N/A |
| 错误状态 | N/A |
| SEO | title 包含「海外百宝箱」、description 存在、canonical=/ |
| 性能 | 首屏 <3s、CSS/JS 200、无 console error |
| 截图 | QA-P1-home-desktop.png, QA-P1-home-mobile.png |

## /destinations 国家列表

| 维度 | 测试点 |
|------|--------|
| URL | /destinations |
| 用途 | 展示所有国家/目的地卡片 |
| 桌面 | 国家卡片网格布局、每张卡片可点击跳转 |
| 移动 | 单列或双列卡片、无溢出 |
| 登录态 | 同未登录 |
| 未登录态 | 可浏览、可点击进入国家页 |
| 空状态 | 如无数据，显示提示 |
| 错误状态 | 网络错误显示友好提示 |
| SEO | title、description、canonical=/destinations |
| 性能 | 卡片图片懒加载 |
| 截图 | QA-P1-destinations-desktop.png |

## /destinations/canada 加拿大页

| 维度 | 测试点 |
|------|--------|
| URL | /destinations/canada |
| 用途 | 加拿大综合信息与实用工具入口 |
| 桌面 | 双栏布局、所有模块渲染（hero、时间、信息卡、指南、专题、清单、工具、链接、任务链、社区、FAQ、SmartRelatedLinks） |
| 移动 | 单栏布局、模块顺序正确、无溢出 |
| 登录态 | 任务链入口可点击 |
| 未登录态 | 任务链入口提示登录 |
| 空状态 | 模块无数据时优雅降级 |
| 错误状态 | 模块加载失败不崩溃 |
| SEO | canonical=/destinations/canada、index |
| 性能 | 模块懒加载、首屏 <3s |
| 截图 | QA-P1-canada-desktop.png, QA-P1-canada-mobile.png |

## /destinations/united-states 美国页

| 维度 | 同 canada，验证所有模块在美国页也正确渲染 |
| 截图 | QA-P1-us-desktop.png |

## /destinations/usa 别名重定向

| 维度 | 测试点 |
|------|--------|
| URL | /destinations/usa |
| 预期 | 308 redirect → /destinations/united-states |
| 截图 | QA-P1-usa-redirect.png (浏览器 Network 截图) |

## /countries 旧入口重定向

| 维度 | 测试点 |
|------|--------|
| URL | /countries |
| 预期 | 308 redirect → /destinations |
| 截图 | QA-P1-countries-redirect.png |

## /tools/postal-code 邮编工具

| 维度 | 测试点 |
|------|--------|
| URL | /tools/postal-code |
| 用途 | 邮编/城市查询 |
| 桌面 | 输入框、国家选择、查询按钮、结果区、地图链接 |
| 移动 | 输入框可用、结果可读、地图链接可点 |
| 登录态 | 同未登录 |
| 未登录态 | 可查询 |
| 空状态 | 初始无结果提示 |
| 错误状态 | no_match 提示、未接入国家提示 |
| SEO | canonical=/tools/postal-code |
| 性能 | 查询响应 <2s |
| 截图 | QA-P1-postal-desktop.png, QA-P1-postal-result.png |

## /bbs 社区首页

| 维度 | 测试点 |
|------|--------|
| URL | /bbs |
| 用途 | 社区帖子列表 |
| 桌面 | 分类标签、帖子列表、排序、发帖按钮 |
| 移动 | 列表单列、分类可横向滚动 |
| 登录态 | 发帖按钮可点击 |
| 未登录态 | 发帖按钮提示登录 |
| 空状态 | 无帖子时显示提示 |
| 错误状态 | 帖子不存在显示 404 |
| SEO | canonical=/bbs、index |
| 截图 | QA-P1-bbs-desktop.png |

## /bbs/new 发帖页

| 维度 | 测试点 |
|------|--------|
| URL | /bbs/new |
| 用途 | 创建新帖子 |
| 桌面 | 标题输入、内容编辑、分类选择、标签、提交按钮 |
| 移动 | 表单可用、输入框可编辑 |
| 登录态 | 可访问、可填写、可提交 |
| 未登录态 | redirect → /login |
| 空状态 | 表单初始为空 |
| 错误状态 | 标题/内容为空时校验提示 |
| SEO | noindex |
| 截图 | QA-P2-bbs-new.png |

## /bbs/[slug] 帖子详情

| 维度 | 测试点 |
|------|--------|
| URL | /bbs/[slug] |
| 用途 | 帖子内容和回复 |
| 桌面 | 标题、作者、时间、内容、楼层、回复框 |
| 移动 | 内容可读、回复框可用 |
| 登录态 | 可回复、可点赞 |
| 未登录态 | 提示登录后回复 |
| 空状态 | 无回复时显示提示 |
| 错误状态 | slug 不存在 → 404 |
| SEO | canonical=/bbs/[slug] |
| 截图 | QA-P1-bbs-topic.png |

## /login 登录页

| 维度 | 测试点 |
|------|--------|
| URL | /login |
| 桌面 | 邮箱、密码输入、登录按钮、错误提示 |
| 移动 | 表单可用 |
| 登录态 | 已登录跳转 |
| 未登录态 | 显示登录表单 |
| 错误状态 | 错误邮箱/密码提示 |
| SEO | noindex |
| 截图 | QA-P1-login.png |

## /admin 后台

| 维度 | 测试点 |
|------|--------|
| URL | /admin |
| 桌面 | Dashboard 概览 |
| 移动 | 最小可用性 |
| 登录态 admin | 可访问 |
| 未登录态 | redirect → /login |
| 非 admin | 拒绝/跳转 |
| SEO | noindex |
| 截图 | QA-P3-admin-dashboard.png |

## /admin/community/posts 帖子管理

| 维度 | 测试点 |
|------|--------|
| URL | /admin/community/posts |
| 桌面 | 帖子列表、搜索、筛选、分页 |
| 登录态 admin | 可查看、可操作 |
| 非 admin | 拒绝 |
| 截图 | QA-P3-admin-posts.png |

## /admin/community/comments 评论管理

| 维度 | 同 posts，针对评论 |
| 截图 | QA-P3-admin-comments.png |

## /admin/community/flagged 举报管理

| 维度 | 同 posts，针对举报内容 |
| 截图 | QA-P3-admin-flagged.png |

## /admin/community/badges 勋章管理

| 维度 | 勋章列表、创建、图标上传、颁发、撤销 |
| 截图 | QA-P3-admin-badges.png |

## /workspace 工作台

| 维度 | 测试点 |
|------|--------|
| URL | /workspace |
| 登录态 | 显示用户工作台 |
| 未登录态 | redirect → /login |
| 截图 | QA-P2-workspace.png |

## /workspace/task-chains 任务链

| 维度 | 测试点 |
|------|--------|
| URL | /workspace/task-chains |
| 登录态 | 显示任务链列表、可创建 |
| 未登录态 | redirect → /login |
| 截图 | QA-P2-task-chains.png |

## /u/[id] 用户公开页

| 维度 | 测试点 |
|------|--------|
| URL | /u/[id] |
| 桌面 | 用户信息、注册时间、勋章 |
| 移动 | 信息可读 |
| 错误状态 | 用户不存在 → 404 |
| SEO | 邮箱不公开 |
| 截图 | QA-P2-user-profile.png |

## 404 页面

| 维度 | 测试点 |
|------|--------|
| URL | /nonexistent-page-12345 |
| 桌面 | 友好 404 提示、返回首页链接 |
| 移动 | 可读 |
| SEO | 404 状态码正确 |
| 截图 | QA-P1-404.png |
