import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle2,
  AlertCircle,
  Bell,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Trash2,
} from 'lucide-react';
import { AppDatabaseState, BillReminder, Transaction, RecurringFrequency } from '../../types';
import { formatCurrency, formatDate, getTodayDateString, rupeesToPaise } from '../../utils/currency';
import { ConfirmationModal } from '../common/ConfirmationModal';

interface CalendarViewProps {
  data: AppDatabaseState;
  onPayBill: (bill: BillReminder) => void;
  onAddBillReminder: (reminder: BillReminder) => void;
  onDeleteBillReminder: (id: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  data,
  onPayBill,
  onAddBillReminder,
  onDeleteBillReminder,
}) => {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDayStr, setSelectedDayStr] = useState<string>(getTodayDateString());
  const [isAddBillOpen, setIsAddBillOpen] = useState(false);
  const [billToDelete, setBillToDelete] = useState<BillReminder | null>(null);

  // Add bill form state
  const [billTitle, setBillTitle] = useState('');
  const [billCategory, setBillCategory] = useState('Rent');
  const [billRupees, setBillRupees] = useState('1500');
  const [billDueDate, setBillDueDate] = useState(getTodayDateString());
  const [billRecurring, setBillRecurring] = useState<RecurringFrequency>('monthly');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  // Month navigation
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Build calendar matrix
  const { calendarDays, monthLabel } = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

    // Previous month padding
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const prevM = month === 0 ? 12 : month;
      const prevY = month === 0 ? year - 1 : year;
      const dateStr = `${prevY}-${String(prevM).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ dateStr, dayNum: d, isCurrentMonth: false });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ dateStr, dayNum: d, isCurrentMonth: true });
    }

    // Next month padding to fill row (up to 35 or 42)
    const remaining = 35 - days.length;
    if (remaining > 0) {
      for (let d = 1; d <= remaining; d++) {
        const nextM = month === 11 ? 1 : month + 2;
        const nextY = month === 11 ? year + 1 : year;
        const dateStr = `${nextY}-${String(nextM).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        days.push({ dateStr, dayNum: d, isCurrentMonth: false });
      }
    }

    const monthLabel = new Intl.DateTimeFormat('en-IN', {
      month: 'long',
      year: 'numeric',
    }).format(new Date(year, month, 1));

    return { calendarDays: days, monthLabel };
  }, [year, month]);

  // Map of transactions and bills per date
  const dateActivityMap = useMemo(() => {
    const map = new Map<string, { hasIncome: boolean; hasExpense: boolean; hasBill: boolean }>();

    for (const tx of data.transactions) {
      const d = tx.date.split('T')[0];
      const cur = map.get(d) || { hasIncome: false, hasExpense: false, hasBill: false };
      if (tx.type === 'income') cur.hasIncome = true;
      if (tx.type === 'expense') cur.hasExpense = true;
      map.set(d, cur);
    }

    for (const bill of data.billReminders) {
      const d = bill.dueDate;
      const cur = map.get(d) || { hasIncome: false, hasExpense: false, hasBill: false };
      if (!bill.isPaid) cur.hasBill = true;
      map.set(d, cur);
    }

    return map;
  }, [data.transactions, data.billReminders]);

  // Selected date items
  const dayTransactions = data.transactions.filter((tx) => tx.date.startsWith(selectedDayStr));
  const dayBills = data.billReminders.filter((b) => b.dueDate === selectedDayStr);
  const dayMeals = data.meals.filter((m) => m.date === selectedDayStr);

  const handleSaveBill = (e: React.FormEvent) => {
    e.preventDefault();
    const paise = rupeesToPaise(parseFloat(billRupees) || 0);

    onAddBillReminder({
      id: `bill-${Date.now()}`,
      title: billTitle.trim(),
      category: billCategory,
      amountPaise: paise,
      dueDate: billDueDate,
      recurring: billRecurring,
      isPaid: false,
    });

    setIsAddBillOpen(false);
    setBillTitle('');
    setBillRupees('1500');
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Calendar & Bills</h2>
          <p className="text-xs text-slate-500">Bill reminders & daily transaction calendar</p>
        </div>
        <button
          onClick={() => setIsAddBillOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Add Bill Reminder
        </button>
      </div>

      {/* Calendar Grid Card */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        {/* Month Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white capitalize">
            {monthLabel}
          </h3>
          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days of Week */}
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 mb-2">
          <span>SUN</span>
          <span>MON</span>
          <span>TUE</span>
          <span>WED</span>
          <span>THU</span>
          <span>FRI</span>
          <span>SAT</span>
        </div>

        {/* Calendar Matrix */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((d) => {
            const isSelected = selectedDayStr === d.dateStr;
            const isToday = d.dateStr === getTodayDateString();
            const act = dateActivityMap.get(d.dateStr);

            return (
              <button
                key={d.dateStr}
                onClick={() => setSelectedDayStr(d.dateStr)}
                className={`py-2 rounded-2xl flex flex-col items-center justify-center transition-all relative ${
                  isSelected
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : isToday
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold'
                    : d.isCurrentMonth
                    ? 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
                    : 'text-slate-300 dark:text-slate-600'
                }`}
              >
                <span className="text-xs leading-none">{d.dayNum}</span>

                {/* Activity Dots */}
                <div className="flex items-center gap-0.5 mt-1 h-1.5">
                  {act?.hasIncome && (
                    <div className="w-1 h-1 rounded-full bg-emerald-400" title="Income" />
                  )}
                  {act?.hasExpense && (
                    <div className="w-1 h-1 rounded-full bg-rose-400" title="Expense" />
                  )}
                  {act?.hasBill && (
                    <div className="w-1 h-1 rounded-full bg-amber-400" title="Upcoming Bill" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Agenda Detail */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white">
            Agenda for {formatDate(selectedDayStr)}
          </h3>
          <span className="text-[11px] text-slate-400">
            {dayTransactions.length} tx · {dayBills.length} bills · {dayMeals.length} meals
          </span>
        </div>

        {/* Due Bills on this day */}
        {dayBills.length > 0 && (
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-amber-600 tracking-wider">
              Bills Due Today
            </span>
            {dayBills.map((bill) => (
              <div
                key={bill.id}
                className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{bill.title}</p>
                  <p className="text-[10px] text-slate-500">
                    {bill.category} · {formatCurrency(bill.amountPaise, data.settings.currencySymbol)}
                  </p>
                </div>
                {!bill.isPaid ? (
                  <button
                    onClick={() => onPayBill(bill)}
                    className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px]"
                  >
                    Mark Paid
                  </button>
                ) : (
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Paid
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Transactions on this day */}
        {dayTransactions.length > 0 && (
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Transactions
            </span>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {dayTransactions.map((tx) => (
                <div key={tx.id} className="py-2 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{tx.category}</p>
                    <p className="text-[10px] text-slate-400">
                      {tx.description || tx.paymentMethod}
                    </p>
                  </div>
                  <p
                    className={`font-bold ${
                      tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'}
                    {formatCurrency(tx.amountPaise, data.settings.currencySymbol)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Meals logged on this day */}
        {dayMeals.length > 0 && (
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">
              Meals Logged
            </span>
            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
              {dayMeals.map((m) => (
                <div key={m.id} className="flex justify-between py-1">
                  <span>
                    {m.foodName} ({m.servingSize})
                  </span>
                  <span className="font-semibold text-emerald-600">{m.calories} kcal</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {dayBills.length === 0 && dayTransactions.length === 0 && dayMeals.length === 0 && (
          <p className="text-center py-6 text-slate-400 text-xs italic">
            No transactions, bills, or meals logged on this date.
          </p>
        )}
      </div>

      {/* Add Bill Modal */}
      {isAddBillOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">
              Add Bill Reminder
            </h3>
            <form onSubmit={handleSaveBill} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Bill Title</label>
                <input
                  type="text"
                  placeholder="e.g. Broadband Fiber, Flat Maintenance"
                  value={billTitle}
                  onChange={(e) => setBillTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Amount (₹ INR)</label>
                <input
                  type="number"
                  value={billRupees}
                  onChange={(e) => setBillRupees(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block mb-1">Due Date</label>
                  <input
                    type="date"
                    value={billDueDate}
                    onChange={(e) => setBillDueDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Frequency</label>
                  <select
                    value={billRecurring}
                    onChange={(e) => setBillRecurring(e.target.value as RecurringFrequency)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value="none">One-time</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddBillOpen(false)}
                  className="px-3 py-2 rounded-xl text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold"
                >
                  Save Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
