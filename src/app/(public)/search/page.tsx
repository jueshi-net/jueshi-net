"use client";

import { useState } from "react";
import { Search, Truck, Hash, Loader2, Package, MapPin, Calendar, ArrowRight, AlertCircle } from "lucide-react";

interface TrackingEvent {
  time: string;
  status: string;
  location: string;
  description: string;
}

interface TrackingResult {
  trackingNumber: string;
  carrier: string;
  status: string;
  events: TrackingEvent[];
  origin: string;
  destination: string;
  mock?: boolean;
}

const statusColors: Record<string, string> = {
  delivered: "bg-green-100 text-green-700 border-green-200",
  in_transit: "bg-blue-100 text-blue-700 border-blue-200",
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  exception: "bg-red-100 text-red-700 border-red-200",
};

const statusLabels: Record<string, string> = {
  delivered: "已签收",
  in_transit: "运输中",
  pending: "待发货",
  exception: "异常",
};

interface HSCodeResult {
  id: string;
  code: string;
  level: number;
  description: string;
  descriptionEn: string | null;
  category: string | null;
  taxRate: number | null;
}

function HSCodeSearch() {
  const [hsQuery, setHsQuery] = useState("");
  const [hsResults, setHsResults] = useState<HSCodeResult[]>([]);
  const [hsLoading, setHsLoading] = useState(false);
  const [hsTotal, setHsTotal] = useState(0);
  const [hsPage, setHsPage] = useState(1);

  const searchHS = async (q: string, p: number = 1) => {
    setHsLoading(true);
    setHsPage(p);
    try {
      const params = new URLSearchParams({ q, page: String(p), limit: "10" });
      const res = await fetch(`/api/hs-codes?${params}`);
      const data = await res.json();
      if (data.success) {
        setHsResults(data.data);
        setHsTotal(data.pagination.total);
      }
    } catch {
      // ignore
    } finally {
      setHsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            value={hsQuery}
            onChange={(e) => setHsQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && searchHS(hsQuery)}
            placeholder="输入HS编码或商品名称，如：8471 或 手机"
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={() => searchHS(hsQuery)}
          disabled={hsLoading}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          {hsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Hash className="w-4 h-4" />}
          查询
        </button>
      </div>

      {hsResults.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-gray-500 mb-2">找到 {hsTotal} 条结果</p>
          {hsResults.map((item) => (
            <div key={item.id} className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">{item.code}</span>
                  <span className="text-sm text-gray-500">{item.category}</span>
                </div>
                {item.taxRate && (
                  <span className="text-sm text-orange-600 font-medium">税率: {item.taxRate}%</span>
                )}
              </div>
              <p className="mt-2 text-gray-900">{item.description}</p>
              {item.descriptionEn && (
                <p className="text-sm text-gray-400 mt-1">{item.descriptionEn}</p>
              )}
            </div>
          ))}
          {hsTotal > 10 && (
            <div className="flex justify-center gap-2 mt-4">
              <button
                disabled={hsPage === 1}
                onClick={() => searchHS(hsQuery, hsPage - 1)}
                className="px-4 py-2 border rounded-lg disabled:opacity-30 hover:bg-gray-50"
              >
                上一页
              </button>
              <span className="px-4 py-2 text-gray-500">第 {hsPage} 页</span>
              <button
                disabled={hsPage * 10 >= hsTotal}
                onClick={() => searchHS(hsQuery, hsPage + 1)}
                className="px-4 py-2 border rounded-lg disabled:opacity-30 hover:bg-gray-50"
              >
                下一页
              </button>
            </div>
          )}
        </div>
      )}

      {!hsLoading && hsResults.length === 0 && hsQuery === "" && (
        <div className="text-center text-gray-400 py-12">
          <Hash className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>输入商品名称或HS编码查询税率</p>
          <p className="text-sm mt-2">数据库共收录 {hsTotal} 条HS编码</p>
        </div>
      )}

      {!hsLoading && hsResults.length === 0 && hsQuery !== "" && (
        <div className="text-center text-gray-400 py-8">
          <p>未找到匹配的HS编码</p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  const [tab, setTab] = useState<"search" | "tracking" | "hs">("search");
  const [query, setQuery] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingResult, setTrackingResult] = useState<TrackingResult | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState("");

  const handleTracking = async () => {
    if (!trackingNumber.trim()) {
      setTrackingError("请输入快递单号");
      return;
    }

    setTrackingLoading(true);
    setTrackingError("");
    setTrackingResult(null);

    try {
      const res = await fetch("/api/tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackingNumber: trackingNumber.trim() }),
      });
      const data = await res.json();

      if (data.success) {
        setTrackingResult(data.data);
      } else {
        setTrackingError(data.error || "查询失败");
      }
    } catch {
      setTrackingError("网络错误，请稍后重试");
    } finally {
      setTrackingLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (tab === "tracking") handleTracking();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-gray-900 text-center mb-8">搜索中心</h1>

      {/* Tabs */}
      <div className="flex justify-center gap-2 mb-8">
        {[
          { key: "search" as const, label: "综合搜索", icon: Search },
          { key: "tracking" as const, label: "快递追踪", icon: Truck },
          { key: "hs" as const, label: "HS编码", icon: Hash },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setTrackingResult(null); setTrackingError(""); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
              tab === t.key ? "bg-blue-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-blue-300"
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        {tab === "search" && (
          <div className="flex gap-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, "_blank")}
              placeholder="输入关键词搜索..."
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, "_blank")} className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700">Google</button>
            <button onClick={() => window.open(`https://www.baidu.com/s?wd=${encodeURIComponent(query)}`, "_blank")} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200">百度</button>
          </div>
        )}

        {tab === "tracking" && (
          <div>
            {/* Input */}
            <div className="flex gap-3 mb-6">
              <div className="flex-1 relative">
                <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="输入快递单号，如：1234567890"
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={handleTracking}
                disabled={trackingLoading}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {trackingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4" />}
                查询
              </button>
            </div>

            {/* Error */}
            {trackingError && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-lg p-3 mb-4">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">{trackingError}</span>
              </div>
            )}

            {/* Result */}
            {trackingResult && (
              <div className="border border-gray-100 rounded-xl overflow-hidden">
                {/* Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{trackingResult.carrier}</h3>
                      <p className="text-sm text-gray-500">单号：{trackingResult.trackingNumber}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm border ${statusColors[trackingResult.status] || "bg-gray-100 text-gray-600"}`}>
                        {statusLabels[trackingResult.status] || trackingResult.status}
                      </span>
                      {trackingResult.mock && (
                        <span className="px-2 py-0.5 bg-yellow-50 text-yellow-600 rounded text-xs border border-yellow-200">
                          演示数据
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                    <MapPin className="w-4 h-4" />
                    <span>{trackingResult.origin}</span>
                    <ArrowRight className="w-3 h-3" />
                    <span>{trackingResult.destination}</span>
                  </div>
                </div>

                {/* Timeline */}
                <div className="px-6 py-4">
                  <div className="space-y-0">
                    {trackingResult.events.map((event, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full ${i === 0 ? "bg-blue-600 ring-4 ring-blue-100" : "bg-gray-300"}`} />
                          {i < trackingResult.events.length - 1 && <div className="w-0.5 h-full bg-gray-200 mt-1" />}
                        </div>
                        <div className={`pb-6 ${i === trackingResult.events.length - 1 ? "pb-0" : ""}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-sm font-medium ${i === 0 ? "text-blue-600" : "text-gray-900"}`}>
                              {event.status}
                            </span>
                            <span className="text-xs text-gray-400">
                              {new Date(event.time).toLocaleString("zh-CN")}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{event.description}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{event.location}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!trackingResult && !trackingLoading && !trackingError && (
              <div className="text-center text-gray-400 py-12">
                <Truck className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>输入快递单号查询物流轨迹</p>
                <p className="text-sm mt-2">支持 DHL, UPS, FedEx, 顺丰等主流快递公司</p>
              </div>
            )}
          </div>
        )}

        {tab === "hs" && (
          <HSCodeSearch />
        )}
      </div>
    </div>
  );
}
