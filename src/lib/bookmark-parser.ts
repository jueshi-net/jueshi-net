/**
 * Browser Bookmark Parser
 * 
 * Parses Chrome/Firefox/Edge exported bookmark HTML files.
 * Format: <DL><p> structure with <H3> folders and <A> links.
 */

interface BookmarkNode {
  type: 'folder' | 'link';
  name: string;
  url?: string;
  addDate?: string;
  children?: BookmarkNode[];
}

interface ParsedResult {
  folders: { name: string; level: number }[];
  links: { title: string; url: string; folder: string }[];
}

/**
 * Parse bookmark HTML string into structured data
 */
export function parseBookmarks(html: string): ParsedResult {
  const folders: { name: string; level: number }[] = [];
  const links: { title: string; url: string; folder: string }[] = [];

  // Use DOMParser for reliable parsing
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Find all DT elements
  const dts = doc.querySelectorAll('dt');
  let currentFolder = '未分类';
  let folderLevel = 0;

  for (const dt of Array.from(dts)) {
    const h3 = dt.querySelector('h3');
    const a = dt.querySelector('a');
    const dl = dt.querySelector('dl');

    if (h3) {
      // It's a folder
      const name = h3.textContent?.trim() || '未命名文件夹';
      currentFolder = name;
      folderLevel = getNestingLevel(dt);
      folders.push({ name, level: folderLevel });
    }

    if (a) {
      // It's a link
      const title = a.textContent?.trim() || '未命名链接';
      const url = a.getAttribute('href') || '';
      
      if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
        links.push({ title, url, folder: currentFolder });
      }
    }
  }

  return { folders, links };
}

/**
 * Calculate nesting level by counting parent DL elements
 */
function getNestingLevel(element: Element): number {
  let level = 0;
  let parent = element.parentElement;
  while (parent) {
    if (parent.tagName === 'DL') level++;
    parent = parent.parentElement;
  }
  return level;
}

/**
 * Generate a safe slug from a name
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\u4e00-\u9fa5a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50) || `folder-${Date.now()}`;
}

/**
 * Deduplicate links by URL
 */
export function deduplicateLinks(links: { title: string; url: string; folder: string }[]) {
  const seen = new Set<string>();
  return links.filter(link => {
    if (seen.has(link.url)) return false;
    seen.add(link.url);
    return true;
  });
}

/**
 * Estimate unique categories (deduplicated folder names)
 */
export function getUniqueCategories(folders: { name: string; level: number }[]) {
  const seen = new Set<string>();
  return folders.filter(f => {
    if (seen.has(f.name.toLowerCase())) return false;
    seen.add(f.name.toLowerCase());
    return true;
  });
}
