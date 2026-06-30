# Jueshi ContentOps Studio — 技术架构文档

**版本:** v1.0  
**日期:** 2026-06-30  
**状态:** 待审核

---

## 1. 系统架构概览

```
┌─────────────────────────────────────────────────────────────┐
│                    Desktop Client (Tauri)                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ Content  │ │  SEO/    │ │ Platform │ │ Publish  │       │
│  │ Editor   │ │  GEO     │ │ Preview  │ │ Calendar │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                         ↕ HTTPS                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      Server (Node.js)                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ Content  │ │ Schedule │ │ Publish  │ │Platform  │       │
│  │   API    │ │   API    │ │  Queue   │ │ Adapter  │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                    │
│  │Credential│ │ Audit    │ │  Retry   │                    │
│  │  Vault   │ │   Log    │ │   Job    │                    │
│  └──────────┘ └──────────┘ └──────────┘                    │
│                         ↕                                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Platform APIs                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │jueshi.net│ │  WeChat  │ │ YouTube  │ │  Zhihu   │       │
│  │  (API)   │ │   MP     │ │   API    │ │   API    │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Desktop Client 架构

### 2.1 技术栈选择

**推荐方案: Tauri + React**

| 组件 | 技术选择 | 理由 |
|------|---------|------|
| **框架** | Tauri 2.x | 轻量、安全、性能好 |
| **前端** | React 19 + TypeScript | 生态成熟，组件丰富 |
| **状态管理** | Zustand | 轻量、类型安全 |
| **UI 库** | shadcn/ui | 美观、可定制 |
| **编辑器** | TipTap | 富文本、扩展性强 |
| **HTTP** | Axios | 稳定、拦截器支持 |
| **本地存储** | SQLite (via Tauri) | 离线缓存草稿 |

**备选方案: Electron**

如果 Tauri 遇到兼容性问题，可切换到 Electron：
- 优点：跨平台兼容性好，生态成熟
- 缺点：包体积大，内存占用高

### 2.2 桌面端模块设计

#### 2.2.1 Dashboard 总览

**功能:**
- 内容统计（草稿数、待审核数、已发布数）
- 最近活动（最新编辑、最新发布）
- 待办事项（需要审核、需要刷新）
- 快速入口（新建内容、查看日历）

**数据源:**
```typescript
GET /api/dashboard/stats
GET /api/dashboard/recent-activity
GET /api/dashboard/todos
```

#### 2.2.2 Topic Pool 选题池

**功能:**
- 选题列表（支持筛选、排序）
- 新建选题（标题、描述、目标平台）
- 选题状态（idea / researching / approved / rejected）
- AI 辅助生成选题建议

**数据源:**
```typescript
GET /api/topics
POST /api/topics
PATCH /api/topics/:id
POST /api/topics/:id/ai-suggest
```

#### 2.2.3 Content Editor 内容编辑器

**功能:**
- 富文本编辑（TipTap）
- 模板选择（专题/指南/清单）
- 实时保存（自动保存草稿）
- 版本历史（查看历史版本）
- 协作编辑（V2 功能）

**数据源:**
```typescript
GET /api/drafts/:id
PUT /api/drafts/:id
POST /api/drafts/:id/versions
```

#### 2.2.4 SEO/GEO Score Panel

**功能:**
- 实时 SEO 评分（标题、描述、关键词密度）
- 实时 GEO 评分（直接回答、结构化数据）
- 优化建议（具体改进建议）
- 一键优化（AI 辅助优化）

**数据源:**
```typescript
POST /api/seo/analyze
POST /api/geo/analyze
POST /api/seo/optimize
```

#### 2.2.5 Template Selector

**功能:**
- 模板列表（专题/指南/清单）
- 模板预览（查看模板结构）
- 应用模板（一键应用模板）
- 自定义模板（V2 功能）

**数据源:**
```typescript
GET /api/templates
GET /api/templates/:id
```

#### 2.2.6 Platform Preview

**功能:**
- 多平台预览（jueshi.net、公众号、知乎等）
- 实时预览（编辑时实时更新）
- 平台适配（自动适配不同平台格式）
- 导出预览（导出为图片/PDF）

**数据源:**
```typescript
POST /api/preview/jueshi
POST /api/preview/wechat
POST /api/preview/zhihu
```

#### 2.2.7 Publish Calendar

**功能:**
- 日历视图（月/周/日视图）
- 排期管理（拖拽调整发布时间）
- 冲突检测（检测发布时间冲突）
- 批量排期（批量设置发布时间）

**数据源:**
```typescript
GET /api/schedules/calendar
POST /api/schedules
PATCH /api/schedules/:id
DELETE /api/schedules/:id
```

#### 2.2.8 Asset Library

**功能:**
- 图片管理（上传、分类、搜索）
- 视频管理（上传、预览、剪辑）
- 文件管理（文档、模板、配置）
- CDN 集成（自动上传到 CDN）

**数据源:**
```typescript
GET /api/assets
POST /api/assets/upload
DELETE /api/assets/:id
```

#### 2.2.9 Video Script Studio

**功能:**
- 脚本生成（AI 生成视频脚本）
- 脚本编辑（富文本编辑）
- 时长估算（根据字数估算时长）
- 封面提示词（生成封面图提示词）

**数据源:**
```typescript
POST /api/video-scripts/generate
PUT /api/video-scripts/:id
POST /api/video-scripts/:id/thumbnail-prompt
```

#### 2.2.10 Account Connections

**功能:**
- 平台账号列表（已连接的平台）
- 连接新平台（OAuth 授权流程）
- 账号状态（正常/过期/封禁）
- 权限管理（查看账号权限）

**数据源:**
```typescript
GET /api/accounts
POST /api/accounts/connect
DELETE /api/accounts/:id
GET /api/accounts/:id/status
```

#### 2.2.11 Publish Logs

**功能:**
- 发布历史（查看所有发布记录）
- 发布状态（成功/失败/进行中）
- 错误详情（查看失败原因）
- 重试操作（重新发布失败内容）

**数据源:**
```typescript
GET /api/publish-logs
GET /api/publish-logs/:id
POST /api/publish-logs/:id/retry
```

#### 2.2.12 Settings

**功能:**
- 用户设置（个人信息、密码修改）
- 应用设置（主题、语言、通知）
- API 设置（API 地址、超时配置）
- 缓存设置（清理缓存、离线数据）

**数据源:**
```typescript
GET /api/settings
PUT /api/settings
POST /api/settings/clear-cache
```

### 2.3 桌面端本地存储

**SQLite 数据库结构:**

```sql
-- 本地草稿缓存
CREATE TABLE local_drafts (
  id TEXT PRIMARY KEY,
  server_id TEXT,
  title TEXT,
  content TEXT,
  updated_at DATETIME,
  sync_status TEXT -- synced / pending / conflict
);

-- 本地资产配置
CREATE TABLE local_assets (
  id TEXT PRIMARY KEY,
  file_path TEXT,
  file_hash TEXT,
  uploaded BOOLEAN,
  cdn_url TEXT
);

