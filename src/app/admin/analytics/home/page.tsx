"use client";

import { useState, useEffect } from "react";

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/analytics/home?days=${days}`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, [days]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">首页转化分析</h1>
        <div className="flex gap-2">
          {[1, 7, 30].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 rounded-lg text-sm ${
                days === d ? "bg-teal-600 text-white" : "bg-white border"
              }`}
            >
              {d === 1 ? "今天" : `${d}天`}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">加载中...</div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data?.eventStats?.map((e: any) => (
              <div key={e.eventType} className="bg-white p-4 rounded-xl border">
                <div className="text-sm text-gray-500">{e.eventType}</div>
                <div className="text-2xl font-bold text-gray-900">{Number(e.count).toLocaleString()}</div>
              </div>
            )) || <div className="col-span-4 text-center text-gray-400">暂无埋点数据</div>}
          </div>

          <div className="bg-white p-6 rounded-xl border">
            <h3 className="text-lg font-semibold mb-4">广告表现</h3>
            {data?.adStats?.length > 0 ? (
              <table className="w-full text-sm">
                <thead><tr className="border-b"><th className="text-left p-2">名称</th><th className="text-right p-2">展示</th><th className="text-right p-2">点击</th><th className="text-right p-2">CTR</th></tr></thead>
                <tbody>
                  {data.adStats.map((ad: any) => (
                    <tr key={ad.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">{ad.title}</td>
                      <td className="text-right p-2">{ad.impressions.toLocaleString()}</td>
                      <td className="text-right p-2">{ad.clicks.toLocaleString()}</td>
                      <td className="text-right p-2">{ad.impressions ? ((ad.clicks / ad.impressions) * 100).toFixed(2) : 0}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-gray-400 text-center py-4">暂无广告数据</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
