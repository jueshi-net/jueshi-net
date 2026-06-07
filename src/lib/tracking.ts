"use client";

export type TrackingEvent =
  | "Tool_Click"
  | "Search_Submit"
  | "Register_Click"
  | "Login_Click"
  | "Member_Upgrade_Click"
  | "Forum_Click"
  | "Topic_Click"
  | "Ad_Click"
  | "Document_Save"
  | "Draft_Open";

export function trackEvent(event: TrackingEvent, data?: Record<string, string | number>) {
  try {
    // Send to /api/events (uses EventLog model)
    navigator.sendBeacon(
      "/api/events",
      JSON.stringify({ event, ...data, ts: Date.now() })
    );
  } catch {
    // fail silently
  }
}