-- 用户偏好
CREATE TABLE user_preferences (
  key TEXT PRIMARY KEY,
  value TEXT
);
```

**同步策略:**
- 自动保存：每 30 秒自动保存到本地
- 手动同步：点击"同步"按钮上传到服务器
- 冲突处理：服务器数据优先，本地数据备份

---

## 3. Server 架构

### 3.1 技术栈

| 组件 | 技术选择 | 理由 |
|------|---------|------|
| **运行时** | Node.js 22 | 与现有项目一致 |
| **框架** | Next.js 16 API Routes | 与主站共享基础设施 |
| **数据库** | PostgreSQL | 与主站共享数据库 |
| **ORM** | Prisma | 与主站共享 schema |
| **队列** | BullMQ + Redis | 可靠的发布队列 |
| **缓存** | Redis | 高性能缓存 |
| **密钥管理** | AWS KMS / HashiCorp Vault | 专业密钥管理 |

### 3.2 API 设计

#### 3.2.1 Content API

```typescript
// 内容 CRUD
GET    /api/content                    // 列表
POST   /api/content                    // 创建
GET    /api/content/:id                // 详情
PUT    /api/content/:id                // 更新
DELETE /api/content/:id                // 删除

// 内容状态
POST   /api/content/:id/submit-review  // 提交审核
POST   /api/content/:id/approve        // 审核通过
POST   /api/content/:id/reject         // 审核拒绝
POST   /api/content/:id/publish        // 立即发布
```

#### 3.2.2 Draft API

```typescript
// 草稿管理
GET    /api/drafts                     // 草稿列表
POST   /api/drafts                     // 创建草稿
GET    /api/drafts/:id                 // 草稿详情
PUT    /api/drafts/:id                 // 更新草稿
DELETE /api/drafts/:id                 // 删除草稿

// 草稿版本
GET    /api/drafts/:id/versions        // 版本列表
POST   /api/drafts/:id/versions        // 创建版本
GET    /api/drafts/:id/versions/:vid   // 版本详情
```

#### 3.2.3 Schedule API

```typescript
// 排期管理
GET    /api/schedules                  // 排期列表
POST   /api/schedules                  // 创建排期
GET    /api/schedules/:id              // 排期详情
PUT    /api/schedules/:id              // 更新排期
DELETE /api/schedules/:id              // 删除排期

// 日历视图
GET    /api/schedules/calendar         // 日历数据
```

#### 3.2.4 Publish Queue API

```typescript
// 发布队列
GET    /api/publish-queue              // 队列列表
POST   /api/publish-queue              // 加入队列
GET    /api/publish-queue/:id          // 任务详情
POST   /api/publish-queue/:id/retry    // 重试任务
DELETE /api/publish-queue/:id          // 取消任务

// 队列统计
GET    /api/publish-queue/stats        // 队列统计
```

#### 3.2.5 Platform Adapter API

```typescript
// 平台适配器
GET    /api/platforms                  // 平台列表
GET    /api/platforms/:id/capabilities // 平台能力

// 平台账号
GET    /api/accounts                   // 账号列表
POST   /api/accounts/connect           // 连接账号
DELETE /api/accounts/:id               // 断开账号
GET    /api/accounts/:id/status        // 账号状态

// 平台预览
POST   /api/platforms/:id/preview      // 预览内容
POST   /api/platforms/:id/publish      // 发布内容
```

#### 3.2.6 SEO/GEO API

```typescript
// SEO 分析
POST   /api/seo/analyze                // 分析 SEO
POST   /api/seo/optimize               // 优化 SEO

// GEO 分析
POST   /api/geo/analyze                // 分析 GEO
POST   /api/geo/optimize               // 优化 GEO

// 综合评分
POST   /api/quality/score              // 综合评分
```

#### 3.2.7 Video Script API

```typescript
// 视频脚本
POST   /api/video-scripts/generate     // 生成脚本
GET    /api/video-scripts/:id          // 脚本详情
PUT    /api/video-scripts/:id          // 更新脚本

// 封面提示词
POST   /api/video-scripts/:id/thumbnail-prompt  // 生成封面提示词
```

#### 3.2.8 Audit Log API

```typescript
// 操作日志
GET    /api/audit-logs                 // 日志列表
GET    /api/audit-logs/:id             // 日志详情

// 日志统计
GET    /api/audit-logs/stats           // 日志统计
```

### 3.3 Publish Queue 设计

**队列架构:**

```
[Desktop Client]
       ↓
[Publish Queue API]
       ↓
[BullMQ Queue]
       ↓
[Worker Process]
       ↓
[Platform Adapter]
       ↓
