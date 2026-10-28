import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
  Calendar,
  CreditCard,
  Trash2,
  Edit2,
  FileSpreadsheet,
  Image as ImageIcon,
  Repeat,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import { Transaction, Account, TransactionType, PaymentMethod, UserSettings } from '../../types';
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  PAYMENT_METHOD_LABELS,
} from '../../utils/currency';
import { exportTransactionsToCSV } from '../../utils/export';
import { ConfirmationModal } from '../common/ConfirmationModal';

interface TransactionListProps {
  transactions: Transaction[];
  accounts: Account[];
  settings: UserSettings;
  onAddTransaction: (type?: TransactionType) => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  accounts,
  settings,
  onAddTransaction,
  onEditTransaction,
  onDeleteTransaction,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | TransactionType>('all');
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'this_month' | 'custom'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Active receipt preview modal
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Delete confirmation
  const [txToDelete, setTxToDelete] = useState<Transaction | null>(null);

  const accountMap = useMemo(() => new Map(accounts.map((a) => [a.id, a])), [accounts]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Type filter
      if (selectedType !== 'all' && tx.type !== selectedType) return false;

      // Account filter
      if (selectedAccount !== 'all' && tx.accountId !== selectedAccount && tx.toAccountId !== selectedAccount) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && tx.category !== selectedCategory) return false;

      // Payment method
      if (selectedPaymentMethod !== 'all' && tx.paymentMethod !== selectedPaymentMethod) return false;

