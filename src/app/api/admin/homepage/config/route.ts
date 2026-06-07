import { NextResponse } from "next/server";
import { updateHomepageConfig } from "@/lib/homepage-config";

export async function PUT(req: Request) {
  try {
    const { key, value } = await req.json();
    if (!key || !value) {
      return NextResponse.json({ error: "Missing key or value" }, { status: 400 });
    }
    const updated = await updateHomepageConfig(key, value, "admin");
    return NextResponse.json({ ok: true, updated });
  } catch (err) {
    console.error("[Homepage Config] Update error:", err);
    return NextResponse.json({ error: "Failed to update config", details: (err as Error).message }, { status: 500 });
  }
}
