"use client";

import { useState, useCallback } from "react";
import { User, Check } from "lucide-react";
import { PROFILE_TYPE_OPTIONS } from "@/lib/workbench/recommendations";

interface ProfileSelectorProps {
  currentProfileType: string | null;
  onUpdate: (profileType: string) => void;
}

export default function ProfileSelector({ currentProfileType, onUpdate }: ProfileSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSelect = useCallback(async (value: string) => {
    setSaving(true);
    try {
      const res = await fetch("/api/workbench/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileType: value }),
      });
      if (res.ok) {
        onUpdate(value);
      }
    } catch {
      // Ignore
    } finally {
      setSaving(false);
      setIsOpen(false);
    }
  }, [onUpdate]);

  const current = PROFILE_TYPE_OPTIONS.find(o => o.value === currentProfileType);

  return (
    <div className="bg-white rounded-xl border p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <User className="w-5 h-5 text-blue-500" />
          你的身份
        </h3>
        {!currentProfileType && (
          <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
            选择身份获得推荐
          </span>
        )}
      </div>

      {current ? (
        <div className="flex items-center gap-3">
          <span className="text-2xl">{current.emoji}</span>
          <div>
            <div className="font-medium text-gray-900">{current.label}</div>
            <div className="text-sm text-gray-500">{current.description}</div>
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="ml-auto text-sm text-blue-600 hover:text-blue-700"
          >
            更换
          </button>
        </div>
      ) : (
        <div>
          <p className="text-sm text-gray-600 mb-3">
            选择你的身份，系统会推荐更适合你的工具包
          </p>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            选择身份 →
          </button>
        </div>
      )}

      {isOpen && (
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
          {PROFILE_TYPE_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              disabled={saving}
              className={`flex items-center gap-2 p-3 rounded-lg border text-left transition-colors hover:bg-blue-50 ${
                currentProfileType === option.value
                  ? "border-blue-300 bg-blue-50"
                  : "border-gray-200"
              }`}
            >
              <span className="text-xl">{option.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900">{option.label}</div>
                <div className="text-xs text-gray-500 truncate">{option.description}</div>
              </div>
              {currentProfileType === option.value && (
                <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