[Platform API]
```

**Worker 流程:**

```typescript
async function processPublishJob(job: PublishJob) {
  try {
    // 1. 更新状态为 processing
    await updateJobStatus(job.id, 'processing');
    
    // 2. 获取平台适配器
    const adapter = getPlatformAdapter(job.platform);
    
    // 3. 验证内容
    const validation = await adapter.validate(job.content);
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors}`);
    }
    
    // 4. 转换内容格式
    const platformDraft = await adapter.transform(job.content);
    
    // 5. 发布到平台
    const result = await adapter.publish(platformDraft);
    
    // 6. 更新状态为 completed
    await updateJobStatus(job.id, 'completed', result);
    
    // 7. 记录日志
    await logPublishSuccess(job, result);
    
  } catch (error) {
    // 8. 失败处理
    await updateJobStatus(job.id, 'failed', error);
    await logPublishFailure(job, error);
    
    // 9. 重试逻辑
    if (job.retryCount < MAX_RETRIES) {
      await scheduleRetry(job);
    }
  }
}
```

**重试策略:**

```typescript
const RETRY_CONFIG = {
  maxRetries: 3,
  backoff: {
    type: 'exponential',
    delay: 5000, // 5s, 10s, 20s
  },
  retryableErrors: [
    'NETWORK_ERROR',
    'TIMEOUT',
    'RATE_LIMIT',
    'TEMPORARY_FAILURE',
  ],
  nonRetryableErrors: [
    'AUTHENTICATION_FAILED',
    'PERMISSION_DENIED',
    'INVALID_CONTENT',
    'ACCOUNT_BANNED',
  ],
};
```

### 3.4 Platform Adapter 设计

#### 3.4.1 Adapter 接口

```typescript
interface PlatformAdapter {
  // 平台信息
  platform: string;
  capabilities: PlatformCapabilities;
  
  // 内容验证
  validate(content: ContentDraft): Promise<ValidationResult>;
  
  // 内容转换
  transform(content: ContentDraft): Promise<PlatformDraft>;
  
  // 创建草稿
  createDraft(content: PlatformDraft): Promise<CreateDraftResult>;
  
  // 定时发布
  schedule(content: PlatformDraft, scheduledAt: Date): Promise<ScheduleResult>;
  
  // 立即发布
  publish(content: PlatformDraft): Promise<PublishResult>;
  
  // 同步状态
  syncStatus(draftId: string): Promise<StatusResult>;
  
  // 获取分析数据
  getAnalytics(draftId: string): Promise<AnalyticsData>;
}

interface PlatformCapabilities {
  supportsDraft: boolean;        // 支持创建草稿
  supportsSchedule: boolean;     // 支持定时发布
  supportsDirectPublish: boolean; // 支持直接发布
  supportsMediaUpload: boolean;  // 支持上传媒体
  supportsAnalytics: boolean;    // 支持获取分析数据
  requiresManualReview: boolean; // 需要人工审核
  apiAvailable: boolean;         // 有官方 API
  riskLevel: 'low' | 'medium' | 'high'; // 账号风险等级
}
```

#### 3.4.2 Adapter 实现示例

**jueshi.net Adapter:**

```typescript
class JueshiNetAdapter implements PlatformAdapter {
  platform = 'jueshi.net';
  
  capabilities = {
    supportsDraft: true,
    supportsSchedule: true,
    supportsDirectPublish: true,
    supportsMediaUpload: true,
    supportsAnalytics: true,
    requiresManualReview: false,
    apiAvailable: true,
    riskLevel: 'low',
  };
  
  async validate(content: ContentDraft): Promise<ValidationResult> {
    // 验证内容格式
    const errors = [];
    
    if (!content.title) {
      errors.push('Title is required');
    }
    
    if (!content.slug) {
      errors.push('Slug is required');
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }
  
  async transform(content: ContentDraft): Promise<PlatformDraft> {
    // 转换为 jueshi.net 格式
    return {
      title: content.title,
      slug: content.slug,
      body: content.body,
      seoTitle: content.seoTitle,
      seoDescription: content.seoDescription,
      tags: content.tags,
      // ... 其他字段
    };
  }
  
  async publish(content: PlatformDraft): Promise<PublishResult> {
    // 调用 jueshi.net API 发布
    const response = await fetch('https://jueshi.net/api/content/publish', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${await getApiKey()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(content),
    });
    
    const data = await response.json();
    
    return {
      success: response.ok,
      draftId: data.id,
      url: data.url,
      publishedAt: data.publishedAt,
    };
  }
  
  // ... 其他方法实现
}
```

**微信公众号 Adapter:**

```typescript
class WeChatMPAdapter implements PlatformAdapter {
  platform = 'wechat-mp';
  
  capabilities = {
    supportsDraft: true,
    supportsSchedule: false, // 微信公众号不支持定时发布
    supportsDirectPublish: false, // 只能创建草稿，需要手动发布
    supportsMediaUpload: true,
    supportsAnalytics: true,
    requiresManualReview: true,
    apiAvailable: true,
    riskLevel: 'medium',
  };
  
  async publish(content: PlatformDraft): Promise<PublishResult> {
    // 微信公众号只能 create draft, not publish directly
    const draftResult = await this.createDraft(content);
    
    return {
      success: draftResult.success,
      draftId: draftResult.draftId,
      url: null, // 草稿没有 URL
      publishedAt: null, // 未发布
      message: 'Draft created. Please publish manually in WeChat MP dashboard.',
    };
  }
  
  // ... 其他方法实现
}
```

### 3.5 Credential Vault 设计

**密钥存储方案:**

```typescript
// 使用 AWS KMS 加密存储
class CredentialVault {
  private kmsClient: KMSClient;
  private db: PrismaClient;
  
  async storeCredential(platform: string, credential: Credential): Promise<void> {
    // 1. 加密密钥
    const encrypted = await this.kmsClient.encrypt({
      KeyId: process.env.KMS_KEY_ID,
      Plaintext: JSON.stringify(credential),
    });
    
    // 2. 存储到数据库
    await this.db.platformCredential.create({
      data: {
        platform,
        encryptedData: encrypted.CiphertextBlob,
        createdAt: new Date(),
      },
    });
  }
  
  async getCredential(platform: string): Promise<Credential> {
    // 1. 从数据库读取
    const record = await this.db.platformCredential.findFirst({
      where: { platform },
    });
    
    if (!record) {
      throw new Error(`Credential not found for platform: ${platform}`);
    }
    
    // 2. 解密密钥
    const decrypted = await this.kmsClient.decrypt({
      CiphertextBlob: record.encryptedData,
    });
    
    return JSON.parse(decrypted.Plaintext.toString());
  }
  
  async rotateCredential(platform: string): Promise<void> {
    // 密钥轮换逻辑
    // ...
  }
}
```

**安全策略:**

```typescript
const SECURITY_POLICY = {
  // 加密算法
  encryption: {
    algorithm: 'AES-256-GCM',
    keyRotation: '90 days',
  },
  
  // 访问控制
  accessControl: {
    requireMFA: true,
    ipWhitelist: [],
    maxSessions: 3,
  },
  
  // 审计日志
  auditLog: {
    enabled: true,
    retention: '1 year',
  },
  
  // 密钥管理
  keyManagement: {
    backup: 'daily',
    disasterRecovery: 'enabled',
  },
};
```

---

## 4. Main Site 集成

### 4.1 内容发布状态

**jueshi.net 需要支持:**

```typescript
// 内容模型扩展
model Topic {
  // ... 现有字段
  
  // ContentOps 集成
  contentOpsId     String?  @map("content_ops_id") // ContentOps 系统中的 ID
  publishStatus    String   @default("draft") // draft / published / scheduled
  scheduledAt      DateTime? @map("scheduled_at")
  publishedAt      DateTime? @map("published_at")
  publishedBy      String?  @map("published_by") // user ID
  
  @@index([contentOpsId])
  @@index([publishStatus])
}

// 类似地扩展 Guide 和 Checklist 模型
```

### 4.2 Sitemap 更新

**自动更新逻辑:**

```typescript
// 内容发布后自动更新 sitemap
async function onContentPublished(contentId: string) {
  // 1. 更新 sitemap.xml
  await regenerateSitemap();
  
  // 2. 提交到 Search Console
  await submitToSearchConsole(contentId);
  
  // 3. 更新内容状态
  await updateContentStatus(contentId, 'published');
}
```

### 4.3 Search Console 集成

**自动提交 URL:**

```typescript
async function submitToSearchConsole(contentId: string) {
  const content = await getContent(contentId);
  const url = `https://jueshi.net/${content.type}/${content.slug}`;
  
  // 调用 Google Search Console API
  await searchConsole.indexing.publish({
    url,
  });
}
```

---

## 5. 内容流转状态机

### 5.1 状态定义

```typescript
enum ContentStatus {
  IDEA = 'idea',                          // 创意阶段
  OUTLINE = 'outline',                    // 大纲阶段
  DRAFT = 'draft',                        // 草稿阶段
  SEO_CHECKED = 'seo_checked',            // SEO 已检查
  GEO_CHECKED = 'geo_checked',            // GEO 已检查
  HUMAN_REVIEW = 'human_review',          // 人工审核中
  APPROVED = 'approved',                  // 审核通过
  SCHEDULED = 'scheduled',                // 已排期
  PUBLISHED_TO_SITE = 'published_to_site', // 已发布到主站
  DISTRIBUTED_TO_PLATFORMS = 'distributed_to_platforms', // 已分发到平台
  MONITORED = 'monitored',                // 已监控
  REFRESH_NEEDED = 'refresh_needed',      // 需要刷新
}
```

### 5.2 状态转换规则

```typescript
const STATUS_TRANSITIONS = {
  [ContentStatus.IDEA]: {
    next: [ContentStatus.OUTLINE, ContentStatus.DRAFT],
    allowedRoles: ['admin', 'editor', 'content_ops'],
    autoTransition: false,
  },
  
  [ContentStatus.OUTLINE]: {
    next: [ContentStatus.DRAFT],
    allowedRoles: ['admin', 'editor', 'content_ops'],
    autoTransition: false,
  },
  
  [ContentStatus.DRAFT]: {
    next: [ContentStatus.SEO_CHECKED],
    allowedRoles: ['admin', 'editor', 'content_ops'],
    autoTransition: true, // SEO 检查后自动转换
    autoTransitionCondition: async (content) => {
      const seoScore = await calculateSEOScore(content);
      return seoScore >= 60;
    },
  },
  
  [ContentStatus.SEO_CHECKED]: {
    next: [ContentStatus.GEO_CHECKED],
    allowedRoles: ['admin', 'seo_specialist'],
    autoTransition: true,
    autoTransitionCondition: async (content) => {
      const geoScore = await calculateGEOScore(content);
      return geoScore >= 60;
    },
  },
  
  [ContentStatus.GEO_CHECKED]: {
    next: [ContentStatus.HUMAN_REVIEW],
    allowedRoles: ['admin', 'editor'],
    autoTransition: false,
  },
  
  [ContentStatus.HUMAN_REVIEW]: {
    next: [ContentStatus.APPROVED, ContentStatus.DRAFT], // 可以打回草稿
    allowedRoles: ['admin', 'editor'],
    autoTransition: false,
  },
  
  [ContentStatus.APPROVED]: {
    next: [ContentStatus.SCHEDULED, ContentStatus.PUBLISHED_TO_SITE],
    allowedRoles: ['admin'],
    autoTransition: false,
  },
  
  [ContentStatus.SCHEDULED]: {
    next: [ContentStatus.PUBLISHED_TO_SITE],
    allowedRoles: ['system'],
    autoTransition: true,
    autoTransitionCondition: async (content) => {
      return content.scheduledAt <= new Date();
    },
  },
  
  [ContentStatus.PUBLISHED_TO_SITE]: {
    next: [ContentStatus.DISTRIBUTED_TO_PLATFORMS],
    allowedRoles: ['system'],
    autoTransition: true,
    autoTransitionCondition: async (content) => {
      // 所有平台分发完成
      const platforms = await getPlatformDistribution(content.id);
      return platforms.every(p => p.status === 'published');
    },
  },
  
  [ContentStatus.DISTRIBUTED_TO_PLATFORMS]: {
    next: [ContentStatus.MONITORED],
    allowedRoles: ['system'],
    autoTransition: true,
    autoTransitionCondition: async (content) => {
      // 发布后 24 小时进入监控状态
      return content.publishedAt <= new Date(Date.now() - 24 * 60 * 60 * 1000);
    },
  },
  
  [ContentStatus.MONITORED]: {
    next: [ContentStatus.REFRESH_NEEDED],
    allowedRoles: ['system', 'seo_specialist'],
    autoTransition: true,
    autoTransitionCondition: async (content) => {
      // 流量下降 30% 或排名下降 5 位
      const metrics = await getContentMetrics(content.id);
      return metrics.trafficDrop > 0.3 || metrics.rankDrop > 5;
    },
  },
  
  [ContentStatus.REFRESH_NEEDED]: {
    next: [ContentStatus.DRAFT], // 打回草稿重新优化
    allowedRoles: ['admin', 'seo_specialist'],
    autoTransition: false,
  },
};
```

### 5.3 状态转换示例

```typescript
async function transitionStatus(contentId: string, newStatus: ContentStatus, userId: string) {
  const content = await getContent(contentId);
  const currentStatus = content.status as ContentStatus;
  
  // 1. 检查转换是否允许
  const transition = STATUS_TRANSITIONS[currentStatus];
  if (!transition.next.includes(newStatus)) {
    throw new Error(`Cannot transition from ${currentStatus} to ${newStatus}`);
  }
  
  // 2. 检查用户权限
  const user = await getUser(userId);
  if (!transition.allowedRoles.includes(user.role)) {
    throw new Error(`User ${userId} not allowed to perform this transition`);
  }
  
  // 3. 检查自动转换条件
  if (transition.autoTransition && transition.autoTransitionCondition) {
    const conditionMet = await transition.autoTransitionCondition(content);
    if (!conditionMet) {
      throw new Error(`Auto transition condition not met`);
    }
  }
  
  // 4. 执行转换
  await updateContentStatus(contentId, newStatus);
  
  // 5. 记录日志
  await logStatusTransition(contentId, currentStatus, newStatus, userId);
  
  // 6. 触发副作用
  await triggerStatusTransitionSideEffects(contentId, currentStatus, newStatus);
}
```

---

## 6. 平台适配器分级

### 6.1 平台分级标准

| 级别 | 定义 | 平台示例 | 能力 |
|------|------|---------|------|
| **Level 1** | 完整 API 支持 | jueshi.net | 草稿、发布、定时、分析 |
| **Level 2** | 官方 API 部分支持 | 微信公众号、YouTube | 草稿、上传、分析（发布需手动） |
| **Level 3** | 无官方 API | 知乎、百家号、小红书 | 仅生成发布包，人工发布 |
| **Level 4** | API 申请复杂 | 抖音、TikTok | 暂不支持，待评估 |

### 6.2 平台详细分析

#### 6.2.1 jueshi.net (Level 1)

**官方 API:** ✅ 完整支持  
**自动发布:** ✅ 支持  
**草稿发布:** ✅ 支持  
**定时发布:** ✅ 支持  
**账号风险:** 🟢 低  
**格式限制:** 无特殊限制  
**素材要求:** 标准图片和视频  
**第一版能力:** 完整集成

#### 6.2.2 微信公众号 (Level 2)

**官方 API:** ✅ 有（需认证服务号）  
**自动发布:** ❌ 不支持（只能创建草稿）  
**草稿发布:** ✅ 支持  
**定时发布:** ❌ 不支持  
**账号风险:** 🟡 中（需注意发布频率）  
**格式限制:** 
- 图片必须上传到微信素材库
- 文章格式有特定要求
- 不支持外部链接（需转换）

**素材要求:**
- 封面图：900x383 px (2.35:1)
- 内容图片：宽度 ≤ 1080px
- 视频：≤ 20MB，≤ 15 分钟

**第一版能力:** 草稿创建 + 人工发布

#### 6.2.3 YouTube (Level 2)

**官方 API:** ✅ 有（Data API v3）  
**自动发布:** ✅ 支持（需 OAuth 2.0）  
**草稿发布:** ✅ 支持  
**定时发布:** ✅ 支持  
**账号风险:** 🟡 中（需注意配额限制）  
**格式限制:**
- 视频：≤ 256GB，≤ 12 小时
- 封面：1280x720 px (16:9)
- 描述：≤ 5000 字符

**素材要求:**
- 视频格式：MP4, MOV, AVI
- 封面格式：JPG, PNG
- 字幕：SRT, VTT

**第一版能力:** 视频上传 + metadata 设置 + 定时发布

#### 6.2.4 知乎 (Level 3)

**官方 API:** ❌ 无公开 API  
**自动发布:** ❌ 不支持  
**草稿发布:** ❌ 不支持  
**定时发布:** ❌ 不支持  
**账号风险:** 🔴 高（模拟登录易被封）  
**格式限制:** Markdown 格式  
**素材要求:** 标准图片和视频  
**第一版能力:** 仅生成发布包（Markdown + 图片），人工发布

#### 6.2.5 百家号 (Level 3)

**官方 API:** ❌ 无公开 API  
**自动发布:** ❌ 不支持  
**草稿发布:** ❌ 不支持  
**定时发布:** ❌ 不支持  
**账号风险:** 🔴 高（模拟登录易被封）  
**格式限制:** 富文本格式  
**素材要求:** 标准图片和视频  
**第一版能力:** 仅生成发布包，人工发布

#### 6.2.6 Bilibili (Level 3)

**官方 API:** ⚠️ 有限（需申请）  
**自动发布:** ❌ 不支持  
**草稿发布:** ❌ 不支持  
**定时发布:** ❌ 不支持  
**账号风险:** 🔴 高（模拟登录易被封）  
**格式限制:** 视频 + 简介  
**素材要求:** 
- 视频：≤ 8GB，≤ 60 分钟
- 封面：1600x900 px (16:9)

**第一版能力:** 仅生成发布包，人工发布

#### 6.2.7 小红书 (Level 3)

**官方 API:** ❌ 无公开 API  
**自动发布:** ❌ 不支持  
**草稿发布:** ❌ 不支持  
**定时发布:** ❌ 不支持  
**账号风险:** 🔴 高（模拟登录易被封）  
**格式限制:** 图文笔记 / 视频笔记  
**素材要求:**
- 图片：≤ 20 张，≤ 10MB/张
- 视频：≤ 60 秒，≤ 100MB

**第一版能力:** 仅生成发布包，人工发布

#### 6.2.8 抖音 (Level 4)

**官方 API:** ⚠️ 需申请（开放平台）  
**自动发布:** ❌ 不支持  
**草稿发布:** ❌ 不支持  
**定时发布:** ❌ 不支持  
**账号风险:** 🔴 高  
**格式限制:** 短视频  
**素材要求:**
- 视频：≤ 4GB，≤ 15 分钟
- 封面：1080x1920 px (9:16)

**第一版能力:** 暂不支持，待评估 API 可用性

#### 6.2.9 TikTok (Level 4)

**官方 API:** ⚠️ 需申请（Content Posting API）  
**自动发布:** ⚠️ 有限支持  
**草稿发布:** ❌ 不支持  
**定时发布:** ❌ 不支持  
**账号风险:** 🔴 高  
**格式限制:** 短视频  
**素材要求:**
- 视频：≤ 4GB，≤ 10 分钟
- 封面：自动截取

**第一版能力:** 暂不支持，待评估 API 可用性

### 6.3 平台接入优先级

**第一版 (MVP 1):**
1. ✅ jueshi.net（完整集成）
2. ⚠️ 微信公众号（草稿创建）
3. ⚠️ YouTube（视频上传）

**第二版 (MVP 2):**
4. ⚠️ 知乎（发布包）
5. ⚠️ 百家号（发布包）
6. ⚠️ Bilibili（发布包）

**第三版 (MVP 3):**
7. ⚠️ 小红书（发布包）
8. ⚠️ 抖音（待评估）
9. ⚠️ TikTok（待评估）

---

## 7. 数据模型设计

### 7.1 核心模型

#### 7.1.1 ContentProject (内容项目)

```prisma
model ContentProject {
  id          String   @id @default(cuid())
  name        String
  description String?
  type        String   // topic / guide / checklist
  status      String   @default("active") // active / archived
  createdBy   String   @map("created_by")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  
  drafts      ContentDraft[]
  
  @@map("content_projects")
}
```

#### 7.1.2 ContentDraft (内容草稿)

```prisma
model ContentDraft {
  id                 String   @id @default(cuid())
  projectId          String   @map("project_id")
  project            ContentProject @relation(fields: [projectId], references: [id])
  
  // 基础信息
  title              String
  slug               String   @unique
  contentType        String   @map("content_type") // topic / guide / checklist
  roughContent       String?  @map("rough_content") @db.Text
  structuredContent  Json     @map("structured_content")
  
  // SEO 元数据
  seoTitle           String?  @map("seo_title")
  seoDescription     String?  @map("seo_description")
  keywords           String[] @default([])
  
  // 状态管理
  status             String   @default("idea") // idea / outline / draft / seo_checked / geo_checked / human_review / approved / scheduled / published / monitored / refresh_needed
  qualityScore       Int?     @map("quality_score")
  seoScore           Int?     @map("seo_score")
  geoScore           Int?     @map("geo_score")
  
  // 时间管理
  scheduledAt        DateTime? @map("scheduled_at")
  publishedAt        DateTime? @map("published_at")
  
  // 用户管理
  createdBy          String   @map("created_by")
  reviewedBy         String?  @map("reviewed_by")
  reviewedAt         DateTime? @map("reviewed_at")
  reviewComments     String?  @map("review_comments") @db.Text
  
  createdAt          DateTime @default(now()) @map("created_at")
  updatedAt          DateTime @updatedAt @map("updated_at")
  
  // 关联
  versions           ContentVersion[]
  seoMeta            ContentSeoMeta?
  geoMeta            ContentGeoMeta?
  schedules          ContentSchedule[]
  platformDrafts     PlatformDraft[]
  publishJobs        PublishJob[]
  assets             ContentAsset[]
  videoScripts       VideoScriptPack[]
  performanceSnapshots ContentPerformanceSnapshot[]
  
  @@index([projectId])
  @@index([status])
  @@index([scheduledAt])
  @@map("content_drafts")
}
```

#### 7.1.3 ContentVersion (内容版本)

```prisma
model ContentVersion {
  id          String   @id @default(cuid())
  draftId     String   @map("draft_id")
  draft       ContentDraft @relation(fields: [draftId], references: [id])
  
  version     Int
  content     Json     // 完整内容快照
  changeLog   String?  @map("change_log") @db.Text
  createdBy   String   @map("created_by")
  createdAt   DateTime @default(now()) @map("created_at")
  
  @@index([draftId])
  @@index([version])
  @@map("content_versions")
}
```

#### 7.1.4 ContentSeoMeta (SEO 元数据)

```prisma
model ContentSeoMeta {
  id              String   @id @default(cuid())
  draftId         String   @unique @map("draft_id")
  draft           ContentDraft @relation(fields: [draftId], references: [id])
  
  // SEO 分析结果
  titleScore      Int      @map("title_score")
  descriptionScore Int     @map("description_score")
  keywordDensity  Float    @map("keyword_density")
  internalLinks   Int      @map("internal_links")
  structuredData  Boolean  @default(false) @map("structured_data")
  
  // SEO 建议
  recommendations Json     @default([])
  
  // 最后分析时间
  analyzedAt      DateTime @map("analyzed_at")
  
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")
  
  @@map("content_seo_meta")
}
```

#### 7.1.5 ContentGeoMeta (GEO 元数据)

```prisma
model ContentGeoMeta {
  id              String   @id @default(cuid())
  draftId         String   @unique @map("draft_id")
  draft           ContentDraft @relation(fields: [draftId], references: [id])
  
  // GEO 分析结果
  directAnswerScore Int    @map("direct_answer_score")
  structureScore    Int    @map("structure_score")
  authorityScore    Int    @map("authority_score")
  faqCoverageScore  Int    @map("faq_coverage_score")
  geoTargetingScore Int    @map("geo_targeting_score")
  
  // GEO 建议
  recommendations Json     @default([])
  
  // 最后分析时间
  analyzedAt      DateTime @map("analyzed_at")
  
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")
  
  @@map("content_geo_meta")
}
```

#### 7.1.6 ContentSchedule (发布排期)

```prisma
model ContentSchedule {
  id          String   @id @default(cuid())
  draftId     String   @map("draft_id")
  draft       ContentDraft @relation(fields: [draftId], references: [id])
  
  platform    String   // jueshi.net / wechat-mp / youtube / ...
  scheduledAt DateTime @map("scheduled_at")
  timezone    String   @default("UTC")
  status      String   @default("scheduled") // scheduled / published / failed / cancelled
  
  publishedAt DateTime? @map("published_at")
  publishedUrl String?  @map("published_url")
  
  createdBy   String   @map("created_by")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  
  @@index([draftId])
  @@index([scheduledAt])
  @@index([status])
  @@map("content_schedules")
}
```

#### 7.1.7 PlatformAccount (平台账号)

```prisma
model PlatformAccount {
  id          String   @id @default(cuid())
  platform    String   // jueshi.net / wechat-mp / youtube / ...
  
  accountId   String   @map("account_id") // 平台账号 ID
  accountName String   @map("account_name") // 账号名称
  accountType String?  @map("account_type") // personal / business
  
  status      String   @default("active") // active / expired / banned
  
  // OAuth Token (加密存储)
  accessToken String?  @map("access_token") @db.Text
  refreshToken String? @map("refresh_token") @db.Text
  tokenExpiresAt DateTime? @map("token_expires_at")
  
  // 账号信息
  metadata    Json     @default({}) // 平台特定的账号信息
  
  createdBy   String   @map("created_by")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  
  credentials PlatformCredential[]
  drafts      PlatformDraft[]
  
  @@unique([platform, accountId])
  @@index([platform])
  @@index([status])
  @@map("platform_accounts")
}
```

#### 7.1.8 PlatformCredential (平台凭证)

```prisma
model PlatformCredential {
  id              String   @id @default(cuid())
  accountId       String   @map("account_id")
  account         PlatformAccount @relation(fields: [accountId], references: [id])
  
  credentialType  String   @map("credential_type") // api_key / oauth_token / cookie
  
  // 加密存储的凭证数据
  encryptedData   String   @map("encrypted_data") @db.Text
  
  // 凭证元数据
  metadata        Json     @default({})
  
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")
  
  @@index([accountId])
  @@map("platform_credentials")
}
```

#### 7.1.9 PlatformDraft (平台草稿)

```prisma
model PlatformDraft {
  id          String   @id @default(cuid())
  draftId     String   @map("draft_id")
  draft       ContentDraft @relation(fields: [draftId], references: [id])
  
  accountId   String   @map("account_id")
  account     PlatformAccount @relation(fields: [accountId], references: [id])
  
  platform    String   // jueshi.net / wechat-mp / youtube / ...
  
  // 平台特定的内容格式
  platformContent Json @map("platform_content")
  
  // 平台草稿 ID
  platformDraftId String? @map("platform_draft_id")
  platformUrl     String? @map("platform_url")
  
  status      String   @default("draft") // draft / published / failed
  
  publishedAt DateTime? @map("published_at")
  
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  
  @@index([draftId])
  @@index([accountId])
  @@index([platform])
  @@map("platform_drafts")
}
```

#### 7.1.10 PublishJob (发布任务)

```prisma
model PublishJob {
  id          String   @id @default(cuid())
  draftId     String   @map("draft_id")
  draft       ContentDraft @relation(fields: [draftId], references: [id])
  
  platform    String
  accountId   String   @map("account_id")
  
  jobType     String   @map("job_type") // publish / schedule / retry
  
  status      String   @default("pending") // pending / processing / completed / failed
  priority    Int      @default(0)
  
  // 重试信息
  retryCount  Int      @default(0) @map("retry_count")
  maxRetries  Int      @default(3) @map("max_retries")
  lastError   String?  @map("last_error") @db.Text
  
  scheduledAt DateTime? @map("scheduled_at")
  startedAt   DateTime? @map("started_at")
  completedAt DateTime? @map("completed_at")
  
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  
  logs        PublishLog[]
  
  @@index([draftId])
  @@index([status])
  @@index([scheduledAt])
  @@map("publish_jobs")
}
```

#### 7.1.11 PublishLog (发布日志)

```prisma
model PublishLog {
  id          String   @id @default(cuid())
  jobId       String   @map("job_id")
  job         PublishJob @relation(fields: [jobId], references: [id])
  
  action      String   // started / completed / failed / retry
  
  message     String?  @db.Text
  metadata    Json     @default({})
  
  executedAt  DateTime @default(now()) @map("executed_at")
  
  @@index([jobId])
  @@index([executedAt])
  @@map("publish_logs")
}
```

#### 7.1.12 ContentAsset (内容资产)

```prisma
model ContentAsset {
  id          String   @id @default(cuid())
  draftId     String   @map("draft_id")
  draft       ContentDraft @relation(fields: [draftId], references: [id])
  
  assetType   String   @map("asset_type") // image / video / document
  
  fileName    String   @map("file_name")
  fileSize    Int      @map("file_size")
  mimeType    String   @map("mime_type")
  
  // 存储路径
  storagePath String   @map("storage_path")
  cdnUrl      String?  @map("cdn_url")
  
  // 图片/视频元数据
  width       Int?
  height      Int?
  duration    Int?     // 视频时长（秒）
  
  uploadedAt  DateTime @default(now()) @map("uploaded_at")
  
  @@index([draftId])
  @@map("content_assets")
}
```

#### 7.1.13 VideoScriptPack (视频脚本包)

```prisma
model VideoScriptPack {
  id          String   @id @default(cuid())
  draftId     String   @map("draft_id")
  draft       ContentDraft @relation(fields: [draftId], references: [id])
  
  platform    String   // youtube / shorts / tiktok / bilibili
  
  title       String
  script      String   @db.Text
  durationSeconds Int  @map("duration_seconds")
  
  thumbnailPrompt String? @map("thumbnail_prompt") @db.Text
  
  status      String   @default("draft") // draft / ready / published
  
  publishedUrl String? @map("published_url")
  
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  
  @@index([draftId])
  @@map("video_script_packs")
}
```

#### 7.1.14 ContentPerformanceSnapshot (内容表现快照)

```prisma
model ContentPerformanceSnapshot {
  id          String   @id @default(cuid())
  draftId     String   @map("draft_id")
  draft       ContentDraft @relation(fields: [draftId], references: [id])
  
  platform    String
  
  // 流量数据
  pageViews   Int      @default(0) @map("page_views")
  uniqueVisitors Int   @default(0) @map("unique_visitors")
  
  // 互动数据
  likes       Int      @default(0)
  comments    Int      @default(0)
  shares      Int      @default(0)
  
  // SEO 数据
  keywordRankings Json @default([]) @map("keyword_rankings")
  
  // 快照时间
  snapshotDate DateTime @map("snapshot_date")
  
  createdAt   DateTime @default(now()) @map("created_at")
  
  @@index([draftId])
  @@index([snapshotDate])
  @@map("content_performance_snapshots")
}
```

### 7.2 数据存储策略

#### 7.2.1 第一版（JSON 文件方案）

**可以使用 JSON 文件的模型:**
- ContentVersion（版本历史，读取频率低）
- PublishLog（日志数据，追加写入）
- ContentPerformanceSnapshot（快照数据，定期生成）

**JSON 文件结构:**
```javascript
// data/content-versions.json
[
  {
    "id": "version-001",
    "draftId": "draft-001",
    "version": 1,
    "content": {...},
    "createdAt": "2026-06-30T10:00:00Z"
  }
]

