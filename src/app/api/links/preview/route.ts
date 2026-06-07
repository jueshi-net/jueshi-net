import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: '缺少 URL' }, { status: 400 });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; XixiongBot/1.0)'
      }
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return NextResponse.json({ error: '无法访问该页面' }, { status: 400 });
    }

    const html = await response.text();

    // Extract metadata
    const title = extractMeta(html, 'og:title') || extractTag(html, 'title') || new URL(url).hostname;
    const description = extractMeta(html, 'og:description') || extractMeta(html, 'description') || '';
    const image = extractMeta(html, 'og:image') || extractMeta(html, 'twitter:image') || '';
    const favicon = extractFavicon(html, url) || `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=64`;

    return NextResponse.json({ title, description, image, favicon, url });
  } catch (error: any) {
    return NextResponse.json({
      title: new URL(url).hostname,
      description: '',
      image: '',
      favicon: `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=64`,
      url,
      error: error.message
    });
  }
}

function extractMeta(html: string, name: string): string {
  const regex = new RegExp(`<meta[^>]+(?:property|name)=["']${name}["'][^>]+content=["']([^"']+)["']`, 'i');
  const match = html.match(regex);
  return match?.[1] || '';
}

function extractTag(html: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*>([^<]+)</${tag}>`, 'i');
  const match = html.match(regex);
  return match?.[1]?.trim() || '';
}

function extractFavicon(html: string, baseUrl: string): string {
  const regex = /<link[^>]+rel=["'](?:shortcut )?icon["'][^>]+href=["']([^"']+)["']/i;
  const match = html.match(regex);
  if (match) {
    try {
      return new URL(match[1], baseUrl).href;
    } catch {
      return '';
    }
  }
  return '';
}
