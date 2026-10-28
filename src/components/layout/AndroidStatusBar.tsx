import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Signal } from 'lucide-react';

interface AndroidStatusBarProps {
  isDark?: boolean;
}

export const AndroidStatusBar: React.FC<AndroidStatusBarProps> = ({ isDark }) => {
  const [currentTime, setCurrentTime] = useState<string>('09:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`w-full px-5 py-1.5 flex items-center justify-between text-xs font-semibold select-none z-30 transition-colors ${
        isDark ? 'text-slate-200 bg-slate-900/90' : 'text-slate-700 bg-slate-100/90'
      }`}
    >
      <span className="tracking-tight">{currentTime}</span>

      {/* Simulated camera hole punch in the center */}
      <div className="w-3.5 h-3.5 rounded-full bg-slate-900 ring-2 ring-slate-800/20 shadow-inner" />

      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-bold text-emerald-500">5G</span>
        <Signal className="w-3.5 h-3.5" />
        <Wifi className="w-3.5 h-3.5" />
        <div className="flex items-center gap-0.5">
          <span className="text-[10px]">95%</span>
          <BatteryMedium className="w-4 h-4 text-emerald-500" />
        </div>
      </div>
    </div>
  );
};
