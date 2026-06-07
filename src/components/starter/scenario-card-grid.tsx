import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SCENARIO_PACKAGES } from "@/data/scenario-packages";

/**
 * ScenarioCardGrid — lightweight component for displaying 6 scenario packages.
 * Reused on both / (homepage) and /starter pages.
 */
export function ScenarioCardGrid({ title, subtitle }: { title?: string; subtitle?: string }) {
  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      {title && (
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <span>🎯</span>
          {title}
        </h2>
      )}
      {subtitle && (
        <p className="text-gray-500 mb-8">{subtitle}</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SCENARIO_PACKAGES.map((pkg) => {
          // Count total tools
          let toolCount = 0;
          for (const g of pkg.toolGroups) toolCount += g.tools.length;

          return (
            <Link
              key={pkg.slug}
              href={`/starter/${pkg.slug}`}
              className="group bg-white rounded-xl border border-gray-100 p-6 hover:shadow-lg hover:border-blue-200 transition-all flex flex-col min-h-[180px]"
            >
              {/* Emoji + Title */}
              <div className="flex items-start gap-3 mb-3">
                <span className="text-3xl flex-shrink-0">{pkg.emoji}</span>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                    {pkg.title}
                  </h3>
                  <p className="text-sm text-gray-400 mt-0.5">{pkg.subtitle}</p>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-500 mb-4 flex-1 line-clamp-2">{pkg.description}</p>

              {/* Bottom row */}
              <div className="flex items-center justify-between mt-auto">
                <span className="text-xs text-gray-400">👥 {pkg.targetUsers.split("、")[0]}</span>
                <div className="flex items-center gap-1.5 text-sm text-blue-600 font-medium group-hover:text-blue-700 transition-colors">
                  {toolCount} 个工具
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
