// GET /api/forum/admin/analytics/privacy - Privacy policy for forum analytics
// Returns what data is collected, how it's used, and opt-out options

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    version: "1.0",
    updatedAt: "2026-07-17",
    description: "论坛分析数据隐私政策",
    dataCollected: [
      {
        type: "搜索关键词",
        retention: "90天",
        sanitized: true,
        note: "关键词长度限制50字符，去除控制字符，不记录完整搜索内容",
      },
      {
        type: "帖子浏览",
        retention: "90天",
        sanitized: true,
        note: "仅记录帖子slug和ID，不记录正文内容",
      },
      {
        type: "分享点击",
        retention: "90天",
        sanitized: true,
        note: "仅记录分享平台和帖子slug，不记录分享目标",
      },
      {
        type: "Feed浏览",
        retention: "90天",
        sanitized: true,
        note: "仅记录Feed类型(RSS/Atom)，不记录用户身份",
      },
      {
        type: "筛选行为",
        retention: "90天",
        sanitized: true,
        note: "仅记录筛选条件（分类、标签），不记录用户身份",
      },
      {
        type: "草稿创建",
        retention: "90天",
        sanitized: true,
        note: "仅记录分类ID，不记录草稿内容",
      },
      {
        type: "提交审核",
        retention: "90天",
        sanitized: true,
        note: "仅记录帖子ID和分类ID，不记录帖子内容",
      },
    ],
    dataNotCollected: [
      "帖子正文内容",
      "用户密码、Token、Cookie",
      "用户邮箱（分析输出中匿名化）",
      "用户IP地址（EventLog仅存储IP哈希）",
      "完整搜索内容中的敏感个人信息",
      "第三方分析SDK数据",
    ],
    optOut: {
      envVar: "FORUM_ANALYTICS_DISABLED",
      description: "设置环境变量 FORUM_ANALYTICS_DISABLED=true 可完全禁用事件追踪",
    },
    metadata: {
      eventTypes: [
        "forum_search",
        "forum_filter",
        "forum_post_view",
        "forum_share",
        "forum_feed_view",
        "forum_draft_create",
        "forum_submit_review",
        "forum_moderation_complete",
      ],
      storageBackend: "EventLog (PostgreSQL event_logs table)",
      maxMetadataFieldLength: 200,
      keywordMaxLength: 50,
    },
  });
}
