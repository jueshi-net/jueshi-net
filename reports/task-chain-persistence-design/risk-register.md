# Risk Register — 风险登记册

**版本**: v1.20.42.6.41
**日期**: 2026-06-11

---

## 一、Quote Sheet draftId 恢复风险

| 风险项 | 等级 | 说明 | 缓解措施 |
|---|---|---|---|
| draftId 加载失败 | 🟢 无 | 不改 `use-draft-loader.ts` | 无需措施 |
| draftId 参数冲突 | 🟢 无 | taskChainId 与 draftId 独立 | 无需措施 |
| 草稿数据被覆盖 | 🟢 无 | 不改保存逻辑 | 无需措施 |
| 恢复历史版本失败 | 🟢 无 | 不改 restore API | 无需措施 |

**结论**：零风险。不修改 Quote Sheet 任何核心逻辑。

---

## 二、Commercial Invoice draftId 恢复风险

| 风险项 | 等级 | 说明 | 缓解措施 |
|---|---|---|---|
| draftId 加载失败 | 🟢 无 | 不改 `use-draft-loader.ts` | 无需措施 |
| draftId 参数冲突 | 🟢 无 | taskChainId 与 draftId 独立 | 无需措施 |
| 草稿数据被覆盖 | 🟢 无 | 不改保存逻辑 | 无需措施 |
| 恢复历史版本失败 | 🟢 无 | 不改 restore API | 无需措施 |
| 预填横幅覆盖已有字段 | 🟢 无 | 已有「只填空字段」逻辑 | 无需措施 |

**结论**：零风险。不修改 Commercial Invoice 任何核心逻辑。

---

## 三、Workspace 首屏加载风险

| 风险项 | 等级 | 说明 | 缓解措施 |
|---|---|---|---|
| 新增查询变慢 | 🟢 低 | 新增 `taskChainDraft.findMany` 查询 | 限制 take: 5，加 index |
| 页面渲染变慢 | 🟢 低 | 任务数据量小 | Promise.allSettled 并行 |
| 未登录重定向 | 🟢 无 | 已有 `redirect("/login")` | 无需措施 |
| 数据为空展示 | 🟢 低 | 需处理空状态 | 展示「暂无任务」引导 |

### 缓解方案

```typescript
// Workspace 主页面新增查询
const taskChainsRes = await prisma.taskChainDraft.findMany({
  where: { userId, status: { in: ["draft", "active"] } },
  orderBy: { updatedAt: "desc" },
  take: 5,  // 限制数量
});
```

**结论**：低风险。新增查询数据量小，不影响首屏性能。

---

## 四、Auth session 风险

| 风险项 | 等级 | 说明 | 缓解措施 |
|---|---|---|---|
| Session 劫持 | 🟢 低 | 不改 Auth 逻辑 | 无需措施 |
| Session 过期处理 | 🟢 低 | API 返回 401 已有处理 | 无需措施 |
| 匿名用户冒充 | 🟡 中 | sessionId 可伪造 | 导入时验证 sessionId 格式 |
| 权限绕过 | 🟢 低 | API 层校验 userId | 无需措施 |

### 缓解方案

```typescript
// 导入 API 校验
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });
  
  // 只允许导入当前用户的 localStorage 数据
  // 前端传递 sessionId，后端验证格式
  const { sessionId, taskChain } = await req.json();
  if (!sessionId || !/^[\w-]+$/.test(sessionId)) {
    return NextResponse.json({ error: "无效的 sessionId" }, { status: 400 });
  }
  // ...
}
```

**结论**：低风险。不改 Auth 核心逻辑，只在 API 层做校验。

---

## 五、ToolDocument 数据结构污染风险

| 风险项 | 等级 | 说明 | 缓解措施 |
|---|---|---|---|
| taskChainId 字段污染 | 🟢 无 | 新增独立模型，不改 ToolDocumentDraft 结构 | 无需措施 |
| dataJson 格式混乱 | 🟢 无 | 不改 dataJson 逻辑 | 无需措施 |
| toolKey 枚举污染 | 🟢 无 | 不新增 toolKey 值 | 无需措施 |
| 草稿列表混乱 | 🟢 无 | 独立展示，不混入 | 无需措施 |

