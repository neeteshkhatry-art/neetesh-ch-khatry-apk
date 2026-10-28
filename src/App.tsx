/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  AppDatabaseState,
  Transaction,
  Account,
  MealLog,
  FoodItem,
  MealType,
  TransactionType,
  BillReminder,
  UserSettings,
} from './types';
import {
  loadDatabase,
  saveDatabase,
  recalculateAccountBalances,
  getInitialDatabaseState,
  INITIAL_FOOD_DATABASE,
} from './utils/storage';
import { getCurrentDateTimeString, getTodayDateString } from './utils/currency';
import { AndroidShell, MainTab } from './components/layout/AndroidShell';
import { Dashboard } from './components/dashboard/Dashboard';
import { TransactionList } from './components/transactions/TransactionList';
import { TransactionModal } from './components/transactions/TransactionModal';
import { AccountManager } from './components/accounts/AccountManager';
import { BudgetManager } from './components/budget/BudgetManager';
import { FinancialReports } from './components/reports/FinancialReports';
import { DietTracker } from './components/diet/DietTracker';
import { AddMealModal } from './components/diet/AddMealModal';
import { CalendarView } from './components/calendar/CalendarView';
import { SettingsView } from './components/settings/SettingsView';
import { ApkSourceHub } from './components/apk/ApkSourceHub';
import { PinLockModal } from './components/security/PinLockModal';

