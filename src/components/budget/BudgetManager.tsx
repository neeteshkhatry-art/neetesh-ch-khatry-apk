import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Target,
  PiggyBank,
  AlertTriangle,
  Plus,
  CheckCircle2,
  Calendar,
  Users,
  Edit2,
  Trash2,
  Sparkles,
  TrendingUp,
  Percent,
  Check,
} from 'lucide-react';
import {
  BudgetConfig,
  SavingsGoal,
  LentBorrowedRecord,
  Transaction,
  UserSettings,
} from '../../types';
import {
  formatCurrency,
  formatCompactCurrency,
  formatDate,
  rupeesToPaise,
  paiseToRupees,
  EXPENSE_CATEGORIES,
} from '../../utils/currency';
import { ConfirmationModal } from '../common/ConfirmationModal';

interface BudgetManagerProps {
  budgets: BudgetConfig;
  savingsGoals: SavingsGoal[];
  lentBorrowed: LentBorrowedRecord[];
  transactions: Transaction[];
  settings: UserSettings;
  onUpdateBudgets: (newBudgets: BudgetConfig) => void;
  onSaveSavingsGoal: (goal: SavingsGoal) => void;
  onDeleteSavingsGoal: (id: string) => void;
  onSaveLentBorrowed: (record: LentBorrowedRecord) => void;
  onDeleteLentBorrowed: (id: string) => void;
}

