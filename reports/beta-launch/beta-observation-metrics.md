# Beta Observation Metrics

**生成时间**: 2026-06-12T16:15:00Z  
**版本**: v1.20.42.6.61

---

## 概述

本文档定义了 Beta 期间需要监控的关键指标，用于评估 Beta 成功与否，并指导后续决策。

---

## 一、用户指标

### 1.1 注册数
**目标**: 10-50 人  
**监控频率**: 每日  
**数据来源**: `users` 表

**查询命令**:
```bash
cd /home/deploy/xixiong-saas
source .env.production
export DATABASE_URL
node -e "
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
const count = await prisma.user.count();
console.log('Total users:', count);
const recent = await prisma.user.count({
  where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }
});
console.log('Recent (7 days):', recent);
await prisma.\$disconnect();
"
```

**成功标准**:
- ✅ Beta 期间新增 10-50 用户
- ⚠️ < 10 用户：需要增加邀请
- ❌ > 50 用户：可能需要限制注册

### 1.2 登录成功率
**目标**: > 95%  
**监控频率**: 每日  
**数据来源**: `event_logs` 表

**查询命令**:
```bash
cd /home/deploy/xixiong-saas
source .env.production
export DATABASE_URL
node -e "
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
const total = await prisma.eventLog.count({
  where: { eventType: 'Auth_Login' }
});
const failed = await prisma.eventLog.count({
  where: { eventType: 'Auth_Login_Failed' }
});
const successRate = total > 0 ? ((total - failed) / total * 100).toFixed(2) : 0;
console.log('Total login attempts:', total);
console.log('Failed attempts:', failed);
console.log('Success rate:', successRate + '%');
await prisma.\$disconnect();
"
```

**成功标准**:
- ✅ > 95% 成功率
- ⚠️ 90-95%：需要调查失败原因
- ❌ < 90%：可能存在登录问题

### 1.3 日活跃用户 (DAU)
**目标**: 5-20 人  
**监控频率**: 每日  
**数据来源**: `event_logs` 表

**查询命令**:
```bash
cd /home/deploy/xixiong-saas
source .env.production
export DATABASE_URL
node -e "
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
const today = new Date();
today.setHours(0, 0, 0, 0);
const activeUsers = await prisma.eventLog.groupBy({
  by: ['userId'],
  where: { createdAt: { gte: today } }
});
console.log('DAU:', activeUsers.length);
await prisma.\$disconnect();
"
```

**成功标准**:
- ✅ 5-20 DAU
- ⚠️ < 5 DAU：用户活跃度低
- ❌ > 20 DAU：可能需要扩容

---

## 二、功能指标

### 2.1 Quote Sheet 保存数
**目标**: 20+  
**监控频率**: 每日  
**数据来源**: `event_logs` 表

**查询命令**:
```bash
cd /home/deploy/xixiong-saas
source .env.production
export DATABASE_URL
node -e "
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
const count = await prisma.eventLog.count({
  where: { eventType: 'Document_Save', toolName: 'quote_sheet' }
});
console.log('Quote Sheet saves:', count);
await prisma.\$disconnect();
"
```

**成功标准**:
- ✅ 20+ 保存
- ⚠️ 10-20 保存：使用率一般
- ❌ < 10 保存：需要改进用户体验

### 2.2 Commercial Invoice 保存数
**目标**: 20+  
**监控频率**: 每日  
**数据来源**: `event_logs` 表

**查询命令**:
```bash
cd /home/deploy/xixiong-saas
source .env.production
export DATABASE_URL
node -e "
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
const count = await prisma.eventLog.count({
  where: { eventType: 'Document_Save', toolName: 'commercial_invoice' }
});
console.log('Commercial Invoice saves:', count);
await prisma.\$disconnect();
"
```

**成功标准**:
- ✅ 20+ 保存
- ⚠️ 10-20 保存：使用率一般
- ❌ < 10 保存：需要改进用户体验

### 2.3 Workspace 访问数
**目标**: 50+  
**监控频率**: 每日  
**数据来源**: `event_logs` 表

**查询命令**:
```bash
cd /home/deploy/xixiong-saas
source .env.production
export DATABASE_URL
node -e "
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
const count = await prisma.eventLog.count({
  where: { path: { contains: '/workspace' } }
});
console.log('Workspace visits:', count);
await prisma.\$disconnect();
"
```

**成功标准**:
- ✅ 50+ 访问
- ⚠️ 20-50 访问：使用率一般
- ❌ < 20 访问：需要改进用户体验

### 2.4 Forum 发帖数
**目标**: 5+  
**监控频率**: 每日  
**数据来源**: `forum_posts` 表

**查询命令**:
```bash
cd /home/deploy/xixiong-saas
source .env.production
export DATABASE_URL
node -e "
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
const count = await prisma.forumPost.count();
console.log('Forum posts:', count);
await prisma.\$disconnect();
"
```

