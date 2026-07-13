# 10 - 导航地图

**审计日期**: 2026-07-08

---

## 站点导航树

```
绝世百宝箱 (jueshi.net)
│
├── 🏠 首页 (/)
│   ├── 工具推荐
│   ├── 资源导航
│   ├── 专题展示
│   ├── 社区入口
│   └── 签到入口
│
├── 🔧 工具中心 (/tools)
│   ├── 📦 物流工具
│   │   ├── 运费计算器 (/tools/shipping-calculator)
│   │   ├── 运费估算器 (/tools/shipping-estimator)
│   │   ├── 集装箱计算 (/tools/container)
│   │   └── 敏感货物查询 (/tools/sensitive-goods)
│   │
│   ├── 📄 文档工具
│   │   ├── 商业发票 (/tools/commercial-invoice)
│   │   ├── 装箱单 (/tools/packing-list)
│   │   ├── 报关单 (/tools/customs-generator)
│   │   ├── 提单 (/tools/shipping-label)
│   │   ├── 报价单 (/tools/quote)
│   │   └── 交接单 (/tools/handover-note)
│   │
│   ├── 💰 财务工具
│   │   ├── 汇率换算 (/tools/exchange-rate)
│   │   ├── 费用计算 (/tools/calculator)
│   │   └── 收据生成 (/tools/receipt)
│   │
│   ├── 🔍 查询工具
│   │   ├── 邮编查询 (/tools/postal-code)
│   │   ├── HS 编码 (/tools/hs-code)
│   │   └── 二维码生成 (/tools/qrcode)
│   │
│   ├── 🤖 AI 工具
│   │   ├── 产品文案 (/ai-tools/product-copy)
│   │   ├── 翻译润色 (/ai-tools/translate-polish)
│   │   └── 文档摘要 (/ai-tools/document-summary)
│   │
│   └── 🎨 Template Studio (/tools/template-studio)
│       ├── 模板列表
│       ├── 模板编辑器
│       └── Canvas 编辑器
│
├── 📚 资源目录 (/resources)
│   ├── 资源列表
│   ├── 资源详情 (/resources/site/[id])
│   ├── 资源分类
│   └── 推荐资源
│
├── 🌍 目的地 (/destinations)
│   ├── 目的地列表
│   ├── 国家详情 (/destinations/[slug])
│   ├── 签证信息
│   ├── 海关规定
│   └── 生活指南
│
├── 📖 指南 (/guides)
│   ├── 指南列表
│   ├── 指南详情 (/guides/[slug])
│   ├── 热门指南
│   │   ├── 国际运输文件
│   │   ├── HS 编码基础
│   │   ├── 商业发票指南
│   │   ├── 包装清单指南
│   │   └── 各国运输指南
│   └── 分类浏览
│
├── ✅ 清单 (/checklists)
│   ├── 清单列表
│   ├── 清单详情 (/checklists/[slug])
│   ├── 运输清单
│   ├── 出口文件清单
│   └── 搬家清单
│
├── 🎯 专题 (/topics)
│   ├── 专题列表
│   ├── 专题详情 (/topics/[slug])
│   ├── 跨境电商
│   ├── 留学海外
│   └── 国际物流
│
├── 💬 社区 (/community)
│   ├── 帖子列表
│   ├── 帖子详情 (/community/[slug])
│   ├── 发帖 (/community/new)
│   ├── 分类浏览 (/community/c/[slug])
│   ├── 标签浏览 (/community/t/[slug])
│   └── 用户主页 (/u/[id])
│
├── 📰 博客 (/blog)
│   ├── 博客列表
│   └── 文章详情 (/blog/[slug])
│
├── 🏢 国家信息 (/countries)
│   ├── 国家列表
│   └── 国家详情 (/countries/[country])
│
├── 🏙️ 城市信息 (/cities)
│   └── 城市详情 (/cities/[city])
│
├── 🎓 新手指南 (/starter)
│   ├── 场景选择 (/starter/[slug])
│   ├── 学生出国 (/starter/student)
│   └── 应用推荐 (/starter/apps)
│
├── 💼 商务 (/business)
│   └── 企业服务
│
├── 💰 定价 (/pricing)
│   ├── 套餐列表
│   └── 套餐详情 (/packages/[id])
│
├── 📊 排行榜 (/rankings)
│   └── 工具排行
│
├── 🔍 搜索 (/search)
│   └── 全站搜索
│
├── ⭐ 收藏 (/favorites)
│   └── 我的收藏
│
├── 📝 反馈 (/feedback)
│   └── 提交反馈
│
├── 📄 法律页面
│   ├── 隐私政策 (/privacy)
│   ├── 服务条款 (/terms)
│   └── 更新日志 (/changelog)
│
├── 🔐 用户中心
│   ├── 登录 (/login)
│   ├── 注册 (/register)
│   ├── 忘记密码 (/forgot-password)
│   ├── 重置密码 (/reset-password)
│   ├── 个人设置 (/preferences)
│   ├── 个人资料 (/profile)
│   └── 通知中心 (/notifications)
│
├── 💼 工作区 (/workspace)
│   ├── 仪表盘 (/dashboard)
│   │   ├── 概览
│   │   ├── 任务 (/dashboard/tasks)
│   │   ├── 文档 (/dashboard/documents)
│   │   ├── 通知 (/dashboard/notifications)
│   │   ├── 积分 (/dashboard/points)
│   │   └── 统计 (/dashboard/stats)
│   │
│   ├── 工作区 (/workspace)
│   │   ├── 概览
│   │   ├── 收藏 (/workspace/favorites)
│   │   ├── 备忘录 (/workspace/memos)
│   │   ├── 文档 (/workspace/documents)
│   │   ├── 产品 (/workspace/products)
│   │   ├── 公司档案 (/workspace/company-profiles)
│   │   ├── 任务链 (/workspace/task-chains)
│   │   ├── 模板 (/workspace/templates)
│   │   ├── 邀请 (/workspace/invites)
│   │   ├── 通知 (/workspace/notifications)
│   │   ├── 设置 (/workspace/settings)
│   │   └── 会员 (/workspace/member)
│   │
│   ├── 工作台 (/workbench)
│   │   └── 快速访问
│   │
│   └── 我的链接 (/my-links)
│       └── 链接管理
│
├── 🎁 奖励系统
│   ├── 优惠券 (/workspace/coupons)
│   └── 兑换历史 (/workspace/rewards/history)
│
├── 📱 订阅 (/subscribe)
│   └── 订阅确认 (/subscribe/confirm)
│
├── 💳 支付
│   └── 支付成功 (/payment/success)
│
├── 🔗 分享 (/share/[id])
│   └── 分享页面
│
├── 📊 追踪 (/tracking)
│   └── 物流追踪
│
└── 🧪 UI Lab (/ui-lab)
    ├── V4 首页候选 (/ui-lab/jueshi-v4-home-candidate-v4)
    ├── V4 导航候选 (/ui-lab/jueshi-v4-topnav)
    └── 其他实验页面
```