**结论**：零风险。TaskChainDraft 是独立模型，不修改 ToolDocumentDraft 现有字段。

唯一改动：ToolDocumentDraft 新增 `taskChainId` 可选字段（可空，不影响现有数据）。

---

## 六、localStorage 与数据库同步冲突

| 风险项 | 等级 | 说明 | 缓解措施 |
|---|---|---|---|
| 重复导入 | 🟡 中 | 用户多次点击导入 | 导入后清除 localStorage |
| 数据冲突 | 🟡 中 | 本地与后端数据不一致 | 后端优先，覆盖本地 |
| 多设备不同步 | 🔴 高 | localStorage 不跨设备 | 提示用户保存到工作台 |
| 清除缓存丢失 | 🔴 高 | 用户清除浏览器数据 | 提示 + 自动检测 |
| 并发导入 | 🟡 中 | 多标签页同时导入 | 前端加锁，防重复提交 |

### 缓解方案

1. **导入后清除**：
```typescript
const handleImport = async () => {
  const res = await fetch('/api/me/task-chains/import-local', { ... });
  if (res.ok) {
    clearTaskChain();  // 导入成功后清除 localStorage
    setShowImportPrompt(false);
  }
};
```

2. **后端优先**：
```typescript
// 工具页面加载时
useEffect(() => {
  // 1. 先检查后端是否有任务链
  fetch('/api/me/task-chains?status=active')
    .then(res => res.json())
    .then(data => {
      if (data.length > 0) {
        // 后端有数据，忽略 localStorage
        setTaskChain(data[0]);
      } else {
        // 后端无数据，检查 localStorage
        const local = getTaskChain();
        if (local) setTaskChain(local);
      }
    });
}, []);
```

3. **提示用户**：
```
「建议保存到工作台，避免数据丢失」
「当前数据仅保存在此浏览器」
```

**结论**：中高风险。需要明确的同步策略和用户提示。

---

## 七、多设备同步预期风险

| 风险项 | 等级 | 说明 | 缓解措施 |
|---|---|---|---|
| 用户期望跨设备同步 | 🔴 高 | localStorage 不支持 | Phase 2 后使用后端 |
| 数据不一致 | 🔴 高 | 多设备数据冲突 | 后端优先策略 |
| 用户困惑 | 🟡 中 | 「为什么手机上看不到」 | 明确提示「仅保存在此浏览器」 |

### 缓解方案

1. **Phase 1 明确提示**：
```
「当前任务数据仅保存在此浏览器。
登录后可保存到工作台，实现跨设备同步。」
```

2. **Phase 2 后自动同步**：
- 保存到后端后，所有设备可见
- localStorage 仅作临时缓存

**结论**：高风险（Phase 1），Phase 2 后解决。

---

## 八、用户误以为已保存但实际未保存的风险

| 风险项 | 等级 | 说明 | 缓解措施 |
|---|---|---|---|
| 「保存到工作台」按钮误导 | 🔴 高 | Phase 1 点击后只提示「即将开放」 | 改文案为「登录后可保存」 |
| localStorage 数据丢失 | 🔴 高 | 清除缓存/换设备 | 提示 + 导入功能 |
| 用户未注意提示 | 🟡 中 | 弹窗被忽略 | 多次提醒 |

### 缓解方案

1. **Phase 1 文案优化**：
```
当前：「保存到工作台功能即将开放。当前任务链数据已保存在本机浏览器。」
建议：「当前数据仅保存在此浏览器，清除缓存会丢失。登录后可保存到工作台，实现跨设备同步。」
```

2. **未登录用户按钮文案**：
```
当前：「保存到工作台」
建议：「登录并保存到工作台」
```

3. **已登录用户按钮文案**：
```
当前：「保存到工作台」→ 弹窗「即将开放」
建议：Phase 2 后真正保存，Phase 1 保持现状但文案更明确
```

**结论**：高风险。需要优化文案，明确告知用户数据保存状态。

---

## 九、免费用户存储上限风险

