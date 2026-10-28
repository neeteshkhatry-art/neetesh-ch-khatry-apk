import React, { useState } from 'react';
import {
  Settings,
  Lock,
  Moon,
  Sun,
  Shield,
  Download,
  Upload,
  Trash2,
  Bell,
  Smartphone,
  HelpCircle,
  FileSpreadsheet,
  Check,
  AlertTriangle,
  Info,
  IndianRupee,
} from 'lucide-react';
import { UserSettings, AppDatabaseState } from '../../types';
import { exportTransactionsToCSV } from '../../utils/export';
import { ConfirmationModal } from '../common/ConfirmationModal';

interface SettingsViewProps {
  data: AppDatabaseState;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onRestoreDatabase: (importedState: AppDatabaseState) => void;
  onResetDatabase: () => void;
  onOpenApkHub: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  data,
  onUpdateSettings,
  onRestoreDatabase,
  onResetDatabase,
  onOpenApkHub,
}) => {
  const { settings } = data;
  const [showPinConfig, setShowPinConfig] = useState(false);
  const [pinInput, setPinInput] = useState(settings.pinCode || '1234');
  const [securityQ, setSecurityQ] = useState(settings.securityQuestion || 'What is your favorite food?');
  const [securityA, setSecurityA] = useState(settings.securityAnswer || 'biryani');
  const [heightCm, setHeightCm] = useState(settings.userHeightCm?.toString() || '172');

  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [copiedStatus, setCopiedStatus] = useState(false);

  // Currency options
  const currencies = [
    { code: 'INR', symbol: '₹', label: 'Indian Rupee (₹ INR)' },
    { code: 'USD', symbol: '$', label: 'US Dollar ($ USD)' },
    { code: 'EUR', symbol: '€', label: 'Euro (€ EUR)' },
    { code: 'GBP', symbol: '£', label: 'British Pound (£ GBP)' },
    { code: 'AED', symbol: 'AED', label: 'UAE Dirham (AED)' },
  ];

  // Handle Backup JSON Download
  const handleDownloadBackup = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(data, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute(
      'download',
      `DailyLifeManager_Backup_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Handle Restore JSON Upload
  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.transactions && parsed.accounts && parsed.settings) {
            onRestoreDatabase(parsed);
            alert('Database restored successfully from backup!');
          } else {
            alert('Invalid backup file format.');
          }
        } catch (err) {
          alert('Could not parse JSON backup file.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleSavePinSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.length !== 4) {
      alert('PIN must be exactly 4 digits');
      return;
    }
    onUpdateSettings({
      pinCode: pinInput,
      securityQuestion: securityQ,
      securityAnswer: securityA,
      isPinLockEnabled: true,
    });
    setShowPinConfig(false);
    alert('Security PIN updated successfully!');
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Top Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Settings</h2>
        <p className="text-xs text-slate-500">Security, preferences, backups & Android APK build</p>
      </div>

      {/* APK & Source Code Promotion Banner */}
      <div className="p-4 rounded-3xl bg-linear-to-r from-emerald-600 to-teal-700 text-white shadow-lg flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-sm">
            <Smartphone className="w-5 h-5" />
            Android APK & Flutter Source
          </div>
          <p className="text-xs text-emerald-100 max-w-sm">
            Signed release APK instructions, debug APK build paths, and full Flutter Dart codebase with SQLite.
          </p>
        </div>
        <button
          onClick={onOpenApkHub}
          className="px-3.5 py-2 rounded-xl bg-white text-emerald-800 font-bold text-xs shadow-md hover:bg-emerald-50 active:scale-95 transition-all shrink-0"
        >
          View Hub
        </button>
      </div>

      {/* 1. Regional & Currency Settings */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white">Regional & Currency</h3>
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">
            Display Currency
          </label>
          <select
            value={settings.currencyCode}
            onChange={(e) => {
              const selected = currencies.find((c) => c.code === e.target.value);
              if (selected) {
                onUpdateSettings({
                  currencyCode: selected.code,
                  currencySymbol: selected.symbol,
                });
              }
            }}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
          >
            {currencies.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">
            User Height (for BMI calculation)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={heightCm}
              onChange={(e) => {
                setHeightCm(e.target.value);
                const cm = parseInt(e.target.value, 10);
                if (cm > 0) onUpdateSettings({ userHeightCm: cm });
              }}
              className="w-28 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
            <span className="text-xs text-slate-500">cm</span>
          </div>
        </div>
      </div>

      {/* 2. Theme & Visuals */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold text-slate-900 dark:text-white">Dark Mode Theme</h3>
          <p className="text-[11px] text-slate-500">Switch between light and dark Material 3 themes</p>
        </div>
        <button
          onClick={() =>
            onUpdateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })
          }
          className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
        >
          {settings.theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      {/* 3. Security & App PIN Lock */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-indigo-600" /> App Lock & PIN Protection
            </h3>
            <p className="text-[11px] text-slate-500">
              Prompt for 4-digit PIN on app launch to protect personal finance data
            </p>
          </div>
          <button
            onClick={() => {
              const toggled = !settings.isPinLockEnabled;
              onUpdateSettings({ isPinLockEnabled: toggled });
              if (toggled) setShowPinConfig(true);
            }}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
              settings.isPinLockEnabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                settings.isPinLockEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {settings.isPinLockEnabled && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setShowPinConfig(true)}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              Change 4-Digit PIN & Security Question
            </button>
          </div>
        )}
      </div>

      {/* 4. Notifications & Alerts */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
          <Bell className="w-4 h-4 text-amber-500" /> Notifications & Alerts
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-700 dark:text-slate-300">
            Overspending & Budget Alerts
          </span>
          <button
            onClick={() =>
              onUpdateSettings({ enableOverspendingAlerts: !settings.enableOverspendingAlerts })
            }
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
              settings.enableOverspendingAlerts ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                settings.enableOverspendingAlerts ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-700 dark:text-slate-300">
            Bill Due Date & Water Reminders
          </span>
          <button
            onClick={() =>
              onUpdateSettings({ enableNotifications: !settings.enableNotifications })
            }
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
              settings.enableNotifications ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                settings.enableNotifications ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* 5. Data Backup, Restore & Privacy */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white">Data Management & Privacy</h3>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Daily Life Manager uses local offline storage by default. No banking passwords, UPI PINs, or ATM credentials are ever requested or stored.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          <button
            onClick={handleDownloadBackup}
            className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            Backup JSON
          </button>

          <label className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 cursor-pointer transition-colors">
            <Upload className="w-4 h-4 text-indigo-600" />
            <span>Restore JSON</span>
            <input type="file" accept=".json" onChange={handleRestoreFile} className="hidden" />
          </label>

          <button
            onClick={() => exportTransactionsToCSV(data.transactions, data.accounts, settings.currencySymbol)}
            className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-teal-600" />
            Export CSV
          </button>
        </div>

        {/* Danger Zone: Reset Data */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div>
            <span className="text-xs font-semibold text-rose-600 block">Reset All App Data</span>
            <span className="text-[10px] text-slate-400">Permanently clears transactions, accounts & diet</span>
          </div>
          <button
            onClick={() => setIsResetConfirmOpen(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Change PIN Modal */}
      {showPinConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">
              Set Security PIN
            </h3>
            <form onSubmit={handleSavePinSettings} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">New 4-Digit PIN</label>
                <input
                  type="password"
                  maxLength={4}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-center text-xl font-mono tracking-widest"
                  required
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Security Question</label>
                <input
                  type="text"
                  value={securityQ}
                  onChange={(e) => setSecurityQ(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  required
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Security Answer</label>
                <input
                  type="text"
                  value={securityA}
                  onChange={(e) => setSecurityA(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPinConfig(false)}
                  className="px-3 py-2 rounded-xl text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold"
                >
                  Save PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Confirmation */}
      <ConfirmationModal
        isOpen={isResetConfirmOpen}
        title="Reset All App Data?"
        message="This will permanently delete all transactions, custom food records, accounts, and budgets. The app will return to initial setup state."
        confirmLabel="Yes, Reset Everything"
        isDestructive={true}
        onConfirm={() => {
          onResetDatabase();
          setIsResetConfirmOpen(false);
        }}
        onCancel={() => setIsResetConfirmOpen(false)}
      />
    </div>
  );
};
