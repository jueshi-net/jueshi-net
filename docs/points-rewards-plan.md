# 积分兑换权益方案

> 版本: v1.0  
> 日期: 2026-05-16  
> 状态: 规划草案

---

## 核心原则

1. 积分不可提现、不可转让、不可炒作
2. 积分兑换消耗后不退还
3. 兑换记录写入 PointLedger (type=reward_redeem, points为负数)
4. 所有兑换必须校验用户积分余额

---

## 可兑换权益列表

### 1. Word 导出次数券
- **价格**: 50 积分
- **效果**: 额外 1 次 Word 导出（不计入每日 3 次限制）
- **实现**: 在 ExportLog 或新增 RedemptionLog 记录，导出 API 检查是否有券
- **状态**: 可实现

### 2. 去品牌导出体验券
- **价格**: 100 积分
- **效果**: 1 次去品牌导出（PNG/PDF/Word）
- **实现**: 生成临时 token，导出 API 验证 token 放行
- **状态**: 可实现

### 3. 会员模板体验券
- **价格**: 80 积分
- **效果**: 1 次使用会员模板风格
- **实现**: 类似去品牌券，生成临时 token
- **状态**: 可实现

### 4. 草稿容量扩展
- **价格**: 200 积分
- **效果**: +10 草稿容量，持续 30 天
- **实现**: 在 UserPreference 或单独表记录
- **状态**: 可实现

### 5. 会员天数
- **价格**: TBD（如 500 积分 = 1 天）
- **效果**: 获得正式会员身份
- **实现**: 需要支付系统配合
- **状态**: 后期做

---

## 展示策略

### Phase A（本轮）
- 在 dashboard 底部展示「积分商城」入口
- 标记为「即将开放」
- 不实现实际兑换功能

### Phase B
- 实现 Word 导出次数券兑换
- 最小兑换闭环

### Phase C
- 逐步开放其他权益

---

## 数据结构预留

```
POST /api/points/redeem
{
  "rewardType": "word_export_voucher" | "debrand_voucher" | "template_voucher" | "draft_capacity",
  "pointsCost": 50
}

Response:
{
  "success": true,
  "remaining": 450,
  "redeemedAt": "2026-05-16T..."
}
```

---

## PointLedger 记录示例

```
type: reward_redeem
points: -50
reason: "兑换 Word 导出次数券"
relatedId: <redemption_id>
metadata: { rewardType: "word_export_voucher" }
```
