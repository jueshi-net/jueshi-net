"use client";

import { useState } from "react";
import { Check, Loader2, Sparkles } from "lucide-react";

interface CheckinButtonProps {
  hasCheckedInToday: boolean;
  initialStreak: number;
}

export function CheckinButton({ hasCheckedInToday, initialStreak }: CheckinButtonProps) {
  const [checkedIn, setCheckedIn] = useState(hasCheckedInToday);
  const [streak, setStreak] = useState(initialStreak);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckin() {
    if (checkedIn || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkin", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        setCheckedIn(true);
        setStreak(data.streak || streak + 1);
      } else if (res.status === 409) {
        // Already checked in today
        setCheckedIn(true);
      } else {
        setError(data.message || data.error || "签到失败");
      }
    } catch {
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  }

  if (checkedIn) {
    return (
      <div className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-sm font-medium">
        <Check className="w-4 h-4" />
        今日已签到 · 连续 {streak} 天
      </div>
    );
  }

  return (
    <div className="w-full">
      <button
        onClick={handleCheckin}
        disabled={loading}
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-[#6C5DD3] to-[#3F8CFF] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            签到中...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            今日签到 +5积分
          </>
        )}
      </button>
      {error && (
        <p className="text-xs text-red-500 mt-1.5 text-center">{error}</p>
      )}
    </div>
  );
}
