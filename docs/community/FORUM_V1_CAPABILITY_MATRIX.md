# Forum V1 能力清单 (Capability Matrix)

> 生成时间：P6 Final Closure
> 基线分支：feature/forum-v4-pro-p6 (基于 18d341d)
> 最后更新：2026-07-18

## 状态说明

| 标记 | 含义 |
|------|------|
| **IMPLEMENTED** | 已实现，代码完成，测试通过 |
| **STAGING_VERIFIED** | 已在 staging 环境验证 |
| **PROPOSED_REQUIRES_SCHEMA** | 已设计但需要数据库 Schema 变更 |
| **OUT_OF_SCOPE** | Forum V1 不在范围内 |

---

## 一、内容生命周期

| 功能 | 状态 | 说明 |
|------|------|------|
| 帖子创建 | ✅ IMPLEMENTED | 支持分类、标签、内容编辑 |
| 草稿保存 | ✅ IMPLEMENTED | 自动保存 + 手动保存，不进入审核 |
| 草稿编辑 | ✅ IMPLEMENTED | 可继续编辑草稿 |
| 草稿提交审核 | ✅ IMPLEMENTED | 提交后变为 pending |
| 草稿删除 | ✅ IMPLEMENTED | 作者可删除自己的草稿 |
| 草稿权限 | ✅ IMPLEMENTED | 只有作者和管理员可查看 |
| 审核通过 | ✅ IMPLEMENTED | approve → published，写 ModerationLog |
| 审核驳回 | ✅ IMPLEMENTED | reject → rejected，需原因，通知作者 |
| 帖子隐藏 | ✅ IMPLEMENTED | hide → hidden，公开返回 404 |
| 帖子恢复 | ✅ IMPLEMENTED | restore → published |
| 帖子锁定 | ✅ IMPLEMENTED | lock → 禁止新增评论 |
| 帖子解锁 | ✅ IMPLEMENTED | unlock → 恢复评论 |
| 置顶/取消置顶 | ✅ IMPLEMENTED | 列表置顶显示 |
| 精华/取消精华 | ✅ IMPLEMENTED | 标记精华帖 |
| 帖子编辑 | ✅ IMPLEMENTED | 作者和管理员可编辑 |
| 帖子删除 | ✅ IMPLEMENTED | 状态标记为 deleted |
| 评论创建 | ✅ IMPLEMENTED | 支持 @mention、楼层号 |
| 评论点赞 | ✅ IMPLEMENTED | 唯一约束，不可重复 |
| 评论采纳 | ✅ IMPLEMENTED | 帖子作者可采纳评论 |
| 帖子点赞 | ✅ IMPLEMENTED | 唯一约束 |
| 帖子收藏 | ✅ IMPLEMENTED | 私有收藏 |
| 完整版本历史 | ⬜ PROPOSED_REQUIRES_SCHEMA | 当前仅展示状态事件时间线，不存储正文版本 |

## 二、内容审核

| 功能 | 状态 | 说明 |
|------|------|------|
| 审核队列 | ✅ IMPLEMENTED | /bbs/admin，支持 pending/rejected/hidden/all |
| 批量审核 | ✅ IMPLEMENTED | 批量通过/驳回，返回每条结果 |
| 部分失败处理 | ✅ IMPLEMENTED | 失败项显示原因，支持只重试失败项 |
| 审核幂等性 | ✅ IMPLEMENTED | 重复操作返回 409 |
| 驳回原因 | ✅ IMPLEMENTED | 驳回必须填写原因 |
| 审核通知 | ✅ IMPLEMENTED | 作者收到审核结果通知 |
| ModerationLog | ✅ IMPLEMENTED | 所有管理操作都写日志 |
| 审核判断参考 | ✅ IMPLEMENTED | P6 内容治理帮助面板 |
| 举报处理建议 | ✅ IMPLEMENTED | P6 审核帮助面板 |
| 操作不可逆提醒 | ✅ IMPLEMENTED | P6 审核帮助面板 |
| 管理动作结果说明 | ✅ IMPLEMENTED | P6 审核帮助面板 |

## 三、举报系统

