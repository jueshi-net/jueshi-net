# 国家页测试矩阵 — v1.20.42.18.6.6.7

**环境:** Production (只读) + Staging (可写)

---

## 测试用例

| 用例ID | 页面 | 测试点 | 预期结果 | 严重级别 | Prod | Staging |
|--------|------|--------|----------|----------|------|---------|
| D-001 | /destinations | 国家列表 | 所有国家卡片正确显示 | P1 | ✅ | ✅ |
| D-002 | /destinations/canada | Hero | 标题、背景、CTA 正确 | P2 | ✅ | ✅ |
| D-003 | /destinations/canada | 当地时间 | 实时显示加拿大时间 | P1 | ✅ | ✅ |
| D-004 | /destinations/canada | 国家信息卡 | 基本信息（首都、语言、货币等） | P2 | ✅ | ✅ |
| D-005 | /destinations/canada | 快捷入口 | 工具链接可点击 | P2 | ✅ | ✅ |
| D-006 | /destinations/canada | 指南 | 文章列表正确 | P2 | ✅ | ✅ |
| D-007 | /destinations/canada | 专题 | 专题列表正确 | P2 | ✅ | ✅ |
| D-008 | /destinations/canada | 核对清单 | checklist 正确 | P2 | ✅ | ✅ |
| D-009 | /destinations/canada | 工具分组 | 只有一个工具区，不重复 | P1 | ✅ | ✅ |
| D-010 | /destinations/canada | 官方链接 | 外链正确、新窗口打开 | P2 | ✅ | ✅ |
| D-011 | /destinations/canada | 任务链 | 降级视觉，不 404 | P1 | ✅ | ✅ |
| D-012 | /destinations/canada | 社区入口 | 链接到 /bbs | P2 | ✅ | ✅ |
| D-013 | /destinations/canada | FAQ | 问答正确 | P2 | ✅ | ✅ |
| D-014 | /destinations/canada | SmartRelatedLinks | 相关国家链接正确 | P2 | ✅ | ✅ |
| D-015 | /destinations/canada | 免责声明 | 底部显示 | P3 | ✅ | ✅ |
| D-016 | /destinations/canada | 广告位关闭 | 无空白区域 | P2 | ✅ | ✅ |
| D-017 | /destinations/canada | 桌面双栏 | 双栏布局正确 | P2 | ✅ | ✅ |
| D-018 | /destinations/canada | 移动单栏 | 单栏布局、无溢出 | P2 | ✅ | ✅ |
| D-019 | /destinations/canada | canonical | canonical=/destinations/canada | P1 | ✅ | ✅ |
| D-020 | /destinations/canada | moduleConfig | 后台配置联动正确 | P1 | ❌ | ✅ |
| D-021 | /destinations/canada | adSlots | 广告位配置正确 | P2 | ❌ | ✅ |
| D-022 | /destinations/canada | 非物流偏重 | 页面是综合信息入口，不是物流页 | P1 | ✅ | ✅ |
| D-023 | /destinations/united-states | 全模块 | 同 canada 验证 | P1 | ✅ | ✅ |
| D-024 | /destinations/usa | 别名 | 308 → /destinations/united-states | P1 | ✅ | ✅ |
| D-025 | 其他 Tier1 国家 | 抽样 | 页面正常渲染 | P2 | ✅ | ✅ |
| D-026 | Tier2 国家 | 抽样 | 页面正常渲染 | P2 | ✅ | ✅ |
| D-027 | Tier3 国家 | 抽样 | 页面正常或空状态 | P3 | ✅ | ✅ |
| D-028 | alias 去重 | /destinations/usa vs /destinations/united-states | canonical 一致 | P1 | ✅ | ✅ |
