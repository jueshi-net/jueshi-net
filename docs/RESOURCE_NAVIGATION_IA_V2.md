# 资源导航 V2 信息架构设计

## 一、设计原则

1. **任务型导航** — 以用户任务为入口，不是分类列表
2. **场景优先** — "我要寄件" 比 "物流资源" 更直接
3. **工具关联** — 每个资源关联平台工具
4. **官方/第三方/社区分层** — 信任级别清晰
5. **国家筛选** — 跨境场景必备
6. **移动端优先** — 大卡片、大按钮、可滑动

## 二、页面结构

### 2.1 /resources-v2 首页

```
┌─────────────────────────────────┐
│         任务型 Hero             │
│   "你需要完成什么任务？"         │
│      [搜索框]                   │
├─────────────────────────────────┤
│  场景入口（9 个大卡片）          │
│  ┌─────┐ ┌─────┐ ┌─────┐      │
│  │寄件  │ │做发票│ │查邮编│      │
│  └─────┘ └─────┘ └─────┘      │
│  ┌─────┐ ┌─────┐ ┌─────┐      │
│  │找机构│ │做单据│ │收付款│      │
│  └─────┘ └─────┘ └─────┘      │
│  ┌─────┐ ┌─────┐ ┌─────┐      │
│  │注册  │ │查海关│ │留学  │      │
│  └─────┘ └─────┘ └─────┘      │
├─────────────────────────────────┤
│  热门国家                        │
│  [加拿大] [美国] [澳大利亚] ...  │
├─────────────────────────────────┤
│  官方资源专区                    │
│  [海关] [邮政] [商务] ...       │
├─────────────────────────────────┤
│  推荐资源                        │
│  [卡片1] [卡片2] [卡片3]        │
├─────────────────────────────────┤
│  相关工具推荐                    │
│  [工具1] [工具2] [工具3]        │
└─────────────────────────────────┘
```

### 2.2 场景页 /resources-v2/scene/[slug]

- 场景描述
- 该场景下的资源列表
- 该场景下的工具
- 该场景下的指南
- 国家筛选

### 2.3 资源详情页 /resources-v2/[id]

- 资源标题、描述
- 国家、分类
- 官方/第三方/社区标记
- 风险等级
- 免费/付费
- 最后检查日期
- 相关工具
- 相关指南
- 相关清单
- 收藏到 Workspace

## 三、资源卡片字段

```typescript
interface ResourceCard {
  id: string;
  title: string;
  description: string;
  url: string;
  country: string[];         // 国家代码
  category: string;           // 场景分类
  type: 'official' | 'third-party' | 'community' | 'tool';
  riskLevel: 'low' | 'medium' | 'high';
  isFree: boolean;
  lastChecked: string;        // ISO date
  relatedTools?: string[];    // tool routes
  relatedGuides?: string[];   // guide IDs
  relatedChecklists?: string[]; // checklist IDs
  featured?: boolean;         // 后台推荐
}
```

## 四、场景入口定义

| Slug | 名称 | 描述 | 关联工具 |
|------|------|------|----------|
| shipping | 我要寄件 | 国际物流、快递、专线 | shipping-calculator, shipping-label |
| invoice | 我要做发票 | 商业发票、形式发票 | documents/commercial-invoice |
| postal | 我要查邮编 | 邮编查询、地址格式化 | postal-code, address-formatter |
| official | 我要找官方机构 | 海关、邮政、商务部门 | — |
| documents | 我要做外贸单据 | 报价、合同、装箱单等 | documents/[type] |
| payment | 我要找跨境收款 | 收款平台、汇率 | exchange-rate |
| company | 我要注册公司 | 海外公司注册 | — |
| customs | 我要查海关 | HS编码、报关 | hs-code, customs-generator |
| education | 我要留学/生活 | 签证、学校、生活 | — |

## 五、后台管理

- 后台可配置推荐资源 (featured)
- 后台可管理场景分类
- 后台可标记资源状态（活跃/失效/待检查）
- 死链检查：定时任务检查 URL 可访问性

## 六、技术实现

- 路由: `/resources-v2` (不替换现有 /resources)
- 数据源: 复用现有 Resource DB 表
- 静态 fallback: 当 DB 数据不足时使用预设数据（标 TODO）
- Feature flag: staging 仅在 /resources-v2 路径可用
