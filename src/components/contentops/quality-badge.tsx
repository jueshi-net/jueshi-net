"use client";
import { CheckCircle, AlertCircle, AlertTriangle } from "lucide-react";
import { QualityCheckResult } from "@/lib/contentops/quality-checker";

interface QualityBadgeProps {
  result: QualityCheckResult;
  showDetails?: boolean;
}

export function QualityBadge({ result, showDetails = false }: QualityBadgeProps) {
  const levelConfig = {
    excellent: { color: "bg-green-100 text-green-700", icon: CheckCircle, label: "优秀" },
    good: { color: "bg-blue-100 text-blue-700", icon: CheckCircle, label: "良好" },
    fair: { color: "bg-amber-100 text-amber-700", icon: AlertTriangle, label: "一般" },
    poor: { color: "bg-red-100 text-red-700", icon: AlertCircle, label: "需改进" },
  };

  const config = levelConfig[result.level];
  const Icon = config.icon;

  return (
    <div className="inline-flex items-center gap-2">
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label} {result.score}分
      </span>
      
      {showDetails && result.issues.length > 0 && (
        <span className="text-xs text-red-600">
          {result.issues.length} 个问题
        </span>
      )}
      
      {showDetails && result.warnings.length > 0 && (
        <span className="text-xs text-amber-600">
          {result.warnings.length} 个警告
        </span>
      )}
    </div>
  );
}

interface QualityDetailsProps {
  result: QualityCheckResult;
}

export function QualityDetails({ result }: QualityDetailsProps) {
  if (result.issues.length === 0 && result.warnings.length === 0) {
    return (
      <div className="text-sm text-green-600 flex items-center gap-2">
        <CheckCircle className="w-4 h-4" />
        内容质量良好，无问题
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* 错误 */}
      {result.issues.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-red-700 mb-2 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            必须修复 ({result.issues.length})
          </h4>
          <ul className="space-y-1">
            {result.issues.map((issue, idx) => (
              <li key={idx} className="text-sm text-red-600 flex items-start gap-2">
                <span className="text-red-400 mt-0.5">•</span>
                <span>{issue.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 警告 */}
      {result.warnings.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-amber-700 mb-2 flex items-center gap-1">
            <AlertTriangle className="w-4 h-4" />
            建议改进 ({result.warnings.length})
          </h4>
          <ul className="space-y-1">
            {result.warnings.map((warning, idx) => (
              <li key={idx} className="text-sm text-amber-600">
                <div>{warning.message}</div>
                {warning.suggestion && (
                  <div className="text-xs text-amber-500 mt-0.5 ml-4">
                    💡 {warning.suggestion}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

interface SeoGeoScoreProps {
  seoScore: number;
  geoScore: number;
}

export function SeoGeoScore({ seoScore, geoScore }: SeoGeoScoreProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-blue-600";
    if (score >= 60) return "text-amber-600";
    return "text-red-600";
  };

  return (
    <div className="flex items-center gap-4 text-xs">
      <div className="flex items-center gap-1">
        <span className="text-gray-500">SEO:</span>
        <span className={`font-medium ${getScoreColor(seoScore)}`}>{seoScore}</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-gray-500">GEO:</span>
        <span className={`font-medium ${getScoreColor(geoScore)}`}>{geoScore}</span>
      </div>
    </div>
  );
}
