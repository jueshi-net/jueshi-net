# 海外百宝箱 Roadmap

**最后更新：** 2026-06-09
**当前版本线：** v1.20.42.6.23

---

## 已完成里程碑

| 版本 | 标题 | 状态 |
|---|---|---|
| v1.20.42.6.16 | AdCreative & AdEvent Backend MVP | ✅ 完成 |
| v1.20.42.6.17 | Safe Ad Rendering Pilot Planning | ✅ 完成 |
| v1.20.42.6.18 | AdEvent API Hardening + Miner Audit | ✅ 完成 |
| v1.20.42.6.18.1 | Runtime Activation & Test Endpoint Lock | ✅ 完成 |
| v1.20.42.6.18.2 | Production Runtime Lock + Full AdEvent Verification | ✅ 完成 |
| v1.20.42.6.19 | Safe Ad Rendering Pilot Implementation | ✅ 完成 |
| v1.20.42.6.20 | Landing Page Public Template MVP | ✅ 完成 |
| v1.20.42.6.21 | Landing Page Related Content + Admin Preview + Content IA Notes | ✅ 完成 |
| v1.20.42.6.22 | SEO Content Pipeline Repair + Index Control MVP | ✅ 完成 |
| v1.20.42.6.22.1 | Admin Role Display & RBAC Consistency Fix | ✅ 完成 |
| v1.20.42.6.22.2 | Real Browser Admin Login Redirect Fix | ✅ 完成 |
| v1.20.42.6.23 | Checklist Content MVP Planning + Data Shape | ✅ 完成（仅规划） |

---

## 进行中

| 版本 | 标题 | 状态 |
|---|---|---|
| v1.20.42.6.19.1 | Content IA Long-term Planning Note | ✅ 文档已写入 |
| v1.20.42.6.19.2 | SEO & Internal Linking Long-term Planning Note | ✅ 文档已写入 |
| v1.20.42.6.21 | Landing Page Related Content + Admin Preview + Content IA Notes | ✅ 已完成 |
| v1.20.42.6.22 | SEO Content Pipeline Repair + Index Control MVP | ✅ 已完成 |

---

## 待规划方向

### 内容架构（详见 `docs/CONTENT_IA_LONG_TERM.md`、`docs/CHECKLIST_CONTENT_MVP_PLAN.md`）
- [x] 专题栏目：知识地图 / 资源集合 / 主题入口（规划已写入）
- [x] 清单栏目：行动步骤 / 避坑核对 / 场景任务单（MVP 规划已写入 `CHECKLIST_CONTENT_MVP_PLAN.md`）
- [ ] 清单 Admin 编辑视图（Phase 1）
- [ ] 清单前台页面 `/checklists/[slug]`（Phase 2）
- [ ] Hermes ContentOps 生成清单 draft（Phase 3）
- [ ] 从 LandingPage 拆分独立 Checklist 模型（Phase 4）
- [ ] 专题 → 清单 → 工具 → 用户资产 转化路径
- [ ] AI 内容发布规范（SEO 友好）

### 三期待办
- [ ] UX 精修：各页面 UI 统一与交互优化
- [ ] 板块联动：工具 ↔ 导航 ↔ 文章 ↔ 目的地的交叉引用
- [ ] 用户增长：注册转化漏斗优化、社交分享增强
- [ ] SEO 内容管线修复：恢复 seo-daemon 正常产出
- [ ] 工具库丰富：扩充 `/tools/*` 子功能
- [ ] 移动端适配：iPhone Safari 真机测试与优化

---

*本文档为项目方向参考，优先级以实际规划为准。*
