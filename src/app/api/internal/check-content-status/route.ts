import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Internal API to check if content exists and is published.
 * Used by middleware to return proper HTTP 404 status codes.
 * 
 * This is necessary because Next.js 16 with streaming doesn't properly
 * set HTTP 404 status when notFound() is called in page components.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type'); // 'topic', 'guide', or 'checklist'
  const slug = searchParams.get('slug');

  if (!type || !slug) {
    return NextResponse.json({ error: 'Missing type or slug' }, { status: 400 });
  }

  try {
    let exists = false;
    let isPublished = false;

    switch (type) {
      case 'topic': {
        const topic = await prisma.topic.findUnique({
          where: { slug },
          select: { status: true },
        });
        exists = topic !== null;
        isPublished = topic?.status === 'published';
        break;
      }
      case 'guide': {
        const guide = await prisma.guide.findUnique({
          where: { slug },
          select: { status: true },
        });
        exists = guide !== null;
        isPublished = guide?.status === 'published';
        break;
      }
      case 'checklist': {
        const checklist = await prisma.checklist.findUnique({
          where: { slug },
          select: { status: true },
        });
        exists = checklist !== null;
        isPublished = checklist?.status === 'published';
        break;
      }
      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    return NextResponse.json({
      exists,
      isPublished,
      should404: !exists || !isPublished,
    });
  } catch (error) {
    console.error('[check-content-status] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
