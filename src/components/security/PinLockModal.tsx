import React, { useState } from 'react';
import { Lock, Fingerprint, HelpCircle, Check, AlertCircle } from 'lucide-react';
import { UserSettings } from '../../types';

interface PinLockModalProps {
  settings: UserSettings;
  onUnlock: () => void;
}

export const PinLockModal: React.FC<PinLockModalProps> = ({ settings, onUnlock }) => {
  const [pin, setPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [showSecurityQuestion, setShowSecurityQuestion] = useState(false);
  const [securityAnswer, setSecurityAnswer] = useState('');

  const targetPin = settings.pinCode || '1234';

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setErrorMsg('');

      if (nextPin.length === 4) {
        if (nextPin === targetPin) {
          onUnlock();
        } else {
          setErrorMsg('Incorrect PIN. Please try again.');
          setTimeout(() => setPin(''), 600);
        }
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorMsg('');
  };

  const handleBiometric = () => {
    // Simulate biometric authentication
    onUnlock();
  };

  const handleVerifyAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      settings.securityAnswer &&
      securityAnswer.trim().toLowerCase() === settings.securityAnswer.trim().toLowerCase()
    ) {
      onUnlock();
    } else {
      setErrorMsg('Incorrect answer to security question.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="w-full max-w-xs bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center">
        <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
          <Lock className="w-7 h-7" />
        </div>

        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Daily Life Manager</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6">
          App locked. Enter your 4-digit PIN
        </p>

        {!showSecurityQuestion ? (
          <>
            {/* PIN indicators */}
            <div className="flex justify-center items-center gap-4 mb-6">
              {[0, 1, 2, 3].map((idx) => {
                const filled = pin.length > idx;
                return (
                  <div
                    key={idx}
                    className={`w-4 h-4 rounded-full transition-all duration-200 ${
                      filled
                        ? 'bg-indigo-600 scale-110 shadow-xs'
                        : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  />
                );
              })}
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-500 font-medium mb-4 flex items-center justify-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errorMsg}
              </p>
            )}

            {/* Numeric Keypad */}
            <div className="grid grid-cols-3 gap-2.5 mb-5 max-w-[240px] mx-auto">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  onClick={() => handleDigit(digit)}
                  className="w-16 h-14 mx-auto rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xl font-semibold flex items-center justify-center active:scale-95 transition-all"
                >
                  {digit}
                </button>
              ))}
              <button
                onClick={handleBiometric}
                title="Use Biometric Fingerprint"
                className="w-16 h-14 mx-auto rounded-2xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center active:scale-95 transition-all"
              >
                <Fingerprint className="w-6 h-6" />
              </button>
              <button
                onClick={() => handleDigit('0')}
                className="w-16 h-14 mx-auto rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xl font-semibold flex items-center justify-center active:scale-95 transition-all"
              >
                0
              </button>
              <button
                onClick={handleBackspace}
                className="w-16 h-14 mx-auto rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 text-sm font-semibold flex items-center justify-center active:scale-95 transition-all"
              >
                Del
              </button>
            </div>

            <button
              onClick={() => setShowSecurityQuestion(true)}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center justify-center gap-1 mx-auto"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              Forgot PIN?
            </button>
          </>
        ) : (
          <form onSubmit={handleVerifyAnswer} className="space-y-4">
            <div className="text-left bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Security Question:
              </span>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {settings.securityQuestion || 'What is your favorite food?'}
              </p>
            </div>

            <input
              type="text"
              placeholder="Your answer"
              value={securityAnswer}
              onChange={(e) => setSecurityAnswer(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />

            {errorMsg && (
              <p className="text-xs text-rose-500 font-medium">{errorMsg}</p>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowSecurityQuestion(false);
                  setErrorMsg('');
                }}
                className="flex-1 py-2 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                Back to PIN
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-1"
              >
                <Check className="w-4 h-4" /> Verify
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
