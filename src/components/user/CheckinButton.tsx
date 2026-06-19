'use client';

import { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, Sparkles } from 'lucide-react';

interface CheckinButtonProps {
  userId: string;
  lastCheckinDate?: string | null;
  checkinStreak?: number;
}

export default function CheckinButton({ userId, lastCheckinDate, checkinStreak = 0 }: CheckinButtonProps) {
  const [checkedIn, setCheckedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [streak, setStreak] = useState(checkinStreak);

  useEffect(() => {
    // 检查今日是否已签到
    const today = new Date().toISOString().split('T')[0];
    setCheckedIn(lastCheckinDate === today);
  }, [lastCheckinDate]);

  const handleCheckin = async () => {
    if (loading || checkedIn) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/checkin', { method: 'POST' });
      const data = await res.json();
      
      if (data.success) {
        setCheckedIn(true);
        setStreak(data.streak || 0);
      }
    } catch (error) {
      console.error('签到失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleCheckin}
        disabled={loading || checkedIn}
        className={`
          relative flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all
          ${checkedIn 
            ? 'bg-gradient-to-r from-teal-50 to-emerald-50 text-teal-700 border border-teal-200 cursor-default' 
            : 'bg-gradient-to-r from-amber-400 to-orange-400 text-white hover:from-amber-500 hover:to-orange-500 shadow-sm hover:shadow-md'}
          ${loading ? 'opacity-50 cursor-wait' : ''}
        `}
      >
        {checkedIn ? (
          <>
            <CheckCircle2 className="w-4 h-4" />
            <span>今日已签到</span>
          </>
        ) : (
          <>
            <Calendar className="w-4 h-4" />
            <span>立即签到</span>
            {!loading && <Sparkles className="w-3 h-3 animate-pulse" />}
          </>
        )}
      </button>
      
      {streak > 0 && (
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <span className="font-semibold text-amber-600">{streak}</span>
          <span>天连续</span>
        </div>
      )}
    </div>
  );
}
