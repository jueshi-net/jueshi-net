import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');
  const country = searchParams.get('country') || 'CA';
  const query = searchParams.get('q') || '';

  if (!query) {
    return NextResponse.json({ error: 'Missing query parameter' }, { status: 400 });
  }

  try {
    if (action === 'search-city') {
      // Search by city name → return all postal codes for that city
      const results = await prisma.postalCode.findMany({
        where: {
          countryCode: country,
          city: { contains: query, mode: 'insensitive' },
          isActive: true,
        },
        orderBy: [{ postalCode: 'asc' }],
        take: 50,
        select: {
          id: true,
          country: true,
          countryCode: true,
          city: true,
          province: true,
          adminCode1: true,
          postalCode: true,
          areaName: true,
          latitude: true,
          longitude: true,
          accuracy: true,
          source: true,
        },
      });

      return NextResponse.json({ results, total: results.length });
    }

    if (action === 'search-postal') {
      // Search by postal code → return matching places
      const results = await prisma.postalCode.findMany({
        where: {
          countryCode: country,
          postalCode: { contains: query.replace(/\s+/g, ''), mode: 'insensitive' },
          isActive: true,
        },
        orderBy: [{ city: 'asc' }],
        take: 50,
        select: {
          id: true,
          country: true,
          countryCode: true,
          city: true,
          province: true,
          adminCode1: true,
          postalCode: true,
          areaName: true,
          latitude: true,
          longitude: true,
          accuracy: true,
          source: true,
        },
      });

      return NextResponse.json({ results, total: results.length });
    }

    // Default: try both postal code and city search
    const postalResults = await prisma.postalCode.findMany({
      where: {
        countryCode: country,
        OR: [
          { postalCode: { contains: query.replace(/\s+/g, ''), mode: 'insensitive' } },
          { city: { contains: query, mode: 'insensitive' } },
        ],
        isActive: true,
      },
      orderBy: [{ city: 'asc' }, { postalCode: 'asc' }],
      take: 50,
      select: {
        id: true,
        country: true,
        countryCode: true,
        city: true,
        province: true,
        adminCode1: true,
        postalCode: true,
        areaName: true,
        latitude: true,
        longitude: true,
        accuracy: true,
        source: true,
      },
    });

    return NextResponse.json({ results: postalResults, total: postalResults.length });
  } catch (error) {
    console.error('Postal code API error:', error);
    return NextResponse.json({ error: '查询失败' }, { status: 500 });
  }
}
