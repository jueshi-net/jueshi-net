import { NextResponse } from "next/server";
import { getHomepageConfig } from "@/lib/homepage-config";

export async function GET() {
  try {
    const config = await getHomepageConfig();
    return NextResponse.json({ config });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch config" }, { status: 500 });
  }
}
