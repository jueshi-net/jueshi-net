-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "password" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "points" INTEGER NOT NULL DEFAULT 0,
    "checkinStreak" INTEGER NOT NULL DEFAULT 0,
    "lastCheckinDate" TEXT,
    "memberUntil" TIMESTAMP(3),
    "profile_type" TEXT,
    "growth_value" INTEGER NOT NULL DEFAULT 0,
    "level_key" TEXT DEFAULT 'lv1',
    "badges" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_premium" BOOLEAN NOT NULL DEFAULT false,
    "stripe_customer_id" TEXT,
    "stripe_subscription_id" TEXT,
    "stripe_price_id" TEXT,
    "stripe_current_period_end" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "user_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'system',
    "language" TEXT NOT NULL DEFAULT 'zh-CN',
    "emailNotif" BOOLEAN NOT NULL DEFAULT true,
    "compactMode" BOOLEAN NOT NULL DEFAULT false,
    "itemsPerPage" INTEGER NOT NULL DEFAULT 20,
    "defaultCategory" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "links" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "categoryName" TEXT,
    "categoryId" TEXT,
    "userId" TEXT,
    "workspaceId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" TEXT,
    "color" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "link_tags" (
    "id" TEXT NOT NULL,
    "linkId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "link_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "favorites" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "linkId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "memos" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "category" TEXT,
    "userId" TEXT NOT NULL,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "color" TEXT,
    "dueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "memos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "workspaces" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "ownerId" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workspaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "workspace_members" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workspace_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "short_links" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "userId" TEXT,
    "title" TEXT,
    "description" TEXT,
    "expiresAt" TIMESTAMP(3),
    "password" TEXT,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "lastClickAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "short_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT,
    "entityId" TEXT,
    "details" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "feedback" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "type" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "page" TEXT,
    "email" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'info',
    "link" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "ad_campaigns" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "ad_type" TEXT NOT NULL DEFAULT 'DIRECT',
    "image_url" TEXT,
    "target_url" TEXT,
    "code_snippet" TEXT,
    "placements" TEXT[],
    "target_countries" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_date" TIMESTAMP(3),
    "priority" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ad_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "invite_codes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "max_uses" INTEGER NOT NULL DEFAULT 100,
    "used_count" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "created_by" TEXT,
    "note" TEXT,

    CONSTRAINT "invite_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "articles" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "coverImage" TEXT,
    "author" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "views" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "category" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "relatedTools" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "article_tags" (
    "id" TEXT NOT NULL,
    "articleId" TEXT,
    "tag" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "article_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "resources" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sourceType" TEXT NOT NULL DEFAULT 'third-party',
    "usage" TEXT,
    "disclaimer" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "favicon" TEXT,
    "icon_url" TEXT,
    "is_ad" BOOLEAN NOT NULL DEFAULT false,
    "domain_age" INTEGER,
    "quality_score" INTEGER NOT NULL DEFAULT 0,
    "language" TEXT DEFAULT 'en',
    "last_checked" TIMESTAMP(3),
    "check_fail_count" INTEGER NOT NULL DEFAULT 0,
    "rejected_reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "subscriptions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "interval" TEXT NOT NULL,
    "features" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "user_subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "subscription_plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "interval" TEXT NOT NULL,
    "features" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "webhooks" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "url" TEXT NOT NULL,
    "events" TEXT NOT NULL,
    "secret" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastTriggered" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "webhooks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "email_subscriptions" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "confirmedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "newsletter_broadcasts" (
    "id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "sentCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "newsletter_broadcasts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "postal_codes" (
    "id" TEXT NOT NULL,
    "country" TEXT,
    "countryCode" TEXT,
    "province" TEXT,
    "city" TEXT,
    "district" TEXT,
    "postalCode" TEXT,
    "normalizedPostalCode" TEXT,
    "areaName" TEXT,
    "adminName1" TEXT,
    "adminCode1" TEXT,
    "adminName2" TEXT,
    "adminCode2" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "accuracy" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "source" TEXT NOT NULL DEFAULT 'GeoNames',
    "sourceUrl" TEXT NOT NULL DEFAULT 'https://download.geonames.org/export/zip/',
    "sourceVersion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "postal_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "hs_codes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "parentId" TEXT,
    "description" TEXT NOT NULL,
    "descriptionEn" TEXT,
    "category" TEXT,
    "taxRate" DOUBLE PRECISION,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hs_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "export_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "exportType" TEXT NOT NULL,
    "documentType" TEXT,
    "ipHash" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "export_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "event_logs" (
    "id" TEXT NOT NULL,
    "eventType" TEXT NOT NULL DEFAULT '',
    "toolName" TEXT,
    "action" TEXT,
    "path" TEXT,
    "sessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "point_ledgers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "reason" TEXT,
    "relatedId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "point_ledgers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "daily_check_ins" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dateKey" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_check_ins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "user_tasks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "category" TEXT,
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "pointsAwarded" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "reward_items" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "costPoints" INTEGER NOT NULL,
    "rewardType" TEXT NOT NULL,
    "rewardValue" INTEGER NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reward_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "user_rewards" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rewardItemId" TEXT NOT NULL,
    "rewardType" TEXT NOT NULL,
    "rewardValue" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "expiresAt" TIMESTAMP(3),
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_rewards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "workbench_links" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "iconUrl" TEXT,
    "category" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workbench_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "tool_favorites" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "toolKey" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "tool_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tool_favorites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "tool_reviews" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "toolKey" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "pointsAwarded" BOOLEAN NOT NULL DEFAULT false,
    "reviewedRewardedAt" TIMESTAMP(3),
    "ipHash" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tool_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "ai_usage_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "toolType" TEXT NOT NULL,
    "inputHash" TEXT,
    "outputTokens" INTEGER,
    "costPoints" INTEGER NOT NULL DEFAULT 0,
    "ipHash" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_usage_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "topics" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "summary" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "templateType" TEXT NOT NULL DEFAULT 'rating_list',
    "coverEmoji" TEXT,
    "coverImage" TEXT,
    "heroBadges" JSONB,
    "suitableFor" JSONB,
    "tags" JSONB,
    "youtubeUrl" TEXT,
    "youtubeVideoId" TEXT,
    "youtubeTitle" TEXT,
    "youtubeDescription" TEXT,
    "youtubeThumbnail" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "topic_items" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "alias" TEXT,
    "rating" TEXT,
    "category" TEXT,
    "iconText" TEXT,
    "iconBg" TEXT,
    "iconFg" TEXT,
    "installPriority" TEXT,
    "description" TEXT,
    "analogy" TEXT,
    "suitableFor" TEXT,
    "beginnerAdvice" TEXT,
    "riskTip" TEXT,
    "officialUrl" TEXT,
    "isBeginnerFriendly" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "topic_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "topic_sections" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "topic_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "user_levels" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "min_growth" INTEGER NOT NULL,
    "max_growth" INTEGER,
    "description" TEXT,
    "benefits" JSONB,
    "icon_text" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "user_badges" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon_text" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "condition_text" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "user_badge_awards" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "badge_id" TEXT NOT NULL,
    "reason" TEXT,
    "awarded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_badge_awards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "growth_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "reason" TEXT,
    "ref_type" TEXT,
    "ref_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "growth_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "user_company_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "profile_name" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "company_name_en" TEXT,
    "contact_name" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "address" TEXT,
    "city_postal" TEXT,
    "tax_id" TEXT,
    "bank_cny_info" TEXT,
    "bank_usd_info" TEXT,
    "default_currency" TEXT NOT NULL DEFAULT 'USD',
    "logo_data_url" TEXT,
    "logo_text" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_company_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "user_company_profile_history" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "snapshot_json" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_company_profile_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "tool_document_drafts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "company_profile_id" TEXT,
    "tool_key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "data_json" TEXT NOT NULL,
    "preview_json" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tool_document_drafts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "tool_document_history" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "snapshot_json" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tool_document_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "tools" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "category" TEXT NOT NULL DEFAULT 'general',
    "url" TEXT,
    "route" TEXT,
    "isInternal" BOOLEAN NOT NULL DEFAULT true,
    "sourceType" TEXT NOT NULL DEFAULT 'official',
    "popularity_score" INTEGER NOT NULL DEFAULT 0,
    "popularity_tag" TEXT,
    "is_scenario_pack" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "hub_seo_contents" (
    "id" TEXT NOT NULL,
    "country_code" TEXT,
    "province_code" TEXT,
    "logistics_intro" TEXT,
    "tips" JSONB,
    "has_data" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hub_seo_contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "user_widget_configs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "widget_key" TEXT NOT NULL,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "position" INTEGER NOT NULL DEFAULT 0,
    "settings" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_widget_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "user_custom_navs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "icon" TEXT,
    "description" TEXT,
    "category" TEXT DEFAULT 'general',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_custom_navs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "destinations" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "hero_title" TEXT NOT NULL,
    "hero_subtitle" TEXT NOT NULL,
    "seo_title" TEXT NOT NULL,
    "seo_description" TEXT NOT NULL,
    "keywords" TEXT[],
    "key_cities" TEXT[],
    "user_count" TEXT NOT NULL DEFAULT '0',
    "doc_count" TEXT NOT NULL DEFAULT '0',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "destinations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "destination_tools" (
    "id" TEXT NOT NULL,
    "destination_id" TEXT NOT NULL,
    "tool_slug" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "destination_tools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "destination_guides" (
    "id" TEXT NOT NULL,
    "destination_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "website_url" TEXT,
    "type" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "destination_guides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "destination_services" (
    "id" TEXT NOT NULL,
    "destination_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "website_url" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "destination_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "user_onboarding_states" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "workbench_dismissed" BOOLEAN NOT NULL DEFAULT false,
    "resource_dismissed" BOOLEAN NOT NULL DEFAULT false,
    "first_tool_used" BOOLEAN NOT NULL DEFAULT false,
    "first_favorite_added" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_onboarding_states_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "user_favorites" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "resource_type" TEXT NOT NULL,
    "resource_url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_favorites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "document_histories" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "document_type" TEXT NOT NULL,
    "document_data" TEXT NOT NULL,
    "document_no" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "homepage_configs" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "valueJson" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT,

    CONSTRAINT "homepage_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "tool_metric_dailies" (
    "id" TEXT NOT NULL,
    "tool_slug" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "saves" INTEGER NOT NULL DEFAULT 0,
    "favorites" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "tool_metric_dailies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "ad_placements" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "page_type" TEXT NOT NULL,
    "zone" TEXT NOT NULL,
    "device" TEXT NOT NULL DEFAULT 'all',
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ad_placements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "landing_pages" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "seo_title" TEXT,
    "seo_description" TEXT,
    "page_type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "hero_section" JSONB,
    "primary_tool" TEXT,
    "related_tools" TEXT[],
    "related_topics" TEXT[],
    "related_articles" TEXT[],
    "faq_items" JSONB,
    "official_links" JSONB,
    "ad_placements" JSONB,
    "cta_config" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "published_at" TIMESTAMP(3),

    CONSTRAINT "landing_pages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "users_stripe_customer_id_key" ON "users"("stripe_customer_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "users_stripe_subscription_id_key" ON "users"("stripe_subscription_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "user_preferences_userId_key" ON "user_preferences"("userId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "links_userId_idx" ON "links"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "links_workspaceId_idx" ON "links"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "tags_name_key" ON "tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "link_tags_linkId_tagId_key" ON "link_tags"("linkId", "tagId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "favorites_userId_linkId_key" ON "favorites"("userId", "linkId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "memos_userId_idx" ON "memos"("userId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "workspaces_slug_key" ON "workspaces"("slug");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "workspace_members_workspaceId_userId_key" ON "workspace_members"("workspaceId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "short_links_code_key" ON "short_links"("code");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "short_links_userId_idx" ON "short_links"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "feedback_userId_idx" ON "feedback"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "feedback_status_idx" ON "feedback"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "notifications_userId_isRead_idx" ON "notifications"("userId", "isRead");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "notifications_userId_read_at_idx" ON "notifications"("userId", "read_at");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "notifications_userId_createdAt_idx" ON "notifications"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "notifications_type_idx" ON "notifications"("type");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ad_campaigns_title_key" ON "ad_campaigns"("title");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ad_campaigns_is_active_ad_type_idx" ON "ad_campaigns"("is_active", "ad_type");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ad_campaigns_is_active_start_date_end_date_idx" ON "ad_campaigns"("is_active", "start_date", "end_date");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "invite_codes_code_key" ON "invite_codes"("code");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "invite_codes_is_active_code_idx" ON "invite_codes"("is_active", "code");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "invite_codes_expires_at_idx" ON "invite_codes"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "articles_slug_key" ON "articles"("slug");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "articles_status_idx" ON "articles"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "articles_category_idx" ON "articles"("category");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "resources_url_key" ON "resources"("url");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "resources_category_idx" ON "resources"("category");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "resources_isActive_idx" ON "resources"("isActive");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "resources_quality_score_idx" ON "resources"("quality_score");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "subscriptions_name_key" ON "subscriptions"("name");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "subscriptions_slug_key" ON "subscriptions"("slug");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "user_subscriptions_userId_subscriptionId_key" ON "user_subscriptions"("userId", "subscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "subscription_plans_name_key" ON "subscription_plans"("name");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "webhooks_userId_idx" ON "webhooks"("userId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "email_subscriptions_email_key" ON "email_subscriptions"("email");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "postal_codes_postalCode_idx" ON "postal_codes"("postalCode");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "postal_codes_normalizedPostalCode_idx" ON "postal_codes"("normalizedPostalCode");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "postal_codes_countryCode_normalizedPostalCode_idx" ON "postal_codes"("countryCode", "normalizedPostalCode");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "postal_codes_country_city_idx" ON "postal_codes"("country", "city");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "postal_codes_countryCode_postalCode_idx" ON "postal_codes"("countryCode", "postalCode");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "postal_codes_countryCode_city_idx" ON "postal_codes"("countryCode", "city");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "postal_codes_adminCode1_idx" ON "postal_codes"("adminCode1");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "hs_codes_category_idx" ON "hs_codes"("category");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "hs_codes_description_idx" ON "hs_codes"("description");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "export_logs_userId_idx" ON "export_logs"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "export_logs_exportType_idx" ON "export_logs"("exportType");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "export_logs_createdAt_idx" ON "export_logs"("createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "event_logs_eventType_idx" ON "event_logs"("eventType");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "event_logs_toolName_idx" ON "event_logs"("toolName");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "event_logs_createdAt_idx" ON "event_logs"("createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "event_logs_sessionId_idx" ON "event_logs"("sessionId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "point_ledgers_userId_idx" ON "point_ledgers"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "point_ledgers_type_idx" ON "point_ledgers"("type");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "point_ledgers_createdAt_idx" ON "point_ledgers"("createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "daily_check_ins_userId_idx" ON "daily_check_ins"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "daily_check_ins_dateKey_idx" ON "daily_check_ins"("dateKey");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "daily_check_ins_userId_dateKey_key" ON "daily_check_ins"("userId", "dateKey");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "user_tasks_userId_idx" ON "user_tasks"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "user_tasks_status_idx" ON "user_tasks"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "user_tasks_dueDate_idx" ON "user_tasks"("dueDate");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "reward_items_code_key" ON "reward_items"("code");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "reward_items_enabled_idx" ON "reward_items"("enabled");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "reward_items_sortOrder_idx" ON "reward_items"("sortOrder");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "user_rewards_userId_idx" ON "user_rewards"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "user_rewards_status_idx" ON "user_rewards"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "user_rewards_rewardType_idx" ON "user_rewards"("rewardType");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "user_rewards_expiresAt_idx" ON "user_rewards"("expiresAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "workbench_links_userId_idx" ON "workbench_links"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "tool_favorites_userId_idx" ON "tool_favorites"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "tool_favorites_tool_id_idx" ON "tool_favorites"("tool_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "tool_favorites_userId_toolKey_key" ON "tool_favorites"("userId", "toolKey");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "tool_reviews_userId_idx" ON "tool_reviews"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "tool_reviews_toolKey_idx" ON "tool_reviews"("toolKey");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "tool_reviews_status_idx" ON "tool_reviews"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "tool_reviews_createdAt_idx" ON "tool_reviews"("createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ai_usage_logs_userId_idx" ON "ai_usage_logs"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ai_usage_logs_toolType_idx" ON "ai_usage_logs"("toolType");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ai_usage_logs_createdAt_idx" ON "ai_usage_logs"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "topics_slug_key" ON "topics"("slug");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "topics_status_idx" ON "topics"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "topics_slug_idx" ON "topics"("slug");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "topic_items_topicId_idx" ON "topic_items"("topicId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "topic_items_sortOrder_idx" ON "topic_items"("sortOrder");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "topic_sections_topicId_idx" ON "topic_sections"("topicId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "topic_sections_sortOrder_idx" ON "topic_sections"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "user_levels_key_key" ON "user_levels"("key");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "user_badges_key_key" ON "user_badges"("key");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "user_badge_awards_user_id_idx" ON "user_badge_awards"("user_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "user_badge_awards_badge_id_idx" ON "user_badge_awards"("badge_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "user_badge_awards_user_id_badge_id_key" ON "user_badge_awards"("user_id", "badge_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "growth_logs_user_id_idx" ON "growth_logs"("user_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "growth_logs_type_idx" ON "growth_logs"("type");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "growth_logs_created_at_idx" ON "growth_logs"("created_at");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "user_company_profiles_user_id_idx" ON "user_company_profiles"("user_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "user_company_profiles_is_default_idx" ON "user_company_profiles"("is_default");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "user_company_profile_history_profile_id_idx" ON "user_company_profile_history"("profile_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "user_company_profile_history_user_id_idx" ON "user_company_profile_history"("user_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "tool_document_drafts_user_id_idx" ON "tool_document_drafts"("user_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "tool_document_drafts_tool_key_idx" ON "tool_document_drafts"("tool_key");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "tool_document_drafts_company_profile_id_idx" ON "tool_document_drafts"("company_profile_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "tool_document_history_document_id_idx" ON "tool_document_history"("document_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "tool_document_history_user_id_idx" ON "tool_document_history"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "tools_slug_key" ON "tools"("slug");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "tools_category_idx" ON "tools"("category");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "tools_is_active_popularity_score_idx" ON "tools"("is_active", "popularity_score" DESC);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "tools_slug_idx" ON "tools"("slug");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "hub_seo_contents_has_data_idx" ON "hub_seo_contents"("has_data");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "hub_seo_contents_country_code_province_code_key" ON "hub_seo_contents"("country_code", "province_code");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "user_widget_configs_user_id_idx" ON "user_widget_configs"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "user_widget_configs_user_id_widget_key_key" ON "user_widget_configs"("user_id", "widget_key");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "user_custom_navs_user_id_idx" ON "user_custom_navs"("user_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "user_custom_navs_category_idx" ON "user_custom_navs"("category");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "destinations_slug_key" ON "destinations"("slug");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "destinations_is_active_region_idx" ON "destinations"("is_active", "region");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "destinations_slug_idx" ON "destinations"("slug");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "destination_tools_destination_id_idx" ON "destination_tools"("destination_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "destination_tools_destination_id_tool_slug_key" ON "destination_tools"("destination_id", "tool_slug");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "destination_guides_destination_id_idx" ON "destination_guides"("destination_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "destination_guides_type_idx" ON "destination_guides"("type");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "destination_services_destination_id_idx" ON "destination_services"("destination_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "destination_services_category_idx" ON "destination_services"("category");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "user_onboarding_states_user_id_key" ON "user_onboarding_states"("user_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "user_onboarding_states_user_id_idx" ON "user_onboarding_states"("user_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "user_favorites_user_id_idx" ON "user_favorites"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "user_favorites_user_id_resource_url_key" ON "user_favorites"("user_id", "resource_url");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "document_histories_user_id_idx" ON "document_histories"("user_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "document_histories_user_id_document_type_idx" ON "document_histories"("user_id", "document_type");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "homepage_configs_key_key" ON "homepage_configs"("key");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "tool_metric_dailies_tool_slug_idx" ON "tool_metric_dailies"("tool_slug");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "tool_metric_dailies_date_idx" ON "tool_metric_dailies"("date");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "tool_metric_dailies_tool_slug_date_key" ON "tool_metric_dailies"("tool_slug", "date");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ad_placements_key_key" ON "ad_placements"("key");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ad_placements_page_type_idx" ON "ad_placements"("page_type");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ad_placements_is_active_idx" ON "ad_placements"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "landing_pages_slug_key" ON "landing_pages"("slug");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "landing_pages_status_idx" ON "landing_pages"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "landing_pages_page_type_idx" ON "landing_pages"("page_type");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "landing_pages_slug_idx" ON "landing_pages"("slug");

-- AddForeignKey
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "links" ADD CONSTRAINT "links_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "links" ADD CONSTRAINT "links_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "links" ADD CONSTRAINT "links_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "link_tags" ADD CONSTRAINT "link_tags_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "links"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "link_tags" ADD CONSTRAINT "link_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "links"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memos" ADD CONSTRAINT "memos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "short_links" ADD CONSTRAINT "short_links_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webhooks" ADD CONSTRAINT "webhooks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hs_codes" ADD CONSTRAINT "hs_codes_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "hs_codes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "point_ledgers" ADD CONSTRAINT "point_ledgers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_check_ins" ADD CONSTRAINT "daily_check_ins_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_tasks" ADD CONSTRAINT "user_tasks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_rewards" ADD CONSTRAINT "user_rewards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_rewards" ADD CONSTRAINT "user_rewards_rewardItemId_fkey" FOREIGN KEY ("rewardItemId") REFERENCES "reward_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workbench_links" ADD CONSTRAINT "workbench_links_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tool_favorites" ADD CONSTRAINT "tool_favorites_tool_id_fkey" FOREIGN KEY ("tool_id") REFERENCES "tools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tool_favorites" ADD CONSTRAINT "tool_favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tool_reviews" ADD CONSTRAINT "tool_reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_usage_logs" ADD CONSTRAINT "ai_usage_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topic_items" ADD CONSTRAINT "topic_items_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topic_sections" ADD CONSTRAINT "topic_sections_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_badge_awards" ADD CONSTRAINT "user_badge_awards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_badge_awards" ADD CONSTRAINT "user_badge_awards_badge_id_fkey" FOREIGN KEY ("badge_id") REFERENCES "user_badges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "growth_logs" ADD CONSTRAINT "growth_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_company_profiles" ADD CONSTRAINT "user_company_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_company_profile_history" ADD CONSTRAINT "user_company_profile_history_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "user_company_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tool_document_drafts" ADD CONSTRAINT "tool_document_drafts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tool_document_drafts" ADD CONSTRAINT "tool_document_drafts_company_profile_id_fkey" FOREIGN KEY ("company_profile_id") REFERENCES "user_company_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tool_document_history" ADD CONSTRAINT "tool_document_history_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "tool_document_drafts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_widget_configs" ADD CONSTRAINT "user_widget_configs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_custom_navs" ADD CONSTRAINT "user_custom_navs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "destination_tools" ADD CONSTRAINT "destination_tools_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "destinations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "destination_guides" ADD CONSTRAINT "destination_guides_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "destinations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "destination_services" ADD CONSTRAINT "destination_services_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "destinations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_onboarding_states" ADD CONSTRAINT "user_onboarding_states_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_favorites" ADD CONSTRAINT "user_favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_histories" ADD CONSTRAINT "document_histories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

