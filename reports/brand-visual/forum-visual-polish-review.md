# 论坛视觉 Polish 审查报告

**版本**: v1.20.42.6.55-Y-R  
**日期**: 2026-06-12  
**审查范围**: /bbs, /bbs/category/[key], /bbs/[slug], /bbs/new, /admin/forum

---

## 1. 审查概述

### 1.1 审查目标

- 检查论坛页面视觉一致性
- 识别与品牌色的不一致
- 评估状态标识（pinned/locked/pending）的清晰度
- 检查移动端适配
- 识别 Flarum 视觉残留
- 评估是否与工具站调性一致

### 1.2 审查原则

- **只审查，不大改**
- **小范围 polish 建议**
- **不改变功能逻辑**
- **保持当前布局结构**

---

## 2. 页面审查

### 2.1 /bbs 首页

#### 2.1.1 当前状态

**Hero 区域**:
```tsx
<div className="bg-gradient-to-br from-teal-600 via-emerald-600 to-cyan-600 text-white">
```

**按钮**:
```tsx
className="bg-teal-600 text-white"
```

**分类标签**:
```tsx
className="bg-teal-600 text-white"
```

#### 2.1.2 问题

| 问题 | 严重程度 | 说明 |
|------|----------|------|
| ❌ 颜色不一致 | 🟡 中 | 使用 `teal-600` 而非品牌色 `#1966f2` |
| ⚠️ 渐变方向 | 🟢 低 | teal-emerald-cyan 渐变与品牌色不匹配 |
| ✅ 布局合理 | - | 卡片式布局，间距合理 |
| ✅ 移动端适配 | - | 响应式布局正常 |

#### 2.1.3 建议

**颜色统一**:
```diff
- className="bg-teal-600 text-white"
+ className="bg-brand text-white"  // 使用品牌色 #1966f2
```

**Hero 渐变**:
```diff
- className="bg-gradient-to-br from-teal-600 via-emerald-600 to-cyan-600"
+ className="bg-gradient-to-br from-brand via-brand-dark to-blue-700"
```

---

### 2.2 /bbs/category/[key] 分类页

#### 2.2.1 当前状态

**Hero 区域**:
```tsx
<div className="bg-gradient-to-br from-teal-600 via-emerald-600 to-cyan-600 text-white">
```

**按钮**:
```tsx
className="bg-teal-600 text-white"
```

#### 2.2.2 问题

| 问题 | 严重程度 | 说明 |
|------|----------|------|
| ❌ 颜色不一致 | 🟡 中 | 使用 `teal-600` 而非品牌色 |
| ⚠️ 分类色未使用 | 🟢 低 | 未使用 `--color-cat-*` 变量 |
| ✅ 面包屑导航 | - | 清晰，层级明确 |
| ✅ 搜索功能 | - | 布局合理 |

#### 2.2.3 建议

**颜色统一**:
- 与 /bbs 首页保持一致
- 使用品牌色 `#1966f2`

**分类色应用**（可选）:
```tsx
// 根据分类 key 使用不同颜色
const categoryColors = {
  'overseas-life': 'cat-blue',
  'tools': 'cat-purple',
  'logistics': 'cat-orange',
  'feedback': 'cat-pink',
  'general': 'cat-teal',
};
```

---

### 2.3 /bbs/[slug] 帖子详情页

#### 2.3.1 当前状态

**Hero 区域**:
```tsx
<div className="bg-gradient-to-br from-teal-600 via-emerald-600 to-cyan-600 text-white">
```

**状态标识**:
```tsx
// Pinned
<span className="bg-red-100/80 text-red-200">
  <Pin className="w-3.5 h-3.5" />
  置顶
</span>

// Locked
<span className="bg-white/20 text-white">
  <Lock className="w-3.5 h-3.5" />
  已锁定
</span>
```

#### 2.3.2 问题

| 问题 | 严重程度 | 说明 |
|------|----------|------|
| ❌ 颜色不一致 | 🟡 中 | 使用 `teal-600` 而非品牌色 |
| ⚠️ Pinned 标识 | 🟢 低 | 红色背景，与品牌色不协调 |
| ⚠️ Locked 标识 | 🟢 低 | 白色半透明，不够醒目 |
| ✅ 面包屑导航 | - | 清晰，层级明确 |
| ✅ 评论区布局 | - | 合理，间距适当 |

#### 2.3.3 建议

**颜色统一**:
- 与 /bbs 首页保持一致

