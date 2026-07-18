"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, BookOpen, PenSquare, ShieldCheck, Flag, Bell, ChevronRight } from "lucide-react";

const STORAGE_KEY = "bbs-onboarding-dismissed";

const ONBOARDING_STEPS = [
  {
    icon: BookOpen,
    title: "了解社区规则",
    description: "发帖前请先阅读社区规则，了解发帖规范、禁止内容和外链政策。",
    link: "/bbs/rules",
    linkText: "查看社区规则",
  },
  {
    icon: PenSquare,
    title: "如何发帖",
    description: "点击「发布新帖」，选择分类、填写标题和正文，提交后进入审核流程。",
    link: "/bbs/new",
    linkText: "发布新帖",
  },
  {
    icon: ShieldCheck,
    title: "审核流程",
    description: "普通用户发帖需管理员审核通过后公开显示，管理员发帖直接发布。",
    link: null,
    linkText: null,
  },
  {
    icon: Bell,
    title: "查看审核状态",
    description: "在「我的帖子」中查看帖子状态：草稿、待审核、已发布、已驳回。",
    link: "/bbs/my-posts",
    linkText: "我的帖子",
  },
  {
    icon: Flag,
    title: "举报与申诉",
    description: "发现违规内容可举报，在「我的举报」中查看处理结果。对驳回结果有异议可申诉。",
    link: "/bbs/my-reports",
    linkText: "我的举报",
  },
];

export function CommunityOnboarding() {
  const [dismissed, setDismissed] = useState(true); // Default: hidden (SSR-safe)
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Check localStorage on client only
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== "true") {
        setDismissed(false);
      }
    } catch {
      // localStorage not available, keep dismissed
    }
  }, []);

  function handleDismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // Ignore storage errors
    }
    setDismissed(true);
  }

  function handleSkip() {
    handleDismiss();
  }

  function handleNext() {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleDismiss();
    }
  }

  if (dismissed) return null;

  const step = ONBOARDING_STEPS[currentStep];
  const StepIcon = step.icon;
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

  return (
    <div className="bg-gradient-to-br from-brand/5 to-blue-50 rounded-xl border border-brand/10 p-4 md:p-5 mb-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center">
            <StepIcon className="w-4 h-4 text-brand" />
          </div>
          <h3 className="text-sm font-bold text-gray-900">
            新手引导
            <span className="text-gray-400 font-normal ml-1.5">
              ({currentStep + 1}/{ONBOARDING_STEPS.length})
            </span>
          </h3>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="关闭引导"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mb-3">
        <h4 className="text-sm font-semibold text-gray-800 mb-1">{step.title}</h4>
        <p className="text-xs text-gray-600 leading-relaxed">{step.description}</p>
        {step.link && step.linkText && (
          <Link
            href={step.link}
            className="inline-flex items-center gap-0.5 text-xs text-brand hover:underline mt-2"
            onClick={handleDismiss}
          >
            {step.linkText}
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* Progress dots */}
      <div className="flex items-center gap-1.5 mb-3">
        {ONBOARDING_STEPS.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentStep(idx)}
            className={`h-1.5 rounded-full transition-all ${
              idx === currentStep
                ? "w-6 bg-brand"
                : idx < currentStep
                ? "w-1.5 bg-brand/40"
                : "w-1.5 bg-gray-200"
            }`}
            aria-label={`步骤 ${idx + 1}`}
          />
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={handleSkip}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          跳过引导
        </button>
        <button
          onClick={handleNext}
          className="px-3 py-1.5 bg-brand text-white rounded-lg text-xs font-medium hover:bg-brand-dark transition-colors"
        >
          {isLastStep ? "完成" : "下一步"}
        </button>
      </div>
    </div>
  );
}