| 风险项 | 等级 | 说明 | 缓解措施 |
|---|---|---|---|
| 超出上限无法保存 | 🟡 中 | 免费用户 5 个上限 | 提示升级会员 |
| 上限设置不合理 | 🟡 中 | 5 个可能太少/太多 | 收集反馈后调整 |
| 管理员无上限 | 🟢 低 | 内部使用 | 无需措施 |

### 缓解方案

```typescript
// 保存前检查上限
const count = await prisma.taskChainDraft.count({
  where: { userId, status: { in: ["draft", "active"] } },
});

const limit = user.isPremium ? 50 : 5;
if (count >= limit) {
  return NextResponse.json({
    error: `已达上限（${limit} 个）。${user.isPremium ? '' : '升级会员可保存更多。'}`,
    upgradeRequired: !user.isPremium,
  }, { status: 403 });
}
```

**结论**：中风险。需要合理的上限设置和升级提示。

---

## 十、隐私与数据保留风险

| 风险项 | 等级 | 说明 | 缓解措施 |
|---|---|---|---|
| 敏感信息存储 | 🟡 中 | 商品名/地址/邮编 | 隐私政策告知 |
| 管理员查看 | 🟡 中 | 审计/客服场景 | 记录审计日志 |
| 数据保留过长 | 🟡 中 | 用户遗忘权 | 提供删除功能 |
| GDPR 合规 | 🟡 中 | 海外用户 | 隐私政策 + 删除功能 |
| 数据泄露 | 🟢 低 | 后端安全 | 常规安全措施 |

### 缓解方案

1. **隐私政策**：
```
「我们会保存您的任务链数据（包括商品名、地址等），
用于跨工具传递和跨设备同步。
您可以随时在「工作台 > 我的任务」中删除数据。」
```

2. **删除功能**：
- 单个任务删除
- 批量删除
- 「清除所有任务数据」

3. **管理员审计**：
```typescript
// 管理员查看任务链时记录
await prisma.auditLog.create({
  data: {
    userId: admin.id,
    action: "view_task_chain",
    entity: "TaskChainDraft",
    entityId: taskChainId,
  },
});
```

4. **数据保留策略**：
- draft: 90 天无更新 → archived
- completed: 180 天 → archived
- archived: 365 天 → 删除

**结论**：中风险。需要隐私政策告知 + 删除功能 + 审计日志。

---

## 风险汇总

| 风险类别 | 等级 | 阶段 | 是否阻塞 |
|---|---|---|---|
| Quote Sheet 恢复 | 🟢 无 | 全阶段 | 否 |
| Commercial Invoice 恢复 | 🟢 无 | 全阶段 | 否 |
| Workspace 首屏加载 | 🟢 低 | Phase 3 | 否 |
| Auth session | 🟢 低 | 全阶段 | 否 |
| ToolDocument 污染 | 🟢 无 | 全阶段 | 否 |
| localStorage 同步冲突 | 🟡-🔴 | Phase 1-2 | 否（需缓解） |
| 多设备同步预期 | 🔴 | Phase 1 | 否（需提示） |
| 用户误以为已保存 | 🔴 | Phase 1 | 否（需文案优化） |
| 免费用户上限 | 🟡 | Phase 3 | 否 |
| 隐私与数据保留 | 🟡 | Phase 2+ | 否 |

---

## 关键风险缓解优先级

| 优先级 | 风险 | 缓解措施 | 阶段 |
|---|---|---|---|
| P0 | 用户误以为已保存 | 优化文案，明确告知 | Phase 1 |
| P0 | 多设备同步预期 | 明确提示「仅保存在此浏览器」 | Phase 1 |
| P1 | localStorage 同步冲突 | 导入后清除 + 后端优先 | Phase 2 |
| P1 | 隐私与数据保留 | 隐私政策 + 删除功能 | Phase 2 |
| P2 | 免费用户上限 | 合理设置 + 升级提示 | Phase 3 |

---

## 结论

**无阻塞性风险。**

所有风险均有缓解方案，可在不同阶段逐步解决。关键是在 Phase 1 就明确告知用户数据保存状态，避免期望落差。
