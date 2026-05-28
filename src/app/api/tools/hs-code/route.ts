// src/app/api/tools/hs-code/route.ts
// High-performance HS Code search API
// Supports: Prefix match (numbers), Fuzzy match (Chinese name)

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";
  
  // 1. No query -> Return nothing or random few
  if (!query.trim()) {
    return NextResponse.json({ success: true, data: [] });
  }

  // 2. Detect query type
  const isNumeric = /^\d+$/.test(query);

  let results: any[] = [];

  if (isNumeric) {
    // Priority 1: Exact or Prefix match on code
    // Try exact match first
    const exact = await prisma.hSCode.findUnique({
      where: { code: query }
    });
    if (exact) {
      results.push(exact);
    }

    // Try prefix match (starts with)
    if (results.length < 50) {
      const prefixResults = await prisma.hSCode.findMany({
        where: {
          code: { startsWith: query }
        },
        take: 50,
        orderBy: { code: "asc" }
      });
      // Add only unique ones
      for (const r of prefixResults) {
        if (!results.find(existing => existing.code === r.code)) {
          results.push(r);
        }
      }
    }
  } else {
    // Priority 2: Fuzzy match on nameCn (description)
    results = await prisma.hSCode.findMany({
      where: {
        description: { contains: query }
      },
      take: 50,
      orderBy: { description: "asc" } // Alphabetical order
    });
  }

  return NextResponse.json({ success: true, data: results });
}
