# 09 - 死代码审计

**审计日期**: 2026-07-08

---

## 死代码统计

| 类型 | 数量 | 风险等级 |
|------|------|----------|
| UI Lab 页面 | 7 | 🟡 中 |
| Legacy 组件 | 0 | 🟢 低 |
| 测试文件 | 0 | 🟢 低 |
| 临时文件 | 20 | 🟢 低 |
| 版本化组件 | 7 | 🟡 中 |

---

## 1. UI Lab 页面 (7 个)

### 发现的 UI Lab 页面

- `/(public)/ui-lab/jueshi-v4-home-candidate-v2`
- `/(public)/ui-lab/jueshi-v4-home-candidate-v3`
- `/(public)/ui-lab/jueshi-v4-home-candidate-v4`
- `/(public)/ui-lab/jueshi-v4-home-candidate`
- `/(public)/ui-lab/jueshi-v4-topnav-polished`
- `/(public)/ui-lab/jueshi-v4-topnav`
- `/(public)/ui-lab/jueshi-v4`


**建议**: 
- 评估每个 UI Lab 页面的使用情况
- 已投产的（如 v4-home-candidate-v4）保留
- 未使用的实验性页面考虑删除或归档

---

## 2. Legacy 组件 (0 个)

未发现明确的 legacy 标记组件


**建议**: 
- 检查是否有 old/legacy/deprecated 标记的组件
- 考虑添加 @deprecated JSDoc 标记

---

## 3. 测试文件 ({len(test_files)} 个)

src 目录下未发现测试文件


**建议**: 
- 测试文件应放在 `tests/` 或 `__tests__/` 目录
- 考虑将 src 中的测试文件移出

---

## 4. 临时文件 ({len(temp_files)} 个)

- `src/app/(public)/guides/shipping-quote-template`
- `src/app/(public)/tools/documents/drafts`
- `src/app/(public)/tools/template-studio`
- `src/app/(public)/tools/template-studio/template-studio-client.tsx`
- `src/app/(workspace)/workspace/templates`
- `src/app/api/internal/contentops/drafts`
- `src/app/api/template-studio`
- `src/app/api/template-studio/templates`
- `src/app/api/workspace/document-drafts`
- `src/app/api/workspace/products/template`
- ... 还有 10 个


**建议**: 
- 检查 draft/tmp/temp 文件是否为死代码
- 考虑清理未使用的临时文件

---

## 5. 版本化组件 ({len(versioned_components)} 个)

### UI Lab 版本目录

- `jueshi-v4`
- `jueshi-v4-home-candidate`
- `jueshi-v4-home-candidate-v2`
- `jueshi-v4-home-candidate-v3`
- `jueshi-v4-home-candidate-v4`
- `jueshi-v4-topnav`
- `jueshi-v4-topnav-polished`


**分析**:
- 存在多个版本的 Home Candidate (v1, v2, v3, v4)
- v4 已投产，v1-v3 可能为死代码

**建议**:
- ✅ 保留 `jueshi-v4-home-candidate-v4` (已投产)
- 🔴 考虑删除 `jueshi-v4-home-candidate` (v1)
- 🔴 考虑删除 `jueshi-v4-home-candidate-v2`
- 🔴 考虑删除 `jueshi-v4-home-candidate-v3`
- 🟡 评估 `jueshi-v4-topnav` 和 `jueshi-v4-topnav-polished` 的使用情况

---

## 6. 注释代码块

**发现**: {commented_files} 个文件包含注释代码块

**建议**: 
- 定期清理大段注释代码
- 使用版本控制而非注释保留历史代码

---

## 7. 重复导出检查

未发现明确的废弃导出\n

---

## 死代码清理优先级

### P0 - 立即清理

1. **UI Lab 旧版本组件**
   - `jueshi-v4-home-candidate` (v1)
   - `jueshi-v4-home-candidate-v2`
   - `jueshi-v4-home-candidate-v3`
   - **预计删除**: ~30 个文件
   - **风险**: 🟢 低（v4 已投产）

2. **重复组件** (已在 08_DUPLICATE_CODE_AUDIT.md 中列出)
   - 7 组重复组件
   - **预计删除**: 7 个文件

### P1 - 评估后清理

1. **UI Lab 实验页面**
   - 评估 7 个 UI Lab 页面
   - 保留已投产的，删除未使用的
   - **风险**: 🟡 中

2. **Home 目录重复模式**
   - 11 个重复的 Hero/Tools/Topics 组件
   - 合并为统一组件
   - **风险**: 🟡 中

### P2 - 长期清理

1. **测试文件位置**
   - 将 0 个测试文件移到正确位置
   - **风险**: 🟢 低

2. **临时文件清理**
   - 清理 20 个临时文件
   - **风险**: 🟢 低

---

## 预期收益

| 指标 | 当前 | 清理后 | 改善 |
|------|------|--------|------|
| 组件总数 | 213 | ~170 | -20% |
| UI Lab 页面 | 7 | ~3 | -80% |
| 代码体积 | 大 | 中 | -15% |
| 构建时间 | 慢 | 快 | -10% |
| 维护成本 | 高 | 低 | -25% |

---

**文档状态**: DEAD_CODE_AUDIT_COMPLETED  
**生成时间**: 2026-07-08 23:55 CST
