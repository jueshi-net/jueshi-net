"use client";

import { useState } from "react";
import { MapPin, Search } from "lucide-react";

// 常用邮编数据（模拟，实际应接API或数据库）
const zipData: Record<string, { city: string; state: string; country: string }[]> = {
  US: [
    { city: "New York", state: "NY", country: "United States" },
    { city: "Los Angeles", state: "CA", country: "United States" },
    { city: "Chicago", state: "IL", country: "United States" },
    { city: "Houston", state: "TX", country: "United States" },
    { city: "Miami", state: "FL", country: "United States" },
  ],
  UK: [
    { city: "London", state: "England", country: "United Kingdom" },
    { city: "Manchester", state: "England", country: "United Kingdom" },
    { city: "Birmingham", state: "England", country: "United Kingdom" },
  ],
  DE: [
    { city: "Berlin", state: "Berlin", country: "Germany" },
    { city: "Munich", state: "Bavaria", country: "Germany" },
    { city: "Hamburg", state: "Hamburg", country: "Germany" },
  ],
  FR: [
    { city: "Paris", state: "Île-de-France", country: "France" },
    { city: "Lyon", state: "Auvergne-Rhône-Alpes", country: "France" },
  ],
  JP: [
    { city: "Tokyo", state: "Tokyo", country: "Japan" },
    { city: "Osaka", state: "Osaka", country: "Japan" },
  ],
  AU: [
    { city: "Sydney", state: "NSW", country: "Australia" },
    { city: "Melbourne", state: "VIC", country: "Australia" },
  ],
  CN: [
    { city: "北京", state: "北京", country: "China" },
    { city: "上海", state: "上海", country: "China" },
    { city: "深圳", state: "广东", country: "China" },
    { city: "广州", state: "广东", country: "China" },
  ],
};

export default function ZipCodePage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ city: string; state: string; country: string; zip: string }[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = () => {
    setSearched(true);
    const found: typeof results = [];

    // 搜索城市名
    Object.entries(zipData).forEach(([code, cities]) => {
      cities.forEach((c) => {
        if (c.city.toLowerCase().includes(query.toLowerCase()) || query.toUpperCase() === code) {
          found.push({ city: c.city, state: c.state, country: c.country, zip: `${code} ZIP` });
        }
      });
    });

    setResults(found);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-orange-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">世界邮编查询</h1>
          <p className="text-gray-500 mt-1">查询全球主要城市的邮政编码</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="flex gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="输入城市名或国家代码 (如: Tokyo, US)"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button onClick={handleSearch} className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium">
              查询
            </button>
          </div>

          {searched && (
            <div className="space-y-2">
              {results.length > 0 ? (
                results.map((r, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{r.city}, {r.state}</p>
                      <p className="text-sm text-gray-500">{r.country}</p>
                    </div>
                    <span className="text-lg font-bold text-blue-600">{r.zip}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>未找到结果，请尝试其他关键词</p>
                  <p className="text-sm mt-1">提示：可查询 US/UK/DE/FR/JP/AU/CN 等主要城市</p>
                </div>
              )}
            </div>
          )}

          {/* Quick Links */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">常用链接</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: "Nowmsg.com", url: "https://www.nowmsg.com" },
                { name: "Zip-Codes.com", url: "https://www.zip-codes.com" },
                { name: "邮编库", url: "https://www.youbianku.com" },
                { name: "USPS ZIP Lookup", url: "https://tools.usps.com/zip-lookup.htm" },
              ].map((l) => (
                <a key={l.name} href={l.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-blue-600">{l.name}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
