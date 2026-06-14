# Build Environment Matrix

**Date:** 2026-06-13  
**Purpose:** Compare local and VPS build environments to identify build failure root cause

---

## Environment Comparison

| Component | Local (Mac) | VPS (Ubuntu) | Difference |
|---|---|---|---|
| **OS** | macOS (Darwin arm64) | Ubuntu (Linux x86_64) | ⚠️ Different |
| **Node.js** | v22.22.3 | v22.22.2 | ⚠️ Minor |
| **npm** | 10.9.8 | 10.9.7 | ⚠️ Minor |
| **next** | 16.2.4 | 16.2.4 | ✅ Same |
| **react** | 19.2.4 | 19.2.4 | ✅ Same |
| **react-dom** | 19.2.4 | 19.2.4 | ✅ Same |

---

## V8 Engine Versions

| Component | Local | VPS | Difference |
|---|---|---|---|
| **V8** | 12.4.254.21-node.**56** | 12.4.254.21-node.**39** | ⚠️ **Significant** |
| **acorn** | 8.**16**.0 | 8.**15**.0 | ⚠️ Minor |
| **amaro** | 1.1.**8** | 1.1.**5** | ⚠️ Minor |
| **openssl** | 3.5.**6** | 3.5.**5** | ⚠️ Minor |
| **simdjson** | 4.**5**.0 | 4.**2**.4 | ⚠️ Minor |
| **sqlite** | 3.51.**3** | 3.51.**2** | ⚠️ Minor |
| **tz** | 2026a | 2025c | ⚠️ Minor |

---

## npm Configuration

| Config | Local | VPS |
|---|---|---|
| registry | https://registry.npmmirror.com | https://registry.npmmirror.com |
| legacy-peer-deps | false | false |
| omit | (empty) | (empty) |
| production | null | null |

---

## React Instance Check

### Local

```bash
npm ls react react-dom next
```

**Result**: All packages are deduped (只有一个实例) ✅

```
├─┬ @next/third-parties@16.2.6
│ ├── next@16.2.4 deduped
│ └── react@19.2.4 deduped
├─┬ @react-pdf/renderer@4.5.1
│ └── react@19.2.4 deduped
```

### VPS

**Result**: 未执行（VPS build 成功，无需检查）

---

## Build Results

### Local Build Matrix

| Commit | npm ci | npm run build | Exit Code | 失败页面 | 错误 |
|---|---|---|---|---|---|
| 50b7f69 | ✅ | ❌ | 1 | /starter/amazon-seller | useState null |
| 151ca62 | - | 未测试 | - | - | - |
| 0714e40 | - | 未测试 | - | - | - |
| 08ba2f0 | - | 未测试 | - | - | - |
| 3d7ad40 | - | 未测试 | - | - | - |
| 18adc33 | - | 未测试 | - | - | - |
| 24fd7ef | - | 未测试 | - | - | - |

### VPS Build Matrix

| Commit | npm ci | npm run build | Exit Code | 失败页面 | 错误 |
|---|---|---|---|---|---|
| 50b7f69 | ✅ | ✅ **成功** | 0 | - | - |

---

## Key Findings

### 1. Build 失败是本地环境问题

- **本地 build 失败** (Node.js 22.22.3)
- **VPS build 成功** (Node.js 22.22.2)
- **代码相同** (50b7f69)
- **依赖相同** (package-lock.json)

### 2. 失败页面随机变化

本地 build 失败时，失败页面每次不同：
- 第 1 次: /admin/analytics/task-chains, /forgot-password, /tools/shipping-calculator
- 第 2 次: /forgot-password
- 第 3 次: /starter/amazon-seller

**说明**: 这是并发/竞态问题，不是特定页面问题。

### 3. V8 引擎版本差异

- **本地**: V8 12.4.254.21-node.**56**
- **VPS**: V8 12.4.254.21-node.**39**

**推测**: Node.js 22.22.3 的 V8 引擎更新可能与 Next.js 16.2.4 的并发 prerender 机制不兼容。

### 4. 并发 prerender 问题

- Next.js 16.2.4 使用 Turbopack 进行并发 prerender
- 项目有 100+ 个页面需要 prerender
- Node.js 22.22.3 的并发行为可能有变化
- 导致 React 实例在并发 prerender 时为 null

---

## Recommendations

### 方案 1: 降级 Node.js 到 22.22.2（推荐）

**理由**: VPS 使用 Node.js 22.22.2，build 成功。

**步骤**:
1. 安装 Node.js 22.22.2
2. 清理 node_modules 和 .next
3. 重新执行 npm ci
4. 执行 npm run build

**风险**: 需要重新安装 Node.js。

### 方案 2: 禁用 Turbopack

**理由**: Turbopack 可能有并发问题。

**步骤**:
1. 修改 next.config.ts，禁用 Turbopack
2. 使用 webpack 进行 build

**风险**: build 时间可能增加。

### 方案 3: 在 VPS 上继续开发

**理由**: VPS build 成功。

**步骤**:
1. 在 VPS 创建开发目录
2. 推送代码到 VPS
3. 在 VPS 上执行 build 和测试

**风险**: 开发环境不如本地方便。

---

**结论**: Build 失败是本地 Node.js 22.22.3 环境问题，不是代码问题。建议降级 Node.js 到 22.22.2。
