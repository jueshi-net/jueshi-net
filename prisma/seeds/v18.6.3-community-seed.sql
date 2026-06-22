-- v18.6.3 Seed content: System announcement posts by admin (chenran)
-- These are system/admin posts, NOT fake user reviews.
-- No honor/growth awarded for seed posts.
-- Uses ON CONFLICT (slug) DO NOTHING for idempotency.

-- Admin user: cmp746xp8000g315pkp6r1ktl (chenran / 9833416@qq.com)
-- Categories:
--   overseas-life: cmqab47ag0000g95p88sc6btb
--   tools:         cmqab47av0001g95prpdz5vym
--   logistics:     cmqab47b10002g95prvv6ee0r
--   feedback:      cmqab47b80003g95p619c12j8
--   general:       cmqab47bh0004g95pqge6zh6m

-- 1. Welcome announcement (general, pinned)
INSERT INTO forum_posts (id, slug, user_id, category_id, title, content, excerpt, status, is_pinned, is_locked, view_count, comment_count, created_at, updated_at)
VALUES (
  'seed_welcome_001',
  'welcome-to-jueshi-community',
  'cmp746xp8000g315pkp6r1ktl',
  'cmqab47bh0004g95pqge6zh6m',
  '欢迎来到绝世百宝箱社区',
  $content1$欢迎来到绝世百宝箱社区！

## 关于本社区

绝世百宝箱社区是一个专注于跨境发货、地址邮编、工具使用和海外生活经验交流的小范围测试社区。

当前处于 Beta 测试阶段，仅限受邀用户参与。

## 你可以在这里做什么

- 分享跨境发货经验（物流选择、时效、费用对比）
- 反馈工具使用中遇到的问题或建议
- 提问地址邮编、HS 编码、报关单据相关问题
- 分享海外生活经验

## 如何开始

1. 选择一个合适的分类发帖
2. 标题简明扼要描述你的问题或主题
3. 内容详细说明，方便他人理解和回复
4. 遇到错误请附上页面、操作步骤

## 反馈渠道

- Bug 和功能建议：发布到「建议反馈」分类
- 工具问题：发布到「工具使用」分类
- 也可以通过页面右下角联系我们

感谢你的参与！$content1$,
  '欢迎来到绝世百宝箱社区！当前处于 Beta 测试阶段，仅限受邀用户参与。',
  'published',
  true,
  false,
  0,
  0,
  NOW(),
  NOW()
) ON CONFLICT (slug) DO NOTHING;

-- 2. Beta feedback (feedback, pinned)
INSERT INTO forum_posts (id, slug, user_id, category_id, title, content, excerpt, status, is_pinned, is_locked, view_count, comment_count, created_at, updated_at)
VALUES (
  'seed_beta_002',
  'beta-feedback-collection',
  'cmp746xp8000g315pkp6r1ktl',
  'cmqab47b80003g95p619c12j8',
  'Beta 测试反馈收集帖',
  $content2$本帖用于收集 Beta 测试期间的反馈。

## 反馈范围

- 工具 Bug（HS 编码查询、CBM 计算、商业发票、装箱单、地址邮编助手等）
- 页面显示问题（错位、加载慢、移动端适配）
- 功能建议（希望增加什么功能）
- 任务链问题（跨境发货任务链流程）
- 账号和会员相关问题

## 反馈格式建议

为了方便我们定位问题，请尽量包含以下信息：

1. 问题描述（发生了什么）
2. 操作步骤（怎么触发的）
3. 预期行为（你认为应该怎样）
4. 实际行为（实际发生了什么）
5. 使用的设备（电脑/手机）和浏览器
6. 截图（如有）

## 注意事项

- 报关/税务/法律信息仅供参考，不构成专业建议
- 请勿在帖子中泄露个人隐私信息
- 遇到紧急问题也可联系客服

感谢你的反馈！$content2$,
  '本帖用于收集 Beta 测试期间的反馈。请尽量包含问题描述、操作步骤、预期行为和截图。',
  'published',
  true,
  false,
  0,
  0,
  NOW(),
  NOW()
) ON CONFLICT (slug) DO NOTHING;

-- 3. Shipping discussion (logistics)
INSERT INTO forum_posts (id, slug, user_id, category_id, title, content, excerpt, status, is_pinned, is_locked, view_count, comment_count, created_at, updated_at)
VALUES (
  'seed_shipping_003',
  'china-to-canada-shipping-discussion',
  'cmp746xp8000g315pkp6r1ktl',
  'cmqab47b10002g95prvv6ee0r',
  '中国寄加拿大流程讨论：欢迎补充你的经验',
  $content3$本帖用于讨论从中国寄物品到加拿大的流程和经验。

## 可讨论的话题

- 物流方式选择（海运、空运、快递）
- 货运代理推荐和体验
- 商业发票和装箱单制作
- CBM（体积立方）计算
- HS 编码查询和申报
- 关税和清关流程
- 时效和费用对比

## 绝世百宝箱相关工具

- 商业发票生成器：在线制作商业发票
- 装箱单生成器：在线制作装箱单
- CBM 计算器：计算体积和运费估算
- HS 编码查询：查找商品 HS 编码

欢迎分享你的经验和问题！$content3$,
  '讨论从中国寄物品到加拿大的流程：物流方式、货代、单据、HS编码、清关等。',
  'published',
  false,
  false,
  0,
  0,
  NOW(),
  NOW()
) ON CONFLICT (slug) DO NOTHING;