      // Search query (matches description, category, subcategory)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesDesc = tx.description?.toLowerCase().includes(q);
        const matchesCat = tx.category.toLowerCase().includes(q);
        const matchesSubcat = tx.subcategory?.toLowerCase().includes(q);
        if (!matchesDesc && !matchesCat && !matchesSubcat) return false;
      }

      // Date filter
      if (dateFilter === 'today') {
        const today = new Date().toISOString().slice(0, 10);
        if (!tx.date.startsWith(today)) return false;
      } else if (dateFilter === 'this_month') {
        const thisMonth = new Date().toISOString().slice(0, 7);
        if (!tx.date.startsWith(thisMonth)) return false;
      } else if (dateFilter === 'custom') {
        const txDate = tx.date.split('T')[0];
        if (startDate && txDate < startDate) return false;
        if (endDate && txDate > endDate) return false;
      }

      return true;
    });
  }, [
    transactions,
    selectedType,
    selectedAccount,
    selectedCategory,
    selectedPaymentMethod,
    searchQuery,
    dateFilter,
    startDate,
    endDate,
  ]);

  // Totals for filtered list
  const totalIncome = filteredTransactions
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amountPaise, 0);

  const totalExpense = filteredTransactions
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amountPaise, 0);

  const netFlow = totalIncome - totalExpense;

  return (
    <div className="space-y-4 pb-24">
      {/* Top Header & Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Transactions</h2>
          <p className="text-xs text-slate-500">
            {filteredTransactions.length} of {transactions.length} records found
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportTransactionsToCSV(filteredTransactions, accounts, settings.currencySymbol)}
            title="Export CSV"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Export</span> CSV
          </button>
          <button
            onClick={() => onAddTransaction('expense')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Entry
          </button>
        </div>
      </div>

      {/* Summary strip for filtered results */}
      <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 shadow-xs text-center">
        <div>
          <span className="text-[10px] text-slate-400 block uppercase font-medium">Income</span>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
            +{formatCurrency(totalIncome, settings.currencySymbol, false)}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block uppercase font-medium">Expense</span>
          <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
            -{formatCurrency(totalExpense, settings.currencySymbol, false)}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block uppercase font-medium">Net Flow</span>
          <span
            className={`text-xs font-bold ${
              netFlow >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-500'
            }`}
          >
            {formatCurrency(netFlow, settings.currencySymbol, false)}
          </span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by notes, category, merchant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-colors ${
              showAdvancedFilters || selectedAccount !== 'all' || selectedCategory !== 'all'
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/60 dark:border-indigo-800 dark:text-indigo-300'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>
        </div>

        {/* Type Filter Buttons */}
        <div className="grid grid-cols-4 gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl text-xs font-medium">
          {[
            { id: 'all', label: 'All' },
            { id: 'expense', label: 'Expense' },
            { id: 'income', label: 'Income' },
            { id: 'transfer', label: 'Transfer' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedType(t.id as any)}
              className={`py-1.5 rounded-xl transition-all ${
                selectedType === t.id
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Advanced Filters Panel */}
        {showAdvancedFilters && (
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3 animate-in fade-in duration-150">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              {/* Account */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Account / Wallet
                </label>
                <select
                  value={selectedAccount}
                  onChange={(e) => setSelectedAccount(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                >
                  <option value="all">All Accounts</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                >
                  <option value="all">All Categories</option>
                  {EXPENSE_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.id}
                    </option>
                  ))}
                  {INCOME_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.id}
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Payment Method
                </label>
                <select
                  value={selectedPaymentMethod}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                >
                  <option value="all">All Payment Methods</option>
                  {Object.entries(PAYMENT_METHOD_LABELS).map(([k, label]) => (
                    <option key={k} value={k}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date Filters */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-500">Period:</span>
              {(['all', 'today', 'this_month', 'custom'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setDateFilter(period)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    dateFilter === period
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {period === 'all'
                    ? 'All Time'
                    : period === 'today'
                    ? 'Today'
                    : period === 'this_month'
                    ? 'This Month'
                    : 'Custom Range'}
                </button>
              ))}

              {dateFilter === 'custom' && (
                <div className="flex items-center gap-1.5 w-full mt-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                  />
                  <span className="text-xs text-slate-400">to</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                  />
                </div>
              )}
            </div>

            {/* Reset Filters */}
            <div className="flex justify-end pt-1">
              <button
                onClick={() => {
                  setSelectedAccount('all');
                  setSelectedCategory('all');
                  setSelectedPaymentMethod('all');
                  setDateFilter('all');
                  setSearchQuery('');
                }}
                className="text-xs text-rose-500 hover:underline font-medium"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Transactions List */}
      <div className="space-y-2">
        {filteredTransactions.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
            No transactions match the selected filters.
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const isIncome = tx.type === 'income';
            const isTransfer = tx.type === 'transfer';
            const account = accountMap.get(tx.accountId);
            const toAccount = tx.toAccountId ? accountMap.get(tx.toAccountId) : null;

            return (
              <div
                key={tx.id}
                className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex items-center justify-between gap-3"
              >
                {/* Left: Icon & Details */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                      isIncome
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                        : isTransfer
                        ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400'
                        : 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                    }`}
                  >
                    {isIncome ? (
                      <ArrowDownLeft className="w-5 h-5" />
                    ) : isTransfer ? (
                      <ArrowRightLeft className="w-5 h-5" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {tx.category}
                      </h4>
                      {tx.recurring && (
                        <span title={`Recurring: ${tx.recurring}`}>
                          <Repeat className="w-3 h-3 text-indigo-500" />
                        </span>
                      )}
                      {tx.receiptImage && (
                        <button
                          onClick={() => setPreviewImage(tx.receiptImage!)}
                          title="View Receipt"
                          className="text-emerald-600 dark:text-emerald-400 hover:scale-110 transition-transform"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      <span>{formatDate(tx.date)}</span>
                      <span>·</span>
                      {isTransfer ? (
                        <span>
                          {account?.name || 'From'} → {toAccount?.name || 'To'}
                        </span>
                      ) : (
                        <span>{account?.name || 'Account'}</span>
                      )}
                      {tx.subcategory && (
                        <>
                          <span>·</span>
                          <span className="text-slate-600 dark:text-slate-300 font-medium truncate">
                            {tx.subcategory}
                          </span>
                        </>
                      )}
                    </div>

                    {tx.description && (
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5 max-w-xs">
                        {tx.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Amount & Actions */}
                <div className="text-right shrink-0">
                  <p
                    className={`text-sm font-bold ${
                      isIncome
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : isTransfer
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {isIncome ? '+' : isTransfer ? '' : '-'}
                    {formatCurrency(tx.amountPaise, settings.currencySymbol)}
                  </p>

                  <div className="flex items-center justify-end gap-1 mt-1">
                    <button
                      onClick={() => onEditTransaction(tx)}
                      title="Edit transaction"
                      className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setTxToDelete(tx)}
                      title="Delete transaction"
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Receipt Image Preview Lightbox */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="relative max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-2xl">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              <X className="w-5 h-5" />
            </button>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Attached Receipt</h4>
            <img
              src={previewImage}
              alt="Receipt Preview"
              className="w-full max-h-[70vh] object-contain rounded-2xl border border-slate-200 dark:border-slate-800"
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!txToDelete}
        title="Delete Transaction?"
        message={`Are you sure you want to permanently delete this ${txToDelete?.type} of ${formatCurrency(
          txToDelete?.amountPaise || 0,
          settings.currencySymbol
        )}? This will automatically update your account balance.`}
        confirmLabel="Delete"
        isDestructive={true}
        onConfirm={() => {
          if (txToDelete) {
            onDeleteTransaction(txToDelete.id);
            setTxToDelete(null);
          }
        }}
        onCancel={() => setTxToDelete(null)}
      />
    </div>
  );
};
