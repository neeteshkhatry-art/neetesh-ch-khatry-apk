import React, { useState, useEffect } from 'react';
import { X, Building2, Wallet, CreditCard, Landmark, IndianRupee } from 'lucide-react';
import { Account, AccountType } from '../../types';
import { rupeesToPaise, paiseToRupees } from '../../utils/currency';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (acc: Omit<Account, 'id' | 'currentBalancePaise'> & { id?: string; openingBalancePaise: number }) => void;
  initialData?: Account | null;
}

const ACCOUNT_COLORS = [
  '#10b981', // Emerald
  '#0284c7', // Sky
  '#4f46e5', // Indigo
  '#06b6d4', // Cyan
  '#f97316', // Orange
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#64748b', // Slate
];

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('bank');
  const [bankName, setBankName] = useState('');
  const [accountNumberLast4, setAccountNumberLast4] = useState('');
  const [openingBalanceRupees, setOpeningBalanceRupees] = useState('0');
  const [color, setColor] = useState(ACCOUNT_COLORS[0]);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setType(initialData.type);
      setBankName(initialData.bankName || '');
      setAccountNumberLast4(initialData.accountNumberLast4 || '');
      setOpeningBalanceRupees(paiseToRupees(initialData.openingBalancePaise).toString());
      setColor(initialData.color);
    } else {
      setName('');
      setType('bank');
      setBankName('SBI / HDFC / ICICI');
      setAccountNumberLast4('');
      setOpeningBalanceRupees('0');
      setColor(ACCOUNT_COLORS[1]);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter an account name');
      return;
    }

    const opRupees = parseFloat(openingBalanceRupees) || 0;
    const openingBalancePaise = rupeesToPaise(opRupees);

    onSave({
      id: initialData?.id,
      name: name.trim(),
      type,
      bankName: type === 'bank' || type === 'credit_card' ? bankName.trim() : undefined,
      accountNumberLast4: accountNumberLast4.trim() || undefined,
      openingBalancePaise,
      color,
      icon: type === 'cash' ? 'Wallet' : type === 'credit_card' ? 'CreditCard' : 'Building2',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {initialData ? 'Edit Account' : 'Add Account / Wallet'}
            </h2>
            <p className="text-xs text-slate-500">Track cash, bank accounts & digital wallets</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
          {/* Account Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Account Type
            </label>
            <div className="grid grid-cols-4 gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-medium">
              {[
                { id: 'bank', label: 'Bank', icon: Landmark },
                { id: 'cash', label: 'Cash', icon: Wallet },
                { id: 'wallet', label: 'UPI / Wallet', icon: Building2 },
                { id: 'credit_card', label: 'Credit Card', icon: CreditCard },
              ].map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setType(item.id as AccountType)}
                  className={`py-2 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                    type === item.id
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-[11px]">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Account Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Account Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. SBI Savings, Cash in Wallet, HDFC Salary"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {(type === 'bank' || type === 'credit_card') && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. State Bank of India"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Last 4 Digits
                </label>
                <input
                  type="text"
                  maxLength={4}
                  placeholder="e.g. 4821"
                  value={accountNumberLast4}
                  onChange={(e) => setAccountNumberLast4(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Opening Balance */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Opening Balance (₹ INR)
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-sm font-semibold text-slate-400">₹</span>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={openingBalanceRupees}
                onChange={(e) => setOpeningBalanceRupees(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              The starting balance before recording transactions in Daily Life Manager.
            </p>
          </div>

          {/* Color Tag */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Theme Accent
            </label>
            <div className="flex items-center gap-2">
              {ACCOUNT_COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    color === c ? 'scale-125 ring-2 ring-offset-2 ring-indigo-500' : 'opacity-80 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs"
            >
              {initialData ? 'Update Account' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
