# 后台管理测试矩阵 — v1.20.42.18.6.6.7

**环境:** Staging (https://i.jueshi.net/admin)
**账号:** 9833416@qq.com (admin)
**原则:** staging 先测，production 只读

---

## 1. 后台首页 /admin

| 维度 | 内容 |
|------|------|
| 模块 | Dashboard |
| URL | /admin |
| 允许角色 | admin |
| 禁止角色 | 未登录、普通用户 |
| 列表页 | 概览数据展示 |
| 权限错误 | 非 admin → redirect /login |
| 截图 | QA-P3-admin-dashboard.png |

## 2. 用户管理 /admin/users

| 维度 | 内容 |
|------|------|
| URL | /admin/users |
| 允许角色 | admin |
| 列表页 | 用户列表、搜索、分页 |
| 编辑 | 查看用户详情 |
| 搜索/筛选 | 按邮箱/角色筛选 |
| 表单校验 | N/A (只读为主) |
| 权限错误 | 非 admin 拒绝 |
| 敏感字段 | 不显示密码/hash |
| 截图 | QA-P3-admin-users.png |

## 3. 社区管理 /admin/community

| 维度 | 内容 |
|------|------|
| URL | /admin/community |
| 允许角色 | admin |
| 列表页 | 社区概览 |
| 截图 | QA-P3-admin-community.png |

## 4. 帖子管理 /admin/community/posts

| 维度 | 内容 |
|------|------|
| URL | /admin/community/posts |
| 列表页 | 帖子列表、搜索、筛选、分页 |
| 编辑 | 编辑帖子内容 |
| 删除/归档 | 删除确认弹窗 |
| 搜索 | 按标题/作者搜索 |
| 权限错误 | 非 admin 拒绝 |
| 截图 | QA-P3-admin-posts.png |

## 5. 评论管理 /admin/community/comments

| 维度 | 内容 |
|------|------|
| URL | /admin/community/comments |
| 列表页 | 评论列表 |
| 删除 | 删除确认 |
| 权限错误 | 非 admin 拒绝 |
| 截图 | QA-P3-admin-comments.png |

## 6. 举报管理 /admin/community/flagged

| 维度 | 内容 |
|------|------|
| URL | /admin/community/flagged |
| 列表页 | 举报内容列表 |
| 操作 | 处理/忽略/删除 |
| 权限错误 | 非 admin 拒绝 |
| 截图 | QA-P3-admin-flagged.png |

## 7. 勋章管理 /admin/community/badges

| 维度 | 内容 |
|------|------|
| URL | /admin/community/badges |
| 列表页 | 勋章列表 |
| 创建 | 新建勋章表单（名称、描述、图标） |
| 编辑 | 编辑勋章信息 |
| 图标上传 | JPG/PNG/WebP 接受、.php/.sh 拒绝、大小限制 |
| 颁发 | 选择用户颁发勋章 |
| 撤销 | 撤销用户勋章（如存在） |
| 表单校验 | 必填字段校验 |
| 保存提示 | 成功/失败提示 |
| 权限错误 | 非 admin 拒绝 |
| 截图 | QA-P3-admin-badges.png, QA-P3-admin-badge-upload.png |

## 8. 国家/目的地内容管理 /admin/destinations

| 维度 | 内容 |
|------|------|
| URL | /admin/destinations |
| 列表页 | 国家列表 |
| 编辑 | 编辑国家页模块配置 (moduleConfig JSON) |
| 模块排序 | 拖拽排序 |
| 模块显隐 | 开关控制 |
| 广告位 | 开关/配置 |
| 官方链接 | 添加/编辑/删除 |
| FAQ | 添加/编辑/删除 |
| 表单校验 | JSON 格式校验 |
| 保存提示 | 成功/失败 |
| 权限错误 | 非 admin 拒绝 |
| 截图 | QA-P3-admin-destinations.png |

## 9. 专题管理 /admin/topics

| 维度 | 内容 |
|------|------|
| URL | /admin/topics |
| 列表页 | 专题列表 |
| 创建 | 新建专题 |
| 编辑 | 编辑专题 |
| 删除/归档 | 确认 |
| SEO | 标题、描述、canonical |
| 截图 | QA-P3-admin-topics.png |

## 10. 文章/指南管理 /admin/articles

| 维度 | 内容 |
|------|------|
| URL | /admin/articles |
| 列表页 | 文章列表 |
| 创建 | 新建文章（标题、内容、SEO） |
| 编辑 | 编辑文章 |
| Markdown | 富文本编辑 |
| 图片 | 上传 |
| SEO | title、description、canonical、index/noindex |
| 关联 | 关联专题/清单/工具 |
| 截图 | QA-P3-admin-articles.png |

## 11. 清单管理 /admin/checklists

| 维度 | 内容 |
|------|------|
| URL | /admin/checklists |
| 列表页 | 清单列表 |
| 创建 | 新建清单 |
| 编辑 | 编辑清单项 |
| 截图 | QA-P3-admin-checklists.png |

## 12. 官方资源管理 /admin/resources

| 维度 | 内容 |
|------|------|
| URL | /admin/resources |
| 列表页 | 资源列表 |
| 创建 | 添加官方链接 |
| 编辑 | 编辑链接 |
| 截图 | QA-P3-admin-resources.png |

## 13. 广告位管理 /admin/ad-slots

| 维度 | 内容 |
|------|------|
| URL | /admin/ad-slots |
| 列表页 | 广告位列表 |
| 开关 | 启用/禁用 |
| 配置 | 广告内容 |
| 关闭后效果 | 页面无空白 |
| 截图 | QA-P3-admin-ad-slots.png |

## 权限安全要点

| 检查项 | 预期 |
|--------|------|
| 9833416@qq.com 访问所有 admin | ✅ 允许 |
| role=member | 不存在 |
| 普通用户访问 admin | 拒绝/跳转 |
| admin API 不泄露密码 | ✅ |
| admin 保存不污染 production | staging 先测 |
