import React, { useState } from 'react';
import {
  Home,
  Receipt,
  PieChart,
  Utensils,
  Settings,
  Plus,
  Smartphone,
  Maximize2,
  Minimize2,
  Calendar,
  Wallet,
  Target,
  Sparkles,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
  X,
  Cloud,
} from 'lucide-react';
import { AndroidStatusBar } from './AndroidStatusBar';

export type MainTab =
  | 'home'
  | 'transactions'
  | 'reports'
  | 'diet'
  | 'settings'
  | 'accounts'
  | 'budget'
  | 'calendar'
  | 'drive';

interface AndroidShellProps {
  currentTab: MainTab;
  onSelectTab: (tab: MainTab) => void;
  onOpenAddTransaction: (type?: 'expense' | 'income' | 'transfer') => void;
  onOpenAddMeal: () => void;
  onOpenApkHub: () => void;
  isDark?: boolean;
  children: React.ReactNode;
}

export const AndroidShell: React.FC<AndroidShellProps> = ({
  currentTab,
  onSelectTab,
  onOpenAddTransaction,
  onOpenAddMeal,
  onOpenApkHub,
  isDark = false,
  children,
}) => {
  const [isPhoneFrame, setIsPhoneFrame] = useState(true);
  const [isFabOpen, setIsFabOpen] = useState(false);

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        isDark ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
      } flex flex-col items-center justify-start`}
    >
      {/* Top Device Viewport Controls (Desktop Helper Toolbar) */}
      <header className="w-full max-w-5xl px-4 py-2.5 flex items-center justify-between text-xs text-slate-500 border-b border-slate-200/60 dark:border-slate-800 select-none">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-slate-800 dark:text-slate-200">Daily Life Manager</span>
          <span className="text-slate-400">· Android Mobile Edition (v1.0.0)</span>
        </div>

        <div className="flex items-center gap-2">
          {/* APK & Flutter Source button */}
          <button
            onClick={onOpenApkHub}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>APK & Flutter Hub</span>
          </button>

          {/* Toggle Phone Frame vs Edge-to-Edge Desktop */}
          <button
            onClick={() => setIsPhoneFrame(!isPhoneFrame)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
            title="Toggle between Android phone frame and full width"
          >
            {isPhoneFrame ? (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Full Width</span>
              </>
            ) : (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Phone Frame</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Container: either Phone Mockup Chassis or Edge-to-Edge Responsive Container */}
      <main className="w-full flex justify-center py-2 sm:py-4 px-2 sm:px-4 flex-1">
        <div
          className={`w-full transition-all duration-300 relative flex flex-col ${
            isPhoneFrame
              ? 'max-w-[430px] rounded-[48px] ring-12 ring-slate-800/90 dark:ring-slate-900 shadow-2xl bg-slate-50 dark:bg-slate-900 overflow-hidden min-h-[850px]'
              : 'max-w-4xl rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden min-h-[850px]'
          }`}
        >
          {/* Android Status Bar */}
          <AndroidStatusBar isDark={isDark} />

          {/* App Top Bar */}
          <div className="px-5 py-3.5 bg-white dark:bg-slate-900/95 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between z-20">
            <div>
              <h1 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                Daily Life Manager
              </h1>
              <p className="text-[10px] text-slate-400 font-medium">Personal Finance & Diet</p>
            </div>

            {/* Quick Navigation Shortcuts */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => onSelectTab('accounts')}
                className={`p-2 rounded-xl transition-colors ${
                  currentTab === 'accounts'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title="Accounts & Wallets"
              >
                <Wallet className="w-4 h-4" />
              </button>

              <button
                onClick={() => onSelectTab('budget')}
                className={`p-2 rounded-xl transition-colors ${
                  currentTab === 'budget'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title="Budgets & Goals"
              >
                <Target className="w-4 h-4" />
              </button>

              <button
                onClick={() => onSelectTab('calendar')}
                className={`p-2 rounded-xl transition-colors ${
                  currentTab === 'calendar'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title="Calendar & Due Bills"
              >
                <Calendar className="w-4 h-4" />
              </button>

              <button
                onClick={() => onSelectTab('drive')}
                className={`p-2 rounded-xl transition-colors ${
                  currentTab === 'drive'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title="Google Drive Cloud Sync"
              >
                <Cloud className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-4 sm:p-5 overflow-y-auto no-scrollbar relative">
            {children}
          </div>

          {/* Floating Speed Dial Menu Modal */}
          {isFabOpen && (
            <div
              className="absolute inset-0 z-40 bg-slate-950/60 backdrop-blur-xs flex flex-col justify-end p-5 pb-24"
              onClick={() => setIsFabOpen(false)}
            >
              <div
                className="bg-white dark:bg-slate-800 rounded-3xl p-4 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-2 mb-3 animate-in fade-in slide-in-from-bottom-5 duration-150"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-700">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Quick Record
                  </span>
                  <button
                    onClick={() => setIsFabOpen(false)}
                    className="p-1 rounded-full text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                  <button
                    onClick={() => {
                      setIsFabOpen(false);
                      onOpenAddTransaction('expense');
                    }}
                    className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 flex items-center gap-2 hover:bg-rose-100 transition-colors"
                  >
                    <ArrowUpRight className="w-4 h-4 text-rose-600" />
                    <span>Add Expense</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsFabOpen(false);
                      onOpenAddTransaction('income');
                    }}
                    className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 flex items-center gap-2 hover:bg-emerald-100 transition-colors"
                  >
                    <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                    <span>Add Income</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsFabOpen(false);
                      onOpenAddTransaction('transfer');
                    }}
                    className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 flex items-center gap-2 hover:bg-indigo-100 transition-colors"
                  >
                    <ArrowRightLeft className="w-4 h-4 text-indigo-600" />
                    <span>Account Transfer</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsFabOpen(false);
                      onOpenAddMeal();
                    }}
                    className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 flex items-center gap-2 hover:bg-amber-100 transition-colors"
                  >
                    <Utensils className="w-4 h-4 text-amber-600" />
                    <span>Log Meal / Food</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Floating Action Button */}
          <button
            onClick={() => setIsFabOpen(!isFabOpen)}
            className="absolute bottom-20 right-6 z-40 w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl flex items-center justify-center active:scale-95 transition-all duration-200"
            title="Quick Action"
          >
            <Plus className={`w-7 h-7 transition-transform duration-200 ${isFabOpen ? 'rotate-45' : ''}`} />
          </button>

          {/* Material 3 Bottom Navigation Bar */}
          <nav className="w-full bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 px-3 py-2 flex items-center justify-around z-30 select-none">
            {[
              { id: 'home', label: 'Home', icon: Home },
              { id: 'transactions', label: 'Transactions', icon: Receipt },
              { id: 'reports', label: 'Reports', icon: PieChart },
              { id: 'diet', label: 'Diet', icon: Utensils },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map((nav) => {
              const isActive = currentTab === nav.id;

              return (
                <button
                  key={nav.id}
                  onClick={() => onSelectTab(nav.id as MainTab)}
                  className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all relative ${
                    isActive ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                  }`}
                >
                  {/* Material 3 Active Pill Indicator */}
                  <div
                    className={`px-4 py-1 rounded-full transition-all ${
                      isActive ? 'bg-indigo-100 dark:bg-indigo-950/80' : 'bg-transparent'
                    }`}
                  >
                    <nav.icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] mt-0.5 tracking-tight">{nav.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Android Gesture Bar */}
          <div className="w-full py-1.5 bg-white dark:bg-slate-900 flex justify-center items-center">
            <div className="w-28 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
          </div>
        </div>
      </main>
    </div>
  );
};
