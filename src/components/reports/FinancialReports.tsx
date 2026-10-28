import React, { useState, useMemo } from 'react';
import {
  FileText,
  FileSpreadsheet,
  Share2,
  Calendar,
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Filter,
  Download,
  IndianRupee,
} from 'lucide-react';
import { AppDatabaseState, Transaction, Account } from '../../types';
import {
  formatCurrency,
  formatCompactCurrency,
  formatDate,
  PAYMENT_METHOD_LABELS,
} from '../../utils/currency';
import {
  exportFinancialReportPDF,
  exportTransactionsToCSV,
  shareOrDownloadData,
} from '../../utils/export';

interface FinancialReportsProps {
  data: AppDatabaseState;
}

type PeriodType =
  | 'today'
  | 'yesterday'
  | 'current_week'
  | 'prev_week'
  | 'current_month'
  | 'prev_month'
  | 'current_year'
  | 'prev_year'
  | 'custom';

export const FinancialReports: React.FC<FinancialReportsProps> = ({ data }) => {
  const [period, setPeriod] = useState<PeriodType>('current_month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // Date range resolution
  const { startDateStr, endDateStr, periodLabel } = useMemo(() => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const toYMD = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    if (period === 'today') {
      const today = toYMD(now);
      return { startDateStr: today, endDateStr: today, periodLabel: 'Today' };
    }
    if (period === 'yesterday') {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      const ymd = toYMD(y);
      return { startDateStr: ymd, endDateStr: ymd, periodLabel: 'Yesterday' };
    }
    if (period === 'current_week') {
      const start = new Date(now);
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Monday
      start.setDate(diff);
      return { startDateStr: toYMD(start), endDateStr: toYMD(now), periodLabel: 'Current Week' };
    }
    if (period === 'prev_week') {
      const start = new Date(now);
      const day = start.getDay();
      const diff = start.getDate() - day - 6;
      start.setDate(diff);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return { startDateStr: toYMD(start), endDateStr: toYMD(end), periodLabel: 'Previous Week' };
    }
    if (period === 'current_month') {
      const start = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`;
      return { startDateStr: start, endDateStr: toYMD(now), periodLabel: 'Current Month' };
    }
    if (period === 'prev_month') {
      const prevM = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
      return { startDateStr: toYMD(prevM), endDateStr: toYMD(lastDay), periodLabel: 'Previous Month' };
    }
    if (period === 'current_year') {
      const start = `${now.getFullYear()}-01-01`;
      return { startDateStr: start, endDateStr: toYMD(now), periodLabel: 'Current Year' };
    }
    if (period === 'prev_year') {
      const prevY = now.getFullYear() - 1;
      return { startDateStr: `${prevY}-01-01`, endDateStr: `${prevY}-12-31`, periodLabel: 'Previous Year' };
    }
    return {
      startDateStr: customStart || '2000-01-01',
      endDateStr: customEnd || '2099-12-31',
      periodLabel: 'Custom Date Range',
    };
  }, [period, customStart, customEnd]);

  // Filter transactions within range
  const filteredTransactions = useMemo(() => {
    return data.transactions.filter((tx) => {
      const d = tx.date.split('T')[0];
      return d >= startDateStr && d <= endDateStr;
    });
  }, [data.transactions, startDateStr, endDateStr]);

  // Income, Expense, Net Flow, Savings Rate
  const totalIncomePaise = useMemo(
    () =>
      filteredTransactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amountPaise, 0),
    [filteredTransactions]
  );

  const totalExpensePaise = useMemo(
    () =>
      filteredTransactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amountPaise, 0),
    [filteredTransactions]
  );

  const netSavingsPaise = totalIncomePaise - totalExpensePaise;
  const savingsRate =
    totalIncomePaise > 0
      ? Math.max(0, (netSavingsPaise / totalIncomePaise) * 100)
      : 0;

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    for (const tx of filteredTransactions) {
      if (tx.type === 'expense') {
        const cur = map.get(tx.category) || 0;
        map.set(tx.category, cur + tx.amountPaise);
      }
    }
    const list = Array.from(map.entries())
      .map(([category, amountPaise]) => ({
        category,
        amountPaise,
        percent: totalExpensePaise > 0 ? (amountPaise / totalExpensePaise) * 100 : 0,
      }))
      .sort((a, b) => b.amountPaise - a.amountPaise);
    return list;
  }, [filteredTransactions, totalExpensePaise]);

  // Payment method breakdown
  const paymentMethodBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    for (const tx of filteredTransactions) {
      if (tx.type === 'expense') {
        const cur = map.get(tx.paymentMethod) || 0;
        map.set(tx.paymentMethod, cur + tx.amountPaise);
      }
    }
    return Array.from(map.entries()).map(([method, amountPaise]) => ({
      method,
      label: PAYMENT_METHOD_LABELS[method] || method,
      amountPaise,
      percent: totalExpensePaise > 0 ? (amountPaise / totalExpensePaise) * 100 : 0,
    }));
  }, [filteredTransactions, totalExpensePaise]);

  // Account-wise breakdown
  const accountBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    for (const tx of filteredTransactions) {
      if (tx.type === 'expense') {
        const cur = map.get(tx.accountId) || 0;
        map.set(tx.accountId, cur + tx.amountPaise);
      }
    }
    const accMap = new Map(data.accounts.map((a) => [a.id, a]));
    return Array.from(map.entries()).map(([accId, amountPaise]) => ({
      accountId: accId,
      accountName: accMap.get(accId)?.name || 'Account',
      amountPaise,
    }));
  }, [filteredTransactions, data.accounts]);

  // Largest expenses
  const largestExpenses = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === 'expense')
      .sort((a, b) => b.amountPaise - a.amountPaise)
      .slice(0, 5);
  }, [filteredTransactions]);

  // Daily Spending Trend (Last 7 active days in range)
  const dailyTrend = useMemo(() => {
    const map = new Map<string, { income: number; expense: number }>();
    for (const tx of filteredTransactions) {
      const d = tx.date.split('T')[0];
      const cur = map.get(d) || { income: 0, expense: 0 };
      if (tx.type === 'income') cur.income += tx.amountPaise;
      if (tx.type === 'expense') cur.expense += tx.amountPaise;
      map.set(d, cur);
    }
    return Array.from(map.entries())
      .map(([date, vals]) => ({ date, ...vals }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7);
  }, [filteredTransactions]);

  const maxTrendExpense = Math.max(1, ...dailyTrend.map((t) => t.expense));

  // Handlers for export
  const handleExportPDF = () => {
    exportFinancialReportPDF({
      reportTitle: `Financial Performance Report (${periodLabel})`,
      dateRangeLabel: `${formatDate(startDateStr)} to ${formatDate(endDateStr)}`,
      totalIncomePaise,
      totalExpensePaise,
      netSavingsPaise,
      savingsRate,
      transactions: filteredTransactions,
      accounts: data.accounts,
      categoryBreakdown,
      currencySymbol: data.settings.currencySymbol,
    });
  };

  const handleShare = () => {
    const text = `📊 Daily Life Manager Report (${periodLabel}):\n` +
      `Total Income: ${formatCurrency(totalIncomePaise, data.settings.currencySymbol)}\n` +
      `Total Expense: ${formatCurrency(totalExpensePaise, data.settings.currencySymbol)}\n` +
      `Net Savings: ${formatCurrency(netSavingsPaise, data.settings.currencySymbol)} (${savingsRate.toFixed(1)}%)\n` +
      `Top Expense: ${categoryBreakdown[0]?.category || 'N/A'}\n` +
      `Generated safely via Daily Life Manager.`;
    shareOrDownloadData(text, `Daily Life Manager Report - ${periodLabel}`);
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Financial Reports</h2>
          <p className="text-xs text-slate-500">Analytics, trends, breakdowns & statement export</p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleShare}
            title="Share Report"
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 shadow-xs"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
          >
            <Download className="w-4 h-4" />
            PDF Statement
          </button>
        </div>
      </div>

      {/* Selectable Periods Filter */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold no-scrollbar">
          {[
            { id: 'today', label: 'Today' },
            { id: 'yesterday', label: 'Yesterday' },
            { id: 'current_week', label: 'This Week' },
            { id: 'prev_week', label: 'Last Week' },
            { id: 'current_month', label: 'This Month' },
            { id: 'prev_month', label: 'Last Month' },
            { id: 'current_year', label: 'This Year' },
            { id: 'prev_year', label: 'Last Year' },
            { id: 'custom', label: 'Custom' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setPeriod(item.id as PeriodType)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                period === item.id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs font-bold'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {period === 'custom' && (
          <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-500">From:</span>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
            />
            <span className="font-semibold text-slate-500">To:</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
            />
          </div>
        )}
      </div>

      {/* Primary KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Total Income */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
            <span>Total Income</span>
            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
            +{formatCurrency(totalIncomePaise, data.settings.currencySymbol, false)}
          </p>
        </div>

        {/* Total Expense */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
            <span>Total Expense</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <p className="text-base font-extrabold text-rose-600 dark:text-rose-400">
            -{formatCurrency(totalExpensePaise, data.settings.currencySymbol, false)}
          </p>
        </div>

        {/* Net Flow */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
            <span>Net Cash Flow</span>
            <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <p
            className={`text-base font-extrabold ${
              netSavingsPaise >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-500'
            }`}
          >
            {formatCurrency(netSavingsPaise, data.settings.currencySymbol, false)}
          </p>
        </div>

        {/* Savings Rate */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
            <span>Savings Rate</span>
            <span className="font-semibold text-slate-400">%</span>
          </div>
          <p className="text-base font-extrabold text-slate-900 dark:text-white">
            {savingsRate.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Daily Spending Trend Bars (SVG Visualizer) */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">Daily Spending Trend</h3>
          </div>
          <span className="text-[10px] text-slate-400">Recent active days</span>
        </div>

        {dailyTrend.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs">
            No expenses logged in this selected period.
          </div>
        ) : (
          <div className="h-32 flex items-end justify-between gap-2 pt-4 px-2">
            {dailyTrend.map((day) => {
              const heightPercent = Math.max(12, Math.round((day.expense / maxTrendExpense) * 100));

              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1 group">
                  <div className="text-[9px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {formatCompactCurrency(day.expense, data.settings.currencySymbol)}
                  </div>
                  <div
                    className="w-full rounded-t-lg bg-indigo-500/80 hover:bg-indigo-600 transition-all duration-300"
                    style={{ height: `${heightPercent}%` }}
                    title={`${day.date}: ${formatCurrency(day.expense, data.settings.currencySymbol)}`}
                  />
                  <span className="text-[10px] text-slate-500 font-medium">
                    {day.date.slice(8, 10)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Category-wise Expenses Breakdown */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">
              Category-wise Expense Breakdown
            </h3>
          </div>
        </div>

        {categoryBreakdown.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs">
            No expense categories recorded in this period.
          </div>
        ) : (
          <div className="space-y-3">
            {categoryBreakdown.map((cat, idx) => (
              <div key={cat.category} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {cat.category}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {formatCurrency(cat.amountPaise, data.settings.currencySymbol)}{' '}
                    <span className="text-slate-400 font-normal">({cat.percent.toFixed(1)}%)</span>
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${cat.percent}%`,
                      backgroundColor:
                        idx === 0
                          ? '#f43f5e'
                          : idx === 1
                          ? '#f97316'
                          : idx === 2
                          ? '#10b981'
                          : idx === 3
                          ? '#06b6d4'
                          : '#6366f1',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Method & Account Breakdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Payment Methods */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-2.5">
            Payment Methods
          </h3>
          <div className="space-y-2 text-xs">
            {paymentMethodBreakdown.map((m) => (
              <div key={m.method} className="flex justify-between items-center py-1 border-b border-slate-50 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">{m.label}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {formatCurrency(m.amountPaise, data.settings.currencySymbol)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Account Breakdown */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-2.5">
            Account Expenses
          </h3>
          <div className="space-y-2 text-xs">
            {accountBreakdown.map((a) => (
              <div key={a.accountId} className="flex justify-between items-center py-1 border-b border-slate-50 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">{a.accountName}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {formatCurrency(a.amountPaise, data.settings.currencySymbol)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Largest Expenses */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-3">
          Largest Expenses in Period
        </h3>
        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          {largestExpenses.map((tx) => (
            <div key={tx.id} className="py-2 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {tx.category} {tx.description ? `· ${tx.description}` : ''}
                </p>
                <p className="text-[10px] text-slate-400">{formatDate(tx.date)}</p>
              </div>
              <p className="font-extrabold text-rose-600 dark:text-rose-400">
                {formatCurrency(tx.amountPaise, data.settings.currencySymbol)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
