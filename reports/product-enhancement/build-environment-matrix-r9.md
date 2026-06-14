# Build Environment Matrix R9

**Date:** 2026-06-14  
**Purpose:** Compare Node.js versions and confirm build failure root cause

---

## Environment Comparison (After Alignment)

| Component | Local (Before) | Local (After) | VPS | Match |
|---|---|---|---|---|
| **OS** | macOS (Darwin arm64) | macOS (Darwin arm64) | Ubuntu (Linux x86_64) | ⚠️ Different |
| **Node.js** | v22.22.3 | **v22.22.2** ✅ | v22.22.2 | ✅ **Same** |
| **npm** | 10.9.8 | **10.9.7** ✅ | 10.9.7 | ✅ **Same** |
| **next** | 16.2.4 | 16.2.4 | 16.2.4 | ✅ Same |
| **react** | 19.2.4 | 19.2.4 | 19.2.4 | ✅ Same |
| **react-dom** | 19.2.4 | 19.2.4 | 19.2.4 | ✅ Same |

---

## V8 Engine Versions (After Alignment)

| Component | Local (Before) | Local (After) | VPS | Match |
|---|---|---|---|---|
| **V8** | 12.4.254.21-node.**56** | 12.4.254.21-node.**39** ✅ | 12.4.254.21-node.**39** | ✅ **Same** |
| **acorn** | 8.**16**.0 | 8.**15**.0 ✅ | 8.**15**.0 | ✅ **Same** |
| **amaro** | 1.1.**8** | 1.1.**5** ✅ | 1.1.**5** | ✅ **Same** |
| **openssl** | 3.5.**6** | 3.5.**5** ✅ | 3.5.**5** | ✅ **Same** |
| **simdjson** | 4.**5**.0 | 4.**2**.4 ✅ | 4.**2**.4 | ✅ **Same** |
| **sqlite** | 3.51.**3** | 3.51.**2** ✅ | 3.51.**2** | ✅ **Same** |
| **tz** | 2026a | 2025c ✅ | 2025c | ✅ **Same** |

---

## Build Results Comparison

### Before (Node.js 22.22.3)

| Commit | Environment | Build Result | Error |
|---|---|---|---|
| 50b7f69 | Local (22.22.3) | ❌ **失败** | useState null |
| origin/main | Local (22.22.3) | ❌ **失败** | useState null |
| 24fd7ef | Local (22.22.3) | ❌ **失败** | useState null |
| 50b7f69 | VPS (22.22.2) | ✅ **成功** | - |

### After (Node.js 22.22.2)

| Commit | Environment | Build Result | Error |
|---|---|---|---|
| 50b7f69 | Local (22.22.2) | ✅ **成功** | - |
| origin/main | Local (22.22.2) | ✅ **成功** | - |
| 0714e40 | Local (22.22.2) | ✅ **成功** | - |
| 08ba2f0 | Local (22.22.2) | ✅ **成功** | - |
| 3d7ad40 | Local (22.22.2) | ✅ **成功** | - |
| 18adc33 | Local (22.22.2) | ✅ **成功** | - |
| 24fd7ef | Local (22.22.2) | ✅ **成功** | - |

---

## Key Findings

### 1. Node.js 版本差异是根本原因

- **Node.js 22.22.3** (V8 .56) → build 失败
- **Node.js 22.22.2** (V8 .39) → build 成功
- **差异**: V8 引擎版本 .56 vs .39

### 2. 所有 Commits 在 Node.js 22.22.2 下都成功

- 50b7f69 ✅
- origin/main (8b68257) ✅
- 0714e40 ✅
- 08ba2f0 ✅
- 3d7ad40 ✅
- 18adc33 ✅
- 24fd7ef ✅

**结论**: 没有 build-breaking changes，所有 pending commits 都可以 build。

### 3. 本地环境已与 VPS 完全对齐

- Node.js: 22.22.2 ✅
- npm: 10.9.7 ✅
- V8: .39 ✅
- 所有关键依赖版本 ✅

---

## Recommendations

### ✅ 已完成：Node.js 环境对齐

**方法**: 下载 Node.js 22.22.2 预编译二进制包

**路径**: `/tmp/node-v22.22.2-darwin-arm64/bin/`

**使用**:
```bash
export PATH="/tmp/node-v22.22.2-darwin-arm64/bin:$PATH"
node -v  # v22.22.2
npm -v   # 10.9.7
```

### 下一步

1. **继续功能验证** - Workspace documentType, Proforma Word, Container / CBM
2. **推送 main 到 origin** - 所有 commits 都可以 build
3. **部署到生产** - 需要用户批准

---

**结论**: Build 失败是 Node.js 22.22.3 环境问题，降级到 22.22.2 后完全恢复。所有 pending commits 都可以 build。