// data/publish-logs.json
[
  {
    "id": "log-001",
    "jobId": "job-001",
    "action": "started",
    "executedAt": "2026-06-30T10:00:00Z"
  }
]
```

#### 7.2.2 第二版（数据库方案）

**必须进数据库的模型:**
- ContentProject
- ContentDraft
- ContentSeoMeta
- ContentGeoMeta
- ContentSchedule
- PlatformAccount
- PlatformCredential（加密存储）
- PlatformDraft
- PublishJob
- ContentAsset

**原因:**
- 需要复杂查询和关联
- 需要事务支持
- 需要并发控制
- 需要数据完整性

#### 7.2.3 加密要求

**必须加密的数据:**
- PlatformCredential.encryptedData（平台凭证）
- PlatformAccount.accessToken（OAuth Token）
- PlatformAccount.refreshToken（Refresh Token）

**加密方案:**
```typescript
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // 32 bytes
const IV_LENGTH = 16;

function encrypt(text: string): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

function decrypt(encryptedText: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedText.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = createDecipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY), iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
```

---

## 8. 安全与合规

### 8.1 密钥安全

**平台密钥服务器端保存:**
```typescript
// 密钥只存储在服务器端
class CredentialManager {
  async getPlatformCredential(platform: string, accountId: string) {
    // 1. 从数据库读取加密数据
    const credential = await db.platformCredential.findFirst({
      where: { accountId, platform },
    });
    
    // 2. 解密
    const decrypted = decrypt(credential.encryptedData);
    
    // 3. 返回（不传递给桌面端）
    return JSON.parse(decrypted);
  }
}
```

**桌面端只拿短期 session:**
```typescript
// 桌面端登录后获取短期 token
async function login(username: string, password: string) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  
  const { accessToken, refreshToken } = await response.json();
  
  // accessToken: 24 小时过期
  // refreshToken: 7 天过期
  
  return { accessToken, refreshToken };
}
```

### 8.2 发布前人工审核

**审核流程:**
```typescript
async function submitForReview(draftId: string, userId: string) {
  // 1. 检查内容质量
  const qualityScore = await calculateQualityScore(draftId);
  if (qualityScore < 80) {
    throw new Error('Content quality score too low');
  }
  
  // 2. 更新状态
  await updateDraftStatus(draftId, 'human_review');
  
  // 3. 通知审核人员
  await notifyReviewers(draftId);
  
  // 4. 记录日志
  await logAction(draftId, 'submitted_for_review', userId);
}

