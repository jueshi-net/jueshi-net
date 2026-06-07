"use client";

import { Package, ExternalLink, Sparkles } from "lucide-react";

interface ToolRecommendation {
  key: string;
  title: string;
  href: string;
  icon: string;
  comingSoon?: boolean;
}

interface RecommendedPackage {
  name: string;
  description: string;
  tools: ToolRecommendation[];
}

interface RecommendedPackagesProps {
  packages: RecommendedPackage[];
}

export default function RecommendedPackages({ packages }: RecommendedPackagesProps) {
  if (packages.length === 0) return null;

  return (
    <div className="space-y-4">
      {packages.map((pkg, idx) => (
        <div key={idx} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">{pkg.name}</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">{pkg.description}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {pkg.tools.map((tool) => (
              <div
                key={tool.key}
                className={`flex items-center gap-2 p-3 rounded-lg ${
                  tool.comingSoon
                    ? "bg-white/60"
                    : "bg-white hover:bg-blue-100 transition-colors"
                }`}
              >
                <div className="flex-shrink-0">
                  {tool.comingSoon ? (
                    <Sparkles className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ExternalLink className="w-4 h-4 text-blue-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  {tool.comingSoon ? (
                    <span className="text-sm text-gray-500">{tool.title}</span>
                  ) : (
                    <a
                      href={tool.href}
                      className="text-sm font-medium text-gray-900 hover:text-blue-600 truncate block"
                    >
                      {tool.title}
                    </a>
                  )}
                </div>
                {tool.comingSoon && (
                  <span className="text-xs text-gray-400 flex-shrink-0">Soon</span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