-- 4. Address/postal (overseas-life)
INSERT INTO forum_posts (id, slug, user_id, category_id, title, content, excerpt, status, is_pinned, is_locked, view_count, comment_count, created_at, updated_at)
VALUES (
  'seed_address_004',
  'address-postal-format-discussion',
  'cmp746xp8000g315pkp6r1ktl',
  'cmqab47ag0000g95p88sc6btb',
  '地址邮编格式问题集中讨论',
  $content4$本帖集中讨论地址和邮编格式相关问题。

## 常见问题

- 加拿大地址格式（Street, City, Province, Postal Code）
- 邮编格式（A1A 1A1）和查询
- 中国地址英文翻译
- 地址邮编助手工具使用问题
- 城市邮编范围

## 工具推荐

绝世百宝箱提供「地址邮编助手」工具，可以：
- 查询加拿大邮编
- 验证地址格式
- 生成标准地址

如果你在使用过程中遇到问题，请在此帖回复说明。$content4$,
  '集中讨论地址和邮编格式问题：加拿大地址格式、邮编查询、工具使用等。',
  'published',
  false,
  false,
  0,
  0,
  NOW(),
  NOW()
) ON CONFLICT (slug) DO NOTHING;

-- 5. Tools Q&A (tools)
INSERT INTO forum_posts (id, slug, user_id, category_id, title, content, excerpt, status, is_pinned, is_locked, view_count, comment_count, created_at, updated_at)
VALUES (
  'seed_tools_005',
  'tools-qa-and-suggestions',
  'cmp746xp8000g315pkp6r1ktl',
  'cmqab47av0001g95prpdz5vym',
  '工具使用问题和建议集中帖',
  $content5$本帖用于集中收集工具使用问题和建议。

## 绝世百宝箱工具列表

- HS 编码查询：查找商品 HS 编码
- CBM 计算器：计算体积立方和运费估算
- 商业发票生成器：在线制作商业发票
- 装箱单生成器：在线制作装箱单
- 地址邮编助手：查询邮编、验证地址格式
- 汇率换算：实时汇率查询和换算

## 反馈方式

如果你在使用任何工具时遇到问题：
1. 说明哪个工具
2. 描述操作步骤
3. 说明预期结果和实际结果
4. 附上截图（如有）

也欢迎提出功能建议！$content5$,
  '集中收集工具使用问题和建议：HS编码、CBM、发票、装箱单、邮编助手等。',
  'published',
  false,
  false,
  0,
  0,
  NOW(),
  NOW()
) ON CONFLICT (slug) DO NOTHING;

-- 6. Community rules (general, pinned, locked)
INSERT INTO forum_posts (id, slug, user_id, category_id, title, content, excerpt, status, is_pinned, is_locked, view_count, comment_count, created_at, updated_at)
VALUES (
  'seed_rules_006',
  'community-rules-and-reporting-guide',
  'cmp746xp8000g315pkp6r1ktl',
  'cmqab47bh0004g95pqge6zh6m',
  '社区发帖规则与举报说明',
  $content6$请所有用户在发帖前阅读本规则。

## 发帖规则

1. 不发广告垃圾：禁止发布与社区主题无关的广告、推广、垃圾信息
2. 不泄露个人隐私：不要在帖子中发布自己或他人的真实姓名、电话、地址、密码等
3. 报关/税务/法律信息仅供参考：社区讨论不构成专业建议，实际操作请咨询专业人士
4. 遇到错误请附页面、步骤、截图：方便定位问题
5. 尊重他人：禁止辱骂、骚扰、人身攻击

## 举报规则

- 发现违规内容可以点击「举报」按钮
- 举报时请选择原因（垃圾广告、辱骂攻击、骚扰、违法内容、其他）
- 举报提交后管理员会审核处理
- 举报不立即删除内容，管理员处理后才生效
- 同一内容不能重复举报

## 举报处理

- 举报成立：被举报人荣誉值 -10，举报人荣誉值 +5
- 驳回举报：无荣誉变动
- 恶意举报可能被限制举报权限

## 荣誉值和勋章说明

- 荣誉值是社区可信度背书，不代表官方认证
- 勋章是系统自动或管理员手动授予，不代表官方担保
- 荣誉值和勋章不可转让、不可交易

## 违规处理

- 轻微违规：帖子隐藏 + 荣誉值扣除
- 严重违规：账号限制
- 违法内容：删除内容 + 账号封禁

如有疑问，请通过页面底部联系方式联系我们。$content6$,
  '请所有用户在发帖前阅读本规则。包括发帖规则、举报规则、荣誉值说明和违规处理。',
  'published',
  true,
  true,
  0,
  0,
  NOW(),
  NOW()
) ON CONFLICT (slug) DO NOTHING;