| 功能 | 状态 | 说明 |
|------|------|------|
| 举报帖子 | ✅ IMPLEMENTED | 5 种原因分类 |
| 举报评论 | ✅ IMPLEMENTED | 支持评论举报 |
| 不能举报自己 | ✅ IMPLEMENTED | 后端验证 |
| 举报频率限制 | ✅ IMPLEMENTED | 10次/天 + 3次/5分钟 |
| 重复举报检测 | ✅ IMPLEMENTED | 同一帖子只能举报一次 |
| 举报状态流 | ✅ IMPLEMENTED | pending → investigating → resolved/dismissed |
| 举报受理 | ✅ IMPLEMENTED | investigate → investigating |
| 举报处理 | ✅ IMPLEMENTED | resolve/dismiss，需填写处理结果 |
| 重复处理防护 | ✅ IMPLEMENTED | 已处理的举报返回 409 |
| 举报人通知 | ✅ IMPLEMENTED | 处理后通知举报人 |
| 帖子作者通知 | ✅ IMPLEMENTED | resolve 时通知帖子作者 |
| 我的举报 | ✅ IMPLEMENTED | /bbs/my-reports，只看自己的举报 |
| 举报隐私 | ✅ IMPLEMENTED | 不暴露管理员内部备注 |
| 内容失效友好显示 | ✅ IMPLEMENTED | 已删除内容显示提示 |

## 四、反垃圾与安全

| 功能 | 状态 | 说明 |
|------|------|------|
| 发帖频率限制 | ✅ IMPLEMENTED | 1次/分钟，5次/天 |
| 评论频率限制 | ✅ IMPLEMENTED | 3次/分钟，20次/天 |
| 发帖重复检测 | ✅ IMPLEMENTED | 相同内容检测 |
| 评论重复检测 | ✅ IMPLEMENTED | 相同评论检测 |
| 外链数量限制 | ✅ IMPLEMENTED | 帖子5个，评论3个 |
| 超长连续字符检测 | ✅ IMPLEMENTED | 超过20个相同字符 |
| 空白内容检测 | ✅ IMPLEMENTED | 空白比例过高检测 |
| 无意义内容检测 | ✅ IMPLEMENTED | 字符多样性检查 |
| XSS 防护 | ✅ IMPLEMENTED | HTML 清理和脚本检测 |
| 公式注入防护 | ✅ IMPLEMENTED | CSV 导出时 = + - @ 转义 |
| robots.txt 隔离 | ✅ IMPLEMENTED | 私有页面禁止索引 |
| 发帖质量助手 | ✅ IMPLEMENTED | P6 客户端实时提示 |

## 五、通知系统

| 功能 | 状态 | 说明 |
|------|------|------|
| 评论通知 | ✅ IMPLEMENTED | 帖子作者收到评论通知 |
| 点赞通知 | ✅ IMPLEMENTED | 帖子作者收到点赞通知 |
| 举报处理通知 | ✅ IMPLEMENTED | 举报人收到处理结果通知 |
| 审核结果通知 | ✅ IMPLEMENTED | 作者收到审核通过/驳回通知 |
| 自己不通知自己 | ✅ IMPLEMENTED | 自己评论/点赞自己的内容不通知 |
| 取消点赞不通知 | ✅ IMPLEMENTED | 不生成通知 |
| 通知去重 | ✅ IMPLEMENTED | 时间窗口内不重复通知 |
| 已读标记 | ✅ IMPLEMENTED | 支持单条和全部已读 |
| 通知失效降级 | ✅ IMPLEMENTED | 已删除内容友好显示 |
| 通知中心 | ✅ IMPLEMENTED | /bbs/notifications |

## 六、用户内容中心

| 功能 | 状态 | 说明 |
|------|------|------|
| 我的帖子 | ✅ IMPLEMENTED | /bbs/my-posts |
| 我的评论 | ✅ IMPLEMENTED | /bbs/my-comments |
| 我的收藏 | ✅ IMPLEMENTED | /bbs/my-bookmarks |
| 我的举报 | ✅ IMPLEMENTED | /bbs/my-reports (P5) |
| 内容状态时间线 | ✅ IMPLEMENTED | 从 ModerationLog 构建 (P5) |
| 新用户引导 | ✅ IMPLEMENTED | localStorage 存储，可关闭 (P6) |

