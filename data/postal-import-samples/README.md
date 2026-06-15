# Postal Code Import Samples

**目录用途**: 存储 VN/TW 邮编数据源的样本文件，用于 dry-run 验证

**创建日期**: 2026-06-13  
**版本**: v1.20.42.6.86

---

## 文件清单

### Taiwan (TW)

| 文件 | 大小 | 说明 | 来源 |
|---|---|---|---|
| `tw-zip-code-gist.json` | 514 行 | 台湾邮编数据（3-5 码） | GitHub Gist |
| `tw-street-names.txt` | 30,031 行 | 台湾街道名称中英文对照 | 中华邮政 |
| `tw-3plus3-postal.csv` | 5 行 | 台湾 3+3 码元数据（非实际数据） | data.gov.tw |

### Vietnam (VN)

| 文件 | 大小 | 说明 | 来源 |
|---|---|---|---|
| （无） | - | VN 数据质量太低，未下载 | - |

---

## 数据源说明

### Taiwan (TW)

**主数据源**: GitHub Gist (taiwan-zip-code.json)
- URL: https://gist.githubusercontent.com/ajhsu/86b2f4fd5e94c2111d7d93ee9c6a4345/raw/taiwan-zip-code.json
- 格式: JSON
- License: 未明确声明（GitHub Gist 公开数据）
- 质量评分: **B+**
- 建议: **可以导入**

**官方数据源**: data.gov.tw (3+3 码邮递区号)
- URL: https://data.gov.tw/dataset/150689
- 提供机关: 中华邮政股份有限公司
- License: 政府资料开放授权条款-第1版
- 格式: CSV (BIG5 编码)
- 最后更新: 2026-06-01
- 质量评分: **A-**（需要进一步下载完整数据）

### Vietnam (VN)

**搜索结果**:
- datahub.io: 需要联系销售，无法直接下载
- GeoNames: VN 邮编数据返回 404
- GitHub: 未找到完整的免费 VN 邮编数据集
- zipcodevietnam.com: 只有省份级别邮编范围，无街道数据
- worldpostalcode.com: 只有省份级别数据

**结论**: 
- 数据质量评分: **D**
- 建议: **暂缓导入，寻找商业数据源**

---

## 注意事项

### 不要提交大文件

以下文件**不应该**提交到 Git：
- 大型原始数据文件（> 1 MB）
- 临时下载文件
- 未清洗的数据

### 应该提交的文件

以下文件**可以**提交到 Git：
- 小型样本文件（< 100 KB）
- 清洗后的数据文件
- README 和文档
- Dry-run 脚本和报告

### 当前提交状态

| 文件 | 是否提交 | 原因 |
|---|---|---|
| `tw-zip-code-gist.json` | ✅ 是 | 小文件（514 行），用于验证 |
| `tw-street-names.txt` | ⚠️ 可选 | 中等文件（30K 行），可选择性提交 |
| `tw-3plus3-postal.csv` | ✅ 是 | 小文件（5 行），元数据 |

---

## 使用 Dry-run 脚本

### 基本用法

```bash
# 验证所有国家
node scripts/dry-run-postal-import-batch-a.mjs

# 只验证 Taiwan
node scripts/dry-run-postal-import-batch-a.mjs --country=TW

# 只验证 Vietnam
node scripts/dry-run-postal-import-batch-a.mjs --country=VN
```

### 输出说明

脚本会输出：
- 总输入行数
- 有效行数
- 无效行数
- 重复行数
- 缺少字段统计
- 唯一键数
- 预计插入数
- 样本记录（前 10 条）
- Import Manifest（JSON 格式）

### 重要提示

- **默认模式**: DRY-RUN（不写入数据库）
- **禁止使用**: `--execute` 参数（本轮禁止真实导入）
- **需要批准**: 真实导入需要用户明确批准

---

## 下一步

1. **用户确认 TW 数据导入**
   - 是否保留繁体中文字段？
   - 是否需要补充经纬度数据？
   - 是否需要获取完整 6 码数据？

2. **用户确认 VN 数据处理**
   - 是否接受当前限制？
   - 是否寻找商业数据源？

3. **执行导入（需用户批准）**
   - 创建真实导入脚本
   - 使用 `--execute` 参数
   - 验证导入结果

---

**最后更新**: 2026-06-13  
**维护者**: Hermes Agent
