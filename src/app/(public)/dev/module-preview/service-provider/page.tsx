"use client";
import { useState, useEffect } from "react";

export default function ServiceProviderPreviewHarness() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/service-providers?preview=1", { headers: { "x-preview-harness": "1" } });
        const json = await res.json();
        setData(json);
      } catch (e) {
        setData({ error: String(e) });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Service Provider Module Preview</h1>
        <p className="text-sm text-gray-500 mb-6">Round 2A Preview Harness — only accessible in non-production environments</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-lg font-semibold mb-3">Module Registration</h2>
            <dl className="text-sm space-y-1">
              <div className="flex justify-between"><dt className="text-gray-500">Module ID:</dt><dd className="font-mono">service-provider</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Version:</dt><dd>0.1.0</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Feature Flag:</dt><dd className="font-mono">FEATURE_SERVICE_PROVIDER</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Capabilities:</dt><dd>11 registered</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Routes:</dt><dd>6 declared</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Blocks:</dt><dd>4 registered</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Actions:</dt><dd>3 registered</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Events:</dt><dd>8 published, 1 subscribed</dd></div>
            </dl>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-lg font-semibold mb-3">Feature Flag Status</h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span>Preview: ENABLED (env)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                <span>Shared Staging: DISABLED (default)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                <span>Production: DISABLED (default)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <h2 className="text-lg font-semibold mb-3">Registered Blocks</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {["service-provider-list", "service-provider-recommendations", "provider-trust-card", "service-request-cta"].map((b) => (
              <div key={b} className="border border-dashed border-gray-300 rounded-lg p-4 text-center">
                <div className="text-xs font-mono text-gray-500 mb-1">{b}</div>
                <div className="text-xs text-gray-400">Block placeholder</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <h2 className="text-lg font-semibold mb-3">Capability Test Panel</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
            {["provider.view", "provider.create", "provider.claim", "provider.edit", "provider.submit", "provider.verify", "provider.manage", "service.create", "service.publish", "service.request", "provider.report"].map((c) => (
              <div key={c} className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                <span className="font-mono">{c}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-lg font-semibold mb-3">Provider Test Data</h2>
          {loading ? (
            <p className="text-sm text-gray-400">Loading...</p>
          ) : data?.success ? (
            <p className="text-sm text-gray-600">{data.data?.length || 0} providers found</p>
          ) : (
            <p className="text-sm text-gray-400">No data or feature disabled</p>
          )}
        </div>
      </div>
    </div>
  );
}
