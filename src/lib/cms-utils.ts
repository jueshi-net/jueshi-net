/**
 * CMS Utilities — Local Markdown/MDX Engine
 *
 * Parses Markdown files from src/content/ with gray-matter frontmatter.
 * Supports:
 *   - countries/*.md → Destination guides
 *   - topics/*.md → Topic/专题 articles
 *   - Smart interlinking via tags, related_tools, related_docs, related_scenarios
 */

import * as fs from 'fs';
import * as path from 'path';
// gray-matter uses CJS export; import via require to avoid esModuleInterop issues
const matter = require('gray-matter');

// ── Base directories ──
const CONTENT_BASE = path.join(process.cwd(), 'src', 'content');
const COUNTRIES_DIR = path.join(CONTENT_BASE, 'countries');
const TOPICS_DIR = path.join(CONTENT_BASE, 'topics');

// ── Type definitions ──

export interface CountryFrontmatter {
  title: string;
  subtitle?: string;
  country: string; // e.g. "US", "CA", "GB"
  flag: string;
  regions?: string[];
  tags?: string[];
  updated?: string;
  thumbnail?: string;
  related_tools?: string[];
  related_docs?: string[];
  related_scenarios?: string[];
}

export interface TopicFrontmatter {
  title: string;
  subtitle?: string;
  slug?: string;
  tags?: string[];
  updated?: string;
  thumbnail?: string;
  related_tools?: string[];
  related_docs?: string[];
  related_scenarios?: string[];
}

export interface ParsedCountry {
  frontmatter: CountryFrontmatter;
  content: string;
  slug: string; // filename without .md
}

export interface ParsedTopic {
  frontmatter: TopicFrontmatter;
  content: string;
  slug: string; // filename without .md
}

export interface RelatedLink {
  title: string;
  url: string;
  icon: string;
  description: string;
  tag?: string;
}

// ── Core parsing functions ──

function ensureDirExists(dirPath: string): boolean {
  try {
    return fs.existsSync(dirPath);
  } catch {
    return false;
  }
}

function parseMarkdownFile<T>(filePath: string): { frontmatter: T; content: string } {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const parsed = matter(raw);
  return {
    frontmatter: parsed.data as T,
    content: parsed.content,
  };
}

// ── Country CMS ──

export function getAllCountrySlugs(): string[] {
  if (!ensureDirExists(COUNTRIES_DIR)) return [];
  return fs
    .readdirSync(COUNTRIES_DIR)
    .filter(f => f.endsWith('.md'))
    .map(f => f.replace(/\.md$/, ''));
}

export function getCountryBySlug(slug: string): ParsedCountry | null {
  const filePath = path.join(COUNTRIES_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const { frontmatter, content } = parseMarkdownFile<CountryFrontmatter>(filePath);
  return {
    frontmatter,
    content,
    slug: frontmatter.country?.toLowerCase() || slug,
  };
}

export function getAllCountries(): ParsedCountry[] {
  return getAllCountrySlugs()
    .map(slug => getCountryBySlug(slug))
    .filter((c): c is ParsedCountry => c !== null && !!c.frontmatter.country);
}

// ── Topic CMS ──

export function getAllTopicSlugs(): string[] {
  if (!ensureDirExists(TOPICS_DIR)) return [];
  return fs
    .readdirSync(TOPICS_DIR)
    .filter(f => f.endsWith('.md'))
    .map(f => f.replace(/\.md$/, ''));
}

export function getTopicBySlug(slug: string): ParsedTopic | null {
  const filePath = path.join(TOPICS_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const { frontmatter, content } = parseMarkdownFile<TopicFrontmatter>(filePath);
  return {
    frontmatter,
    content,
    slug: frontmatter.slug || slug,
  };
}

export function getAllTopics(): ParsedTopic[] {
  return getAllTopicSlugs()
    .map(slug => getTopicBySlug(slug))
    .filter((t): t is ParsedTopic => t !== null);
}