export default function App() {
  const [data, setData] = useState<AppDatabaseState>(() => loadDatabase());
  const [currentTab, setCurrentTab] = useState<MainTab>('home');

  // App PIN lock state
  const [isLocked, setIsLocked] = useState<boolean>(() => {
    const db = loadDatabase();
    return !!db.settings?.isPinLockEnabled;
  });

  // Transaction Modal State
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [defaultTxType, setDefaultTxType] = useState<TransactionType>('expense');

  // Meal Modal State
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const [defaultMealType, setDefaultMealType] = useState<MealType>('breakfast');

  // APK Hub
  const [isApkHubOpen, setIsApkHubOpen] = useState(false);

  // Sync database changes to localStorage
  useEffect(() => {
    saveDatabase(data);
  }, [data]);

  // Handle Dark mode class on html/body
  useEffect(() => {
    const isDark = data.settings.theme === 'dark';
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [data.settings.theme]);

  // Available foods combined
  const availableFoods: FoodItem[] = [
    ...INITIAL_FOOD_DATABASE,
    ...(data.customFoods || []),
  ];

  // ================= TRANSACTION HANDLERS =================
  const handleOpenAddTx = (type: TransactionType = 'expense') => {
    setEditingTx(null);
    setDefaultTxType(type);
    setIsTxModalOpen(true);
  };

  const handleEditTx = (tx: Transaction) => {
    setEditingTx(tx);
    setDefaultTxType(tx.type);
    setIsTxModalOpen(true);
  };

  const handleSaveTransaction = (
    txData: Omit<Transaction, 'id' | 'createdAt'> & { id?: string }
  ) => {
    setData((prev) => {
      let updatedTransactions: Transaction[];
      if (txData.id) {
        // Edit existing
        updatedTransactions = prev.transactions.map((t) =>
          t.id === txData.id ? { ...t, ...txData } : t
        );
      } else {
        // Create new
        const newTx: Transaction = {
          ...txData,
          id: `tx-${Date.now()}`,
          createdAt: Date.now(),
        };
        updatedTransactions = [newTx, ...prev.transactions];
      }

      // Recalculate account balances
      const updatedAccounts = recalculateAccountBalances(prev.accounts, updatedTransactions);

      return {
        ...prev,
        transactions: updatedTransactions,
        accounts: updatedAccounts,
      };
    });
  };

  const handleDeleteTransaction = (id: string) => {
    setData((prev) => {
      const updatedTransactions = prev.transactions.filter((t) => t.id !== id);
      const updatedAccounts = recalculateAccountBalances(prev.accounts, updatedTransactions);
      return {
        ...prev,
        transactions: updatedTransactions,
        accounts: updatedAccounts,
      };
    });
  };

  // ================= ACCOUNT HANDLERS =================
  const handleSaveAccount = (
    accData: Omit<Account, 'id' | 'currentBalancePaise'> & { id?: string }
  ) => {
    setData((prev) => {
      let updatedAccounts: Account[];
      if (accData.id) {
        updatedAccounts = prev.accounts.map((a) =>
          a.id === accData.id ? { ...a, ...accData } : a
        );
      } else {
        const newAcc: Account = {
          ...accData,
          id: `acc-${Date.now()}`,
          currentBalancePaise: accData.openingBalancePaise,
        };
        updatedAccounts = [...prev.accounts, newAcc];
      }

      const recalculated = recalculateAccountBalances(updatedAccounts, prev.transactions);
      return {
        ...prev,
        accounts: recalculated,
      };
    });
  };

  const handleDeleteAccount = (id: string) => {
    setData((prev) => ({
      ...prev,
      accounts: prev.accounts.filter((a) => a.id !== id),
    }));
  };

  // ================= BUDGET HANDLERS =================
  const handleUpdateBudgets = (newBudgets: any) => {
    setData((prev) => ({ ...prev, budgets: newBudgets }));
  };

  const handleSaveSavingsGoal = (goal: any) => {
    setData((prev) => {
      const exists = prev.savingsGoals.some((g) => g.id === goal.id);
      return {
        ...prev,
        savingsGoals: exists
          ? prev.savingsGoals.map((g) => (g.id === goal.id ? goal : g))
          : [...prev.savingsGoals, goal],
      };
    });
  };

  const handleDeleteSavingsGoal = (id: string) => {
    setData((prev) => ({
      ...prev,
      savingsGoals: prev.savingsGoals.filter((g) => g.id !== id),
    }));
  };

  const handleSaveLentBorrowed = (record: any) => {
    setData((prev) => {
      const exists = prev.lentBorrowed.some((r) => r.id === record.id);
      return {
        ...prev,
        lentBorrowed: exists
          ? prev.lentBorrowed.map((r) => (r.id === record.id ? record : r))
          : [...prev.lentBorrowed, record],
      };
    });
  };

  const handleDeleteLentBorrowed = (id: string) => {
    setData((prev) => ({
      ...prev,
      lentBorrowed: prev.lentBorrowed.filter((r) => r.id !== id),
    }));
  };

  // ================= DIET HANDLERS =================
  const handleOpenAddMeal = (mealType: MealType = 'breakfast') => {
    setDefaultMealType(mealType);
    setIsMealModalOpen(true);
  };

  const handleSaveMeal = (mealData: Omit<MealLog, 'id' | 'createdAt'>) => {
    const newMeal: MealLog = {
      ...mealData,
      id: `m-${Date.now()}`,
      createdAt: Date.now(),
    };
    setData((prev) => ({
      ...prev,
      meals: [newMeal, ...prev.meals],
    }));
  };

  const handleDeleteMeal = (id: string) => {
    setData((prev) => ({
      ...prev,
      meals: prev.meals.filter((m) => m.id !== id),
    }));
  };

  const handleSaveCustomFood = (food: FoodItem) => {
    setData((prev) => ({
      ...prev,
      customFoods: [...(prev.customFoods || []), food],
    }));
  };

  const handleUpdateWater = (date: string, amountMl: number) => {
    setData((prev) => ({
      ...prev,
      waterLogs: {
        ...prev.waterLogs,
        [date]: amountMl,
      },
    }));
  };

  const handleSaveWeight = (record: any) => {
    setData((prev) => ({
      ...prev,
      weightRecords: [record, ...prev.weightRecords],
    }));
  };

  const handleDeleteWeight = (id: string) => {
    setData((prev) => ({
      ...prev,
      weightRecords: prev.weightRecords.filter((w) => w.id !== id),
    }));
  };

  // ================= BILL REMINDER & PAY HANDLERS =================
  const handlePayBill = (bill: BillReminder) => {
    // 1. Mark bill as paid
    const today = getTodayDateString();
    const updatedBills = data.billReminders.map((b) =>
      b.id === bill.id ? { ...b, isPaid: true, lastPaidDate: today } : b
    );

    // 2. Automatically record corresponding expense transaction
    const defaultAccountId = bill.accountId || data.accounts[0]?.id || 'acc-cash';
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'expense',
      amountPaise: bill.amountPaise,
      date: getCurrentDateTimeString(),
      category: bill.category,
      subcategory: bill.title,
      paymentMethod: 'upi',
      accountId: defaultAccountId,
      description: `Bill paid: ${bill.title}`,
      createdAt: Date.now(),
    };

    const updatedTransactions = [newTx, ...data.transactions];
    const updatedAccounts = recalculateAccountBalances(data.accounts, updatedTransactions);

    setData((prev) => ({
      ...prev,
      billReminders: updatedBills,
      transactions: updatedTransactions,
      accounts: updatedAccounts,
    }));

    alert(`Marked "${bill.title}" as paid! An expense transaction has been created.`);
  };

  const handleAddBillReminder = (reminder: BillReminder) => {
    setData((prev) => ({
      ...prev,
      billReminders: [...prev.billReminders, reminder],
    }));
  };

  const handleDeleteBillReminder = (id: string) => {
    setData((prev) => ({
      ...prev,
      billReminders: prev.billReminders.filter((b) => b.id !== id),
    }));
  };

  // ================= SETTINGS HANDLERS =================
  const handleUpdateSettings = (newSettings: Partial<UserSettings>) => {
    setData((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings },
    }));
  };

  const handleRestoreDatabase = (importedState: AppDatabaseState) => {
    const recalculatedAccounts = recalculateAccountBalances(
      importedState.accounts || [],
      importedState.transactions || []
    );
    const validated = {
      ...importedState,
      accounts: recalculatedAccounts,
    };
    setData(validated);
    saveDatabase(validated);
  };

  const handleResetDatabase = () => {
    const initial = getInitialDatabaseState();
    setData(initial);
    saveDatabase(initial);
    alert('App data has been reset to initial demo state.');
  };

  return (
    <>
      {/* PIN Lock Screen if enabled */}
      {isLocked && (
        <PinLockModal settings={data.settings} onUnlock={() => setIsLocked(false)} />
      )}

      {/* Main Android Mobile Application Shell */}
      <AndroidShell
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenAddTransaction={handleOpenAddTx}
        onOpenAddMeal={() => handleOpenAddMeal('breakfast')}
        onOpenApkHub={() => setIsApkHubOpen(true)}
        isDark={data.settings.theme === 'dark'}
      >
        {currentTab === 'home' && (
          <Dashboard
            data={data}
            onOpenAddTransaction={handleOpenAddTx}
            onOpenAddMeal={() => handleOpenAddMeal('breakfast')}
            onSelectTab={setCurrentTab}
            onPayBill={handlePayBill}
            onViewTransaction={handleEditTx}
          />
        )}

        {currentTab === 'transactions' && (
          <TransactionList
            transactions={data.transactions}
            accounts={data.accounts}
            settings={data.settings}
            onAddTransaction={handleOpenAddTx}
            onEditTransaction={handleEditTx}
            onDeleteTransaction={handleDeleteTransaction}
          />
        )}

        {currentTab === 'reports' && <FinancialReports data={data} />}

        {currentTab === 'diet' && (
          <DietTracker
            meals={data.meals}
            waterLogs={data.waterLogs}
            weightRecords={data.weightRecords}
            customFoods={data.customFoods || []}
            settings={data.settings}
            onOpenAddMeal={handleOpenAddMeal}
            onDeleteMeal={handleDeleteMeal}
            onUpdateWater={handleUpdateWater}
            onSaveWeight={handleSaveWeight}
            onDeleteWeight={handleDeleteWeight}
            onUpdateSettings={handleUpdateSettings}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsView
            data={data}
            onUpdateSettings={handleUpdateSettings}
            onRestoreDatabase={handleRestoreDatabase}
            onResetDatabase={handleResetDatabase}
            onOpenApkHub={() => setIsApkHubOpen(true)}
          />
        )}

        {currentTab === 'accounts' && (
          <AccountManager
            accounts={data.accounts}
            transactions={data.transactions}
            settings={data.settings}
            onSaveAccount={handleSaveAccount}
            onDeleteAccount={handleDeleteAccount}
            onOpenTransferModal={() => handleOpenAddTx('transfer')}
          />
        )}

        {currentTab === 'budget' && (
          <BudgetManager
            budgets={data.budgets}
            savingsGoals={data.savingsGoals}
            lentBorrowed={data.lentBorrowed}
            transactions={data.transactions}
            settings={data.settings}
            onUpdateBudgets={handleUpdateBudgets}
            onSaveSavingsGoal={handleSaveSavingsGoal}
            onDeleteSavingsGoal={handleDeleteSavingsGoal}
            onSaveLentBorrowed={handleSaveLentBorrowed}
            onDeleteLentBorrowed={handleDeleteLentBorrowed}
          />
        )}

        {currentTab === 'calendar' && (
          <CalendarView
            data={data}
            onPayBill={handlePayBill}
            onAddBillReminder={handleAddBillReminder}
            onDeleteBillReminder={handleDeleteBillReminder}
          />
        )}
      </AndroidShell>

      {/* Transaction Modal (Add/Edit) */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        onSave={handleSaveTransaction}
        accounts={data.accounts}
        initialData={editingTx}
        defaultType={defaultTxType}
      />

      {/* Diet Meal Modal */}
      <AddMealModal
        isOpen={isMealModalOpen}
        onClose={() => setIsMealModalOpen(false)}
        onSaveMeal={handleSaveMeal}
        onSaveCustomFood={handleSaveCustomFood}
        availableFoods={availableFoods}
        defaultMealType={defaultMealType}
      />

      {/* APK & Flutter Source Code Hub Modal */}
      <ApkSourceHub isOpen={isApkHubOpen} onClose={() => setIsApkHubOpen(false)} />
    </>
  );
}
