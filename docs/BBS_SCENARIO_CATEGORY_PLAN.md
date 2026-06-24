# BBS 场景分类规划

## 分类映射

| 分类 Key | 名称 | 关联工具 | 场景 |
|----------|------|----------|------|
| trade-documents | 外贸单据 | documents/[type] | 发票、装箱单、合同 |
| intl-logistics | 国际物流 | shipping-calculator | 运费、快递、专线 |
| customs | 海关申报 | hs-code, customs-generator | HS编码、报关 |
| overseas-life | 海外生活 | postal-code | 签证、生活 |
| postal-address | 邮编地址 | postal-code | 邮编、地址格式 |
| cross-border-payment | 跨境收款 | exchange-rate | 收款、汇率 |
| platform-feedback | 平台使用反馈 | — | 功能建议、bug |

## 发帖预填

- 工具页"发起讨论"自动预填:
  - title: `[工具求助] {toolName}使用问题`
  - body: 包含工具名称、工具路由、问题描述模板
  - category: 根据工具类型自动选择
  - toolContext: 工具 slug（用于 ForumPost.relatedTool）

## 后续方向

- BBS 帖子详情页显示 related tool 卡片
- admin 可管理精选讨论
- 勋章/声望与工具贡献关联