**成功标准**:
- ✅ 5+ 发帖
- ⚠️ 2-5 发帖：使用率一般
- ❌ < 2 发帖：论坛不是主卖点，可接受

---

## 三、运维指标

### 3.1 错误日志
**目标**: 0 P0/P1  
**监控频率**: 每小时  
**数据来源**: PM2 logs

**监控命令**:
```bash
pm2 logs xixiong-saas --err --lines 100 --nostream | grep -E "(P1000|P2010|28P01|DatabaseNotReachable|Error|FATAL)" | tail -20
```

**成功标准**:
- ✅ 0 P0/P1 错误
- ⚠️ 1-2 P2 错误：可接受
- ❌ 任何 P0/P1 错误：需要立即修复

### 3.2 数据库错误
**目标**: 0  
**监控频率**: 每小时  
**数据来源**: PM2 logs

**监控命令**:
```bash
pm2 logs xixiong-saas --err --lines 100 --nostream | grep -E "(P1000|P2010|28P01)" | wc -l
```

**成功标准**:
- ✅ 0 数据库错误
- ⚠️ 1-2 临时错误：可接受
- ❌ 持续数据库错误：需要立即修复

### 3.3 PM2 重启次数
**目标**: 0  
**监控频率**: 每小时  
**数据来源**: PM2 status

**监控命令**:
```bash
pm2 status | grep xixiong-saas | awk '{print $10}'
```

**成功标准**:
- ✅ 0 重启
- ⚠️ 1-2 重启：需要调查原因
- ❌ > 2 重启：可能存在严重问题

### 3.4 Runtime Guard 通过率
**目标**: 100%  
**监控频率**: 每小时  
**数据来源**: `npm run verify:runtime-db`

**监控命令**:
```bash
cd /home/deploy/xixiong-saas
source .env.production
export DATABASE_URL
npm run verify:runtime-db 2>&1 | grep '"passed":' | tail -1
```

**成功标准**:
- ✅ 100% 通过
- ⚠️ 偶尔失败：需要调查原因
- ❌ 持续失败：需要立即修复

---

## 四、反馈指标

### 4.1 用户反馈数量
**目标**: 10+  
**监控频率**: 每日  
**数据来源**: 用户反馈渠道（邮件/论坛/微信）

**成功标准**:
- ✅ 10+ 反馈
- ⚠️ 5-10 反馈：反馈数量一般
- ❌ < 5 反馈：需要主动收集反馈

### 4.2 Bug 报告数量
**目标**: < 5  
**监控频率**: 每日  
**数据来源**: 用户反馈渠道

**成功标准**:
- ✅ < 5 Bug
- ⚠️ 5-10 Bug：需要优先修复
- ❌ > 10 Bug：可能存在严重质量问题

### 4.3 功能请求数量
**目标**: 记录即可  
**监控频率**: 每日  
**数据来源**: 用户反馈渠道

**处理方式**:
- 记录所有功能请求
- 按优先级分类
- Beta 后评估是否纳入路线图

---

## 五、监控仪表板

### 5.1 每日监控清单

**用户指标**:
- [ ] 注册数
- [ ] 登录成功率
- [ ] DAU

**功能指标**:
- [ ] Quote Sheet 保存数
- [ ] Commercial Invoice 保存数
- [ ] Workspace 访问数
- [ ] Forum 发帖数

**运维指标**:
- [ ] 错误日志检查
- [ ] 数据库错误检查
- [ ] PM2 重启次数
- [ ] Runtime Guard 通过率

**反馈指标**:
- [ ] 用户反馈数量
- [ ] Bug 报告数量
- [ ] 功能请求数量

### 5.2 监控频率

| 指标类别 | 监控频率 | 负责人 |
|---|---|---|
| 用户指标 | 每日 | 运营 |
| 功能指标 | 每日 | 运营 |
| 运维指标 | 每小时 | 开发 |
| 反馈指标 | 每日 | 运营 |

### 5.3 告警阈值

| 指标 | 告警阈值 | 告警方式 |
|---|---|---|
| P0 错误 | > 0 | 立即通知 |
| 数据库错误 | > 0 | 立即通知 |
| PM2 重启 | > 0 | 立即通知 |
| Runtime Guard 失败 | > 0 | 立即通知 |
| 登录成功率 | < 90% | 每日汇总 |
| DAU | < 5 | 每日汇总 |

---

## 六、Beta 成功标准

### 6.1 定量标准

