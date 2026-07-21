/**
 * Shared types and style helpers for resource portal components.
 */

export interface ResourceItem {
  id: string;
  name: string;
  url: string;
  description: string | null;
  category: string;
  tags: string[];
  sourceType: string;
  isActive: boolean;
  favicon: string | null;
  iconUrl: string | null;
  isAd: boolean;
  qualityScore: number;
  sortOrder: number;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryCount {
  id: string;
  count: number;
}

export type SortOption = 'default' | 'quality' | 'latest' | 'name';

/** Badge (background + text + border) classes per category key. */
export const categoryBadgeColors: Record<string, string> = {
  life: 'bg-blue-50 text-blue-600 border-blue-200',
  logistics: 'bg-orange-50 text-orange-600 border-orange-200',
  business: 'bg-green-50 text-green-600 border-green-200',
  tools: 'bg-purple-50 text-purple-600 border-purple-200',
  templates: 'bg-pink-50 text-pink-600 border-pink-200',
  education: 'bg-teal-50 text-teal-600 border-teal-200',
  official: 'bg-red-50 text-red-600 border-red-200',
  payment: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  ecommerce: 'bg-indigo-50 text-indigo-600 border-indigo-200',
};

/** Text-only color classes per category key (for nav labels etc.). */
export const categoryTextColors: Record<string, string> = {
  life: 'text-blue-600',
  logistics: 'text-orange-600',
  business: 'text-green-600',
  tools: 'text-purple-600',
  templates: 'text-pink-600',
  education: 'text-teal-600',
  official: 'text-red-600',
  payment: 'text-emerald-600',
  ecommerce: 'text-indigo-600',
};

export function getCategoryBadgeClass(category: string): string {
  return categoryBadgeColors[category] ?? 'bg-gray-50 text-gray-500 border-gray-200';
}

export function getCategoryTextClass(category: string): string {
  return categoryTextColors[category] ?? 'text-gray-600';
}
