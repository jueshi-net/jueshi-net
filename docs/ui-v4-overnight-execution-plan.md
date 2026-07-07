# V4 Public UI 过夜执行计划

**生成时间**: 2026-07-07 23:56  
**当前分支**: ui/overnight-polish-phase1  
**当前 HEAD**: 45861d5  
**审计报告**: docs/claude-code-full-audit-report.md

---

## 1. 真实页面优先级

### P0 - 已完成（3 个）
- ✅ `/` - 首页
- ✅ `/resources` - 资源列表
- ✅ `/resources/site/[id]` - 资源详情

### P1 - 高优先级（2 个）
- ⚠️ `/tools` - 工具中心
- ⚠️ `/destinations` - 目的地导航

### P2 - 中优先级（4 个）
- ⚠️ `/checklists` - 清单页面
- ⚠️ `/guides` - 指南页面
- ⚠️ `/topics` - 专题页面
- ⚠️ `/search` - 搜索页面

### P3 - 低优先级（14 个）
- `/community`, `/bbs`, `/blog`, `/help`, `/feedback`
- `/business`, `/shipping`, `/tracking`, `/logistics`
- `/starter`, `/rankings`, `/ai-tools`, `/ai-learning`

### P4 - 最低优先级（9 个）
- `/pricing`, `/privacy`, `/terms`, `/changelog`
- `/analytics`, `/api-docs`, `/design-system`, `/export`, `/nav`

---

## 2. 今晚可改页面

### 第一批（P1 - 高优先级）
1. `/tools` - 工具中心
   - 文件: `src/app/(public)/tools/page.tsx`
   - 任务: 更换为 `JueshiV4PublicShell`
   - 风险: 低
   - 预计耗时: 15 分钟

2. `/destinations` - 目的地导航
   - 文件: `src/app/(public)/destinations/page.tsx`
   - 任务: 更换为 `JueshiV4PublicShell`
   - 风险: 低
   - 预计耗时: 15 分钟

### 第二批（P2 - 中优先级）
3. `/checklists` - 清单页面
   - 文件: `src/app/(public)/checklists/page.tsx`
   - 任务: 更换为 `JueshiV4PublicShell`
   - 风险: 低
   - 预计耗时: 15 分钟

4. `/guides` - 指南页面
   - 文件: `src/app/(public)/guides/page.tsx`
   - 任务: 更换为 `JueshiV4PublicShell`
   - 风险: 低
   - 预计耗时: 15 分钟

---

## 3. 不能动的页面

### 高风险页面
- `/workspace/*` - 工作区有独立的 shell 机制
- `/profile` - 用户页面，涉及认证和权限
- `/api/*` - API 路由
- `/admin/*` - 管理后台

### 特殊页面
- `/countries` - 重定向页面，不需要改
- `/favorites` - 重定向页面，不需要改
- `/ui-lab/*` - 实验页面，不应在生产环境激活

---

## 4. 每阶段风险等级

### 第一阶段（P1）
- 风险等级: **低**
- 原因: 独立页面，无复杂依赖
- 回滚方案: 直接恢复原文件

### 第二阶段（P2）
- 风险等级: **低**
- 原因: 独立页面，无复杂依赖
- 回滚方案: 直接恢复原文件

### 第三阶段（P3）
- 风险等级: **中**
- 原因: 部分页面可能有复杂交互
- 回滚方案: 直接恢复原文件

### 第四阶段（P4）
- 风险等级: **低**
- 原因: 静态页面，无复杂逻辑
- 回滚方案: 直接恢复原文件

---

## 5. 每阶段验收方式

### 代码验收
1. `git diff` 检查修改内容
2. 确认只修改了 Shell 包装，未修改业务逻辑
3. 确认没有引入新的依赖

### 构建验收
1. `npm run build` 必须成功
2. 无 TypeScript 错误
3. 无 lint 错误

### 部署验收
1. `curl -I https://i.jueshi.net/<route>` 返回 200
2. 浏览器访问页面，确认 Header/Footer 正确
3. 确认没有双 Header/Footer

### 功能验收
1. 页面原有功能正常
2. 导航链接有效
3. 没有引入假链接

---

## 6. 每阶段预计耗时

