# ContentOps Metadata JSON 结构规范

**版本**: v1.0  
**日期**: 2026-07-01  
**适用模型**: Checklist, Guide, Topic

---

## 概述

`metadataJson` 是一个统一的 JSON 字段，用于存储 ContentOps 高级元数据。所有 SEO/GEO/视频/质量相关字段集中存储，避免频繁 migration。

---

## 结构定义

```typescript
interface ContentOpsMetadata {
  contentOps: {
    // 质量评分
    qualityScore?: number; // 0-100
    
    // 关键词
    primaryKeyword?: string;
    secondaryKeywords?: string[];
    
    // GEO 答案块
    geoAnswerBlock?: {
      directAnswer: string;
      targetAudience: string;
      targetCountries: string[];
    };
    
    // FAQ 结构化数据
    faq?: Array<{
      question: string;
      answer: string;
    }>;
    
    // 内链建议
    internalLinks?: Array<{
      title: string;
      url: string;
      reason: string;
    }>;
    
    // JSON-LD 结构化数据
    structuredData?: {
      "@context": string;
      "@type": string;
      [key: string]: any;
    };
    
    // 视频包
    videoPack?: {
      youtubeTitle: string;
      youtubeDescription: string;
      longScript: string;
      shortsScript: string;
      thumbnailPrompt: string;
    };
    
    // 社交媒体推广提示词
    socialMediaPrompts?: {
      twitter?: string;
      facebook?: string;
      instagram?: string;
      linkedin?: string;
    };
    
    // 发布检查清单
    publishChecklist?: Array<{
      item: string;
      checked: boolean;
      note?: string;
    }>;
  };
}
```

---

## 示例数据

### Checklist 示例

```json
{
  "contentOps": {
    "qualityScore": 85,
    "primaryKeyword": "留学生出国前准备",
    "secondaryKeywords": [
      "留学清单",
      "出国准备",
      "留学生必备"
    ],
    "geoAnswerBlock": {
      "directAnswer": "留学生出国前需要准备：签证、机票、住宿、行李、银行卡、手机卡、保险、常用APP、文件、通知家人、兑换货币、接机、退宿、日用品、报到。",
      "targetAudience": "准留学生及其家长",
      "targetCountries": ["加拿大", "美国", "英国", "澳洲"]
    },
    "faq": [
      {
        "question": "留学生出国前需要准备哪些文件？",
        "answer": "护照、签证、录取通知书、成绩单、照片、保险单、机票行程单、住宿确认信。建议扫描备份并打印纸质版。"
      },
      {
        "question": "留学生需要带多少行李？",
        "answer": "建议按季节准备1-2周换洗衣物，到达后购买日用品。重点携带重要文件、常用药品、电子设备。避免超重。"
      }
    ],
    "internalLinks": [
      {
        "title": "汇率换算",
        "url": "/tools/exchange-rate",
        "reason": "兑换货币时查看实时汇率"
      },
      {
        "title": "运费计算",
        "url": "/tools/shipping-calculator",
        "reason": "计算行李托运费用"
      }
    ],
    "structuredData": {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": "留学生出国前准备清单",
      "description": "出国前必做事项清单：从签证到报到，一步步帮你做好准备。",
      "stepCount": 15,
      "totalTime": "P30D"
    },
    "videoPack": {
      "youtubeTitle": "留学生出国前准备清单 | 15件必做事项",
      "youtubeDescription": "准留学生必看！出国前需要准备什么？从签证到报到，一步步帮你做好准备。",
      "longScript": "开场：准留学生们，出国前你准备好了吗？\n第一部分：文件准备...\n第二部分：行李打包...\n第三部分：金融准备...\n第四部分：通讯准备...\n结尾：祝你留学顺利！",
      "shortsScript": "留学生出国前必做的15件事！#留学 #出国准备",
      "thumbnailPrompt": "留学生拉着行李箱，背景是机场出发大厅，标题文字'出国前准备清单'，明亮色调，专业风格"
    },
    "socialMediaPrompts": {
      "twitter": "准留学生必看！出国前准备清单 📋 从签证到报到，15件必做事项帮你做好准备 ✈️ #留学 #出国准备",
      "facebook": "留学生出国前准备清单 🎓 包含签证、机票、住宿、行李、银行卡、手机卡、保险、常用APP等15件必做事项。",
      "instagram": "准留学生们，出国前你准备好了吗？📋 15件必做事项清单已更新！链接在bio ✈️ #留学 #出国准备 #留学生活"
    },
    "publishChecklist": [
      {
        "item": "SEO Title 已填写",
        "checked": true
      },
      {
        "item": "SEO Description 已填写",
        "checked": true
      },
      {
        "item": "FAQ 至少3条",
        "checked": true,
        "note": "已提供5条FAQ"
      },
      {
        "item": "内链至少3条",
        "checked": false,
        "note": "当前只有2条内链"
      },
      {
        "item": "质量评分≥80",
        "checked": true,
        "note": "当前评分85"
      }
    ]
  }
}
```