export const BudgetManager: React.FC<BudgetManagerProps> = ({
  budgets,
  savingsGoals,
  lentBorrowed,
  transactions,
  settings,
  onUpdateBudgets,
  onSaveSavingsGoal,
  onDeleteSavingsGoal,
  onSaveLentBorrowed,
  onDeleteLentBorrowed,
}) => {
  const [activeSection, setActiveSection] = useState<'budget' | 'savings' | 'debts'>('budget');

  // Overall Budget Editing
  const [isEditingBudgets, setIsEditingBudgets] = useState(false);
  const [dailyRupees, setDailyRupees] = useState(paiseToRupees(budgets.dailyPaise).toString());
  const [weeklyRupees, setWeeklyRupees] = useState(paiseToRupees(budgets.weeklyPaise).toString());
  const [monthlyRupees, setMonthlyRupees] = useState(paiseToRupees(budgets.monthlyPaise).toString());
  const [alertThreshold, setAlertThreshold] = useState(budgets.alertThresholdPercent.toString());

  // Savings Goal Modal
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [goalTargetRupees, setGoalTargetRupees] = useState('');
  const [goalSavedRupees, setGoalSavedRupees] = useState('');
  const [goalDeadline, setGoalDeadline] = useState('');
  const [goalCategory, setGoalCategory] = useState('Emergency');
  const [goalToDelete, setGoalToDelete] = useState<SavingsGoal | null>(null);

  // Udhar / Lent-Borrowed Modal
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [debtType, setDebtType] = useState<'lent' | 'borrowed'>('lent');
  const [debtPerson, setDebtPerson] = useState('');
  const [debtPhone, setDebtPhone] = useState('');
  const [debtRupees, setDebtRupees] = useState('');
  const [debtPaidRupees, setDebtPaidRupees] = useState('0');
  const [debtDueDate, setDebtDueDate] = useState('');
  const [debtNotes, setDebtNotes] = useState('');
  const [debtToDelete, setDebtToDelete] = useState<LentBorrowedRecord | null>(null);

  // Category Budget Modal
  const [isCategoryBudgetModalOpen, setIsCategoryBudgetModalOpen] = useState(false);
  const [selectedCatForBudget, setSelectedCatForBudget] = useState('Food & Dining');
  const [catBudgetRupees, setCatBudgetRupees] = useState('5000');

  // Month-to-date expenses
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthTransactions = transactions.filter(
    (tx) => tx.type === 'expense' && tx.date.startsWith(currentMonth)
  );
  const totalMonthExpensePaise = monthTransactions.reduce((sum, tx) => sum + tx.amountPaise, 0);

  // Category-wise expenses this month
  const catExpenseMap = new Map<string, number>();
  for (const tx of monthTransactions) {
    const cur = catExpenseMap.get(tx.category) || 0;
    catExpenseMap.set(tx.category, cur + tx.amountPaise);
  }

  const handleSaveBudgetConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateBudgets({
      ...budgets,
      dailyPaise: rupeesToPaise(parseFloat(dailyRupees) || 0),
      weeklyPaise: rupeesToPaise(parseFloat(weeklyRupees) || 0),
      monthlyPaise: rupeesToPaise(parseFloat(monthlyRupees) || 0),
      alertThresholdPercent: parseInt(alertThreshold, 10) || 80,
    });
    setIsEditingBudgets(false);
  };

  const handleSaveCategoryBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const limitPaise = rupeesToPaise(parseFloat(catBudgetRupees) || 0);
    const existing = budgets.categoryBudgets.filter((c) => c.category !== selectedCatForBudget);
    onUpdateBudgets({
      ...budgets,
      categoryBudgets: [...existing, { category: selectedCatForBudget, monthlyLimitPaise: limitPaise }],
    });
    setIsCategoryBudgetModalOpen(false);
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const targetPaise = rupeesToPaise(parseFloat(goalTargetRupees) || 0);
    const savedPaise = rupeesToPaise(parseFloat(goalSavedRupees) || 0);

    const isCompleted = savedPaise >= targetPaise;
    if (isCompleted) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }

    onSaveSavingsGoal({
      id: `sg-${Date.now()}`,
      name: goalName.trim(),
      targetPaise,
      savedPaise,
      deadlineDate: goalDeadline,
      category: goalCategory,
      completed: isCompleted,
    });

    setIsGoalModalOpen(false);
    setGoalName('');
    setGoalTargetRupees('');
    setGoalSavedRupees('');
  };

  const handleSaveDebt = (e: React.FormEvent) => {
    e.preventDefault();
    const amountPaise = rupeesToPaise(parseFloat(debtRupees) || 0);
    const paidPaise = rupeesToPaise(parseFloat(debtPaidRupees) || 0);

    let status: 'pending' | 'partially_settled' | 'settled' = 'pending';
    if (paidPaise >= amountPaise) status = 'settled';
    else if (paidPaise > 0) status = 'partially_settled';

    onSaveLentBorrowed({
      id: `lb-${Date.now()}`,
      type: debtType,
      personName: debtPerson.trim(),
      phone: debtPhone.trim() || undefined,
      amountPaise,
      paidPaise,
      dueDate: debtDueDate,
      status,
      notes: debtNotes.trim() || undefined,
      createdAt: new Date().toISOString().slice(0, 10),
    });

    setIsDebtModalOpen(false);
    setDebtPerson('');
    setDebtRupees('');
    setDebtPaidRupees('0');
  };

  const monthlySpentPercent =
    budgets.monthlyPaise > 0
      ? Math.min(100, Math.round((totalMonthExpensePaise / budgets.monthlyPaise) * 100))
      : 0;

  return (
    <div className="space-y-4 pb-24">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Budget & Goals</h2>
          <p className="text-xs text-slate-500">Limits, savings targets, and money lent or borrowed</p>
        </div>
      </div>

      {/* Segmented Control */}
      <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-semibold">
        {[
          { id: 'budget', label: 'Spending Budgets', icon: Target },
          { id: 'savings', label: 'Savings Goals', icon: PiggyBank },
          { id: 'debts', label: 'Khata / Lent & Due', icon: Users },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id as any)}
            className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeSection === tab.id
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 1. SPENDING BUDGETS TAB */}
      {activeSection === 'budget' && (
        <div className="space-y-4">
          {/* Overall Monthly Budget Card */}
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">Monthly Overall Budget</h3>
              </div>
              <button
                onClick={() => setIsEditingBudgets(true)}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit Targets
              </button>
            </div>

            <div className="flex justify-between items-baseline mb-2">
              <div>
                <span className="text-[11px] text-slate-500 block">Spent This Month</span>
                <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {formatCurrency(totalMonthExpensePaise, settings.currencySymbol)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-500 block">Budget Limit</span>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  {formatCurrency(budgets.monthlyPaise, settings.currencySymbol)}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden mb-2">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  monthlySpentPercent >= 100
                    ? 'bg-rose-500'
                    : monthlySpentPercent >= budgets.alertThresholdPercent
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${monthlySpentPercent}%` }}
              />
            </div>

            <div className="flex justify-between text-xs text-slate-500">
              <span>{monthlySpentPercent}% utilized</span>
              <span className={budgets.monthlyPaise - totalMonthExpensePaise < 0 ? 'text-rose-500 font-bold' : ''}>
                Remaining: {formatCurrency(budgets.monthlyPaise - totalMonthExpensePaise, settings.currencySymbol)}
              </span>
            </div>

            {monthlySpentPercent >= budgets.alertThresholdPercent && (
              <div className="mt-3 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  Budget Warning: You have reached {monthlySpentPercent}% of your monthly limit!
                </span>
              </div>
            )}
          </div>

          {/* Category Budgets */}
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">Category Budgets</h3>
              <button
                onClick={() => setIsCategoryBudgetModalOpen(true)}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Set Category Limit
              </button>
            </div>

            <div className="space-y-3">
              {budgets.categoryBudgets.map((cb) => {
                const spent = catExpenseMap.get(cb.category) || 0;
                const percent = Math.min(100, Math.round((spent / cb.monthlyLimitPaise) * 100));

                return (
                  <div key={cb.category} className="space-y-1 text-xs">
                    <div className="flex justify-between items-baseline">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {cb.category}
                      </span>
                      <span className="text-slate-500">
                        {formatCurrency(spent, settings.currencySymbol, false)} /{' '}
                        {formatCurrency(cb.monthlyLimitPaise, settings.currencySymbol, false)} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          percent >= 100 ? 'bg-rose-500' : percent > 80 ? 'bg-amber-500' : 'bg-indigo-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. SAVINGS GOALS TAB */}
      {activeSection === 'savings' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">Active Savings Goals</h3>
            <button
              onClick={() => setIsGoalModalOpen(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> New Goal
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {savingsGoals.map((goal) => {
              const percent = Math.min(100, Math.round((goal.savedPaise / goal.targetPaise) * 100));
              const isDone = goal.savedPaise >= goal.targetPaise;

              return (
                <div
                  key={goal.id}
                  className="p-4 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 shadow-xs relative"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                        {goal.name}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Target: {formatDate(goal.deadlineDate)} · {goal.category}
                      </p>
                    </div>
                    <button
                      onClick={() => setGoalToDelete(goal)}
                      className="text-slate-400 hover:text-rose-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-base font-extrabold text-slate-900 dark:text-white">
                      {formatCurrency(goal.savedPaise, settings.currencySymbol)}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">
                      Goal: {formatCompactCurrency(goal.targetPaise, settings.currencySymbol)}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isDone ? 'bg-emerald-500' : 'bg-indigo-600'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span className="font-semibold">{percent}% saved</span>
                    {isDone ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> Target Achieved!
                      </span>
                    ) : (
                      <span>
                        {formatCurrency(goal.targetPaise - goal.savedPaise, settings.currencySymbol, false)} remaining
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. LENT & BORROWED (UDHAR KHATA) TAB */}
      {activeSection === 'debts' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">Money Lent & Borrowed</h3>
              <p className="text-[11px] text-slate-500">Keep track of money owed to or receivable from others</p>
            </div>
            <button
              onClick={() => setIsDebtModalOpen(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add Record
            </button>
          </div>

          <div className="space-y-2">
            {lentBorrowed.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
                No debts or loans tracked yet.
              </div>
            ) : (
              lentBorrowed.map((rec) => {
                const isLent = rec.type === 'lent'; // Receivable
                const remainingPaise = rec.amountPaise - rec.paidPaise;

                return (
                  <div
                    key={rec.id}
                    className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            isLent
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                          }`}
                        >
                          {isLent ? 'RECEIVABLE (Lent)' : 'PAYABLE (Borrowed)'}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          {rec.personName}
                        </h4>
                      </div>

                      <p className="text-[11px] text-slate-500 mt-1">
                        Due: {formatDate(rec.dueDate)} {rec.phone ? `· ${rec.phone}` : ''}
                      </p>
                      {rec.notes && <p className="text-[10px] text-slate-400">{rec.notes}</p>}
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {formatCurrency(rec.amountPaise, settings.currencySymbol)}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {rec.status === 'settled' ? (
                          <span className="text-emerald-600 font-semibold">Settled</span>
                        ) : (
                          `Pending: ${formatCurrency(remainingPaise, settings.currencySymbol)}`
                        )}
                      </p>
                      <button
                        onClick={() => setDebtToDelete(rec)}
                        className="text-slate-400 hover:text-rose-500 text-[11px] mt-1"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Edit Budgets Dialog */}
      {isEditingBudgets && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">
              Configure Spending Targets
            </h3>
            <form onSubmit={handleSaveBudgetConfig} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Monthly Budget Limit (₹)</label>
                <input
                  type="number"
                  value={monthlyRupees}
                  onChange={(e) => setMonthlyRupees(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Daily Spending Target (₹)</label>
                <input
                  type="number"
                  value={dailyRupees}
                  onChange={(e) => setDailyRupees(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Weekly Target (₹)</label>
                <input
                  type="number"
                  value={weeklyRupees}
                  onChange={(e) => setWeeklyRupees(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Alert Threshold (%)</label>
                <input
                  type="number"
                  min="50"
                  max="100"
                  value={alertThreshold}
                  onChange={(e) => setAlertThreshold(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingBudgets(false)}
                  className="px-3 py-2 rounded-xl text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold"
                >
                  Save Targets
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Set Category Budget Dialog */}
      {isCategoryBudgetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">
              Set Category Limit
            </h3>
            <form onSubmit={handleSaveCategoryBudget} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Select Expense Category</label>
                <select
                  value={selectedCatForBudget}
                  onChange={(e) => setSelectedCatForBudget(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  {EXPENSE_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.id}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-semibold block mb-1">Monthly Limit (₹ INR)</label>
                <input
                  type="number"
                  value={catBudgetRupees}
                  onChange={(e) => setCatBudgetRupees(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryBudgetModalOpen(false)}
                  className="px-3 py-2 rounded-xl text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold"
                >
                  Save Limit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Savings Goal Dialog */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">
              Add Savings Goal
            </h3>
            <form onSubmit={handleSaveGoal} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Goal Name</label>
                <input
                  type="text"
                  placeholder="e.g. New Laptop, Vacation in Goa"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Target Amount (₹ INR)</label>
                <input
                  type="number"
                  placeholder="50000"
                  value={goalTargetRupees}
                  onChange={(e) => setGoalTargetRupees(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Already Saved (₹ INR)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={goalSavedRupees}
                  onChange={(e) => setGoalSavedRupees(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Target Date</label>
                <input
                  type="date"
                  value={goalDeadline}
                  onChange={(e) => setGoalDeadline(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsGoalModalOpen(false)}
                  className="px-3 py-2 rounded-xl text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lent / Borrowed Modal */}
      {isDebtModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">
              Add Lent / Borrowed Entry
            </h3>
            <form onSubmit={handleSaveDebt} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDebtType('lent')}
                  className={`py-2 rounded-xl font-bold ${
                    debtType === 'lent' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800'
                  }`}
                >
                  I Lent (Receivable)
                </button>
                <button
                  type="button"
                  onClick={() => setDebtType('borrowed')}
                  className={`py-2 rounded-xl font-bold ${
                    debtType === 'borrowed' ? 'bg-rose-600 text-white' : 'bg-slate-100 dark:bg-slate-800'
                  }`}
                >
                  I Borrowed (Payable)
                </button>
              </div>

              <div>
                <label className="font-semibold block mb-1">Person Name</label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={debtPerson}
                  onChange={(e) => setDebtPerson(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Total Amount (₹)</label>
                <input
                  type="number"
                  value={debtRupees}
                  onChange={(e) => setDebtRupees(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Due Date</label>
                <input
                  type="date"
                  value={debtDueDate}
                  onChange={(e) => setDebtDueDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDebtModalOpen(false)}
                  className="px-3 py-2 rounded-xl text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!goalToDelete}
        title="Delete Savings Goal?"
        message={`Are you sure you want to delete ${goalToDelete?.name}?`}
        confirmLabel="Delete"
        isDestructive={true}
        onConfirm={() => {
          if (goalToDelete) {
            onDeleteSavingsGoal(goalToDelete.id);
            setGoalToDelete(null);
          }
        }}
        onCancel={() => setGoalToDelete(null)}
      />

      <ConfirmationModal
        isOpen={!!debtToDelete}
        title="Delete Record?"
        message={`Are you sure you want to delete this debt record for ${debtToDelete?.personName}?`}
        confirmLabel="Delete"
        isDestructive={true}
        onConfirm={() => {
          if (debtToDelete) {
            onDeleteLentBorrowed(debtToDelete.id);
            setDebtToDelete(null);
          }
        }}
        onCancel={() => setDebtToDelete(null)}
      />
    </div>
  );
};