**Pinned 标识优化**:
```diff
- <span className="bg-red-100/80 text-red-200">
+ <span className="bg-amber-100 text-amber-700 border border-amber-200">
```

**Locked 标识优化**:
```diff
- <span className="bg-white/20 text-white">
+ <span className="bg-gray-100 text-gray-600 border border-gray-200">
```

---

### 2.4 /bbs/new 发帖页

#### 2.4.1 当前状态

**Hero 区域**:
```tsx
<div className="bg-gradient-to-br from-teal-600 via-emerald-600 to-cyan-600 text-white">
```

**提示框**:
```tsx
<div className="rounded-lg bg-amber-50 border border-amber-100 p-4">
```

#### 2.4.2 问题

| 问题 | 严重程度 | 说明 |
|------|----------|------|
| ❌ 颜色不一致 | 🟡 中 | 使用 `teal-600` 而非品牌色 |
| ✅ 提示框 | - | 使用 amber 色，合理 |
| ✅ 表单布局 | - | 合理，间距适当 |

#### 2.4.3 建议

**颜色统一**:
- 与 /bbs 首页保持一致

---

### 2.5 /admin/forum 后台管理

#### 2.5.1 当前状态

**未详细审查**（需要管理员权限）

#### 2.5.2 建议

- 使用品牌色 `#1966f2`
- 保持与主站后台风格一致
- 状态标识清晰（pending/published/hidden）

---

## 3. 状态标识审查

### 3.1 Pinned（置顶）

**当前**:
```tsx
<span className="bg-red-100/80 text-red-200 border border-red-200/50">
  <Pin className="w-3.5 h-3.5" />
  置顶
</span>
```

**问题**:
- 红色与品牌色不协调
- 半透明背景不够醒目

**建议**:
```tsx
<span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
  <Pin className="w-3.5 h-3.5" />
  置顶
</span>
```

**理由**:
- 琥珀色更醒目
- 与品牌色协调
- 符合"重要"的视觉语义

---

### 3.2 Locked（锁定）

**当前**:
```tsx
<span className="bg-white/20 text-white border border-white/20">
  <Lock className="w-3.5 h-3.5" />
  已锁定
</span>
```

**问题**:
- 白色半透明不够醒目
- 在浅色背景下不可见

**建议**:
```tsx
<span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">
  <Lock className="w-3.5 h-3.5" />
  已锁定
</span>
```

**理由**:
- 灰色更符合"禁用"的视觉语义
- 在各种背景下都可见
- 与品牌色协调

---

### 3.3 Pending（待审核）

**当前**: 未在论坛页面直接显示

**建议**:
```tsx
<span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">
  <Clock className="w-3.5 h-3.5" />
  待审核
</span>
```

**理由**:
- 蓝色符合"等待"的视觉语义
- 与品牌色协调
- 在后台管理中可用

---

## 4. 成长值奖励提示

### 4.1 当前状态

**未直接展示**: 论坛页面未显示成长值奖励信息

### 4.2 建议

**是否需要展示**: ⚠️ 可选

**如果需要展示**:
```tsx
// 发帖成功后
<div className="rounded-lg bg-green-50 border border-green-200 p-4">
  <p className="text-sm text-green-700">
    ✅ 帖子已提交！审核通过后将获得 <strong>+20 成长值</strong>
  </p>
</div>

// 评论成功后
<div className="rounded-lg bg-green-50 border border-green-200 p-4">
  <p className="text-sm text-green-700">
    ✅ 评论已提交！审核通过后将获得 <strong>+5 成长值</strong>
  </p>
</div>
```

**理由**:
- 激励用户参与
- 与成长体系联动
- 提升社区活跃度

---

## 5. 移动端适配

### 5.1 当前状态

| 页面 | 状态 | 说明 |
|------|------|------|
| /bbs | ✅ 良好 | 响应式布局，卡片式排列 |
| /bbs/category/[key] | ✅ 良好 | 响应式布局 |
| /bbs/[slug] | ✅ 良好 | 响应式布局 |
| /bbs/new | ✅ 良好 | 表单适配良好 |

### 5.2 问题

| 问题 | 严重程度 | 说明 |
|------|----------|------|
| ⚠️ 间距过小 | 🟢 低 | 部分卡片间距在移动端偏小 |
| ⚠️ 按钮高度 | 🟢 低 | 部分按钮 min-h-[40px] 可优化为 44px |

### 5.3 建议

**间距优化**:
```diff
- <div className="space-y-3">
+ <div className="space-y-4">  // 移动端间距稍大
```