### 第一阶段（P1 - 2 个页面）
- 代码修改: 30 分钟
- 构建验证: 5 分钟
- 部署验证: 10 分钟
- 总计: 45 分钟

### 第二阶段（P2 - 2 个页面）
- 代码修改: 30 分钟
- 构建验证: 5 分钟
- 部署验证: 10 分钟
- 总计: 45 分钟

### 第三阶段（P3 - 部分页面）
- 代码修改: 60 分钟
- 构建验证: 5 分钟
- 部署验证: 15 分钟
- 总计: 80 分钟

### 第四阶段（P4 - 部分页面）
- 代码修改: 45 分钟
- 构建验证: 5 分钟
- 部署验证: 10 分钟
- 总计: 60 分钟

**总计预计**: 230 分钟（约 4 小时）

---

## 7. 8 小时节奏安排

### 第 1 小时（23:56 - 00:56）
- [x] Phase 0: 备份与环境确认
- [x] Phase 1: 生成事实清单
- [x] Phase 2: Claude Code 审计
- [x] Phase 3: 生成整改路线

### 第 2 小时（00:56 - 01:56）
- [ ] Phase 4: 第一批低风险页面（P1）
  - [ ] `/tools` 页面迁移
  - [ ] `/destinations` 页面迁移
  - [ ] 更新 `public-layout-client.tsx`
- [ ] Phase 5: 构建与部署
- [ ] Phase 6: 页面验证

### 第 3 小时（01:56 - 02:56）
- [ ] Phase 4: 第二批低风险页面（P2）
  - [ ] `/checklists` 页面迁移
  - [ ] `/guides` 页面迁移
- [ ] Phase 5: 构建与部署
- [ ] Phase 6: 页面验证

### 第 4 小时（02:56 - 03:56）
- [ ] Phase 4: 第三批页面（P3 部分）
  - [ ] `/topics` 页面迁移
  - [ ] `/search` 页面迁移
- [ ] Phase 5: 构建与部署
- [ ] Phase 6: 页面验证

### 第 5-8 小时（03:56 - 07:56）
- [ ] 继续 P3 页面迁移
- [ ] 继续 P4 页面迁移
- [ ] 全面验证
- [ ] Phase 7: 生成过夜报告

---

## 8. 失败停止条件

### 代码层面
1. TypeScript 编译错误
2. ESLint 错误
3. 构建失败
4. 运行时错误

### 部署层面
1. `npm run build` 失败
2. `deploy-staging.sh` 失败
3. `pm2 restart` 失败
4. curl 验证失败（非 200）

### 功能层面
1. 页面原有功能失效
2. 导航链接失效
3. 出现双 Header/Footer
4. 引入假链接

### 限流层面
1. Claude Code 触发 429 / RateLimitError
2. exit 75（限流熔断）
3. exit 76（冷却/并发阻止）

---

## 9. 429 处理规则

### 首次限流
- 暂停 22 分钟
- 状态: `CLAUDE_CODE_RATE_LIMITED_PAUSED`
- 不允许继续执行

### 连续限流（1 小时内第二次）
- 暂停 30 分钟
- 状态: `CLAUDE_CODE_RATE_LIMITED_PAUSED`
- 不允许继续执行

### 冷却中
- 等待剩余冷却时间
- 状态: `CLAUDE_CODE_COOLDOWN_OR_CONCURRENT_BLOCKED`
- 不允许继续执行

---

## 10. 下一步行动

### 立即行动
1. 等待 22 分钟限流暂停结束
2. 开始 Phase 4: 第一批低风险页面迁移

### Phase 4 执行步骤
1. 调用 Claude Code 修改 `/tools` 页面
2. 验证修改内容
3. 调用 Claude Code 修改 `/destinations` 页面
4. 验证修改内容
5. 更新 `public-layout-client.tsx`
6. 提交代码
7. 构建验证
8. 部署到 staging
9. curl 验证
10. 浏览器验证

### 验收标准
- 所有修改页面返回 200
- Header/Footer 正确显示
- 没有双 Header/Footer
- 原有功能正常
- 导航链接有效

---

**计划生成时间**: 2026-07-07 23:56  
**计划生成者**: Hermes（基于 Claude Code 审计报告）