async function approveDraft(draftId: string, reviewerId: string) {
  // 1. 更新状态
  await updateDraftStatus(draftId, 'approved');
  
  // 2. 记录审核信息
  await db.contentDraft.update({
    where: { id: draftId },
    data: {
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
    },
  });
  
  // 3. 通知创建者
  await notifyCreator(draftId, 'approved');
  
  // 4. 记录日志
  await logAction(draftId, 'approved', reviewerId);
}
```

### 8.3 操作日志

**日志记录:**
```typescript
async function logAction(draftId: string, action: string, userId: string, metadata?: any) {
  await db.auditLog.create({
    data: {
      draftId,
      action,
      userId,
      metadata: metadata || {},
      executedAt: new Date(),
    },
  });
}

// 日志查询
async function getAuditLogs(draftId: string) {
  return await db.auditLog.findMany({
    where: { draftId },
    orderBy: { executedAt: 'desc' },
  });
}
```

### 8.4 回滚/下架记录

**下架流程:**
```typescript
async function unpublishContent(draftId: string, userId: string, reason: string) {
  // 1. 更新状态
  await updateDraftStatus(draftId, 'unpublished');
  
  // 2. 从各平台下架
  const platforms = await getPlatformDrafts(draftId);
  for (const platform of platforms) {
    await unpublishFromPlatform(platform);
  }
  
  // 3. 记录下架原因
  await db.contentDraft.update({
    where: { id: draftId },
    data: {
      unpublishedAt: new Date(),
      unpublishedBy: userId,
      unpublishReason: reason,
    },
  });
  
  // 4. 记录日志
  await logAction(draftId, 'unpublished', userId, { reason });
}
```

### 8.5 敏感词检查

**敏感词过滤:**
```typescript
const SENSITIVE_WORDS = [
  // 政治敏感词
  // 色情敏感词
  // 暴力敏感词
  // 广告敏感词
];