---

## 字段说明

### qualityScore (number, 0-100)
- **用途**: 内容质量评分
- **发布要求**: ≥ 80 才能发布
- **计算方式**: 由 Hermes Agent 自动评分

### primaryKeyword (string)
- **用途**: 主关键词
- **SEO 用途**: 用于 title、H1、meta description

### secondaryKeywords (string[])
- **用途**: 次要关键词列表
- **SEO 用途**: 用于内容优化、内链锚文本

### geoAnswerBlock (object)
- **用途**: GEO（生成式引擎优化）答案块
- **渲染位置**: 页面顶部摘要区域
- **字段**:
  - `directAnswer`: 直接答案（用于 Google Answer Box）
  - `targetAudience`: 目标受众
  - `targetCountries`: 目标国家列表

### faq (array)
- **用途**: FAQ 结构化数据
- **发布要求**: 至少 3 条（如提供）
- **渲染**: 页面 FAQ 区块 + JSON-LD FAQPage
- **字段**:
  - `question`: 问题
  - `answer`: 答案

### internalLinks (array)
- **用途**: 内链建议
- **发布要求**: 至少 3 条（如提供）
- **渲染**: 页面底部"相关内容"区块
- **字段**:
  - `title`: 链接标题
  - `url`: 链接 URL
  - `reason`: 推荐理由

### structuredData (object)
- **用途**: JSON-LD 结构化数据
- **渲染**: `<script type="application/ld+json">`
- **类型**: HowTo / FAQPage / Article 等
- **要求**: 必须是合法 JSON-LD

### videoPack (object)
- **用途**: 视频制作包
- **后台显示**: 只读展示，供内容创作者参考
- **字段**:
  - `youtubeTitle`: YouTube 视频标题
  - `youtubeDescription`: YouTube 视频描述
  - `longScript`: 长视频脚本
  - `shortsScript`: 短视频脚本
  - `thumbnailPrompt`: 缩略图 AI 生成提示词

### socialMediaPrompts (object)
- **用途**: 社交媒体推广文案
- **后台显示**: 只读展示，供运营人员复制使用
- **字段**:
  - `twitter`: Twitter 文案
  - `facebook`: Facebook 文案
  - `instagram`: Instagram 文案
  - `linkedin`: LinkedIn 文案（可选）

### publishChecklist (array)
- **用途**: 发布前检查清单
- **后台显示**: 勾选框列表
- **字段**:
  - `item`: 检查项
  - `checked`: 是否通过
  - `note`: 备注（可选）

---

## 兼容性要求

### 旧数据兼容
- `metadataJson` 可以为 `null`
- 旧内容页面不能报错
- 渲染时必须检查 `metadataJson?.contentOps` 是否存在

### 新数据要求
- `metadataJson` 必须包含 `contentOps` 对象
- `contentOps` 内所有字段均为可选
- 至少应包含 `qualityScore`、`primaryKeyword`、`seoTitle`、`seoDescription`

---

## 安全要求

### 大小限制
- `metadataJson` 总大小不超过 1MB
- API 层应校验 payload 大小

### 内容校验
- `structuredData` 必须是合法 JSON-LD
- `faq` 数组长度不超过 50
- `internalLinks` 数组长度不超过 20
- URL 字段必须是合法 URL

### 权限控制
- 只有 admin 可以写入 `metadataJson`
- 普通用户只能读取

---

## 渲染规则

### Draft 状态
- 不公开访问
- 不进入 sitemap
- 页面 `noindex,nofollow`

### Published 状态
- 公开访问
- 进入 sitemap
- 渲染 FAQ 区块
- 渲染 JSON-LD 结构化数据
- 渲染内链区块
- 渲染 GEO 答案块（如提供）

### metadataJson 缺失
- 页面不能崩
- 不渲染高级区块
- 只渲染基础内容（标题、正文、步骤）

---

## 下一步

✅ PHASE 2 完成，进入 PHASE 3: 创建 Prisma migration
