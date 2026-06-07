# Change Approval Rules — jueshi.net / xixiong-saas

## Dashboard 改动验收铁律

1. **截图验证完整菜单和 7 个子页面**
   - 每次 Dashboard 改动后，必须逐页截图验证 `/workspace`、`/workspace/tasks`、`/workspace/member`、`/workspace/documents`、`/workspace/company-profiles`、`/workspace/favorites`、`/workspace/settings`。
   - 截图必须包含 Sidebar 和主内容区。
   - 不允许仅凭 HTTP 状态码或构建通过就标记 VERIFIED。

2. **禁止通过隐藏菜单来规避坏页面**
   - 不允许将未完成模块从 Sidebar 中移除来"假装修复"。
   - 如果某模块暂时没有复杂功能，必须有正式页面和清晰空状态（CTA + 说明文字）。
   - 不允许 `href="#"` 死链。
   - 不允许多个菜单指向同一页面。

3. **React Error 排查要求**
   - 生产出现 Minified React Error 必须先在本地 dev 模式复现完整错误堆栈。
   - 重点排查：动态组件变量（必须大写开头 PascalCase）、import/export 混用、lucide-react 图标名不存在。
   - 修复后必须在 VPS 上 grep 确认修复代码已部署，不能仅信任本地 git status。

4. **版本发布门禁**
   - 同一 tag 名必须在本地和 VPS 指向相同 commit。
   - 发布前执行 release hygiene：git status clean、tag consistency、关键文件 md5 比对。
   - 禁止 dual-tag 情况。

5. **登录态验证**
   - 必须用真实测试账号（user-test@jueshi.net、admin-test@jueshi.net）验证。
   - 未登录访问所有 /workspace/* 必须 307 跳转 /login。
   - admin 登录必须看到管理后台入口。