## 七、管理员工作台

| 功能 | 状态 | 说明 |
|------|------|------|
| 运营面板 | ✅ IMPLEMENTED | /bbs/operations |
| 审核管理 | ✅ IMPLEMENTED | /bbs/admin |
| 管理工作台入口 | ✅ IMPLEMENTED | P6 统一入口 |
| 多条件筛选 | ✅ IMPLEMENTED | 分类/作者/状态/日期/关键词/举报数 (P5) |
| CSV 导出 | ✅ IMPLEMENTED | 安全导出，审计日志 (P5) |
| 用户风险概览 | ✅ IMPLEMENTED | 只读风险评分 (P5) |
| 运营待办 | ✅ IMPLEMENTED | 空分类检测、冷启动建议 (P5) |
| 社区健康度 | ✅ IMPLEMENTED | 8 项指标，标注统计口径 (P6) |
| 内容治理帮助 | ✅ IMPLEMENTED | 审核判断参考 (P6) |

## 八、SEO 与结构化数据

| 功能 | 状态 | 说明 |
|------|------|------|
| 帖子 JSON-LD | ✅ IMPLEMENTED | DiscussionForumPosting |
| 面包屑 JSON-LD | ✅ IMPLEMENTED | BreadcrumbList |
| 用户主页 JSON-LD | ✅ IMPLEMENTED | ProfilePage |
| 独立 canonical | ✅ IMPLEMENTED | 每个公开页面有独立 canonical |
| robots.txt | ✅ IMPLEMENTED | 私有页面禁止索引 |
| 社区规则页 SEO | ✅ IMPLEMENTED | /bbs/rules 可索引 (P5) |
| 非公开内容排除 | ✅ IMPLEMENTED | draft/pending/rejected/hidden 不输出结构化数据 |

## 九、社区规则与治理

| 功能 | 状态 | 说明 |
|------|------|------|
| 社区规则中心 | ✅ IMPLEMENTED | /bbs/rules (P5) |
| 9 个规则章节 | ✅ IMPLEMENTED | 发帖/评论/禁止内容/外链/举报/审核/驳回/隐私/处罚 |
| 处罚等级说明 | ✅ IMPLEMENTED | L1-L5 五级 |
| 规则入口点 | ✅ IMPLEMENTED | 从发帖页、首页、运营面板、举报页可访问 |
| 帖子编辑时间线 | ✅ IMPLEMENTED | 状态事件时间线 (P5) |
| 版本历史 | ⬜ PROPOSED_REQUIRES_SCHEMA | 需要新模型存储正文版本 |

## 十、用户状态约束

| 功能 | 状态 | 说明 |
|------|------|------|
| 禁言（mute） | ⬜ PROPOSED_REQUIRES_SCHEMA | User 表需要 banned/muted/status 字段 |
| 封禁（ban） | ⬜ PROPOSED_REQUIRES_SCHEMA | User 表需要 banned/muted/status 字段 |
| 风险评分 | ✅ IMPLEMENTED | 只读风险概览，不自动处罚 (P5) |
| 自动处罚 | ❌ OUT_OF_SCOPE | 风险评分不自动触发封禁 |
| 管理员不受限流误伤 | ✅ IMPLEMENTED | 管理员发帖直接发布 |

## 十一、评论系统

| 功能 | 状态 | 说明 |
|------|------|------|
| 扁平评论 | ✅ IMPLEMENTED | 楼层号显示 |
| 评论点赞 | ✅ IMPLEMENTED | |
| 评论采纳 | ✅ IMPLEMENTED | 帖子作者可采纳 |
| 楼中楼（嵌套回复） | ⬜ PROPOSED_REQUIRES_SCHEMA | parentId 需要迁移 |
| 评论审核 | ✅ IMPLEMENTED | 独立状态管理 |
| 评论删除 | ✅ IMPLEMENTED | 软删除 |

## 十二、移动端与无障碍

