# Beta Day-1 Monitoring Checklist

**生成时间**: 2026-06-13 07:50 UTC  
**用途**: Beta 发布第一天监控清单

---

## 监控频率

**每 4 小时检查一次**（建议时间点）：
- 08:00 UTC
- 12:00 UTC
- 16:00 UTC
- 20:00 UTC
- 00:00 UTC (次日)
- 04:00 UTC (次日)

---

## 监控项目

### 1. 系统稳定性

#### 1.1 Runtime Guard

**检查命令**:
```bash
ssh deploy@192.129.155.149 "cd /home/deploy/xixiong-saas && cat runtime-guard.json 2>/dev/null | jq -r '.passed, .timestamp' || echo 'Runtime guard file not found'"
```

**预期结果**:
- `passed`: true
- `timestamp`: 最近 1 小时内

**异常处理**:
- 如果 `passed: false`，立即检查 PM2 logs
- 如果文件不存在，检查 Runtime Guard 脚本是否运行

#### 1.2 PM2 Status

**检查命令**:
```bash
ssh deploy@192.129.155.149 "pm2 status xixiong-saas --no-color | grep xixiong-saas"
```

**预期结果**:
- `status`: online
- `uptime`: 持续增长
- `restart`: 不快速增长（< 5 次/4小时）

**异常处理**:
- 如果 `status: errored`，立即重启 PM2
- 如果 `restart` 快速增长，检查 PM2 logs

#### 1.3 PM2 Error Logs

**检查命令**:
```bash
ssh deploy@192.129.155.149 "pm2 logs xixiong-saas --nostream --lines 200 2>&1 | grep -iE '(P1000|P2010|28P01|DatabaseNotReachable|unhandledRejection|fatal|out of memory)' | tail -20"
```

**预期结果**:
- 无 P1000/P2010/28P01/DatabaseNotReachable 错误
- 无 unhandledRejection/fatal/out of memory 错误

**异常处理**:
- 如果出现 P1000/P2010/28P01，立即检查数据库连接
- 如果出现 DatabaseNotReachable，立即检查数据库服务
- 如果出现 unhandledRejection/fatal，立即检查代码错误

---

### 2. 用户指标

#### 2.1 注册数

**检查命令**:
```bash
ssh deploy@192.129.155.149 "cd /home/deploy/xixiong-saas && source .env.production && psql \$DATABASE_URL -c \"SELECT COUNT(*) FROM users WHERE createdAt >= NOW() - INTERVAL '4 hours';\""
```

**预期结果**:
- 注册数: 0-10/4小时（Beta 期间）

**异常处理**:
- 如果注册数突然增长（> 50/4小时），检查是否有异常注册
- 如果注册数为 0，检查注册流程是否正常

#### 2.2 登录成功率

**检查命令**:
```bash
ssh deploy@192.129.155.149 "cd /home/deploy/xixiong-saas && source .env.production && psql \$DATABASE_URL -c \"SELECT COUNT(*) FROM event_logs WHERE eventType = 'LOGIN_SUCCESS' AND createdAt >= NOW() - INTERVAL '4 hours';\" && psql \$DATABASE_URL -c \"SELECT COUNT(*) FROM event_logs WHERE eventType = 'LOGIN_ATTEMPT' AND createdAt >= NOW() - INTERVAL '4 hours';\""
```

**预期结果**:
- 登录成功率: > 95%

**异常处理**:
- 如果登录成功率 < 90%，检查登录流程
- 如果出现大量 LOGIN_FAILED，检查是否有暴力破解

---

### 3. 功能指标

#### 3.1 Quote Sheet 保存数

**检查命令**:
```bash
ssh deploy@192.129.155.149 "cd /home/deploy/xixiong-saas && source .env.production && psql \$DATABASE_URL -c \"SELECT COUNT(*) FROM tool_document_history WHERE toolName = 'quote-sheet' AND action IN ('create', 'update') AND createdAt >= NOW() - INTERVAL '4 hours';\""
```

**预期结果**:
- 保存数: 0-20/4小时（Beta 期间）

**异常处理**:
- 如果保存数突然增长（> 100/4小时），检查是否有异常操作
- 如果保存数为 0，检查保存流程是否正常

#### 3.2 Commercial Invoice 保存数

**检查命令**:
```bash
ssh deploy@192.129.155.149 "cd /home/deploy/xixiong-saas && source .env.production && psql \$DATABASE_URL -c \"SELECT COUNT(*) FROM tool_document_history WHERE toolName = 'commercial-invoice' AND action IN ('create', 'update') AND createdAt >= NOW() - INTERVAL '4 hours';\""
```