**按钮高度**:
```diff
- className="min-h-[40px]"
+ className="min-h-[44px]"  // 符合移动端点击区域建议
```

---

## 6. Flarum 视觉残留

### 6.1 检查结果

| 检查项 | 状态 | 说明 |
|--------|------|------|
| Flarum logo | ✅ 无残留 | 未发现 |
| Flarum 色彩 | ✅ 无残留 | 未发现 |
| Flarum 样式 | ✅ 无残留 | 未发现 |
| bbs.jueshi.net | ✅ 无残留 | 已全部清理 |

### 6.2 结论

**Flarum 视觉残留**: ✅ 无

---

## 7. 过度社区化 / 娱乐化

### 7.1 检查结果

| 检查项 | 状态 | 说明 |
|--------|------|------|
| 表情包 | ✅ 无 | 未使用表情包 |
| 花哨动画 | ✅ 无 | 无过度动画 |
| 娱乐化文案 | ✅ 无 | 文案专业、简洁 |
| 社交化功能 | ✅ 无 | 无点赞/收藏/私信 |

### 7.2 结论

**过度社区化**: ✅ 无  
**娱乐化**: ✅ 无

论坛保持了工具站的专业调性，没有过度社区化或娱乐化。

---

## 8. 与工具站调性一致性

### 8.1 当前状态

| 维度 | 状态 | 说明 |
|------|------|------|
| 专业度 | ✅ 一致 | 简洁、专业 |
| 工具感 | ✅ 一致 | 功能导向 |
| 跨境贸易感 | ⚠️ 一般 | 未突出跨境特色 |
| 社区温度 | ⚠️ 一般 | 偏冷，可增加人情味 |

### 8.2 建议

**增加跨境贸易感**:
- Hero 文案可加入"跨境"、"出海"等关键词
- 分类可增加跨境相关标签

**增加社区温度**:
- 可增加欢迎文案
- 可展示活跃用户
- 可增加成长值奖励提示

---

## 9. 颜色统一建议

### 9.1 当前问题

论坛页面使用 `teal-600` (#0d9488)，品牌色是 `#1966f2`（蓝色）。

### 9.2 统一方案

**方案 A: 使用品牌色（推荐）**

将所有 `teal-600` 替换为 `brand`:
```diff
- className="bg-teal-600 text-white"
+ className="bg-brand text-white"
```

**优点**:
- 与主站品牌一致
- 视觉统一
- 专业感强

**缺点**:
- 需要修改多个文件

**方案 B: 保留 teal 色**

保持当前 teal 色系，但更新品牌色定义为 teal。

**优点**:
- 无需修改代码

**缺点**:
- 与主站品牌不一致
- 需要更新 globals.css

**推荐**: 方案 A（使用品牌色）

---

## 10. 总结

### 10.1 关键问题

| 优先级 | 问题 | 影响 |
|--------|------|------|
| 🟡 中 | 颜色不一致 | 视觉不统一 |
| 🟢 低 | Pinned/Locked 标识不够醒目 | 状态识别度低 |
| 🟢 低 | 移动端间距偏小 | 体验略差 |
| 🟢 低 | 未展示成长值奖励 | 激励不足 |

### 10.2 改进建议

**高优先级**:
1. 统一使用品牌色 `#1966f2`
2. 优化 Pinned/Locked 标识

**中优先级**:
3. 优化移动端间距
4. 增加成长值奖励提示

**低优先级**:
5. 增加跨境贸易感
6. 增加社区温度

### 10.3 不需要改进的方面

- ✅ 布局结构合理
- ✅ 功能完整
- ✅ 无 Flarum 残留
- ✅ 无过度社区化
- ✅ 无娱乐化

---

## 11. 实施建议

### 11.1 小范围 Polish（本轮可执行）

1. **颜色统一**: 将 `teal-600` 替换为 `brand`
2. **状态标识优化**: 优化 Pinned/Locked 标识颜色
3. **移动端间距**: 优化卡片间距

### 11.2 中等范围 Polish（下一轮可执行）

4. **成长值奖励提示**: 在发帖/评论成功后展示
5. **Hero 渐变优化**: 使用品牌色渐变

### 11.3 大范围 Polish（暂不执行）

6. **分类色应用**: 为不同分类使用不同颜色
7. **跨境贸易感**: 增加跨境相关元素
8. **社区温度**: 增加欢迎文案、活跃用户展示

---

**报告生成时间**: 2026-06-12  
**审查状态**: ✅ 完成
