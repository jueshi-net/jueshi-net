/**
 * /dev/module-preview/service-provider - Preview Harness.
 * Only accessible in non-production or preview environments.
 * Shows real block components in simulated page slot scenarios.
 */
import Link from "next/link";
import { isFeatureEnabled, getEnabledModules, getEnabledBlocks, getEnabledNavigation } from "@/platform";
import { registerServiceProvider } from "@/modules/service-provider/public";
import {
  listPublicProviders,
  listPublicCategories,
  getTrustCard,
} from "@/modules/service-provider/public";
import {
  ServiceProviderListBlock,
  ServiceProviderRecommendationsBlock,
  ProviderTrustCardBlock,
  ServiceRequestCtaBlock,
} from "@/modules/service-provider/ui/blocks";

export const dynamic = "force-dynamic";
export const metadata = { title: "Module Preview: Service Provider", robots: { index: false, follow: false } };

export default async function ServiceProviderPreviewHarness() {
  if (process.env.NODE_ENV === "production" && process.env.PREVIEW_MODE !== "true") {
    return <div className="p-8 text-center text-gray-400">Preview Harness only available in non-production</div>;
  }

  // Register module to get enabled state
  registerServiceProvider();

  const flagEnabled = isFeatureEnabled("FEATURE_SERVICE_PROVIDER");
  const enabledModules = getEnabledModules();
  const enabledBlocks = getEnabledBlocks();
  const mainNav = getEnabledNavigation("main");
  const workspaceNav = getEnabledNavigation("workspace");

  // Fetch real fixture data
  const [providersResult, categories] = await Promise.all([
    listPublicProviders({ pageSize: 6 }),
    listPublicCategories(),
  ]);

  const providers = providersResult.items;
  const firstProvider = providers[0];
  const trust = firstProvider ? await getTrustCard(firstProvider.id) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-[1200px] px-4 py-8">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Service Provider Module Preview</h1>
        <p className="mb-6 text-sm text-gray-500">Round 2B Preview Harness - real blocks in simulated slot scenarios</p>

        {/* Module Info */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold text-gray-900">Module Registration</h2>
            <dl className="space-y-1 text-sm">
              <div className="flex justify-between"><dt className="text-gray-400">Feature Flag</dt><dd className={flagEnabled ? "text-green-600" : "text-red-600"}>{flagEnabled ? "ENABLED" : "DISABLED"}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-400">Module Registered</dt><dd>{enabledModules.find(m => m.id === "service-provider") ? "✓" : "✗"}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-400">Blocks Registered</dt><dd>{enabledBlocks.length}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-400">Main Nav Items</dt><dd>{mainNav.length}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-400">Workspace Nav Items</dt><dd>{workspaceNav.length}</dd></div>
            </dl>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold text-gray-900">Fixture Data Summary</h2>
            <dl className="space-y-1 text-sm">
              <div className="flex justify-between"><dt className="text-gray-400">Total Providers</dt><dd>{providersResult.total}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-400">Categories</dt><dd>{categories.length}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-400">Current Page</dt><dd>{providersResult.page} / {providersResult.totalPages}</dd></div>
            </dl>
          </div>
        </div>

        {/* Capability Test Panel */}
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">Block Registry - Registered Blocks</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {["service-provider-list", "service-provider-recommendations", "provider-trust-card", "service-request-cta"].map((b) => (
              <div key={b} className={`rounded-lg border p-2 text-center text-xs ${enabledBlocks.find(eb => eb.id === b) ? "border-green-300 bg-green-50 text-green-700" : "border-gray-200 bg-gray-50 text-gray-400"}`}>
                {b}
              </div>
            ))}
          </div>
        </div>

        {/* Real Block Scenarios */}
        <h2 className="mb-4 text-lg font-bold text-gray-900">Block Scenarios</h2>

        {/* Scenario 1: Homepage slot */}
        <div className="mb-6 rounded-xl border-2 border-dashed border-blue-200 bg-white p-4">
          <p className="mb-3 text-xs font-medium text-blue-600">📍 Scenario: Homepage slot (service-provider-recommendations)</p>
          <ServiceProviderRecommendationsBlock providers={providers.slice(0, 4)} title="精选服务商" layout="horizontal" />
        </div>

        {/* Scenario 2: Tool result page slot */}
        <div className="mb-6 rounded-xl border-2 border-dashed border-green-200 bg-white p-4">
          <p className="mb-3 text-xs font-medium text-green-600">📍 Scenario: Tool result page slot (service-provider-list)</p>
          <ServiceProviderListBlock providers={providers.slice(0, 3)} title="相关服务商" showViewAll={true} />
        </div>

        {/* Scenario 3: Guide content slot */}
        <div className="mb-6 rounded-xl border-2 border-dashed border-purple-200 bg-white p-4">
          <p className="mb-3 text-xs font-medium text-purple-600">📍 Scenario: Guide content after slot (service-request-cta)</p>
          {firstProvider && (
            <ServiceRequestCtaBlock
              providerId={firstProvider.id}
              providerSlug={firstProvider.slug}
              providerName={firstProvider.displayName}
              sourceType="guide_slot"
              sourceId="preview-guide"
            />
          )}
        </div>

        {/* Scenario 4: Country page sidebar slot */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border-2 border-dashed border-orange-200 bg-white p-4">
            <p className="mb-3 text-xs font-medium text-orange-600">📍 Country page sidebar (provider-trust-card)</p>
            <ProviderTrustCardBlock trust={trust} />
          </div>
          <div className="rounded-xl border-2 border-dashed border-orange-200 bg-white p-4">
            <p className="mb-3 text-xs font-medium text-orange-600">📍 Sidebar (recommendations vertical)</p>
            <ServiceProviderRecommendationsBlock providers={providers.slice(0, 3)} title="推荐" layout="grid" />
          </div>
          <div className="rounded-xl border-2 border-dashed border-orange-200 bg-white p-4">
            <p className="mb-3 text-xs font-medium text-orange-600">📍 CTA block</p>
            {firstProvider && (
              <ServiceRequestCtaBlock
                providerId={firstProvider.id}
                providerSlug={firstProvider.slug}
                providerName={firstProvider.displayName}
                sourceType="sidebar_slot"
                sourceId="preview-sidebar"
              />
            )}
          </div>
        </div>

        {/* Block states demo */}
        <h2 className="mb-4 text-lg font-bold text-gray-900">Block States</h2>
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="mb-2 text-xs text-gray-400">Loading state</p>
            <ServiceProviderListBlock providers={[]} loading={true} />
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="mb-2 text-xs text-gray-400">Empty state</p>
            <ServiceProviderListBlock providers={[]} />
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="mb-2 text-xs text-gray-400">Error state</p>
            <ServiceProviderListBlock providers={[]} error="Connection timeout" />
          </div>
        </div>

        {/* Links */}
        <div className="flex flex-wrap gap-2">
          <Link href="/service-providers" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">目录页 →</Link>
          {firstProvider && (
            <>
              <Link href={`/business/${firstProvider.slug}`} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">企业详情 →</Link>
              {providers[1] && (
                <Link href={`/professional/${providers[1].slug}`} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">专业人员详情 →</Link>
              )}
              <Link href="/workspace/provider" className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">工作台 →</Link>
              <Link href="/admin/service-providers" className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">后台管理 →</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
