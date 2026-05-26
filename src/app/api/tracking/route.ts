import { NextRequest, NextResponse } from "next/server";

interface TrackingEvent {
  time: string;
  status: string;
  location: string;
  description: string;
}

interface TrackingResult {
  trackingNumber: string;
  carrier: string;
  status: "in_transit" | "delivered" | "pending" | "exception";
  events: TrackingEvent[];
  origin: string;
  destination: string;
}

// Mock tracking data for demo
function generateMockTracking(trackingNumber: string): TrackingResult {
  const carriers = ["DHL", "UPS", "FedEx", "USPS", "SF Express"];
  const carrier = carriers[Math.abs(trackingNumber.charCodeAt(0)) % carriers.length];

  const now = new Date();
  const events: TrackingEvent[] = [
    {
      time: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      status: "Delivered",
      location: "深圳, 广东",
      description: "已签收，签收人：前台",
    },
    {
      time: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(),
      status: "Out for Delivery",
      location: "深圳, 广东",
      description: "快件正在派送中",
    },
    {
      time: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
      status: "In Transit",
      location: "深圳分拣中心",
      description: "快件已到达深圳分拣中心",
    },
    {
      time: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
      status: "In Transit",
      location: "上海转运中心",
      description: "快件已从上海发出",
    },
    {
      time: new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString(),
      status: "In Transit",
      location: "北京转运中心",
      description: "快件已到达北京转运中心",
    },
    {
      time: new Date(now.getTime() - 50 * 60 * 60 * 1000).toISOString(),
      status: "Picked Up",
      location: "北京, 北京",
      description: "快递员已揽件",
    },
  ];

  return {
    trackingNumber,
    carrier,
    status: "delivered",
    events,
    origin: "北京",
    destination: "深圳",
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { trackingNumber, carrier } = body;

    if (!trackingNumber) {
      return NextResponse.json({ success: false, error: "Missing tracking number" }, { status: 400 });
    }

    // Check for 17Track API key
    const apiKey = process.env.TRACKING_17TRACK_API_KEY;

    if (apiKey) {
      // Use real 17Track API
      const response = await fetch("https://api.17track.net/track/v2.2/gettrackinfo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "17token": apiKey,
        },
        body: JSON.stringify({
          number: trackingNumber,
          carrier: carrier || "",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({ success: true, data });
      }
    }

    // Fallback to mock data
    const mockData = generateMockTracking(trackingNumber);
    return NextResponse.json({ success: true, data: mockData, mock: true });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to track" }, { status: 500 });
  }
}
