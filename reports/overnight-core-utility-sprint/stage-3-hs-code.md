# Stage 3 — HS 编码工具人性化升级

**版本**: v1.20.42.6.38
**执行时间**: 2026-06-10
**状态**: ✅ 完成
**Commit**: 7574b5a

---

## 一、修改文件清单

| 文件 | 修改内容 |
|---|---|
| `src/app/(public)/tools/hs-code/page.tsx` | 完整重写：示例商品、复制按钮、最近查询、官方入口、相关工具、FAQ 扩充、EventLog |

---

## 二、当前 HS 数据源判断

- **数据源**: PostgreSQL HSCode 表，51,838 条真实海关数据
- **API**: `/api/tools/hs-code?q=...` — Prisma 查询，支持中文品名模糊匹配 + 编码前缀匹配
- **真实性**: ✅ 真实数据，非伪造
- **伪数据风险**: 无

---

## 三、已实现功能

### 1. 示例商品按钮
- 中文：保温杯、棉T恤、手机壳、LED灯、陶瓷杯、双肩包
- 英文：stainless steel bottle、phone case
- 点击自动填入并触发查询

### 2. 复制按钮
- 复制 HS 编码
- 复制英文商品描述
- 复制成功有 toast 反馈

### 3. 最近查询
- localStorage 保存最近 5 条查询
- 显示查询词和结果数量
- 点击可快速回填

### 4. 官方入口模块
- 🇨🇳 中国海关总署
- 🇺🇸 美国 HTS 查询
- 🇬🇧 英国 Trade Tariff
- 🌐 WCO 国际协调制度

### 5. 相关工具模块
- 商业发票
- 报价单
- 运费计算

### 6. 相关清单模块
- RelatedChecklistSection

### 7. 结果解释
- 每条结果增加"💡 说明"区块
- 解释匹配逻辑和归类建议

### 8. FAQ 扩充
- 从 2 条增至 6 条
- 新增：HS编码可以直接用于报关吗、同一个商品为什么可能有不同编码、如何确定正确编码、HS编码和关税的关系、查询结果不准确怎么办

### 9. EventLog
- Tool_View (mount)
- Query
- Click_Example
- Copy_Result
- Click_Verify
- Related_Tool_Click

### 10. 无结果状态
- 显示"未找到匹配"
- 推荐示例商品按钮

---

## 四、验收

- ✅ `/tools/hs-code` 200
- ✅ `/tools?q=HS编码` 有结果
- ✅ `/tools?q=hs code` 有结果
- ✅ 中文搜索验证通过
- ✅ 英文搜索验证通过
- ✅ 无结果状态正常
- ✅ 免责声明存在
- ✅ 复制按钮功能正常
- ✅ 官方入口链接正确
- ✅ 相关工具链接正确
- ✅ EventLog 触发正常

---

## 五、npm run build 结果

```
✅ Build 通过，无错误
```

---

## 六、Git commit hash

**Commit**: `7574b5a`
**Message**: `v1.20.42.6.38 Stage 3: HS Code humanization - examples, copy, recent, related tools, FAQ, EventLog`

---

*阶段 3 完成，可进入阶段 4。*
