import React, { useState } from 'react';
import {
  Wallet,
  Building2,
  Landmark,
  CreditCard,
  Plus,
  ArrowRightLeft,
  Edit2,
  Trash2,
  TrendingDown,
  TrendingUp,
  History,
  AlertTriangle,
} from 'lucide-react';
import { Account, Transaction, UserSettings } from '../../types';
import { formatCurrency, formatDate } from '../../utils/currency';
import { AccountModal } from './AccountModal';
import { ConfirmationModal } from '../common/ConfirmationModal';

interface AccountManagerProps {
  accounts: Account[];
  transactions: Transaction[];
  settings: UserSettings;
  onSaveAccount: (accountData: any) => void;
  onDeleteAccount: (id: string) => void;
  onOpenTransferModal: () => void;
}

export const AccountManager: React.FC<AccountManagerProps> = ({
  accounts,
  transactions,
  settings,
  onSaveAccount,
  onDeleteAccount,
  onOpenTransferModal,
}) => {
  const [selectedAccountId, setSelectedAccountId] = useState<string>(accounts[0]?.id || '');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId) || accounts[0];

  // Transactions specific to the selected account
  const accountTransactions = transactions
    .filter((tx) => tx.accountId === selectedAccount?.id || tx.toAccountId === selectedAccount?.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'cash':
        return <Wallet className="w-5 h-5" />;
      case 'credit_card':
        return <CreditCard className="w-5 h-5" />;
      default:
        return <Building2 className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Accounts & Wallets</h2>
          <p className="text-xs text-slate-500">Manage cash, bank balances & internal transfers</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenTransferModal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-xs"
          >
            <ArrowRightLeft className="w-4 h-4 text-indigo-600" />
            Transfer
          </button>
          <button
            onClick={() => {
              setEditingAccount(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Add Account
          </button>
        </div>
      </div>

      {/* Account Cards Carousel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {accounts.map((acc) => {
          const isSelected = selectedAccount?.id === acc.id;
          const isCreditCard = acc.type === 'credit_card';

          return (
            <div
              key={acc.id}
              onClick={() => setSelectedAccountId(acc.id)}
              className={`p-4 rounded-3xl transition-all cursor-pointer relative overflow-hidden border ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-800 shadow-lg ring-2 ring-indigo-500'
                  : 'bg-white dark:bg-slate-800/90 text-slate-900 dark:text-white border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-xs"
                    style={{ backgroundColor: acc.color }}
                  >
                    {getAccountIcon(acc.type)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold leading-tight">{acc.name}</h3>
                    <p className={`text-[11px] ${isSelected ? 'text-slate-400' : 'text-slate-500'}`}>
                      {acc.bankName || acc.type.toUpperCase()}
                      {acc.accountNumberLast4 ? ` ···${acc.accountNumberLast4}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingAccount(acc);
                      setIsModalOpen(true);
                    }}
                    className={`p-1.5 rounded-lg ${
                      isSelected ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  {accounts.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setAccountToDelete(acc);
                      }}
                      className={`p-1.5 rounded-lg ${
                        isSelected ? 'text-slate-400 hover:text-rose-400' : 'text-slate-400 hover:text-rose-600'
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <span className={`text-[10px] uppercase font-semibold ${isSelected ? 'text-slate-400' : 'text-slate-400'}`}>
                  {isCreditCard ? 'Outstanding Due' : 'Available Balance'}
                </span>
                <p className="text-xl font-extrabold tracking-tight mt-0.5">
                  {formatCurrency(acc.currentBalancePaise, settings.currencySymbol)}
                </p>
              </div>

              <div className={`mt-3 pt-2 text-[11px] flex justify-between border-t ${
                isSelected ? 'border-slate-800 text-slate-400' : 'border-slate-100 dark:border-slate-700 text-slate-500'
              }`}>
                <span>Opening: {formatCurrency(acc.openingBalancePaise, settings.currencySymbol, false)}</span>
                <span className="capitalize">{acc.type.replace('_', ' ')}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Account-wise Transaction History */}
      {selectedAccount && (
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                Ledger for {selectedAccount.name} ({accountTransactions.length} items)
              </h3>
            </div>
          </div>

          {accountTransactions.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs">
              No transactions recorded for this account yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {accountTransactions.map((tx) => {
                const isIncoming = tx.type === 'income' || (tx.type === 'transfer' && tx.toAccountId === selectedAccount.id);

                return (
                  <div key={tx.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        {tx.category} {tx.subcategory ? `· ${tx.subcategory}` : ''}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {formatDate(tx.date)} · {tx.description || tx.paymentMethod}
                      </p>
                    </div>

                    <div className="text-right">
                      <p
                        className={`font-bold ${
                          isIncoming
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {isIncoming ? '+' : '-'}
                        {formatCurrency(tx.amountPaise, settings.currencySymbol)}
                      </p>
                      <span className="text-[10px] text-slate-400 uppercase">
                        {tx.type}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Account Modal */}
      <AccountModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAccount(null);
        }}
        onSave={(acc) => {
          onSaveAccount(acc);
          setIsModalOpen(false);
        }}
        initialData={editingAccount}
      />

      {/* Delete Account Confirmation */}
      <ConfirmationModal
        isOpen={!!accountToDelete}
        title="Delete Account?"
        message={`Are you sure you want to delete ${accountToDelete?.name}? All associated transactions will remain in your global history.`}
        confirmLabel="Delete Account"
        isDestructive={true}
        onConfirm={() => {
          if (accountToDelete) {
            onDeleteAccount(accountToDelete.id);
            setAccountToDelete(null);
          }
        }}
        onCancel={() => setAccountToDelete(null)}
      />
    </div>
  );
};
