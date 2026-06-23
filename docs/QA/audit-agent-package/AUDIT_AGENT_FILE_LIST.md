# Audit Agent File List — v18.6.6.8

**Date:** 2026-06-23

---

## 推荐传给测试智能体的文件（24 文件）

### 项目规则文件（4）

| # | 文件 | 用途 |
|---|------|------|
| 1 | AGENTS.md | 项目代理规则 |
| 2 | HERMES.md | Hermes 工作规则 |
| 3 | docs/HERMES_ALWAYS_READ.md | 必读规则 |
| 4 | docs/STAGING_FIRST_POLICY.md | Staging 优先策略 |

### 核心文档（3）

| # | 文件 | 用途 |
|---|------|------|
| 5 | docs/QA/README.md | 文档目录与阅读顺序 |
| 6 | docs/QA/AUDIT_AGENT_BRIEF.md | 审计执行者简要指引 |
| 7 | docs/QA/AUDIT_AGENT_FILE_LIST.md | 本文件 |

### 策略文档（4）

| # | 文件 | 用途 |
|---|------|------|
| 8 | docs/QA/QA_SCOPE_INVENTORY.md | 测试范围盘点 (A-L) |
| 9 | docs/QA/MANUAL_QA_MASTER_PLAN.md | 总测试策略 |
| 10 | docs/QA/QA_EXECUTION_PHASES.md | 分阶段执行计划 |
| 11 | docs/QA/QA_EXIT_CRITERIA.md | 测试完成标准 |

### 测试清单（3）

| # | 文件 | 用途 |
|---|------|------|
| 12 | docs/QA/PRODUCTION_MANUAL_TEST_CHECKLIST.md | 生产只读测试清单 |
| 13 | docs/QA/STAGING_MANUAL_TEST_CHECKLIST.md | Staging 可写测试清单 |
| 14 | docs/QA/PRODUCTION_TEST_ACCOUNT_LIMITS.md | 测试账号限制与回收方案 |

### 测试矩阵（9）

| # | 文件 | 用途 |
|---|------|------|
| 15 | docs/QA/PAGE_BY_PAGE_TEST_MATRIX.md | 页面级测试矩阵 |
| 16 | docs/QA/ADMIN_MANUAL_TEST_MATRIX.md | 后台管理测试矩阵 |
| 17 | docs/QA/TOOLS_MANUAL_TEST_MATRIX.md | 邮编工具测试矩阵 |
| 18 | docs/QA/BBS_MANUAL_TEST_MATRIX.md | 社区测试矩阵 |
| 19 | docs/QA/DESTINATION_MANUAL_TEST_MATRIX.md | 国家页测试矩阵 |
| 20 | docs/QA/CONTENT_PUBLISHING_TEST_MATRIX.md | 内容发布测试矩阵 |
| 21 | docs/QA/MOBILE_MANUAL_TEST_MATRIX.md | 移动端测试矩阵 |
| 22 | docs/QA/SEO_SECURITY_TEST_MATRIX.md | SEO/安全测试矩阵 |
| 23 | docs/QA/OPS_MANUAL_TEST_MATRIX.md | 运维测试矩阵 |

### 模板与用例（3）

| # | 文件 | 用途 |
|---|------|------|
| 24 | docs/QA/TEST_EXECUTION_RECORD_TEMPLATE.md | 测试记录模板 |
| 25 | docs/QA/BUG_REPORT_TEMPLATE.md | 缺陷记录模板 |
| 26 | docs/QA/manual-test-cases.csv | 155 条测试用例 |

## 文件统计

| 统计项 | 数量 |
|--------|------|
| 项目规则 | 4 |
| 核心文档 | 3 |
| 策略文档 | 4 |
| 测试清单 | 3 |
| 测试矩阵 | 9 |
| 模板与用例 | 3 |
| **总文件** | **26** |

---

## 不得传给测试智能体的文件

| 类型 | 具体文件/模式 | 原因 |
|------|--------------|------|
| 环境变量 | .env, .env.production, .env.staging | 包含 DATABASE_URL、密钥 |
| 数据库连接 | DATABASE_URL | 包含密码 |
| 备份 | backups/, *.sql.gz, *.dump | 包含用户数据 |
| DB dumps | 任何 .sql 文件 | 包含用户数据 |
| SSH keys | ~/.ssh/id_*, *.pem | 私钥 |
| Private keys | 任何 BEGIN PRIVATE KEY 文件 | 私钥 |
| Cookies | cookie jars, session files | 会话凭据 |
| Sessions | session tokens | 会话凭据 |
| Tokens | API keys, JWT secrets | 密钥 |
| Password hashes | bcrypt hashes | 密码 |
| Production logs | 含服务器路径或敏感摘要的日志 | 敏感信息 |
| node_modules | node_modules/ | 依赖代码，非测试文件 |
| .next | .next/ | 构建产物 |
| Uploads | public/uploads/ 中的私有用户内容 | 用户隐私 |
| Reports | reports/ 中含服务器路径的文件 | 除非人工确认安全 |
