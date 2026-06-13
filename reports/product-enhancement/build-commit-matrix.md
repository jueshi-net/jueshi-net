# Build Commit Matrix

**日期**: 2026-06-13  
**目的**: 定位 build 失败的边界

---

## 测试环境

| 项目 | 值 |
|---|---|
| Node.js | v22.22.3 |
| npm | 10.9.8 |
| Next.js | 16.2.4 |
| React | 19.2.4 |
| React DOM | 19.2.4 |

---

## Build Matrix

### Turbopack (默认)

| Commit | Message | Exit Code | 第一个失败页面 | 错误类型 | 是否 useState null | 失败页面是否变化 |
|---|---|---|---|---|---|---|
| 50b7f69 | docs: v1.20.42.6.70 production deploy verification report | 1 | /admin/ad-creatives | TypeError | ✅ 是 | ✅ 是 |
| 151ca62 | v1.20.42.6.71-R: Core Tool Real Polish | 1 | /admin/ad-creatives | TypeError | ✅ 是 | ✅ 是 |
| 0714e40 | v1.20.42.6.71-R3: Container calculation wording fix | - | - | - | - | - |
| 08ba2f0 | v1.20.42.6.71-R4: Logged-in verification report | - | - | - | - | - |
| 3d7ad40 | v1.20.42.6.71-R5: Workspace documentType normalization fix | - | - | - | - | - |
| 18adc33 | docs: v1.20.42.6.71-R6 build gate analysis report | 1 | /starter/amazon-seller | TypeError | ✅ 是 | ✅ 是 |

### Webpack (--webpack)

| Commit | Message | Exit Code | 第一个失败页面 | 错误类型 | 是否 useState null | 失败页面是否变化 |
|---|---|---|---|---|---|---|
| 50b7f69 | docs: v1.20.42.6.70 production deploy verification report | 1 | 随机 | TypeError | ✅ 是 | ✅ 是 |
| 18adc33 | docs: v1.20.42.6.71-R6 build gate analysis report | 1 | 随机 | TypeError | ✅ 是 | ✅ 是 |

---

## 关键发现

### 1. 所有 commit 都失败

- **50b7f69** (last known green): ❌ 失败
- **151ca62**: ❌ 失败
- **18adc33** (current HEAD): ❌ 失败

**结论**: Build 失败不是最近引入的，是预先存在的问题。

### 2. 失败页面随机变化

**Build 1**:
- /starter/amazon-seller
- /ai-tools/translate-polish
- /admin/ad-creatives
- /tools/shipping-calculator
- /forgot-password

**Build 2**:
- /tools/shipping-estimator
- /starter/amazon-seller
- /admin/ad-creatives
- /ai-tools/document-summary
- /login

**Build 3**:
- /tools/shipping-calculator
- /starter/amazon-seller
- /admin/analytics/task-chains
- /forgot-password
- /ai-tools/document-summary

**结论**: 失败是随机的，说明是并发/竞态问题。

### 3. Turbopack 和 webpack 都失败

- **Turbopack**: ❌ 失败
- **Webpack**: ❌ 失败

**结论**: 不是 Turbopack 特有问题。

### 4. 错误相同

所有失败都是同一个错误：
```
TypeError: Cannot read properties of null (reading 'useState')
```

**结论**: 是同一个根因导致。

---

## 根因分析

### 错误堆栈

```
TypeError: Cannot read properties of null (reading 'useState')
    at <unknown> (.next/server/chunks/ssr/[root-of-the-server]__12dakxa._.js:2:1452)
```

### 可能原因

1. **React 实例在 prerender 阶段为 null**
   - Next.js 16.2.4 + React 19.2.4 兼容性问题
   - 并发 prerender 时 React 实例被 GC 或未正确初始化

2. **竞态条件**
   - 每次失败页面不同，说明是并发问题
   - Turbopack/webpack 的并发编译导致

3. **内存/资源限制**
   - 项目有 100+ 个页面需要 prerender
   - 内存不足可能导致 React 实例被提前回收

### 排除的原因

1. ❌ **不是特定 commit 引入** - 50b7f69 也失败
2. ❌ **不是特定页面问题** - 失败页面随机变化
3. ❌ **不是 Turbopack 特有问题** - webpack 也失败
4. ❌ **不是缺少 "use client"** - 所有失败的客户端组件都有正确指令
5. ❌ **不是重复 React 实例** - npm ls 显示只有一个 React 实例

---

## Build Log 路径

| Commit | 构建器 | Log 路径 |
|---|---|---|
| 50b7f69 | Turbopack | `reports/product-enhancement/build-logs/build-50b7f69.log` |
| 50b7f69 | Webpack | `reports/product-enhancement/build-logs/build-50b7f69-webpack.log` |

---

## 结论

### 首个失败 commit

**无法确定** - 所有测试的 commit 都失败，包括 50b7f69（last known green）。

### 是否由 R5 引入

**否** ✅ - 50b7f69 也失败。

### 是否由 R4/R3 引入

**否** ✅ - 50b7f69 也失败。

### 是否为环境问题

**可能** - 可能是 Next.js 16.2.4 + React 19.2.4 的兼容性问题。

### 是否为依赖锁问题

**否** - React 实例检查显示只有一个实例，版本一致。

---

## 建议

### 优先级 1: 降级 Next.js/React 版本

**理由**: Next.js 16.2.4 + React 19.2.4 可能存在兼容性问题

**步骤**:
1. 降级到 Next.js 15.x + React 18.x
2. 调整相关 API（如 params 类型）
3. 重新测试 build

**风险**: 可能需要修改部分代码

### 优先级 2: 联系 Next.js 支持

**理由**: 这可能是 Next.js 16 的 bug

**步骤**:
1. 提交 issue 到 Next.js GitHub
2. 提供完整的错误日志和复现步骤
3. 等待官方修复

**风险**: 等待时间长，不确定何时有修复

---

**报告完成。**
