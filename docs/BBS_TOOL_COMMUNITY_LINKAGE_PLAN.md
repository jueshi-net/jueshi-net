# 社区工具联动规划

## 一、目标

社区服务工具，不把论坛变成主线。实现轻量联动。

## 二、联动设计

### 2.1 工具页 → 社区

- 工具页面底部显示"相关讨论"区块
- 显示与该工具相关的最新 3-5 条帖子
- "有问题？发帖提问"按钮
- 发帖自动带工具类型和上下文

### 2.2 发帖预填

```typescript
interface ToolPostContext {
  toolType: string;
  toolName: string;
  question?: string;
  errorContext?: string;
  // 预填帖子内容
  prefillTitle: string;     // `[工具求助] 商业发票填写问题`
  prefillBody: string;      // 包含工具名称、问题描述模板
  prefillCategory: string;  // 自动选择对应分类
}
```

### 2.3 社区 → 工具

- BBS 帖子详情页显示"相关工具"推荐
- 根据帖子分类推荐工具
- admin 可管理精选讨论

## 三、社区分类

| 分类 Key | 名称 | 关联工具 |
|----------|------|----------|
| trade-documents | 外贸单据 | documents/[type] |
| intl-logistics | 国际物流 | shipping-calculator, shipping-label |
| customs | 海关申报 | hs-code, customs-generator |
| overseas-life | 海外生活 | postal-code |
| postal-address | 邮编地址 | postal-code, address-formatter |
| platform-feedback | 平台使用反馈 | — |

## 四、实现方案（staging）

### 4.1 Related Discussions 区块

```tsx
<div className="related-discussions">
  <h3>相关讨论</h3>
  {posts.map(post => (
    <a href={`/bbs/post/${post.id}`}>{post.title}</a>
  ))}
  <button onClick={() => createToolPost(toolType)}>
    有问题？发帖提问 →
  </button>
</div>
```

### 4.2 发帖预填

- 跳转到 /bbs/new?toolContext=xxx
- BBS 发帖页面读取 toolContext 参数
- 自动填充标题、正文模板、分类

### 4.3 BBS 详情页推荐工具

```tsx
<div className="related-tools">
  <h3>相关工具</h3>
  {tools.map(tool => (
    <a href={tool.route}>{tool.name}</a>
  ))}
</div>
```

### 4.4 后台管理

- admin 可标记帖子为"精选讨论"
- 精选讨论在工具页面优先展示
- admin 可编辑帖子关联的工具

## 五、权限

| 操作 | 普通用户 | admin |
|------|----------|-------|
| 查看相关讨论 | ✅ | ✅ |
| 发帖提问 | ✅ | ✅ |
| 标记精选 | ❌ | ✅ |
| 编辑关联工具 | ❌ | ✅ |
| 删除帖子 | 自己的 | ✅ |

## 六、审计

- 工具页相关讨论显示 ✅
- 点击发帖带上下文 ✅
- 普通用户权限正确 ✅
- admin 管理正确 ✅
- 移动端可用 ✅
