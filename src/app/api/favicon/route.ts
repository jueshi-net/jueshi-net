import { NextRequest, NextResponse } from "next/server";

// Favicon proxy endpoint
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json({ success: false, error: "Missing URL" }, { status: 400 });
    }

    // Extract domain
    let domain: string;
    try {
      const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
      domain = parsed.hostname;
    } catch {
      return NextResponse.json({ success: false, error: "Invalid URL" }, { status: 400 });
    }

    // Use Google's favicon service
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

    return NextResponse.redirect(faviconUrl);
  } catch {
    return NextResponse.json({ success: false, error: "Failed to fetch favicon" }, { status: 500 });
  }
}
