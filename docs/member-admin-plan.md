# 会员管理后台规划

> 版本: v1.0  
> 日期: 2026-05-16  
> 状态: 规划草案

---

## 目标

为管理员提供用户积分管理、签到统计、任务统计等后台功能。

---

## 功能清单

### 1. 用户列表
- 搜索（邮箱/用户名）
- 分页
- 显示：邮箱、角色、积分、连续签到、注册时间
- 点击进入详情

### 2. 用户详情
- 基本信息
- 积分余额
- 签到记录（日历视图）
- 任务完成统计
- 积分流水（全部）
- 导出记录

### 3. 手动加减积分
- 选择用户
- 输入积分数量（正数=加，负数=减）
- 备注说明
- 写入 PointLedger (type=admin_adjust)
- 实时更新 users.points

### 4. 签到统计
- 每日签到人数
- 连续签到分布
- 签到积分发放总量

### 5. 任务统计
- 任务创建量
- 任务完成率
- 任务积分发放量

### 6. 积分总览
- 全站积分发放量
- 全站积分消耗量
- 积分池余额
- 异常行为检测（单日积分过高）

### 7. 用户管理
- 角色变更（user ↔ member ↔ admin）
- 封禁/解封
- 重置密码

---

## API 设计

```
GET /api/admin/users?search=&role=&page=&limit=
GET /api/admin/users/[id]
GET /api/admin/users/[id]/points
GET /api/admin/users/[id]/checkins
GET /api/admin/users/[id]/tasks

POST /api/admin/users/[id]/points
{
  "points": 100,
  "reason": "奖励用户参与测试"
}

PATCH /api/admin/users/[id]
{
  "role": "member"
}

GET /api/admin/stats/checkins
GET /api/admin/stats/tasks
GET /api/admin/stats/points
```

---

## 权限要求

- 所有 admin API 需要 `requireAdmin()` 中间件
- 仅 admin 角色可访问

---

## 前端位置

- /admin/workspace
- /admin/users
- /admin/users/[id]
- /admin/stats

---

## 数据结构

当前已有：
- PointLedger ✅
- DailyCheckIn ✅
- UserTask ✅
- User.points ✅
- User.checkinStreak ✅
- User.lastCheckinDate ✅

所有后台功能均可基于现有数据实现。