**预期结果**:
- 保存数: 0-20/4小时（Beta 期间）

**异常处理**:
- 如果保存数突然增长（> 100/4小时），检查是否有异常操作
- 如果保存数为 0，检查保存流程是否正常

#### 3.3 Workspace 访问数

**检查命令**:
```bash
ssh deploy@192.129.155.149 "cd /home/deploy/xixiong-saas && source .env.production && psql \$DATABASE_URL -c \"SELECT COUNT(*) FROM event_logs WHERE eventType = 'WORKSPACE_VIEW' AND createdAt >= NOW() - INTERVAL '4 hours';\""
```

**预期结果**:
- 访问数: 0-50/4小时（Beta 期间）

**异常处理**:
- 如果访问数突然增长（> 200/4小时），检查是否有异常访问
- 如果访问数为 0，检查 Workspace 页面是否正常

---

### 4. 论坛指标

#### 4.1 发帖数

**检查命令**:
```bash
ssh deploy@192.129.155.149 "cd /home/deploy/xixiong-saas && source .env.production && psql \$DATABASE_URL -c \"SELECT COUNT(*) FROM forum_posts WHERE createdAt >= NOW() - INTERVAL '4 hours';\""
```

**预期结果**:
- 发帖数: 0-10/4小时（Beta 期间）

**异常处理**:
- 如果发帖数突然增长（> 50/4小时），检查是否有垃圾帖子
- 如果发帖数为 0，检查发帖流程是否正常

#### 4.2 评论数

**检查命令**:
```bash
ssh deploy@192.129.155.149 "cd /home/deploy/xixiong-saas && source .env.production && psql \$DATABASE_URL -c \"SELECT COUNT(*) FROM forum_comments WHERE createdAt >= NOW() - INTERVAL '4 hours';\""
```

**预期结果**:
- 评论数: 0-20/4小时（Beta 期间）

**异常处理**:
- 如果评论数突然增长（> 100/4小时），检查是否有垃圾评论
- 如果评论数为 0，检查评论流程是否正常

---

### 5. 错误指标

#### 5.1 500 错误数

**检查命令**:
```bash
ssh deploy@192.129.155.149 "pm2 logs xixiong-saas --nostream --lines 500 2>&1 | grep -i '500' | wc -l"
```

**预期结果**:
- 500 错误数: < 10/4小时

**异常处理**:
- 如果 500 错误数 > 20/4小时，立即检查错误日志
- 如果 500 错误数 > 50/4小时，考虑回滚

#### 5.2 DB 错误数

**检查命令**:
```bash
ssh deploy@192.129.155.149 "pm2 logs xixiong-saas --nostream --lines 500 2>&1 | grep -iE '(P1000|P2010|28P01)' | wc -l"
```

**预期结果**:
- DB 错误数: 0/4小时

**异常处理**:
- 如果 DB 错误数 > 0，立即检查数据库连接
- 如果 DB 错误数 > 5/4小时，考虑回滚

---

### 6. 用户反馈

#### 6.1 论坛反馈

**检查方式**:
1. 访问 https://jueshi.net/bbs
2. 查看最新帖子
3. 统计反馈数量

**预期结果**:
- 反馈数量: 0-10/4小时（Beta 期间）

**异常处理**:
- 如果出现 P0 反馈（阻塞问题），立即处理
- 如果出现多个相同问题的反馈，优先处理

#### 6.2 邮件反馈

**检查方式**:
1. 检查 support@jueshi.net 邮箱（待配置）
2. 统计反馈数量

**预期结果**:
- 反馈数量: 0-5/4小时（Beta 期间）

**异常处理**:
- 如果出现 P0 反馈（阻塞问题），立即处理
- 如果出现多个相同问题的反馈，优先处理

---

## 监控记录表

### 第 1 次检查 (08:00 UTC)

| 项目 | 结果 | 状态 | 备注 |
|------|------|------|------|
| Runtime Guard | | ✅/⚠️/❌ | |
| PM2 Status | | ✅/⚠️/❌ | |
| PM2 Error Logs | | ✅/⚠️/❌ | |
| 注册数 | | ✅/⚠️/❌ | |
| 登录成功率 | | ✅/⚠️/❌ | |
| Quote Sheet 保存数 | | ✅/⚠️/❌ | |
| Commercial Invoice 保存数 | | ✅/⚠️/❌ | |
| Workspace 访问数 | | ✅/⚠️/❌ | |
| Forum 发帖数 | | ✅/⚠️/❌ | |
| Forum 评论数 | | ✅/⚠️/❌ | |
| 500 错误数 | | ✅/⚠️/❌ | |
| DB 错误数 | | ✅/⚠️/❌ | |
| 用户反馈 | | ✅/⚠️/❌ | |

