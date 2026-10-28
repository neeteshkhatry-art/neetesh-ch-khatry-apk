import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Calendar,
  Utensils,
  PlusCircle,
  FileText,
  AlertCircle,
  ChevronRight,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  Clock,
  Sparkles,
  Droplet,
  IndianRupee,
} from 'lucide-react';
import { AppDatabaseState, Transaction, BillReminder, MealLog } from '../../types';
import {
  formatCurrency,
  formatCompactCurrency,
  formatDate,
  formatDateTime,
  getTodayDateString,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
} from '../../utils/currency';

interface DashboardProps {
  data: AppDatabaseState;
  onOpenAddTransaction: (type?: 'expense' | 'income' | 'transfer') => void;
  onOpenAddMeal: () => void;
  onSelectTab: (tab: 'home' | 'transactions' | 'reports' | 'diet' | 'settings' | 'budget' | 'calendar') => void;
  onPayBill: (bill: BillReminder) => void;
  onViewTransaction: (tx: Transaction) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  data,
  onOpenAddTransaction,
  onOpenAddMeal,
  onSelectTab,
  onPayBill,
  onViewTransaction,
}) => {
  const todayStr = getTodayDateString();
  const currentYearMonth = todayStr.slice(0, 7); // e.g. "2026-10"

  // 1. Available Total Balance across all non-credit card accounts (or net)
  const totalBalancePaise = data.accounts.reduce(
    (sum, acc) => (acc.type === 'credit_card' ? sum : sum + acc.currentBalancePaise),
    0
  );

  // 2. Today's Income & Expenses
  const todayTransactions = data.transactions.filter((tx) => tx.date.startsWith(todayStr));
  const todayIncomePaise = todayTransactions
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amountPaise, 0);
  const todayExpensePaise = todayTransactions
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amountPaise, 0);

  // 3. This Month's Income & Expenses
  const monthTransactions = data.transactions.filter((tx) => tx.date.startsWith(currentYearMonth));
  const monthIncomePaise = monthTransactions
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amountPaise, 0);
  const monthExpensePaise = monthTransactions
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amountPaise, 0);
  const monthSavingsPaise = monthIncomePaise - monthExpensePaise;

  // 4. Remaining Monthly Budget
  const monthlyLimitPaise = data.budgets.monthlyPaise;
  const remainingBudgetPaise = monthlyLimitPaise - monthExpensePaise;
  const budgetUsedPercent = monthlyLimitPaise > 0
    ? Math.min(100, Math.round((monthExpensePaise / monthlyLimitPaise) * 100))
    : 0;

  // 5. Today's Nutrition & Calories
  const todayMeals = data.meals.filter((m) => m.date === todayStr);
  const todayCalories = todayMeals.reduce((sum, m) => sum + m.calories, 0);
  const calorieTarget = data.settings.dailyCalorieTarget || 2000;
  const calorieRemaining = Math.max(0, calorieTarget - todayCalories);
  const caloriePercent = Math.min(100, Math.round((todayCalories / calorieTarget) * 100));

  // Today Water
  const todayWaterMl = data.waterLogs[todayStr] || 0;
  const waterTargetMl = data.settings.dailyWaterTargetMl || 2500;

  // 6. Recent Transactions
  const recentTransactions = [...data.transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // 7. Upcoming Bill Reminders
  const pendingBills = data.billReminders.filter((b) => !b.isPaid);

  return (
    <div className="space-y-4 pb-24">
      {/* Primary Balance Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-5 shadow-xl border border-slate-800">
        {/* Decorative background circles */}
        <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-indigo-500/15 blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
            <span className="font-medium tracking-wide flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-emerald-400" />
              Available Total Balance
            </span>
            <span className="text-[11px] text-slate-400">
              {data.accounts.length} Active Accounts
            </span>
          </div>

          <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white my-1">
            {formatCurrency(totalBalancePaise, data.settings.currencySymbol)}
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-800/80">
            <div>
              <span className="text-[11px] text-slate-400 block mb-0.5">Today's Income</span>
              <div className="text-sm font-bold text-emerald-400 flex items-center gap-1">
                <ArrowDownLeft className="w-3.5 h-3.5" />
                +{formatCurrency(todayIncomePaise, data.settings.currencySymbol, false)}
              </div>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block mb-0.5">Today's Expense</span>
              <div className="text-sm font-bold text-rose-400 flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                -{formatCurrency(todayExpensePaise, data.settings.currencySymbol, false)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Grid (Add Income, Add Expense, Add Meal, View Reports) */}
      <div>
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => onOpenAddTransaction('expense')}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-rose-400 transition-all active:scale-95 text-slate-800 dark:text-slate-100"
          >
            <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-1.5">
              <TrendingDown className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold leading-tight">Expense</span>
          </button>

          <button
            onClick={() => onOpenAddTransaction('income')}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-emerald-400 transition-all active:scale-95 text-slate-800 dark:text-slate-100"
          >
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-1.5">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold leading-tight">Income</span>
          </button>

          <button
            onClick={onOpenAddMeal}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-amber-400 transition-all active:scale-95 text-slate-800 dark:text-slate-100"
          >
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-1.5">
              <Utensils className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold leading-tight">Add Meal</span>
          </button>

          <button
            onClick={() => onSelectTab('reports')}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-indigo-400 transition-all active:scale-95 text-slate-800 dark:text-slate-100"
          >
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-1.5">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold leading-tight">Reports</span>
          </button>
        </div>
      </div>

      {/* Monthly Budget & Savings Glance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Monthly Budget Card */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">Monthly Budget</span>
            <button
              onClick={() => onSelectTab('budget')}
              className="text-indigo-600 dark:text-indigo-400 text-[11px] font-semibold hover:underline"
            >
              Manage
            </button>
          </div>

          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              {formatCurrency(remainingBudgetPaise, data.settings.currencySymbol, false)}
            </span>
            <span className="text-[11px] text-slate-500">
              of {formatCompactCurrency(monthlyLimitPaise, data.settings.currencySymbol)} left
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                budgetUsedPercent > 90
                  ? 'bg-rose-500'
                  : budgetUsedPercent > 75
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${budgetUsedPercent}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1.5">
            <span>Spent: {formatCurrency(monthExpensePaise, data.settings.currencySymbol, false)}</span>
            <span>{budgetUsedPercent}% used</span>
          </div>
        </div>

        {/* Monthly Net Savings Card */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">Month's Net Savings</span>
            <span
              className={`text-[11px] font-semibold ${
                monthSavingsPaise >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
              }`}
            >
              {monthSavingsPaise >= 0 ? 'Positive' : 'Deficit'}
            </span>
          </div>

          <div className="flex items-baseline justify-between mb-1.5">
            <span
              className={`text-lg font-bold ${
                monthSavingsPaise >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
              }`}
            >
              {formatCurrency(monthSavingsPaise, data.settings.currencySymbol, false)}
            </span>
            <span className="text-[11px] text-slate-500">
              Income: {formatCompactCurrency(monthIncomePaise, data.settings.currencySymbol)}
            </span>
          </div>

          <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
            <span>Savings Rate:</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">
              {monthIncomePaise > 0
                ? `${Math.max(0, Math.round((monthSavingsPaise / monthIncomePaise) * 100))}%`
                : '0%'}
            </span>
          </div>
        </div>
      </div>

      {/* Today's Diet & Nutrition Progress Card */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                Today's Nutrition & Water
              </h3>
              <p className="text-[10px] text-slate-400">
                {todayMeals.length} meals logged today
              </p>
            </div>
          </div>
          <button
            onClick={() => onSelectTab('diet')}
            className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center hover:underline"
          >
            Diet Hub <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-2">
          {/* Calories Progress */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-[11px] text-slate-500">Calories</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {todayCalories} / {calorieTarget} kcal
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  caloriePercent > 105 ? 'bg-rose-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${caloriePercent}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              {calorieRemaining > 0 ? `${calorieRemaining} kcal remaining` : 'Target reached'}
            </div>
          </div>

          {/* Water Tracker */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Droplet className="w-3 h-3 text-cyan-500" /> Water
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {todayWaterMl} / {waterTargetMl} ml
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className="h-full rounded-full bg-cyan-500"
                style={{ width: `${Math.min(100, Math.round((todayWaterMl / waterTargetMl) * 100))}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              {Math.round(todayWaterMl / 250)} of {Math.round(waterTargetMl / 250)} glasses
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Bill Reminders */}
      {pendingBills.length > 0 && (
        <div className="p-4 rounded-3xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 shadow-xs">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <h3 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                Upcoming Bill Reminders ({pendingBills.length})
              </h3>
            </div>
            <button
              onClick={() => onSelectTab('calendar')}
              className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 hover:underline"
            >
              View Calendar
            </button>
          </div>

          <div className="space-y-2">
            {pendingBills.slice(0, 2).map((bill) => (
              <div
                key={bill.id}
                className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-amber-100 dark:border-amber-900/50 flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{bill.title}</p>
                  <p className="text-[10px] text-slate-500">
                    Due: {formatDate(bill.dueDate)} · {formatCurrency(bill.amountPaise, data.settings.currencySymbol)}
                  </p>
                </div>
                <button
                  onClick={() => onPayBill(bill)}
                  className="px-2.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-[11px] shadow-xs"
                >
                  Mark Paid
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Transactions List */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white">
            Recent Transactions
          </h3>
          <button
            onClick={() => onSelectTab('transactions')}
            className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center"
          >
            See All <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs">
            No transactions yet. Tap "Expense" or "Income" to record your first entry.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {recentTransactions.map((tx) => {
              const isIncome = tx.type === 'income';
              const isTransfer = tx.type === 'transfer';
              const account = data.accounts.find((a) => a.id === tx.accountId);

              return (
                <div
                  key={tx.id}
                  onClick={() => onViewTransaction(tx)}
                  className="py-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl px-2 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-2xl flex items-center justify-center ${
                        isIncome
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                          : isTransfer
                          ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400'
                          : 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                      }`}
                    >
                      {isIncome ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : isTransfer ? (
                        <ArrowUpRight className="w-4 h-4 text-indigo-500" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                        {tx.category}
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                        <span>{formatDate(tx.date)}</span>
                        <span>·</span>
                        <span>{account?.name || 'Account'}</span>
                        {tx.description && (
                          <>
                            <span>·</span>
                            <span className="truncate max-w-[100px]">{tx.description}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p
                      className={`text-xs font-bold ${
                        isIncome
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : isTransfer
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {isIncome ? '+' : isTransfer ? '' : '-'}
                      {formatCurrency(tx.amountPaise, data.settings.currencySymbol)}
                    </p>
                    <span className="text-[10px] text-slate-400 uppercase">
                      {tx.paymentMethod.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