| 指标 | 最低标准 | 理想标准 |
|---|---|---|
| 注册数 | 10 | 50 |
| 登录成功率 | 90% | 95%+ |
| DAU | 5 | 20 |
| Quote Sheet 保存数 | 10 | 20+ |
| Commercial Invoice 保存数 | 10 | 20+ |
| Workspace 访问数 | 20 | 50+ |
| Forum 发帖数 | 2 | 5+ |
| P0 错误 | 0 | 0 |
| Bug 报告 | < 10 | < 5 |
| 用户反馈 | 5 | 10+ |

### 6.2 定性标准

- ✅ 用户反馈积极
- ✅ 核心功能可用
- ✅ 数据库稳定
- ✅ 无安全漏洞
- ✅ 产品方向验证完成

### 6.3 决策矩阵

| 结果 | 定量标准 | 定性标准 | 决策 |
|---|---|---|---|
| 成功 | 全部达到理想标准 | 全部满足 | 正式开放 |
| 部分成功 | 达到最低标准 | 基本满足 | 继续 Beta |
| 失败 | 未达到最低标准 | 不满足 | 暂停 Beta |

---

## 七、Beta 后行动

### 7.1 如果 Beta 成功

**行动**:
1. 正式开放注册
2. 大规模推广
3. 实现会员/支付功能
4. 实现论坛增强功能
5. 大规模 SEO 内容计划

### 7.2 如果 Beta 部分成功

**行动**:
1. 继续 Beta 1-2 周
2. 修复发现的问题
3. 改进用户体验
4. 重新评估 Beta 标准

### 7.3 如果 Beta 失败

**行动**:
1. 暂停 Beta
2. 分析失败原因
3. 修复严重问题
4. 重新设计产品方向
5. 重新进行 Beta

---

## 八、监控工具

### 8.1 自动化监控脚本

**创建监控脚本**:
```bash
cat > /home/deploy/xixiong-saas/scripts/beta-monitor.sh << 'EOF'
#!/bin/bash
cd /home/deploy/xixiong-saas
source .env.production
export DATABASE_URL

echo "=== Beta Monitor Report ==="
echo "Date: $(date)"
echo ""

# User metrics
echo "=== User Metrics ==="
node -e "
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
(async () => {
  const totalUsers = await prisma.user.count();
  const recentUsers = await prisma.user.count({
    where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }
  });
  console.log('Total users:', totalUsers);
  console.log('Recent (7 days):', recentUsers);
  await prisma.\$disconnect();
})();
"

# Function metrics
echo ""
echo "=== Function Metrics ==="
node -e "
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
(async () => {
  const qsSaves = await prisma.eventLog.count({
    where: { eventType: 'Document_Save', toolName: 'quote_sheet' }
  });
  const ciSaves = await prisma.eventLog.count({
    where: { eventType: 'Document_Save', toolName: 'commercial_invoice' }
  });
  const forumPosts = await prisma.forumPost.count();
  console.log('Quote Sheet saves:', qsSaves);
  console.log('Commercial Invoice saves:', ciSaves);
  console.log('Forum posts:', forumPosts);
  await prisma.\$disconnect();
})();
"

# Operations metrics
echo ""
echo "=== Operations Metrics ==="
pm2 status | grep xixiong-saas | awk '{print "PM2 restart count:", $10}'
pm2 logs xixiong-saas --err --lines 100 --nostream | grep -E "(P1000|P2010|28P01)" | wc -l | awk '{print "Database errors:", $1}'

echo ""
echo "=== Report Complete ==="
EOF
chmod +x /home/deploy/xixiong-saas/scripts/beta-monitor.sh
```

### 8.2 定时任务

**添加 cron job**:
```bash
# 每小时执行一次监控
0 * * * * /home/deploy/xixiong-saas/scripts/beta-monitor.sh >> /home/deploy/logs/beta-monitor.log 2>&1
```

---

## 九、结论

### 9.1 Beta 观察指标总结

**用户指标**:
- 注册数: 目标 10-50
- 登录成功率: 目标 > 95%
- DAU: 目标 5-20

**功能指标**:
- Quote Sheet 保存数: 目标 20+
- Commercial Invoice 保存数: 目标 20+
- Workspace 访问数: 目标 50+
- Forum 发帖数: 目标 5+

**运维指标**:
- 错误日志: 目标 0 P0/P1
- 数据库错误: 目标 0
- PM2 重启次数: 目标 0
- Runtime Guard 通过率: 目标 100%

**反馈指标**:
- 用户反馈数量: 目标 10+
- Bug 报告数量: 目标 < 5
- 功能请求数量: 记录即可

### 9.2 Beta 成功标准

**定量标准**: 全部达到最低标准  
**定性标准**: 全部满足

### 9.3 Beta 后决策

**如果成功**: 正式开放  
**如果部分成功**: 继续 Beta  
**如果失败**: 暂停 Beta

---

**报告生成时间**: 2026-06-12T16:15:00Z  
**报告状态**: ✅ Beta 观察指标定义完成