---

## Header 导航结构

```
Header
├── Logo + 品牌
├── 主导航
│   ├── 工具 (/tools)
│   ├── 资源 (/resources)
│   ├── 目的地 (/destinations)
│   ├── 指南 (/guides)
│   ├── 清单 (/checklists)
│   └── 社区 (/community)
├── 搜索框
├── 用户菜单
│   ├── 登录/注册 (未登录)
│   └── 工作区/设置/退出 (已登录)
└── 主题切换
```

---

## Footer 导航结构

```
Footer
├── 品牌信息
├── 快速链接
│   ├── 关于我们
│   ├── 联系方式
│   ├── 帮助中心
│   └── 更新日志
├── 法律信息
│   ├── 隐私政策
│   └── 服务条款
├── 社交媒体
│   ├── 微信
│   ├── 微博
│   └── GitHub
└── 版权信息
```

---

## 导航健康度

| 区域 | 页面数 | 健康度 |
|------|--------|--------|
| 公共页面 | 130 | ✅ 完整 |
| 用户中心 | 9 | ✅ 完整 |
| 工作区 | 24 | ✅ 完整 |
| 管理后台 | 58 | ✅ 完整 |
| UI Lab | 7 | 🟡 实验性 |

---

**文档状态**: NAVIGATION_MAP_COMPLETED  
**生成时间**: 2026-07-09 00:00 CST