### 第 2 次检查 (12:00 UTC)

| 项目 | 结果 | 状态 | 备注 |
|------|------|------|------|
| Runtime Guard | | ✅/⚠️/❌ | |
| PM2 Status | | ✅/⚠️/❌ | |
| PM2 Error Logs | | ✅/⚠️/❌ | |
| 注册数 | | ✅/⚠️/❌ | |
| 登录成功率 | | ✅/⚠️/❌ | |
| Quote Sheet 保存数 | | ✅/⚠️/❌ | |
| Commercial Invoice 保存数 | | ✅/⚠️/❌ | |
| Workspace 访问数 | | ✅/⚠️/❌ | |
| Forum 发帖数 | | ✅/⚠️/❌ | |
| Forum 评论数 | | ✅/⚠️/❌ | |
| 500 错误数 | | ✅/⚠️/❌ | |
| DB 错误数 | | ✅/⚠️/❌ | |
| 用户反馈 | | ✅/⚠️/❌ | |

### 第 3 次检查 (16:00 UTC)

| 项目 | 结果 | 状态 | 备注 |
|------|------|------|------|
| Runtime Guard | | ✅/⚠️/❌ | |
| PM2 Status | | ✅/⚠️/❌ | |
| PM2 Error Logs | | ✅/⚠️/❌ | |
| 注册数 | | ✅/⚠️/❌ | |
| 登录成功率 | | ✅/⚠️/❌ | |
| Quote Sheet 保存数 | | ✅/⚠️/❌ | |
| Commercial Invoice 保存数 | | ✅/⚠️/❌ | |
| Workspace 访问数 | | ✅/⚠️/❌ | |
| Forum 发帖数 | | ✅/⚠️/❌ | |
| Forum 评论数 | | ✅/⚠️/❌ | |
| 500 错误数 | | ✅/⚠️/❌ | |
| DB 错误数 | | ✅/⚠️/❌ | |
| 用户反馈 | | ✅/⚠️/❌ | |

### 第 4 次检查 (20:00 UTC)

| 项目 | 结果 | 状态 | 备注 |
|------|------|------|------|
| Runtime Guard | | ✅/⚠️/❌ | |
| PM2 Status | | ✅/⚠️/❌ | |
| PM2 Error Logs | | ✅/⚠️/❌ | |
| 注册数 | | ✅/⚠️/❌ | |
| 登录成功率 | | ✅/⚠️/❌ | |
| Quote Sheet 保存数 | | ✅/⚠️/❌ | |
| Commercial Invoice 保存数 | | ✅/⚠️/❌ | |
| Workspace 访问数 | | ✅/⚠️/❌ | |
| Forum 发帖数 | | ✅/⚠️/❌ | |
| Forum 评论数 | | ✅/⚠️/❌ | |
| 500 错误数 | | ✅/⚠️/❌ | |
| DB 错误数 | | ✅/⚠️/❌ | |
| 用户反馈 | | ✅/⚠️/❌ | |

---

## 异常处理流程

### P0 异常（阻塞问题）

**触发条件**:
- Runtime Guard passed=false
- PM2 status=errored
- DB 错误数 > 5/4小时
- 500 错误数 > 50/4小时
- 用户反馈出现阻塞问题

**处理流程**:
1. 立即通知用户
2. 检查错误日志
3. 确定问题根因
4. 如果无法快速修复，考虑回滚
5. 回滚后通知用户

### P1 异常（影响使用）

**触发条件**:
- PM2 restart 快速增长（> 10 次/4小时）
- 登录成功率 < 90%
- 500 错误数 > 20/4小时
- 用户反馈出现影响使用问题

**处理流程**:
1. 检查错误日志
2. 确定问题根因
3. 制定修复计划
4. 尽快修复
5. 通知用户

### P2 异常（小问题）

**触发条件**:
- 注册数/保存数/访问数异常
- 用户反馈出现小问题

**处理流程**:
1. 记录问题
2. 纳入 Beta 后 backlog
3. 在下一个版本修复

---

## 监控工具

### 自动化监控脚本（待开发）

建议开发自动化监控脚本，每 4 小时自动执行以下检查：
1. Runtime Guard 检查
2. PM2 status 检查
3. PM2 logs 检查
4. 数据库查询（注册数、保存数等）
5. 生成监控报告
6. 发送告警（如有异常）

### 手动监控

如果自动化监控脚本未开发，需要手动执行上述检查命令。

---

**文档生成时间**: 2026-06-13 07:50 UTC  
**文档路径**: `reports/beta-launch/beta-day-1-monitoring-checklist.md`
