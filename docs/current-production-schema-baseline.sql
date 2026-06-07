--
-- PostgreSQL database dump
--

\restrict QwCUuAnJhWYBq4R0jxqeZdFBIymU7bLJEuZ5ZTB3gWgLQVb0oo6sJxKCN7pTTxW

-- Dumped from database version 16.14 (Ubuntu 16.14-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.14 (Ubuntu 16.14-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Name: accounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.accounts (
    id text NOT NULL,
    "userId" text NOT NULL,
    type text NOT NULL,
    provider text NOT NULL,
    "providerAccountId" text NOT NULL,
    refresh_token text,
    access_token text,
    expires_at integer,
    token_type text,
    scope text,
    id_token text,
    session_state text
);


--
-- Name: ad_campaigns; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ad_campaigns (
    id text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    title text NOT NULL,
    ad_type text DEFAULT 'DIRECT'::text NOT NULL,
    image_url text,
    target_url text,
    code_snippet text,
    placements text[],
    target_countries text[] DEFAULT ARRAY[]::text[],
    is_active boolean DEFAULT true NOT NULL,
    impressions integer DEFAULT 0 NOT NULL,
    clicks integer DEFAULT 0 NOT NULL,
    start_date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    end_date timestamp(3) without time zone,
    priority integer DEFAULT 0 NOT NULL
);


--
-- Name: ai_usage_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_usage_logs (
    id text NOT NULL,
    "userId" text,
    "toolType" text NOT NULL,
    "inputHash" text,
    "outputTokens" integer,
    "costPoints" integer DEFAULT 0 NOT NULL,
    "ipHash" text,
    "userAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: article_tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.article_tags (
    id text NOT NULL,
    "articleId" text,
    tag text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: articles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.articles (
    id text NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    content text NOT NULL,
    excerpt text,
    "coverImage" text,
    author text,
    status text DEFAULT 'draft'::text NOT NULL,
    views integer DEFAULT 0 NOT NULL,
    "publishedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    category text,
    "seoTitle" text,
    "seoDescription" text,
    "relatedTools" text[] DEFAULT '{}'::text[]
);


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_logs (
    id text NOT NULL,
    "userId" text,
    action text NOT NULL,
    entity text,
    "entityId" text,
    details text,
    ip text,
    "userAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    icon text,
    color text,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "parentId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: daily_check_ins; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.daily_check_ins (
    id text NOT NULL,
    "userId" text NOT NULL,
    "dateKey" text NOT NULL,
    points integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: destination_guides; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.destination_guides (
    id text NOT NULL,
    destination_id text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    type text NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    website_url text
);


--
-- Name: destination_services; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.destination_services (
    id text NOT NULL,
    destination_id text NOT NULL,
    title text NOT NULL,
    category text NOT NULL,
    description text NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    website_url text
);


--
-- Name: destination_tools; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.destination_tools (
    id text NOT NULL,
    destination_id text NOT NULL,
    tool_slug text NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL
);


--
-- Name: destinations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.destinations (
    id text NOT NULL,
    slug text NOT NULL,
    name text NOT NULL,
    name_en text NOT NULL,
    currency text NOT NULL,
    region text NOT NULL,
    emoji text NOT NULL,
    hero_title text NOT NULL,
    hero_subtitle text NOT NULL,
    seo_title text NOT NULL,
    seo_description text NOT NULL,
    keywords text[],
    key_cities text[],
    user_count text DEFAULT '0'::text NOT NULL,
    doc_count text DEFAULT '0'::text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: document_histories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.document_histories (
    id text NOT NULL,
    user_id text NOT NULL,
    document_type text NOT NULL,
    document_data text NOT NULL,
    document_no text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: email_subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_subscriptions (
    id text NOT NULL,
    email text NOT NULL,
    token text,
    confirmed boolean DEFAULT false NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "confirmedAt" timestamp(3) without time zone,
    "expiresAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: event_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.event_logs (
    id text NOT NULL,
    "eventType" text DEFAULT ''::text NOT NULL,
    "toolName" text,
    action text,
    path text,
    "sessionId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: export_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.export_logs (
    id text NOT NULL,
    "userId" text,
    "exportType" text NOT NULL,
    "documentType" text,
    "ipHash" text,
    "userAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: favorites; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.favorites (
    id text NOT NULL,
    "userId" text NOT NULL,
    "linkId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: feedback; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.feedback (
    id text NOT NULL,
    "userId" text,
    type text NOT NULL,
    subject text NOT NULL,
    content text NOT NULL,
    page text,
    email text,
    status text DEFAULT 'pending'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: forum_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.forum_categories (
    id text NOT NULL,
    key text NOT NULL,
    name text NOT NULL,
    description text,
    icon_text text,
    color text,
    sort_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: forum_comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.forum_comments (
    id text NOT NULL,
    post_id text NOT NULL,
    user_id text NOT NULL,
    content text NOT NULL,
    status text DEFAULT 'published'::text NOT NULL,
    ip_hash text,
    user_agent text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: forum_posts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.forum_posts (
    id text NOT NULL,
    slug text NOT NULL,
    user_id text NOT NULL,
    category_id text NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    excerpt text,
    status text DEFAULT 'pending'::text NOT NULL,
    is_pinned boolean DEFAULT false NOT NULL,
    is_locked boolean DEFAULT false NOT NULL,
    view_count integer DEFAULT 0 NOT NULL,
    comment_count integer DEFAULT 0 NOT NULL,
    last_comment_at timestamp(3) without time zone,
    last_comment_user_id text,
    ip_hash text,
    user_agent text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: growth_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.growth_logs (
    id text NOT NULL,
    user_id text NOT NULL,
    type text NOT NULL,
    value integer NOT NULL,
    reason text,
    ref_type text,
    ref_id text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: homepage_configs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.homepage_configs (
    id text NOT NULL,
    key text NOT NULL,
    "valueJson" jsonb NOT NULL,
    updated_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: hs_codes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.hs_codes (
    id text NOT NULL,
    code text NOT NULL,
    level integer NOT NULL,
    "parentId" text,
    description text NOT NULL,
    "descriptionEn" text,
    category text,
    "taxRate" double precision,
    notes text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: hub_seo_contents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.hub_seo_contents (
    id text NOT NULL,
    country_code text,
    province_code text,
    logistics_intro text,
    tips jsonb,
    has_data boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: invite_codes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invite_codes (
    id text NOT NULL,
    code text NOT NULL,
    max_uses integer DEFAULT 100 NOT NULL,
    used_count integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    expires_at timestamp(3) without time zone,
    created_by text,
    note text
);


--
-- Name: link_tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.link_tags (
    id text NOT NULL,
    "linkId" text NOT NULL,
    "tagId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: links; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.links (
    id text NOT NULL,
    title text NOT NULL,
    url text NOT NULL,
    description text,
    icon text,
    "categoryName" text,
    "categoryId" text,
    "userId" text,
    "workspaceId" text,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "isPinned" boolean DEFAULT false NOT NULL,
    "isFeatured" boolean DEFAULT false NOT NULL,
    clicks integer DEFAULT 0 NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: memos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.memos (
    id text NOT NULL,
    title text NOT NULL,
    content text,
    category text,
    "userId" text NOT NULL,
    "isPinned" boolean DEFAULT false NOT NULL,
    color text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "dueDate" timestamp(3) without time zone
);


--
-- Name: newsletter_broadcasts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.newsletter_broadcasts (
    id text NOT NULL,
    subject text NOT NULL,
    content text NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    "sentCount" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id text NOT NULL,
    "userId" text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    type text DEFAULT 'info'::text NOT NULL,
    link text,
    "isRead" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    read_at timestamp(3) without time zone
);


--
-- Name: point_ledgers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.point_ledgers (
    id text NOT NULL,
    "userId" text NOT NULL,
    type text NOT NULL,
    points integer NOT NULL,
    reason text,
    "relatedId" text,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: postal_codes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.postal_codes (
    id text NOT NULL,
    country text,
    "countryCode" text,
    province text,
    city text,
    district text,
    "postalCode" text,
    "areaName" text,
    latitude double precision,
    longitude double precision,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "adminName1" text,
    "adminCode1" text,
    "adminName2" text,
    "adminCode2" text,
    accuracy integer,
    source text DEFAULT 'GeoNames'::text NOT NULL,
    "sourceUrl" text DEFAULT 'https://download.geonames.org/export/zip/'::text NOT NULL,
    "sourceVersion" text,
    "normalizedPostalCode" text
);


--
-- Name: resources; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.resources (
    id text NOT NULL,
    name text NOT NULL,
    url text NOT NULL,
    description text,
    category text NOT NULL,
    tags text[] DEFAULT '{}'::text[],
    "sourceType" text DEFAULT 'third-party'::text NOT NULL,
    usage text,
    disclaimer text,
    "isActive" boolean DEFAULT true NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    check_fail_count integer DEFAULT 0 NOT NULL,
    domain_age integer,
    favicon text,
    language text DEFAULT 'en'::text,
    last_checked timestamp(3) without time zone,
    quality_score integer DEFAULT 0 NOT NULL,
    rejected_reason text,
    icon_url text,
    is_ad boolean DEFAULT false NOT NULL
);


--
-- Name: reward_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reward_items (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    "costPoints" integer NOT NULL,
    "rewardType" text NOT NULL,
    "rewardValue" integer NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sessions (
    id text NOT NULL,
    "sessionToken" text NOT NULL,
    "userId" text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


--
-- Name: short_links; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.short_links (
    id text NOT NULL,
    code text NOT NULL,
    url text NOT NULL,
    "userId" text,
    title text,
    description text,
    "expiresAt" timestamp(3) without time zone,
    password text,
    clicks integer DEFAULT 0 NOT NULL,
    "lastClickAt" timestamp(3) without time zone,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: subscription_plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subscription_plans (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    price double precision NOT NULL,
    "interval" text NOT NULL,
    features text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subscriptions (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    price double precision NOT NULL,
    "interval" text NOT NULL,
    features text,
    "isActive" boolean DEFAULT true NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tags (
    id text NOT NULL,
    name text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: tool_document_drafts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tool_document_drafts (
    id text NOT NULL,
    user_id text NOT NULL,
    company_profile_id text,
    tool_key text NOT NULL,
    title text NOT NULL,
    data_json text NOT NULL,
    preview_json text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: tool_document_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tool_document_history (
    id text NOT NULL,
    user_id text NOT NULL,
    document_id text NOT NULL,
    snapshot_json text NOT NULL,
    action text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: tool_favorites; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tool_favorites (
    id text NOT NULL,
    "userId" text NOT NULL,
    "toolKey" text NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    tool_id text
);


--
-- Name: tool_metric_dailies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tool_metric_dailies (
    id text NOT NULL,
    tool_slug text NOT NULL,
    date date NOT NULL,
    views integer DEFAULT 0 NOT NULL,
    clicks integer DEFAULT 0 NOT NULL,
    saves integer DEFAULT 0 NOT NULL,
    favorites integer DEFAULT 0 NOT NULL
);


--
-- Name: tool_reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tool_reviews (
    id text NOT NULL,
    "userId" text NOT NULL,
    "toolKey" text NOT NULL,
    rating integer NOT NULL,
    content text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    "pointsAwarded" boolean DEFAULT false NOT NULL,
    "ipHash" text,
    "userAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "reviewedRewardedAt" timestamp(3) without time zone
);


--
-- Name: tools; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tools (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    icon text,
    category text DEFAULT 'general'::text NOT NULL,
    url text,
    route text,
    "isInternal" boolean DEFAULT true NOT NULL,
    "sourceType" text DEFAULT 'official'::text NOT NULL,
    popularity_score integer DEFAULT 0 NOT NULL,
    popularity_tag text,
    is_scenario_pack boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: topic_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.topic_items (
    id text NOT NULL,
    "topicId" text NOT NULL,
    name text NOT NULL,
    alias text,
    rating text,
    category text,
    "iconText" text,
    "iconBg" text,
    "iconFg" text,
    "installPriority" text,
    description text,
    analogy text,
    "suitableFor" text,
    "beginnerAdvice" text,
    "riskTip" text,
    "officialUrl" text,
    "isBeginnerFriendly" boolean DEFAULT false NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: topic_sections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.topic_sections (
    id text NOT NULL,
    "topicId" text NOT NULL,
    type text NOT NULL,
    title text,
    content text,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: topics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.topics (
    id text NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    subtitle text,
    summary text,
    status text DEFAULT 'draft'::text NOT NULL,
    "templateType" text DEFAULT 'rating_list'::text NOT NULL,
    "coverEmoji" text,
    "coverImage" text,
    "heroBadges" jsonb,
    "suitableFor" jsonb,
    tags jsonb,
    "youtubeUrl" text,
    "youtubeVideoId" text,
    "youtubeTitle" text,
    "youtubeDescription" text,
    "youtubeThumbnail" text,
    "seoTitle" text,
    "seoDescription" text,
    "publishedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: user_badge_awards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_badge_awards (
    id text NOT NULL,
    user_id text NOT NULL,
    badge_id text NOT NULL,
    reason text,
    awarded_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: user_badges; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_badges (
    id text NOT NULL,
    key text NOT NULL,
    name text NOT NULL,
    description text,
    icon_text text NOT NULL,
    color text NOT NULL,
    category text NOT NULL,
    condition_text text,
    is_active boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: user_company_profile_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_company_profile_history (
    id text NOT NULL,
    user_id text NOT NULL,
    profile_id text NOT NULL,
    snapshot_json text NOT NULL,
    action text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: user_company_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_company_profiles (
    id text NOT NULL,
    user_id text NOT NULL,
    profile_name text NOT NULL,
    company_name text NOT NULL,
    company_name_en text,
    contact_name text,
    phone text,
    email text,
    website text,
    address text,
    city_postal text,
    tax_id text,
    bank_cny_info text,
    bank_usd_info text,
    default_currency text DEFAULT 'USD'::text NOT NULL,
    logo_data_url text,
    logo_text text,
    is_default boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: user_custom_navs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_custom_navs (
    id text NOT NULL,
    user_id text NOT NULL,
    title text NOT NULL,
    url text NOT NULL,
    icon text,
    description text,
    category text DEFAULT 'general'::text,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: user_favorites; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_favorites (
    id text NOT NULL,
    user_id text NOT NULL,
    resource_type text NOT NULL,
    resource_url text NOT NULL,
    title text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: user_levels; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_levels (
    id text NOT NULL,
    key text NOT NULL,
    name text NOT NULL,
    min_growth integer NOT NULL,
    max_growth integer,
    description text,
    benefits jsonb,
    icon_text text NOT NULL,
    color text NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: user_onboarding_states; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_onboarding_states (
    id text NOT NULL,
    user_id text NOT NULL,
    workbench_dismissed boolean DEFAULT false NOT NULL,
    resource_dismissed boolean DEFAULT false NOT NULL,
    first_tool_used boolean DEFAULT false NOT NULL,
    first_favorite_added boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: user_preferences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_preferences (
    id text NOT NULL,
    "userId" text NOT NULL,
    theme text DEFAULT 'system'::text NOT NULL,
    language text DEFAULT 'zh-CN'::text NOT NULL,
    "emailNotif" boolean DEFAULT true NOT NULL,
    "compactMode" boolean DEFAULT false NOT NULL,
    "itemsPerPage" integer DEFAULT 20 NOT NULL,
    "defaultCategory" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: user_rewards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_rewards (
    id text NOT NULL,
    "userId" text NOT NULL,
    "rewardItemId" text NOT NULL,
    "rewardType" text NOT NULL,
    "rewardValue" integer NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    "expiresAt" timestamp(3) without time zone,
    "usedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: user_subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_subscriptions (
    id text NOT NULL,
    "userId" text NOT NULL,
    "subscriptionId" text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    "startDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "endDate" timestamp(3) without time zone,
    "cancelAtPeriodEnd" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: user_tasks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_tasks (
    id text NOT NULL,
    "userId" text NOT NULL,
    title text NOT NULL,
    description text,
    status text DEFAULT 'pending'::text NOT NULL,
    priority text DEFAULT 'normal'::text NOT NULL,
    category text,
    "dueDate" timestamp(3) without time zone,
    "completedAt" timestamp(3) without time zone,
    "pointsAwarded" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: user_widget_configs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_widget_configs (
    id text NOT NULL,
    user_id text NOT NULL,
    widget_key text NOT NULL,
    is_visible boolean DEFAULT true NOT NULL,
    "position" integer DEFAULT 0 NOT NULL,
    settings jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id text NOT NULL,
    name text,
    email text NOT NULL,
    "emailVerified" timestamp(3) without time zone,
    image text,
    password text,
    role text DEFAULT 'user'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    points integer DEFAULT 0 NOT NULL,
    "checkinStreak" integer DEFAULT 0 NOT NULL,
    "lastCheckinDate" text,
    "memberUntil" timestamp(3) without time zone,
    profile_type text,
    growth_value integer DEFAULT 0 NOT NULL,
    level_key text DEFAULT 'lv1'::character varying,
    badges text[] DEFAULT ARRAY[]::text[],
    stripe_current_period_end timestamp(3) without time zone,
    stripe_customer_id text,
    stripe_price_id text,
    stripe_subscription_id text,
    is_premium boolean DEFAULT false NOT NULL
);


--
-- Name: verification_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.verification_tokens (
    identifier text NOT NULL,
    token text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


--
-- Name: webhooks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.webhooks (
    id text NOT NULL,
    "userId" text,
    url text NOT NULL,
    events text NOT NULL,
    secret text,
    "isActive" boolean DEFAULT true NOT NULL,
    "lastTriggered" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: workbench_links; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workbench_links (
    id text NOT NULL,
    "userId" text NOT NULL,
    title text NOT NULL,
    url text NOT NULL,
    description text,
    "iconUrl" text,
    category text,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: workspace_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workspace_members (
    id text NOT NULL,
    "workspaceId" text NOT NULL,
    "userId" text NOT NULL,
    role text DEFAULT 'member'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: workspaces; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workspaces (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    icon text,
    "ownerId" text,
    "isPublic" boolean DEFAULT false NOT NULL,
    slug text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: accounts accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (id);


--
-- Name: ad_campaigns ad_campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ad_campaigns
    ADD CONSTRAINT ad_campaigns_pkey PRIMARY KEY (id);


--
-- Name: ai_usage_logs ai_usage_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_usage_logs
    ADD CONSTRAINT ai_usage_logs_pkey PRIMARY KEY (id);


--
-- Name: article_tags article_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.article_tags
    ADD CONSTRAINT article_tags_pkey PRIMARY KEY (id);


--
-- Name: articles articles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: daily_check_ins daily_check_ins_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_check_ins
    ADD CONSTRAINT daily_check_ins_pkey PRIMARY KEY (id);


--
-- Name: destination_guides destination_guides_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.destination_guides
    ADD CONSTRAINT destination_guides_pkey PRIMARY KEY (id);


--
-- Name: destination_services destination_services_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.destination_services
    ADD CONSTRAINT destination_services_pkey PRIMARY KEY (id);


--
-- Name: destination_tools destination_tools_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.destination_tools
    ADD CONSTRAINT destination_tools_pkey PRIMARY KEY (id);


--
-- Name: destinations destinations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.destinations
    ADD CONSTRAINT destinations_pkey PRIMARY KEY (id);


--
-- Name: document_histories document_histories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_histories
    ADD CONSTRAINT document_histories_pkey PRIMARY KEY (id);


--
-- Name: email_subscriptions email_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_subscriptions
    ADD CONSTRAINT email_subscriptions_pkey PRIMARY KEY (id);


--
-- Name: event_logs event_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_logs
    ADD CONSTRAINT event_logs_pkey PRIMARY KEY (id);


--
-- Name: export_logs export_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.export_logs
    ADD CONSTRAINT export_logs_pkey PRIMARY KEY (id);


--
-- Name: favorites favorites_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_pkey PRIMARY KEY (id);


--
-- Name: feedback feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feedback
    ADD CONSTRAINT feedback_pkey PRIMARY KEY (id);


--
-- Name: forum_categories forum_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.forum_categories
    ADD CONSTRAINT forum_categories_pkey PRIMARY KEY (id);


--
-- Name: forum_comments forum_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.forum_comments
    ADD CONSTRAINT forum_comments_pkey PRIMARY KEY (id);


--
-- Name: forum_posts forum_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.forum_posts
    ADD CONSTRAINT forum_posts_pkey PRIMARY KEY (id);


--
-- Name: growth_logs growth_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.growth_logs
    ADD CONSTRAINT growth_logs_pkey PRIMARY KEY (id);


--
-- Name: homepage_configs homepage_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.homepage_configs
    ADD CONSTRAINT homepage_configs_pkey PRIMARY KEY (id);


--
-- Name: hs_codes hs_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hs_codes
    ADD CONSTRAINT hs_codes_pkey PRIMARY KEY (id);


--
-- Name: hub_seo_contents hub_seo_contents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hub_seo_contents
    ADD CONSTRAINT hub_seo_contents_pkey PRIMARY KEY (id);


--
-- Name: invite_codes invite_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invite_codes
    ADD CONSTRAINT invite_codes_pkey PRIMARY KEY (id);


--
-- Name: link_tags link_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.link_tags
    ADD CONSTRAINT link_tags_pkey PRIMARY KEY (id);


--
-- Name: links links_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.links
    ADD CONSTRAINT links_pkey PRIMARY KEY (id);


--
-- Name: memos memos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.memos
    ADD CONSTRAINT memos_pkey PRIMARY KEY (id);


--
-- Name: newsletter_broadcasts newsletter_broadcasts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.newsletter_broadcasts
    ADD CONSTRAINT newsletter_broadcasts_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: point_ledgers point_ledgers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.point_ledgers
    ADD CONSTRAINT point_ledgers_pkey PRIMARY KEY (id);


--
-- Name: postal_codes postal_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.postal_codes
    ADD CONSTRAINT postal_codes_pkey PRIMARY KEY (id);


--
-- Name: resources resources_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resources
    ADD CONSTRAINT resources_pkey PRIMARY KEY (id);


--
-- Name: reward_items reward_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reward_items
    ADD CONSTRAINT reward_items_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: short_links short_links_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.short_links
    ADD CONSTRAINT short_links_pkey PRIMARY KEY (id);


--
-- Name: subscription_plans subscription_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscription_plans
    ADD CONSTRAINT subscription_plans_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- Name: tool_document_drafts tool_document_drafts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tool_document_drafts
    ADD CONSTRAINT tool_document_drafts_pkey PRIMARY KEY (id);


--
-- Name: tool_document_history tool_document_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tool_document_history
    ADD CONSTRAINT tool_document_history_pkey PRIMARY KEY (id);


--
-- Name: tool_favorites tool_favorites_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tool_favorites
    ADD CONSTRAINT tool_favorites_pkey PRIMARY KEY (id);


--
-- Name: tool_metric_dailies tool_metric_dailies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tool_metric_dailies
    ADD CONSTRAINT tool_metric_dailies_pkey PRIMARY KEY (id);


--
-- Name: tool_reviews tool_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tool_reviews
    ADD CONSTRAINT tool_reviews_pkey PRIMARY KEY (id);


--
-- Name: tools tools_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tools
    ADD CONSTRAINT tools_pkey PRIMARY KEY (id);


--
-- Name: topic_items topic_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.topic_items
    ADD CONSTRAINT topic_items_pkey PRIMARY KEY (id);


--
-- Name: topic_sections topic_sections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.topic_sections
    ADD CONSTRAINT topic_sections_pkey PRIMARY KEY (id);


--
-- Name: topics topics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.topics
    ADD CONSTRAINT topics_pkey PRIMARY KEY (id);


--
-- Name: topics topics_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.topics
    ADD CONSTRAINT topics_slug_key UNIQUE (slug);


--
-- Name: user_badge_awards user_badge_awards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_badge_awards
    ADD CONSTRAINT user_badge_awards_pkey PRIMARY KEY (id);


--
-- Name: user_badges user_badges_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_badges
    ADD CONSTRAINT user_badges_pkey PRIMARY KEY (id);


--
-- Name: user_company_profile_history user_company_profile_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_company_profile_history
    ADD CONSTRAINT user_company_profile_history_pkey PRIMARY KEY (id);


--
-- Name: user_company_profiles user_company_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_company_profiles
    ADD CONSTRAINT user_company_profiles_pkey PRIMARY KEY (id);


--
-- Name: user_custom_navs user_custom_navs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_custom_navs
    ADD CONSTRAINT user_custom_navs_pkey PRIMARY KEY (id);


--
-- Name: user_favorites user_favorites_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_favorites
    ADD CONSTRAINT user_favorites_pkey PRIMARY KEY (id);


--
-- Name: user_levels user_levels_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_levels
    ADD CONSTRAINT user_levels_pkey PRIMARY KEY (id);


--
-- Name: user_onboarding_states user_onboarding_states_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_onboarding_states
    ADD CONSTRAINT user_onboarding_states_pkey PRIMARY KEY (id);


--
-- Name: user_preferences user_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_preferences
    ADD CONSTRAINT user_preferences_pkey PRIMARY KEY (id);


--
-- Name: user_rewards user_rewards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_rewards
    ADD CONSTRAINT user_rewards_pkey PRIMARY KEY (id);


--
-- Name: user_subscriptions user_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_subscriptions
    ADD CONSTRAINT user_subscriptions_pkey PRIMARY KEY (id);


--
-- Name: user_tasks user_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_tasks
    ADD CONSTRAINT user_tasks_pkey PRIMARY KEY (id);


--
-- Name: user_widget_configs user_widget_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_widget_configs
    ADD CONSTRAINT user_widget_configs_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: webhooks webhooks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.webhooks
    ADD CONSTRAINT webhooks_pkey PRIMARY KEY (id);


--
-- Name: workbench_links workbench_links_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workbench_links
    ADD CONSTRAINT workbench_links_pkey PRIMARY KEY (id);


--
-- Name: workspace_members workspace_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workspace_members
    ADD CONSTRAINT workspace_members_pkey PRIMARY KEY (id);


--
-- Name: workspaces workspaces_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workspaces
    ADD CONSTRAINT workspaces_pkey PRIMARY KEY (id);


--
-- Name: accounts_provider_providerAccountId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON public.accounts USING btree (provider, "providerAccountId");


--
-- Name: ad_campaigns_is_active_ad_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ad_campaigns_is_active_ad_type_idx ON public.ad_campaigns USING btree (is_active, ad_type);


--
-- Name: ad_campaigns_is_active_start_date_end_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ad_campaigns_is_active_start_date_end_date_idx ON public.ad_campaigns USING btree (is_active, start_date, end_date);


--
-- Name: ad_campaigns_title_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ad_campaigns_title_key ON public.ad_campaigns USING btree (title);


--
-- Name: ai_usage_logs_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ai_usage_logs_createdAt_idx" ON public.ai_usage_logs USING btree ("createdAt");


--
-- Name: ai_usage_logs_toolType_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ai_usage_logs_toolType_idx" ON public.ai_usage_logs USING btree ("toolType");


--
-- Name: ai_usage_logs_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ai_usage_logs_userId_idx" ON public.ai_usage_logs USING btree ("userId");


--
-- Name: articles_category_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX articles_category_idx ON public.articles USING btree (category);


--
-- Name: articles_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX articles_slug_key ON public.articles USING btree (slug);


--
-- Name: articles_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX articles_status_idx ON public.articles USING btree (status);


--
-- Name: audit_logs_action_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX audit_logs_action_idx ON public.audit_logs USING btree (action);


--
-- Name: audit_logs_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "audit_logs_createdAt_idx" ON public.audit_logs USING btree ("createdAt");


--
-- Name: audit_logs_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "audit_logs_userId_idx" ON public.audit_logs USING btree ("userId");


--
-- Name: categories_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX categories_name_key ON public.categories USING btree (name);


--
-- Name: categories_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX categories_slug_key ON public.categories USING btree (slug);


--
-- Name: daily_check_ins_dateKey_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "daily_check_ins_dateKey_idx" ON public.daily_check_ins USING btree ("dateKey");


--
-- Name: daily_check_ins_userId_dateKey_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "daily_check_ins_userId_dateKey_key" ON public.daily_check_ins USING btree ("userId", "dateKey");


--
-- Name: daily_check_ins_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "daily_check_ins_userId_idx" ON public.daily_check_ins USING btree ("userId");


--
-- Name: destination_guides_destination_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX destination_guides_destination_id_idx ON public.destination_guides USING btree (destination_id);


--
-- Name: destination_guides_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX destination_guides_type_idx ON public.destination_guides USING btree (type);


--
-- Name: destination_services_category_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX destination_services_category_idx ON public.destination_services USING btree (category);


--
-- Name: destination_services_destination_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX destination_services_destination_id_idx ON public.destination_services USING btree (destination_id);


--
-- Name: destination_tools_destination_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX destination_tools_destination_id_idx ON public.destination_tools USING btree (destination_id);


--
-- Name: destination_tools_destination_id_tool_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX destination_tools_destination_id_tool_slug_key ON public.destination_tools USING btree (destination_id, tool_slug);


--
-- Name: destinations_is_active_region_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX destinations_is_active_region_idx ON public.destinations USING btree (is_active, region);


--
-- Name: destinations_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX destinations_slug_idx ON public.destinations USING btree (slug);


--
-- Name: destinations_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX destinations_slug_key ON public.destinations USING btree (slug);


--
-- Name: document_histories_user_id_document_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX document_histories_user_id_document_type_idx ON public.document_histories USING btree (user_id, document_type);


--
-- Name: document_histories_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX document_histories_user_id_idx ON public.document_histories USING btree (user_id);


--
-- Name: email_subscriptions_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX email_subscriptions_email_key ON public.email_subscriptions USING btree (email);


--
-- Name: event_logs_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "event_logs_createdAt_idx" ON public.event_logs USING btree ("createdAt");


--
-- Name: event_logs_eventType_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "event_logs_eventType_idx" ON public.event_logs USING btree ("eventType");


--
-- Name: event_logs_sessionId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "event_logs_sessionId_idx" ON public.event_logs USING btree ("sessionId");


--
-- Name: event_logs_toolName_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "event_logs_toolName_idx" ON public.event_logs USING btree ("toolName");


--
-- Name: export_logs_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "export_logs_createdAt_idx" ON public.export_logs USING btree ("createdAt");


--
-- Name: export_logs_exportType_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "export_logs_exportType_idx" ON public.export_logs USING btree ("exportType");


--
-- Name: export_logs_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "export_logs_userId_idx" ON public.export_logs USING btree ("userId");


--
-- Name: favorites_userId_linkId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "favorites_userId_linkId_key" ON public.favorites USING btree ("userId", "linkId");


--
-- Name: feedback_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX feedback_status_idx ON public.feedback USING btree (status);


--
-- Name: feedback_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "feedback_userId_idx" ON public.feedback USING btree ("userId");


--
-- Name: forum_categories_is_active_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX forum_categories_is_active_idx ON public.forum_categories USING btree (is_active);


--
-- Name: forum_categories_key_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX forum_categories_key_idx ON public.forum_categories USING btree (key);


--
-- Name: forum_categories_key_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX forum_categories_key_key ON public.forum_categories USING btree (key);


--
-- Name: forum_comments_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX forum_comments_created_at_idx ON public.forum_comments USING btree (created_at DESC);


--
-- Name: forum_comments_post_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX forum_comments_post_id_idx ON public.forum_comments USING btree (post_id);


--
-- Name: forum_comments_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX forum_comments_status_idx ON public.forum_comments USING btree (status);


--
-- Name: forum_comments_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX forum_comments_user_id_idx ON public.forum_comments USING btree (user_id);


--
-- Name: forum_posts_category_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX forum_posts_category_id_idx ON public.forum_posts USING btree (category_id);


--
-- Name: forum_posts_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX forum_posts_created_at_idx ON public.forum_posts USING btree (created_at DESC);


--
-- Name: forum_posts_is_pinned_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX forum_posts_is_pinned_idx ON public.forum_posts USING btree (is_pinned);


--
-- Name: forum_posts_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX forum_posts_slug_idx ON public.forum_posts USING btree (slug);


--
-- Name: forum_posts_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX forum_posts_slug_key ON public.forum_posts USING btree (slug);


--
-- Name: forum_posts_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX forum_posts_status_idx ON public.forum_posts USING btree (status);


--
-- Name: forum_posts_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX forum_posts_user_id_idx ON public.forum_posts USING btree (user_id);


--
-- Name: growth_logs_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX growth_logs_created_at_idx ON public.growth_logs USING btree (created_at);


--
-- Name: growth_logs_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX growth_logs_type_idx ON public.growth_logs USING btree (type);


--
-- Name: growth_logs_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX growth_logs_user_id_idx ON public.growth_logs USING btree (user_id);


--
-- Name: homepage_configs_key_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX homepage_configs_key_key ON public.homepage_configs USING btree (key);


--
-- Name: hs_codes_category_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX hs_codes_category_idx ON public.hs_codes USING btree (category);


--
-- Name: hs_codes_description_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX hs_codes_description_idx ON public.hs_codes USING btree (description);


--
-- Name: hub_seo_contents_country_code_province_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX hub_seo_contents_country_code_province_code_key ON public.hub_seo_contents USING btree (country_code, province_code);


--
-- Name: hub_seo_contents_has_data_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX hub_seo_contents_has_data_idx ON public.hub_seo_contents USING btree (has_data);


--
-- Name: invite_codes_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX invite_codes_code_key ON public.invite_codes USING btree (code);


--
-- Name: invite_codes_expires_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX invite_codes_expires_at_idx ON public.invite_codes USING btree (expires_at);


--
-- Name: invite_codes_is_active_code_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX invite_codes_is_active_code_idx ON public.invite_codes USING btree (is_active, code);


--
-- Name: link_tags_linkId_tagId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "link_tags_linkId_tagId_key" ON public.link_tags USING btree ("linkId", "tagId");


--
-- Name: links_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "links_userId_idx" ON public.links USING btree ("userId");


--
-- Name: links_workspaceId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "links_workspaceId_idx" ON public.links USING btree ("workspaceId");


--
-- Name: memos_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "memos_userId_idx" ON public.memos USING btree ("userId");


--
-- Name: notifications_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notifications_type_idx ON public.notifications USING btree (type);


--
-- Name: notifications_userId_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "notifications_userId_createdAt_idx" ON public.notifications USING btree ("userId", "createdAt" DESC);


--
-- Name: notifications_userId_isRead_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "notifications_userId_isRead_idx" ON public.notifications USING btree ("userId", "isRead");


--
-- Name: notifications_userId_read_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "notifications_userId_read_at_idx" ON public.notifications USING btree ("userId", read_at);


--
-- Name: point_ledgers_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "point_ledgers_createdAt_idx" ON public.point_ledgers USING btree ("createdAt");


--
-- Name: point_ledgers_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX point_ledgers_type_idx ON public.point_ledgers USING btree (type);


--
-- Name: point_ledgers_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "point_ledgers_userId_idx" ON public.point_ledgers USING btree ("userId");


--
-- Name: postal_codes_adminCode1_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "postal_codes_adminCode1_idx" ON public.postal_codes USING btree ("adminCode1");


--
-- Name: postal_codes_code_norm_prefix_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX postal_codes_code_norm_prefix_idx ON public.postal_codes USING btree ("countryCode", "normalizedPostalCode" text_pattern_ops) WHERE ("isActive" = true);


--
-- Name: postal_codes_countryCode_city_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "postal_codes_countryCode_city_idx" ON public.postal_codes USING btree ("countryCode", city);


--
-- Name: postal_codes_countryCode_postalCode_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "postal_codes_countryCode_postalCode_idx" ON public.postal_codes USING btree ("countryCode", "postalCode");


--
-- Name: postal_codes_country_city_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX postal_codes_country_city_idx ON public.postal_codes USING btree (country, city);


--
-- Name: postal_codes_country_code_normalized_postal_code_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX postal_codes_country_code_normalized_postal_code_idx ON public.postal_codes USING btree ("countryCode", "normalizedPostalCode");


--
-- Name: postal_codes_normalizedPostalCode_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "postal_codes_normalizedPostalCode_idx" ON public.postal_codes USING btree ("normalizedPostalCode");


--
-- Name: postal_codes_postalCode_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "postal_codes_postalCode_idx" ON public.postal_codes USING btree ("postalCode");


--
-- Name: resources_category_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX resources_category_idx ON public.resources USING btree (category);


--
-- Name: resources_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "resources_isActive_idx" ON public.resources USING btree ("isActive");


--
-- Name: resources_quality_score_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX resources_quality_score_idx ON public.resources USING btree (quality_score);


--
-- Name: resources_url_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX resources_url_key ON public.resources USING btree (url);


--
-- Name: reward_items_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX reward_items_code_key ON public.reward_items USING btree (code);


--
-- Name: reward_items_enabled_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX reward_items_enabled_idx ON public.reward_items USING btree (enabled);


--
-- Name: reward_items_sortOrder_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "reward_items_sortOrder_idx" ON public.reward_items USING btree ("sortOrder");


--
-- Name: sessions_sessionToken_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "sessions_sessionToken_key" ON public.sessions USING btree ("sessionToken");


--
-- Name: short_links_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX short_links_code_key ON public.short_links USING btree (code);


--
-- Name: short_links_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "short_links_userId_idx" ON public.short_links USING btree ("userId");


--
-- Name: subscription_plans_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX subscription_plans_name_key ON public.subscription_plans USING btree (name);


--
-- Name: subscriptions_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX subscriptions_name_key ON public.subscriptions USING btree (name);


--
-- Name: subscriptions_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX subscriptions_slug_key ON public.subscriptions USING btree (slug);


--
-- Name: tags_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX tags_name_key ON public.tags USING btree (name);


--
-- Name: tool_document_drafts_company_profile_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tool_document_drafts_company_profile_id_idx ON public.tool_document_drafts USING btree (company_profile_id);


--
-- Name: tool_document_drafts_tool_key_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tool_document_drafts_tool_key_idx ON public.tool_document_drafts USING btree (tool_key);


--
-- Name: tool_document_drafts_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tool_document_drafts_user_id_idx ON public.tool_document_drafts USING btree (user_id);


--
-- Name: tool_document_history_document_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tool_document_history_document_id_idx ON public.tool_document_history USING btree (document_id);


--
-- Name: tool_document_history_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tool_document_history_user_id_idx ON public.tool_document_history USING btree (user_id);


--
-- Name: tool_favorites_tool_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tool_favorites_tool_id_idx ON public.tool_favorites USING btree (tool_id);


--
-- Name: tool_favorites_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "tool_favorites_userId_idx" ON public.tool_favorites USING btree ("userId");


--
-- Name: tool_favorites_userId_toolKey_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "tool_favorites_userId_toolKey_key" ON public.tool_favorites USING btree ("userId", "toolKey");


--
-- Name: tool_metric_dailies_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tool_metric_dailies_date_idx ON public.tool_metric_dailies USING btree (date);


--
-- Name: tool_metric_dailies_tool_slug_date_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX tool_metric_dailies_tool_slug_date_key ON public.tool_metric_dailies USING btree (tool_slug, date);


--
-- Name: tool_metric_dailies_tool_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tool_metric_dailies_tool_slug_idx ON public.tool_metric_dailies USING btree (tool_slug);


--
-- Name: tool_reviews_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "tool_reviews_createdAt_idx" ON public.tool_reviews USING btree ("createdAt");


--
-- Name: tool_reviews_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tool_reviews_status_idx ON public.tool_reviews USING btree (status);


--
-- Name: tool_reviews_toolKey_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "tool_reviews_toolKey_idx" ON public.tool_reviews USING btree ("toolKey");


--
-- Name: tool_reviews_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "tool_reviews_userId_idx" ON public.tool_reviews USING btree ("userId");


--
-- Name: tools_category_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tools_category_idx ON public.tools USING btree (category);


--
-- Name: tools_is_active_popularity_score_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tools_is_active_popularity_score_idx ON public.tools USING btree (is_active, popularity_score DESC);


--
-- Name: tools_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tools_slug_idx ON public.tools USING btree (slug);


--
-- Name: tools_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX tools_slug_key ON public.tools USING btree (slug);


--
-- Name: topic_items_sortOrder_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "topic_items_sortOrder_idx" ON public.topic_items USING btree ("sortOrder");


--
-- Name: topic_items_topicId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "topic_items_topicId_idx" ON public.topic_items USING btree ("topicId");


--
-- Name: topic_sections_sortOrder_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "topic_sections_sortOrder_idx" ON public.topic_sections USING btree ("sortOrder");


--
-- Name: topic_sections_topicId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "topic_sections_topicId_idx" ON public.topic_sections USING btree ("topicId");


--
-- Name: topics_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX topics_slug_idx ON public.topics USING btree (slug);


--
-- Name: topics_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX topics_status_idx ON public.topics USING btree (status);


--
-- Name: user_badge_awards_badge_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_badge_awards_badge_id_idx ON public.user_badge_awards USING btree (badge_id);


--
-- Name: user_badge_awards_user_id_badge_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX user_badge_awards_user_id_badge_id_key ON public.user_badge_awards USING btree (user_id, badge_id);


--
-- Name: user_badge_awards_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_badge_awards_user_id_idx ON public.user_badge_awards USING btree (user_id);


--
-- Name: user_badges_key_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX user_badges_key_key ON public.user_badges USING btree (key);


--
-- Name: user_company_profile_history_profile_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_company_profile_history_profile_id_idx ON public.user_company_profile_history USING btree (profile_id);


--
-- Name: user_company_profile_history_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_company_profile_history_user_id_idx ON public.user_company_profile_history USING btree (user_id);


--
-- Name: user_company_profiles_is_default_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_company_profiles_is_default_idx ON public.user_company_profiles USING btree (is_default);


--
-- Name: user_company_profiles_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_company_profiles_user_id_idx ON public.user_company_profiles USING btree (user_id);


--
-- Name: user_custom_navs_category_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_custom_navs_category_idx ON public.user_custom_navs USING btree (category);


--
-- Name: user_custom_navs_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_custom_navs_user_id_idx ON public.user_custom_navs USING btree (user_id);


--
-- Name: user_favorites_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_favorites_user_id_idx ON public.user_favorites USING btree (user_id);


--
-- Name: user_favorites_user_id_resource_url_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX user_favorites_user_id_resource_url_key ON public.user_favorites USING btree (user_id, resource_url);


--
-- Name: user_levels_key_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX user_levels_key_key ON public.user_levels USING btree (key);


--
-- Name: user_onboarding_states_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_onboarding_states_user_id_idx ON public.user_onboarding_states USING btree (user_id);


--
-- Name: user_onboarding_states_user_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX user_onboarding_states_user_id_key ON public.user_onboarding_states USING btree (user_id);


--
-- Name: user_preferences_userId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "user_preferences_userId_key" ON public.user_preferences USING btree ("userId");


--
-- Name: user_rewards_expiresAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "user_rewards_expiresAt_idx" ON public.user_rewards USING btree ("expiresAt");


--
-- Name: user_rewards_rewardType_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "user_rewards_rewardType_idx" ON public.user_rewards USING btree ("rewardType");


--
-- Name: user_rewards_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_rewards_status_idx ON public.user_rewards USING btree (status);


--
-- Name: user_rewards_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "user_rewards_userId_idx" ON public.user_rewards USING btree ("userId");


--
-- Name: user_subscriptions_userId_subscriptionId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "user_subscriptions_userId_subscriptionId_key" ON public.user_subscriptions USING btree ("userId", "subscriptionId");


--
-- Name: user_tasks_dueDate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "user_tasks_dueDate_idx" ON public.user_tasks USING btree ("dueDate");


--
-- Name: user_tasks_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_tasks_status_idx ON public.user_tasks USING btree (status);


--
-- Name: user_tasks_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "user_tasks_userId_idx" ON public.user_tasks USING btree ("userId");


--
-- Name: user_widget_configs_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_widget_configs_user_id_idx ON public.user_widget_configs USING btree (user_id);


--
-- Name: user_widget_configs_user_id_widget_key_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX user_widget_configs_user_id_widget_key_key ON public.user_widget_configs USING btree (user_id, widget_key);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: users_stripe_customer_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_stripe_customer_id_key ON public.users USING btree (stripe_customer_id);


--
-- Name: users_stripe_subscription_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_stripe_subscription_id_key ON public.users USING btree (stripe_subscription_id);


--
-- Name: verification_tokens_identifier_token_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX verification_tokens_identifier_token_key ON public.verification_tokens USING btree (identifier, token);


--
-- Name: verification_tokens_token_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX verification_tokens_token_key ON public.verification_tokens USING btree (token);


--
-- Name: webhooks_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "webhooks_userId_idx" ON public.webhooks USING btree ("userId");


--
-- Name: workbench_links_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "workbench_links_userId_idx" ON public.workbench_links USING btree ("userId");


--
-- Name: workspace_members_workspaceId_userId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "workspace_members_workspaceId_userId_key" ON public.workspace_members USING btree ("workspaceId", "userId");


--
-- Name: workspaces_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX workspaces_slug_key ON public.workspaces USING btree (slug);


--
-- Name: accounts accounts_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ai_usage_logs ai_usage_logs_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_usage_logs
    ADD CONSTRAINT "ai_usage_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: audit_logs audit_logs_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: categories categories_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT "categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: daily_check_ins daily_check_ins_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_check_ins
    ADD CONSTRAINT "daily_check_ins_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: destination_guides destination_guides_destination_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.destination_guides
    ADD CONSTRAINT destination_guides_destination_id_fkey FOREIGN KEY (destination_id) REFERENCES public.destinations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: destination_services destination_services_destination_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.destination_services
    ADD CONSTRAINT destination_services_destination_id_fkey FOREIGN KEY (destination_id) REFERENCES public.destinations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: destination_tools destination_tools_destination_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.destination_tools
    ADD CONSTRAINT destination_tools_destination_id_fkey FOREIGN KEY (destination_id) REFERENCES public.destinations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: document_histories document_histories_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_histories
    ADD CONSTRAINT document_histories_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: favorites favorites_linkId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT "favorites_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES public.links(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: favorites favorites_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT "favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: feedback feedback_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feedback
    ADD CONSTRAINT "feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: forum_comments forum_comments_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.forum_comments
    ADD CONSTRAINT forum_comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.forum_posts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: forum_comments forum_comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.forum_comments
    ADD CONSTRAINT forum_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: forum_posts forum_posts_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.forum_posts
    ADD CONSTRAINT forum_posts_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.forum_categories(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: forum_posts forum_posts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.forum_posts
    ADD CONSTRAINT forum_posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: growth_logs growth_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.growth_logs
    ADD CONSTRAINT growth_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: hs_codes hs_codes_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hs_codes
    ADD CONSTRAINT "hs_codes_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public.hs_codes(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: link_tags link_tags_linkId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.link_tags
    ADD CONSTRAINT "link_tags_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES public.links(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: link_tags link_tags_tagId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.link_tags
    ADD CONSTRAINT "link_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES public.tags(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: links links_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.links
    ADD CONSTRAINT "links_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: links links_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.links
    ADD CONSTRAINT "links_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: links links_workspaceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.links
    ADD CONSTRAINT "links_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES public.workspaces(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: memos memos_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.memos
    ADD CONSTRAINT "memos_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notifications notifications_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: point_ledgers point_ledgers_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.point_ledgers
    ADD CONSTRAINT "point_ledgers_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sessions sessions_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: short_links short_links_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.short_links
    ADD CONSTRAINT "short_links_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tool_document_drafts tool_document_drafts_company_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tool_document_drafts
    ADD CONSTRAINT tool_document_drafts_company_profile_id_fkey FOREIGN KEY (company_profile_id) REFERENCES public.user_company_profiles(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tool_document_drafts tool_document_drafts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tool_document_drafts
    ADD CONSTRAINT tool_document_drafts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tool_document_history tool_document_history_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tool_document_history
    ADD CONSTRAINT tool_document_history_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.tool_document_drafts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tool_favorites tool_favorites_tool_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tool_favorites
    ADD CONSTRAINT tool_favorites_tool_id_fkey FOREIGN KEY (tool_id) REFERENCES public.tools(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tool_favorites tool_favorites_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tool_favorites
    ADD CONSTRAINT "tool_favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tool_reviews tool_reviews_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tool_reviews
    ADD CONSTRAINT "tool_reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: topic_items topic_items_topicId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.topic_items
    ADD CONSTRAINT "topic_items_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES public.topics(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: topic_sections topic_sections_topicId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.topic_sections
    ADD CONSTRAINT "topic_sections_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES public.topics(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_badge_awards user_badge_awards_badge_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_badge_awards
    ADD CONSTRAINT user_badge_awards_badge_id_fkey FOREIGN KEY (badge_id) REFERENCES public.user_badges(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_badge_awards user_badge_awards_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_badge_awards
    ADD CONSTRAINT user_badge_awards_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_company_profile_history user_company_profile_history_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_company_profile_history
    ADD CONSTRAINT user_company_profile_history_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.user_company_profiles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_company_profiles user_company_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_company_profiles
    ADD CONSTRAINT user_company_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_custom_navs user_custom_navs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_custom_navs
    ADD CONSTRAINT user_custom_navs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_favorites user_favorites_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_favorites
    ADD CONSTRAINT user_favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_onboarding_states user_onboarding_states_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_onboarding_states
    ADD CONSTRAINT user_onboarding_states_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_preferences user_preferences_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_preferences
    ADD CONSTRAINT "user_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_rewards user_rewards_rewardItemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_rewards
    ADD CONSTRAINT "user_rewards_rewardItemId_fkey" FOREIGN KEY ("rewardItemId") REFERENCES public.reward_items(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: user_rewards user_rewards_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_rewards
    ADD CONSTRAINT "user_rewards_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_subscriptions user_subscriptions_subscriptionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_subscriptions
    ADD CONSTRAINT "user_subscriptions_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES public.subscriptions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_subscriptions user_subscriptions_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_subscriptions
    ADD CONSTRAINT "user_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_tasks user_tasks_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_tasks
    ADD CONSTRAINT "user_tasks_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_widget_configs user_widget_configs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_widget_configs
    ADD CONSTRAINT user_widget_configs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: webhooks webhooks_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.webhooks
    ADD CONSTRAINT "webhooks_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: workbench_links workbench_links_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workbench_links
    ADD CONSTRAINT "workbench_links_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: workspace_members workspace_members_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workspace_members
    ADD CONSTRAINT "workspace_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: workspace_members workspace_members_workspaceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workspace_members
    ADD CONSTRAINT "workspace_members_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES public.workspaces(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict QwCUuAnJhWYBq4R0jxqeZdFBIymU7bLJEuZ5ZTB3gWgLQVb0oo6sJxKCN7pTTxW