| 功能 | 状态 | 说明 |
|------|------|------|
| 390px 响应式 | ✅ IMPLEMENTED | 移动端适配 |
| 430px 响应式 | ✅ IMPLEMENTED | 大屏手机适配 |
| 768px 响应式 | ✅ IMPLEMENTED | 平板适配 |
| 1280px 响应式 | ✅ IMPLEMENTED | 桌面适配 |
| 1440px 响应式 | ✅ IMPLEMENTED | 大屏桌面适配 |
| 骨架屏 | ✅ IMPLEMENTED | loading.tsx |
| 错误状态 | ✅ IMPLEMENTED | error.tsx |
| 空状态 | ✅ IMPLEMENTED | ForumEmptyState |
| 404 处理 | ✅ IMPLEMENTED | not-found.tsx + 严格 404 |
| 数据库错误不伪装 404 | ✅ IMPLEMENTED | 区分数据库异常和真实 404 |

## 十三、运营能力

| 功能 | 状态 | 说明 |
|------|------|------|
| 审核通过率 | ✅ IMPLEMENTED | 近 30 天 (P6) |
| 驳回率 | ✅ IMPLEMENTED | 近 30 天 (P6) |
| 举报处理率 | ✅ IMPLEMENTED | 近 30 天 (P6) |
| 平均审核等待时间 | ✅ IMPLEMENTED | 近 7 天 (P6) |
| 今日活跃作者 | ✅ IMPLEMENTED | 24 小时内 (P6) |
| 无回复帖子 | ✅ IMPLEMENTED | 3 天以上无评论 (P6) |
| 长期未处理举报 | ✅ IMPLEMENTED | 7 天以上 (P6) |
| 草稿转提交比例 | ✅ IMPLEMENTED | 近 30 天 (P6) |
| 空分类检测 | ✅ IMPLEMENTED | 冷启动建议 (P5) |
| 管理员运营待办 | ✅ IMPLEMENTED | 优先级分级 (P5) |

---

## 需要 Schema 变更的功能清单

### 1. ban/mute 用户状态
- **需求**：User 表增加 banned、muted、status、bannedUntil、mutedUntil、banReason 字段
- **影响**：禁言用户不能发帖和评论；封禁用户不能互动
- **方案文档**：`docs/community/USER_BAN_MUTE_PROPOSAL.md`
- **状态**：PROPOSED_REQUIRES_SCHEMA

### 2. 楼中楼（嵌套回复）
- **需求**：ForumComment 表增加 parentId 字段（自引用关系）
- **影响**：评论可以回复评论，形成嵌套结构
- **限制**：当前扁平评论属于已知限制
- **状态**：PROPOSED_REQUIRES_SCHEMA

### 3. 完整版本历史
- **需求**：新增 ForumPostVersion 模型，存储帖子正文的每次修改
- **影响**：可以恢复历史版本，对比内容差异
- **当前替代**：状态事件时间线（ModerationLog）
- **状态**：PROPOSED_REQUIRES_SCHEMA

---

## 已知限制

1. **扁平评论**：当前评论不支持嵌套回复，parentId 需要 Schema migration
2. **风险评分不自动处罚**：风险评分仅供管理员参考，不触发自动封禁或禁言
3. **版本历史不完整**：当前只展示状态变更事件，不存储正文版本
4. **审核时间统计为近似值**：基于 ModerationLog 时间差计算，可能不精确
5. **草稿转提交比例不含历史数据**：仅统计近 30 天创建的帖子

---

## 测试覆盖

| 阶段 | 测试数 | 覆盖范围 |
|------|--------|----------|
| P0 | 63 | 基础功能 |
| P1 | 48 | 核心流程 |
| P2 | 80 | 草稿、批量审核、举报治理 |
| P3 | 81 | UX 优化 |
| P4 | 129 | 反垃圾、幂等性、SEO、错误状态 |
| P5 | 58 | 规则中心、风险概览、CSV 导出 |
| P6 | ~40 | 新手引导、质量助手、健康度 |
| Response | 11 | API 响应格式 |
| 404 | 21 | 404 处理 |
| **Total** | **~530** | |

---

## Forum V1 范围外

- 第三方审核服务集成
- AI 内容自动审核
- 用户信用积分系统
- 积分商城
- 社区活动管理
- 私信系统
- 帖子投票
- 多语言支持