async function checkSensitiveWords(content: string) {
  const found = SENSITIVE_WORDS.filter(word => content.includes(word));
  
  if (found.length > 0) {
    return {
      passed: false,
      words: found,
      message: `Content contains sensitive words: ${found.join(', ')}`,
    };
  }
  
  return { passed: true };
}
```

### 8.6 平台规则检查

**平台规则验证:**
```typescript
async function validatePlatformRules(platform: string, content: PlatformDraft) {
  const rules = getPlatformRules(platform);
  
  const errors = [];
  
  // 检查标题长度
  if (content.title.length > rules.maxTitleLength) {
    errors.push(`Title too long (max ${rules.maxTitleLength} chars)`);
  }
  
  // 检查内容长度
  if (content.body.length > rules.maxContentLength) {
    errors.push(`Content too long (max ${rules.maxContentLength} chars)`);
  }
  
  // 检查图片数量
  if (content.images.length > rules.maxImages) {
    errors.push(`Too many images (max ${rules.maxImages})`);
  }
  
  // 检查外链
  if (content.links.length > 0 && !rules.allowExternalLinks) {
    errors.push('External links not allowed');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}
```

### 8.7 AI 内容低质/重复内容检查

**质量检查:**
```typescript
async function checkContentQuality(content: string) {
  // 1. 检查 AI 套话
  const aiFluffPatterns = [
    /在当今社会/,
    /值得注意的是/,
    /不可否认/,
    /众所周知/,
  ];
  
  const hasAIFluff = aiFluffPatterns.some(pattern => pattern.test(content));
  
  // 2. 检查重复内容
  const similarContent = await findSimilarContent(content);
  if (similarContent.length > 0) {
    return {
      passed: false,
      reason: 'Similar content already exists',
      duplicates: similarContent,
    };
  }
  
  // 3. 检查内容长度
  if (content.length < 500) {
    return {
      passed: false,
      reason: 'Content too short (min 500 chars)',
    };
  }
  
  return { passed: true };
}
```

### 8.8 禁止违规模拟登录

**严格禁止:**
```typescript
// ❌ 禁止使用 Selenium/Puppeteer 模拟登录
async function loginWithSelenium(platform: string, username: string, password: string) {
  // 这是禁止的！
  throw new Error('Simulated login is not allowed');
}

// ❌ 禁止使用 Cookie 注入
async function injectCookie(platform: string, cookie: string) {
  // 这是禁止的！
  throw new Error('Cookie injection is not allowed');
}

// ✅ 只使用官方 API
async function loginWithOAuth(platform: string, credentials: OAuthCredentials) {
  // 使用官方 OAuth 流程
  const token = await platformAPI.authenticate(credentials);
  return token;
}
```

### 8.9 发布频率控制

**防止账号封禁:**
```typescript
const RATE_LIMITS = {
  'wechat-mp': {
    maxPublishPerDay: 1,
    maxPublishPerHour: 1,
    cooldownMinutes: 60,
  },
  'youtube': {
    maxPublishPerDay: 10,
    maxPublishPerHour: 5,
    cooldownMinutes: 12,
  },
  'zhihu': {
    maxPublishPerDay: 5,
    maxPublishPerHour: 2,
    cooldownMinutes: 30,
  },
};

async function checkRateLimit(platform: string, accountId: string) {
  const limits = RATE_LIMITS[platform];
  if (!limits) return { allowed: true };
  
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
  // 检查每小时限制
  const hourlyCount = await db.publishJob.count({
    where: {
      platform,
      accountId,
      status: 'completed',
      completedAt: { gte: oneHourAgo },
    },
  });
  
  if (hourlyCount >= limits.maxPublishPerHour) {
    return {
      allowed: false,
      reason: `Hourly limit reached (max ${limits.maxPublishPerHour} per hour)`,
      retryAfter: 60 * 60 * 1000, // 1 小时后重试
    };
  }
  
  // 检查每天限制
  const dailyCount = await db.publishJob.count({
    where: {
      platform,
      accountId,
      status: 'completed',
      completedAt: { gte: oneDayAgo },
    },
  });
  
  if (dailyCount >= limits.maxPublishPerDay) {
    return {
      allowed: false,
      reason: `Daily limit reached (max ${limits.maxPublishPerDay} per day)`,
      retryAfter: 24 * 60 * 60 * 1000, // 24 小时后重试
    };
  }
  
  return { allowed: true };
}
```

---

## 9. 实施路线图

### 9.1 MVP 1 (4 周)

**Week 1: Web 后台内容发布引擎**
- Content API（CRUD）
- Draft API（草稿管理）
- SEO/GEO 评分引擎
- 数据库模型（PostgreSQL）

**Week 2: jueshi.net 集成**
- jueshi.net Platform Adapter
- Publish Queue（BullMQ）
- 定时发布功能
- Sitemap 自动更新

**Week 3: 桌面端基础**
- Tauri + React 项目搭建
- 用户登录
- Dashboard 总览
- Content Editor 内容编辑器

**Week 4: 桌面端功能**
- SEO/GEO Score Panel
- Template Selector
- Publish Calendar
- Video Script Studio
- 测试 + 上线

**MVP 1 交付物:**
- ✅ Web 后台内容发布引擎
- ✅ jueshi.net 专题/指南/清单草稿
- ✅ SEO/GEO 评分
- ✅ 人工审核
- ✅ 定时发布
- ✅ 视频脚本包
- ✅ 平台发布包导出

### 9.2 MVP 2 (6 周)

**Week 5-6: Tauri 桌面端增强**
- 本地编辑与预览
- 发布日历（高级功能）
- 多账号管理
- Asset Library

**Week 7-8: 平台适配器**
- 微信公众号 Adapter（草稿创建）
- YouTube Adapter（视频上传）
- Platform Preview（多平台预览）

**Week 9-10: 数据分析**
- Publish Logs（发布日志）
- Content Performance（内容表现）
- Account Connections（账号管理）

**Week 11: 测试 + 上线**

**MVP 2 交付物:**
- ✅ Tauri 桌面端（完整功能）
- ✅ 本地编辑与预览
- ✅ 发布日历
- ✅ 多账号管理
- ✅ 微信公众号草稿箱接入
- ✅ YouTube metadata 输出

### 9.3 MVP 3 (8 周)

**Week 12-14: 多平台 Adapter**
- 知乎 Adapter（发布包）
- 百家号 Adapter（发布包）
- Bilibili Adapter（发布包）
- 小红书 Adapter（发布包）

**Week 15-17: 平台状态同步**
- 平台状态同步
- 数据回流
- 内容刷新建议

**Week 18-19: 产品化**
- 独立产品化授权
- 多租户支持
- 白标定制

**MVP 3 交付物:**
- ✅ 多平台 Adapter（知乎、百家号等）
- ✅ 平台状态同步
- ✅ 数据回流
- ✅ 内容刷新建议
- ✅ 独立产品化授权

---

## 10. 附录

### 10.1 技术栈对比

| 技术 | Tauri | Electron |
|------|-------|----------|
| **包体积** | ~10MB | ~150MB |
| **内存占用** | ~100MB | ~300MB |
| **启动速度** | ~1s | ~3s |
| **安全性** | 高（Rust 后端） | 中（Node.js 后端） |
| **生态** | 新兴 | 成熟 |
| **跨平台** | ✅ | ✅ |

**推荐:** Tauri（性能更好，安全性更高）

### 10.2 API 配额

| 平台 | API 配额 | 限制 |
|------|---------|------|
| jueshi.net | 无限制 | 自有站点 |
| 微信公众号 | 每日 10000 次 | 认证服务号 |
| YouTube | 每日 10000 次 | 需申请 |
| 知乎 | 无官方 API | - |
| 百家号 | 无官方 API | - |

### 10.3 成本估算

**服务器成本:**
- VPS: $20/月
- 数据库: $10/月
- Redis: $5/月
- CDN: $10/月
- **总计: $45/月**

**第三方服务:**
- AWS KMS: $1/月
- Google Search Console: 免费
- YouTube API: 免费（配额内）
- **总计: $1/月**

**总成本: $46/月**

---

**文档版本:** v1.0  
**最后更新:** 2026-06-30  
**下一步:** 用户审核 → 批准实施 → 开始 MVP 1 开发
