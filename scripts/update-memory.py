#!/usr/bin/env python3
"""Prepend Phase 3 completion summary to PROJECT_MEMORY.md"""

summary = """## ✅ 三期前端歼灭战完成记录 (2026-05-28)

### 模块一：全局导航重构
- 删除社区BBS链接（延至四期）
- 主导航新增：邮编查询、HS码查询（置顶）
- 新增下拉菜单：单据中心（6项）、全能工具（5项）
- 移动端菜单精简，删除重复论坛区

### 模块二：首页去重 + 订阅打通
- 删除首页中段重复NewsletterForm（保留底部）
- 订阅API集成Resend（条件初始化，无API Key时不报错）

### 模块三：专题404修复
- 根因：templateType !== rating_list 直接404，忽略CMS回退
- 修复：非rating_list专题优先渲染CMS回退内容
- 创建 docs/TOPIC_GENERATION_PROMPT.md 标准专题导入模板

### 模块四：邮编页功能挂载
- 新增当地实时时钟组件（支持8国时区）
- 新增中国驻XX大使馆链接（8国）
- 新增汇率工具快捷跳转按钮

### 模块五：国家页服务商websiteUrl
- Prisma schema新增 websiteUrl String? (DestinationService + DestinationGuide)
- Admin编辑页新增官网地址输入框
- 前端服务商名称支持点击跳转外链（target="_blank"）

### 数据库变更
- destination_services.website_url (text, nullable) — 服务商官网
- destination_guides.website_url (text, nullable) — 指南链接
- hs_codes.code 移除 @unique（支持51838条多CIQ记录）

---

"""

path = "/Users/chq/xixiong-saas/docs/PROJECT_MEMORY.md"
with open(path, "r") as f:
    content = f.read()

# Update the Phase line
content = content.replace(
    "**Phase**: 三期 — UX 精修与板块联动",
    "**Phase**: 三期 — UX 精修与板块联动 [DONE]"
)

# Insert summary after the positioning line
content = content.replace(
    "> **Positioning**: 全域出国基础设施平台 (NOT just cross-border seller tool)\n\n---",
    "> **Positioning**: 全域出国基础设施平台 (NOT just cross-border seller tool)\n\n" + summary + "---"
)

with open(path, "w") as f:
    f.write(content)

print(f"Updated PROJECT_MEMORY.md ({len(content)} bytes)")
